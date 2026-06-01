import { Router } from "express";
import { protect, restrict } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import {
    createDocument,
    getDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
} from "../controllers/document.controller";

const router = Router();

router.use(protect);

// ─── Documents scoped to a patient folder ─────────────────────────────────────
// POST   /documents/folder/:patientFolderId
//   → multipart/form-data with field "file" + optional body fields:
//       category    (DocumentCategory, defaults to OTHER)
//       description (string, optional)
//
// GET    /documents/folder/:patientFolderId
//   → query: ?category=CONSENT_FORM (optional filter)

router.post(
    "/folder/:patientFolderId",
    restrict("document", "create"),
    upload.single("file"),         // multer processes the upload before the controller
    createDocument
);

router.get(
    "/folder/:patientFolderId",
    restrict("document", "read"),
    getDocuments
);

// ─── Individual document operations ───────────────────────────────────────────
router.get("/:id",    restrict("document", "read"),   getDocument);
router.patch("/:id",  restrict("document", "update"), updateDocument);
router.delete("/:id", restrict("document", "delete"), deleteDocument);

export default router;
