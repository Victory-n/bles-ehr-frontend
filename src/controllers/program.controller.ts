import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../types";

// ─── Create Program ───────────────────────────────────────────────────────────
export const createProgram = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {
            name,
            description,
            category,
            programType,
            totalSessions,
            durationMonths,
            frequency,
            maxEnrollment,
            startDate,
            endDate,
            metadata
        } = req.body;

        if (!name) {
            return sendError({ res, statusCode: 400, message: "Program name is required." });
        }

        const program = await prisma.program.create({
            data: {
                name,
                description: description || null,
                category: category || null,
                programType: programType || "GROUP",
                totalSessions: totalSessions ? parseInt(totalSessions, 10) : null,
                durationMonths: durationMonths ? parseInt(durationMonths, 10) : null,
                frequency: frequency || null,
                maxEnrollment: maxEnrollment ? parseInt(maxEnrollment, 10) : null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                createdById: req.staff!.id,
                metadata: metadata || {},
            },
            include: {
                createdBy: {
                    select: { id: true, firstName: true, lastName: true },
                },
                _count: { select: { enrollments: true } },
            },
        });

        sendSuccess({ res, statusCode: 201, message: "Program created successfully.", data: program });
    } catch (error) {
        next(error);
    }
};

// ─── Get All Programs ─────────────────────────────────────────────────────────
export const getPrograms = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { status, programType } = req.query as Record<string, string | undefined>;

        const programs = await prisma.program.findMany({
            where: {
                ...(status && { status: status as any }),
                ...(programType && { programType: programType as any }),
            },
            include: {
                createdBy: {
                    select: { id: true, firstName: true, lastName: true },
                },
                _count: { select: { enrollments: true, notes: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        sendSuccess({ res, data: programs });
    } catch (error) {
        next(error);
    }
};

// ─── Get Single Program ───────────────────────────────────────────────────────
export const getProgram = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };

        const program = await prisma.program.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, firstName: true, lastName: true },
                },
                enrollments: {
                    include: {
                        patient: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                dateOfBirth: true,
                                status: true,
                                folder: { select: { folderNumber: true } },
                            },
                        },
                    },
                    orderBy: { enrolledAt: "desc" },
                },
                _count: { select: { notes: true } },
            },
        });

        if (!program) {
            return sendError({ res, statusCode: 404, message: "Program not found." });
        }

        sendSuccess({ res, data: program });
    } catch (error) {
        next(error);
    }
};

// ─── Update Program ───────────────────────────────────────────────────────────
export const updateProgram = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as { id: string };
        const { 
            name, description, status, programType, 
            category, totalSessions, durationMonths, frequency, maxEnrollment, 
            startDate, endDate, metadata 
        } = req.body;

        const existing = await prisma.program.findUnique({ where: { id } });
        if (!existing) {
            return sendError({ res, statusCode: 404, message: "Program not found." });
        }

        // Merge existing metadata with new metadata
        let mergedMetadata = existing.metadata as Record<string, any>;
        if (metadata) {
            mergedMetadata = { ...mergedMetadata, ...metadata };
        }

        const updated = await prisma.program.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(status && { status }),
                ...(programType && { programType }),
                ...(category !== undefined && { category: category || null }),
                ...(totalSessions !== undefined && { totalSessions: totalSessions ? parseInt(totalSessions, 10) : null }),
                ...(durationMonths !== undefined && { durationMonths: durationMonths ? parseInt(durationMonths, 10) : null }),
                ...(frequency !== undefined && { frequency: frequency || null }),
                ...(maxEnrollment !== undefined && { maxEnrollment: maxEnrollment ? parseInt(maxEnrollment, 10) : null }),
                ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                ...(metadata && { metadata: mergedMetadata }),
            },
        });

        sendSuccess({ res, message: "Program updated successfully.", data: updated });
    } catch (error) {
        next(error);
    }
};

// ─── Enroll Patient into Program ──────────────────────────────────────────────
export const enrollPatient = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id: programId } = req.params as { id: string };
        const { patientId } = req.body;

        if (!patientId) {
            return sendError({ res, statusCode: 400, message: "patientId is required." });
        }

        // Verify program exists
        const program = await prisma.program.findUnique({ where: { id: programId as string } });
        if (!program) {
            return sendError({ res, statusCode: 404, message: "Program not found." });
        }

        // Verify patient exists
        const patient = await prisma.patient.findUnique({ where: { id: patientId as string } });
        if (!patient) {
            return sendError({ res, statusCode: 404, message: "Patient not found." });
        }

        // Check if already enrolled
        const existing = await prisma.programEnrollment.findUnique({
            where: { programId_patientId: { programId, patientId } },
        });

        if (existing) {
            // If previously discharged, re-activate
            if (existing.status !== "ACTIVE") {
                const reactivated = await prisma.programEnrollment.update({
                    where: { id: existing.id },
                    data: { status: "ACTIVE", dischargedAt: null },
                });
                return sendSuccess({ res, message: "Patient re-enrolled in program.", data: reactivated });
            }
            return sendError({ res, statusCode: 409, message: "Patient is already actively enrolled in this program." });
        }

        const enrollment = await prisma.programEnrollment.create({
            data: { programId, patientId },
            include: {
                patient: {
                    select: { id: true, firstName: true, lastName: true, folder: { select: { folderNumber: true } } },
                },
            },
        });

        sendSuccess({ res, statusCode: 201, message: "Patient enrolled successfully.", data: enrollment });
    } catch (error) {
        next(error);
    }
};

// ─── Remove / Discharge Patient from Program ──────────────────────────────────
export const dischargePatient = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id: programId, patientId } = req.params as { id: string; patientId: string };

        const enrollment = await prisma.programEnrollment.findUnique({
            where: { programId_patientId: { programId, patientId } },
        });

        if (!enrollment) {
            return sendError({ res, statusCode: 404, message: "Enrollment not found." });
        }

        if (enrollment.status !== "ACTIVE") {
            return sendError({ res, statusCode: 400, message: "Patient is not actively enrolled in this program." });
        }

        await prisma.programEnrollment.update({
            where: { id: enrollment.id },
            data: { status: "DISCHARGED", dischargedAt: new Date() },
        });

        sendSuccess({ res, message: "Patient discharged from program." });
    } catch (error) {
        next(error);
    }
};
