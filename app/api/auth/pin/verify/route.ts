import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { pin } = await req.json();

    if (!pin || typeof pin !== "string" || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ message: "A valid 6-digit PIN is required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || !dbUser.pin) {
      return NextResponse.json({ valid: false, message: "No PIN set" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(pin, dbUser.pin);

    if (isValid) {
      return NextResponse.json({ valid: true, message: "PIN verified" }, { status: 200 });
    } else {
      return NextResponse.json({ valid: false, message: "Invalid PIN" }, { status: 401 });
    }
  } catch (error) {
    console.error("POST /api/auth/pin/verify error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
