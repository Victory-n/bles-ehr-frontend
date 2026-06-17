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
