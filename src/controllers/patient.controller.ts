import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/response";

export const createPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, dateOfBirth, gender, phone, email, address, assignedStaffId, metadata } = req.body;

        if (!firstName || !lastName) {
            return sendError({ res, statusCode: 400, message: "Please provide at least firstName and lastName." });
        }

        // Validate assignedStaffId if provided
        if (assignedStaffId) {
            const staff = await prisma.staff.findUnique({ where: { id: assignedStaffId } });
            if (!staff) {
                return sendError({ res, statusCode: 404, message: "Assigned staff member not found." });
            }
        }

        // Create patient + folder atomically so both always exist together
        const result = await prisma.$transaction(async (tx: { patientFolder: { count: () => never; create: (arg0: { data: { folderNumber: string; patientId: any; }; }) => any; }; patient: { create: (arg0: { data: { firstName: any; lastName: any; dateOfBirth: Date | null; gender: any; phone: any; email: any; address: any; assignedStaffId: any; metadata: any; status: string; }; }) => any; }; }) => {
            // Generate next folder number inside the transaction
            const folderCount = tx.patientFolder.count();
            const folderNumber = `PAT-${String(folderCount + 1).padStart(4, "0")}`;

            // Create the patient record
            const patient = await tx.patient.create({
                data: {
                    firstName,
                    lastName,
                    dateOfBirth: (dateOfBirth && dateOfBirth !== "") ? new Date(dateOfBirth) : null,
                    gender,
                    phone,
                    email,
                    address,
                    assignedStaffId: assignedStaffId || null,
                    metadata: metadata || {},
                    status: "active",
                },
            });

            // Immediately create the patient's folder
            const folder = await tx.patientFolder.create({
                data: {
                    folderNumber,
                    patientId: patient.id,
                },
            });

            return { ...patient, folder };
        });

        sendSuccess({
            res,
            statusCode: 201,
            message: "Patient registered successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getPatients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const patients = await prisma.patient.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                assignedStaff: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                },
                folder: {
                    select: {
                        folderNumber: true,
                    }
                },
            }
        });

        sendSuccess({ res, data: patients });
    } catch (error) {
        next(error);
    }
};

export const getPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;

        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                assignedStaff: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                folder: {
                    select: {
                        folderNumber: true,
                        id: true,
                        createdAt: true,
                    }
                },
                enrollments: {
                    include: {
                        program: {
                            select: {
                                id: true,
                                name: true,
                                programType: true,
                                status: true,
                            }
                        }
                    },
                    orderBy: { enrolledAt: "desc" }
                }
            }
        });

        if (!patient) {
            return sendError({ res, statusCode: 404, message: "Patient not found." });
        }

        sendSuccess({ res, data: patient });
    } catch (error) {
        next(error);
    }
};
