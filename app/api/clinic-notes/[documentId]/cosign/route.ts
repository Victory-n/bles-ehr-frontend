import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Co-signer MUST be an Admin (role === 1)
    if (user.role !== 1) {
      return NextResponse.json(
        { message: "Permission Denied: Only administrators can co-sign and lock clinic notes." },
        { status: 403 }
      );
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

    if (latestVersion.status !== "SIGNED") {
      return NextResponse.json({
        message: `Cannot co-sign note. The note is in ${latestVersion.status.toLowerCase()} status, but must be signed by the primary clinician first.`
      }, { status: 400 });
    }

    // Clinician cannot co-sign their own notes
    if (latestVersion.signedById === user.id) {
      return NextResponse.json({
        message: "Security Warning: You cannot co-sign or lock your own clinic notes. A supervisor or admin must review and co-sign this note."
      }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update ClinicNoteVersion
      const version = await tx.clinicNoteVersion.update({
        where: { id: latestVersion.id },
        data: {
          status: "LOCKED",
          cosignedById: user.id,
          cosignedAt: new Date()
        }
      });

      // Update Audit Log
      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          modelName: "ClinicNote",
          recordId: document.clinicNote!.id,
          performedById: user.id,
          changes: {
            message: `Clinic note version v${latestVersion.version} for document ${document.documentId} was co-signed and LOCKED by admin ${user.firstname} ${user.lastname}.`,
            version: latestVersion.version,
            status: "LOCKED",
            cosignedBy: user.id
          }
        }
      });

      return version;
    });

    return NextResponse.json({ message: "Note co-signed and locked successfully", version: updated }, { status: 200 });

  } catch (error) {
    console.error("POST /api/clinic-notes/[documentId]/cosign error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
