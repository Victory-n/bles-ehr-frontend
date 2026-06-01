import express, { Application } from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import staffRoutes from "./routes/staff.routes";
import patientRoutes from "./routes/patient.routes";
import programRoutes from "./routes/program.routes";
import noteRoutes from "./routes/note.routes";
import documentRoutes from "./routes/document.routes";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware";
import { sendSuccess } from "./utils/response";
import { initStorage } from "./utils/storage";

export function createApp(): Application {
    const app = express();

    // Initialise local file storage (creates uploads/ dir if missing)
    initStorage();

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
    app.use(cookieParser());

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

    // ── Static file serving (local uploads — dev only) ────────────────────────
    // In production this is replaced by S3 presigned URLs.
    // Files are served at: GET /uploads/patients/{patientId}/{category}/{filename}
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

    // ── Routes ────────────────────────────────────────────────────────────────
    app.use("/auth", authRoutes);
    app.use("/staff", staffRoutes);
    app.use("/patients", patientRoutes);
    app.use("/programs", programRoutes);
    app.use("/notes", noteRoutes);
    app.use("/documents", documentRoutes);

    // ── 404 ───────────────────────────────────────────────────────────────────
    app.use(notFoundHandler);

    // ── Global error handler (must be last) ───────────────────────────────────
    app.use(globalErrorHandler);

    return app;
}
