import "dotenv/config";
import { prisma } from "./src/config/prisma";

async function main() {
    await prisma.staff.update({
        where: { email: "superadmin@brightlife.health" },
        data: { requiresPinSetup: false },
    });
    console.log("Updated Super Admin requiresPinSetup to false for testing.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
