import { NextResponse } from "next/server";

export function middleware(req: Request) {
    // auth logic
    return NextResponse.next();
}
