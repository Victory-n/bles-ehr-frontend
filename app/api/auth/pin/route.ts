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

    const pinHash = await bcrypt.hash(pin, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        pin: pinHash,
        twoFactorEnabled: true
      },
    });

    return NextResponse.json({ message: "PIN set successfully" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/auth/pin error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
