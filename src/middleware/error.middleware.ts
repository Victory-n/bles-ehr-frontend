import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

// ─── Custom operational error ─────────────────────────────────────────────────

export class AppError extends Error {
    public statusCode: number;
    public isOperational = true;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

// ─── Prisma error helpers (duck-typed, no generated-client dependency) ────────

interface PrismaKnownError {
    code: string;
    meta?: { target?: string[] };
    message: string;
    name: string;
}

function isPrismaKnownError(err: unknown): err is PrismaKnownError {
    return (
        typeof err === "object" &&
        err !== null &&
        (err as { constructor?: { name?: string } }).constructor?.name ===
        "PrismaClientKnownRequestError" &&
        "code" in err
    );
}

function isPrismaValidationError(err: unknown): err is Error {
    return (
        typeof err === "object" &&
        err !== null &&
        (err as { constructor?: { name?: string } }).constructor?.name ===
        "PrismaClientValidationError"
    );
}

// ─── Global error handler ─────────────────────────────────────────────────────

// Express requires the 4-argument signature even when _next is unused
export function globalErrorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void {
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) console.error("🔥 Error:", err);

    // Ensure we always have an Error-like object for name / message access
    const asError = err instanceof Error ? err : new Error(String(err));

    // ── Operational errors ────────────────────────────────────────────────────
    if (asError instanceof AppError) {
        sendError({ res, statusCode: asError.statusCode, message: asError.message });
        return;
    }

    // ── Prisma known request errors ───────────────────────────────────────────
    if (isPrismaKnownError(err)) {
        if (err.code === "P2002") {
            const fields = err.meta?.target ?? ["field"];
            sendError({
                res,
                statusCode: 409,
                message: `A record with this ${fields.join(", ")} already exists.`,
            });
            return;
        }
        if (err.code === "P2025") {
            sendError({ res, statusCode: 404, message: "Record not found." });
            return;
        }
        if (err.code === "P2003") {
            sendError({ res, statusCode: 400, message: "Related record not found." });
            return;
        }
        sendError({
            res,
            statusCode: 400,
            message: isDev ? err.message : "Database request error.",
        });
        return;
    }

    // ── Prisma validation errors ──────────────────────────────────────────────
    if (isPrismaValidationError(err)) {
        sendError({
            res,
            statusCode: 422,
            message: isDev ? err.message : "Invalid data provided.",
        });
        return;
    }

    // ── JWT errors ────────────────────────────────────────────────────────────
    if (asError.name === "JsonWebTokenError") {
        sendError({ res, statusCode: 401, message: "Invalid token." });
        return;
    }
    if (asError.name === "TokenExpiredError") {
        sendError({ res, statusCode: 401, message: "Token has expired. Please sign in again." });
        return;
    }

    // ── Catch-all ─────────────────────────────────────────────────────────────
    sendError({
        res,
        statusCode: 500,
        message: isDev ? asError.message : "An unexpected error occurred. Please try again later.",
    });
}

// ─── 404 handler ─────────────────────────────────────────────────────────────

export function notFoundHandler(req: Request, res: Response): void {
    sendError({
        res,
        statusCode: 404,
        message: `Route '${req.method} ${req.originalUrl}' not found.`,
    });
}
