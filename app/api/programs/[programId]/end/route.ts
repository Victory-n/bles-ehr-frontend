import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only administrators can end a program
    if (user.role !== 1) {
      return NextResponse.json(
        { message: "Only administrators can end a program" },
        { status: 403 }
      );
    }

    const { programId } = await params;
    const program = await prisma.program.findUnique({
      where: { programId }
    });

    if (!program) {
      return NextResponse.json({ message: "Program not found" }, { status: 404 });
    }

    if (program.status === "Closed") {
      return NextResponse.json(
        { message: "This program has already been ended" },
        { status: 400 }
      );
    }

    const extraInfo = {
      ...(program.extraInfo as object),
      endedBy: user.id
    };

    const result = await prisma.$transaction(async (tx) => {
      const updatedProgram = await tx.program.update({
        where: { id: program.id },
        data: {
          status: "Closed",
          extraInfo
        }
      });

      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          modelName: "Program",
          recordId: program.id,
          performedById: user.id,
          changes: {
            message: `Program ${program.name} (${program.programId}) was ended by administrator.`,
            programId: program.programId,
            name: program.name,
            updatedFields: {
              status: { old: program.status, new: "Closed" },
              extraInfo: { old: program.extraInfo, new: extraInfo }
            }
          }
        }
      });

      return updatedProgram;
    });

    return NextResponse.json(
      { program: result, message: "Program ended successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/programs/[programId]/end error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
