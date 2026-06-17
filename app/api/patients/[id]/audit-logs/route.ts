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
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        modelName: "Patient",
        recordId: patient.id,
      },
      include: {
        performedBy: {
          select: { firstname: true, lastname: true, email: true },
        },
      },
      orderBy: { performedAt: "desc" },
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("GET /api/patients/[id]/audit-logs error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
