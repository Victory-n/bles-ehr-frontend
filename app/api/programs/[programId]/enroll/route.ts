import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

// POST /api/programs/[programId]/enroll
export async function POST(
  req: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { programId } = await params;
    const body = await req.json();
    const { patientId } = body;

    if (!patientId) {
      return NextResponse.json({ message: "Missing patientId is required" }, { status: 400 });
    }

    // First, get the program (we need the actual id, not programId)
    const program = await prisma.program.findUnique({
      where: { programId }
    });

    if (!program) {
      return NextResponse.json({ message: "Program not found" }, { status: 404 });
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await prisma.patientProgram.findUnique({
      where: { patientId_programId: { patientId, programId: program.id } }
    });

    if (existing) {
      return NextResponse.json({ message: "Patient already enrolled in program" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const patientProgram = await tx.patientProgram.create({
        data: {
          patientId,
          programId: program.id,
          status: "Active"
        },
        include: {
          patient: true
        }
      });

      await tx.auditLog.create({
        data: {
          action: "CREATE",
          modelName: "PatientProgram",
          recordId: patientProgram.id,
          performedById: user.id,
          changes: {
            message: `Patient ${patient.firstname} ${patient.lastname} (${patient.patientId}) enrolled in program ${program.name} (${program.programId})`,
            patientId: patient.id,
            programId: program.id
          }
        }
      });

      return patientProgram;
    });

    return NextResponse.json({ patientProgram: result, message: "Patient enrolled successfully" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/programs/[programId]/enroll error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
