import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import { DocumentType, SignatureStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get all documents for the patient
    const allDocuments = await prisma.document.findMany({
      where: {
        patientId: id,
        deletedAt: null
      }
    });

    // Calculate stats
    const totalDocuments = allDocuments.length;
    const complianceDocuments = allDocuments.filter(d => d.documentType === DocumentType.COMPLIANCE);
    const clinicNotes = allDocuments.filter(d => d.documentType === DocumentType.CLINIC_NOTES);

    const signedForms = complianceDocuments.filter(d => d.signatureStatus === SignatureStatus.SIGNED).length;
    const pendingSignatures = clinicNotes.filter(d => d.signatureStatus === SignatureStatus.PENDING).length;
    const signedNotes = clinicNotes.filter(d => d.signatureStatus === SignatureStatus.SIGNED).length;

    const complianceRate = complianceDocuments.length > 0 ?
      Math.round((signedForms / complianceDocuments.length) * 100) : 0;

    return NextResponse.json({
      stats: {
        totalDocuments,
        complianceRate,
        signedForms,
        pendingSignatures,
        signedNotes
      }
    }, { status: 200 });
  } catch (error) {
    console.error('GET /api/patients/[id]/stats error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
