import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const patients = await prisma.patient.findMany({
      where: { deletedAt: null },
      include: {
        folders: {
          where: {
            deletedAt: null,
            name: "Clinic Notes"
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const clinicNotesData = patients.map(patient => ({
      patientId: patient.patientId,
      patientName: `${patient.lastname}, ${patient.firstname}`,
      folderId: patient.folders.length > 0 ? patient.folders[0].folderId : null,
      patientDbId: patient.id
    })).filter(item => item.folderId !== null);

    return NextResponse.json({ clinicNotes: clinicNotesData, total: clinicNotesData.length }, { status: 200 });
  } catch (error) {
    console.error("GET /api/clinic-notes error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
