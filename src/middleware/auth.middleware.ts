import { Response, NextFunction } from "express";
import { AuthRequest, Resource, PermissionAction } from "../types";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../config/prisma";
import { sendError } from "../utils/response";

/**
 * Protects routes by verifying the JWT and attaching the staff user to the request.
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return sendError({ res, statusCode: 401, message: "Not authorized, no token provided" });
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Check if staff still exists
        const staff = await prisma.staff.findUnique({
            where: { id: decoded.sub },
            select: { id: true, email: true, role: true, isActive: true },
        });

        if (!staff) {
            return sendError({ res, statusCode: 401, message: "The user belonging to this token does no longer exist." });
        }

        if (!staff.isActive) {
            return sendError({ res, statusCode: 403, message: "Your account is deactivated. Please contact an administrator." });
        }

        req.staff = staff;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Factory middleware to restrict access based on staff permissions.
 * Bypasses checks for SUPER_ADMIN.
 */
export const restrict = (resource: Resource, action: PermissionAction) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const staff = req.staff;

            if (!staff) {
                return sendError({ res, statusCode: 401, message: "Authentication required to access this resource." });
            }

            // SUPER_ADMIN has full access
            if (staff.role === "SUPER_ADMIN") {
                return next();
            }

            // Check StaffPermission table
            const permission = await prisma.staffPermission.findUnique({
                where: {
                    staffId_resource_action: {
                        staffId: staff.id,
                        resource,
                        action,
                    },
                },
            });

            if (!permission) {
                return sendError({
                    res,
                    statusCode: 403,
                    message: `You do not have permission to ${action} ${resource}.`,
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
