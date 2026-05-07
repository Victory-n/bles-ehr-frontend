import "dotenv/config";
import { createApp } from "./app";
import prisma from "./config/prisma";

const PORT = parseInt(process.env.PORT ?? "5000", 10);

async function bootstrap(): Promise<void> {
    // ── Verify database connection before accepting traffic ───────────────────
    console.log("🔌  Connecting to PostgreSQL…");
    await prisma.$connect();
    console.log("✅  PostgreSQL connected.");

    // ── Start Express ─────────────────────────────────────────────────────────
    const app = createApp();

    const server = app.listen(PORT, () => {
        console.log(
            `🚀  BrightLife EHR API → http://localhost:${PORT}  [${process.env.NODE_ENV ?? "development"}]`
        );
    });

    // ── Graceful shutdown ─────────────────────────────────────────────────────
    const shutdown = async (signal: string): Promise<void> => {
        console.log(`\n📴  ${signal} received. Shutting down…`);

        server.close(async () => {
            await prisma.$disconnect();
            console.log("✅  Prisma disconnected. Goodbye!");
            process.exit(0);
        });

        // Force-kill after 10 s if connections hang
        setTimeout(() => {
            console.error("⚠️  Forced shutdown after timeout.");
            process.exit(1);
        }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason) => {
        console.error("❌  Unhandled Rejection:", reason);
        shutdown("unhandledRejection");
    });

    process.on("uncaughtException", (err) => {
        console.error("❌  Uncaught Exception:", err);
        shutdown("uncaughtException");
    });
}

bootstrap().catch((err) => {
    console.error("❌  Failed to start server:", err);
    process.exit(1);
});
