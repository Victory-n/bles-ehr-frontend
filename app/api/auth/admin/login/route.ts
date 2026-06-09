import { NextResponse } from "next/server";
import { loginUser } from "@/lib/controllers/authController";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1 for admin
    const result = await loginUser(email, password, 1);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }

    return NextResponse.json({ user: result.user, message: result.message }, { status: 200 });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
