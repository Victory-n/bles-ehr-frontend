import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

    if (rawRows.length === 0) {
      return NextResponse.json({ message: "The uploaded file is empty" }, { status: 400 });
    }

    // Identify columns
    const firstRow = rawRows[0];
    const headers = Object.keys(firstRow);

    // Normalize header mapping helper
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

    let firstNameKey = headers.find(h => ["firstname", "first", "fname"].includes(normalize(h)));
    let lastNameKey = headers.find(h => ["lastname", "last", "lname"].includes(normalize(h)));
    let dobKey = headers.find(h => ["dateofbirth", "dob", "birthdate"].includes(normalize(h)));

    // Fallbacks if not exact matches
    if (!firstNameKey) firstNameKey = headers.find(h => normalize(h).includes("first"));
    if (!lastNameKey) lastNameKey = headers.find(h => normalize(h).includes("last"));
    if (!dobKey) dobKey = headers.find(h => normalize(h).includes("dob") || normalize(h).includes("birth") || normalize(h).includes("date"));

    if (!firstNameKey || !lastNameKey || !dobKey) {
      return NextResponse.json({
        message: "Missing required columns. Excel must contain 'First Name', 'Last Name', and 'Date of Birth'."
      }, { status: 400 });
    }

    // Fetch existing patient IDs for collision check
    const existingPatients = await prisma.patient.findMany({
      select: { patientId: true }
    });
    const existingIdsSet = new Set(existingPatients.map(p => p.patientId));
    const generatedIdsInBatch = new Set<string>();

    const generateUniquePatientId = (): string => {
      let attempts = 0;
      while (attempts < 1000) {
        const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
        const candidateId = `BL-${randomNum}`;
        if (!existingIdsSet.has(candidateId) && !generatedIdsInBatch.has(candidateId)) {
          generatedIdsInBatch.add(candidateId);
          return candidateId;
        }
        attempts++;
      }
      throw new Error("Failed to generate unique patient ID. Suffix space exhausted.");
    };

    interface ImportFailure {
      row: number;
      name: string;
      reason: string;
    }

    interface ImportSuccess {
      name: string;
      patientId: string;
    }

    const successes: ImportSuccess[] = [];
    const failures: ImportFailure[] = [];

    const parseExcelDate = (val: any): Date | null => {
      if (!val) return null;
      if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
      if (typeof val === "number") {
        const date = new Date((val - 25569) * 86400 * 1000);
        return isNaN(date.getTime()) ? null : date;
      }
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    };

    // Process rows
    for (let i = 0; i < rawRows.length; i++) {
      const rowNum = i + 2; // Row number in Excel (header is row 1, data starts at row 2)
      const row = rawRows[i];

      const firstName = String(row[firstNameKey] || "").trim();
      const lastName = String(row[lastNameKey] || "").trim();
      const rawDob = row[dobKey];

      const patientName = firstName || lastName ? `${firstName} ${lastName}`.trim() : `Row ${rowNum}`;

      if (!firstName) {
        failures.push({ row: rowNum, name: patientName, reason: "First Name is empty" });
        continue;
      }
      if (!lastName) {
        failures.push({ row: rowNum, name: patientName, reason: "Last Name is empty" });
        continue;
      }

      const dob = parseExcelDate(rawDob);
      if (!dob) {
        failures.push({ row: rowNum, name: patientName, reason: `Invalid Date of Birth format: '${rawDob}'` });
        continue;
      }

      // Check for exact duplicate in db (case insensitive name, exact DOB)
      const duplicate = await prisma.patient.findFirst({
        where: {
          firstname: { equals: firstName, mode: "insensitive" },
          lastname: { equals: lastName, mode: "insensitive" },
          dateOfBirth: dob
        }
      });

      if (duplicate) {
        failures.push({ row: rowNum, name: patientName, reason: `Patient already exists in database (ID: ${duplicate.patientId})` });
        continue;
      }

      try {
        const patientId = generateUniquePatientId();

        const result = await prisma.$transaction(async (tx) => {
          const patient = await tx.patient.create({
            data: {
              patientId,
              firstname: firstName,
              lastname: lastName,
              dateOfBirth: dob,
              gender: "Prefer not to say",
              status: "Active",
              staffId: user.id,
              contactInformation: {},
              emergencyContact: {},
              intakeNotes: {}
            }
          });

          await tx.auditLog.create({
            data: {
              action: "CREATE",
              modelName: "Patient",
              recordId: patient.id,
              performedById: user.id,
              changes: {
                message: `Patient ${firstName} ${lastName} (${patientId}) was imported.`,
                patientId: patientId,
                name: `${firstName} ${lastName}`
              }
            }
          });

          return patient;
        });

        successes.push({
          name: `${result.firstname} ${result.lastname}`,
          patientId: result.patientId
        });

      } catch (err: any) {
        console.error(`Error importing row ${rowNum}:`, err);
        failures.push({
          row: rowNum,
          name: patientName,
          reason: `Database error: ${err.message || "Unknown error"}`
        });
      }
    }

    return NextResponse.json({
      successCount: successes.length,
      failedCount: failures.length,
      failures,
      importedPatients: successes
    }, { status: 200 });

  } catch (error: any) {
    console.error("POST /api/patients/import error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
