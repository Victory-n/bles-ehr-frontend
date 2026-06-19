import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { folderService } from "@/lib/services/folderService";
import { storageService } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      diagnosis,
      phone,
      email,
      address,
      city,
      zip,
      emergencyName,
      emergencyRelationship,
      emergencyPhone,
      notes,
    } = body;

    if (!firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Generate patient ID
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
    const patientId = `BL-${randomNum}`;

    // Structure JSON fields
    const contactInformation = { phone, email, address, city, zip };
    const emergencyContact = { name: emergencyName, relationship: emergencyRelationship, phone: emergencyPhone };
    const intakeNotes = { diagnosis, notes };

    // Create the patient and audit log atomically
    const result = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.create({
        data: {
          patientId,
          firstname: firstName,
          lastname: lastName,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          status: "Active",
          staffId: user.id, // Assigning to the current logged-in clinician for referential integrity
          contactInformation,
          emergencyContact,
          intakeNotes,
        },
      });

      // Audit Log: Only recording the patient name and ID to minimize PHI duplication as requested
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          modelName: "Patient",
          recordId: patient.id,
          performedById: user.id,
          changes: {
            message: `Patient ${firstName} ${lastName} (${patientId}) was created.`,
            patientId: patientId,
            name: `${firstName} ${lastName}`
          },
        },
      });

      return patient;
    });

    // Create folders in database (and Supabase if configured)
    await Promise.all([
      storageService.createPatientFolders(result.patientId).catch(err => {
        console.warn("Failed to create storage folders:", err);
      }),
      folderService.createPatientFolders(result.id, user.id),
    ]);

    return NextResponse.json({ patient: result, message: "Patient created successfully" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/patients error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ patients }, { status: 200 });
  } catch (error) {
    console.error("GET /api/patients error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
