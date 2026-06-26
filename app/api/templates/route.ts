import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.clinicalTemplate.findMany({
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    console.error("GET /api/templates error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, description, structure, prompt } = await req.json();

    if (!name || !structure) {
      return NextResponse.json({ message: "Missing name or structure" }, { status: 400 });
    }

    const template = await prisma.clinicalTemplate.create({
      data: { name, description, structure, prompt }
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("POST /api/templates error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
