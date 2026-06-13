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
