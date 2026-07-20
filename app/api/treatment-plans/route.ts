import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      patientId,
      title,
      diagnosis,
      goals,
      interventions,
      frequency,
      duration,
      status,
      sessionIds
    } = body;

    if (!patientId || !title || !goals) {
      return NextResponse.json({ message: "Missing required fields: patientId, title, goals" }, { status: 400 });
    }

    const newPlan = await prisma.$transaction(async (tx) => {
      // Create Treatment Plan
      const plan = await tx.treatmentPlan.create({
        data: {
          patientId,
          title,
          diagnosis: diagnosis || null,
          goals,
          interventions: interventions || null,
          frequency: frequency || null,
          duration: duration || null,
          status: status || "DRAFT",
          createdById: user.id
        }
      });

      // Link selected sessions if provided
      if (sessionIds && Array.isArray(sessionIds) && sessionIds.length > 0) {
        await tx.session.updateMany({
          where: { id: { in: sessionIds } },
          data: { treatmentPlanId: plan.id }
        });
      }

      // Add Audit Log
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          modelName: "TreatmentPlan",
          recordId: plan.id,
          performedById: user.id,
          changes: {
            message: `Created treatment plan: "${title}" for patient ${patientId}.`,
            status: status || "DRAFT"
          }
        }
      });

      return plan;
    });

    return NextResponse.json({ treatmentPlan: newPlan }, { status: 201 });
  } catch (error) {
    console.error("POST /api/treatment-plans error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ message: "Missing query parameter: patientId" }, { status: 400 });
    }

    const treatmentPlans = await prisma.treatmentPlan.findMany({
      where: {
        patientId,
        deletedAt: null
      },
      include: {
        createdBy: {
          select: { id: true, firstname: true, lastname: true }
        },
        sessions: {
          select: { id: true, sessionId: true, name: true, startDate: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ treatmentPlans }, { status: 200 });
  } catch (error) {
    console.error("GET /api/treatment-plans error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ message: "Missing required fields: id, status" }, { status: 400 });
    }

    const updatedPlan = await prisma.treatmentPlan.update({
      where: { id },
      data: { status }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        modelName: "TreatmentPlan",
        recordId: id,
        performedById: user.id,
        changes: {
          message: `Updated treatment plan status to ${status}.`
        }
      }
    });

    return NextResponse.json({ treatmentPlan: updatedPlan }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/treatment-plans error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
