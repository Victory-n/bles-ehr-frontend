import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/auth/cookies";

export async function POST() {
  try {
    await removeAuthCookie();
    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/auth/logout error:", error);
    return NextResponse.json({ message: "An error occurred during logout" }, { status: 500 });
  }
}
