import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

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

    const note = await prisma.sessionNote.findUnique({
      where: { sessionId: session.id },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1
        }
      }
    });

    if (!note || note.versions.length === 0) {
      return NextResponse.json({ message: "Note does not exist. Please write a draft first." }, { status: 400 });
    }

    const latestVersion = note.versions[0];

    if (latestVersion.status !== "DRAFT") {
      return NextResponse.json({ message: `Cannot sign note. The note is currently in ${latestVersion.status.toLowerCase()} status.` }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const version = await tx.sessionNoteVersion.update({
        where: { id: latestVersion.id },
        data: {
          status: "SIGNED",
          signedById: user.id,
          signedAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          modelName: "SessionNote",
          recordId: note.id,
          performedById: user.id,
          changes: {
            message: `Session note version v${latestVersion.version} was signed by clinician ${user.firstname} ${user.lastname}.`,
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
    console.error("POST /api/sessions/[sessionId]/note/sign error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
