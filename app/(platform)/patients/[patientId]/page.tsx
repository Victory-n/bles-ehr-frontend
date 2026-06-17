"use client";

import React, { useState, useEffect, useCallback } from "react";
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

interface PatientRecord {
  id: string;
  patientId: string;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  gender: string;
  status: string;
  staffId: string;
  contactInformation: ContactInfo;
  emergencyContact: EmergencyContact;
  intakeNotes: IntakeNotes;
  createdAt: string;
  updatedAt: string;
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
          phone={contact.phone || "—"}
          email={contact.email || "—"}
          address={addressDisplay}
          emergency={emergencyDisplay}
        />
      )}
      {activeTab === "Folder" && <FolderTab hasFolder={false} docs={[]} />}
      {activeTab === "Programs" && <ProgramsTab />}
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
  diagnosis, gender, phone, email, address, emergency,
}: {
  diagnosis: string; gender: string; phone: string; email: string; address: string; emergency: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
      {/* Left — clinical summary */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card title="Clinical Summary">
          <Row label="Primary Diagnosis" value={diagnosis} />
          <Row label="Gender" value={gender} />
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

interface FolderDoc {
  name: string;
  date: string;
  type: string;
}

function FolderTab({ hasFolder, docs }: { hasFolder: boolean; docs: FolderDoc[] }) {
  /* ── State 1: No folder exists — prompt to create one ──────────────── */
  if (!hasFolder) {
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
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: "var(--color-outline)" }}>folder_off</span>
        </div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", color: "var(--color-on-surface)" }}>No Patient Folder</h3>
          <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0, maxWidth: 400, lineHeight: 1.6 }}>
            This patient does not have a document folder yet. Create a folder to start uploading and organizing clinical documents, forms, and records.
          </p>
        </div>
        <button
          style={{
            display: "flex", alignItems: "center", gap: 6, marginTop: 8,
            padding: "10px 22px", borderRadius: 8, border: "none",
            background: "var(--color-primary-container)", color: "#ffffff",
            fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-primary-container)")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>create_new_folder</span>
          Create Folder
        </button>
      </div>
    );
  }

  /* ── State 2 & 3: Folder exists — show table (empty or with data) ─── */
  return (
    <Card title="Patient Documents">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
            {["DOCUMENT", "DATE", "TYPE", ""].map((h, i) => (
              <th key={h + i} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 ? (
            /* ── Empty folder state ─────────────────────────────────────── */
            <tr>
              <td colSpan={4} style={{ padding: "48px 12px", textAlign: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-outline)" }}>folder_open</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>Folder is empty</span>
                  <span style={{ fontSize: 13, color: "var(--color-on-surface-variant)" }}>Upload documents to this patient's folder to see them here.</span>
                </div>
              </td>
            </tr>
          ) : (
            /* ── Documents list ─────────────────────────────────────────── */
            docs.map((d) => (
              <tr key={d.name} style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                <td style={{ padding: "12px", fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-error)" }}>picture_as_pdf</span>{d.name}
                  </div>
                </td>
                <td style={{ padding: "12px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>{d.date}</td>
                <td style={{ padding: "12px", fontSize: 12, fontWeight: 600 }}><span style={{ padding: "2px 8px", borderRadius: 6, background: "#fce8e8", color: "#b3261e" }}>{d.type}</span></td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-on-surface-variant)", cursor: "pointer" }}>download</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}

function ProgramsTab() {
  return (
    <Card title="Enrolled Programs">
      <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0 }}>Patient is not enrolled in any programs.</p>
    </Card>
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
