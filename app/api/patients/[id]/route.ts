import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { folderService } from "@/lib/services/folderService";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Support lookup by both UUID (id) and patientId (BL-XXXXX)
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [{ id }, { patientId: id }],
      },
      include: {
        staff: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
        patientPrograms: {
          where: {
            deletedAt: null,
          },
          include: {
            program: true,
          },
          orderBy: {
            enrolledAt: "desc",
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    // Fetch folders for this patient (including documents and uploader info)
    let folders = await prisma.folder.findMany({
      where: { patientId: patient.id, deletedAt: null },
      include: {
        documents: {
          where: { deletedAt: null },
          include: {
            uploadedBy: {
              select: {
                firstname: true,
                lastname: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Auto-create folders if they do not exist (e.g. for pre-existing patients)
    if (folders.length === 0) {
      await folderService.createPatientFolders(patient.id, user.id);
      folders = await prisma.folder.findMany({
        where: { patientId: patient.id, deletedAt: null },
        include: {
          documents: {
            where: { deletedAt: null },
            include: {
              uploadedBy: {
                select: {
                  firstname: true,
                  lastname: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      });
    } else {
      // Self-healing: if folders exist but "Session Recordings" child folder is missing, create it
      const hasRecordings = folders.some((f) => f.name === "Session Recordings" && f.type === "CHILD");
      if (!hasRecordings) {
        const parentFolder = folders.find((f) => f.type === "PARENT");
        if (parentFolder) {
          const childRandomNum = Math.floor(10000 + Math.random() * 90000);
          await prisma.folder.create({
            data: {
              folderId: `FLD-${childRandomNum}`,
              name: "Session Recordings",
              type: "CHILD",
              patientId: patient.id,
              parentId: parentFolder.id,
              sortOrder: 5,
            },
          });
          // Refetch folders
          folders = await prisma.folder.findMany({
            where: { patientId: patient.id, deletedAt: null },
            include: {
              documents: {
                where: { deletedAt: null },
                include: {
                  uploadedBy: {
                    select: {
                      firstname: true,
                      lastname: true,
                    },
                  },
                },
                orderBy: { createdAt: "desc" },
              },
            },
            orderBy: { sortOrder: "asc" },
          });
        }
      }
    }

    return NextResponse.json({
      patient: {
        ...patient,
        folders,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/patients/[id] error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      diagnosis,
      provider,
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

    const existing = await prisma.patient.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const contactInformation = { phone, email, address, city, zip };
    const emergencyContact = { name: emergencyName, relationship: emergencyRelationship, phone: emergencyPhone };
    const intakeNotes = { diagnosis, notes };

    // Determine staffId: if provider is "none", set to null, else use the provider (staff id)
    const staffId = provider === "none" ? null : (provider || existing.staffId);

    const updatedFields: Record<string, { old: any; new: any }> = {};

    if (existing.firstname !== firstName) updatedFields.firstname = { old: existing.firstname, new: firstName };
    if (existing.lastname !== lastName) updatedFields.lastname = { old: existing.lastname, new: lastName };
    if (existing.dateOfBirth.toISOString().split("T")[0] !== new Date(dateOfBirth).toISOString().split("T")[0]) {
      updatedFields.dateOfBirth = { old: existing.dateOfBirth.toISOString().split("T")[0], new: dateOfBirth };
    }
    if (existing.gender !== gender) updatedFields.gender = { old: existing.gender, new: gender };
    if (existing.staffId !== staffId) updatedFields.staffId = { old: existing.staffId, new: staffId };

    const oldContact = (existing.contactInformation as Record<string, string>) || {};
    for (const key of ["phone", "email", "address", "city", "zip"]) {
      const newVal = (contactInformation as any)[key] || "";
      const oldVal = oldContact[key] || "";
      if (oldVal !== newVal) {
        updatedFields[`contactInformation.${key}`] = { old: oldVal, new: newVal };
      }
    }

    const oldEmergency = (existing.emergencyContact as Record<string, string>) || {};
    for (const key of ["name", "relationship", "phone"]) {
      const newVal = (emergencyContact as any)[key] || "";
      const oldVal = oldEmergency[key] || "";
      if (oldVal !== newVal) {
        updatedFields[`emergencyContact.${key}`] = { old: oldVal, new: newVal };
      }
    }

    const oldIntake = (existing.intakeNotes as Record<string, string>) || {};
    for (const key of ["diagnosis", "notes"]) {
      const newVal = (intakeNotes as any)[key] || "";
      const oldVal = oldIntake[key] || "";
      if (oldVal !== newVal) {
        updatedFields[`intakeNotes.${key}`] = { old: oldVal, new: newVal };
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.update({
        where: { id },
        data: {
          firstname: firstName,
          lastname: lastName,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          staffId,
          contactInformation,
          emergencyContact,
          intakeNotes,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          modelName: "Patient",
          recordId: patient.id,
          performedById: user.id,
          changes: {
            message: `Patient ${firstName} ${lastName} (${existing.patientId}) was updated.`,
            patientId: existing.patientId,
            name: `${firstName} ${lastName}`,
            updatedFields,
          },
        },
      });

      return patient;
    });

    return NextResponse.json({ patient: result, message: "Patient updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/patients/[id] error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
