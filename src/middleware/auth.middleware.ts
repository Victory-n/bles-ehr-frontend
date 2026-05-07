import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/response";
import { AuthRequest, AdminRole } from "@/src/type";

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
 * restrict — must follow `protect`. Allows only specified roles.
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
