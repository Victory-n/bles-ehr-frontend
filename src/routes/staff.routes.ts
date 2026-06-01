import { Router } from "express";
import { protect, restrict } from "../middleware/auth.middleware";
import {
    createStaff,
    getStaffs,
    getStaff,
    updateStaff,
    deleteStaff,
} from "../controllers/staff.controller";

const router = Router();

// All staff routes require authentication
router.use(protect);

// ─── Staff CRUD Routes ────────────────────────────────────────────────────────
// restrict() automatically bypasses checks for SUPER_ADMIN.
// Regular staff need specific resource ('staff') and action ('create', 'read', etc.) permissions.

router.post("/", restrict("staff", "create"), createStaff);
router.get("/", restrict("staff", "read"), getStaffs);
router.get("/:id", restrict("staff", "read"), getStaff);
router.put("/:id", restrict("staff", "update"), updateStaff);
router.delete("/:id", restrict("staff", "delete"), deleteStaff);

export default router;
