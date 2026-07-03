import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { name, description, structure, prompt } = body;

    if (!name || !structure) {
      return NextResponse.json({ message: "Missing name or structure" }, { status: 400 });
    }

    // Check if name is taken by another template
    const existing = await prisma.clinicalTemplate.findFirst({
      where: {
        name,
        id: { not: id }
      }
    });

    if (existing) {
      return NextResponse.json({ message: "A template with this name already exists" }, { status: 400 });
    }

    const template = await prisma.clinicalTemplate.update({
      where: { id },
      data: { name, description, structure, prompt }
    });

    return NextResponse.json({ template }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/templates/[id] error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.clinicalTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Template deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/templates/[id] error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
