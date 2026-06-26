import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { hasPermission, PERMISSION_LEVELS } from '@/lib/auth/permissions';
import { storageService } from '@/lib/storage';
import { getSupabase } from '@/lib/supabase';
import { DocumentType, FileType } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Find the folder by folderId (not the UUID id)
    const folder = await prisma.folder.findUnique({
      where: { folderId },
      include: {
        patient: true,
        documents: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!folder) {
      return NextResponse.json({ message: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({ folder, patient: folder.patient, documents: folder.documents }, { status: 200 });
  } catch (error) {
    console.error('GET /api/folders/[folderId] error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}

function getFileType(mimeType: string, fileName: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'pdf': return FileType.PDF;
    case 'doc': return FileType.DOC;
    case 'docx': return FileType.DOCX;
    case 'xls': return FileType.XLS;
    case 'xlsx': return FileType.XLSX;
    case 'png': return FileType.PNG;
    case 'jpg': return FileType.JPG;
    case 'jpeg': return FileType.JPEG;
    case 'txt': return FileType.TXT;
    case 'webm':
    case 'mp3':
    case 'wav':
    case 'm4a':
    case 'mp4': return FileType.AUDIO;
    default: return FileType.OTHER;
  }
}

function getDocumentTypeFromFolder(folderName: string): DocumentType {
  const name = folderName.toLowerCase();
  if (name.includes('clinic')) return DocumentType.CLINIC_NOTES;
  if (name.includes('compliance')) return DocumentType.COMPLIANCE;
  if (name.includes('billing')) return DocumentType.BILLING;
  if (name.includes('session') || name.includes('recording')) return DocumentType.SESSION_RECORDINGS;
  return DocumentType.GENERAL;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has cn[4] permission (WRITE level)
    if (!hasPermission(user as any, 'cn', PERMISSION_LEVELS.WRITE)) {
      return NextResponse.json(
        { message: 'You do not have permission to upload files' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentName = formData.get('documentName') as string;
    const documentTypeInput = formData.get('documentType') as string;
    const sessionId = formData.get('sessionId') as string || null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // Find the folder
    const folder = await prisma.folder.findUnique({
      where: { folderId }
    });

    if (!folder) {
      return NextResponse.json({ message: 'Folder not found' }, { status: 404 });
    }

    // Determine document type
    let documentType: DocumentType;
    if (documentTypeInput && Object.values(DocumentType).includes(documentTypeInput as DocumentType)) {
      documentType = documentTypeInput as DocumentType;
    } else {
      documentType = getDocumentTypeFromFolder(folder.name);
    }

    // Determine file type
    const fileType = getFileType(file.type, file.name);

    // Upload to Supabase storage
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ message: 'Storage not configured' }, { status: 500 });
    }

    // Generate unique file name to avoid conflicts
    const uniqueId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const storagePathInfo = storageService.getPatientStoragePath(
      folder.patientId,
      documentType,
      `${uniqueId}-${file.name}`
    );

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(storagePathInfo.bucket)
      .upload(storagePathInfo.path, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { message: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Generate document ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const docId = `DOC-${randomNum}`;

    // Create document record
    const document = await prisma.document.create({
      data: {
        documentId: docId,
        name: documentName || file.name,
        fileType,
        documentType,
        patientId: folder.patientId,
        folderId: folder.id,
        fileSize: file.size,
        mimeType: file.type,
        storagePath: storagePathInfo.path,
        uploadedById: user.id,
        sessionId: sessionId || null,
      }
    });

    // Log to audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        modelName: 'Document',
        recordId: document.id,
        changes: {
          name: document.name,
          documentType: document.documentType,
          fileType: document.fileType,
        },
        performedById: user.id,
      }
    });

    return NextResponse.json({ document, message: 'File uploaded successfully' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/folders/[folderId] error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
