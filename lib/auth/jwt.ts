import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-change-me";

export interface TokenPayload {
  userId: string;
  email: string;
  role: number; // 0 for staff, 1 for admin
}

export function generateToken(payload: TokenPayload, expiresIn: string = "1d"): string {
  return jwt.sign({ ...payload }, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
