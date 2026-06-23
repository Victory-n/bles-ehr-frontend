import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    // Find session by UUID id or human-readable sessionId
    const session = await prisma.session.findFirst({
      where: {
        OR: [
          { id: sessionId },
          { sessionId: sessionId }
        ],
        deletedAt: null
      }
    });

    if (!session) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    // Find the session note and its versions
    const note = await prisma.sessionNote.findUnique({
      where: { sessionId: session.id },
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
    });

    if (!note) {
      return NextResponse.json({ note: null }, { status: 200 });
    }

    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    console.error("GET /api/sessions/[sessionId]/note error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    const session = await prisma.session.findFirst({
      where: {
        OR: [
          { id: sessionId },
          { sessionId: sessionId }
        ],
        deletedAt: null
      }
    });

    if (!session) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    const { content, editSummary } = await req.json();
    if (content === undefined || content === null) {
      return NextResponse.json({ message: "Missing required field: content" }, { status: 400 });
    }

    // Fetch existing note for this session
    let note = await prisma.sessionNote.findUnique({
      where: { sessionId: session.id },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1
        }
      }
    });

    const result = await prisma.$transaction(async (tx) => {
      if (!note) {
        // Create new SessionNote
        const newNote = await tx.sessionNote.create({
          data: {
            sessionId: session.id
          }
        });

        // Create version 1
        const version = await tx.sessionNoteVersion.create({
          data: {
            noteId: newNote.id,
            version: 1,
            content,
            status: "DRAFT",
            editedById: user.id,
            editSummary: editSummary || "Initial draft"
          }
        });

        await tx.auditLog.create({
          data: {
            action: "CREATE",
            modelName: "SessionNote",
            recordId: newNote.id,
            performedById: user.id,
            changes: {
              message: `Created session note draft v1 for session ${session.sessionId}.`,
              version: 1,
              content
            }
          }
        });

        return { note: newNote, version };
      } else {
        const latestVersion = note.versions[0];

        if (latestVersion.status === "DRAFT") {
          // Update the current draft version
          const updatedVersion = await tx.sessionNoteVersion.update({
            where: { id: latestVersion.id },
            data: {
              content,
              editedById: user.id,
              editSummary: editSummary || "Updated draft"
            }
          });

          await tx.auditLog.create({
            data: {
              action: "UPDATE",
              modelName: "SessionNote",
              recordId: note.id,
              performedById: user.id,
              changes: {
                message: `Updated session note draft v${latestVersion.version} for session ${session.sessionId}.`,
                version: latestVersion.version,
                content
              }
            }
          });

          return { note, version: updatedVersion };
        } else {
          // If note is SIGNED or LOCKED, editing creates a new version
          const newVersionNum = latestVersion.version + 1;
          const newVersion = await tx.sessionNoteVersion.create({
            data: {
              noteId: note.id,
              version: newVersionNum,
              content,
              status: "DRAFT",
              editedById: user.id,
              editSummary: editSummary || `Amended note from version v${latestVersion.version}`
            }
          });

          await tx.auditLog.create({
            data: {
              action: "UPDATE",
              modelName: "SessionNote",
              recordId: note.id,
              performedById: user.id,
              changes: {
                message: `Amended session note for session ${session.sessionId}, creating version v${newVersionNum}.`,
                version: newVersionNum,
                content,
                previousVersion: latestVersion.version
              }
            }
          });

          return { note, version: newVersion };
        }
      }
    });

    return NextResponse.json({
      message: "Note saved successfully",
      note: result.note,
      version: result.version
    }, { status: 200 });

  } catch (error) {
    console.error("POST /api/sessions/[sessionId]/note error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
