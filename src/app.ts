import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware";
import { sendSuccess } from "./utils/response";

export function createApp(): Application {
    const app = express();

    // ── Security headers ──────────────────────────────────────────────────────
    app.use(helmet());

    // ── CORS ──────────────────────────────────────────────────────────────────
    const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error(`CORS: origin '${origin}' is not allowed.`));
                }
            },
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
        })
    );

    // ── Global rate limiter (safety net) ──────────────────────────────────────
    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 200,
            standardHeaders: true,
            legacyHeaders: false,
            message: { success: false, message: "Too many requests. Please slow down." },
        })
    );

    // ── Logging ───────────────────────────────────────────────────────────────
    if (process.env.NODE_ENV !== "test") {
        app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
    }

    // ── Body parsing ──────────────────────────────────────────────────────────
    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));

    // ── Health check ──────────────────────────────────────────────────────────
    app.get("/health", (_req, res) => {
        sendSuccess({
            res,
            message: "BrightLife EHR API is healthy.",
            data: {
                env:       (process.env.NODE_ENV ?? "development") as never,
                timestamp: new Date().toISOString() as never,
            },
        });
    });

    // ── Routes ────────────────────────────────────────────────────────────────
    app.use("/auth", authRoutes);

    // ── 404 ───────────────────────────────────────────────────────────────────
    app.use(notFoundHandler);

    // ── Global error handler (must be last) ───────────────────────────────────
    app.use(globalErrorHandler);

    return app;
}
