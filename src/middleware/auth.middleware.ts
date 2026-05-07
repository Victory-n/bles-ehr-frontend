import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/response";
import { AuthRequest, AdminRole, Resource, PermissionAction } from "@/src/types";
import prisma from "../config/prisma";

/**
 * protect — validates the Bearer access token and attaches
 * `req.admin` for downstream handlers.
 */
export function protect(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            sendError({ res, statusCode: 401, message: "Authentication required. Please sign in." });
            return;
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            sendError({ res, statusCode: 401, message: "Access token is missing." });
            return;
        }

        const decoded = verifyAccessToken(token);
        req.admin = { id: decoded.sub, email: decoded.email, role: decoded.role };
        next();
    } catch (err) {
        if (err instanceof Error) {
            if (err.name === "TokenExpiredError") {
                sendError({ res, statusCode: 401, message: "Your session has expired. Please sign in again." });
                return;
            }
            if (err.name === "JsonWebTokenError") {
                sendError({ res, statusCode: 401, message: "Invalid access token." });
                return;
            }
        }
        sendError({ res, statusCode: 401, message: "Authentication failed." });
    }
}

/**
 * restrict — must follow `protect`. Allows only the specified roles.
 * Use this for coarse-grained, role-level gates (e.g. only SUPER_ADMIN
 * may access the admin-management routes).
 *
 * @example
 * router.delete("/admin/:id", protect, restrict("SUPER_ADMIN"), handler)
 */
export function restrict(
    ...allowedRoles: AdminRole[]
): (req: AuthRequest, res: Response, next: NextFunction) => void {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.admin) {
            sendError({ res, statusCode: 401, message: "Authentication required." });
            return;
        }

        if (!allowedRoles.includes(req.admin.role)) {
            sendError({ res, statusCode: 403, message: "You do not have permission to perform this action." });
            return;
        }

        next();
    };
}

/**
 * checkPermission — fine-grained resource + action gate. Must follow `protect`.
 *
 * Behaviour by role:
 *  • SUPER_ADMIN  → always passes, no DB query needed.
 *  • STAFF        → must have a matching row in admin_permissions.
 *  • AUDITOR      → must have a matching row in admin_permissions
 *                   (SUPER_ADMIN assigns read-only rows by default, but can
 *                   grant additional actions through the permission table).
 *
 * Permission rows are created/removed by SUPER_ADMIN via the permissions API.
 * The "level" shorthand (l1–l5) is expanded into individual rows at write time;
 * this middleware always checks for a single (resource, action) pair.
 *
 * @example
 * // Only allows admins who have been granted patient:read
 * router.get("/patients", protect, checkPermission("patient", "read"), handler)
 *
 * // Only allows admins who have been granted patient:create
 * router.post("/patients", protect, checkPermission("patient", "create"), handler)
 */
export function checkPermission(
    resource: Resource,
    action: PermissionAction,
): (req: AuthRequest, res: Response, next: NextFunction) => Promise<void> {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        if (!req.admin) {
            sendError({ res, statusCode: 401, message: "Authentication required." });
            return;
        }

        // SUPER_ADMIN bypasses the permission table entirely.
        if (req.admin.role === "SUPER_ADMIN") {
            next();
            return;
        }

        try {
            // Both STAFF and AUDITOR go through the same permission table.
            // The difference is managed at assignment time by SUPER_ADMIN.
            const permission = await prisma.adminPermission.findUnique({
                where: {
                    adminId_resource_action: {
                        adminId: req.admin.id,
                        resource,
                        action,
                    },
                },
            });

            if (!permission) {
                sendError({
                    res,
                    statusCode: 403,
                    message: "You do not have permission to perform this action.",
                });
                return;
            }

            next();
        } catch (err) {
            // Pass unexpected DB errors to the global error handler.
            next(err);
        }
    };
}
