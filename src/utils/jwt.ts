import jwt, { SignOptions } from "jsonwebtoken";
import { AdminRole, JwtAccessPayload, JwtRefreshPayload } from "@/src/type";

function requireEnv(key: string): string {
    const val = process.env[key];
    if (!val) throw new Error(`Environment variable ${key} is not set.`);
    return val;
}

// ─── Generate ─────────────────────────────────────────────────────────────────

export function generateAccessToken(
    adminId: string,
    email: string,
    role: AdminRole
): string {
    const payload: JwtAccessPayload = { sub: adminId, email, role, type: "access" };
    const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ?? "15m") as SignOptions["expiresIn"];
    return jwt.sign(payload, requireEnv("JWT_ACCESS_SECRET"), { expiresIn });
}

export function generateRefreshToken(adminId: string): string {
    const payload: JwtRefreshPayload = { sub: adminId, type: "refresh" };
    const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];
    return jwt.sign(payload, requireEnv("JWT_REFRESH_SECRET"), { expiresIn });
}

export function generateTokenPair(
    adminId: string,
    email: string,
    role: AdminRole
): { accessToken: string; refreshToken: string } {
    return {
        accessToken:  generateAccessToken(adminId, email, role),
        refreshToken: generateRefreshToken(adminId),
    };
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): JwtAccessPayload {
    const decoded = jwt.verify(token, requireEnv("JWT_ACCESS_SECRET")) as JwtAccessPayload;
    if (decoded.type !== "access") throw new Error("Invalid token type.");
    return decoded;
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
    const decoded = jwt.verify(token, requireEnv("JWT_REFRESH_SECRET")) as JwtRefreshPayload;
    if (decoded.type !== "refresh") throw new Error("Invalid token type.");
    return decoded;
}
