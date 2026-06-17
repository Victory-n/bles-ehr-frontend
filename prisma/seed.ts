import "dotenv/config"; // Load environment variables from .env
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  const email = "mia@bles.com";
  
  // Clean up any existing user with this email first
  await prisma.user.deleteMany({
    where: { email }
  });

  const passwordHash = await bcrypt.hash("Admin1234", 10);
  const pinHash = await bcrypt.hash("123456", 10); // Default test pin: 123456

  // Full permissions for admin
  const adminPermissions = {
    p: [1, 2, 3, 4, 5],    // Patient: Create, Read, Update, Write, Delete
    pr: [1, 2, 3, 4, 5],   // Programs
    cn: [1, 2, 3, 4, 5],   // Clinic Notes
    s: [1, 2, 3, 4, 5],    // Staff
    b: [1, 2, 3, 4, 5],    // Billing
    c: [1, 2, 3, 4, 5],    // Compliance
    al: [1, 2, 3, 4, 5]    // Audit Log
  };

  const mia = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      pin: pinHash,
      twoFactorEnabled: true,
      staffId: "EMP-00001",
      firstname: "Mia",
      lastname: "Bles",
      sex: "Female",
      dateofbirth: new Date("1995-04-12"),
      role: 1,
      status: "Active",
      permissions: adminPermissions,
      extendedInfo: {
        title: "Clinical Director",
        department: "Administration"
      }
    }
  });

  console.log("✅ Seeded Admin User:");
  console.log(`   Email: ${mia.email}`);
  console.log(`   Password: Admin1234`);
  console.log(`   PIN: 123456`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
