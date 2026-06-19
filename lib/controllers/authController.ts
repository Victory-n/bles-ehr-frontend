import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "../auth/jwt";
import { setAuthCookie } from "../auth/cookies";

export async function loginUser(email: string, password: string, requiredRole?: number) {
  if (!email || !password) {
    return { success: false, status: 400, message: "Email and password are required" };
  }

  // Find user in db
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return { success: false, status: 401, message: "Invalid credentials" };
  }

  // Check if user has required role (if specified)
  if (requiredRole !== undefined && user.role !== requiredRole) {
    return { success: false, status: 403, message: "Unauthorized access" };
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { success: false, status: 401, message: "Invalid credentials" };
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  // Set http-only cookie
  await setAuthCookie(token);

  // Return user details (excluding password)
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    success: true,
    status: 200,
    user: userWithoutPassword,
    message: "Logged in successfully"
  };
}
