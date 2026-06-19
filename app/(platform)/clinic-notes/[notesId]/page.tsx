"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ClinicNoteDetailModal from "@/components/clinic-notes/ClinicNoteDetailModal";
import { DocumentType, SignatureStatus } from "@prisma/client";
import { useAuth } from "@/lib/auth/AuthContext";

const TABS = ["Compliance Files", "Clinic Notes", "General Documents", "Billing Records"] as const;
type Tab = (typeof TABS)[number];

interface PatientData {
  id: string;
  patientId: string;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  status: string;
}

interface DocumentData {
  id: string;
  documentId: string;
  name: string;
  documentType: DocumentType;
  signatureStatus: SignatureStatus;
  createdAt: string;
}

interface StatsData {
  totalDocuments: number;
  complianceRate: number;
  signedForms: number;
  pendingSignatures: number;
  signedNotes: number;
}

/* ========================================================================== */
export default function ClinicNotesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const notesId = params.notesId as string;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Compliance Files");
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch folder and patient data
      const folderRes = await fetch(`/api/folders/${notesId}`);
      if (!folderRes.ok) throw new Error('Failed to fetch folder');
      const folderData = await folderRes.json();
      
      setPatient({
        ...folderData.patient,
        name: `${folderData.patient.lastname}, ${folderData.patient.firstname}`
      });
      setDocuments(folderData.documents);
      
      // Fetch stats
      if (folderData.patient.id) {
        const statsRes = await fetch(`/api/patients/${folderData.patient.id}/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [notesId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle signature actions
  const handleMarkPending = async (documentId: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/signature`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_pending' })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to mark as pending:', error);
    }
  };

  const handleSignDocument = async (documentId: string, note?: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/signature`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          signatureNote: note,
          signerType: 'PATIENT'
        })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to sign document:', error);
    }
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/folders/${notesId}`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        showToast('File uploaded successfully!', 'success');
        setIsUploadModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to upload file', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload file', 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!patient) {
    return <div style={{ padding: 24 }}>Patient not found</div>;
  }

  const statusColor = patient.status === "Active" ? "#137333" : patient.status === "Inactive" ? "#b3261e" : "#5f6368";
  const statusBg = patient.status === "Active" ? "#e6f4ea" : patient.status === "Inactive" ? "#fce8e8" : "#f1f3f4";

  // Calculate compliance rate color based on value
  const compliancePct = stats?.complianceRate || 0;
  const complianceColor = compliancePct >= 70 ? "#137333" : compliancePct >= 50 ? "#e65100" : "#b3261e";

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter documents by tab
  const getFilteredDocuments = () => {
    switch (activeTab) {
      case "Compliance Files":
        return documents.filter(d => d.documentType === DocumentType.COMPLIANCE);
      case "Clinic Notes":
        return documents.filter(d => d.documentType === DocumentType.CLINIC_NOTES);
      case "General Documents":
        return documents.filter(d => d.documentType === DocumentType.GENERAL);
      case "Billing Records":
        return documents.filter(d => d.documentType === DocumentType.BILLING);
      default:
        return [];
    }
  };

  const filteredDocs = getFilteredDocuments();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* --- Toast ----------------------------------------------------- */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          padding: '12px 24px',
          borderRadius: 8,
          backgroundColor: toast.type === 'success' ? '#137333' : toast.type === 'error' ? '#b3261e' : '#1a73e8',
          color: '#ffffff',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          {toast.message}
        </div>
      )}

      {/* --- Breadcrumb ------------------------------------------------ */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/clinic-notes")}>Clinic Notes</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{notesId}</span>
      </div>

      {/* --- Patient header card ---------------------------------------- */}
      <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, padding: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        {/* Avatar */}
        <div style={{ width: 72, height: 72, borderRadius: 12, background: "var(--color-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#ffffff" }}>person</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{`${patient.lastname}, ${patient.firstname}`}</h2>
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 18, color: "var(--color-secondary)" }}>verified</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
            <InfoChip icon="cake" text={`DOB: ${formatDate(patient.dateOfBirth)} (${calculateAge(patient.dateOfBirth)}y)`} />
            <InfoChip icon="badge" text={`ID: ${patient.patientId}`} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: statusBg, color: statusColor }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor }} />{patient.status}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <HeaderBtn icon="note_add" label="Add Clinic Note" onClick={() => router.push(`/clinic-notes/${notesId}/new`)} />
          <HeaderBtn icon="upload_file" label="Upload File" filled color="var(--color-secondary)" onClick={handleUploadClick} />
        </div>
      </div>

      {/* --- Stats Bar -------------------------------------------------- */}
      <div style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: 12,
        padding: "20px 0",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        alignItems: "center",
      }}>
        <div style={{ paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", marginBottom: 6 }}>TOTAL DOCUMENTS</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", color: "var(--color-on-surface)" }}>{stats?.totalDocuments ?? 0}</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--color-outline-variant)", paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", marginBottom: 6 }}>COMPLIANCE RATE</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", color: complianceColor }}>{`${compliancePct}%`}</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--color-outline-variant)", paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", marginBottom: 6 }}>SIGNED FORMS</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", color: "#137333" }}>{stats?.signedForms ?? 0}</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--color-outline-variant)", paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", marginBottom: 6 }}>PENDING SIGNATURES</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", color: "#e65100" }}>{stats?.pendingSignatures ?? 0}</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--color-outline-variant)", paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", marginBottom: 6 }}>SIGNED NOTES</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", color: "#1a73e8" }}>{stats?.signedNotes ?? 0}</div>
        </div>
      </div>

      {/* --- Tabs ------------------------------------------------------- */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--color-outline-variant)", overflowX: "auto" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: activeTab === t ? 700 : 500,
              color: activeTab === t ? "var(--color-primary-container)" : "var(--color-on-surface-variant)",
              background: "none",
              border: "none",
              borderBottom: activeTab === t ? "2px solid var(--color-primary-container)" : "2px solid transparent",
              marginBottom: -2,
              cursor: "pointer",
              transition: "color 0.12s",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* --- Tab content ------------------------------------------------ */}
      <DocumentTable
        activeTab={activeTab}
        docs={filteredDocs}
        onViewClick={(doc) => setSelectedNote(doc)}
        onMarkPending={handleMarkPending}
        onSignDocument={handleSignDocument}
        formatDate={formatDate}
      />


      {/* --- Clinic Note detail modal ---------------------------------- */}
      <ClinicNoteDetailModal
        isOpen={selectedNote !== null}
        onClose={() => setSelectedNote(null)}
        noteName={selectedNote?.name || ""}
        noteDate={selectedNote?.createdAt ? formatDate(selectedNote.createdAt) : ""}
        patient={patient as any}
      />

      {/* --- Upload modal ---------------------------------------------- */}
      {isUploadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 500
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 16 }}>Upload File</h3>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Document Name (optional)</label>
                <input
                  type="text"
                  name="documentName"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                  placeholder="Enter document name"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Document Type (optional)</label>
                <select
                  name="documentType"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                >
                  <option value="">Auto-detect</option>
                  <option value={DocumentType.COMPLIANCE}>Compliance</option>
                  <option value={DocumentType.CLINIC_NOTES}>Clinic Notes</option>
                  <option value={DocumentType.GENERAL}>General</option>
                  <option value={DocumentType.BILLING}>Billing</option>
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Select File</label>
                <input
                  type="file"
                  name="file"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px dashed var(--color-outline-variant)',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--color-outline-variant)',
                    background: 'transparent',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--color-secondary)',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}



/* ==========================================================================
   Shared Sub-components
========================================================================== */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-outline-variant)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{title}</h3>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function getTypeBadgeStyle(type: string) {
  const t = type?.toLowerCase() || "";
  if (t.includes("intake")) {
    return { background: "#e8f0fe", color: "#1a73e8" }; // blue
  }
  if (t.includes("progress")) {
    return { background: "#e6f4ea", color: "#137333" }; // green
  }
  if (t.includes("group")) {
    return { background: "#f3e8fd", color: "#9333ea" }; // purple
  }
  if (t.includes("assessment") || t.includes("summary")) {
    return { background: "#fff3e0", color: "#e65100" }; // amber
  }
  // Fallback for PDF or others
  return { background: "#f1f3f4", color: "#5f6368" }; // grey
}

function DocumentTable({ 
  activeTab,
  docs, 
  onViewClick, 
  onMarkPending, 
  onSignDocument,
  formatDate
}: { 
  activeTab: string;
  docs: DocumentData[]; 
  onViewClick?: (doc: DocumentData) => void;
  onMarkPending?: (documentId: string) => void;
  onSignDocument?: (documentId: string, note?: string) => void;
  formatDate: (date: string) => string;
}) {
  const getSignatureBadgeStyle = (status: SignatureStatus) => {
    switch (status) {
      case SignatureStatus.SIGNED:
        return { background: "#e6f4ea", color: "#137333" };
      case SignatureStatus.PENDING:
        return { background: "#fff3e0", color: "#e65100" };
      default:
        return { background: "#f1f3f4", color: "#5f6368" };
    }
  };

  // Check if current tab is one that allows signature actions
  const isSigningTab = activeTab === "Compliance Files" || activeTab === "Clinic Notes";

  return (
    <Card title={activeTab}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
            {["DOCUMENT", "DATE", "STATUS", "TYPE", "ACTIONS"].map((h, i) => (
              <th key={h + i} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", textAlign: i === 4 ? "right" : "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--color-on-surface-variant)" }}>
                No documents found
              </td>
            </tr>
          ) : (
            docs.map((d) => (
              <tr key={d.id} style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                <td style={{ padding: "12px", fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-error)" }}>picture_as_pdf</span>{d.name}
                  </div>
                </td>
                <td style={{ padding: "12px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>{formatDate(d.createdAt)}</td>
                <td style={{ padding: "12px", fontSize: 12, fontWeight: 600 }}>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    ...getSignatureBadgeStyle(d.signatureStatus)
                  }}>
                    {d.signatureStatus === SignatureStatus.UNSIGNED ? "Unsigned" : d.signatureStatus === SignatureStatus.PENDING ? "Pending" : "Signed"}
                  </span>
                </td>
                <td style={{ padding: "12px", fontSize: 12, fontWeight: 600 }}>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    ...getTypeBadgeStyle(d.documentType)
                  }}>
                    {d.documentType.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: "12px", textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  {/* View icon - always show */}
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 18,
                      color: "var(--color-on-surface-variant)",
                      cursor: onViewClick ? "pointer" : "default"
                    }}
                    onClick={() => onViewClick?.(d)}
                    title="View"
                  >
                    visibility
                  </span>

                  {/* Signature actions - only for Compliance and Clinic Notes tabs */}
                  {isSigningTab && d.signatureStatus === SignatureStatus.UNSIGNED && onMarkPending && (
                    <button
                      onClick={() => onMarkPending(d.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title="Mark as pending"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#e65100" }}>schedule</span>
                    </button>
                  )}
                  
                  {isSigningTab && (d.signatureStatus === SignatureStatus.UNSIGNED || d.signatureStatus === SignatureStatus.PENDING) && onSignDocument && (
                    <button
                      onClick={() => onSignDocument(d.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title="Sign document"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#137333" }}>edit_signature</span>
                    </button>
                  )}

                  {/* Delete icon - only for non-signing tabs */}
                  {!isSigningTab && (
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title="Delete"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#b3261e" }}>delete</span>
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}

function InfoChip({ icon, text }: { icon: string; text: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>{text}
    </span>
  );
}

function HeaderBtn({ icon, label, color, filled, onClick }: { icon: string; label: string; color?: string; filled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
        border: filled ? "none" : `1px solid ${color ?? "var(--color-outline-variant)"}`,
        background: filled ? (color ?? "var(--color-secondary)") : "transparent",
        fontSize: 13, fontWeight: 600,
        color: filled ? "#ffffff" : (color ?? "var(--color-on-surface)"),
        cursor: "pointer", transition: "all 0.12s",
      }}
      onMouseOver={(e) => {
        if (filled) e.currentTarget.style.opacity = "0.9";
        else e.currentTarget.style.background = "var(--color-surface-container)";
      }}
      onMouseOut={(e) => {
        if (filled) e.currentTarget.style.opacity = "1";
        else e.currentTarget.style.background = "transparent";
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>{label}
    </button>
  );
}
