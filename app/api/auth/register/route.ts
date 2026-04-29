import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const backendRes = await fetch(`${API_URL}/auth/admin/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(
                { message: data?.message || "Registration failed. Please try again." },
                { status: backendRes.status }
            );
        }

        return NextResponse.json(
            {
                message: data.message,
                admin: data.admin,
            },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { message: "Unable to reach the server. Please try again." },
            { status: 503 }
        );
    }
}