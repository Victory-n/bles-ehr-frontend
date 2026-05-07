import { Router } from "express";
import rateLimit from "express-rate-limit";
import { registerAdmin, loginAdmin } from "../controllers/auth.controller";

const router = Router();

// Aggressive limit for login – protects against brute-force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,    // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // only count failures
    message: {
        success: false,
        message: "Too many login attempts. Please try again in 15 minutes.",
    },
});

// Gentler limit for registration
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,    // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many registration attempts. Please try again in an hour.",
    },
});

/**
 * @route  POST /auth/admin/register
 * @desc   Create a new admin account
 * @access Public
 */
router.post("/admin/register", registerLimiter, registerAdmin);

/**
 * @route  POST /auth/admin/login
 * @desc   Authenticate admin → returns access + refresh tokens
 * @access Public
 */
router.post("/admin/login", loginLimiter, loginAdmin);

export default router;
