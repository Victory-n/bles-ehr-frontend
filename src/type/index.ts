import { Request } from "express";

// ─── Admin roles ──────────────────────────────────────────────────────────────
// Mirrors the AdminRole enum in prisma/schema.prisma.
// Once `prisma generate` is run the generated client will export its own enum;
// controllers that need it can import directly from "@prisma/client".
export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "CLINICIAN" | "STAFF";

// ─── JWT payloads ─────────────────────────────────────────────────────────────

export interface JwtAccessPayload {
    sub: string;      // admin.id (UUID)
    email: string;
    role: AdminRole;
    type: "access";
}

export interface JwtRefreshPayload {
    sub: string;
    type: "refresh";
}

// ─── Authenticated request ────────────────────────────────────────────────────

export interface AuthRequest extends Request {
    admin?: {
        id: string;
        email: string;
        role: AdminRole;
    };
}

// ─── Safe admin shape returned to clients (never includes password) ───────────

export interface SafeAdmin {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: AdminRole;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
}
