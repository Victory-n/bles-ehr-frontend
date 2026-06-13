import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

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
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient }, { status: 200 });
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

    const result = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.update({
        where: { id },
        data: {
          firstname: firstName,
          lastname: lastName,
          dateOfBirth: new Date(dateOfBirth),
          gender,
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
