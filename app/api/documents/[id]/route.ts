import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getSupabase } from "@/lib/supabase";
import { storageService } from "@/lib/storage";

/** Map MIME types to the correct file extension. */
const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "text/plain": ".txt",
};

/** Map FileType enum values to the correct file extension. */
const FILETYPE_TO_EXT: Record<string, string> = {
  PDF: ".pdf",
  DOC: ".doc",
  DOCX: ".docx",
  XLS: ".xls",
  XLSX: ".xlsx",
  PNG: ".png",
  JPG: ".jpg",
  JPEG: ".jpeg",
  TXT: ".txt",
};

/**
 * Ensures the filename has a proper extension.
 * Priority: existing extension on name → mimeType map → fileType enum map.
 */
function ensureExtension(name: string, mimeType: string | null, fileType: string): string {
  // If the name already has a recognised extension, leave it alone
  const hasExt = /\.[a-zA-Z0-9]{2,5}$/.test(name);
  if (hasExt) return name;

  // Try to derive from mimeType first
  if (mimeType && MIME_TO_EXT[mimeType]) {
    return name + MIME_TO_EXT[mimeType];
  }

  // Fall back to the FileType enum stored in the DB
  if (FILETYPE_TO_EXT[fileType]) {
    return name + FILETYPE_TO_EXT[fileType];
  }

  return name;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the document in the database
    const document = await prisma.document.findFirst({
      where: {
        OR: [{ id }, { documentId: id }],
        deletedAt: null,
      },
    });

    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    // Audit: log the download action (fire-and-forget — never block the download)
    prisma.auditLog.create({
      data: {
        action: "DOWNLOAD",
        modelName: "Document",
        recordId: document.id,
        changes: {
          documentId: document.documentId,
          documentName: document.name,
          documentType: document.documentType,
          fileType: document.fileType,
          patientId: document.patientId,
        },
        performedById: user.id,
      },
    }).catch((err) => console.error("Audit log failed for document download:", err));

    const supabase = getSupabase();
    if (!supabase) {
      // Fallback for local development when Supabase configuration is not present
      const mockFileName = ensureExtension(document.name, document.mimeType, document.fileType);
      const mockContent = `Mock file content for: ${document.name}\nSize: ${document.fileSize || "unknown"} bytes\nThis file is served as a local fallback since Supabase storage is not configured.`;
      return new NextResponse(mockContent, {
        headers: {
          "Content-Type": document.mimeType || "text/plain",
          "Content-Disposition": `attachment; filename="${mockFileName}"`,
        },
      });
    }

    // Download file from Supabase storage
    const { data, error } = await supabase.storage
      .from(storageService.PATIENT_FOLDERS_BUCKET)
      .download(document.storagePath);

    if (error || !data) {
      console.error("Supabase storage download error:", error);
      return NextResponse.json(
        { message: "Failed to download document from storage" },
        { status: 500 }
      );
    }

    // Send the file data back to the client
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const downloadFileName = ensureExtension(document.name, document.mimeType, document.fileType);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": document.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${downloadFileName}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/documents/[id] error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
