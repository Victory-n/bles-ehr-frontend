import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { DocumentType, FileType, SignatureStatus } from "@prisma/client";

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


export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { folderId, title, noteType, program, tags, content, status, sessionId } = body;

    if (!folderId || !title || !noteType || content === undefined || content === null) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Find the folder
    const folder = await prisma.folder.findUnique({
      where: { folderId },
      include: { patient: true }
    });

    if (!folder) {
      return NextResponse.json({ message: "Folder not found" }, { status: 404 });
    }

    // Generate unique document ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const docId = `DOC-${randomNum}`;

    // Status can be DRAFT or SIGNED
    const noteStatus = status === "SIGNED" ? "SIGNED" : "DRAFT";

    const result = await prisma.$transaction(async (tx) => {
      let resolvedSessionId: string | null = null;

      if (sessionId) {
        // If sessionId is provided, check if it exists in the database
        const existingSession = await tx.session.findFirst({
          where: {
            OR: [
              { id: sessionId },
              { sessionId: sessionId }
            ],
            deletedAt: null
          }
        });
        if (!existingSession) {
          throw new Error("Session not found");
        }
        resolvedSessionId = existingSession.id;
      } else {
        // If no sessionId is provided, create a new Session record
        const programName = program && program !== "None" ? program : "General Clinic Sessions";
        
        let dbProgram = await tx.program.findFirst({
          where: { name: programName, deletedAt: null }
        });

        if (!dbProgram) {
          const randomProgNum = Math.floor(10000 + Math.random() * 90000);
          const programIdStr = `PRG-${randomProgNum}`;
          dbProgram = await tx.program.create({
            data: {
              programId: programIdStr,
              name: programName,
              type: "PHP",
              sessionType: "Single",
              frequency: "every week",
              totalSessions: 10,
              duration: "30 days",
              maxEnrollment: 100,
              status: "Active"
            }
          });
        }

        let patientProgram = await tx.patientProgram.findFirst({
          where: {
            patientId: folder.patientId,
            programId: dbProgram.id,
            deletedAt: null
          }
        });

        if (!patientProgram) {
          patientProgram = await tx.patientProgram.create({
            data: {
              patientId: folder.patientId,
              programId: dbProgram.id,
              status: "Active"
            }
          });
        }

        const randomSessionNum = Math.floor(10000 + Math.random() * 90000);
        const randSessionIdStr = `SES-${randomSessionNum}`;
        const newSession = await tx.session.create({
          data: {
            sessionId: randSessionIdStr,
            name: title,
            programId: dbProgram.id,
            patientProgramId: patientProgram.id,
            status: "Scheduled",
            startDate: new Date(),
            location: "Telehealth",
            createdById: user.id
          }
        });
        resolvedSessionId = newSession.id;
      }

      // Create Document entry
      const document = await tx.document.create({
        data: {
          documentId: docId,
          name: title,
          fileType: FileType.TXT,
          documentType: DocumentType.CLINIC_NOTES,
          patientId: folder.patientId,
          folderId: folder.id,
          fileSize: Buffer.byteLength(content, "utf-8"),
          mimeType: "text/plain",
          storagePath: `clinic-notes/${docId}.txt`,
          uploadedById: user.id,
          signatureStatus: noteStatus === "SIGNED" ? SignatureStatus.SIGNED : SignatureStatus.UNSIGNED,
          signedById: noteStatus === "SIGNED" ? user.id : null,
          signedAt: noteStatus === "SIGNED" ? new Date() : null,
          sessionId: resolvedSessionId,
        }
      });

      // Create ClinicNote entry
      const clinicNote = await tx.clinicNote.create({
        data: {
          documentId: document.id,
        }
      });

      // Create v1 ClinicNoteVersion entry
      const version = await tx.clinicNoteVersion.create({
        data: {
          noteId: clinicNote.id,
          version: 1,
          title,
          noteType,
          program: program || "None",
          tags: tags ? JSON.stringify(tags) : "[]",
          content,
          status: noteStatus,
          editedById: user.id,
          editSummary: "Initial note creation",
          signedById: noteStatus === "SIGNED" ? user.id : null,
          signedAt: noteStatus === "SIGNED" ? new Date() : null,
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          modelName: "ClinicNote",
          recordId: clinicNote.id,
          performedById: user.id,
          changes: {
            message: `Created clinic note "${title}" (v1, ${noteStatus}) in folder ${folderId}.`,
            version: 1,
            title,
            noteType,
            program,
            tags,
            content,
            status: noteStatus
          }
        }
      });

      return { document, clinicNote, version };
    });

    return NextResponse.json({
      message: "Clinic note created successfully",
      document: result.document,
      clinicNote: result.clinicNote,
      version: result.version
    }, { status: 201 });

  } catch (error) {
    console.error("POST /api/clinic-notes error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
