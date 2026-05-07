import { Request } from "express";

// ─── Admin roles ──────────────────────────────────────────────────────────────
// SUPER_ADMIN  : full system access, bypasses all permission checks.
// STAFF        : granular access controlled via AdminPermission rows.
// AUDITOR      : external/internal reviewer; defaults to read-only but
//                SUPER_ADMIN may grant additional permissions via the
//                AdminPermission table.
export type AdminRole = "SUPER_ADMIN" | "STAFF" | "AUDITOR";

// ─── Resources ────────────────────────────────────────────────────────────────
// Every protected area of the system maps to one of these values.
export type Resource =
    | "staff"
    | "document"
    | "note"
    | "patient"
    | "program"
    | "scheduling";

// ─── Permission actions ───────────────────────────────────────────────────────
export type PermissionAction = "create" | "read" | "update" | "delete";

// ─── Permission levels (shorthand used at assignment time) ────────────────────
// Levels are expanded into individual PermissionAction rows before storage;
// they are never persisted themselves.
export type PermissionLevel = "l1" | "l2" | "l3" | "l4" | "l5";

export const PERMISSION_LEVELS: Record<PermissionLevel, PermissionAction[]> = {
    l1: ["create"],
    l2: ["read"],
    l3: ["update"],
    l4: ["delete"],
    l5: ["create", "read", "update", "delete"],
} as const;

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

// ─── Permission row shape (mirrors the AdminPermission DB model) ──────────────

export interface IAdminPermission {
    id: string;
    adminId: string;
    resource: Resource;
    action: PermissionAction;
}
