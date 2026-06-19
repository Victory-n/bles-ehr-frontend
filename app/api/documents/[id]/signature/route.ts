import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { canSignClinicNotes, canSignComplianceForms } from '@/lib/auth/permissions';
import { DocumentType, SignatureStatus, SignerType } from '@prisma/client';

type PatchRequestBody = {
  action: 'mark_pending' | 'sign';
  signatureNote?: string;
  signerType?: SignerType;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body: PatchRequestBody = await request.json();
    const { action, signatureNote, signerType } = body;

    // Find the document
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Handle different actions
    if (action === 'mark_pending') {
      // Can only mark unsigned documents as pending
      if (document.signatureStatus !== SignatureStatus.UNSIGNED) {
        return NextResponse.json(
          { message: 'Only unsigned documents can be marked as pending' },
          { status: 400 }
        );
      }

      // Mark as pending
      const updatedDocument = await prisma.document.update({
        where: { id },
        data: {
          signatureStatus: SignatureStatus.PENDING,
          requestedSignatureById: user.id,
          requestedSignatureAt: new Date()
        }
      });

      // Log to audit log
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          modelName: 'Document',
          recordId: document.id,
          performedById: user.id,
          changes: {
            message: 'Document marked as pending signature',
            oldStatus: 'UNSIGNED',
            newStatus: 'PENDING'
          }
        }
      });

      return NextResponse.json(
        { document: updatedDocument, message: 'Document marked as pending' },
        { status: 200 }
      );
    } else if (action === 'sign') {
      // Check permissions
      if (document.documentType === DocumentType.CLINIC_NOTES) {
        if (!canSignClinicNotes(user)) {
          return NextResponse.json(
            { message: 'You do not have permission to sign clinic notes' },
            { status: 403 }
          );
        }
      } else if (document.documentType === DocumentType.COMPLIANCE) {
        if (!canSignComplianceForms(user)) {
          return NextResponse.json(
            { message: 'You do not have permission to sign compliance forms' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { message: 'Only clinic notes and compliance forms can be signed' },
          { status: 400 }
        );
      }

      // Sign the document
      const updatedDocument = await prisma.document.update({
        where: { id },
        data: {
          signatureStatus: SignatureStatus.SIGNED,
          signedById: user.id,
          signedAt: new Date(),
          signedByType: document.documentType === DocumentType.COMPLIANCE ?
            (signerType || SignerType.PATIENT) : SignerType.STAFF,
          signatureNote
        }
      });

      // Log to audit log
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          modelName: 'Document',
          recordId: document.id,
          performedById: user.id,
          changes: {
            message: 'Document signed',
            oldStatus: document.signatureStatus,
            newStatus: 'SIGNED',
            signerType: document.documentType === DocumentType.COMPLIANCE ?
              (signerType || SignerType.PATIENT) : SignerType.STAFF,
            signatureNote
          }
        }
      });

      return NextResponse.json(
        { document: updatedDocument, message: 'Document signed successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('PATCH /api/documents/[id]/signature error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
