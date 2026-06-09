"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PatientFormModal from "@/components/patients/PatientFormModal";

/* ── Mock patient data ─────────────────────────────────────────────────── */
const MOCK: Record<string, any> = {
  "RC-84920": { name: "Abernathy, Sarah", dob: "04/12/1988", age: 35, ehr: "PT-9482-A", provider: "Dr. E. Carter", gender: "Female", phone: "(555) 234-5678", email: "sarah.abernathy@email.com", address: "142 Maple St, Springfield, IL 62704", emergency: "John Abernathy (Spouse) — (555) 234-0000", status: "Active", diagnosis: "F41.1 — Generalized Anxiety Disorder", programs: ["CBT Group Therapy"], gad7: 14, phq9: 8 },
  "RC-84921": { name: "Chen, Wei", dob: "11/03/1995", age: 29, ehr: "PT-9483-B", provider: "Dr. A. Okafor", gender: "Male", phone: "(555) 345-6789", email: "wei.chen@email.com", address: "88 Oak Ave, Chicago, IL 60614", emergency: "Lin Chen (Parent) — (555) 345-0000", status: "Active", diagnosis: "F33.1 — Major Depressive Disorder, Recurrent", programs: ["Medication Management"], gad7: 6, phq9: 16 },
  "RC-84922": { name: "Doe, Jonathan", dob: "07/22/1976", age: 48, ehr: "PT-9484-C", provider: "Dr. S. Adeyemi", gender: "Male", phone: "(555) 456-7890", email: "j.doe@email.com", address: "301 Pine Rd, Naperville, IL 60540", emergency: "Mary Doe (Spouse) — (555) 456-0000", status: "Inactive", diagnosis: "F43.10 — PTSD, Unspecified", programs: [], gad7: 4, phq9: 5 },
};

const TABS = ["Overview", "Folder", "Programs", "Compliance"] as const;
type Tab = (typeof TABS)[number];

/* ══════════════════════════════════════════════════════════════════════════ */
export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [showEditModal, setShowEditModal] = useState(false);

  const p = MOCK[patientId] ?? MOCK["RC-84920"];
  const statusColor = p.status === "Active" ? "#137333" : p.status === "Inactive" ? "#b3261e" : "#5f6368";
  const statusBg = p.status === "Active" ? "#e6f4ea" : p.status === "Inactive" ? "#fce8e8" : "#f1f3f4";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/patients")}>Patients</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{patientId}</span>
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
          <HeaderBtn icon="edit" label="Edit Profile" onClick={() => setShowEditModal(true)} />
          <HeaderBtn icon="notification_important" label="Alert" color="var(--color-error)" />
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
      {activeTab === "Overview" && <OverviewTab p={p} />}
      {activeTab === "Folder" && <FolderTab />}
      {activeTab === "Programs" && <ProgramsTab p={p} />}
      {activeTab === "Compliance" && <ComplianceTab />}

      {/* ── Edit Patient Modal ─────────────────────────────────────────── */}
      {showEditModal && (
        <PatientFormModal
          mode="edit"
          initialData={{
            firstName: p.name.split(", ")[1],
            lastName: p.name.split(", ")[0],
            dob: p.dob,
            gender: p.gender,
            diagnosis: p.diagnosis,
            provider: p.provider,
            phone: p.phone,
            email: p.email,
            address: p.address,
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Tab Components
══════════════════════════════════════════════════════════════════════════ */

function OverviewTab({ p }: { p: any }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
      {/* Left — clinical summary */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card title="Clinical Summary">
          <Row label="Primary Diagnosis" value={p.diagnosis} />
          <Row label="Assigned Provider" value={p.provider} />
          <Row label="Gender" value={p.gender} />
          <Row label="Active Programs" value={p.programs.length > 0 ? p.programs.join(", ") : "None"} />
        </Card>
        <Card title="Contact Information">
          <Row label="Phone" value={p.phone} />
          <Row label="Email" value={p.email} />
          <Row label="Address" value={p.address} />
          <Row label="Emergency Contact" value={p.emergency} />
        </Card>
      </div>
      {/* Right — scores & alerts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <ScoreCard label="GAD-7 Score" score={p.gad7} max={21} color={p.gad7 >= 15 ? "#b3261e" : p.gad7 >= 10 ? "#e65100" : "#137333"} />
        <ScoreCard label="PHQ-9 Score" score={p.phq9} max={27} color={p.phq9 >= 15 ? "#b3261e" : p.phq9 >= 10 ? "#e65100" : "#137333"} />
        <Card title="Upcoming Appointments">
          <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0 }}>No upcoming appointments scheduled.</p>
        </Card>
      </div>
    </div>
  );
}

function FolderTab() {
  const docs = [
    { name: "Initial Intake Form", date: "Jan 15, 2024", type: "PDF" },
    { name: "Progress Note — Session 4", date: "Mar 02, 2024", type: "PDF" },
    { name: "Lab Results — Blood Panel", date: "Feb 18, 2024", type: "PDF" },
    { name: "Insurance Verification", date: "Jan 10, 2024", type: "PDF" },
  ];
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
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-on-surface-variant)", cursor: "pointer" }}>download</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ProgramsTab({ p }: { p: any }) {
  return (
    <Card title="Enrolled Programs">
      {p.programs.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0 }}>Patient is not enrolled in any programs.</p>
      ) : (
        p.programs.map((prog: string) => (
          <div key={prog} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--color-outline-variant)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 20, color: "var(--color-secondary)" }}>school</span>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>{prog}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--color-on-surface-variant)" }}>Enrolled since Jan 2024</span>
              </div>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: "#e6f4ea", color: "#137333" }}>Active</span>
          </div>
        ))
      )}
    </Card>
  );
}

function ComplianceTab() {
  const items = [
    { task: "Signed Consent Form", status: "Complete", date: "Jan 15, 2024", icon: "check_circle", color: "#137333" },
    { task: "HIPAA Acknowledgment", status: "Complete", date: "Jan 15, 2024", icon: "check_circle", color: "#137333" },
    { task: "Progress Note — Session 5", status: "Pending Signature", date: "Mar 10, 2024", icon: "pending", color: "#e65100" },
    { task: "Annual Risk Assessment", status: "Overdue", date: "Due Feb 28, 2024", icon: "error", color: "#b3261e" },
    { task: "Treatment Plan Review", status: "Complete", date: "Feb 20, 2024", icon: "check_circle", color: "#137333" },
  ];
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
              <circle cx="60" cy="60" r="50" fill="none" stroke="#137333" strokeWidth="10" strokeDasharray={`${(3 / 5) * 314} 314`} strokeLinecap="round" transform="rotate(-90 60 60)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#137333" }}>60%</div>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", marginTop: 12 }}>3 of 5 items complete</p>
        </div>
      </Card>
    </div>
  );
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-outline-variant)" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-on-surface)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

function ScoreCard({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, padding: 20 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 14, color: "var(--color-on-surface-variant)" }}>/ {max}</span>
      </div>
      <div style={{ width: "100%", height: 6, borderRadius: 3, background: "#e8eaed", marginTop: 12 }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: color }} />
      </div>
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
