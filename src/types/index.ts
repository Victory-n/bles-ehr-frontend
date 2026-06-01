import { Request } from "express";

// ─── Staff roles ──────────────────────────────────────────────────────────────
// SUPER_ADMIN  : full system access, bypasses all permission checks.
// STAFF        : granular access controlled via StaffPermission rows.
// AUDITOR      : external/internal reviewer; defaults to read-only but
//                SUPER_ADMIN may grant additional permissions via the
//                StaffPermission table.
export type StaffRole = "SUPER_ADMIN" | "STAFF" | "AUDITOR";

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
    sub: string;      // staff.id (UUID)
    email: string;
    role: StaffRole;
    type: "access";
}

export interface JwtRefreshPayload {
    sub: string;
    type: "refresh";
}

// ─── Authenticated request ────────────────────────────────────────────────────

export interface AuthRequest extends Request {
    staff?: {
        id: string;
        email: string;
        role: StaffRole;
    };
}

// ─── Safe staff shape returned to clients (never includes password) ───────────

export interface SafeStaff {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: StaffRole;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
}

// ─── Permission row shape (mirrors the StaffPermission DB model) ──────────────

export interface IStaffPermission {
    id: string;
    staffId: string;
    resource: Resource;
    action: PermissionAction;
}
