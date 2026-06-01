import { Router } from "express";
import { protect, restrict } from "../middleware/auth.middleware";
import {
    createProgram,
    getPrograms,
    getProgram,
    updateProgram,
    enrollPatient,
    dischargePatient,
} from "../controllers/program.controller";

const router = Router();

router.use(protect);

// ─── Program CRUD ────────────────────────────────────────────────────────────
router.post("/", restrict("program", "create"), createProgram);
router.get("/", restrict("program", "read"), getPrograms);
router.get("/:id", restrict("program", "read"), getProgram);
router.patch("/:id", restrict("program", "update"), updateProgram);

// ─── Enrollment sub-routes ────────────────────────────────────────────────────
// POST   /programs/:id/enroll           → enroll a patient
// DELETE /programs/:id/patients/:patientId → discharge a patient
router.post("/:id/enroll", restrict("program", "update"), enrollPatient);
router.delete("/:id/patients/:patientId", restrict("program", "update"), dischargePatient);

export default router;
