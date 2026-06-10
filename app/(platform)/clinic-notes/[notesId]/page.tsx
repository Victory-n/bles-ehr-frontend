"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ClinicNoteDetailModal from "@/components/clinic-notes/ClinicNoteDetailModal";

/* ── Mock data for Clinic Notes Folder ──────────────────────────────────── */
const MOCK: Record<string, any> = {
  "FLD-1001": {
    name: "Abernathy, Sarah",
    dob: "04/12/1988",
    age: 35,
    ehr: "PT-9482-A",
    provider: "Dr. E. Carter",
    gender: "Female",
    phone: "(555) 234-5678",
    email: "sarah.abernathy@email.com",
    address: "142 Maple St, Springfield, IL 62704",
    emergency: "John Abernathy (Spouse) — (555) 234-0000",
    status: "Active",
    diagnosis: "F41.1 — Generalized Anxiety Disorder",
    programs: ["CBT Group Therapy"],
    gad7: 14,
    phq9: 8,
    totalDocuments: 13,
    complianceRate: "40%",
    signedForms: 4,
    pendingSignatures: 6,
    signedNotes: 3
  },
  "FLD-1002": {
    name: "Chen, Wei",
    dob: "11/03/1995",
    age: 29,
    ehr: "PT-9483-B",
    provider: "Dr. A. Okafor",
    gender: "Male",
    phone: "(555) 345-6789",
    email: "wei.chen@email.com",
    address: "88 Oak Ave, Chicago, IL 60614",
    emergency: "Lin Chen (Parent) — (555) 345-0000",
    status: "Active",
    diagnosis: "F33.1 — Major Depressive Disorder, Recurrent",
    programs: ["Medication Management"],
    gad7: 6,
    phq9: 16,
    totalDocuments: 15,
    complianceRate: "73%",
    signedForms: 8,
    pendingSignatures: 4,
    signedNotes: 3
  },
};

const TABS = ["Compliance Files", "Clinic Notes", "General Documents", "Billing Records"] as const;
type Tab = (typeof TABS)[number];

/* ══════════════════════════════════════════════════════════════════════════ */
export default function ClinicNotesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const notesId = params.notesId as string;
  const [activeTab, setActiveTab] = useState<Tab>("Compliance Files");
  const [selectedNote, setSelectedNote] = useState<any | null>(null);

  const [p, setP] = useState(() => MOCK[notesId] ?? MOCK["FLD-1001"]);

  React.useEffect(() => {
    const patientData = MOCK[notesId] ?? MOCK["FLD-1001"];
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem(`notes_${notesId}`);
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        const addedCount = parsed.length - 3;
        if (addedCount > 0) {
          setP({
            ...patientData,
            totalDocuments: patientData.totalDocuments + addedCount,
            signedNotes: patientData.signedNotes + addedCount,
          });
          return;
        }
      }
    }
    setP(patientData);
  }, [notesId]);

  const statusColor = p.status === "Active" ? "#137333" : p.status === "Inactive" ? "#b3261e" : "#5f6368";
  const statusBg = p.status === "Active" ? "#e6f4ea" : p.status === "Inactive" ? "#fce8e8" : "#f1f3f4";

  // Calculate compliance rate color based on value
  const compliancePct = parseInt(p.complianceRate || "0", 10);
  const complianceColor = compliancePct >= 70 ? "#137333" : compliancePct >= 50 ? "#e65100" : "#b3261e";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/clinic-notes")}>Clinic Notes</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{notesId}</span>
      </div>

      {/* ── Patient header card ─────────────────────────────────────────── */}
      <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, padding: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        {/* Avatar */}
        <div style={{ width: 72, height: 72, borderRadius: 12, background: "var(--color-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#ffffff" }}>person</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{p.name}</h2>
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 18, color: "var(--color-secondary)" }}>verified</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
            <InfoChip icon="cake" text={`DOB: ${p.dob} (${p.age}y)`} />
            <InfoChip icon="badge" text={`ID: ${p.ehr}`} />
            <InfoChip icon="stethoscope" text={p.provider} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: statusBg, color: statusColor }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor }} />{p.status}
            </span>
            {p.gad7 >= 10 && (
              <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: "#fff3e0", color: "#e65100" }}>GAD-7: {p.gad7 >= 15 ? "Severe" : "Moderate"}</span>
            )}
            {p.phq9 >= 10 && (
              <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: "#fce8e8", color: "#b3261e" }}>PHQ-9: {p.phq9 >= 15 ? "Severe" : "Moderate"}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <HeaderBtn icon="note_add" label="Add Clinic Note" onClick={() => router.push(`/clinic-notes/${notesId}/new`)} />
          <HeaderBtn icon="upload_file" label="Upload File" filled color="var(--color-secondary)" />
        </div>
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────────────── */}
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
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", color: "var(--color-on-surface)" }}>{p.totalDocuments ?? 13}</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--color-outline-variant)", paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", marginBottom: 6 }}>COMPLIANCE RATE</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", color: complianceColor }}>{p.complianceRate ?? "40%"}</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--color-outline-variant)", paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", marginBottom: 6 }}>SIGNED FORMS</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", color: "#137333" }}>{p.signedForms ?? 4}</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--color-outline-variant)", paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", marginBottom: 6 }}>PENDING SIGNATURES</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", color: "#e65100" }}>{p.pendingSignatures ?? 6}</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--color-outline-variant)", paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", marginBottom: 6 }}>SIGNED NOTES</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", color: "#1a73e8" }}>{p.signedNotes ?? 3}</div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
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

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      {activeTab === "Compliance Files" && <ComplianceFilesTab />}
      {activeTab === "Clinic Notes" && <ClinicNotesListTab notesId={notesId} onViewNote={(doc) => setSelectedNote(doc)} />}
      {activeTab === "General Documents" && <FolderTab />}
      {activeTab === "Billing Records" && <BillingRecordsTab />}

      {/* ── Clinic Note detail modal ────────────────────────────────────── */}
      <ClinicNoteDetailModal
        isOpen={selectedNote !== null}
        onClose={() => setSelectedNote(null)}
        noteName={selectedNote?.name || ""}
        noteDate={selectedNote?.date || ""}
        patient={p}
      />

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Tab Components
══════════════════════════════════════════════════════════════════════════ */

function ComplianceFilesTab() {
  const docs = [
    { name: "Signed Consent Form", date: "Jan 15, 2024", type: "PDF" },
    { name: "HIPAA Acknowledgment", date: "Jan 15, 2024", type: "PDF" },
    { name: "Treatment Plan Agreement", date: "Feb 20, 2024", type: "PDF" },
  ];
  return <DocumentTable title="Compliance Files" docs={docs} />;
}

function ClinicNotesListTab({ notesId, onViewNote }: { notesId: string; onViewNote: (doc: any) => void }) {
  const [docs, setDocs] = useState<any[]>([]);

  React.useEffect(() => {
    const defaultDocs = [
      { name: "Progress Note — Session 4", date: "Mar 02, 2024", type: "PDF" },
      { name: "Progress Note — Session 5", date: "Mar 10, 2024", type: "PDF" },
      { name: "Intake Assessment", date: "Jan 15, 2024", type: "PDF" },
    ];
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`notes_${notesId}`);
      if (saved) {
        setDocs(JSON.parse(saved));
        return;
      }
    }
    setDocs(defaultDocs);
  }, [notesId]);

  return <DocumentTable title="Clinic Notes" docs={docs} onViewClick={onViewNote} />;
}

function FolderTab() {
  const docs = [
    { name: "Initial Intake Form", date: "Jan 15, 2024", type: "PDF" },
    { name: "Lab Results — Blood Panel", date: "Feb 18, 2024", type: "PDF" },
    { name: "Insurance Verification", date: "Jan 10, 2024", type: "PDF" },
  ];
  return <DocumentTable title="General Documents" docs={docs} />;
}

function BillingRecordsTab() {
  const docs = [
    { name: "Invoice #INV-2024-001", date: "Jan 15, 2024", type: "PDF" },
    { name: "Payment Receipt", date: "Jan 16, 2024", type: "PDF" },
    { name: "Invoice #INV-2024-002", date: "Feb 15, 2024", type: "PDF" },
  ];
  return <DocumentTable title="Billing Records" docs={docs} />;
}

/* ══════════════════════════════════════════════════════════════════════════
   Shared Sub-components
══════════════════════════════════════════════════════════════════════════ */

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

function DocumentTable({ title, docs, onViewClick }: { title: string; docs: any[]; onViewClick?: (doc: any) => void }) {
  return (
    <Card title={title}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
            {["DOCUMENT", "DATE", "TYPE", "ACTION"].map((h, i) => (
              <th key={h + i} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", textAlign: i === 3 ? "right" : "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.name} style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
              <td style={{ padding: "12px", fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-error)" }}>picture_as_pdf</span>{d.name}
                </div>
              </td>
              <td style={{ padding: "12px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>{d.date}</td>
              <td style={{ padding: "12px", fontSize: 12, fontWeight: 600 }}><span style={{ padding: "2px 8px", borderRadius: 6, background: "#fce8e8", color: "#b3261e" }}>{d.type}</span></td>
              <td style={{ padding: "12px", textAlign: "right" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 18,
                    color: "var(--color-on-surface-variant)",
                    cursor: onViewClick ? "pointer" : "default"
                  }}
                  onClick={() => onViewClick?.(d)}
                >
                  visibility
                </span>
              </td>
            </tr>
          ))}
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
