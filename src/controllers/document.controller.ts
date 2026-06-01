import { Response, NextFunction } from "express";
import path from "path";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { buildStoragePath, deleteFile, getFileUrl } from "../utils/storage";
import { AuthRequest } from "../types";

// ─── Upload / Register a Document ─────────────────────────────────────────────
// Accepts a multipart/form-data POST with:
//   field "file"     — the binary file (handled by multer upload middleware)
//   body  "category" — DocumentCategory enum value (optional, defaults to OTHER)
//   body  "description" — optional human-readable note about the document
export const createDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { patientFolderId } = req.params as { patientFolderId: string };

        // multer attaches the uploaded file to req.file
        if (!req.file) {
            return sendError({ res, statusCode: 400, message: "No file provided. Send the file in the 'file' form field." });
        }

        const { category, description, metadata } = req.body;
        const patientId = (req as any).resolvedPatientId as string; // set by upload.middleware.ts

        // Build the storage key (relative path) from where multer saved the file
        const relativePath = buildStoragePath(
            patientId,
            category || "other",
            path.basename(req.file.path)
        );

        const fileKey = relativePath;
        const fileUrl  = getFileUrl(fileKey);

        const document = await prisma.document.create({
            data: {
                patientFolderId,
                uploadedById: req.staff!.id,
                fileName:     req.file.originalname,
                fileKey,
                fileUrl,
                mimeType:     req.file.mimetype,
                fileSizeBytes: req.file.size,
                category:     category || "OTHER",
                description:  description || null,
                metadata:     metadata ? JSON.parse(metadata) : {},
            },
            include: {
                uploadedBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        sendSuccess({ res, statusCode: 201, message: "Document uploaded successfully.", data: document });
    } catch (error) {
        next(error);
    }
};

// ─── Get All Documents for a Patient Folder ────────────────────────────────────
export const getDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { patientFolderId } = req.params as { patientFolderId: string };
        const { category } = req.query as Record<string, string | undefined>;

        const folder = await prisma.patientFolder.findUnique({ where: { id: patientFolderId } });
        if (!folder) {
            return sendError({ res, statusCode: 404, message: "Patient folder not found." });
        }

        const documents = await prisma.document.findMany({
            where: {
                patientFolderId,
                ...(category && { category: category as any }),
            },
            include: {
                uploadedBy: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        sendSuccess({ res, data: documents });
    } catch (error) {
        next(error);
    }
};

// ─── Get Single Document ──────────────────────────────────────────────────────
export const getDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };

        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                uploadedBy: { select: { id: true, firstName: true, lastName: true } },
                folder: { select: { id: true, folderNumber: true } },
            },
        });

        if (!document) {
            return sendError({ res, statusCode: 404, message: "Document not found." });
        }

        sendSuccess({ res, data: document });
    } catch (error) {
        next(error);
    }
};

// ─── Update Document Metadata ──────────────────────────────────────────────────
// Only category and description can be updated — the file itself is immutable.
export const updateDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };
        const { category, description, metadata } = req.body;

        const document = await prisma.document.findUnique({ where: { id } });
        if (!document) {
            return sendError({ res, statusCode: 404, message: "Document not found." });
        }

        const updated = await prisma.document.update({
            where: { id },
            data: {
                ...(category && { category }),
                ...(description !== undefined && { description }),
                ...(metadata && { metadata }),
            },
        });

        sendSuccess({ res, message: "Document updated successfully.", data: updated });
    } catch (error) {
        next(error);
    }
};

// ─── Delete Document ──────────────────────────────────────────────────────────
// Deletes both the DB record AND the physical file from local disk.
// In production: replace deleteFile() with S3 DeleteObjectCommand.
export const deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };

        const document = await prisma.document.findUnique({ where: { id } });
        if (!document) {
            return sendError({ res, statusCode: 404, message: "Document not found." });
        }

        // Delete from DB first, then clean up from storage
        await prisma.document.delete({ where: { id } });
        deleteFile(document.fileKey); // local disk (swap to S3 DeleteObjectCommand in prod)

        sendSuccess({ res, message: "Document deleted successfully." });
    } catch (error) {
        next(error);
    }
};
