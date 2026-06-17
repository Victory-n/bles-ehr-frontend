import { NextResponse } from "next/server";
import { loginUser } from "@/lib/controllers/authController";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Login any user (staff or admin)
    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }

    return NextResponse.json({ user: result.user, message: result.message }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
