// lib/services/documentService.ts
import { prisma } from "../prisma";
import { uploadPatientDocument, deleteDocument } from "../storage";
import { nanoid } from "nanoid"; // or crypto.randomUUID()

export async function createDocument({
                                         file,
                                         fileName,
                                         mimeType,
                                         fileSize,
                                         patientId,
                                         uploadedById,
                                         docType,
                                         folder,
                                     }: {
    file: Buffer;
    fileName: string;
    mimeType: string;
    fileSize: number;
    patientId: string;
    uploadedById: string;
    docType: string;
    folder: "documents" | "clinic-notes" | "compliance";
}) {
    // 1. Upload to Supabase Storage
    const { path } = await uploadPatientDocument(
        patientId, folder, file, fileName, mimeType
    );

    // 2. Save metadata to database
    const doc = await prisma.document.create({
        data: {
            documentId: `DOC-${nanoid(8).toUpperCase()}`,
            name: fileName,
            type: docType,
            filePath: path,      // the storage path
            patientId,
            uploadedById,
        },
    });

    return doc;
}

export async function deleteDocumentById(documentId: string) {
    const doc = await prisma.document.findUnique({
        where: { documentId }
    });
    if (!doc) throw new Error("Document not found");

    // 1. Delete from storage
    await deleteDocument(doc.filePath);

    // 2. Soft delete in DB (you already have deletedAt)
    return prisma.document.update({
        where: { documentId },
        data: { deletedAt: new Date() }
    });
}
