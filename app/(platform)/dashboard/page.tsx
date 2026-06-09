"use client";

import React, { useState } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   Static Data
══════════════════════════════════════════════════════════════════════════ */

const SCHEDULE = [
  {
    time: "11:30 AM",
    patient: "Sarah Miller",
    initials: "SM",
    avatarBg: "#0f4c81",
    avatarColor: "#ffffff",
    type: "Initial Intake",
    status: "Checked In",
    statusColor: "#137333",
    statusBg: "#e6f4ea",
  },
  {
    time: "01:00 PM",
    patient: "John Doe",
    initials: "JD",
    avatarBg: "#7a3700",
    avatarColor: "#ffa46c",
    type: "Follow-up (CBT)",
    status: "Confirmed",
    statusColor: "#0f4c81",
    statusBg: "#d2e4ff",
  },
  {
    time: "02:30 PM",
    patient: "Elena Perez",
    initials: "EP",
    avatarBg: "#006970",
    avatarColor: "#8df2fc",
    type: "Medication Mgmt",
    status: "Pending",
    statusColor: "#93000a",
    statusBg: "#ffdad6",
  },
  {
    time: "04:00 PM",
    patient: "Michael K.",
    initials: "MK",
    avatarBg: "#0f4c81",
    avatarColor: "#ffffff",
    type: "Discharge Review",
    status: "Confirmed",
    statusColor: "#0f4c81",
    statusBg: "#d2e4ff",
  },
];

const QUICK_ACTIONS = [
  { icon: "edit_square", label: "Start Clinic Note" },
  { icon: "download",    label: "Export Daily Roster" },
  { icon: "lock_reset",  label: "Reset Access Code" },
];

/* ══════════════════════════════════════════════════════════════════════════
   Dashboard Page
══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [bannerVisible, setBannerVisible] = useState(true);

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });
  const month = today.toLocaleDateString("en-US", { month: "long" });
  const day = today.getDate();
  const suffix = ["th", "st", "nd", "rd"][
    day % 10 > 3 ? 0 : (day % 100) - (day % 10) !== 10 ? day % 10 : 0
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── System maintenance banner ──────────────────────────────────── */}
      {bannerVisible && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 24px",
            margin: "-24px -24px 0",
            background: "var(--color-surface-container-lowest)",
            borderBottom: "1px solid var(--color-outline-variant)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 16, color: "var(--color-secondary)", flexShrink: 0 }}
          >
            info
          </span>
          <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "var(--color-on-surface-variant)" }}>
            System maintenance scheduled for 02:00 AM EST. Services will be paused for approximately 30 minutes.
          </span>
          <button
            onClick={() => setBannerVisible(false)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>
      )}

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-on-background)", margin: 0, lineHeight: 1.2 }}>
            Good Morning, Dr. Vance.
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-on-surface-variant)", marginTop: 4 }}>
            Here is your clinical overview for {dayOfWeek}, {month} {day}{suffix}.
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "var(--color-primary)",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            flexShrink: 0,
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-primary-container)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          New Patient
        </button>
      </div>

      {/* ── Stat cards + Quick Actions ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>

        {/* Card 1 — Today's Appointments */}
        <StatCard
          label="TODAY'S APPOINTMENTS"
          icon="calendar_today"
          iconBg="var(--color-primary-container)"
          iconColor="#ffffff"
          value="8"
          sub="2 remaining"
          subColor="var(--color-on-surface-variant)"
          footer={
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 10px",
              borderRadius: 12,
              border: "1px solid var(--color-primary-fixed-dim)",
              background: "var(--color-surface-container-low)",
              color: "var(--color-primary)",
              fontSize: 12,
              fontWeight: 600,
            }}>
              Next at 11:30 AM
            </span>
          }
        />

        {/* Card 2 — Pending Notes */}
        <StatCard
          label="PENDING NOTES"
          icon="edit_document"
          iconBg="#fce8e8"
          iconColor="#b3261e"
          value="3"
          sub="Needs attention"
          subColor="var(--color-error)"
          footer={
            <div style={{ width: "100%", height: 6, borderRadius: 3, background: "#e8eaed", overflow: "hidden", display: "flex" }}>
              <div style={{ width: "35%", background: "#b3261e", borderRadius: 3 }} />
            </div>
          }
        />

        {/* Card 3 — Compliance Score */}
        <StatCard
          label="COMPLIANCE SCORE"
          icon="check_circle"
          iconBg="#e0f5f5"
          iconColor="var(--color-secondary)"
          value="98%"
          sub="↑ 2% this week"
          subColor="var(--color-secondary)"
          footer={
            <div style={{ width: "100%", height: 6, borderRadius: 3, background: "#e8eaed", overflow: "hidden" }}>
              <div style={{ width: "98%", background: "var(--color-secondary)", borderRadius: 3, height: "100%" }} />
            </div>
          }
        />

        {/* Card 4 — Quick Actions */}
        <div style={{
          background: "var(--color-surface-container-low)",
          border: "1px solid var(--color-outline-variant)",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-on-surface-variant)", marginBottom: 4 }}>
            QUICK ACTIONS
          </span>
          {QUICK_ACTIONS.map(({ icon, label }) => (
            <button
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--color-outline-variant)",
                background: "var(--color-surface-container-lowest)",
                cursor: "pointer",
                transition: "background 0.12s",
                width: "100%",
                textAlign: "left",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-surface-container-lowest)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-on-surface-variant)" }}>{icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content: Schedule table + Right sidebar ───────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>

        {/* ── Schedule Table ───────────────────────────────────────────── */}
        <div style={{
          background: "var(--color-surface-container-lowest)",
          border: "1px solid var(--color-outline-variant)",
          borderRadius: 12,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-outline-variant)",
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-on-surface)", margin: 0 }}>
              Upcoming Schedule
            </h3>
            <div style={{ display: "flex", gap: 4 }}>
              <IconBtn icon="filter_list" />
              <IconBtn icon="more_vert" />
            </div>
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                {["TIME", "PATIENT NAME", "TYPE", "STATUS"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 20px",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: "var(--color-on-surface-variant)",
                      textAlign: i === 3 ? "right" : "left",
                      background: "var(--color-surface-container-low)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((row, i) => (
                <tr
                  key={row.initials + i}
                  style={{
                    borderBottom: i < SCHEDULE.length - 1 ? "1px solid var(--color-outline-variant)" : "none",
                    transition: "background 0.12s",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Time */}
                  <td style={{ padding: "14px 20px", fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--color-on-surface-variant)", whiteSpace: "nowrap" }}>
                    {row.time}
                  </td>
                  {/* Patient */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        background: row.avatarBg,
                        color: row.avatarColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {row.initials}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", whiteSpace: "nowrap" }}>
                        {row.patient}
                      </span>
                    </div>
                  </td>
                  {/* Type */}
                  <td style={{ padding: "14px 20px", fontSize: 14, color: "var(--color-on-surface-variant)", whiteSpace: "nowrap" }}>
                    {row.type}
                  </td>
                  {/* Status */}
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: row.statusBg,
                      color: row.statusColor,
                    }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Right sidebar cards ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Incomplete Documentation alert */}
          <div style={{
            background: "var(--color-surface-container-lowest)",
            border: "1px solid var(--color-error-container)",
            borderRadius: 12,
            overflow: "hidden",
            position: "relative",
          }}>
            {/* Red left bar */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "var(--color-error)" }} />
            <div style={{ padding: "16px 16px 16px 20px", display: "flex", gap: 10 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--color-error)", flexShrink: 0, marginTop: 1 }}>
                gpp_bad
              </span>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)", margin: 0 }}>
                  Incomplete Documentation
                </h4>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--color-on-surface-variant)", margin: "6px 0 12px" }}>
                  2 progress notes from yesterday remain unsigned. PHI regulations require signature within 48 hours.
                </p>
                <button
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--color-outline-variant)",
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-on-surface)",
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Review Notes
                </button>
              </div>
            </div>
          </div>

          {/* Clinical Insight card */}
          <div style={{
            background: "#f6f9fd",
            border: "1px solid var(--color-primary-fixed-dim)",
            borderRadius: 12,
            padding: 16,
          }}>
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 10,
              marginBottom: 12,
              borderBottom: "1px solid rgba(15,76,129,0.12)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary-container)" }}>psychology</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary-container)" }}>Clinical Insight</span>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-outline)" }}>lock</span>
            </div>

            {/* Insight content */}
            <div style={{
              background: "var(--color-surface-container-lowest)",
              border: "1px solid rgba(15,76,129,0.12)",
              borderRadius: 8,
              padding: 12,
            }}>
              <span style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-on-surface-variant)", marginBottom: 6 }}>
                Patient: John Doe (01:00 PM)
              </span>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--color-on-surface)", margin: 0, fontWeight: 500 }}>
                Patient reported elevated anxiety scores in pre-session questionnaire (GAD-7: 14). Suggest reviewing coping strategies early in session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════════════════════════════════ */

/** Reusable stat card (appointments, notes, compliance) */
function StatCard({
  label,
  icon,
  iconBg,
  iconColor,
  value,
  sub,
  subColor,
  footer,
}: {
  label: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  value: string;
  sub: string;
  subColor: string;
  footer: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--color-surface-container-lowest)",
      border: "1px solid var(--color-outline-variant)",
      borderRadius: 12,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: 150,
    }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-on-surface-variant)" }}>
          {label}
        </span>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: iconColor }}>{icon}</span>
        </div>
      </div>
      {/* Value */}
      <div style={{ marginTop: 12 }}>
        <span style={{ fontSize: 34, fontWeight: 700, lineHeight: 1, color: "var(--color-on-background)" }}>{value}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: subColor, marginLeft: 6 }}>{sub}</span>
      </div>
      {/* Footer */}
      <div style={{ marginTop: 14 }}>
        {footer}
      </div>
    </div>
  );
}

/** Small icon button for table toolbar */
function IconBtn({ icon }: { icon: string }) {
  return (
    <button
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        border: "none",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--color-on-surface-variant)",
        transition: "background 0.12s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
    </button>
  );
}
