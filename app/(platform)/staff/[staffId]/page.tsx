"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* ── Mock staff data ─────────────────────────────────────────────────── */
const MOCK: Record<string, any> = {
  "EMP-4821": { name: "Dr. Eleanor Vance", role: "Lead Psychiatrist", dept: "Psychiatry", category: "Clinical", email: "e.vance@bles-ehr.com", phone: "(555) 123-4567", address: "142 Maple St, Springfield, IL 62704", status: "Active", programs: ["CBT Group Therapy", "Trauma Support"], avatarBg: "#0f4c81", initials: "EV", joined: "04/12/2018", roleColor: "#e65100" },
  "EMP-3196": { name: "Marcus Thorne", role: "Clinical Nurse", dept: "Pediatrics", category: "Clinical", email: "m.thorne@bles-ehr.com", phone: "(555) 987-6543", address: "88 Oak Ave, Chicago, IL 60614", status: "Active", programs: ["Medication Management"], avatarBg: "#006970", initials: "MT", joined: "11/03/2020", roleColor: "#e65100" },
  "EMP-1862": { name: "Sarah Jenkins", role: "Systems Admin", dept: "IT", category: "Admin", email: "s.jenkins@bles-ehr.com", phone: "(555) 555-5555", address: "301 Pine Rd, Naperville, IL 60540", status: "Inactive", programs: [], avatarBg: "#7a3700", initials: "SJ", joined: "07/22/2016", roleColor: "#0f4c81" },
};

const TABS = ["Overview", "Tasks", "Programs", "Queries"] as const;
type Tab = (typeof TABS)[number];

/* ══════════════════════════════════════════════════════════════════════════ */
export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.staffId as string;
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const p = MOCK[staffId] ?? MOCK["EMP-4821"];
  const statusColor = p.status === "Active" ? "#137333" : p.status === "Inactive" ? "#b3261e" : "#5f6368";
  const statusBg = p.status === "Active" ? "#e6f4ea" : p.status === "Inactive" ? "#fce8e8" : "#f1f3f4";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/staff")}>Staff Directory</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{staffId}</span>
      </div>

      {/* ── Staff header card ─────────────────────────────────────────── */}
      <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, padding: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        {/* Avatar */}
        <div style={{ width: 72, height: 72, borderRadius: 12, background: p.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", letterSpacing: "0.02em" }}>{p.initials}</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{p.name}</h2>
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 18, color: "var(--color-secondary)" }}>verified</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
            <InfoChip icon="badge" text={`ID: ${staffId}`} />
            <InfoChip icon="corporate_fare" text={`Dept: ${p.dept}`} />
            <InfoChip icon="work" text={p.role} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: statusBg, color: statusColor }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor }} />{p.status}
            </span>
            <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}>{p.category}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <HeaderBtn icon="edit" label="Edit Profile" />
          <HeaderBtn icon="more_vert" label="" />
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
      {activeTab === "Tasks" && <TasksTab />}
      {activeTab === "Programs" && <ProgramsTab p={p} />}
      {activeTab === "Queries" && <QueriesTab />}

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Tab Components
══════════════════════════════════════════════════════════════════════════ */

function OverviewTab({ p }: { p: any }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
      {/* Left — Professional summary */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card title="Professional Summary">
          <Row label="Department" value={p.dept} />
          <Row label="Role" value={p.role} />
          <Row label="Category" value={p.category} />
          <Row label="Date Joined" value={p.joined} />
        </Card>
        <Card title="Contact Information">
          <Row label="Phone" value={p.phone} />
          <Row label="Email" value={p.email} />
          <Row label="Address" value={p.address} />
        </Card>
      </div>
      {/* Right — Stats */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <ScoreCard label="Active Tasks" score={12} max={20} color="#0f4c81" />
        <Card title="Recent Activity">
          <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0 }}>Last logged in: Today at 08:30 AM</p>
        </Card>
      </div>
    </div>
  );
}

function TasksTab() {
  const tasks = [
    { name: "Review patient intake forms", dueDate: "Today", priority: "High" },
    { name: "Update medication records", dueDate: "Tomorrow", priority: "Medium" },
    { name: "Attend weekly clinical meeting", dueDate: "Oct 15, 2024", priority: "Low" },
    { name: "Complete annual compliance training", dueDate: "Oct 30, 2024", priority: "High" },
  ];
  return (
    <Card title="Assigned Tasks">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
            {["TASK", "DUE DATE", "PRIORITY", ""].map((h, i) => (
              <th key={h + i} style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.name} style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
              <td style={{ padding: "12px", fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary)" }}>task_alt</span>{t.name}
                </div>
              </td>
              <td style={{ padding: "12px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>{t.dueDate}</td>
              <td style={{ padding: "12px", fontSize: 12, fontWeight: 600 }}>
                <span style={{ padding: "2px 8px", borderRadius: 6, background: t.priority === "High" ? "#fce8e8" : t.priority === "Medium" ? "#fff3e0" : "#e6f4ea", color: t.priority === "High" ? "#b3261e" : t.priority === "Medium" ? "#e65100" : "#137333" }}>{t.priority}</span>
              </td>
              <td style={{ padding: "12px", textAlign: "right" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-on-surface-variant)", cursor: "pointer" }}>more_horiz</span>
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
    <Card title="Assigned Programs">
      {p.programs.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0 }}>Staff member is not assigned to any programs.</p>
      ) : (
        p.programs.map((prog: string) => (
          <div key={prog} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--color-outline-variant)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 20, color: "var(--color-secondary)" }}>school</span>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>{prog}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--color-on-surface-variant)" }}>Assigned since Jan 2024</span>
              </div>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: "#e6f4ea", color: "#137333" }}>Active</span>
          </div>
        ))
      )}
    </Card>
  );
}

function QueriesTab() {
  const items = [
    { title: "IT Support: Cannot access portal", status: "Resolved", date: "Jan 15, 2024", icon: "check_circle", color: "#137333" },
    { title: "HR: Updated tax documents", status: "Pending", date: "Mar 10, 2024", icon: "pending", color: "#e65100" },
    { title: "Maintenance: AC issue in room 402", status: "Open", date: "Oct 12, 2024", icon: "error", color: "#b3261e" },
  ];
  return (
    <Card title="Recent Queries">
      {items.map((it) => (
        <div key={it.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--color-outline-variant)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 20, color: it.color }}>{it.icon}</span>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>{it.title}</span>
              <span style={{ display: "block", fontSize: 12, color: "var(--color-on-surface-variant)" }}>{it.date}</span>
            </div>
          </div>
          <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: it.color === "#137333" ? "#e6f4ea" : it.color === "#e65100" ? "#fff3e0" : "#fce8e8", color: it.color }}>{it.status}</span>
        </div>
      ))}
    </Card>
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

function HeaderBtn({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
        border: "1px solid var(--color-outline-variant)", background: "transparent", fontSize: 13, fontWeight: 600,
        color: "var(--color-on-surface)", cursor: "pointer", transition: "background 0.12s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>{label}
    </button>
  );
}
