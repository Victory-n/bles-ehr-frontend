import { getAuthCookie } from "./cookies";
import { verifyToken } from "./jwt";
import { prisma } from "../prisma";

export async function getCurrentUser() {
  try {
    const token = await getAuthCookie();
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || !payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) return null;

    // Exclude password and pin from the returned user object
    const { password, pin, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, hasPin: !!pin };
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
