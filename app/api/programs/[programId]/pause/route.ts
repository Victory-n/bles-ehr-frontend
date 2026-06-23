import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSION_LEVELS } from "@/lib/auth/permissions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check permissions: Admin (role = 1) or Staff with program WRITE permissions
    if (user.role !== 1 && !hasPermission(user, "pr", PERMISSION_LEVELS.WRITE)) {
      return NextResponse.json(
        { message: "You do not have permission to manage programs" },
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

    if (program.status !== "Active") {
      return NextResponse.json(
        { message: `Cannot pause program. Program status is currently ${program.status}.` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProgram = await tx.program.update({
        where: { id: program.id },
        data: { status: "Paused" }
      });

      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          modelName: "Program",
          recordId: program.id,
          performedById: user.id,
          changes: {
            message: `Program ${program.name} (${program.programId}) was paused.`,
            programId: program.programId,
            name: program.name,
            updatedFields: {
              status: { old: "Active", new: "Paused" }
            }
          }
        }
      });

      return updatedProgram;
    });

    return NextResponse.json(
      { program: result, message: "Program paused successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/programs/[programId]/pause error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
