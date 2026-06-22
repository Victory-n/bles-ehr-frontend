import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      type,
      sessionType,
      frequency,
      totalSessions,
      duration,
      maxEnrollment,
      notes,
    } = body;

    if (!name || !type || !sessionType || !frequency || !totalSessions || !duration || !maxEnrollment) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Generate program ID
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const programId = `PRG-${randomNum}`;

    // Structure extraInfo
    const extraInfo = notes ? { notes } : null;

    // Create program and audit log in transaction
    const result = await prisma.$transaction(async (tx) => {
      const program = await tx.program.create({
        data: {
          programId,
          name,
          description,
          type,
          sessionType,
          frequency,
          totalSessions: parseInt(totalSessions),
          duration,
          maxEnrollment: parseInt(maxEnrollment),
          extraInfo,
          status: "Active",
        },
      });

      await tx.auditLog.create({
        data: {
          action: "CREATE",
          modelName: "Program",
          recordId: program.id,
          performedById: user.id,
          changes: {
            message: `Program ${name} (${programId}) was created.`,
            programId: programId,
            name: name,
          },
        },
      });

      return program;
    });

    return NextResponse.json({ program: result, message: "Program created successfully" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/programs error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const programs = await prisma.program.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ programs }, { status: 200 });
  } catch (error) {
    console.error("GET /api/programs error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
