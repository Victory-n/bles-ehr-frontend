import { prisma } from "../src/config/prisma";
import bcrypt from "bcryptjs";

async function main() {
    console.log("Seeding database...");

    const superAdminEmail = "superadmin@brightlife.health";

    const existingSuperAdmin = await prisma.staff.findUnique({
        where: { email: superAdminEmail },
    });

    if (existingSuperAdmin) {
        console.log("✅ Super Admin already exists.");
        return;
    }

    const passwordHash = await bcrypt.hash("Admin@123!", 10);

    await prisma.staff.create({
        data: {
            firstName: "Super",
            lastName: "Admin",
            email: superAdminEmail,
            passwordHash,
            role: "SUPER_ADMIN",
            isActive: true,
            requiresPinSetup: false, // SUPER_ADMIN uses email + password only; no PIN required
        },
    });

    console.log("✅ Seeded initial Super Admin:");
    console.log(`   Email: ${superAdminEmail}`);
    console.log(`   Password: Admin@123!`);
    console.log(`   (Please change this password/PIN on first login!)`);
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
