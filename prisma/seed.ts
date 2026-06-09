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

  const mia = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      firstname: "Mia",
      lastname: "Bles",
      sex: "Female",
      dateofbirth: new Date("1995-04-12"),
      role: 1, // 1 for admin
      jsonColumn: {
        title: "Clinical Director",
        department: "Administration"
      }
    }
  });

  console.log("✅ Seeded Admin User:");
  console.log(`   Email: ${mia.email}`);
  console.log(`   Password: Admin1234 (hashed)`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
