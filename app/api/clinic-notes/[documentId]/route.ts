import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(
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
        patient: true,
        folder: true,
        clinicNote: {
          include: {
            versions: {
              include: {
                editedBy: {
                  select: { id: true, firstname: true, lastname: true, role: true, staffId: true }
                },
                signedBy: {
                  select: { id: true, firstname: true, lastname: true, role: true, staffId: true }
                },
                cosignedBy: {
                  select: { id: true, firstname: true, lastname: true, role: true, staffId: true }
                }
              },
              orderBy: {
                version: "desc"
              }
            }
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    if (!document.clinicNote) {
      return NextResponse.json({ message: "This document is not a clinic note text record" }, { status: 400 });
    }

    return NextResponse.json({
      document,
      clinicNote: document.clinicNote,
      patient: document.patient,
      folder: document.folder,
      versions: document.clinicNote.versions
    }, { status: 200 });

  } catch (error) {
    console.error("GET /api/clinic-notes/[documentId] error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}

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

    if (!document || !document.clinicNote) {
      return NextResponse.json({ message: "Clinic note not found" }, { status: 404 });
    }

    const { content, editSummary, title, noteType, program, tags } = await req.json();

    if (content === undefined || content === null) {
      return NextResponse.json({ message: "Missing required field: content" }, { status: 400 });
    }

    const latestVersion = document.clinicNote.versions[0];
    if (!latestVersion) {
      return NextResponse.json({ message: "Note version log is empty" }, { status: 400 });
    }

    const updatedTitle = title || latestVersion.title;
    const updatedNoteType = noteType || latestVersion.noteType;
    const updatedProgram = program !== undefined ? program : latestVersion.program;
    const updatedTags = tags ? JSON.stringify(tags) : (latestVersion.tags as string);

    const result = await prisma.$transaction(async (tx) => {
      // Update Document metadata name if title changed
      if (title && title !== document.name) {
        await tx.document.update({
          where: { id: document.id },
          data: { name: title }
        });
      }

      if (latestVersion.status === "DRAFT") {
        // Update the current draft version
        const updatedVersion = await tx.clinicNoteVersion.update({
          where: { id: latestVersion.id },
          data: {
            title: updatedTitle,
            noteType: updatedNoteType,
            program: updatedProgram,
            tags: updatedTags,
            content,
            editedById: user.id,
            editSummary: editSummary || "Updated draft"
          }
        });

        await tx.auditLog.create({
          data: {
            action: "UPDATE",
            modelName: "ClinicNote",
            recordId: document.clinicNote!.id,
            performedById: user.id,
            changes: {
              message: `Updated clinic note draft v${latestVersion.version} for document ${document.documentId}.`,
              version: latestVersion.version,
              title: updatedTitle,
              content
            }
          }
        });

        return updatedVersion;
      } else {
        // If note is SIGNED or LOCKED, editing creates a new version
        const newVersionNum = latestVersion.version + 1;
        const newVersion = await tx.clinicNoteVersion.create({
          data: {
            noteId: document.clinicNote!.id,
            version: newVersionNum,
            title: updatedTitle,
            noteType: updatedNoteType,
            program: updatedProgram,
            tags: updatedTags,
            content,
            status: "DRAFT",
            editedById: user.id,
            editSummary: editSummary || `Amended note from version v${latestVersion.version}`
          }
        });

        // Revert signature status on document since we now have a new DRAFT version active
        await tx.document.update({
          where: { id: document.id },
          data: {
            signatureStatus: "UNSIGNED",
            signedById: null,
            signedAt: null
          }
        });

        await tx.auditLog.create({
          data: {
            action: "UPDATE",
            modelName: "ClinicNote",
            recordId: document.clinicNote!.id,
            performedById: user.id,
            changes: {
              message: `Amended clinic note for document ${document.documentId}, creating version v${newVersionNum}.`,
              version: newVersionNum,
              content,
              previousVersion: latestVersion.version
            }
          }
        });

        return newVersion;
      }
    });

    return NextResponse.json({
      message: "Note saved successfully",
      version: result
    }, { status: 200 });

  } catch (error) {
    console.error("POST /api/clinic-notes/[documentId] error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
