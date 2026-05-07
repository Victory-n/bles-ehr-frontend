import { Response } from "express";

export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

interface SendSuccessOptions {
    res: Response;
    statusCode?: number;
    message: string;
    data?: Record<string, JsonValue>;
}

interface SendErrorOptions {
    res: Response;
    statusCode?: number;
    message: string;
    errors?: Record<string, string>;
}

export function sendSuccess({
                                res,
                                statusCode = 200,
                                message,
                                data = {},
                            }: SendSuccessOptions): Response {
    return res.status(statusCode).json({ success: true, message, ...data });
}

export function sendError({
                              res,
                              statusCode = 500,
                              message,
                              errors,
                          }: SendErrorOptions): Response {
    const body: {
        success: false;
        message: string;
        errors?: Record<string, string>;
    } = { success: false, message };

    if (errors && Object.keys(errors).length > 0) {
        body.errors = errors;
    }

    return res.status(statusCode).json(body);
}
