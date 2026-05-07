import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log("🌱  Seeding database…");

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10);
    const hashedPassword = await bcrypt.hash("Admin@123!", saltRounds);

    // Seed the one and only SUPER_ADMIN account.
    // All other accounts are created as STAFF by default and must have
    // permissions explicitly granted by the SUPER_ADMIN.
    const superAdmin = await prisma.admin.upsert({
        where:  { email: "superadmin@brightlife.health" },
        update: {},
        create: {
            firstName: "Super",
            lastName:  "Admin",
            email:     "superadmin@brightlife.health",
            password:  hashedPassword,
            role:      AdminRole.SUPER_ADMIN,
            isActive:  true,
        },
    });

    console.log(`✅  Super admin seeded → ${superAdmin.email}`);
    console.log("⚠️   Default password is Admin@123! — change it immediately!");
}

main()
    .catch((err) => {
        console.error("❌  Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
