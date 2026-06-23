import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { SignatureStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;

    const document = await prisma.document.findFirst({
      where: {
        OR: [
          { id: documentId },
          { documentId: documentId }
        ],
        deletedAt: null
      },
      include: {
        clinicNote: {
          include: {
            versions: {
              orderBy: { version: "desc" },
              take: 1
            }
          }
        }
      }
    });

    if (!document || !document.clinicNote || document.clinicNote.versions.length === 0) {
      return NextResponse.json({ message: "Clinic note not found" }, { status: 404 });
    }

    const latestVersion = document.clinicNote.versions[0];

    if (latestVersion.status !== "DRAFT") {
      return NextResponse.json({
        message: `Cannot sign note. The note is currently in ${latestVersion.status.toLowerCase()} status.`
      }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update ClinicNoteVersion
      const version = await tx.clinicNoteVersion.update({
        where: { id: latestVersion.id },
        data: {
          status: "SIGNED",
          signedById: user.id,
          signedAt: new Date()
        }
      });

      // Update Document status
      await tx.document.update({
        where: { id: document.id },
        data: {
          signatureStatus: SignatureStatus.SIGNED,
          signedById: user.id,
          signedAt: new Date()
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          modelName: "ClinicNote",
          recordId: document.clinicNote!.id,
          performedById: user.id,
          changes: {
            message: `Clinic note version v${latestVersion.version} for document ${document.documentId} was signed by clinician ${user.firstname} ${user.lastname}.`,
            version: latestVersion.version,
            status: "SIGNED",
            signedBy: user.id
          }
        }
      });

      return version;
    });

    return NextResponse.json({ message: "Note signed successfully", version: updated }, { status: 200 });

  } catch (error) {
    console.error("POST /api/clinic-notes/[documentId]/sign error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
