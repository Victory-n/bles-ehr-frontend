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

    const { programId } = await params;
    const body = await req.json();
    const { staffIds } = body; // array of staff IDs to assign

    // Get current program
    const existingProgram = await prisma.program.findUnique({
      where: { programId },
      include: { assignedStaff: true },
    });

    if (!existingProgram) {
      return NextResponse.json({ message: "Program not found" }, { status: 404 });
    }

    // Update program
    const result = await prisma.$transaction(async (tx) => {
      const updatedProgram = await tx.program.update({
        where: { id: existingProgram.id },
        data: {
          assignedStaff: {
            set: staffIds.map((id: string) => ({ id })),
          },
        },
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

      // Audit log
      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          modelName: "Program",
          recordId: updatedProgram.id,
          performedById: user.id,
          changes: {
            message: `Staff assigned to program ${updatedProgram.name} (${updatedProgram.programId}).`,
            programId: updatedProgram.programId,
            staffIds: staffIds,
          },
        },
      });

      return updatedProgram;
    });

    return NextResponse.json({ program: result, message: "Staff assigned successfully" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/programs/[programId]/assign-staff error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
