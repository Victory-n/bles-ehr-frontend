import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const backendRes = await fetch(`${API_URL}/auth/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(
                { message: data?.message || "Invalid email or password." },
                { status: backendRes.status }
            );
        }

        // Build the response we return to the browser
        const response = NextResponse.json(
            {
                message: data.message,
                user: data.user,
            },
            { status: 200 }
        );

        // Store tokens in HTTP-only cookies — JS on the page cannot read these
        const isProduction = process.env.NODE_ENV === "production";

        response.cookies.set("accessToken", data.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            // Access tokens are short-lived; match your backend expiry (e.g. 15 min)
            maxAge: 60 * 15,
        });

        response.cookies.set("refreshToken", data.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            // Refresh tokens are long-lived (e.g. 7 days)
            maxAge: 60 * 60 * 24 * 7,
        });

        // Store non-sensitive user info in a readable cookie so the UI can
        // display the user's name/role without an extra API call
        response.cookies.set("userInfo", JSON.stringify(data.user), {
            httpOnly: false,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 15,
        });

        return response;
    } catch {
        return NextResponse.json(
            { message: "Unable to reach the server. Please try again." },
            { status: 503 }
        );
    }
}