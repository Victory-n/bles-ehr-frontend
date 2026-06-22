import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

// Generate a unique staff ID like "EMP-12345"
function generateStaffId(): string {
  const num = Math.floor(Math.random() * 90000 + 10000);
  return `EMP-${num}`;
}

// Generate a temporary password
function generateTempPassword(): string {
  return randomBytes(4).toString("hex");
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.user.findMany({
      select: {
        id: true,
        staffId: true,
        firstname: true,
        lastname: true,
        email: true,
        role: true,
        status: true,
        extendedInfo: true,
        createdAt: true,
        permissions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ staff }, { status: 200 });
  } catch (error) {
    console.error("GET /api/staff error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstname, lastname, email, position, role = 0, permissions = {} } = body;

    if (!firstname || !lastname || !email) {
      return NextResponse.json({ message: "First name, last name, and email are required" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    // Generate staff ID (make sure it's unique)
    let staffId = generateStaffId();
    let existingStaffId = await prisma.user.findUnique({ where: { staffId } });
    while (existingStaffId) {
      staffId = generateStaffId();
      existingStaffId = await prisma.user.findUnique({ where: { staffId } });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create the user and audit log atomically
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          staffId,
          firstname,
          lastname,
          email,
          // We need to set sex and dateofbirth - let's use default values for now
          sex: "Not specified",
          dateofbirth: new Date("1970-01-01"),
          password: hashedPassword,
          role,
          permissions,
          extendedInfo: {
            position,
          },
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          modelName: "User",
          recordId: newUser.id,
          performedById: currentUser.id,
          changes: {
            message: `Staff member ${firstname} ${lastname} (${staffId}) was created.`,
            staffId: staffId,
            name: `${firstname} ${lastname}`,
            email: email,
          },
        },
      });

      return newUser;
    });

    // Return the staff ID and temp password (only once!)
    return NextResponse.json({
      user: {
        id: result.id,
        staffId: result.staffId,
        firstname: result.firstname,
        lastname: result.lastname,
        email: result.email,
      },
      tempPassword,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/staff error:", error);
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
