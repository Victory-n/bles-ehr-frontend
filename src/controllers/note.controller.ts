import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Computes a structured diff between two JSON content objects.
 * Returns an array of { field, from, to } for every field that changed.
 */
function computeDiff(
    previous: Record<string, any>,
    next: Record<string, any>
): Array<{ field: string; from: any; to: any }> {
    const allKeys = new Set([...Object.keys(previous), ...Object.keys(next)]);
    const diff: Array<{ field: string; from: any; to: any }> = [];

    for (const key of allKeys) {
        const prev = previous[key] ?? null;
        const curr = next[key] ?? null;
        if (JSON.stringify(prev) !== JSON.stringify(curr)) {
            diff.push({ field: key, from: prev, to: curr });
        }
    }
    return diff;
}

/**
 * Validates that at least one context FK is provided for a note.
 */
function validateNoteContext(
    patientFolderId?: string,
    programId?: string,
    enrollmentId?: string
): boolean {
    return !!(patientFolderId || programId || enrollmentId);
}

// ─── Create Clinical Note ─────────────────────────────────────────────────────
export const createNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {
            patientFolderId,
            programId,
            enrollmentId,
            noteType,
            noteStyle,
            sessionDate,
            content,
            metadata,
        } = req.body;

        if (!noteType || !noteStyle || !sessionDate) {
            return sendError({
                res,
                statusCode: 400,
                message: "noteType, noteStyle, and sessionDate are required.",
            });
        }

        if (!validateNoteContext(patientFolderId, programId, enrollmentId)) {
            return sendError({
                res,
                statusCode: 400,
                message: "At least one context is required: patientFolderId, programId, or enrollmentId.",
            });
        }

        // Verify folder exists if provided
        if (patientFolderId) {
            const folder = await prisma.patientFolder.findUnique({ where: { id: patientFolderId as string } });
            if (!folder) return sendError({ res, statusCode: 404, message: "Patient folder not found." });
        }

        // Verify program exists if provided
        if (programId) {
            const program = await prisma.program.findUnique({ where: { id: programId as string } });
            if (!program) return sendError({ res, statusCode: 404, message: "Program not found." });
        }

        // Verify enrollment exists if provided
        if (enrollmentId) {
            const enrollment = await prisma.programEnrollment.findUnique({ where: { id: enrollmentId as string } });
            if (!enrollment) return sendError({ res, statusCode: 404, message: "Enrollment not found." });
        }

        const note = await prisma.clinicalNote.create({
            data: {
                patientFolderId: patientFolderId || null,
                programId: programId || null,
                enrollmentId: enrollmentId || null,
                authorId: req.staff!.id,
                noteType,
                noteStyle,
                sessionDate: new Date(sessionDate),
                content: content || {},
                metadata: metadata || {},
                status: "DRAFT",
            },
            include: {
                author: { select: { id: true, firstName: true, lastName: true } },
                folder: { select: { id: true, folderNumber: true } },
                program: { select: { id: true, name: true } },
            },
        });

        sendSuccess({ res, statusCode: 201, message: "Clinical note created successfully.", data: note });
    } catch (error) {
        next(error);
    }
};

// ─── Get Notes (with flexible filtering) ─────────────────────────────────────
export const getNotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {
            patientFolderId,
            programId,
            enrollmentId,
            noteType,
            noteStyle,
            status,
        } = req.query as Record<string, string | undefined>;

        const notes = await prisma.clinicalNote.findMany({
            where: {
                ...(patientFolderId && { patientFolderId }),
                ...(programId && { programId }),
                ...(enrollmentId && { enrollmentId }),
                ...(noteType && { noteType: noteType as any }),
                ...(noteStyle && { noteStyle: noteStyle as any }),
                ...(status && { status: status as any }),
            },
            include: {
                author: { select: { id: true, firstName: true, lastName: true } },
                folder: { select: { id: true, folderNumber: true } },
                program: { select: { id: true, name: true } },
                _count: { select: { noteRevisions: true } },
            },
            orderBy: { sessionDate: "desc" },
        });

        sendSuccess({ res, data: notes });
    } catch (error) {
        next(error);
    }
};

// ─── Get Single Note (with full revision history) ─────────────────────────────
export const getNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };

        const note = await prisma.clinicalNote.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, firstName: true, lastName: true } },
                folder: { select: { id: true, folderNumber: true } },
                program: { select: { id: true, name: true } },
                enrollment: { select: { id: true, patientId: true } },
                noteRevisions: {
                    include: {
                        changedBy: { select: { id: true, firstName: true, lastName: true } },
                    },
                    orderBy: { versionNumber: "asc" },
                },
            },
        });

        if (!note) {
            return sendError({ res, statusCode: 404, message: "Note not found." });
        }

        sendSuccess({ res, data: note });
    } catch (error) {
        next(error);
    }
};

// ─── Update / Amend Note ──────────────────────────────────────────────────────
// If the note is DRAFT  → update content directly (no revision created).
// If the note is SIGNED → create a NoteRevision (HIPAA audit trail), then update.
// AMENDED notes follow the same SIGNED path.
export const updateNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };
        const { content, sessionDate, amendmentReason } = req.body;

        const note = await prisma.clinicalNote.findUnique({ where: { id } });
        if (!note) {
            return sendError({ res, statusCode: 404, message: "Note not found." });
        }

        // Signed/Amended notes require an amendment reason (HIPAA)
        if ((note.status === "SIGNED" || note.status === "AMENDED") && !amendmentReason) {
            return sendError({
                res,
                statusCode: 400,
                message: "An amendment reason is required when editing a signed note.",
            });
        }

        if (note.status === "SIGNED" || note.status === "AMENDED") {
            // Get next version number
            const revisionCount = await prisma.noteRevision.count({ where: { noteId: id } });

            const previousContent = note.content as Record<string, any>;
            const nextContent = content ?? previousContent;
            const diff = computeDiff(previousContent, nextContent);

            // Atomically: create revision record + update note content
            await prisma.$transaction([
                prisma.noteRevision.create({
                    data: {
                        noteId: id,
                        versionNumber: revisionCount + 1,
                        changedById: req.staff!.id,
                        previousContent: previousContent,
                        diff,
                        amendmentReason: amendmentReason || null,
                    },
                }),
                prisma.clinicalNote.update({
                    where: { id },
                    data: {
                        content: nextContent,
                        status: "AMENDED",
                        ...(sessionDate && { sessionDate: new Date(sessionDate) }),
                    },
                }),
            ]);

            return sendSuccess({ res, message: "Note amended. Revision record created for audit trail." });
        }

        // DRAFT — direct update, no revision needed
        await prisma.clinicalNote.update({
            where: { id },
            data: {
                ...(content && { content }),
                ...(sessionDate && { sessionDate: new Date(sessionDate) }),
            },
        });

        sendSuccess({ res, message: "Note updated successfully." });
    } catch (error) {
        next(error);
    }
};

// ─── Sign a Note ──────────────────────────────────────────────────────────────
export const signNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };

        const note = await prisma.clinicalNote.findUnique({ where: { id } });
        if (!note) {
            return sendError({ res, statusCode: 404, message: "Note not found." });
        }

        if (note.status !== "DRAFT") {
            return sendError({ res, statusCode: 400, message: "Only DRAFT notes can be signed." });
        }

        // Only the original author can sign their own note
        if (note.authorId !== req.staff!.id) {
            return sendError({ res, statusCode: 403, message: "You can only sign notes that you authored." });
        }

        await prisma.clinicalNote.update({
            where: { id },
            data: { status: "SIGNED", signedAt: new Date() },
        });

        sendSuccess({ res, message: "Note signed successfully." });
    } catch (error) {
        next(error);
    }
};

// ─── Get Note Revision History ─────────────────────────────────────────────────
export const getNoteRevisions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };

        const note = await prisma.clinicalNote.findUnique({ where: { id }, select: { id: true } });
        if (!note) {
            return sendError({ res, statusCode: 404, message: "Note not found." });
        }

        const revisions = await prisma.noteRevision.findMany({
            where: { noteId: id },
            include: {
                changedBy: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { versionNumber: "asc" },
        });

        sendSuccess({ res, data: revisions });
    } catch (error) {
        next(error);
    }
};
