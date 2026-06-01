import fs from "fs";
import path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// Storage Abstraction Layer
// ─────────────────────────────────────────────────────────────────────────────
// This module abstracts all file storage operations. In development, files are
// saved to the local `uploads/` directory. When moving to production, replace
// the implementations below with AWS S3 SDK calls — the controller code stays
// unchanged because it only calls these functions.
//
// S3 swap checklist (when ready):
//   1. Install: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
//   2. Replace `saveFile()` → s3Client.send(new PutObjectCommand(...))
//   3. Replace `deleteFile()` → s3Client.send(new DeleteObjectCommand(...))
//   4. Replace `getFileUrl()` → getSignedUrl(s3Client, new GetObjectCommand(...), { expiresIn: 900 })
//   5. Remove multer diskStorage config in upload.middleware.ts → use memoryStorage instead
//   6. Add AWS env vars: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME
// ─────────────────────────────────────────────────────────────────────────────

export interface StoredFile {
    /** Storage key — relative path on disk (dev) or S3 object key (prod) */
    fileKey: string;
    /** Publicly or presign-accessible URL to retrieve the file */
    fileUrl: string;
}

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

/**
 * Ensures the uploads directory (and any subdirectories) exist.
 */
export function ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Builds the patient-scoped storage path for a file.
 * Structure: uploads/patients/{patientId}/{category}/{filename}
 *
 * This mirrors what the S3 key prefix will look like in production.
 */
export function buildStoragePath(patientId: string, category: string, filename: string): string {
    const sanitisedCategory = category.toLowerCase().replace(/_/g, "-");
    return path.join("patients", patientId, sanitisedCategory, filename);
}

/**
 * Returns the full absolute disk path for a given storage key.
 * In production, this is replaced by an S3 presigned URL generator.
 */
export function getAbsolutePath(fileKey: string): string {
    return path.join(UPLOADS_ROOT, fileKey);
}

/**
 * Returns the HTTP URL by which the file can be accessed.
 * In development this is a local Express static route.
 * In production, replace with a presigned S3 URL (15-minute expiry recommended).
 */
export function getFileUrl(fileKey: string): string {
    const baseUrl = process.env.API_BASE_URL ?? "http://localhost:5000";
    // fileKey uses OS separators on Windows — normalise to forward slashes for URLs
    const urlPath = fileKey.replace(/\\/g, "/");
    return `${baseUrl}/uploads/${urlPath}`;
}

/**
 * Deletes a file from local disk.
 * In production, replace with: s3Client.send(new DeleteObjectCommand({ Bucket, Key }))
 */
export function deleteFile(fileKey: string): void {
    const absolutePath = getAbsolutePath(fileKey);
    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
}

/**
 * Ensures the root uploads directory exists on startup.
 * Call this once when the server boots.
 */
export function initStorage(): void {
    ensureDir(UPLOADS_ROOT);
    console.log(`📁  Local file storage initialised at: ${UPLOADS_ROOT}`);
}
