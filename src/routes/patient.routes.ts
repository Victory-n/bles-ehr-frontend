import { Router } from "express";
import { protect, restrict } from "../middleware/auth.middleware";
import {
    createPatient,
    getPatients,
    getPatient,
} from "../controllers/patient.controller";

const router = Router();

// All patient routes require authentication
router.use(protect);

// ─── Patient CRUD Routes ────────────────────────────────────────────────────────
// restrict() automatically bypasses checks for SUPER_ADMIN.
// Regular staff need specific resource ('patient') and action ('create', 'read', etc.) permissions.

router.post("/", restrict("patient", "create"), createPatient);
router.get("/", restrict("patient", "read"), getPatients);
router.get("/:id", restrict("patient", "read"), getPatient);

export default router;
