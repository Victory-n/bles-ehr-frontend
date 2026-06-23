import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSION_LEVELS } from "@/lib/auth/permissions";

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

    const sessions = await prisma.session.findMany({
      where: {
        programId: program.id,
        deletedAt: null
      },
      include: {
        patientProgram: {
          include: {
            patient: {
              select: {
                id: true,
                firstname: true,
                lastname: true
              }
            }
          }
        },
        note: {
          include: {
            versions: {
              orderBy: { version: "desc" },
              take: 1,
              select: { status: true }
            }
          }
        }
      },
      orderBy: {
        startDate: "asc"
      }
    });

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error("GET /api/programs/[programId]/sessions error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check permissions: Admin (role = 1) or Staff with program WRITE permissions
    if (user.role !== 1 && !hasPermission(user, "pr", PERMISSION_LEVELS.WRITE)) {
      return NextResponse.json(
        { message: "You do not have permission to schedule sessions for programs" },
        { status: 403 }
      );
    }

    const { programId } = await params;
    const program = await prisma.program.findUnique({
      where: { programId }
    });

    if (!program) {
      return NextResponse.json({ message: "Program not found" }, { status: 404 });
    }

    if (program.status !== "Active") {
      return NextResponse.json(
        { message: `Cannot schedule a session. This program is currently ${program.status.toLowerCase()}.` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      status,
      startDate,
      endDate,
      patientProgramId,
      location,
      notes
    } = body;

    if (!name || !startDate) {
      return NextResponse.json({ message: "Missing required fields: name and startDate are required" }, { status: 400 });
    }

    // Validate patientProgramId if sessionType is Single
    if (program.sessionType === "Single") {
      if (!patientProgramId) {
        return NextResponse.json({ message: "A target patient is required for single-session programs." }, { status: 400 });
      }

      const patientProgram = await prisma.patientProgram.findFirst({
        where: {
          id: patientProgramId,
          programId: program.id,
          deletedAt: null
        }
      });

      if (!patientProgram) {
        return NextResponse.json({ message: "Invalid patient enrollment selected." }, { status: 400 });
      }
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const sessionId = `SES-${randomNum}`;

    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.session.create({
        data: {
          sessionId,
          name,
          description: description || null,
          programId: program.id,
          patientProgramId: (program.sessionType === "Single" ? patientProgramId : null),
          status: status || "Scheduled",
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          location: location || null,
          notes: notes ? { notes } : undefined,
          createdById: user.id
        }
      });

      await tx.auditLog.create({
        data: {
          action: "CREATE",
          modelName: "Session",
          recordId: session.id,
          performedById: user.id,
          changes: {
            message: `Session "${session.name}" (${session.sessionId}) was scheduled for program ${program.name}.`,
            sessionId: session.sessionId,
            name: session.name,
            startDate: session.startDate,
            endDate: session.endDate,
            location: session.location,
            status: session.status
          }
        }
      });

      return session;
    });

    return NextResponse.json({ session: result, message: "Session scheduled successfully" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/programs/[programId]/sessions error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
