import { User } from "@prisma/client";
import { getAuthCookie } from "./cookies";
import { verifyToken } from "./jwt";
import { prisma } from "../prisma";

// Type for user object returned by getCurrentUser (excludes password)
export type CurrentUser = Omit<User, "password">;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const token = await getAuthCookie();
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || !payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) return null;

    // Exclude password from the returned user object
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error in getCurrentUser guard:", error);
    return null;
  }
}

// Role constants
export const ROLES = {
  STAFF: 0,
  ADMIN: 1
};

// Check if user has admin role
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { authorized: false, user: null, status: 401, message: "Unauthorized" };
  }
  if (user.role !== ROLES.ADMIN) {
    return { authorized: false, user, status: 403, message: "Access denied. Admin privileges required." };
  }
  return { authorized: true, user, status: 200, message: "Authorized" };
}

// Check if user has staff role (or admin, since admin can do everything staff can)
export async function requireStaffOrAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { authorized: false, user: null, status: 401, message: "Unauthorized" };
  }
  if (user.role !== ROLES.STAFF && user.role !== ROLES.ADMIN) {
    return { authorized: false, user, status: 403, message: "Access denied." };
  }
  return { authorized: true, user, status: 200, message: "Authorized" };
}
