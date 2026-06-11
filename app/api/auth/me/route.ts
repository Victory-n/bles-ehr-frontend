import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized", user: null }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ message: "An internal server error occurred", user: null }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstname, lastname, email, sex, dateofbirth, phone, title, department, bio } = body;

    if (!firstname || !lastname || !email) {
      return NextResponse.json({ message: "First name, last name, and email are required" }, { status: 400 });
    }

    // Merge existing jsonColumn metadata with new fields
    const existingMeta = typeof user.jsonColumn === "object" && user.jsonColumn ? (user.jsonColumn as Record<string, any>) : {};
    const updatedMeta = {
      ...existingMeta,
      phone: phone ?? existingMeta.phone,
      title: title ?? existingMeta.title,
      department: department ?? existingMeta.department,
      bio: bio ?? existingMeta.bio,
    };

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstname,
        lastname,
        email,
        sex: sex ?? user.sex,
        dateofbirth: dateofbirth ? new Date(dateofbirth) : user.dateofbirth,
        jsonColumn: updatedMeta,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json({ user: userWithoutPassword, message: "Profile updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/auth/me error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
