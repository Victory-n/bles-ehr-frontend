import multer, { FileFilterCallback } from "multer";
import path from "path";
import crypto from "crypto";
import { Request } from "express";
import { buildStoragePath, ensureDir, getAbsolutePath } from "../utils/storage";
import { prisma } from "../config/prisma";

// ─── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES: Record<string, string> = {
    "application/pdf":                                      ".pdf",
    "image/jpeg":                                           ".jpg",
    "image/png":                                            ".png",
    "image/webp":                                           ".webp",
    "application/msword":                                   ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel":                             ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
};

// Max file size: 20 MB
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

// ─── Multer disk storage ──────────────────────────────────────────────────────
// Files are organised under uploads/patients/{patientId}/{category}/
// When switching to S3: replace diskStorage with memoryStorage and upload the
// buffer to S3 inside the controller before calling prisma.document.create().

const storage = multer.diskStorage({
    destination: async (req: Request, _file, cb) => {
        try {
            // Resolve the patient ID from the folder
            const { patientFolderId } = req.params as { patientFolderId: string };
            const category = (req.body.category ?? "other") as string;

            const folder = await prisma.patientFolder.findUnique({
                where: { id: patientFolderId },
                select: { patientId: true },
            });

            if (!folder) {
                return cb(new Error("Patient folder not found."), "");
            }

            const relativePath = buildStoragePath(folder.patientId, category, "");
            const absoluteDir = getAbsolutePath(relativePath);

            ensureDir(absoluteDir);
            // Attach patientId to the request for use in the controller
            (req as any).resolvedPatientId = folder.patientId;
            cb(null, absoluteDir);
        } catch (err: any) {
            cb(err, "");
        }
    },

    filename: (_req, file, cb) => {
        // Generate a unique filename: {timestamp}-{randomHex}{ext}
        const ext = path.extname(file.originalname).toLowerCase()
            || (ALLOWED_MIME_TYPES[file.mimetype] ?? "");
        const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
        cb(null, uniqueName);
    },
});

// ─── File filter ──────────────────────────────────────────────────────────────
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error(
            `Unsupported file type: ${file.mimetype}. ` +
            `Allowed types: PDF, JPEG, PNG, WEBP, DOC, DOCX, XLS, XLSX.`
        ));
    }
};

// ─── Export configured multer instance ───────────────────────────────────────
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
});
