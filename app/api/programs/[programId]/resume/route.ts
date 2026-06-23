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

    const { programId } = await params;
    const program = await prisma.program.findUnique({
      where: { programId }
    });

    if (!program) {
      return NextResponse.json({ message: "Program not found" }, { status: 404 });
    }

    if (program.status === "Active") {
      return NextResponse.json(
        { message: "This program is already active" },
        { status: 400 }
      );
    }

    // Check permissions based on current program status
    if (program.status === "Closed") {
      // Only the admin who ended the program can resume it
      const endedBy = (program.extraInfo as any)?.endedBy;
      if (user.role !== 1) {
        return NextResponse.json(
          { message: "Only administrators can resume an ended program" },
          { status: 403 }
        );
      }
      if (endedBy && endedBy !== user.id) {
        return NextResponse.json(
          { message: "Only the administrator who ended this program can resume it" },
          { status: 403 }
        );
      }
    } else if (program.status === "Paused") {
      // Admin or Staff with program management write access can resume
      if (user.role !== 1 && !hasPermission(user, "pr", PERMISSION_LEVELS.WRITE)) {
        return NextResponse.json(
          { message: "You do not have permission to manage programs" },
          { status: 403 }
        );
      }
    }

    // Prepare updated extraInfo by removing the endedBy field
    const extraInfoObj = (program.extraInfo as Record<string, any>) || {};
    const { endedBy, ...restExtraInfo } = extraInfoObj;

    const result = await prisma.$transaction(async (tx) => {
      const updatedProgram = await tx.program.update({
        where: { id: program.id },
        data: {
          status: "Active",
          extraInfo: restExtraInfo
        }
      });

      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          modelName: "Program",
          recordId: program.id,
          performedById: user.id,
          changes: {
            message: `Program ${program.name} (${program.programId}) was resumed.`,
            programId: program.programId,
            name: program.name,
            updatedFields: {
              status: { old: program.status, new: "Active" },
              extraInfo: { old: program.extraInfo, new: restExtraInfo }
            }
          }
        }
      });

      return updatedProgram;
    });

    return NextResponse.json(
      { program: result, message: "Program resumed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/programs/[programId]/resume error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
