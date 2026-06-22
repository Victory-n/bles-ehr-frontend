import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.user.findUnique({
      where: { staffId: id },
      include: { assignedPrograms: true },
    });

    if (!staff) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    // Exclude sensitive fields
    const { password, pin, ...staffWithoutSensitive } = staff;

    return NextResponse.json({ staff: staffWithoutSensitive }, { status: 200 });
  } catch (error) {
    console.error("GET /api/staff/[id] error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only system admins are allowed to modify roles & permissions
    if (currentUser.role !== 1) {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { role, permissions } = body;

    const staff = await prisma.user.findUnique({
      where: { staffId: id },
      include: { assignedPrograms: true },
    });

    if (!staff) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { staffId: id },
        data: {
          role: role !== undefined ? role : staff.role,
          permissions: permissions !== undefined ? permissions : (staff.permissions ?? {}),
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          modelName: "User",
          recordId: updated.id,
          performedById: currentUser.id,
          changes: {
            message: `Updated roles/permissions for staff member ${updated.firstname} ${updated.lastname} (${id}).`,
            oldRole: staff.role,
            newRole: updated.role,
            oldPermissions: staff.permissions,
            newPermissions: updated.permissions,
          },
        },
      });

      return updated;
    });

    const { password, pin, ...staffWithoutSensitive } = result;

    return NextResponse.json({ staff: staffWithoutSensitive, message: "Staff updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/staff/[id] error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
