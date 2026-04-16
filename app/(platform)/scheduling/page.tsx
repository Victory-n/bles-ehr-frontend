"use client";

import React, { useState } from "react";
import Link from "next/link";

// PLACE THIS FILE AT: app/(platform)/scheduling/page.tsx
// Also add to sidebar.tsx under "Overview" section:
//   { label: "Scheduling", href: "/scheduling", badge: "18", dot: false, icon: <CalendarIcon /> }

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
type AppointmentStatus =
    | "scheduled"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no_show"
    | "rescheduled";

type ModalType =
    | "create"
    | "view"
    | "reschedule"
    | "cancel"
    | "complete"
    | "no_show"
    | "confirm"
    | "mark_attendance"
    | "staff_history"
    | "clock_in"
    | null;

type MainTab = "appointments" | "attendance";
type AppView = "calendar" | "list";

/* ─────────────────────────────────────
   MOCK DATA
───────────────────────────────────── */
interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    patientInitials: string;
    patientColor: string;
    staffId: string;
    staffName: string;
    type: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string;
    duration: number; // minutes
    location: string;
    status: AppointmentStatus;
    notes: string;
    isGroup?: boolean;
}

const MOCK_APPOINTMENTS: Appointment[] = [
    // Monday Apr 13
    {
        id: "APT-001", patientId: "PAT-0142", patientName: "Amara Okafor", patientInitials: "AO", patientColor: "#2C7A6E",
        staffId: "STF-002", staffName: "Dr. B. Adeyemi", type: "CBT Session", date: "2026-04-13",
        startTime: "09:00", endTime: "10:00", duration: 60, location: "Room 3A", status: "completed", notes: "Session completed. PHQ-9 reviewed.",
    },
    {
        id: "APT-002", patientId: "PAT-0135", patientName: "Ngozi Eze", patientInitials: "NE", patientColor: "#27A76A",
        staffId: "STF-001", staffName: "Dr. C. Obi", type: "EMDR Session", date: "2026-04-13",
        startTime: "11:00", endTime: "12:30", duration: 90, location: "Room 1B", status: "completed", notes: "",
    },
    {
        id: "APT-003", patientId: "PAT-0138", patientName: "Emeka Afolabi", patientInitials: "EA", patientColor: "#C94040",
        staffId: "STF-003", staffName: "Dr. A. Kolade", type: "Medication Review", date: "2026-04-13",
        startTime: "14:00", endTime: "14:45", duration: 45, location: "Room 2A", status: "completed", notes: "Lithium level stable.",
    },
    {
        id: "APT-004", patientId: "PAT-0128", patientName: "Kunle Balogun", patientInitials: "KB", patientColor: "#7A9490",
        staffId: "STF-004", staffName: "Dr. F. Eze", type: "SUD Counselling", date: "2026-04-13",
        startTime: "15:30", endTime: "16:20", duration: 50, location: "Room 2C", status: "no_show", notes: "Patient did not attend. Second consecutive no-show.",
    },
    // Tuesday Apr 14
    {
        id: "APT-005", patientId: "PAT-0130", patientName: "Fatima Hassan", patientInitials: "FH", patientColor: "#D98326",
        staffId: "STF-002", staffName: "Dr. B. Adeyemi", type: "OCD ERP Session", date: "2026-04-14",
        startTime: "09:00", endTime: "10:00", duration: 60, location: "Room 3A", status: "completed", notes: "",
    },
    {
        id: "APT-006", patientId: "PAT-0141", patientName: "Chidi Nwosu", patientInitials: "CN", patientColor: "#6B5ED4",
        staffId: "STF-003", staffName: "Dr. A. Kolade", type: "Psychiatric Evaluation", date: "2026-04-14",
        startTime: "10:30", endTime: "12:00", duration: 90, location: "Room 1B", status: "completed", notes: "",
    },
    {
        id: "APT-007", patientId: "PAT-0135", patientName: "Ngozi Eze", patientInitials: "NE", patientColor: "#27A76A",
        staffId: "STF-001", staffName: "Dr. C. Obi", type: "Group Therapy", date: "2026-04-14",
        startTime: "13:00", endTime: "14:15", duration: 75, location: "Group Hall", status: "completed", notes: "", isGroup: true,
    },
    // Wednesday Apr 15
    {
        id: "APT-008", patientId: "PAT-0142", patientName: "Amara Okafor", patientInitials: "AO", patientColor: "#2C7A6E",
        staffId: "STF-003", staffName: "Dr. A. Kolade", type: "Medication Review", date: "2026-04-15",
        startTime: "09:00", endTime: "09:45", duration: 45, location: "Room 2A", status: "completed", notes: "",
    },
    {
        id: "APT-009", patientId: "PAT-0138", patientName: "Emeka Afolabi", patientInitials: "EA", patientColor: "#C94040",
        staffId: "STF-002", staffName: "Dr. B. Adeyemi", type: "Crisis Assessment", date: "2026-04-15",
        startTime: "11:00", endTime: "12:00", duration: 60, location: "Room 1A", status: "completed", notes: "Urgent — lithium review.",
    },
    {
        id: "APT-010", patientId: "PAT-0130", patientName: "Fatima Hassan", patientInitials: "FH", patientColor: "#D98326",
        staffId: "STF-004", staffName: "Dr. F. Eze", type: "Family Therapy", date: "2026-04-15",
        startTime: "14:00", endTime: "15:00", duration: 60, location: "Group Hall", status: "cancelled", notes: "Patient cancelled — family unavailable.",
    },
    // Thursday Apr 16 (TODAY)
    {
        id: "APT-011", patientId: "PAT-0142", patientName: "Amara Okafor", patientInitials: "AO", patientColor: "#2C7A6E",
        staffId: "STF-002", staffName: "Dr. B. Adeyemi", type: "CBT Session", date: "2026-04-16",
        startTime: "09:00", endTime: "10:00", duration: 60, location: "Room 3A", status: "confirmed", notes: "",
    },
    {
        id: "APT-012", patientId: "PAT-0141", patientName: "Chidi Nwosu", patientInitials: "CN", patientColor: "#6B5ED4",
        staffId: "STF-003", staffName: "Dr. A. Kolade", type: "Individual Therapy", date: "2026-04-16",
        startTime: "10:30", endTime: "11:30", duration: 60, location: "Room 1B", status: "confirmed", notes: "",
    },
    {
        id: "APT-013", patientId: "PAT-0135", patientName: "Ngozi Eze", patientInitials: "NE", patientColor: "#27A76A",
        staffId: "STF-001", staffName: "Dr. C. Obi", type: "Group Therapy", date: "2026-04-16",
        startTime: "13:00", endTime: "14:15", duration: 75, location: "Group Hall", status: "scheduled", notes: "", isGroup: true,
    },
    {
        id: "APT-014", patientId: "PAT-0138", patientName: "Emeka Afolabi", patientInitials: "EA", patientColor: "#C94040",
        staffId: "STF-003", staffName: "Dr. A. Kolade", type: "Psychiatric Review", date: "2026-04-16",
        startTime: "15:00", endTime: "16:00", duration: 60, location: "Room 2A", status: "confirmed", notes: "",
    },
    {
        id: "APT-015", patientId: "PAT-0130", patientName: "Fatima Hassan", patientInitials: "FH", patientColor: "#D98326",
        staffId: "STF-002", staffName: "Dr. B. Adeyemi", type: "OCD ERP Session", date: "2026-04-16",
        startTime: "16:30", endTime: "17:30", duration: 60, location: "Room 3A", status: "scheduled", notes: "",
    },
    // Friday Apr 17
    {
        id: "APT-016", patientId: "PAT-0128", patientName: "Kunle Balogun", patientInitials: "KB", patientColor: "#7A9490",
        staffId: "STF-004", staffName: "Dr. F. Eze", type: "SUD Counselling", date: "2026-04-17",
        startTime: "09:00", endTime: "09:50", duration: 50, location: "Room 2C", status: "scheduled", notes: "Reschedule of missed session.",
    },
    {
        id: "APT-017", patientId: "PAT-0142", patientName: "Amara Okafor", patientInitials: "AO", patientColor: "#2C7A6E",
        staffId: "STF-001", staffName: "Dr. C. Obi", type: "Group Anxiety", date: "2026-04-17",
        startTime: "11:00", endTime: "12:15", duration: 75, location: "Group Hall", status: "confirmed", notes: "", isGroup: true,
    },
    {
        id: "APT-018", patientId: "PAT-0141", patientName: "Chidi Nwosu", patientInitials: "CN", patientColor: "#6B5ED4",
        staffId: "STF-004", staffName: "Dr. F. Eze", type: "Group Therapy Intake", date: "2026-04-17",
        startTime: "14:00", endTime: "15:00", duration: 60, location: "Room 1B", status: "scheduled", notes: "",
    },
    // Monday Apr 20 (next week preview)
    {
        id: "APT-019", patientId: "PAT-0135", patientName: "Ngozi Eze", patientInitials: "NE", patientColor: "#27A76A",
        staffId: "STF-001", staffName: "Dr. C. Obi", type: "EMDR Session", date: "2026-04-20",
        startTime: "09:00", endTime: "10:30", duration: 90, location: "Room 1B", status: "scheduled", notes: "",
    },
];

const MOCK_STAFF_ATTENDANCE = [
    { id: "STF-001", name: "Dr. Chisom Obi", initials: "CO", color: "#2C7A6E", role: "Psychologist", clockIn: "08:02 AM", clockOut: null, status: "in", sessions: 4, duration: null },
    { id: "STF-002", name: "Dr. Bola Adeyemi", initials: "BA", color: "#6B5ED4", role: "Psychiatrist", clockIn: "08:15 AM", clockOut: null, status: "in", sessions: 3, duration: null },
    { id: "STF-003", name: "Dr. Amaka Kolade", initials: "AK", color: "#27A76A", role: "Psychiatrist", clockIn: "07:55 AM", clockOut: null, status: "in", sessions: 3, duration: null },
    { id: "STF-004", name: "Dr. Femi Eze", initials: "FE", color: "#D98326", role: "Counsellor", clockIn: "09:12 AM", clockOut: null, status: "late", sessions: 1, duration: null },
    { id: "STF-005", name: "Nurse Rita Bello", initials: "RB", color: "#4A9E91", role: "Psychiatric Nurse", clockIn: "07:45 AM", clockOut: null, status: "in", sessions: 0, duration: null },
    { id: "STF-006", name: "M. Sule", initials: "MS", color: "#7A9490", role: "Counsellor", clockIn: null, clockOut: null, status: "absent", sessions: 0, duration: null },
    { id: "STF-007", name: "T. Onyeka", initials: "TO", color: "#C94040", role: "Social Worker", clockIn: null, clockOut: null, status: "leave", sessions: 0, duration: null },
];

const STAFF_HISTORY = [
    { date: "Wed 15 Apr", clockIn: "08:00 AM", clockOut: "05:20 PM", sessions: 4, status: "present", hours: "9h 20m" },
    { date: "Tue 14 Apr", clockIn: "08:05 AM", clockOut: "05:00 PM", sessions: 5, status: "present", hours: "8h 55m" },
    { date: "Mon 13 Apr", clockIn: "08:20 AM", clockOut: "05:15 PM", sessions: 4, status: "late", hours: "8h 55m" },
    { date: "Fri 11 Apr", clockIn: "08:02 AM", clockOut: "04:30 PM", sessions: 3, status: "present", hours: "8h 28m" },
    { date: "Thu 10 Apr", clockIn: "08:10 AM", clockOut: "05:45 PM", sessions: 5, status: "present", hours: "9h 35m" },
    { date: "Wed 09 Apr", clockIn: null, clockOut: null, sessions: 0, status: "absent", hours: "—" },
    { date: "Tue 08 Apr", clockIn: "08:00 AM", clockOut: "05:00 PM", sessions: 4, status: "present", hours: "9h 0m" },
];

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const statusConfig: Record<AppointmentStatus, { label: string; chip: string; color: string; bg: string }> = {
    scheduled: { label: "Scheduled", chip: "chip-inactive", color: "#888", bg: "#F2F2F2" },
    confirmed: { label: "Confirmed", chip: "chip-active", color: "var(--success)", bg: "var(--success-light)" },
    completed: { label: "Completed", chip: "chip-progress", color: "var(--purple)", bg: "var(--purple-light)" },
    cancelled: { label: "Cancelled", chip: "chip-critical", color: "var(--danger)", bg: "var(--danger-light)" },
    no_show: { label: "No-show", chip: "chip-pending", color: "var(--warning)", bg: "var(--warning-light)" },
    rescheduled: { label: "Rescheduled", chip: "chip-inactive", color: "var(--primary)", bg: "var(--primary-light)" },
};

const SESSION_TYPES = [
    "CBT Session", "Psychiatric Evaluation", "EMDR Session", "Medication Review",
    "Group Therapy", "Family Therapy", "SUD Counselling", "Crisis Assessment",
    "Individual Therapy", "Telehealth Session", "Intake Assessment", "OCD ERP Session",
    "Psychiatric Review", "Group Anxiety", "Group Therapy Intake",
];

const LOCATIONS = ["Room 1A", "Room 1B", "Room 2A", "Room 2B", "Room 2C", "Room 3A", "Room 3B", "Group Hall", "Telehealth"];

const WEEK_DAYS = [
    { key: "2026-04-13", label: "Mon", full: "Monday", date: "13 Apr" },
    { key: "2026-04-14", label: "Tue", full: "Tuesday", date: "14 Apr" },
    { key: "2026-04-15", label: "Wed", full: "Wednesday", date: "15 Apr" },
    { key: "2026-04-16", label: "Thu", full: "Thursday", date: "16 Apr" },
    { key: "2026-04-17", label: "Fri", full: "Friday", date: "17 Apr" },
    { key: "2026-04-18", label: "Sat", full: "Saturday", date: "18 Apr" },
    { key: "2026-04-19", label: "Sun", full: "Sunday", date: "19 Apr" },
];

const attendanceStatus = {
    in: { color: "var(--success)", bg: "var(--success-light)", label: "Clocked In" },
    late: { color: "var(--warning)", bg: "var(--warning-light)", label: "Late" },
    absent: { color: "var(--danger)", bg: "var(--danger-light)", label: "Absent" },
    leave: { color: "#888", bg: "#F2F2F2", label: "On Leave" },
    out: { color: "var(--primary)", bg: "var(--primary-light)", label: "Clocked Out" },
};

/* ─────────────────────────────────────
   CREATE APPOINTMENT MODAL
───────────────────────────────────── */
function CreateAppointmentModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        patientId: "", type: "", date: "2026-04-16", startTime: "", duration: "60",
        staffId: "", location: "", notes: "", isGroup: false,
    });
    const [saving, setSaving] = useState(false);
    const up = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

    const patients = [
        { id: "PAT-0142", name: "Amara Okafor — PAT-0142" },
        { id: "PAT-0141", name: "Chidi Nwosu — PAT-0141" },
        { id: "PAT-0138", name: "Emeka Afolabi — PAT-0138" },
        { id: "PAT-0135", name: "Ngozi Eze — PAT-0135" },
        { id: "PAT-0130", name: "Fatima Hassan — PAT-0130" },
        { id: "PAT-0128", name: "Kunle Balogun — PAT-0128" },
    ];

    const staffOptions = [
        { id: "STF-001", name: "Dr. C. Obi — Psychologist" },
        { id: "STF-002", name: "Dr. B. Adeyemi — Psychiatrist" },
        { id: "STF-003", name: "Dr. A. Kolade — Psychiatrist" },
        { id: "STF-004", name: "Dr. F. Eze — Counsellor" },
        { id: "STF-005", name: "Nurse R. Bello — Psychiatric Nurse" },
    ];

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); onClose(); }, 1000);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 580, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>Schedule Appointment</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Step {step} of 2 — {step === 1 ? "Appointment Details" : "Assignment & Notes"}</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                {/* Step indicator */}
                <div style={{ padding: "14px 28px 0", display: "flex", gap: 8 }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? "var(--primary)" : "var(--border)", transition: "background 0.3s" }} />
                    ))}
                </div>

                {/* Body */}
                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {step === 1 ? (
                        <>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Patient</label>
                                <select className="form-input" value={form.patientId} onChange={e => up("patientId", e.target.value)} style={{ cursor: "pointer" }}>
                                    <option value="">Select patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Session Type</label>
                                <select className="form-input" value={form.type} onChange={e => up("type", e.target.value)} style={{ cursor: "pointer" }}>
                                    <option value="">Select session type</option>
                                    {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Date</label>
                                    <input className="form-input" type="date" value={form.date} onChange={e => up("date", e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Start Time</label>
                                    <input className="form-input" type="time" value={form.startTime} onChange={e => up("startTime", e.target.value)} />
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Duration (minutes)</label>
                                    <select className="form-input" value={form.duration} onChange={e => up("duration", e.target.value)} style={{ cursor: "pointer" }}>
                                        {[30, 45, 60, 75, 90, 120].map(d => <option key={d} value={String(d)}>{d} minutes</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Location</label>
                                    <select className="form-input" value={form.location} onChange={e => up("location", e.target.value)} style={{ cursor: "pointer" }}>
                                        <option value="">Select location</option>
                                        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Group toggle */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
                                <label className="toggle-switch" style={{ flexShrink: 0 }}>
                                    <input type="checkbox" checked={form.isGroup} onChange={e => up("isGroup", e.target.checked)} />
                                    <span className="toggle-track" />
                                </label>
                                <div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>Group Session</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Multiple patients can attend this session</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Assign Staff Member</label>
                                <select className="form-input" value={form.staffId} onChange={e => up("staffId", e.target.value)} style={{ cursor: "pointer" }}>
                                    <option value="">Select staff member</option>
                                    {staffOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Session Notes <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></label>
                                <textarea className="form-input" rows={4} placeholder="Pre-session notes, objectives, or reminders…" value={form.notes} onChange={e => up("notes", e.target.value)} style={{ resize: "none" }} />
                            </div>
                            {/* Summary */}
                            <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary-mid)", borderRadius: 10, padding: "12px 16px" }}>
                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Appointment Summary</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, color: "var(--fg-mid)" }}>
                                    {[
                                        ["Type", form.type || "—"],
                                        ["Date & Time", form.date && form.startTime ? `${form.date} at ${form.startTime}` : "—"],
                                        ["Duration", `${form.duration} minutes`],
                                        ["Location", form.location || "—"],
                                        ["Session", form.isGroup ? "Group Session" : "Individual Session"],
                                    ].map(([k, v]) => (
                                        <div key={k} style={{ display: "flex", gap: 8 }}>
                                            <span style={{ color: "var(--muted)", minWidth: 90 }}>{k}:</span>
                                            <span style={{ fontWeight: 600, color: "var(--fg)" }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button onClick={step === 1 ? onClose : () => setStep(1)} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>
                        {step === 1 ? "Cancel" : "← Back"}
                    </button>
                    <button onClick={step === 1 ? () => setStep(2) : handleSave} disabled={saving} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)", opacity: saving ? 0.8 : 1 }}>
                        {saving ? "Saving…" : step === 1 ? "Continue →" : "Create Appointment"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   VIEW APPOINTMENT MODAL
───────────────────────────────────── */
function ViewAppointmentModal({
                                  appt, onClose, onAction,
                              }: {
    appt: Appointment; onClose: () => void;
    onAction: (type: ModalType) => void;
}) {
    const s = statusConfig[appt.status];
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 560, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                {/* Color strip */}
                <div style={{ height: 5, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />

                {/* Header */}
                <div style={{ padding: "22px 26px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <span className={`chip ${s.chip}`}>{s.label}</span>
                            {appt.isGroup && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "var(--primary-light)", color: "var(--primary)", fontFamily: "'Space Mono', monospace" }}>GROUP</span>}
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)" }}>{appt.id}</span>
                        </div>
                        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)", marginBottom: 4 }}>{appt.type}</h2>
                        <div style={{ fontSize: 13, color: "var(--muted)" }}>{appt.date} · {appt.startTime}–{appt.endTime} · {appt.duration} min</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                {/* Details */}
                <div style={{ padding: "20px 26px" }}>
                    {[
                        { icon: "🧑", label: "Patient", value: `${appt.patientName} (${appt.patientId})` },
                        { icon: "👨‍⚕️", label: "Staff", value: `${appt.staffName} (${appt.staffId})` },
                        { icon: "📍", label: "Location", value: appt.location },
                        { icon: "🕐", label: "Time", value: `${appt.startTime} – ${appt.endTime} (${appt.duration} min)` },
                        { icon: "📅", label: "Date", value: appt.date },
                    ].map((row, i, arr) => (
                        <div key={row.label} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                            <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{row.icon}</span>
                            <div>
                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{row.label}</div>
                                <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 600 }}>{row.value}</div>
                            </div>
                        </div>
                    ))}
                    {appt.notes && (
                        <div style={{ marginTop: 12, background: "var(--surface)", borderRadius: 9, padding: "11px 14px", fontSize: 13, color: "var(--fg-mid)", lineHeight: 1.6 }}>
                            📝 {appt.notes}
                        </div>
                    )}
                </div>

                {/* Action buttons based on status */}
                <div style={{ padding: "16px 26px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {appt.status === "scheduled" && <>
                        <button onClick={() => onAction("confirm")} style={{ padding: "8px 16px", border: "none", borderRadius: 8, background: "var(--success)", color: "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>✅ Confirm</button>
                        <button onClick={() => onAction("reschedule")} style={{ padding: "8px 16px", border: "1.5px solid var(--primary)", borderRadius: 8, background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>📅 Reschedule</button>
                        <button onClick={() => onAction("cancel")} style={{ padding: "8px 16px", border: "1.5px solid var(--danger)", borderRadius: 8, background: "var(--danger-light)", color: "var(--danger)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>❌ Cancel</button>
                    </>}
                    {appt.status === "confirmed" && <>
                        <button onClick={() => onAction("complete")} style={{ padding: "8px 16px", border: "none", borderRadius: 8, background: "var(--purple)", color: "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>✓ Mark Complete</button>
                        <button onClick={() => onAction("no_show")} style={{ padding: "8px 16px", border: "1.5px solid var(--warning)", borderRadius: 8, background: "var(--warning-light)", color: "var(--warning)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>⚠️ No-show</button>
                        <button onClick={() => onAction("reschedule")} style={{ padding: "8px 16px", border: "1.5px solid var(--primary)", borderRadius: 8, background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>📅 Reschedule</button>
                        <button onClick={() => onAction("cancel")} style={{ padding: "8px 16px", border: "1.5px solid var(--danger)", borderRadius: 8, background: "var(--danger-light)", color: "var(--danger)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>❌ Cancel</button>
                    </>}
                    {(appt.status === "completed" || appt.status === "cancelled" || appt.status === "no_show") && (
                        <button onClick={() => onAction("mark_attendance")} style={{ padding: "8px 16px", border: "1.5px solid var(--primary)", borderRadius: 8, background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>📋 View Attendance</button>
                    )}
                    {appt.status === "no_show" && (
                        <button onClick={() => onAction("reschedule")} style={{ padding: "8px 16px", border: "1.5px solid var(--primary)", borderRadius: 8, background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>📅 Reschedule</button>
                    )}
                    <button onClick={onClose} style={{ marginLeft: "auto", padding: "8px 16px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", color: "var(--fg-mid)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>Close</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   RESCHEDULE MODAL
───────────────────────────────────── */
function RescheduleModal({ appt, onClose }: { appt: Appointment; onClose: () => void }) {
    const [form, setForm] = useState({ date: appt.date, time: appt.startTime, reason: "" });
    const [loading, setLoading] = useState(false);

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.6)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(25,40,37,0.2)", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)" }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>📅 Reschedule Appointment</div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{appt.patientName} · {appt.type}</div>
                </div>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: "10px 14px", fontSize: 12.5, color: "var(--muted)" }}>
                        Current: <strong style={{ color: "var(--fg)" }}>{appt.date} at {appt.startTime}</strong>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">New Date</label>
                            <input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">New Time</label>
                            <input className="form-input" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Reason for Reschedule <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></label>
                        <textarea className="form-input" rows={3} placeholder="e.g. Patient requested, staff unavailable…" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} style={{ resize: "none" }} />
                    </div>
                </div>
                <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onClose(); }, 900); }} style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.8 : 1 }}>
                        {loading ? "Saving…" : "Confirm Reschedule"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   ACTION CONFIRM MODAL (Cancel / Complete / No-show / Confirm)
───────────────────────────────────── */
function ActionModal({
                         appt, action, onClose,
                     }: {
    appt: Appointment; action: "cancel" | "complete" | "no_show" | "confirm";
    onClose: () => void;
}) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const cfg = {
        cancel: { icon: "❌", title: "Cancel Appointment", desc: "This appointment will be marked as cancelled. A notification will be sent to the patient.", btnLabel: "Cancel Appointment", btnColor: "var(--danger)", requireReason: true },
        complete: { icon: "✅", title: "Mark as Completed", desc: "Confirm that this appointment was completed successfully.", btnLabel: "Mark Complete", btnColor: "var(--purple)", requireReason: false },
        no_show: { icon: "⚠️", title: "Mark as No-show", desc: "The patient did not attend this appointment. This will be recorded for follow-up.", btnLabel: "Mark No-show", btnColor: "var(--warning)", requireReason: false },
        confirm: { icon: "✅", title: "Confirm Appointment", desc: "This appointment will be confirmed and the patient will be notified.", btnLabel: "Confirm Appointment", btnColor: "var(--success)", requireReason: false },
    }[action];

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(25,40,37,0.2)", overflow: "hidden" }}>
                <div style={{ padding: "22px 26px" }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{cfg.icon}</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>{cfg.title}</div>
                    <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>{cfg.desc}</div>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: "10px 14px", fontSize: 12.5, color: "var(--fg-mid)", marginBottom: cfg.requireReason ? 14 : 0 }}>
                        <strong style={{ color: "var(--fg)" }}>{appt.patientName}</strong> · {appt.type} · {appt.date} at {appt.startTime}
                    </div>
                    {cfg.requireReason && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Reason <span style={{ color: "var(--danger)" }}>*</span></label>
                            <textarea className="form-input" rows={3} placeholder="State the reason…" value={reason} onChange={e => setReason(e.target.value)} style={{ resize: "none" }} />
                        </div>
                    )}
                </div>
                <div style={{ padding: "14px 26px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Go Back</button>
                    <button
                        onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onClose(); }, 800); }}
                        disabled={loading || (cfg.requireReason && !reason.trim())}
                        style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: cfg.btnColor, cursor: (loading || (cfg.requireReason && !reason.trim())) ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Processing…" : cfg.btnLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   MARK ATTENDANCE MODAL
───────────────────────────────────── */
function MarkAttendanceModal({ appt, onClose }: { appt: Appointment; onClose: () => void }) {
    const patients = [
        { name: "Amara Okafor", id: "PAT-0142", initials: "AO", color: "#2C7A6E", status: "present" },
        { name: "Ngozi Eze", id: "PAT-0135", initials: "NE", color: "#27A76A", status: "present" },
        { name: "Fatima Hassan", id: "PAT-0130", initials: "FH", color: "#D98326", status: "absent" },
        { name: "Chidi Nwosu", id: "PAT-0141", initials: "CN", color: "#6B5ED4", status: "present" },
    ];
    const [records, setRecords] = useState(patients);

    const cycleStatus = (i: number) => {
        const order = ["present", "absent", "excused"];
        setRecords(prev => {
            const next = [...prev];
            const cur = order.indexOf(next[i].status);
            next[i] = { ...next[i], status: order[(cur + 1) % order.length] };
            return next;
        });
    };

    const statusStyle: Record<string, { color: string; bg: string }> = {
        present: { color: "var(--success)", bg: "var(--success-light)" },
        absent: { color: "var(--danger)", bg: "var(--danger-light)" },
        excused: { color: "var(--warning)", bg: "var(--warning-light)" },
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.6)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 500, boxShadow: "0 24px 64px rgba(25,40,37,0.2)", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)" }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>📋 Mark Attendance</div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{appt.type} · {appt.date} at {appt.startTime}</div>
                </div>
                <div style={{ padding: "10px 24px", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", gap: 16, fontSize: 11.5 }}>
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>Tap status to cycle:</span>
                    {[["present", "var(--success)"], ["absent", "var(--danger)"], ["excused", "var(--warning)"]].map(([s, c]) => (
                        <span key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c as string, display: "inline-block" }} />
              <span style={{ color: c as string, fontWeight: 700, textTransform: "capitalize" }}>{s}</span>
            </span>
                    ))}
                </div>
                <div>
                    {records.map((r, i) => {
                        const st = statusStyle[r.status];
                        return (
                            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 24px", borderBottom: i < records.length - 1 ? "1px solid var(--border)" : "none" }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: `${r.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 700, color: r.color }}>{r.initials}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>{r.name}</div>
                                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)" }}>{r.id}</div>
                                </div>
                                <button onClick={() => cycleStatus(i)} style={{ padding: "5px 14px", border: `1.5px solid ${st.color}`, borderRadius: 20, background: st.bg, cursor: "pointer", fontSize: 12, fontWeight: 700, color: st.color, fontFamily: "'Nunito', sans-serif", textTransform: "capitalize", transition: "all 0.18s", minWidth: 88, textAlign: "center" }}>
                                    {r.status}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button onClick={onClose} style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif" }}>Save Attendance</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   STAFF HISTORY MODAL
───────────────────────────────────── */
function StaffHistoryModal({ staff, onClose }: { staff: typeof MOCK_STAFF_ATTENDANCE[0]; onClose: () => void }) {
    const statusColors: Record<string, string> = { present: "var(--success)", late: "var(--warning)", absent: "var(--danger)", leave: "#888" };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 580, maxHeight: "85vh", overflow: "hidden", boxShadow: "0 28px 72px rgba(25,40,37,0.22)", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px 26px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 11, background: `linear-gradient(135deg, ${staff.color} 0%, ${staff.color}88 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>{staff.initials}</div>
                        <div>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, color: "var(--fg)" }}>{staff.name}</div>
                            <div style={{ fontSize: 12, color: "var(--muted)" }}>{staff.role} · Attendance History</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                {/* Summary */}
                <div style={{ padding: "14px 26px", borderBottom: "1px solid var(--border)", display: "flex", gap: 20, flexShrink: 0 }}>
                    {[
                        { label: "Present", value: "18", color: "var(--success)" },
                        { label: "Late", value: "3", color: "var(--warning)" },
                        { label: "Absent", value: "2", color: "var(--danger)" },
                        { label: "Avg Hours", value: "8.9h", color: "var(--primary)" },
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: "center", flex: 1 }}>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ flex: 1, overflow: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr>
                            {["Date", "Clock In", "Clock Out", "Hours", "Sessions", "Status"].map(h => (
                                <th key={h} style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 400, padding: "10px 16px", textAlign: "left", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {STAFF_HISTORY.map((r, i) => (
                            <tr key={i}>
                                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--fg-mid)" }}>{r.date}</span></td>
                                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--fg-mid)" }}>{r.clockIn || "—"}</span></td>
                                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--fg-mid)" }}>{r.clockOut || "—"}</span></td>
                                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--fg-mid)" }}>{r.hours}</span></td>
                                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--fg-mid)" }}>{r.sessions}</span></td>
                                <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: statusColors[r.status], textTransform: "capitalize" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColors[r.status], display: "inline-block" }} />
                        {r.status}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: "14px 26px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
                    <button onClick={onClose} style={{ padding: "9px 20px", border: "none", borderRadius: 9, background: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif" }}>Close</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   CLOCK IN MODAL
───────────────────────────────────── */
function ClockInModal({ isOut, onClose }: { isOut: boolean; onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 420, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                {done ? (
                    <div style={{ padding: "40px 28px", textAlign: "center" }}>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: isOut ? "var(--danger-light)" : "var(--success-light)", border: `2px solid ${isOut ? "var(--danger)" : "var(--success)"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>{isOut ? "👋" : "✅"}</div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>{isOut ? "Clocked Out!" : "Clocked In!"}</div>
                        <div style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 8 }}>Time recorded: <strong style={{ color: "var(--fg)" }}>{time}</strong></div>
                        <button onClick={onClose} style={{ padding: "10px 28px", border: "none", borderRadius: 9, background: "var(--primary)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", marginTop: 12 }}>Done</button>
                    </div>
                ) : (
                    <>
                        <div style={{ padding: "28px 28px 22px", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 48, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.04em", marginBottom: 4 }}>{time}</div>
                            <div style={{ fontSize: 13, color: "var(--muted)" }}>Thursday, 16 April 2026</div>
                            <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, background: "var(--surface)", borderRadius: 20, padding: "6px 14px" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: isOut ? "var(--danger)" : "var(--success)" }} />
                                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg-mid)" }}>{isOut ? "You are currently clocked IN" : "You are currently clocked OUT"}</span>
                            </div>
                        </div>
                        <div style={{ padding: "22px 28px" }}>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>{isOut ? "Clock Out for the Day" : "Clock In to Start"}</div>
                            <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6 }}>
                                {isOut ? "This will record your end time for today. Ensure you have completed all session documentation before clocking out." : "Your clock-in time will be recorded. This is required for attendance and scheduling."}
                            </div>
                        </div>
                        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={onClose} style={{ padding: "10px 18px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                            <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); setDone(true); }, 800); }} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: isOut ? "var(--danger)" : "var(--success)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.8 : 1 }}>
                                {loading ? "Recording…" : isOut ? "🚪 Clock Out" : "✅ Clock In"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   CALENDAR VIEW
───────────────────────────────────── */
function CalendarView({ onAppointmentClick }: { onAppointmentClick: (a: Appointment) => void }) {
    const [weekOffset, setWeekOffset] = useState(0);

    const days = WEEK_DAYS;
    const today = "2026-04-16";

    const getAppts = (date: string) => MOCK_APPOINTMENTS.filter(a => a.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));

    const typeColors: Record<string, string> = {
        "CBT Session": "#2C7A6E", "EMDR Session": "#6B5ED4", "Medication Review": "#D98326",
        "Group Therapy": "#27A76A", "Family Therapy": "#4A9E91", "SUD Counselling": "#7A9490",
        "Crisis Assessment": "#C94040", "Individual Therapy": "#2C7A6E", "Psychiatric Evaluation": "#6B5ED4",
        "OCD ERP Session": "#D98326", "Psychiatric Review": "#6B5ED4", "Group Anxiety": "#27A76A",
        "Group Therapy Intake": "#27A76A",
    };

    return (
        <div>
            {/* Week navigator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>
                    Week of 13–19 April 2026
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => setWeekOffset(w => w - 1)} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 14, color: "var(--fg-mid)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.13s" }}>‹</button>
                    <button onClick={() => setWeekOffset(0)} style={{ padding: "6px 14px", border: "1.5px solid var(--primary)", borderRadius: 8, background: "var(--primary-light)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--primary)", fontFamily: "'Space Mono', monospace" }}>Today</button>
                    <button onClick={() => setWeekOffset(w => w + 1)} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 14, color: "var(--fg-mid)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.13s" }}>›</button>
                </div>
            </div>

            {/* Calendar grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                {days.map(day => {
                    const appts = getAppts(day.key);
                    const isToday = day.key === today;
                    const isPast = day.key < today;

                    return (
                        <div key={day.key} style={{ background: "var(--card)", border: `1px solid ${isToday ? "var(--primary)" : "var(--border)"}`, borderRadius: 12, overflow: "hidden", boxShadow: isToday ? "0 0 0 2px var(--primary-light)" : "none", minHeight: 320 }}>
                            {/* Day header */}
                            <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid var(--border)", background: isToday ? "var(--primary-light)" : isPast ? "var(--surface)" : "var(--card)", textAlign: "center" }}>
                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: isToday ? "var(--primary)" : "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2, fontWeight: 700 }}>{day.label}</div>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: isToday ? "var(--primary)" : isPast ? "var(--muted)" : "var(--fg)" }}>{day.date.split(" ")[0]}</div>
                                <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'Space Mono', monospace" }}>{appts.length} appt{appts.length !== 1 ? "s" : ""}</div>
                            </div>

                            {/* Appointments */}
                            <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: 5 }}>
                                {appts.length === 0 ? (
                                    <div style={{ padding: "16px 8px", textAlign: "center", fontSize: 11, color: "var(--border)" }}>No sessions</div>
                                ) : appts.map(appt => {
                                    const sc = statusConfig[appt.status];
                                    const tc = typeColors[appt.type] || "var(--primary)";
                                    return (
                                        <div
                                            key={appt.id}
                                            onClick={() => onAppointmentClick(appt)}
                                            style={{ background: `${tc}12`, border: `1px solid ${tc}30`, borderLeft: `3px solid ${tc}`, borderRadius: 7, padding: "6px 8px", cursor: "pointer", transition: "all 0.15s" }}
                                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = `${tc}22`}
                                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = `${tc}12`}
                                        >
                                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: tc, fontWeight: 700, marginBottom: 2 }}>{appt.startTime}</div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg)", lineHeight: 1.3, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{appt.type}</div>
                                            <div style={{ fontSize: 10, color: "var(--fg-mid)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{appt.patientName}</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}>
                                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.color, display: "inline-block" }} />
                                                <span style={{ fontSize: 9, color: sc.color, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{sc.label}</span>
                                                {appt.isGroup && <span style={{ marginLeft: 2, fontSize: 9, fontWeight: 700, color: "var(--primary)", fontFamily: "'Space Mono', monospace" }}>GRP</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, padding: "10px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.06em" }}>STATUS:</span>
                {Object.entries(statusConfig).map(([key, s]) => (
                    <span key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-mid)" }}>{s.label}</span>
          </span>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
export default function SchedulingPage() {
    const [mainTab, setMainTab] = useState<MainTab>("appointments");
    const [appView, setAppView] = useState<AppView>("calendar");
    const [filterTab, setFilterTab] = useState(0);
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<typeof MOCK_STAFF_ATTENDANCE[0] | null>(null);
    const [actionType, setActionType] = useState<"cancel" | "complete" | "no_show" | "confirm">("confirm");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isClockedIn, setIsClockedIn] = useState(true);

    const openAction = (a: Appointment, type: ModalType) => {
        setSelectedAppt(a);
        setModal(null);
        setTimeout(() => setModal(type), 50);
    };

    const filterTabs = [
        { label: "All", count: MOCK_APPOINTMENTS.length },
        { label: "Today", count: MOCK_APPOINTMENTS.filter(a => a.date === "2026-04-16").length },
        { label: "Upcoming", count: MOCK_APPOINTMENTS.filter(a => a.date >= "2026-04-16" && ["scheduled", "confirmed"].includes(a.status)).length },
        { label: "Confirmed", count: MOCK_APPOINTMENTS.filter(a => a.status === "confirmed").length },
        { label: "Completed", count: MOCK_APPOINTMENTS.filter(a => a.status === "completed").length },
        { label: "Cancelled", count: MOCK_APPOINTMENTS.filter(a => a.status === "cancelled").length },
        { label: "No-show", count: MOCK_APPOINTMENTS.filter(a => a.status === "no_show").length },
    ];

    const filteredAppts = MOCK_APPOINTMENTS.filter(a => {
        if (filterTab === 1) return a.date === "2026-04-16";
        if (filterTab === 2) return a.date >= "2026-04-16" && ["scheduled", "confirmed"].includes(a.status);
        if (filterTab === 3) return a.status === "confirmed";
        if (filterTab === 4) return a.status === "completed";
        if (filterTab === 5) return a.status === "cancelled";
        if (filterTab === 6) return a.status === "no_show";
        return true;
    }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

    const todayAppts = MOCK_APPOINTMENTS.filter(a => a.date === "2026-04-16");
    const staffIn = MOCK_STAFF_ATTENDANCE.filter(s => s.status === "in" || s.status === "late").length;

    const kpis = [
        { label: "Today's Appointments", value: String(todayAppts.length), trend: `${todayAppts.filter(a => a.status === "confirmed").length} confirmed`, color: "#2C7A6E", icon: "📅" },
        { label: "Confirmed Today", value: String(todayAppts.filter(a => a.status === "confirmed").length), trend: `${todayAppts.filter(a => a.status === "scheduled").length} pending confirm`, color: "#27A76A", icon: "✅" },
        { label: "Staff Clocked In", value: String(staffIn), trend: `${MOCK_STAFF_ATTENDANCE.length - staffIn} not yet in`, color: "#6B5ED4", icon: "🕐" },
        { label: "Pending This Week", value: String(MOCK_APPOINTMENTS.filter(a => a.date >= "2026-04-16" && ["scheduled", "confirmed"].includes(a.status)).length), trend: "upcoming sessions", color: "#D98326", icon: "⏳" },
    ];

    return (
        <>
            {/* ── Modals ── */}
            {openMenuId && <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setOpenMenuId(null)} />}

            {modal === "create" && <CreateAppointmentModal onClose={() => setModal(null)} />}
            {modal === "view" && selectedAppt && (
                <ViewAppointmentModal
                    appt={selectedAppt}
                    onClose={() => setModal(null)}
                    onAction={type => {
                        if (type === "reschedule") { setModal(null); setTimeout(() => setModal("reschedule"), 50); }
                        else if (type === "cancel" || type === "complete" || type === "no_show" || type === "confirm") {
                            setActionType(type as any); setModal(null); setTimeout(() => setModal("confirm"), 50);
                        } else { setModal(type); }
                    }}
                />
            )}
            {modal === "reschedule" && selectedAppt && <RescheduleModal appt={selectedAppt} onClose={() => setModal(null)} />}
            {modal === "confirm" && selectedAppt && (
                <ActionModal appt={selectedAppt} action={actionType} onClose={() => setModal(null)} />
            )}
            {modal === "mark_attendance" && selectedAppt && <MarkAttendanceModal appt={selectedAppt} onClose={() => setModal(null)} />}
            {modal === "staff_history" && selectedStaff && <StaffHistoryModal staff={selectedStaff} onClose={() => setModal(null)} />}
            {modal === "clock_in" && <ClockInModal isOut={isClockedIn} onClose={() => setModal(null)} />}

            {/* ── Page Header ── */}
            <div className="page-header">
                <div>
                    <div className="page-title">Scheduling</div>
                    <div className="page-subtitle">Appointments, calendar management & staff attendance</div>
                </div>
                <div className="header-actions">
                    {/* Clock in/out button for current user */}
                    <button
                        onClick={() => { setIsClockedIn(true); setModal("clock_in"); }}
                        style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", border: "1.5px solid var(--border)", borderRadius: 10, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s" }}
                    >
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", display: "inline-block", boxShadow: "0 0 6px var(--success)" }} />
                        Clocked In · 08:02 AM
                    </button>
                    <button
                        onClick={() => setModal("create")}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)" }}
                    >
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                        New Appointment
                    </button>
                </div>
            </div>

            {/* ── KPI Row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
                {kpis.map(k => (
                    <div key={k.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: `${k.color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: `1px solid ${k.color}25` }}>
                            {k.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{k.label}</div>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, color: "var(--fg)", lineHeight: 1, marginBottom: 4 }}>{k.value}</div>
                            <div style={{ fontSize: 11, color: k.color, fontWeight: 700 }}>{k.trend}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main Tabs ── */}
            <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: 4, width: "fit-content" }}>
                {(["appointments", "attendance"] as const).map(tab => (
                    <button key={tab} onClick={() => setMainTab(tab)} style={{ padding: "9px 22px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif", background: mainTab === tab ? "var(--primary)" : "transparent", color: mainTab === tab ? "#fff" : "var(--muted)", transition: "all 0.18s", textTransform: "capitalize" }}>
                        {tab === "appointments" ? "📅 Appointments" : "⏰ Staff Attendance"}
                    </button>
                ))}
            </div>

            {/* ══════ APPOINTMENTS TAB ══════ */}
            {mainTab === "appointments" && (
                <>
                    {/* Controls row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        {/* Filter tabs */}
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {filterTabs.map((tab, i) => (
                                <button key={tab.label} className={`filter-tab${filterTab === i ? " active" : ""}`} onClick={() => setFilterTab(i)}>
                                    {tab.label}
                                    <span style={{ marginLeft: 5, fontFamily: "'Space Mono', monospace", fontSize: 9, opacity: 0.75 }}>({tab.count})</span>
                                </button>
                            ))}
                        </div>

                        {/* View toggle on the right */}
                        <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 9, padding: 3 }}>
                            {([["calendar", "⊞ Calendar"], ["list", "☰ List"]] as const).map(([v, label]) => (
                                <button key={v} onClick={() => setAppView(v)} style={{ padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: appView === v ? "var(--primary)" : "transparent", color: appView === v ? "#fff" : "var(--muted)", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s" }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── CALENDAR VIEW ── */}
                    {appView === "calendar" && (
                        <CalendarView onAppointmentClick={a => { setSelectedAppt(a); setModal("view"); }} />
                    )}

                    {/* ── LIST VIEW ── */}
                    {appView === "list" && (
                        <div className="card">
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Session Type</th>
                                    <th>Date & Time</th>
                                    <th>Duration</th>
                                    <th>Staff</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" as const }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredAppts.map(appt => {
                                    const sc = statusConfig[appt.status];
                                    return (
                                        <tr key={appt.id}>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div className="av-initials" style={{ background: appt.patientColor }}>{appt.patientInitials}</div>
                                                    <div>
                                                        <div className="patient-name">{appt.patientName}</div>
                                                        <div className="patient-id">{appt.patientId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <span className="td-text">{appt.type}</span>
                                                    {appt.isGroup && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: "var(--primary-light)", color: "var(--primary)", fontFamily: "'Space Mono', monospace" }}>GROUP</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <span className="td-mono">{appt.date}</span>
                                                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--primary)", marginTop: 1, fontWeight: 700 }}>{appt.startTime} – {appt.endTime}</div>
                                                </div>
                                            </td>
                                            <td><span className="td-mono">{appt.duration} min</span></td>
                                            <td><span className="td-text">{appt.staffName}</span></td>
                                            <td><span className="td-text">{appt.location}</span></td>
                                            <td><span className={`chip ${sc.chip}`}>{sc.label}</span></td>
                                            <td style={{ textAlign: "right" as const }}>
                                                <div className="dots-menu-wrap" style={{ position: "relative", display: "inline-block", zIndex: openMenuId === appt.id ? 200 : "auto" }}>
                                                    <button className="dots-btn" onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === appt.id ? null : appt.id); }}>···</button>
                                                    <div className={`dots-menu${openMenuId === appt.id ? " open" : ""}`} style={{ minWidth: 195 }}>
                                                        <div className="dots-menu-item" onClick={() => { setSelectedAppt(appt); setModal("view"); setOpenMenuId(null); }}><span className="dots-menu-icon">👁</span>View Details</div>
                                                        {appt.status === "scheduled" && (
                                                            <div className="dots-menu-item" style={{ color: "var(--success)" }} onClick={() => { setSelectedAppt(appt); setActionType("confirm"); setModal("confirm"); setOpenMenuId(null); }}><span className="dots-menu-icon">✅</span>Confirm</div>
                                                        )}
                                                        {["scheduled", "confirmed"].includes(appt.status) && (
                                                            <div className="dots-menu-item" onClick={() => { setSelectedAppt(appt); setModal("reschedule"); setOpenMenuId(null); }}><span className="dots-menu-icon">📅</span>Reschedule</div>
                                                        )}
                                                        {appt.status === "confirmed" && <>
                                                            <div className="dots-menu-item" style={{ color: "var(--purple)" }} onClick={() => { setSelectedAppt(appt); setActionType("complete"); setModal("confirm"); setOpenMenuId(null); }}><span className="dots-menu-icon">✓</span>Mark Complete</div>
                                                            <div className="dots-menu-item" style={{ color: "var(--warning)" }} onClick={() => { setSelectedAppt(appt); setActionType("no_show"); setModal("confirm"); setOpenMenuId(null); }}><span className="dots-menu-icon">⚠️</span>No-show</div>
                                                        </>}
                                                        {(appt.status === "completed" || appt.isGroup) && (
                                                            <div className="dots-menu-item" onClick={() => { setSelectedAppt(appt); setModal("mark_attendance"); setOpenMenuId(null); }}><span className="dots-menu-icon">📋</span>Attendance</div>
                                                        )}
                                                        {["scheduled", "confirmed"].includes(appt.status) && (
                                                            <div className="dots-menu-item danger" onClick={() => { setSelectedAppt(appt); setActionType("cancel"); setModal("confirm"); setOpenMenuId(null); }}><span className="dots-menu-icon">❌</span>Cancel</div>
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
                                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>Showing {filteredAppts.length} appointments</span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ══════ STAFF ATTENDANCE TAB ══════ */}
            {mainTab === "attendance" && (
                <>
                    {/* Summary cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
                        {[
                            { label: "Total Staff", value: String(MOCK_STAFF_ATTENDANCE.length), icon: "👥", color: "var(--primary)" },
                            { label: "Clocked In", value: String(MOCK_STAFF_ATTENDANCE.filter(s => s.status === "in").length), icon: "✅", color: "var(--success)" },
                            { label: "Late", value: String(MOCK_STAFF_ATTENDANCE.filter(s => s.status === "late").length), icon: "⏰", color: "var(--warning)" },
                            { label: "Absent / Leave", value: String(MOCK_STAFF_ATTENDANCE.filter(s => s.status === "absent" || s.status === "leave").length), icon: "❌", color: "var(--danger)" },
                        ].map(s => (
                            <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                                <span style={{ fontSize: 22 }}>{s.icon}</span>
                                <div>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Two column: Clock in widget + today's overview */}
                    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, marginBottom: 24 }}>
                        {/* Clock in/out widget */}
                        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)" }}>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>My Attendance</div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Dr. Ndukwe Victory · Admin</div>
                            </div>
                            <div style={{ padding: "20px" }}>
                                {/* Current time */}
                                <div style={{ textAlign: "center", marginBottom: 20 }}>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.04em" }}>09:24</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Thu, 16 Apr 2026</div>
                                </div>

                                {/* Status */}
                                <div style={{ background: "var(--success-light)", border: "1px solid var(--success)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--success)", display: "inline-block", boxShadow: "0 0 8px var(--success)" }} />
                                    <div>
                                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--success)" }}>Currently Clocked In</div>
                                        <div style={{ fontSize: 11, color: "var(--muted)" }}>Since 08:02 AM · 1h 22m</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setIsClockedIn(true); setModal("clock_in"); }}
                                    style={{ width: "100%", padding: "11px", border: "1.5px solid var(--danger)", borderRadius: 10, background: "var(--danger-light)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--danger)", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s" }}
                                >
                                    🚪 Clock Out
                                </button>

                                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Today's Summary</div>
                                    {[
                                        { label: "Clock In", value: "08:02 AM" },
                                        { label: "Sessions", value: "3 / 5 done" },
                                        { label: "Hours", value: "1h 22m" },
                                    ].map(row => (
                                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 12.5 }}>
                                            <span style={{ color: "var(--muted)", fontWeight: 600 }}>{row.label}</span>
                                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--fg)" }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Today's Progress */}
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Today's Attendance Overview</div>
                                <div className="card-meta">THU, 16 APR 2026</div>
                            </div>
                            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                                {MOCK_STAFF_ATTENDANCE.map(staff => {
                                    const st = attendanceStatus[staff.status as keyof typeof attendanceStatus] || attendanceStatus.absent;
                                    return (
                                        <div key={staff.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
                                            <div style={{ width: 38, height: 38, borderRadius: 10, background: staff.status === "absent" || staff.status === "leave" ? "#e5e5e5" : `${staff.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 700, color: staff.status === "absent" || staff.status === "leave" ? "#bbb" : staff.color, flexShrink: 0 }}>
                                                {staff.initials}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13.5, fontWeight: 700, color: staff.status === "absent" || staff.status === "leave" ? "var(--muted)" : "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{staff.name}</div>
                                                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{staff.role}</div>
                                            </div>
                                            <div style={{ textAlign: "center", minWidth: 70 }}>
                                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, color: staff.clockIn ? "var(--fg)" : "var(--muted)" }}>{staff.clockIn || "—"}</div>
                                                <div style={{ fontSize: 9, color: "var(--muted)" }}>clock-in</div>
                                            </div>
                                            <div style={{ textAlign: "center", minWidth: 60 }}>
                                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--fg)" }}>{staff.sessions}</div>
                                                <div style={{ fontSize: 9, color: "var(--muted)" }}>sessions</div>
                                            </div>
                                            <span style={{ padding: "4px 12px", borderRadius: 20, background: st.bg, color: st.color, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" }}>{st.label}</span>
                                            <button
                                                onClick={() => { setSelectedStaff(staff); setModal("staff_history"); }}
                                                style={{ padding: "5px 12px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif", flexShrink: 0 }}
                                            >History</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* All-staff attendance table */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Full Attendance Log</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div className="card-meta">TODAY · 16 APR 2026</div>
                                <button style={{ padding: "5px 12px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Export CSV</button>
                            </div>
                        </div>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Staff Member</th>
                                <th>Role</th>
                                <th>Clock In</th>
                                <th>Clock Out</th>
                                <th>Hours</th>
                                <th>Sessions</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" as const }}>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {MOCK_STAFF_ATTENDANCE.map(staff => {
                                const st = attendanceStatus[staff.status as keyof typeof attendanceStatus] || attendanceStatus.absent;
                                return (
                                    <tr key={staff.id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: 9, background: staff.status === "absent" || staff.status === "leave" ? "#e5e5e5" : `linear-gradient(135deg, ${staff.color} 0%, ${staff.color}88 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 12, fontWeight: 700, color: staff.status === "absent" || staff.status === "leave" ? "#bbb" : "#fff", flexShrink: 0 }}>
                                                    {staff.initials}
                                                </div>
                                                <div>
                                                    <div className="patient-name">{staff.name}</div>
                                                    <div className="patient-id">{staff.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="td-text">{staff.role}</span></td>
                                        <td><span className="td-mono">{staff.clockIn || "—"}</span></td>
                                        <td><span className="td-mono">{staff.clockOut || "—"}</span></td>
                                        <td><span className="td-mono">{staff.clockIn ? "1h 22m+" : "—"}</span></td>
                                        <td><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{staff.sessions}</span></td>
                                        <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: st.bg, color: st.color, fontSize: 11.5, fontWeight: 700 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.color, display: "inline-block" }} />
                            {st.label}
                        </span>
                                        </td>
                                        <td style={{ textAlign: "right" as const }}>
                                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                <button
                                                    onClick={() => { setSelectedStaff(staff); setModal("staff_history"); }}
                                                    style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>
                                                    🕐 History
                                                </button>
                                                <Link href={`/staff/${staff.id}`}>
                                                    <button style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>
                                                        Profile
                                                    </button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </>
    );
}