import { Response } from "express";

interface SuccessResponseParams {
    res: Response;
    statusCode?: number;
    message?: string;
    data?: any;
    [key: string]: any;
}

export const sendSuccess = ({
    res,
    statusCode = 200,
    message = "Success",
    data,
    ...rest
}: SuccessResponseParams) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...(data !== undefined && { data }),
        ...rest,
    });
};

interface ErrorResponseParams {
    res: Response;
    statusCode?: number;
    message?: string;
    errors?: any;
}

export const sendError = ({
    res,
    statusCode = 400,
    message = "An error occurred",
    errors,
}: ErrorResponseParams) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors !== undefined && { errors }),
    });
};
