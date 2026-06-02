import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {PrismaClient} from "@prisma/client/extension";
// import { PrismaClient } from "@prisma/client";

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
    global.prisma ||
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
export default prisma;
