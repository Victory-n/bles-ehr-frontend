import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    sendError({
        res,
        statusCode: 404,
        message: `Route not found - ${req.originalUrl}`,
    });
};

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("Global Error:", err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle Prisma specific errors
    if (err.code === "P2002") {
        statusCode = 409;
        message = "A duplicate record was found. Please use unique values.";
    } else if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token. Please log in again.";
    } else if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Your token has expired. Please log in again.";
    }

    sendError({
        res,
        statusCode,
        message,
        errors: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
