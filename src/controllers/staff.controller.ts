import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { PermissionAction, Resource, StaffRole } from "../types";

// Helper to generate a random 8-character temporary password
const generateTempPassword = () => {
    return "BLES-" + crypto.randomBytes(4).toString("hex").substring(0, 6);
};

export const createStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, email, role, permissions } = req.body;

        if (!firstName || !lastName || !email) {
            return sendError({ res, statusCode: 400, message: "Please provide firstName, lastName, and email." });
        }

        // Check if staff already exists
        const existingStaff = await prisma.staff.findUnique({ where: { email } });
        if (existingStaff) {
            return sendError({ res, statusCode: 409, message: "A staff member with this email already exists." });
        }

        const tempPassword = generateTempPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        // Prepare permissions if provided
        const staffPermissions = permissions && Array.isArray(permissions) ? permissions.map((p: any) => ({
            resource: p.resource as Resource,
            action: p.action as PermissionAction,
        })) : [];

        const staff = await prisma.staff.create({
            data: {
                firstName,
                lastName,
                email,
                role: (role as StaffRole) || "STAFF",
                passwordHash,
                requiresPinSetup: true,
                isActive: true,
                permissions: {
                    create: staffPermissions,
                },
            },
            include: {
                permissions: true,
            },
        });

        // Remove password hash from response
        const { passwordHash: _, ...safeStaff } = staff;

        // TODO: Audit logging for HIPAA compliance (Report Module)
        // e.g., logAction({ user: req.staff.id, action: "CREATED_STAFF", target: staff.id })

        sendSuccess({
            res,
            statusCode: 201,
            message: "Staff member created successfully.",
            data: {
                staff: safeStaff,
                tempPassword, // Return the plain-text temp password so the creator can share it
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getStaffs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const staffs = await prisma.staff.findMany({
            where: { isActive: true }, // By default only return active staff
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isActive: true,
                metadata: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });

        sendSuccess({ res, data: staffs });
    } catch (error) {
        next(error);
    }
};

export const getStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;

        const staff = await prisma.staff.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isActive: true,
                metadata: true,
                lastLoginAt: true,
                createdAt: true,
                permissions: true,
            },
        });

        if (!staff) {
            return sendError({ res, statusCode: 404, message: "Staff member not found." });
        }

        sendSuccess({ res, data: staff });
    } catch (error) {
        next(error);
    }
};

export const updateStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { firstName, lastName, role, isActive, metadata, permissions } = req.body;

        const existingStaff = await prisma.staff.findUnique({ where: { id } });
        if (!existingStaff) {
            return sendError({ res, statusCode: 404, message: "Staff member not found." });
        }

        // We use a transaction if permissions are being updated
        const updateData: any = {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(role && { role }),
            ...(isActive !== undefined && { isActive }),
            ...(metadata && { metadata }),
        };

        if (permissions && Array.isArray(permissions)) {
            // Overwrite permissions: delete existing and create new
            await prisma.$transaction([
                prisma.staffPermission.deleteMany({ where: { staffId: id } }),
                prisma.staff.update({
                    where: { id },
                    data: {
                        ...updateData,
                        permissions: {
                            create: permissions.map((p: any) => ({
                                resource: p.resource as Resource,
                                action: p.action as PermissionAction,
                            })),
                        },
                    },
                })
            ]);
        } else {
            await prisma.staff.update({
                where: { id },
                data: updateData,
            });
        }

        // TODO: Audit logging for HIPAA compliance (Report Module)
        // e.g., logAction({ user: req.staff.id, action: "UPDATED_STAFF", target: id })

        sendSuccess({ res, message: "Staff member updated successfully." });
    } catch (error) {
        next(error);
    }
};

export const deleteStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;

        // Soft Delete: We do NOT delete the record. We just set isActive to false.
        // This is a strict HIPAA requirement to maintain referential integrity for audit logs.
        await prisma.staff.update({
            where: { id },
            data: { isActive: false },
        });

        // TODO: Audit logging for HIPAA compliance (Report Module)
        // e.g., logAction({ user: req.staff.id, action: "DEACTIVATED_STAFF", target: id })

        sendSuccess({ res, message: "Staff member has been soft deleted (deactivated)." });
    } catch (error) {
        next(error);
    }
};
