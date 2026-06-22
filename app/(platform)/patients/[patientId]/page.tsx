"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import PatientFormModal from "@/components/patients/PatientFormModal";

/* ── Types ────────────────────────────────────────────────────────────── */
interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  zip?: string;
}

interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

interface IntakeNotes {
  diagnosis?: string;
  notes?: string;
}

interface DocumentRecord {
  id: string;
  documentId: string;
  name: string;
  fileType: string;
  documentType: string;
  fileSize: number | null;
  mimeType: string | null;
  storagePath: string;
  uploadedBy?: {
    firstname: string;
    lastname: string;
  };
  createdAt: string;
}

interface FolderRecord {
  id: string;
  folderId: string;
  name: string;
  type: "PARENT" | "CHILD";
  patientId: string;
  parentId: string | null;
  documents: DocumentRecord[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ProgramRecord {
  id: string;
  programId: string;
  name: string;
  description?: string;
  type: string;
  sessionType: string;
  frequency: string;
  totalSessions: number;
  duration: string;
  maxEnrollment: number;
  status: string;
  extraInfo?: any;
  createdAt: string;
  updatedAt: string;
}

interface PatientProgramRecord {
  id: string;
  patientId: string;
  programId: string;
  status: string;
  enrolledAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  program: ProgramRecord;
}

interface PatientRecord {
  id: string;
  patientId: string;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  gender: string;
  status: string;
  staffId?: string;
  staff?: {
    id: string;
    firstname: string;
    lastname: string;
  };
  contactInformation: ContactInfo;
  emergencyContact: EmergencyContact;
  intakeNotes: IntakeNotes;
  createdAt: string;
  updatedAt: string;
  folders?: FolderRecord[];
  patientPrograms?: PatientProgramRecord[];
}

const TABS = ["Overview", "Folder", "Programs", "Compliance", "Audit Log"] as const;
type Tab = (typeof TABS)[number];

/* ══════════════════════════════════════════════════════════════════════════ */
export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [showEditModal, setShowEditModal] = useState(false);

  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/patients/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setPatient(data.patient);
      } else if (res.status === 404) {
        setError("Patient not found.");
      } else {
        setError("Failed to load patient data.");
      }
    } catch {
      setError("A network error occurred.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  /* ── Loading state ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Breadcrumb patientId={patientId} onBack={() => router.push("/patients")} />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          padding: "80px 24px", background: "var(--color-surface-container-lowest)",
          border: "1px solid var(--color-outline-variant)", borderRadius: 12,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary-container)", animation: "spin 1s linear infinite" }}>progress_activity</span>
          <span style={{ fontSize: 15, fontWeight: 500, color: "var(--color-on-surface-variant)" }}>Loading patient profile…</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error / not found state ────────────────────────────────────────── */
  if (error || !patient) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Breadcrumb patientId={patientId} onBack={() => router.push("/patients")} />
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
          padding: "80px 24px", background: "var(--color-surface-container-lowest)",
          border: "1px solid var(--color-outline-variant)", borderRadius: 12,
        }}>
          <span className="material-symbols-outlined icon-fill" style={{ fontSize: 48, color: "var(--color-error)" }}>error</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-surface)" }}>{error || "Patient not found."}</span>
          <button
            onClick={() => router.push("/patients")}
            style={{
              marginTop: 8, padding: "8px 20px", borderRadius: 8, border: "1px solid var(--color-outline-variant)",
              background: "transparent", fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", cursor: "pointer",
            }}
          >
            ← Back to Patients
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived display values ─────────────────────────────────────────── */
  const p = patient;
  const displayName = `${p.lastname}, ${p.firstname}`;
  const dob = new Date(p.dateOfBirth);
  const dobStr = dob.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const contact = p.contactInformation ?? {};
  const emergency = p.emergencyContact ?? {};
  const intake = p.intakeNotes ?? {};
  const emergencyDisplay = emergency.name
    ? `${emergency.name}${emergency.relationship ? ` (${emergency.relationship})` : ""}${emergency.phone ? ` — ${emergency.phone}` : ""}`
    : "—";
  const addressDisplay = [contact.address, contact.city, contact.zip].filter(Boolean).join(", ") || "—";

  const statusColor = p.status === "Active" ? "#137333" : p.status === "Inactive" ? "#b3261e" : "#5f6368";
  const statusBg = p.status === "Active" ? "#e6f4ea" : p.status === "Inactive" ? "#fce8e8" : "#f1f3f4";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <Breadcrumb patientId={p.patientId} onBack={() => router.push("/patients")} />

      {/* ── Patient header card ─────────────────────────────────────────── */}
      <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, padding: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        {/* Avatar */}
        <div style={{ width: 72, height: 72, borderRadius: 12, background: "var(--color-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#ffffff" }}>person</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{displayName}</h2>
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 18, color: "var(--color-secondary)" }}>verified</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
            <InfoChip icon="cake" text={`DOB: ${dobStr} (${age}y)`} />
            <InfoChip icon="badge" text={`ID: ${p.patientId}`} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: statusBg, color: statusColor }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor }} />{p.status}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <HeaderBtn icon="edit" label="Edit Profile" onClick={() => setShowEditModal(true)} />
          <HeaderBtn icon="delete" label="Delete" color="var(--color-error)" />
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--color-outline-variant)" }}>
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
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      {activeTab === "Overview" && (
        <OverviewTab
          diagnosis={intake.diagnosis || "—"}
          gender={p.gender}
          provider={p.staff ? `${p.staff.firstname} ${p.staff.lastname}` : "None"}
          phone={contact.phone || "—"}
          email={contact.email || "—"}
          address={addressDisplay}
          emergency={emergencyDisplay}
        />
      )}
      {activeTab === "Folder" && (
        <FolderTab
          folders={patient?.folders ?? []}
          onRefresh={fetchPatient}
        />
      )}
      {activeTab === "Programs" && (
        <ProgramsTab
          patientPrograms={p.patientPrograms ?? []}
          patientId={p.id}
          onRefresh={fetchPatient}
        />
      )}
      {activeTab === "Compliance" && <ComplianceTab items={[]} />}
      {activeTab === "Audit Log" && <AuditLogTab patientId={patientId} />}

      {/* ── Edit Patient Modal ─────────────────────────────────────────── */}
      {showEditModal && (
        <PatientFormModal
          mode="edit"
          editPatientId={p.id}
          initialData={{
            firstName: p.firstname,
            lastName: p.lastname,
            dob: dob.toISOString().split("T")[0],
            gender: p.gender,
            diagnosis: intake.diagnosis,
            provider: p.staffId || "none",
            phone: contact.phone,
            email: contact.email,
            address: contact.address,
            city: contact.city,
            zip: contact.zip,
            emergencyName: emergency.name,
            emergencyRelationship: emergency.relationship,
            emergencyPhone: emergency.phone,
            notes: intake.notes,
          }}
          onClose={() => setShowEditModal(false)}
          onSave={() => fetchPatient()}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Tab Components
══════════════════════════════════════════════════════════════════════════ */

function OverviewTab({
  diagnosis, gender, provider, phone, email, address, emergency,
}: {
  diagnosis: string; gender: string; provider: string; phone: string; email: string; address: string; emergency: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
      {/* Left — clinical summary */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card title="Clinical Summary">
          <Row label="Primary Diagnosis" value={diagnosis} />
          <Row label="Gender" value={gender} />
          <Row label="Assigned Provider" value={provider} />
        </Card>
        <Card title="Contact Information">
          <Row label="Phone" value={phone} />
          <Row label="Email" value={email} />
          <Row label="Address" value={address} />
          <Row label="Emergency Contact" value={emergency} />
        </Card>
      </div>
      {/* Right — placeholder panels */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card title="Upcoming Appointments">
          <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0 }}>No upcoming appointments scheduled.</p>
        </Card>
      </div>
    </div>
  );
}

interface FolderTabProps {
  folders: FolderRecord[];
  onRefresh: () => void;
}

function FolderTab({ folders, onRefresh }: FolderTabProps) {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to map folder name to documentType
  const getDocTypeFromFolderName = (folderName: string): string => {
    const name = folderName.toLowerCase();
    if (name.includes("clinic")) return "CLINIC_NOTES";
    if (name.includes("compliance")) return "COMPLIANCE";
    if (name.includes("billing")) return "BILLING";
    return "GENERAL";
  };

  // Pool all documents from all folders of the patient
  const allDocuments = folders.flatMap((f) => f.documents || []);

  // Filter child folders
  const childFolders = folders.filter((f) => f.type === "CHILD");

  // Select the first folder by default if none selected
  useEffect(() => {
    if (childFolders.length > 0 && !activeFolderId) {
      setActiveFolderId(childFolders[0].id);
    }
  }, [childFolders, activeFolderId]);

  const activeFolder = childFolders.find((f) => f.id === activeFolderId);

  const handleUpload = async (file: File) => {
    if (!activeFolder) return;
    try {
      setUploading(true);
      setError("");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentName", file.name);
      formData.append("documentType", getDocTypeFromFolderName(activeFolder.name));

      const res = await fetch(`/api/folders/${activeFolder.folderId}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to upload file.");
      }
    } catch {
      setError("A network error occurred while uploading.");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  function formatBytes(bytes: number | null): string {
    if (bytes === null || bytes === undefined) return "—";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const getDocIcon = (mime: string | null, name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    const type = mime || "";
    
    if (type.includes("pdf") || ext === "pdf") {
      return { icon: "picture_as_pdf", color: "#b3261e" };
    }
    if (type.includes("word") || ext === "doc" || ext === "docx") {
      return { icon: "description", color: "#1a73e8" };
    }
    if (type.includes("excel") || ext === "xls" || ext === "xlsx") {
      return { icon: "table_chart", color: "#137333" };
    }
    if (type.includes("image") || ["png", "jpg", "jpeg"].includes(ext || "")) {
      return { icon: "image", color: "#e65100" };
    }
    return { icon: "insert_drive_file", color: "#5f6368" };
  };

  // If no folders are available
  if (folders.length === 0) {
    return (
      <div style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: 12,
        padding: "60px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        textAlign: "center",
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 36, color: "var(--color-outline)", animation: "spin 1s linear infinite" }}>progress_activity</span>
        <span style={{ fontSize: 15, fontWeight: 500, color: "var(--color-on-surface-variant)" }}>Initializing folders…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>
      {/* Sidebar Folders */}
      <div style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-on-surface-variant)", paddingLeft: 8, paddingBottom: 8, letterSpacing: "0.05em" }}>PATIENT FOLDERS</div>
        
        {childFolders.map((f) => {
          const isActive = activeFolderId === f.id;
          const folderDocType = getDocTypeFromFolderName(f.name);
          const docCount = allDocuments.filter((d) => d.documentType === folderDocType).length;
          
          let icon = "folder";
          let iconColor = "var(--color-primary-container)";
          if (f.name.toLowerCase().includes("general")) { icon = "description"; iconColor = "var(--color-primary-container)"; }
          else if (f.name.toLowerCase().includes("billing")) { icon = "receipt_long"; iconColor = "#1a73e8"; }
          else if (f.name.toLowerCase().includes("compliance")) { icon = "verified_user"; iconColor = "#137333"; }
          else if (f.name.toLowerCase().includes("clinic")) { icon = "edit_note"; iconColor = "#e65100"; }

          return (
            <button
              key={f.id}
              onClick={() => setActiveFolderId(f.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                background: isActive ? "var(--color-surface-container)" : "transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.12s",
                width: "100%",
              }}
              onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = "var(--color-surface-container-low)"; }}
              onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: iconColor }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: "var(--color-on-surface)" }}>{f.name}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, background: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)", padding: "2px 8px", borderRadius: 10 }}>
                {docCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Folder Contents */}
      {activeFolder ? (
        <Card title={activeFolder.name}>
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
              background: "#fce8e8", border: "1px solid #f8b4b4", borderRadius: 8,
              fontSize: 13, color: "#b3261e", marginBottom: 16,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadAreaClick}
            style={{
              border: dragActive ? "2px dashed var(--color-primary-container)" : "2px dashed var(--color-outline-variant)",
              borderRadius: 8,
              padding: "32px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: dragActive ? "var(--color-surface-container)" : "transparent",
              transition: "all 0.12s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--color-primary-container)"; }}
            onMouseOut={(e) => { if (!dragActive) e.currentTarget.style.borderColor = "var(--color-outline-variant)"; }}
          >
            {uploading ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-primary-container)", animation: "spin 1s linear infinite" }}>progress_activity</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>Uploading document to storage…</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-outline)" }}>cloud_upload</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>Drag and drop files here, or click to browse</span>
                  <span style={{ fontSize: 11, color: "var(--color-on-surface-variant)" }}>Supports PDF, Word, Excel, TXT, and Images up to 50MB</span>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </div>

          {/* Documents Table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                {["DOCUMENT", "UPLOADED BY", "SIZE", "UPLOAD DATE", ""].map((h, i) => (
                  <th key={h + i} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const activeFolderDocType = getDocTypeFromFolderName(activeFolder.name);
                const displayedDocuments = allDocuments.filter((d) => d.documentType === activeFolderDocType);

                if (displayedDocuments.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} style={{ padding: "48px 12px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-outline)" }}>folder_open</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>Folder is empty</span>
                          <span style={{ fontSize: 13, color: "var(--color-on-surface-variant)" }}>Upload documents to this patient's folder to see them here.</span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return displayedDocuments.map((d) => {
                  const iconInfo = getDocIcon(d.mimeType, d.name);
                  const uploadedByDisplay = d.uploadedBy
                    ? `${d.uploadedBy.firstname} ${d.uploadedBy.lastname}`
                    : "—";

                  return (
                    <tr key={d.id} style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                      <td style={{ padding: "12px", fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: iconInfo.color }}>{iconInfo.icon}</span>
                          <span style={{ wordBreak: "break-all" }}>{d.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px", fontSize: 13, color: "var(--color-on-surface)" }}>{uploadedByDisplay}</td>
                      <td style={{ padding: "12px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>{formatBytes(d.fileSize)}</td>
                      <td style={{ padding: "12px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>{formatDate(d.createdAt)}</td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <a
                          href={`/api/documents/${d.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            color: "var(--color-on-surface-variant)",
                            cursor: "pointer",
                            transition: "background 0.12s",
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = "var(--color-surface-container)"; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                        </a>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}

interface ProgramsTabProps {
  patientPrograms: PatientProgramRecord[];
  patientId: string;
  onRefresh: () => void;
}

function ProgramsTab({ patientPrograms, patientId, onRefresh }: ProgramsTabProps) {
  const [allPrograms, setAllPrograms] = useState<ProgramRecord[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  // Fetch all available programs when the modal opens
  const fetchAllPrograms = useCallback(async () => {
    setLoadingPrograms(true);
    try {
      const res = await fetch("/api/programs");
      if (res.ok) {
        const data = await res.json();
        setAllPrograms(data.programs);
      }
    } catch {
      console.error("Failed to fetch programs");
    } finally {
      setLoadingPrograms(false);
    }
  }, []);

  // Handle enrolling in a program
  const handleEnroll = async (programId: string) => {
    setEnrolling(true);
    setError("");
    try {
      const res = await fetch(`/api/programs/${programId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      if (res.ok) {
        setShowEnrollModal(false);
        onRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to enroll patient");
      }
    } catch {
      setError("A network error occurred");
    } finally {
      setEnrolling(false);
    }
  };

  // Get a list of program IDs that the patient is already enrolled in
  const enrolledProgramIds = new Set(patientPrograms.map(pp => pp.program.programId));

  // Filter available programs (not already enrolled)
  const availablePrograms = allPrograms.filter(p => !enrolledProgramIds.has(p.programId));

  // Format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Enroll Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => {
            fetchAllPrograms();
            setShowEnrollModal(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "var(--color-secondary)",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#005a61")}
          onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-secondary)")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
          Enroll in Program
        </button>
      </div>

      {/* Enrolled Programs */}
      <Card title="Enrolled Programs">
        {patientPrograms.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0 }}>Patient is not enrolled in any programs.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {patientPrograms.map(pp => (
              <div
                key={pp.id}
                style={{
                  background: "var(--color-surface-container-low)",
                  border: "1px solid var(--color-outline-variant)",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px", color: "var(--color-on-surface)" }}>
                      {pp.program.name}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <InfoChip icon="local_hospital" text={pp.program.type} />
                      <InfoChip icon="schedule" text={pp.program.sessionType} />
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 10px",
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 600,
                          background: pp.status === "Active" ? "#e6f4ea" : "#fce8e8",
                          color: pp.status === "Active" ? "#137333" : "#b3261e",
                        }}
                      >
                        {pp.status}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                    Enrolled {formatDate(pp.enrolledAt)}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  <Row label="Total Sessions" value={String(pp.program.totalSessions)} />
                  <Row label="Frequency" value={pp.program.frequency} />
                  <Row label="Duration" value={pp.program.duration} />
                  <Row label="Program ID" value={pp.program.programId} />
                </div>

                {pp.program.description && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--color-outline-variant)" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)", display: "block", marginBottom: 4 }}>
                      Description
                    </span>
                    <p style={{ fontSize: 13, color: "var(--color-on-surface)", margin: 0 }}>
                      {pp.program.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div
          onClick={() => setShowEnrollModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(3px)",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: 14,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid var(--color-outline-variant)",
                position: "sticky",
                top: 0,
                background: "#ffffff",
                zIndex: 1,
                borderRadius: "14px 14px 0 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary-container)" }}>
                  school
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>
                  Enroll in Program
                </h3>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", padding: 4 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {error && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#fce8e8",
                  color: "#b3261e",
                  fontSize: 13,
                  fontWeight: 600,
                }}>
                  {error}
                </div>
              )}

              {loadingPrograms ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-primary-container)", animation: "spin 1s linear infinite" }}>
                    progress_activity
                  </span>
                  <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", marginTop: 8, marginBottom: 0 }}>
                    Loading programs...
                  </p>
                </div>
              ) : availablePrograms.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0, textAlign: "center" }}>
                  No available programs to enroll in.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {availablePrograms.map(program => (
                    <div
                      key={program.id}
                      style={{
                        background: "var(--color-surface-container-low)",
                        border: "1px solid var(--color-outline-variant)",
                        borderRadius: 10,
                        padding: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", color: "var(--color-on-surface)" }}>
                          {program.name}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                            {program.type} • {program.sessionType} • {program.totalSessions} sessions
                          </span>
                        </div>
                        {program.description && (
                          <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", margin: "4px 0 0" }}>
                            {program.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleEnroll(program.programId)}
                        disabled={enrolling}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "none",
                          background: enrolling ? "var(--color-outline-variant)" : "var(--color-primary-container)",
                          color: "#ffffff",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: enrolling ? "not-allowed" : "pointer",
                          opacity: enrolling ? 0.7 : 1,
                          transition: "background 0.15s",
                        }}
                        onMouseOver={(e) => { if (!enrolling) e.currentTarget.style.background = "var(--color-primary)" }}
                        onMouseOut={(e) => { if (!enrolling) e.currentTarget.style.background = "var(--color-primary-container)" }}
                      >
                        {enrolling ? "Enrolling..." : "Enroll"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ComplianceItem {
  task: string;
  status: string;
  date: string;
  icon: string;
  color: string;
}

function ComplianceTab({ items }: { items: ComplianceItem[] }) {
  /* ── Empty state — no compliance items yet ──────────────────────────── */
  if (items.length === 0) {
    return (
      <div style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: 12,
        padding: "60px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 16,
          background: "var(--color-surface-container)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: "var(--color-outline)" }}>verified_user</span>
        </div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: "var(--color-on-surface)" }}>No Compliance Items</h3>
          <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
            There are no compliance tasks for this patient yet. Compliance items such as consent forms, HIPAA acknowledgments, and risk assessments will appear here once added.
          </p>
        </div>
      </div>
    );
  }

  /* ── Has items — show checklist + score ─────────────────────────────── */
  const completed = items.filter((it) => it.status === "Complete").length;
  const pct = Math.round((completed / items.length) * 100);
  const scoreColor = pct >= 80 ? "#137333" : pct >= 50 ? "#e65100" : "#b3261e";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
      <Card title="Compliance Checklist">
        {items.map((it) => (
          <div key={it.task} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--color-outline-variant)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 20, color: it.color }}>{it.icon}</span>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>{it.task}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--color-on-surface-variant)" }}>{it.date}</span>
              </div>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: it.color === "#137333" ? "#e6f4ea" : it.color === "#e65100" ? "#fff3e0" : "#fce8e8", color: it.color }}>{it.status}</span>
          </div>
        ))}
      </Card>
      <Card title="Compliance Score">
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto" }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e8eaed" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor} strokeWidth="10" strokeDasharray={`${(completed / items.length) * 314} 314`} strokeLinecap="round" transform="rotate(-90 60 60)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: scoreColor }}>{pct}%</div>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", marginTop: 12 }}>{completed} of {items.length} items complete</p>
        </div>
      </Card>
    </div>
  );
}

/* ── Audit Log Tab ────────────────────────────────────────────────────── */

interface AuditEntry {
  id: string;
  action: string;
  modelName: string;
  recordId: string;
  changes: {
    message?: string;
    patientId?: string;
    name?: string;
    updatedFields?: Record<string, { old: any; new: any }>;
  };
  performedBy: { firstname: string; lastname: string; email: string };
  performedAt: string;
}

const ACTION_STYLES: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  CREATE: { bg: "#e6f4ea", color: "#137333", label: "Created", icon: "add_circle" },
  UPDATE: { bg: "#e8f0fe", color: "#1a73e8", label: "Updated", icon: "edit" },
  DELETE: { bg: "#fce8e8", color: "#b3261e", label: "Deleted", icon: "delete" },
  SOFT_DELETE: { bg: "#fce8e8", color: "#b3261e", label: "Archived", icon: "archive" },
};

function AuditLogTab({ patientId }: { patientId: string }) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/patients/${patientId}/audit-logs`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setLogs(data.logs ?? []);
        } else {
          if (!cancelled) setError("Failed to load audit logs.");
        }
      } catch {
        if (!cancelled) setError("A network error occurred.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [patientId]);

  /* ── Loading ────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        padding: "60px 24px", background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)", borderRadius: 12,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--color-primary-container)", animation: "spin 1s linear infinite" }}>progress_activity</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-on-surface-variant)" }}>Loading audit history…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        padding: "60px 24px", background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)", borderRadius: 12, textAlign: "center",
      }}>
        <span className="material-symbols-outlined icon-fill" style={{ fontSize: 36, color: "var(--color-error)" }}>error</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>{error}</span>
      </div>
    );
  }

  /* ── Empty ───────────────────────────────────────────────────────────── */
  if (logs.length === 0) {
    return (
      <div style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: 12, padding: "60px 24px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 16,
          background: "var(--color-surface-container)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: "var(--color-outline)" }}>history</span>
        </div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: "var(--color-on-surface)" }}>No Audit History</h3>
          <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0, maxWidth: 400, lineHeight: 1.6 }}>
            There are no recorded actions for this patient yet. All changes to the patient record will be logged here automatically.
          </p>
        </div>
      </div>
    );
  }

  /* ── Logs table ──────────────────────────────────────────────────────── */
  return (
    <Card title="Audit History">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
            {["ACTION", "DETAILS", "CHANGES", "PERFORMED BY", "DATE & TIME"].map((h) => (
              <th key={h} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const style = ACTION_STYLES[log.action] ?? ACTION_STYLES.UPDATE;
            const date = new Date(log.performedAt);
            const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            const updatedFields = log.changes?.updatedFields || {};
            const hasChanges = Object.keys(updatedFields).length > 0;

            return (
              <tr key={log.id} style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                <td style={{ padding: "12px", verticalAlign: "top" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                    background: style.bg, color: style.color,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{style.icon}</span>
                    {style.label}
                  </span>
                </td>
                <td style={{ padding: "12px", fontSize: 13, color: "var(--color-on-surface)", maxWidth: 250, verticalAlign: "top" }}>
                  {log.changes?.message || `${log.action} on ${log.modelName}`}
                </td>
                <td style={{ padding: "12px", verticalAlign: "top" }}>
                  {hasChanges ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {Object.entries(updatedFields).map(([field, vals]) => (
                        <div key={field} style={{ fontSize: 12, background: "var(--color-surface-container-lowest)", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--color-outline-variant)", display: "inline-block", width: "fit-content" }}>
                          <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{field}:</span>{" "}
                          <span style={{ color: "var(--color-error)", textDecoration: "line-through" }}>{String(vals.old || "—")}</span>
                          {" "}→{" "}
                          <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>{String(vals.new || "—")}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>—</span>
                  )}
                </td>
                <td style={{ padding: "12px", verticalAlign: "top" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>
                    {log.performedBy.firstname} {log.performedBy.lastname}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{log.performedBy.email}</div>
                </td>
                <td style={{ padding: "12px", verticalAlign: "top" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-on-surface)" }}>{dateStr}</div>
                  <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{timeStr}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Shared Sub-components
══════════════════════════════════════════════════════════════════════════ */

function Breadcrumb({ patientId, onBack }: { patientId: string; onBack: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
      <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={onBack}>Patients</span>
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
      <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{patientId}</span>
    </div>
  );
}

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-outline-variant)" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-on-surface)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

function InfoChip({ icon, text }: { icon: string; text: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>{text}
    </span>
  );
}

function HeaderBtn({ icon, label, color, onClick }: { icon: string; label: string; color?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
        border: `1px solid ${color ?? "var(--color-outline-variant)"}`,
        background: "transparent", fontSize: 13, fontWeight: 600,
        color: color ?? "var(--color-on-surface)", cursor: "pointer", transition: "background 0.12s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>{label}
    </button>
  );
}
