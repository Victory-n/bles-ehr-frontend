import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { generateTokenPair } from "../utils/jwt";
import { sendSuccess, sendError, JsonValue } from "../utils/response";
import { validateRegisterInput, validateLoginInput } from "../utils/validation";
import {SafeAdmin} from "@/src/type";

// Widen a plain object to satisfy the `data` map constraint
function toData(obj: unknown): Record<string, JsonValue> {
    return obj as Record<string, JsonValue>;
}

// Strip password from a Prisma Admin row
function toSafeAdmin(admin: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}): SafeAdmin {
    return {
        id:          admin.id,
        firstName:   admin.firstName,
        lastName:    admin.lastName,
        email:       admin.email,
        role:        admin.role as SafeAdmin["role"],
        isActive:    admin.isActive,
        lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
        createdAt:   admin.createdAt.toISOString(),
        updatedAt:   admin.updatedAt.toISOString(),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /auth/admin/register
// ─────────────────────────────────────────────────────────────────────────────
export async function registerAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { firstName, lastName, email, password } = req.body as {
            firstName?: unknown;
            lastName?:  unknown;
            email?:     unknown;
            password?:  unknown;
        };

        // 1. Validate
        const { valid, errors } = validateRegisterInput({ firstName, lastName, email, password });
        if (!valid) {
            sendError({ res, statusCode: 422, message: "Validation failed.", errors });
            return;
        }

        const cleanEmail = (email as string).toLowerCase().trim();

        // 2. Duplicate check (Prisma will also enforce via unique constraint, but
        //    we give a nicer message here)
        const existing = await prisma.admin.findUnique({ where: { email: cleanEmail } });
        if (existing) {
            sendError({
                res,
                statusCode: 409,
                message: "An account with this email address already exists.",
                errors: { email: "Email is already registered." },
            });
            return;
        }

        // 3. Hash password
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10);
        const hashedPassword = await bcrypt.hash(password as string, saltRounds);

        // 4. Insert row
        const admin = await prisma.admin.create({
            data: {
                firstName: (firstName as string).trim(),
                lastName:  (lastName as string).trim(),
                email:     cleanEmail,
                password:  hashedPassword,
            },
        });

        // 5. Respond (no password)
        sendSuccess({
            res,
            statusCode: 201,
            message: "Admin account created successfully.",
            data: { admin: toData(toSafeAdmin(admin)) },
        });
    } catch (err) {
        next(err);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /auth/admin/login
// ─────────────────────────────────────────────────────────────────────────────
export async function loginAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { email, password } = req.body as { email?: unknown; password?: unknown };

        // 1. Validate
        const { valid, errors } = validateLoginInput({ email, password });
        if (!valid) {
            sendError({ res, statusCode: 422, message: "Validation failed.", errors });
            return;
        }

        const cleanEmail = (email as string).toLowerCase().trim();

        // 2. Lookup – select password explicitly
        const admin = await prisma.admin.findUnique({ where: { email: cleanEmail } });
        if (!admin) {
            // Generic message prevents user enumeration
            sendError({ res, statusCode: 401, message: "Invalid email or password." });
            return;
        }

        // 3. Active check
        if (!admin.isActive) {
            sendError({
                res,
                statusCode: 403,
                message: "Your account has been deactivated. Please contact your administrator.",
            });
            return;
        }

        // 4. Password check
        const passwordOk = await bcrypt.compare(password as string, admin.password);
        if (!passwordOk) {
            sendError({ res, statusCode: 401, message: "Invalid email or password." });
            return;
        }

        // 5. Issue tokens
        const { accessToken, refreshToken } = generateTokenPair(admin.id, admin.email, admin.role);

        // 6. Update lastLoginAt (fire-and-forget – no await)
        prisma.admin.update({
            where: { id: admin.id },
            data:  { lastLoginAt: new Date() },
        }).catch(() => { /* non-critical */ });

        // 7. Respond
        sendSuccess({
            res,
            statusCode: 200,
            message: "Login successful.",
            data: {
                user:         toData(toSafeAdmin(admin)),
                accessToken:  accessToken  as unknown as JsonValue,
                refreshToken: refreshToken as unknown as JsonValue,
            },
        });
    } catch (err) {
        next(err);
    }
}
