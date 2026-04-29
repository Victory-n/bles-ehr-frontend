import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ message: "Logged out successfully." }, { status: 200 });

    // Clear all auth cookies
    response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
    response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
    response.cookies.set("userInfo", "", { maxAge: 0, path: "/" });

    return response;
}