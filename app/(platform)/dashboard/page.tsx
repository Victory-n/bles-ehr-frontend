"use client";

import React from "react";

/* ── Stat card data ─────────────────────────────────────────────────────── */
const STATS = [
    {
        label:   "Total Patients",
        value:   "1,284",
        change:  "+12 this month",
        up:      true,
        icon:    "people",
        color:   "var(--color-primary-container)",
        bg:      "var(--color-surface-container-high)",
    },
    {
        label:   "Today's Appointments",
        value:   "24",
        change:  "6 remaining",
        up:      true,
        icon:    "event",
        color:   "var(--color-secondary)",
        bg:      "#e0fafa",
    },
    {
        label:   "Pending Notes",
        value:   "7",
        change:  "Requires review",
        up:      false,
        icon:    "description",
        color:   "var(--color-tertiary-container)",
        bg:      "var(--color-tertiary-fixed)",
    },
    {
        label:   "Billing (This Month)",
        value:   "₦4.2M",
        change:  "+8% vs last month",
        up:      true,
        icon:    "receipt_long",
        color:   "#1b5e20",
        bg:      "#e8f5e9",
    },
];

/* ── Recent appointments ────────────────────────────────────────────────── */
const APPOINTMENTS = [
    { id: "APT-001", patient: "John Adeyemi",   code: "PAT-0142", time: "10:00 AM", type: "Therapy Session",    status: "upcoming" },
    { id: "APT-002", patient: "Amara Okafor",   code: "PAT-0089", time: "11:30 AM", type: "Initial Assessment", status: "in-progress" },
    { id: "APT-003", patient: "Emeka Nwosu",    code: "PAT-0201", time: "01:00 PM", type: "Follow-Up",          status: "upcoming" },
    { id: "APT-004", patient: "Fatima Bello",   code: "PAT-0057", time: "02:15 PM", type: "Group Therapy",      status: "upcoming" },
    { id: "APT-005", patient: "Chidi Eze",      code: "PAT-0310", time: "09:00 AM", type: "Psychiatric Review", status: "completed" },
];

/* ── Compliance alerts ──────────────────────────────────────────────────── */
const ALERTS = [
    { label: "3 compliance forms due today",            severity: "error"   },
    { label: "2 clinical notes pending co-signature",   severity: "warning" },
    { label: "Medication review overdue — PAT-0089",    severity: "warning" },
];

/* ── Helpers ────────────────────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    upcoming:    { bg: "var(--color-surface-container-high)",   color: "var(--color-primary-container)", label: "Upcoming"     },
    "in-progress": { bg: "#fff8e1",                            color: "#e65100",                        label: "In Progress"  },
    completed:   { bg: "#e8f5e9",                              color: "#1b5e20",                        label: "Completed"    },
};

const SEVERITY_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
    error:   { bg: "var(--color-error-container)",   color: "var(--color-on-error-container)", icon: "error"   },
    warning: { bg: "#fff8e1",                        color: "#e65100",                         icon: "warning" },
};

/* ══════════════════════════════════════════════════════════════════════════
   Dashboard page (server component — no auth wiring yet)
══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* ── Page header ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-on-surface)", marginBottom: 4 }}>
                        Good morning 👋
                    </h2>
                    <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)" }}>{today}</p>
                </div>

                {/* Quick-action button */}
                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 18px",
                        borderRadius: 10,
                        border: "none",
                        background: "var(--color-primary-container)",
                        color: "#ffffff",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                    New Appointment
                </button>
            </div>

            {/* ── Compliance alerts ────────────────────────────────────────────── */}
            {ALERTS.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ALERTS.map((alert, i) => {
                        const s = SEVERITY_STYLES[alert.severity];
                        return (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "10px 14px",
                                    borderRadius: 10,
                                    background: s.bg,
                                }}
                            >
                <span className="material-symbols-outlined icon-fill" style={{ fontSize: 18, color: s.color, flexShrink: 0 }}>
                  {s.icon}
                </span>
                                <p style={{ fontSize: 13, fontWeight: 500, color: s.color }}>{alert.label}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Stat cards ──────────────────────────────────────────────────── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 16,
                }}
            >
                {STATS.map((s) => (
                    <div
                        key={s.label}
                        style={{
                            background: "#ffffff",
                            borderRadius: 14,
                            padding: 20,
                            border: "1px solid var(--color-outline-variant)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}
                    >
                        {/* Icon */}
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                background: s.bg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 20, color: s.color }}>
                {s.icon}
              </span>
                        </div>

                        <div>
                            <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", marginBottom: 4 }}>{s.label}</p>
                            <p style={{ fontSize: 26, fontWeight: 700, color: "var(--color-on-surface)", lineHeight: 1 }}>{s.value}</p>
                        </div>

                        <p style={{ fontSize: 12, color: s.up ? "#1b5e20" : "var(--color-on-surface-variant)", display: "flex", alignItems: "center", gap: 2 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {s.up ? "trending_up" : "info"}
              </span>
                            {s.change}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Lower grid: appointments + quick links ───────────────────────── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) 280px",
                    gap: 16,
                    alignItems: "start",
                }}
            >
                {/* Today's appointments table */}
                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: 14,
                        border: "1px solid var(--color-outline-variant)",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-surface)" }}>Today&apos;s Appointments</p>
                        <button style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary-container)", background: "none", border: "none", cursor: "pointer" }}>
                            View all →
                        </button>
                    </div>

                    <div>
                        {APPOINTMENTS.map((apt, i) => {
                            const st = STATUS_STYLES[apt.status];
                            return (
                                <div
                                    key={apt.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                        padding: "13px 20px",
                                        borderBottom: i < APPOINTMENTS.length - 1 ? "1px solid var(--color-surface-container)" : "none",
                                        transition: "background 0.12s",
                                        cursor: "pointer",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    {/* Avatar */}
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%",
                                        background: "var(--color-surface-container-high)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 13, fontWeight: 700, color: "var(--color-primary-container)",
                                        flexShrink: 0,
                                    }}>
                                        {apt.patient.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                    </div>

                                    {/* Details */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 2 }}>{apt.patient}</p>
                                        <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{apt.code} · {apt.type}</p>
                                    </div>

                                    {/* Time */}
                                    <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-outline)", flexShrink: 0 }}>{apt.time}</p>

                                    {/* Status pill */}
                                    <span style={{
                                        fontSize: 11, fontWeight: 600, padding: "3px 10px",
                                        borderRadius: 20, background: st.bg, color: st.color,
                                        flexShrink: 0,
                                    }}>
                    {st.label}
                  </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick links panel */}
                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: 14,
                        border: "1px solid var(--color-outline-variant)",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-outline-variant)" }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-surface)" }}>Quick Actions</p>
                    </div>

                    <div style={{ padding: "8px 0" }}>
                        {[
                            { icon: "person_add",       label: "Register New Patient",  color: "var(--color-primary-container)" },
                            { icon: "note_add",         label: "Create Clinical Note",  color: "var(--color-secondary)" },
                            { icon: "calendar_add_on",  label: "Schedule Appointment",  color: "#7a3700" },
                            { icon: "receipt",          label: "Generate Invoice",       color: "#1b5e20" },
                            { icon: "upload_file",      label: "Upload Compliance Doc",  color: "var(--color-outline)" },
                        ].map(({ icon, label, color }) => (
                            <button
                                key={label}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    width: "100%",
                                    padding: "11px 20px",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    color: "var(--color-on-surface)",
                                    transition: "background 0.12s",
                                    textAlign: "left",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                                onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 20, color, flexShrink: 0 }}>{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
