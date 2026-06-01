import jwt from "jsonwebtoken";
import { JwtAccessPayload, JwtRefreshPayload } from "../types";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "fallback_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret";
const ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as any;
const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as any;

export const signAccessToken = (payload: Omit<JwtAccessPayload, "type">): string => {
    return jwt.sign({ ...payload, type: "access" }, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRES_IN,
    });
};

export const signRefreshToken = (payload: Omit<JwtRefreshPayload, "type">): string => {
    return jwt.sign({ ...payload, type: "refresh" }, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES_IN,
    });
};

export const verifyAccessToken = (token: string): JwtAccessPayload => {
    return jwt.verify(token, ACCESS_SECRET) as JwtAccessPayload;
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
    return jwt.verify(token, REFRESH_SECRET) as JwtRefreshPayload;
};
