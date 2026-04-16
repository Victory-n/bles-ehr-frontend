"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
type AlertSeverity = "critical" | "high" | "medium" | "low";
type AlertType = "overdue_note" | "expired_treatment_plan" | "missing_document" | "unsigned_note" | "missed_appointment";
type AlertStatus = "open" | "resolved" | "reopened";

type ModalType =
    | "create_alert"
    | "view_alert"
    | "resolve_alert"
    | "reopen_alert"
    | "run_scan"
    | "scan_confirm"
    | null;

type ScanType = "full" | "overdue_notes" | "expired_plans" | "missing_docs";

interface ComplianceAlert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    status: AlertStatus;
    patientId: string;
    patientName: string;
    patientInitials: string;
    patientColor: string;
    title: string;
    description: string;
    createdAt: string;
    resolvedAt: string | null;
    resolvedBy: string | null;
    resolutionNote: string | null;
    assignedTo: string;
    dueDate: string | null;
    relatedRecordId: string | null;
}

/* ─────────────────────────────────────
   MOCK DATA
───────────────────────────────────── */
const MOCK_ALERTS: ComplianceAlert[] = [
    {
        id: "ALT-0001", type: "overdue_note", severity: "critical", status: "open",
        patientId: "PAT-0138", patientName: "Emeka Afolabi", patientInitials: "EA", patientColor: "#C94040",
        title: "Crisis Assessment Note Unsigned >24hrs",
        description: "Crisis assessment conducted on 09 Apr 2026 has not been signed by the clinician within the required 24-hour window. This is a HIPAA documentation compliance violation.",
        createdAt: "10 Apr 2026, 07:00 AM", resolvedAt: null, resolvedBy: null, resolutionNote: null,
        assignedTo: "Dr. A. Kolade", dueDate: "10 Apr 2026", relatedRecordId: "NOTE-004",
    },
    {
        id: "ALT-0002", type: "missing_document", severity: "critical", status: "open",
        patientId: "PAT-0141", patientName: "Chidi Nwosu", patientInitials: "CN", patientColor: "#6B5ED4",
        title: "5 Required Consent Forms Missing",
        description: "Patient Chidi Nwosu is enrolled in active programs but is missing 5 required HIPAA compliance forms including Informed Consent for Mental Health Services, Financial Responsibility Agreement, and No-show Policy.",
        createdAt: "14 Apr 2026, 09:15 AM", resolvedAt: null, resolvedBy: null, resolutionNote: null,
        assignedTo: "Dr. A. Kolade", dueDate: "16 Apr 2026", relatedRecordId: "PAT-0141",
    },
    {
        id: "ALT-0003", type: "unsigned_note", severity: "high", status: "open",
        patientId: "PAT-0130", patientName: "Fatima Hassan", patientInitials: "FH", patientColor: "#D98326",
        title: "OCD ERP Session Note — Draft Unsigned",
        description: "Session note for the ERP session dated 08 Apr 2026 remains in draft status and has not been signed by Dr. B. Adeyemi. Unsigned notes are not legally valid clinical records.",
        createdAt: "10 Apr 2026, 08:30 AM", resolvedAt: null, resolvedBy: null, resolutionNote: null,
        assignedTo: "Dr. B. Adeyemi", dueDate: "11 Apr 2026", relatedRecordId: "NOTE-006",
    },
    {
        id: "ALT-0004", type: "expired_treatment_plan", severity: "high", status: "open",
        patientId: "PAT-0128", patientName: "Kunle Balogun", patientInitials: "KB", patientColor: "#7A9490",
        title: "Treatment Plan Expired — SUD Recovery",
        description: "Kunle Balogun's Substance Use Disorder treatment plan expired on 10 Apr 2026. A renewed plan must be completed and signed before continuing sessions. Patient also has 2 missed appointments.",
        createdAt: "11 Apr 2026, 07:00 AM", resolvedAt: null, resolvedBy: null, resolutionNote: null,
        assignedTo: "Dr. F. Eze", dueDate: "14 Apr 2026", relatedRecordId: "PAT-0128",
    },
    {
        id: "ALT-0005", type: "missed_appointment", severity: "medium", status: "open",
        patientId: "PAT-0128", patientName: "Kunle Balogun", patientInitials: "KB", patientColor: "#7A9490",
        title: "2 Consecutive Missed Sessions",
        description: "Patient Kunle Balogun has missed 2 consecutive scheduled appointments (02 Apr and 08 Apr). Per care protocol, a welfare check and re-engagement attempt must be documented within 5 business days.",
        createdAt: "09 Apr 2026, 08:00 AM", resolvedAt: null, resolvedBy: null, resolutionNote: null,
        assignedTo: "Dr. F. Eze", dueDate: "15 Apr 2026", relatedRecordId: "APT-016",
    },
    {
        id: "ALT-0006", type: "overdue_note", severity: "medium", status: "open",
        patientId: "PAT-0141", patientName: "Chidi Nwosu", patientInitials: "CN", patientColor: "#6B5ED4",
        title: "Psychiatric Evaluation Note Overdue",
        description: "Psychiatric evaluation conducted on 12 Apr 2026 does not have a completed and signed note. Draft was started but remained incomplete for 36+ hours past the required submission window.",
        createdAt: "14 Apr 2026, 08:00 AM", resolvedAt: null, resolvedBy: null, resolutionNote: null,
        assignedTo: "Dr. A. Kolade", dueDate: "15 Apr 2026", relatedRecordId: "NOTE-003",
    },
    {
        id: "ALT-0007", type: "missing_document", severity: "medium", status: "resolved",
        patientId: "PAT-0135", patientName: "Ngozi Eze", patientInitials: "NE", patientColor: "#27A76A",
        title: "Telehealth Consent Form Missing",
        description: "Patient Ngozi Eze was offered telehealth services but had not signed the Telehealth Consent form. Form was subsequently sent and signed.",
        createdAt: "15 Mar 2026, 10:00 AM", resolvedAt: "17 Mar 2026, 02:00 PM", resolvedBy: "Dr. C. Obi",
        resolutionNote: "Patient signed the Telehealth Consent form (CF-007) via secure link on 17 Mar 2026. Uploaded to compliance folder.", assignedTo: "Dr. C. Obi",
        dueDate: "20 Mar 2026", relatedRecordId: "CF-007",
    },
    {
        id: "ALT-0008", type: "expired_treatment_plan", severity: "low", status: "resolved",
        patientId: "PAT-0142", patientName: "Amara Okafor", patientInitials: "AO", patientColor: "#2C7A6E",
        title: "Treatment Plan Renewal Required — CBT",
        description: "CBT treatment plan for Amara Okafor was approaching its 6-month end date and required renewal and re-signing per facility policy.",
        createdAt: "28 Feb 2026, 07:00 AM", resolvedAt: "02 Mar 2026, 11:30 AM", resolvedBy: "Dr. B. Adeyemi",
        resolutionNote: "New treatment plan signed and uploaded. Extended CBT engagement approved for additional 6 months.", assignedTo: "Dr. B. Adeyemi",
        dueDate: "05 Mar 2026", relatedRecordId: "PAT-0142",
    },
    {
        id: "ALT-0009", type: "unsigned_note", severity: "low", status: "resolved",
        patientId: "PAT-0135", patientName: "Ngozi Eze", patientInitials: "NE", patientColor: "#27A76A",
        title: "EMDR Session Note Signed Late",
        description: "Session note for EMDR session dated 28 Mar 2026 was signed 26 hours after the session, exceeding the 24-hour window by 2 hours. Note was eventually signed and locked.",
        createdAt: "29 Mar 2026, 10:00 AM", resolvedAt: "30 Mar 2026, 09:00 AM", resolvedBy: "Dr. C. Obi",
        resolutionNote: "Note was signed and locked on 30 Mar 2026. Incident documented per compliance policy. Will monitor for recurrence.", assignedTo: "Dr. C. Obi",
        dueDate: "29 Mar 2026", relatedRecordId: "NOTE-005",
    },
];

const LAST_SCAN_RESULTS = {
    ran: "14 Apr 2026 at 07:00 AM",
    overdueNotes: 2,
    expiredPlans: 2,
    missingDocs: 4,
    total: 8,
};

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const severityConfig: Record<AlertSeverity, { label: string; color: string; bg: string; border: string; dot: string }> = {
    critical: { label: "Critical", color: "var(--danger)",  bg: "var(--danger-light)",  border: "var(--danger)",  dot: "#C94040" },
    high:     { label: "High",     color: "#b45309",        bg: "#FEF3E2",               border: "#f59e0b",        dot: "#D98326" },
    medium:   { label: "Medium",   color: "var(--purple)",  bg: "var(--purple-light)",   border: "var(--purple)",  dot: "#6B5ED4" },
    low:      { label: "Low",      color: "var(--primary)", bg: "var(--primary-light)",  border: "var(--primary)", dot: "#2C7A6E" },
};

const alertTypeConfig: Record<AlertType, { label: string; icon: string; color: string }> = {
    overdue_note:            { label: "Overdue Note",          icon: "📝", color: "var(--danger)" },
    expired_treatment_plan:  { label: "Expired Treatment Plan",icon: "📅", color: "#D98326" },
    missing_document:        { label: "Missing Document",      icon: "📄", color: "var(--purple)" },
    unsigned_note:           { label: "Unsigned Note",         icon: "✍️", color: "#b45309" },
    missed_appointment:      { label: "Missed Appointment",    icon: "⚠️", color: "var(--warning)" },
};

const statusConfig: Record<AlertStatus, { label: string; chip: string }> = {
    open:     { label: "Open",     chip: "chip-critical" },
    resolved: { label: "Resolved", chip: "chip-active" },
    reopened: { label: "Reopened", chip: "chip-pending" },
};

/* ─────────────────────────────────────
   CREATE ALERT MODAL
───────────────────────────────────── */
function CreateAlertModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({ patientId: "", type: "", severity: "medium", title: "", description: "", assignedTo: "", dueDate: "" });
    const [saving, setSaving] = useState(false);

    const patients = [
        { id: "PAT-0142", name: "Amara Okafor — PAT-0142" },
        { id: "PAT-0141", name: "Chidi Nwosu — PAT-0141" },
        { id: "PAT-0138", name: "Emeka Afolabi — PAT-0138" },
        { id: "PAT-0135", name: "Ngozi Eze — PAT-0135" },
        { id: "PAT-0130", name: "Fatima Hassan — PAT-0130" },
        { id: "PAT-0128", name: "Kunle Balogun — PAT-0128" },
    ];
    const staff = [
        "Dr. C. Obi — Psychologist", "Dr. B. Adeyemi — Psychiatrist",
        "Dr. A. Kolade — Psychiatrist", "Dr. F. Eze — Counsellor", "Admin",
    ];

    const up = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 580, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--danger-light)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>Create Compliance Alert</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Manually flag a compliance issue for follow-up</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Patient + Type */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Patient</label>
                            <select className="form-input" value={form.patientId} onChange={e => up("patientId", e.target.value)} style={{ cursor: "pointer" }}>
                                <option value="">Select patient</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Alert Type</label>
                            <select className="form-input" value={form.type} onChange={e => up("type", e.target.value)} style={{ cursor: "pointer" }}>
                                <option value="">Select type</option>
                                {Object.entries(alertTypeConfig).map(([k, v]) => (
                                    <option key={k} value={k}>{v.icon} {v.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="form-label">Severity</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                            {(["critical", "high", "medium", "low"] as AlertSeverity[]).map(s => {
                                const cfg = severityConfig[s];
                                const active = form.severity === s;
                                return (
                                    <button key={s} onClick={() => up("severity", s)} style={{ padding: "9px 8px", border: `1.5px solid ${active ? cfg.color : "var(--border)"}`, borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: active ? cfg.bg : "var(--card)", color: active ? cfg.color : "var(--muted)", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s", textTransform: "capitalize" }}>
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Alert Title</label>
                        <input className="form-input" type="text" placeholder="Brief description of the compliance issue…" value={form.title} onChange={e => up("title", e.target.value)} />
                    </div>

                    {/* Description */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows={3} placeholder="Detailed description of the compliance issue, applicable regulations, and required action…" value={form.description} onChange={e => up("description", e.target.value)} style={{ resize: "none" }} />
                    </div>

                    {/* Assigned to + Due date */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Assign To</label>
                            <select className="form-input" value={form.assignedTo} onChange={e => up("assignedTo", e.target.value)} style={{ cursor: "pointer" }}>
                                <option value="">Select assignee</option>
                                {staff.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Due Date <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></label>
                            <input className="form-input" type="date" value={form.dueDate} onChange={e => up("dueDate", e.target.value)} />
                        </div>
                    </div>

                    <div style={{ background: "var(--warning-light)", border: "1px solid #f5c58a", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 9 }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
                        <div style={{ fontSize: 12, color: "var(--fg-mid)", lineHeight: 1.6 }}>
                            Compliance alerts are automatically generated by the compliance scan engine. Manually created alerts are also logged in the HIPAA audit trail and cannot be deleted once created.
                        </div>
                    </div>
                </div>

                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button onClick={() => { setSaving(true); setTimeout(() => { setSaving(false); onClose(); }, 900); }}
                            disabled={saving || !form.patientId || !form.type || !form.title}
                            style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: (!form.patientId || !form.type || !form.title) ? "var(--border)" : "var(--danger)", cursor: (!form.patientId || !form.type || !form.title) ? "not-allowed" : "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: saving ? 0.8 : 1 }}>
                        {saving ? "Creating…" : "Create Alert"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   VIEW ALERT MODAL
───────────────────────────────────── */
function ViewAlertModal({ alert, onClose, onResolve, onReopen }: {
    alert: ComplianceAlert; onClose: () => void;
    onResolve: () => void; onReopen: () => void;
}) {
    const sev = severityConfig[alert.severity];
    const typ = alertTypeConfig[alert.type];
    const sta = statusConfig[alert.status];

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 640, boxShadow: "0 32px 80px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                {/* Color strip */}
                <div style={{ height: 5, background: sev.color }} />

                {/* Header */}
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8, flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "3px 9px", borderRadius: 5 }}>{alert.id}</span>
                            <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 11px", borderRadius: 20, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`, fontFamily: "'Space Mono', monospace", textTransform: "uppercase" }}>{sev.label}</span>
                            <span className={`chip ${sta.chip}`}>{sta.label}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--fg-mid)", fontFamily: "'Space Mono', monospace" }}>
                                {typ.icon} {typ.label}
                            </span>
                        </div>
                        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{alert.title}</h2>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12 }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Description */}
                    <div style={{ background: alert.status === "open" ? "var(--danger-light)" : "var(--surface)", border: `1px solid ${alert.status === "open" ? "var(--danger)" : "var(--border)"}`, borderRadius: 10, padding: "14px 16px", fontSize: 13.5, color: "var(--fg-mid)", lineHeight: 1.7 }}>
                        {alert.description}
                    </div>

                    {/* Detail grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                        {[
                            { label: "Patient", value: `${alert.patientName} (${alert.patientId})` },
                            { label: "Assigned To", value: alert.assignedTo },
                            { label: "Due Date", value: alert.dueDate || "No deadline" },
                            { label: "Created", value: alert.createdAt },
                            { label: "Related Record", value: alert.relatedRecordId || "—" },
                            { label: "Status", value: sta.label },
                        ].map(row => (
                            <div key={row.label}>
                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{row.label}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{row.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Resolution info */}
                    {alert.status === "resolved" && alert.resolvedAt && (
                        <div style={{ background: "var(--success-light)", border: "1px solid var(--success)", borderRadius: 10, padding: "14px 16px" }}>
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--success)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>Resolution Details</div>
                            <div style={{ display: "flex", gap: 16, marginBottom: 8, fontSize: 12.5 }}>
                                <span style={{ color: "var(--muted)" }}>Resolved by: <strong style={{ color: "var(--fg)" }}>{alert.resolvedBy}</strong></span>
                                <span style={{ color: "var(--muted)" }}>On: <strong style={{ color: "var(--fg)" }}>{alert.resolvedAt}</strong></span>
                            </div>
                            {alert.resolutionNote && (
                                <div style={{ fontSize: 13, color: "var(--fg-mid)", lineHeight: 1.6 }}>{alert.resolutionNote}</div>
                            )}
                        </div>
                    )}

                    {/* HIPAA note */}
                    <div style={{ display: "flex", gap: 8, padding: "10px 14px", background: "var(--primary-light)", borderRadius: 9, border: "1px solid var(--primary-mid)" }}>
                        <span style={{ fontSize: 13 }}>🛡️</span>
                        <div style={{ fontSize: 12, color: "var(--primary-dark)", lineHeight: 1.5 }}>
                            This alert is part of the HIPAA compliance audit trail. All actions (resolve, reopen, note) are permanently logged.
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Close</button>
                    {alert.status === "open" && (
                        <button onClick={onResolve} style={{ padding: "9px 20px", border: "none", borderRadius: 9, background: "var(--success)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif" }}>✅ Mark Resolved</button>
                    )}
                    {alert.status === "resolved" && (
                        <button onClick={onReopen} style={{ padding: "9px 20px", border: "1.5px solid var(--warning)", borderRadius: 9, background: "var(--warning-light)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--warning)", fontFamily: "'Nunito', sans-serif" }}>♻️ Reopen Alert</button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   RESOLVE MODAL
───────────────────────────────────── */
function ResolveAlertModal({ alert, onClose, onConfirm }: { alert: ComplianceAlert; onClose: () => void; onConfirm: () => void }) {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                <div style={{ padding: "24px 26px" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>Mark Alert as Resolved</div>
                    <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
                        Resolving this alert confirms the compliance issue has been addressed. Provide a resolution note for the audit trail.
                    </div>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: "10px 14px", marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, color: "var(--fg)", fontSize: 13.5 }}>{alert.id} — {alert.title}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{alert.patientName} · {alert.assignedTo}</div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Resolution Note <span style={{ color: "var(--danger)" }}>*</span></label>
                        <textarea className="form-input" rows={4} placeholder="Describe how this issue was resolved and any corrective actions taken…" value={note} onChange={e => setNote(e.target.value)} style={{ resize: "none" }} />
                    </div>
                </div>
                <div style={{ padding: "14px 26px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button onClick={() => { if (!note.trim()) return; setLoading(true); setTimeout(() => { setLoading(false); onConfirm(); }, 900); }}
                            disabled={!note.trim() || loading}
                            style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: note.trim() ? "var(--success)" : "var(--border)", cursor: note.trim() ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Resolving…" : "Confirm Resolution"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   REOPEN MODAL
───────────────────────────────────── */
function ReopenAlertModal({ alert, onClose, onConfirm }: { alert: ComplianceAlert; onClose: () => void; onConfirm: () => void }) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 460, boxShadow: "0 24px 64px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                <div style={{ padding: "24px 26px" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>♻️</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>Reopen Alert</div>
                    <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
                        This will reopen the previously resolved alert and notify the assigned clinician. Provide a reason for reopening.
                    </div>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: "10px 14px", marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, color: "var(--fg)", fontSize: 13.5 }}>{alert.id} — {alert.title}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{alert.patientName}</div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Reason for Reopening <span style={{ color: "var(--danger)" }}>*</span></label>
                        <textarea className="form-input" rows={3} placeholder="Explain why this alert needs to be reopened…" value={reason} onChange={e => setReason(e.target.value)} style={{ resize: "none" }} />
                    </div>
                </div>
                <div style={{ padding: "14px 26px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button onClick={() => { if (!reason.trim()) return; setLoading(true); setTimeout(() => { setLoading(false); onConfirm(); }, 800); }}
                            disabled={!reason.trim() || loading}
                            style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: reason.trim() ? "var(--warning)" : "var(--border)", cursor: reason.trim() ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Reopening…" : "Reopen Alert"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   RUN SCAN MODAL
───────────────────────────────────── */
function RunScanModal({ onClose }: { onClose: () => void }) {
    const [scanType, setScanType] = useState<ScanType>("full");
    const [scanning, setScanning] = useState(false);
    const [done, setDone] = useState(false);
    const [results, setResults] = useState({ newAlerts: 0, skipped: 0 });

    const scans: { type: ScanType; icon: string; title: string; desc: string; endpoint: string }[] = [
        { type: "full", icon: "🔍", title: "Full Compliance Scan", desc: "Detects overdue notes, expired treatment plans, and missing documents. Idempotent — will not create duplicate open alerts.", endpoint: "/api/v1/compliance/scan/run" },
        { type: "overdue_notes", icon: "📝", title: "Scan Overdue Notes", desc: "Scan for session notes not signed within 24 hours of the service date.", endpoint: "/api/v1/compliance/scan/overdue-notes" },
        { type: "expired_plans", icon: "📅", title: "Scan Expired Treatment Plans", desc: "Scan for treatment plans that have passed their end date and require renewal.", endpoint: "/api/v1/compliance/scan/expired-treatment-plans" },
        { type: "missing_docs", icon: "📄", title: "Scan Missing Documents", desc: "Scan for enrolled patients missing required consent forms from their compliance folder.", endpoint: "/api/v1/compliance/scan/missing-documents" },
    ];

    const selected = scans.find(s => s.type === scanType)!;

    const handleRun = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            setDone(true);
            setResults({ newAlerts: scanType === "full" ? 3 : 1, skipped: scanType === "full" ? 5 : 2 });
        }, 2400);
    };

    if (done) {
        return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 480, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                    <div style={{ padding: "36px 28px", textAlign: "center" }}>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: results.newAlerts > 0 ? "var(--warning-light)" : "var(--success-light)", border: `2px solid ${results.newAlerts > 0 ? "var(--warning)" : "var(--success)"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 28 }}>
                            {results.newAlerts > 0 ? "⚠️" : "✅"}
                        </div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>Scan Complete</div>
                        <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 24 }}>
                            {selected.title} finished at {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} today.
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                            <div style={{ background: results.newAlerts > 0 ? "var(--danger-light)" : "var(--success-light)", border: `1px solid ${results.newAlerts > 0 ? "var(--danger)" : "var(--success)"}`, borderRadius: 12, padding: "16px" }}>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 700, color: results.newAlerts > 0 ? "var(--danger)" : "var(--success)" }}>{results.newAlerts}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: results.newAlerts > 0 ? "var(--danger)" : "var(--success)", marginTop: 2 }}>New Alerts Created</div>
                            </div>
                            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px" }}>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 700, color: "var(--fg)" }}>{results.skipped}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>Existing Alerts Skipped</div>
                            </div>
                        </div>

                        <button onClick={onClose} style={{ padding: "11px 32px", border: "none", borderRadius: 10, background: "var(--primary)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif" }}>
                            View Updated Alerts
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => !scanning && e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 600, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>Run Compliance Scan</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Automatically detect compliance issues across all patients</div>
                    </div>
                    {!scanning && (
                        <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    )}
                </div>

                {scanning ? (
                    <div style={{ padding: "48px 28px", textAlign: "center" }}>
                        {/* Animated scanner */}
                        <div style={{ width: 80, height: 80, margin: "0 auto 24px", position: "relative" }}>
                            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid var(--primary-light)" }} />
                            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite" }} />
                            <div style={{ position: "absolute", inset: "50%", transform: "translate(-50%,-50%)", fontSize: 24 }}>{selected.icon}</div>
                        </div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 8 }}>Scanning in progress…</div>
                        <div style={{ fontSize: 13, color: "var(--muted)" }}>{selected.title}</div>
                        <div style={{ marginTop: 20, height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden", maxWidth: 300, margin: "20px auto 0" }}>
                            <div style={{ height: "100%", background: "var(--primary)", borderRadius: 4, animation: "scanProgress 2.4s ease-in-out forwards" }} />
                        </div>
                        <style>{`
                            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                            @keyframes scanProgress { from { width: 0%; } to { width: 100%; } }
                        `}</style>
                    </div>
                ) : (
                    <>
                        <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>Select Scan Type</div>
                            {scans.map(scan => (
                                <div key={scan.type} onClick={() => setScanType(scan.type)}
                                     style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", border: `1.5px solid ${scanType === scan.type ? "var(--primary)" : "var(--border)"}`, borderRadius: 12, cursor: "pointer", background: scanType === scan.type ? "var(--primary-xlight)" : "var(--card)", transition: "all 0.15s" }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 11, background: scanType === scan.type ? "var(--primary-light)" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, border: `1px solid ${scanType === scan.type ? "var(--primary-mid)" : "var(--border)"}` }}>{scan.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, color: scanType === scan.type ? "var(--primary)" : "var(--fg)", fontSize: 13.5, marginBottom: 3 }}>{scan.title}</div>
                                        <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{scan.desc}</div>
                                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: scanType === scan.type ? "var(--primary)" : "var(--muted)", marginTop: 5, opacity: 0.7 }}>{scan.endpoint}</div>
                                    </div>
                                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${scanType === scan.type ? "var(--primary)" : "var(--border)"}`, background: scanType === scan.type ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                                        {scanType === scan.type && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} />}
                                    </div>
                                </div>
                            ))}

                            <div style={{ background: "var(--success-light)", border: "1px solid var(--success)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 9, marginTop: 4 }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>✅</span>
                                <div style={{ fontSize: 12, color: "var(--fg-mid)", lineHeight: 1.6 }}>
                                    Scans are <strong>idempotent</strong> — running a scan multiple times will not create duplicate alerts for already-flagged issues.
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "space-between" }}>
                            <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ fontFamily: "'Space Mono', monospace" }}>Last scan: {LAST_SCAN_RESULTS.ran}</span>
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                                <button onClick={handleRun} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)", display: "flex", alignItems: "center", gap: 8 }}>
                                    🔍 Run {selected.title.replace("Scan ", "").replace(" Scan", "")} Scan
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
export default function CompliancePage() {
    const [alerts, setAlerts] = useState<ComplianceAlert[]>(MOCK_ALERTS);
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);
    const [filterTab, setFilterTab] = useState(0);
    const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all");
    const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const openAlerts = alerts.filter(a => a.status === "open");
    const resolvedAlerts = alerts.filter(a => a.status === "resolved");
    const criticalAlerts = openAlerts.filter(a => a.severity === "critical");
    const highAlerts = openAlerts.filter(a => a.severity === "high");
    const mediumAlerts = openAlerts.filter(a => a.severity === "medium");

    const filterTabs = [
        { label: "All Alerts", count: alerts.length },
        { label: "Open", count: openAlerts.length },
        { label: "Resolved", count: resolvedAlerts.length },
    ];

    const filteredAlerts = alerts.filter(a => {
        const matchTab = filterTab === 0 || (filterTab === 1 && a.status === "open") || (filterTab === 2 && a.status === "resolved");
        const matchType = typeFilter === "all" || a.type === typeFilter;
        const matchSev = severityFilter === "all" || a.severity === severityFilter;
        return matchTab && matchType && matchSev;
    });

    const resolveAlert = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "resolved" as AlertStatus, resolvedAt: "Now", resolvedBy: "Dr. N. Victory" } : a));
        setModal(null);
        setSelectedAlert(null);
    };

    const reopenAlert = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "reopened" as AlertStatus, resolvedAt: null } : a));
        setModal(null);
        setSelectedAlert(null);
    };

    const kpis = [
        { label: "Open Alerts", value: String(openAlerts.length), sub: `${criticalAlerts.length} critical`, color: "var(--danger)", icon: "🚨", bg: "var(--danger-light)" },
        { label: "Critical", value: String(criticalAlerts.length), sub: "require immediate action", color: "var(--danger)", icon: "⛔", bg: "var(--danger-light)" },
        { label: "High Severity", value: String(highAlerts.length), sub: "follow up within 24 hrs", color: "#D98326", icon: "⚠️", bg: "var(--warning-light)" },
        { label: "Resolved This Month", value: String(resolvedAlerts.length), sub: "compliance actions closed", color: "var(--success)", icon: "✅", bg: "var(--success-light)" },
    ];

    const typeBreakdown = Object.entries(alertTypeConfig).map(([k, v]) => ({
        type: k as AlertType, ...v, count: openAlerts.filter(a => a.type === k).length,
    }));

    return (
        <>
            {/* ── Modals ── */}
            {openMenuId && <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setOpenMenuId(null)} />}

            {modal === "create_alert" && <CreateAlertModal onClose={() => setModal(null)} />}
            {modal === "view_alert" && selectedAlert && (
                <ViewAlertModal
                    alert={selectedAlert}
                    onClose={() => { setModal(null); setSelectedAlert(null); }}
                    onResolve={() => { setModal("resolve_alert"); }}
                    onReopen={() => { setModal("reopen_alert"); }}
                />
            )}
            {modal === "resolve_alert" && selectedAlert && (
                <ResolveAlertModal alert={selectedAlert} onClose={() => setModal(null)} onConfirm={() => resolveAlert(selectedAlert.id)} />
            )}
            {modal === "reopen_alert" && selectedAlert && (
                <ReopenAlertModal alert={selectedAlert} onClose={() => setModal(null)} onConfirm={() => reopenAlert(selectedAlert.id)} />
            )}
            {modal === "run_scan" && <RunScanModal onClose={() => setModal(null)} />}

            {/* ── Page Header ── */}
            <div className="page-header">
                <div>
                    <div className="page-title">Compliance</div>
                    <div className="page-subtitle">HIPAA compliance monitoring, alerts & audit management</div>
                </div>
                <div className="header-actions">
                    <button onClick={() => setModal("run_scan")}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: "1.5px solid var(--primary)", borderRadius: 10, background: "var(--primary-light)", color: "var(--primary)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s" }}>
                        🔍 Run Scan
                    </button>
                    <button onClick={() => setModal("create_alert")}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg, var(--danger) 0%, #e05252 100%)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(201,64,64,0.3)" }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                        Create Alert
                    </button>
                </div>
            </div>

            {/* ── KPI Row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                {kpis.map(k => (
                    <div key={k.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{k.icon}</div>
                        <div>
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{k.label}</div>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, color: k.color, lineHeight: 1, marginBottom: 4 }}>{k.value}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{k.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Critical Alert Banner ── */}
            {criticalAlerts.length > 0 && (
                <div style={{ background: "var(--danger-light)", border: "2px solid var(--danger)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, animation: "pulse 2s ease-in-out infinite" }}>
                        🚨
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "var(--danger)", marginBottom: 2 }}>
                            {criticalAlerts.length} Critical Compliance Alert{criticalAlerts.length !== 1 ? "s" : ""} Require Immediate Attention
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--danger)", opacity: 0.85 }}>
                            {criticalAlerts.map(a => a.title).join(" · ")}
                        </div>
                    </div>
                    <button onClick={() => { setFilterTab(1); setSeverityFilter("critical"); }} style={{ padding: "8px 16px", border: "1.5px solid var(--danger)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--danger)", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" }}>
                        View Critical →
                    </button>
                </div>
            )}

            {/* ── Two column: Alert type breakdown + Last scan ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                {/* Alert type breakdown */}
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Open Alerts by Type</div>
                        <div className="card-meta">ACTIVE ISSUES</div>
                    </div>
                    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                        {typeBreakdown.map(t => (
                            <div key={t.type} style={{ cursor: t.count > 0 ? "pointer" : "default" }}
                                 onClick={() => { if (t.count > 0) { setTypeFilter(t.type); setFilterTab(1); } }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: t.count > 0 ? "var(--fg)" : "var(--muted)" }}>
                                        <span>{t.icon}</span> {t.label}
                                    </span>
                                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: t.count > 0 ? t.color : "var(--muted)" }}>{t.count}</span>
                                </div>
                                <div style={{ height: 6, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${openAlerts.length > 0 ? (t.count / openAlerts.length) * 100 : 0}%`, background: t.color, borderRadius: 6, transition: "width 0.6s ease" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Last scan info + quick actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Last scan card */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Last Compliance Scan</div>
                            <div className="card-meta">AUTOMATED</div>
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--success-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✅</div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>Full Scan Completed</div>
                                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>{LAST_SCAN_RESULTS.ran}</div>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                                {[
                                    { label: "Overdue Notes", value: LAST_SCAN_RESULTS.overdueNotes, color: "var(--danger)" },
                                    { label: "Expired Plans", value: LAST_SCAN_RESULTS.expiredPlans, color: "#D98326" },
                                    { label: "Missing Docs", value: LAST_SCAN_RESULTS.missingDocs, color: "var(--purple)" },
                                ].map(s => (
                                    <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: "10px 12px", textAlign: "center" }}>
                                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setModal("run_scan")} style={{ width: "100%", padding: "10px", border: "1.5px solid var(--primary)", borderRadius: 9, background: "var(--primary-light)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}>
                                🔍 Run New Scan
                            </button>
                        </div>
                    </div>

                    {/* Severity breakdown mini */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Severity Overview</div>
                        </div>
                        <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                            {(["critical", "high", "medium", "low"] as AlertSeverity[]).map(s => {
                                const count = openAlerts.filter(a => a.severity === s).length;
                                const cfg = severityConfig[s];
                                return (
                                    <div key={s} onClick={() => { if (count > 0) { setSeverityFilter(s); setFilterTab(1); } }}
                                         style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9, cursor: count > 0 ? "pointer" : "default", background: count > 0 ? "transparent" : "transparent", transition: "background 0.13s" }}
                                         onMouseEnter={e => count > 0 && ((e.currentTarget as HTMLDivElement).style.background = "var(--surface)")}
                                         onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}>
                                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--fg-mid)", textTransform: "capitalize" }}>{s}</span>
                                        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: count > 0 ? cfg.color : "var(--muted)" }}>{count}</span>
                                        <span style={{ fontSize: 10, color: "var(--muted)", minWidth: 32 }}>open</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Alerts Table ── */}
            <div>
                {/* Tabs + Filters */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    {/* Status tabs */}
                    <div className="filter-tabs" style={{ marginBottom: 0 }}>
                        {filterTabs.map((tab, i) => (
                            <button key={tab.label} className={`filter-tab${filterTab === i ? " active" : ""}`} onClick={() => setFilterTab(i)}>
                                {tab.label} <span style={{ marginLeft: 5, fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: 0.75 }}>({tab.count})</span>
                            </button>
                        ))}
                    </div>

                    {/* Type filter */}
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as AlertType | "all")}
                        style={{ border: "1.5px solid var(--border)", borderRadius: 8, padding: "7px 14px", fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--fg)", background: "var(--card)", outline: "none", cursor: "pointer", transition: "border-color 0.18s" }}>
                        <option value="all">All Types</option>
                        {Object.entries(alertTypeConfig).map(([k, v]) => (
                            <option key={k} value={k}>{v.icon} {v.label}</option>
                        ))}
                    </select>

                    {/* Severity filter */}
                    <select
                        value={severityFilter}
                        onChange={e => setSeverityFilter(e.target.value as AlertSeverity | "all")}
                        style={{ border: "1.5px solid var(--border)", borderRadius: 8, padding: "7px 14px", fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--fg)", background: "var(--card)", outline: "none", cursor: "pointer", transition: "border-color 0.18s" }}>
                        <option value="all">All Severities</option>
                        {(["critical", "high", "medium", "low"] as AlertSeverity[]).map(s => (
                            <option key={s} value={s}>{severityConfig[s].label}</option>
                        ))}
                    </select>

                    {/* Clear filters */}
                    {(typeFilter !== "all" || severityFilter !== "all") && (
                        <button onClick={() => { setTypeFilter("all"); setSeverityFilter("all"); }}
                                style={{ padding: "7px 14px", border: "1.5px solid var(--danger)", borderRadius: 8, background: "var(--danger-light)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--danger)", fontFamily: "'Nunito', sans-serif" }}>
                            ✕ Clear Filters
                        </button>
                    )}

                    {/* Search */}
                    <div style={{ marginLeft: "auto", position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 13, pointerEvents: "none" }}>🔍</span>
                        <input type="text" placeholder="Search alerts, patients…"
                               style={{ border: "1.5px solid var(--border)", borderRadius: 8, padding: "7px 14px 7px 34px", fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--fg)", background: "var(--card)", outline: "none", width: 220, transition: "border-color 0.18s" }}
                               onFocus={e => (e.target.style.borderColor = "var(--primary)")}
                               onBlur={e => (e.target.style.borderColor = "var(--border)")} />
                    </div>
                </div>

                {filteredAlerts.length === 0 ? (
                    <div className="card" style={{ padding: 48, textAlign: "center" as const }}>
                        <div style={{ fontSize: 40, marginBottom: 14 }}>🛡️</div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                            {filterTab === 2 ? "No resolved alerts" : "No compliance alerts found"}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
                            {filterTab === 2 ? "Resolved alerts will appear here once compliance issues are addressed." : "No alerts match the current filters. Run a compliance scan to detect new issues."}
                        </div>
                        <button onClick={() => setModal("run_scan")} style={{ padding: "9px 20px", background: "var(--primary-light)", border: "1.5px solid var(--primary)", borderRadius: 9, color: "var(--primary)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                            🔍 Run Compliance Scan
                        </button>
                    </div>
                ) : (
                    <div className="card">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Alert</th>
                                <th>Patient</th>
                                <th>Type</th>
                                <th>Severity</th>
                                <th>Assigned To</th>
                                <th>Due Date</th>
                                <th>Created</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" as const }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAlerts.map(alert => {
                                const sev = severityConfig[alert.severity];
                                const typ = alertTypeConfig[alert.type];
                                const sta = statusConfig[alert.status];
                                const isOverdue = alert.dueDate && alert.status === "open" && alert.dueDate < "16 Apr 2026";

                                return (
                                    <tr key={alert.id} style={{ cursor: "pointer" }}
                                        onClick={() => { setSelectedAlert(alert); setModal("view_alert"); }}>
                                        {/* Alert title */}
                                        <td>
                                            <div style={{ maxWidth: 240 }}>
                                                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 3 }}>
                                                    {alert.status === "open" && (
                                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: sev.dot, flexShrink: 0, marginTop: 4, boxShadow: alert.severity === "critical" ? `0 0 8px ${sev.dot}` : "none" }} />
                                                    )}
                                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)", lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                                        {alert.title}
                                                    </div>
                                                </div>
                                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--primary)", background: "var(--primary-light)", padding: "1px 7px", borderRadius: 4, fontWeight: 700, display: "inline-block", marginLeft: alert.status === "open" ? 16 : 0 }}>{alert.id}</div>
                                            </div>
                                        </td>

                                        {/* Patient */}
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 7, background: alert.patientColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{alert.patientInitials}</div>
                                                <div>
                                                    <div className="patient-name" style={{ fontSize: 12.5 }}>{alert.patientName}</div>
                                                    <div className="patient-id">{alert.patientId}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td onClick={e => e.stopPropagation()}>
                                            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", color: typ.color, fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>
                                                {typ.icon} {typ.label}
                                            </span>
                                        </td>

                                        {/* Severity */}
                                        <td onClick={e => e.stopPropagation()}>
                                            <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 5 }}>
                                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: sev.dot, display: "inline-block" }} />
                                                {sev.label}
                                            </span>
                                        </td>

                                        {/* Assigned */}
                                        <td><span className="td-text">{alert.assignedTo}</span></td>

                                        {/* Due date */}
                                        <td>
                                            {alert.dueDate ? (
                                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: isOverdue ? "var(--danger)" : "var(--fg-mid)" }}>
                                                    {isOverdue && "⚠️ "}{alert.dueDate}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 12, color: "var(--muted)" }}>—</span>
                                            )}
                                        </td>

                                        {/* Created */}
                                        <td><span className="td-mono">{alert.createdAt.split(",")[0]}</span></td>

                                        {/* Status */}
                                        <td onClick={e => e.stopPropagation()}>
                                            <span className={`chip ${sta.chip}`}>{sta.label}</span>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ textAlign: "right" as const }} onClick={e => e.stopPropagation()}>
                                            <div className="dots-menu-wrap" style={{ position: "relative", zIndex: openMenuId === alert.id ? 200 : "auto", display: "inline-block" }}>
                                                <button className="dots-btn" onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === alert.id ? null : alert.id); }}>···</button>
                                                <div className={`dots-menu${openMenuId === alert.id ? " open" : ""}`} style={{ minWidth: 185 }}>
                                                    <div className="dots-menu-item" onClick={() => { setSelectedAlert(alert); setModal("view_alert"); setOpenMenuId(null); }}>
                                                        <span className="dots-menu-icon">👁</span>View Details
                                                    </div>
                                                    {alert.status === "open" && (
                                                        <div className="dots-menu-item" style={{ color: "var(--success)" }} onClick={() => { setSelectedAlert(alert); setModal("resolve_alert"); setOpenMenuId(null); }}>
                                                            <span className="dots-menu-icon">✅</span>Mark Resolved
                                                        </div>
                                                    )}
                                                    {alert.relatedRecordId && alert.relatedRecordId.startsWith("NOTE") && (
                                                        <div className="dots-menu-item" onClick={() => setOpenMenuId(null)}>
                                                            <span className="dots-menu-icon">📝</span>Open Note
                                                        </div>
                                                    )}
                                                    {alert.relatedRecordId && alert.relatedRecordId.startsWith("PAT") && (
                                                        <div className="dots-menu-item" onClick={() => setOpenMenuId(null)}>
                                                            <span className="dots-menu-icon">👤</span>View Patient
                                                        </div>
                                                    )}
                                                    {alert.status === "resolved" && (
                                                        <div className="dots-menu-item" style={{ color: "var(--warning)" }} onClick={() => { setSelectedAlert(alert); setModal("reopen_alert"); setOpenMenuId(null); }}>
                                                            <span className="dots-menu-icon">♻️</span>Reopen Alert
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        <div className="pagination">
                            <button className="page-btn disabled">« Prev</button>
                            <button className="page-btn active">1</button>
                            <button className="page-btn">2</button>
                            <button className="page-btn">Next »</button>
                            <div style={{ marginLeft: "auto" }}>
                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>
                                    Showing {filteredAlerts.length} of {alerts.length} alerts
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── HIPAA info strip ── */}
            <div style={{ marginTop: 16, padding: "12px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🛡️</span>
                <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
                    <strong style={{ color: "var(--fg)" }}>HIPAA Compliance Notice:</strong> All compliance alerts are permanently logged in the immutable audit trail per HIPAA Security Rule §164.312(b). Compliance scans run automatically at 07:00 AM daily. Resolved alerts are archived and cannot be deleted. Contact your compliance officer for regulatory queries.
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.06); }
                }
            `}</style>
        </>
    );
}