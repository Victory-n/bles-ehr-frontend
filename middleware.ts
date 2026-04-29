import { NextRequest, NextResponse } from "next/server";

// Routes that require the user to be logged in
const PROTECTED_PREFIXES = [
    "/dashboard",
    "/patients",
    "/staff",
    "/programs",
    "/notes",
    "/scheduling",
    "/documents",
    "/billing",
    "/compliance",
    "/reports",
    "/settings",
    "/support",
];

// Auth routes — logged-in users should not be able to access these
const AUTH_ROUTES = ["/login", "/registration"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get("accessToken")?.value;

    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        pathname.startsWith(prefix)
    );
    const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    // Not logged in → trying to visit a protected page → send to login
    if (isProtected && !accessToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname); // preserve destination
        return NextResponse.redirect(loginUrl);
    }

    // Already logged in → trying to visit login/register → send to dashboard
    if (isAuthRoute && accessToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Run middleware on these paths only — skip static files and Next internals
    matcher: [
        "/dashboard/:path*",
        "/patients/:path*",
        "/staff/:path*",
        "/programs/:path*",
        "/notes/:path*",
        "/scheduling/:path*",
        "/documents/:path*",
        "/billing/:path*",
        "/compliance/:path*",
        "/reports/:path*",
        "/settings/:path*",
        "/support/:path*",
        "/login",
        "/registration",
    ],
};