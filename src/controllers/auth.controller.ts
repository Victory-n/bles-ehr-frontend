import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { signAccessToken, signRefreshToken } from "../utils/jwt";

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError({ res, statusCode: 400, message: "Please provide email and password" });
        }

        // Find staff
        const staff = await prisma.staff.findUnique({
            where: { email },
        });

        if (!staff || !staff.isActive) {
            return sendError({ res, statusCode: 401, message: "Invalid email or password" });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, staff.passwordHash);

        if (!isPasswordCorrect) {
            return sendError({ res, statusCode: 401, message: "Invalid email or password" });
        }

        // Handle PIN setup flow — SUPER_ADMIN bypasses this entirely.
        // Only STAFF and AUDITOR roles are required to set up a PIN.
        if (staff.requiresPinSetup && staff.role !== "SUPER_ADMIN") {
            return sendSuccess({
                res,
                message: "PIN setup required. Please set up your 6-digit PIN.",
                data: {
                    requiresPinSetup: true,
                }
            });
        }

        // Generate tokens
        const accessPayload = { sub: staff.id, email: staff.email, role: staff.role };
        const refreshPayload = { sub: staff.id };

        const accessToken = signAccessToken(accessPayload);
        const refreshToken = signRefreshToken(refreshPayload);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
        };

        // 15 minutes for access token, 7 days for refresh token
        res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        // Update last login
        await prisma.staff.update({
            where: { id: staff.id },
            data: { lastLoginAt: new Date() },
        });

        const safeStaff = {
            id: staff.id,
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            role: staff.role,
        };

        sendSuccess({
            res,
            message: "Login successful.",
            data: {
                user: safeStaff,
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// TODO: Implement `setupPin` endpoint here as requested later.
// export const setupPin = async (req: Request, res: Response, next: NextFunction) => { ... }
