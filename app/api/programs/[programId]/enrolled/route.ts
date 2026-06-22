import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

// GET /api/programs/[programId]/enrolled
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
    const program = await prisma.program.findUnique({
      where: { programId }
    });

    if (!program) {
      return NextResponse.json({ message: "Program not found" }, { status: 404 });
    }

    const patientPrograms = await prisma.patientProgram.findMany({
      where: { programId: program.id },
      include: {
        patient: true
      },
      orderBy: {
        enrolledAt: "desc"
      }
    });

    return NextResponse.json({ patientPrograms }, { status: 200 });
  } catch (error) {
    console.error("GET /api/programs/[programId]/enrolled error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
