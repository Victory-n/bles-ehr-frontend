import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { programId } = await params;
    console.log("🔍 API received programId:", programId);
    
    const program = await prisma.program.findUnique({
      where: { programId },
      include: {
        assignedStaff: {
          select: {
            id: true,
            staffId: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });
    console.log("🔍 Found program in DB:", program);

    if (!program) {
      console.log("❌ Program not found for programId:", programId);
      // Let's log all available programs just in case!
      const allPrograms = await prisma.program.findMany();
      console.log("🔍 All available programs in DB:", allPrograms);
      
      return NextResponse.json({ message: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ program }, { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/programs/[programId] error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}

export async function PUT(
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
    const {
      name,
      description,
      type,
      sessionType,
      frequency,
      totalSessions,
      duration,
      maxEnrollment,
      notes,
      status
    } = body;

    if (!name || !type || !sessionType || !frequency || !totalSessions || !duration || !maxEnrollment) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existingProgram = await prisma.program.findUnique({
      where: { programId }
    });
    if (!existingProgram) {
      return NextResponse.json({ message: "Program not found" }, { status: 404 });
    }

    const extraInfo = notes ? { ...existingProgram.extraInfo as object, notes } : existingProgram.extraInfo;

    const updatedFields: Record<string, { old: any; new: any }> = {};

    if (existingProgram.name !== name) updatedFields.name = { old: existingProgram.name, new: name };
    if (existingProgram.description !== description) updatedFields.description = { old: existingProgram.description, new: description };
    if (existingProgram.type !== type) updatedFields.type = { old: existingProgram.type, new: type };
    if (existingProgram.sessionType !== sessionType) updatedFields.sessionType = { old: existingProgram.sessionType, new: sessionType };
    if (existingProgram.frequency !== frequency) updatedFields.frequency = { old: existingProgram.frequency, new: frequency };
    if (existingProgram.totalSessions !== Number(totalSessions)) updatedFields.totalSessions = { old: existingProgram.totalSessions, new: Number(totalSessions) };
    if (existingProgram.duration !== duration) updatedFields.duration = { old: existingProgram.duration, new: duration };
    if (existingProgram.maxEnrollment !== Number(maxEnrollment)) updatedFields.maxEnrollment = { old: existingProgram.maxEnrollment, new: Number(maxEnrollment) };
    if (status && existingProgram.status !== status) updatedFields.status = { old: existingProgram.status, new: status };
    if (JSON.stringify(existingProgram.extraInfo) !== JSON.stringify(extraInfo)) updatedFields.extraInfo = { old: existingProgram.extraInfo, new: extraInfo };

    const result = await prisma.$transaction(async (tx) => {
      const updatedProgram = await tx.program.update({
        where: { id: existingProgram.id },
        data: {
          name,
          description,
          type,
          sessionType,
          frequency,
          totalSessions: Number(totalSessions),
          duration,
          maxEnrollment: Number(maxEnrollment),
          extraInfo,
          ...(status && { status })
        },
      });

      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          modelName: "Program",
          recordId: updatedProgram.id,
          performedById: user.id,
          changes: {
            message: `Program ${name} (${updatedProgram.programId}) was updated.`,
            programId: updatedProgram.programId,
            name: name,
            updatedFields
          },
        },
      });

      return updatedProgram;
    });

    return NextResponse.json({ program: result, message: "Program updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/programs/[programId] error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
