import { Router } from "express";
import { protect, restrict } from "../middleware/auth.middleware";
import {
    createNote,
    getNotes,
    getNote,
    updateNote,
    signNote,
    getNoteRevisions,
} from "../controllers/note.controller";

const router = Router();

router.use(protect);

// ─── Clinical Note CRUD ───────────────────────────────────────────────────────
// Query params supported on GET /notes:
//   ?patientFolderId=  → standalone patient notes
//   ?programId=        → group session notes for a program
//   ?enrollmentId=     → patient-specific notes within a program
//   ?noteType=         → filter by CASE_MANAGEMENT | PROGRESS | COMPLETE_ASSESSMENT | GROUP
//   ?noteStyle=        → filter by SOAP | DAP | HPI | GROUP | ...
//   ?status=           → filter by DRAFT | SIGNED | AMENDED
router.post("/", restrict("note", "create"), createNote);
router.get("/", restrict("note", "read"), getNotes);
router.get("/:id", restrict("note", "read"), getNote);
router.patch("/:id", restrict("note", "update"), updateNote);

// ─── Sign a note ──────────────────────────────────────────────────────────────
// POST /notes/:id/sign — only the original author can sign their own DRAFT note
router.post("/:id/sign", restrict("note", "update"), signNote);

// ─── Revision history (HIPAA audit trail) ────────────────────────────────────
// GET /notes/:id/revisions — returns full git-like amendment history
router.get("/:id/revisions", restrict("note", "read"), getNoteRevisions);

export default router;
