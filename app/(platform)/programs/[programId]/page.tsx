"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Mock Data ─── */
const program = {
    id: "PRG-001",
    name: "Cognitive Behavioural Therapy (CBT)",
    description:
        "Structured psychotherapy focusing on identifying and changing negative thought patterns and behaviours. Delivered in both individual and group formats, this programme targets depression, anxiety, OCD, PTSD, and related conditions using evidence-based CBT models.",
    category: "Psychotherapy",
    totalSessions: 24,
    durationMonths: 6,
    frequency: "Weekly",
    maxEnrollment: 30,
    currentEnrollment: 24,
    groupSessions: 18,
    status: "active",
    lead: "Dr. C. Obi",
    createdDate: "01 Jan 2025",
    endDate: "30 Jun 2025",
    color: "#2C7A6E",
    icon: "🧠",
    objectives: [
        "Identify and challenge cognitive distortions",
        "Develop healthy behavioural activation strategies",
        "Build emotional regulation and coping skills",
        "Reduce depressive and anxiety symptoms",
        "Equip patients with long-term relapse prevention tools",
    ],
};

const enrolledPatients = [
    { id: "PAT-0142", name: "Amara Okafor", initials: "AO", color: "#2C7A6E", diagnosis: "Major Depressive Disorder", sessionsAttended: 14, totalSessions: 24, status: "active", enrolledDate: "15 Feb 2025", therapist: "Dr. B. Adeyemi", progress: 58 },
    { id: "PAT-0135", name: "Ngozi Eze", initials: "NE", color: "#27A76A", diagnosis: "PTSD — Complex Trauma", sessionsAttended: 10, totalSessions: 24, status: "active", enrolledDate: "20 Feb 2025", therapist: "Dr. C. Obi", progress: 42 },
    { id: "PAT-0130", name: "Fatima Hassan", initials: "FH", color: "#D98326", diagnosis: "OCD — Contamination Subtype", sessionsAttended: 8, totalSessions: 24, status: "active", enrolledDate: "01 Mar 2025", therapist: "Dr. B. Adeyemi", progress: 33 },
    { id: "PAT-0141", name: "Chidi Nwosu", initials: "CN", color: "#6B5ED4", diagnosis: "Generalised Anxiety Disorder", sessionsAttended: 4, totalSessions: 24, status: "active", enrolledDate: "10 Mar 2025", therapist: "Dr. A. Kolade", progress: 17 },
    { id: "PAT-0119", name: "David Onu", initials: "DO", color: "#4A9E91", diagnosis: "Social Anxiety Disorder", sessionsAttended: 24, totalSessions: 24, status: "completed", enrolledDate: "10 Jan 2025", therapist: "Dr. C. Obi", progress: 100 },
];

const groupSessions = [
    { id: "GS-001", title: "Session 1 — Orientation & Introduction", date: "08 Jan 2025", time: "10:00 AM", duration: "90 min", facilitator: "Dr. C. Obi", location: "Group Hall A", attendance: 18, capacity: 20, status: "completed" },
    { id: "GS-002", title: "Session 2 — Understanding Cognitive Distortions", date: "15 Jan 2025", time: "10:00 AM", duration: "90 min", facilitator: "Dr. C. Obi", location: "Group Hall A", attendance: 17, capacity: 20, status: "completed" },
    { id: "GS-003", title: "Session 3 — Thought Records & ABC Model", date: "22 Jan 2025", time: "10:00 AM", duration: "90 min", facilitator: "Dr. B. Adeyemi", location: "Group Hall A", attendance: 19, capacity: 20, status: "completed" },
    { id: "GS-004", title: "Session 4 — Behavioural Activation Strategies", date: "29 Jan 2025", time: "10:00 AM", duration: "90 min", facilitator: "Dr. C. Obi", location: "Group Hall A", attendance: 16, capacity: 20, status: "completed" },
    { id: "GS-005", title: "Session 5 — Exposure & Response Prevention", date: "05 Feb 2025", time: "10:00 AM", duration: "90 min", facilitator: "Dr. C. Obi", location: "Group Hall A", attendance: 20, capacity: 20, status: "completed" },
    { id: "GS-006", title: "Session 6 — Relapse Prevention Planning", date: "14 Apr 2025", time: "10:00 AM", duration: "90 min", facilitator: "Dr. C. Obi", location: "Group Hall A", attendance: 0, capacity: 20, status: "upcoming" },
    { id: "GS-007", title: "Session 7 — Mindful Integration", date: "21 Apr 2025", time: "10:00 AM", duration: "90 min", facilitator: "Dr. B. Adeyemi", location: "Group Hall A", attendance: 0, capacity: 20, status: "upcoming" },
];

const attendanceSession = groupSessions[0];
const attendanceRecords = [
    { patient: "Amara Okafor", id: "PAT-0142", initials: "AO", color: "#2C7A6E", status: "present", arrivedAt: "09:58 AM", notes: "" },
    { patient: "Ngozi Eze", id: "PAT-0135", initials: "NE", color: "#27A76A", status: "present", arrivedAt: "10:05 AM", notes: "Arrived slightly late" },
    { patient: "Fatima Hassan", id: "PAT-0130", initials: "FH", color: "#D98326", status: "absent", arrivedAt: "—", notes: "Called in sick" },
    { patient: "Chidi Nwosu", id: "PAT-0141", initials: "CN", color: "#6B5ED4", status: "present", arrivedAt: "10:00 AM", notes: "" },
    { patient: "David Onu", id: "PAT-0119", initials: "DO", color: "#4A9E91", status: "excused", arrivedAt: "—", notes: "Pre-approved absence" },
];

const tabs = ["Overview", "Enrolled Patients", "Group Sessions", "Attendance"];

const statusSessionChip = (s: string) => {
    if (s === "completed") return "chip-active";
    if (s === "upcoming") return "chip-inactive";
    if (s === "cancelled") return "chip-critical";
    return "chip-pending";
};
const statusSessionLabel = (s: string) => {
    if (s === "completed") return "Completed";
    if (s === "upcoming") return "Upcoming";
    if (s === "cancelled") return "Cancelled";
    return s;
};

const attendanceStatusStyle = (s: string) => {
    if (s === "present") return { color: "var(--success)", bg: "var(--success-light)", label: "Present" };
    if (s === "absent") return { color: "var(--danger)", bg: "var(--danger-light)", label: "Absent" };
    if (s === "excused") return { color: "var(--warning)", bg: "var(--warning-light)", label: "Excused" };
    return { color: "var(--muted)", bg: "var(--surface)", label: s };
};

/* ─── Create Group Session Modal ─── */
function CreateSessionModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({
        title: "", date: "", time: "", duration: "90", facilitator: "", location: "", notes: "",
    });

    const staffList = [
        "Dr. C. Obi — Psychologist",
        "Dr. B. Adeyemi — Psychiatrist",
        "Dr. A. Kolade — Psychiatrist",
        "Dr. F. Eze — Counsellor",
        "Nurse R. Bello — Psychiatric Nurse",
    ];

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)",
            backdropFilter: "blur(4px)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 18, width: "100%", maxWidth: 560,
                boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden",
            }}>
                <div style={{
                    padding: "20px 28px", borderBottom: "1px solid var(--border)",
                    background: "var(--primary-xlight)",
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 700, color: "var(--fg)" }}>
                            Schedule Group Session
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                            CBT Programme · {program.name}
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8,
                        background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                </div>

                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Session Title</label>
                        <input className="form-input" type="text"
                               placeholder="e.g. Session 7 — Mindful Integration"
                               value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Date</label>
                            <input className="form-input" type="date"
                                   value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Time</label>
                            <input className="form-input" type="time"
                                   value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Duration (min)</label>
                            <input className="form-input" type="number" placeholder="90"
                                   value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Facilitator</label>
                            <select className="form-input" value={form.facilitator}
                                    onChange={e => setForm(p => ({ ...p, facilitator: e.target.value }))} style={{ cursor: "pointer" }}>
                                <option value="">Select facilitator</option>
                                {staffList.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Location / Room</label>
                            <input className="form-input" type="text" placeholder="e.g. Group Hall A"
                                   value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Session Notes <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
                        <textarea className="form-input" rows={2}
                                  placeholder="Any prep notes for this session…"
                                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                  style={{ resize: "none" }} />
                    </div>
                </div>

                <div style={{
                    padding: "14px 28px", borderTop: "1px solid var(--border)",
                    display: "flex", justifyContent: "flex-end", gap: 10,
                }}>
                    <button onClick={onClose} style={{
                        padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9,
                        background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700,
                        color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif",
                    }}>Cancel</button>
                    <button onClick={onClose} style={{
                        padding: "10px 24px", border: "none", borderRadius: 9,
                        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                        cursor: "pointer", fontSize: 13.5, fontWeight: 700,
                        color: "#fff", fontFamily: "'Nunito', sans-serif",
                        boxShadow: "0 3px 12px rgba(44,122,110,0.28)",
                    }}>Schedule Session</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Mark Attendance Modal ─── */
function MarkAttendanceModal({ session, onClose }: { session: typeof groupSessions[0]; onClose: () => void }) {
    const [records, setRecords] = useState(
        attendanceRecords.map(r => ({ ...r }))
    );

    const toggle = (idx: number) => {
        setRecords(prev => {
            const next = [...prev];
            const cur = next[idx].status;
            next[idx] = {
                ...next[idx],
                status: cur === "present" ? "absent" : cur === "absent" ? "excused" : "present",
            };
            return next;
        });
    };

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(25,40,37,0.6)",
            backdropFilter: "blur(4px)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 18, width: "100%", maxWidth: 560,
                boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden",
            }}>
                <div style={{
                    padding: "20px 24px", borderBottom: "1px solid var(--border)",
                    background: "var(--primary-xlight)",
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>
                            Mark Attendance
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                            {session.title} · {session.date} · {session.time}
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8,
                        background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                </div>

                {/* Legend */}
                <div style={{
                    padding: "10px 24px", borderBottom: "1px solid var(--border)",
                    background: "var(--surface)",
                    display: "flex", gap: 16, fontSize: 11.5,
                }}>
                    <span style={{ color: "var(--muted)", fontWeight: 600, marginRight: 4 }}>Click status to cycle:</span>
                    {[
                        { s: "present", label: "Present", color: "var(--success)" },
                        { s: "absent", label: "Absent", color: "var(--danger)" },
                        { s: "excused", label: "Excused", color: "var(--warning)" },
                    ].map(x => (
                        <span key={x.s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: x.color, display: "inline-block" }} />
                            <span style={{ color: x.color, fontWeight: 700 }}>{x.label}</span>
                        </span>
                    ))}
                </div>

                <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {records.map((r, i) => {
                        const st = attendanceStatusStyle(r.status);
                        return (
                            <div key={r.id} style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "13px 24px",
                                borderBottom: i < records.length - 1 ? "1px solid var(--border)" : "none",
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                                    background: `${r.color}22`, display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    fontFamily: "'Fraunces', serif", fontSize: 12, fontWeight: 700, color: r.color,
                                }}>{r.initials}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>{r.patient}</div>
                                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)" }}>{r.id}</div>
                                </div>
                                <button
                                    onClick={() => toggle(i)}
                                    style={{
                                        padding: "5px 14px", border: `1.5px solid ${st.color}`,
                                        borderRadius: 20, background: st.bg,
                                        cursor: "pointer", fontSize: 12, fontWeight: 700,
                                        color: st.color, fontFamily: "'Nunito', sans-serif",
                                        transition: "all 0.18s", minWidth: 80, textAlign: "center",
                                    }}
                                >{st.label}</button>
                            </div>
                        );
                    })}
                </div>

                <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{
                        padding: "10px 18px", border: "1.5px solid var(--border)", borderRadius: 9,
                        background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700,
                        color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif",
                    }}>Cancel</button>
                    <button onClick={onClose} style={{
                        padding: "10px 22px", border: "none", borderRadius: 9,
                        background: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 700,
                        color: "#fff", fontFamily: "'Nunito', sans-serif",
                        boxShadow: "0 2px 8px rgba(44,122,110,0.22)",
                    }}>Save Attendance</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ─── */
export default function ProgramDetailPage({ params }: { params: { programId: string } }) {
    const [activeTab, setActiveTab] = useState("Overview");
    const [showCreateSession, setShowCreateSession] = useState(false);
    const [showMarkAttendance, setShowMarkAttendance] = useState(false);
    const [selectedSession, setSelectedSession] = useState(groupSessions[0]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [attendanceSessionId, setAttendanceSessionId] = useState("GS-001");

    const enrollPct = Math.round((program.currentEnrollment / program.maxEnrollment) * 100);

    const completedSessions = groupSessions.filter(s => s.status === "completed").length;
    const upcomingSessions = groupSessions.filter(s => s.status === "upcoming").length;

    const sessionForAttendance = groupSessions.find(s => s.id === attendanceSessionId) || groupSessions[0];

    return (
        <>
            {showCreateSession && <CreateSessionModal onClose={() => setShowCreateSession(false)} />}
            {showMarkAttendance && (
                <MarkAttendanceModal
                    session={sessionForAttendance}
                    onClose={() => setShowMarkAttendance(false)}
                />
            )}
            {openMenuId && (
                <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setOpenMenuId(null)} />
            )}

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "var(--muted)" }}>
                <Link href="/programs" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 700 }}>
                    ← Programs
                </Link>
                <span>/</span>
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>{program.name}</span>
                <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--primary)",
                    background: "var(--primary-light)", padding: "2px 8px", borderRadius: 5, fontWeight: 700, marginLeft: 4,
                }}>{program.id}</span>
            </div>

            {/* ── Hero Card ── */}
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 16, marginBottom: 20, overflow: "hidden",
            }}>
                <div style={{ height: 5, background: `linear-gradient(90deg, ${program.color}, ${program.color}66)` }} />

                <div style={{ padding: "24px 28px" }}>
                    {/* Top row */}
                    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                        {/* Icon */}
                        <div style={{
                            width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                            background: `${program.color}14`,
                            border: `1.5px solid ${program.color}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 28,
                        }}>{program.icon}</div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <div>
                                    <h1 style={{
                                        fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700,
                                        color: "var(--fg)", letterSpacing: "-0.02em", marginBottom: 6,
                                    }}>{program.name}</h1>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                        <span className="chip chip-active">{program.status}</span>
                                        <span style={{
                                            fontSize: 11.5, fontWeight: 700, padding: "3px 10px",
                                            borderRadius: 20, background: "var(--primary-light)", color: "var(--primary)",
                                            fontFamily: "'Space Mono', monospace",
                                        }}>{program.category}</span>
                                        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                                            Lead: <strong style={{ color: "var(--fg)" }}>{program.lead}</strong>
                                        </span>
                                        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                                            Created {program.createdDate}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                    <button style={{
                                        padding: "8px 14px", border: "1.5px solid var(--border)",
                                        borderRadius: 9, background: "var(--card)",
                                        cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                                        color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif",
                                    }}>✏️ Edit Program</button>

                                    <button style={{
                                        padding: "8px 14px", border: "1.5px solid var(--warning)",
                                        borderRadius: 9, background: "var(--warning-light)",
                                        cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                                        color: "var(--warning)", fontFamily: "'Nunito', sans-serif",
                                    }}>⏸ Disable</button>

                                    <button onClick={() => setShowCreateSession(true)} style={{
                                        padding: "8px 16px", border: "none",
                                        borderRadius: 9, background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                                        cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                                        color: "#fff", fontFamily: "'Nunito', sans-serif",
                                        boxShadow: "0 2px 8px rgba(44,122,110,0.25)",
                                    }}>+ Schedule Session</button>
                                </div>
                            </div>

                            {/* Stats strip */}
                            <div style={{
                                display: "flex", gap: 0, marginTop: 16,
                                paddingTop: 16, borderTop: "1px solid var(--border)",
                            }}>
                                {[
                                    { label: "Total Sessions", value: String(program.totalSessions) },
                                    { label: "Duration", value: `${program.durationMonths} months` },
                                    { label: "Frequency", value: program.frequency },
                                    { label: "Group Sessions Run", value: String(completedSessions) },
                                    { label: "Upcoming Sessions", value: String(upcomingSessions) },
                                    { label: "End Date", value: program.endDate },
                                ].map((item, i) => (
                                    <div key={item.label} style={{
                                        flex: 1, paddingLeft: i > 0 ? 16 : 0,
                                        borderLeft: i > 0 ? "1px solid var(--border)" : "none",
                                        marginLeft: i > 0 ? 16 : 0,
                                    }}>
                                        <div style={{
                                            fontFamily: "'Space Mono', monospace", fontSize: 8.5,
                                            color: "var(--muted)", letterSpacing: "0.08em",
                                            textTransform: "uppercase", marginBottom: 3,
                                        }}>{item.label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Enrollment bar */}
                    <div style={{
                        marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)",
                        display: "flex", alignItems: "center", gap: 16,
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)" }}>
                                    Enrollment: <strong style={{ color: "var(--fg)" }}>{program.currentEnrollment}/{program.maxEnrollment} patients</strong>
                                </span>
                                <span style={{
                                    fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700,
                                    color: enrollPct >= 100 ? "var(--danger)" : enrollPct >= 80 ? "var(--warning)" : "var(--success)",
                                }}>{enrollPct}% capacity</span>
                            </div>
                            <div style={{ height: 8, background: "var(--border)", borderRadius: 8, overflow: "hidden" }}>
                                <div style={{
                                    height: "100%",
                                    width: `${Math.min(enrollPct, 100)}%`,
                                    background: enrollPct >= 100 ? "var(--danger)" : enrollPct >= 80 ? "var(--warning)" : program.color,
                                    borderRadius: 8, transition: "width 0.8s ease",
                                }} />
                            </div>
                        </div>
                        <div style={{ flexShrink: 0, display: "flex", gap: 8 }}>
                            <button style={{
                                padding: "8px 14px", border: "1.5px solid var(--primary)",
                                borderRadius: 8, background: "var(--primary-light)",
                                cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                                color: "var(--primary)", fontFamily: "'Nunito', sans-serif",
                            }}>+ Enrol Patient</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{
                display: "flex", gap: 2, marginBottom: 20,
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 11, padding: 4, width: "fit-content",
            }}>
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: "8px 18px", borderRadius: 8, border: "none",
                        cursor: "pointer", fontSize: 13, fontWeight: 700,
                        fontFamily: "'Nunito', sans-serif",
                        background: activeTab === tab ? "var(--primary)" : "transparent",
                        color: activeTab === tab ? "#fff" : "var(--muted)",
                        transition: "all 0.18s", whiteSpace: "nowrap",
                    }}>{tab}</button>
                ))}
            </div>

            {/* ══════ TAB: OVERVIEW ══════ */}
            {activeTab === "Overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {/* Program Description */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">About This Program</div>
                        </div>
                        <div style={{ padding: "18px 20px" }}>
                            <p style={{ fontSize: 13.5, color: "var(--fg-mid)", lineHeight: 1.75, marginBottom: 18 }}>
                                {program.description}
                            </p>
                            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                                <div style={{
                                    fontFamily: "'Space Mono', monospace", fontSize: 9,
                                    color: "var(--muted)", letterSpacing: "0.08em",
                                    textTransform: "uppercase", marginBottom: 10, fontWeight: 700,
                                }}>Learning Objectives</div>
                                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                                    {program.objectives.map((obj, i) => (
                                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                                            <span style={{
                                                width: 20, height: 20, borderRadius: "50%",
                                                background: "var(--primary-light)", color: "var(--primary)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 1,
                                                fontFamily: "'Space Mono', monospace",
                                            }}>{String(i + 1).padStart(2, "0")}</span>
                                            <span style={{ fontSize: 13, color: "var(--fg-mid)", lineHeight: 1.5 }}>{obj}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* Session progress */}
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Session Progress</div>
                                <div className="card-meta">PROGRAMME OVERVIEW</div>
                            </div>
                            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                                {[
                                    { label: "Sessions Completed", value: completedSessions, max: program.totalSessions, color: "var(--success)" },
                                    { label: "Sessions Upcoming", value: upcomingSessions, max: program.totalSessions, color: "var(--primary)" },
                                    { label: "Enrollment Filled", value: program.currentEnrollment, max: program.maxEnrollment, color: program.color },
                                ].map(m => (
                                    <div key={m.label}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-mid)" }}>{m.label}</span>
                                            <span style={{
                                                fontFamily: "'Space Mono', monospace", fontSize: 11,
                                                fontWeight: 700, color: m.color,
                                            }}>{m.value}/{m.max}</span>
                                        </div>
                                        <div style={{ height: 7, background: "var(--border)", borderRadius: 7, overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%",
                                                width: `${Math.round((m.value / m.max) * 100)}%`,
                                                background: m.color, borderRadius: 7,
                                                transition: "width 0.7s ease",
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Program Details */}
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Program Details</div>
                            </div>
                            <div style={{ padding: "12px 20px" }}>
                                {[
                                    { icon: "👨‍⚕️", label: "Program Lead", value: program.lead },
                                    { icon: "📅", label: "Start Date", value: program.createdDate },
                                    { icon: "🏁", label: "End Date", value: program.endDate },
                                    { icon: "🔄", label: "Frequency", value: program.frequency },
                                    { icon: "⏱️", label: "Total Sessions", value: `${program.totalSessions} sessions` },
                                    { icon: "👥", label: "Max Enrollment", value: `${program.maxEnrollment} patients` },
                                ].map((row, i, arr) => (
                                    <div key={row.label} style={{
                                        display: "flex", gap: 11, padding: "10px 0",
                                        borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                                        alignItems: "center",
                                    }}>
                                        <span style={{ fontSize: 15, width: 22, textAlign: "center", flexShrink: 0 }}>{row.icon}</span>
                                        <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, minWidth: 100 }}>{row.label}</span>
                                        <span style={{ fontSize: 13, color: "var(--fg)", fontWeight: 600 }}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════ TAB: ENROLLED PATIENTS ══════ */}
            {activeTab === "Enrolled Patients" && (
                <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <span style={{ fontSize: 13.5, color: "var(--fg-mid)", fontWeight: 500 }}>
                            {program.currentEnrollment} enrolled · {program.maxEnrollment - program.currentEnrollment} slots remaining
                        </span>
                        <button style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "9px 16px",
                            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                            border: "none", borderRadius: 9, color: "#fff",
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                            fontFamily: "'Nunito', sans-serif", boxShadow: "0 2px 8px rgba(44,122,110,0.25)",
                        }}>
                            <span style={{ fontSize: 16 }}>+</span> Enrol Patient
                        </button>
                    </div>

                    <div className="card">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Diagnosis</th>
                                <th>Therapist</th>
                                <th>Enrolled Date</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" as const }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {enrolledPatients.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <Link href={`/patients/${p.id}`} style={{ textDecoration: "none" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div className="av-initials" style={{ background: p.color }}>{p.initials}</div>
                                                <div>
                                                    <div className="patient-name">{p.name}</div>
                                                    <div className="patient-id">{p.id}</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td><span className="td-text">{p.diagnosis}</span></td>
                                    <td><span className="td-text">{p.therapist}</span></td>
                                    <td><span className="td-mono">{p.enrolledDate}</span></td>
                                    <td>
                                        <div style={{ minWidth: 110 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11.5 }}>
                                                <span style={{ color: "var(--muted)" }}>{p.sessionsAttended}/{p.totalSessions} sessions</span>
                                                <span style={{
                                                    fontWeight: 700,
                                                    color: p.progress === 100 ? "var(--success)" : p.progress >= 60 ? "var(--primary)" : "var(--warning)",
                                                }}>{p.progress}%</span>
                                            </div>
                                            <div style={{ height: 5, background: "var(--border)", borderRadius: 5, overflow: "hidden" }}>
                                                <div style={{
                                                    height: "100%",
                                                    width: `${p.progress}%`,
                                                    background: p.progress === 100 ? "var(--success)" : p.progress >= 60 ? "var(--primary)" : "var(--warning)",
                                                    borderRadius: 5,
                                                }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                            <span className={`chip ${p.status === "completed" ? "chip-active" : p.status === "active" ? "chip-progress" : "chip-inactive"}`}>
                                                {p.status === "completed" ? "Completed" : p.status === "active" ? "In Progress" : p.status}
                                            </span>
                                    </td>
                                    <td style={{ textAlign: "right" as const }}>
                                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                            <Link href={`/patients/${p.id}`}>
                                                <button style={{
                                                    padding: "5px 11px", border: "1.5px solid var(--border)",
                                                    borderRadius: 7, background: "var(--card)",
                                                    cursor: "pointer", fontSize: 11.5, fontWeight: 700,
                                                    color: "var(--primary)", fontFamily: "'Nunito', sans-serif",
                                                }}>Profile</button>
                                            </Link>
                                            {p.status !== "completed" && (
                                                <button style={{
                                                    padding: "5px 11px", border: "1.5px solid var(--danger-light)",
                                                    borderRadius: 7, background: "var(--danger-light)",
                                                    cursor: "pointer", fontSize: 11.5, fontWeight: 700,
                                                    color: "var(--danger)", fontFamily: "'Nunito', sans-serif",
                                                }}>Remove</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button className="page-btn disabled">« Prev</button>
                            <button className="page-btn active">1</button>
                            <button className="page-btn">Next »</button>
                            <div style={{ marginLeft: "auto" }}>
                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>
                                    {enrolledPatients.length} enrolled patients
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════ TAB: GROUP SESSIONS ══════ */}
            {activeTab === "Group Sessions" && (
                <div>
                    {/* Session summary mini cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
                        {[
                            { label: "Total Scheduled", value: groupSessions.length, icon: "📅", color: "var(--primary)" },
                            { label: "Completed", value: completedSessions, icon: "✅", color: "var(--success)" },
                            { label: "Upcoming", value: upcomingSessions, icon: "⏳", color: "var(--warning)" },
                            { label: "Avg Attendance", value: `${Math.round(groupSessions.filter(s => s.status === "completed").reduce((a, s) => a + s.attendance, 0) / completedSessions)}`, icon: "👥", color: "var(--purple)" },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: "var(--card)", border: "1px solid var(--border)",
                                borderRadius: 12, padding: "16px 18px",
                                display: "flex", gap: 12, alignItems: "center",
                            }}>
                                <span style={{ fontSize: 22 }}>{s.icon}</span>
                                <div>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                        <button onClick={() => setShowCreateSession(true)} style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "9px 16px",
                            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                            border: "none", borderRadius: 9, color: "#fff",
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                            fontFamily: "'Nunito', sans-serif", boxShadow: "0 2px 8px rgba(44,122,110,0.25)",
                        }}>
                            <span style={{ fontSize: 16 }}>+</span> Schedule Session
                        </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {groupSessions.map((gs, i) => (
                            <div key={gs.id} style={{
                                background: "var(--card)", border: "1px solid var(--border)",
                                borderRadius: 13, overflow: "hidden",
                                opacity: gs.status === "cancelled" ? 0.65 : 1,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                                    {/* Session number sidebar */}
                                    <div style={{
                                        width: 52, flexShrink: 0,
                                        background: gs.status === "completed" ? "var(--success-light)"
                                            : gs.status === "upcoming" ? "var(--primary-xlight)"
                                                : "var(--surface)",
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center",
                                        alignSelf: "stretch", padding: "14px 0",
                                        borderRight: "1px solid var(--border)",
                                    }}>
                                        <span style={{
                                            fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700,
                                            color: gs.status === "completed" ? "var(--success)"
                                                : gs.status === "upcoming" ? "var(--primary)" : "var(--muted)",
                                        }}>{String(i + 1).padStart(2, "0")}</span>
                                    </div>

                                    {/* Main content */}
                                    <div style={{ flex: 1, padding: "14px 18px" }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                                                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 14.5, fontWeight: 700, color: "var(--fg)" }}>
                                                        {gs.title}
                                                    </span>
                                                    <span className={`chip ${statusSessionChip(gs.status)}`}>
                                                        {statusSessionLabel(gs.status)}
                                                    </span>
                                                </div>

                                                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                                    {[
                                                        { icon: "📅", value: gs.date },
                                                        { icon: "🕐", value: gs.time },
                                                        { icon: "⏱️", value: gs.duration },
                                                        { icon: "👨‍⚕️", value: gs.facilitator },
                                                        { icon: "📍", value: gs.location },
                                                    ].map(item => (
                                                        <span key={item.icon} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--muted)" }}>
                                                            <span>{item.icon}</span>
                                                            <span style={{ fontWeight: 500, color: "var(--fg-mid)" }}>{item.value}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right: attendance + actions */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 16 }}>
                                                {/* Attendance pill */}
                                                {gs.status === "completed" && (
                                                    <div style={{ textAlign: "center" }}>
                                                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>
                                                            {gs.attendance}
                                                        </div>
                                                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.04em" }}>
                                                            ATTENDED
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action buttons */}
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    {gs.status === "completed" && (
                                                        <button
                                                            onClick={() => { setAttendanceSessionId(gs.id); setShowMarkAttendance(true); }}
                                                            style={{
                                                                padding: "6px 12px", border: "1.5px solid var(--primary)",
                                                                borderRadius: 7, background: "var(--primary-light)",
                                                                cursor: "pointer", fontSize: 11.5, fontWeight: 700,
                                                                color: "var(--primary)", fontFamily: "'Nunito', sans-serif",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >📋 Attendance</button>
                                                    )}
                                                    {gs.status === "upcoming" && (
                                                        <button
                                                            onClick={() => { setAttendanceSessionId(gs.id); setShowMarkAttendance(true); }}
                                                            style={{
                                                                padding: "6px 12px", border: "1.5px solid var(--success)",
                                                                borderRadius: 7, background: "var(--success-light)",
                                                                cursor: "pointer", fontSize: 11.5, fontWeight: 700,
                                                                color: "var(--success)", fontFamily: "'Nunito', sans-serif",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >✓ Mark Attendance</button>
                                                    )}

                                                    <div className="dots-menu-wrap" style={{ position: "relative", zIndex: openMenuId === gs.id ? 200 : "auto" }}>
                                                        <button className="dots-btn"
                                                                onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === gs.id ? null : gs.id); }}>
                                                            ···
                                                        </button>
                                                        <div className={`dots-menu${openMenuId === gs.id ? " open" : ""}`} style={{ minWidth: 180 }}>
                                                            {gs.status === "upcoming" && <>
                                                                <div className="dots-menu-item"><span className="dots-menu-icon">✏️</span>Edit Session</div>
                                                                <div className="dots-menu-item"><span className="dots-menu-icon">✓</span>Mark as Completed</div>
                                                            </>}
                                                            {gs.status === "completed" && (
                                                                <div className="dots-menu-item"><span className="dots-menu-icon">👁</span>View Session Notes</div>
                                                            )}
                                                            <div className="dots-menu-item danger"><span className="dots-menu-icon">🗑️</span>Delete Session</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══════ TAB: ATTENDANCE ══════ */}
            {activeTab === "Attendance" && (
                <div>
                    {/* Session picker */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
                            Viewing Session:
                        </div>
                        <select
                            value={attendanceSessionId}
                            onChange={e => setAttendanceSessionId(e.target.value)}
                            className="form-input"
                            style={{ maxWidth: 380, cursor: "pointer" }}
                        >
                            {groupSessions.filter(s => s.status === "completed").map(s => (
                                <option key={s.id} value={s.id}>{s.title} — {s.date}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowMarkAttendance(true)}
                            style={{
                                padding: "9px 16px", border: "none", borderRadius: 9,
                                background: "var(--primary)", cursor: "pointer",
                                fontSize: 13, fontWeight: 700, color: "#fff",
                                fontFamily: "'Nunito', sans-serif",
                                boxShadow: "0 2px 8px rgba(44,122,110,0.22)", flexShrink: 0,
                            }}
                        >Edit Attendance</button>
                    </div>

                    {/* Attendance summary */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
                        {[
                            { label: "Present", value: attendanceRecords.filter(r => r.status === "present").length, color: "var(--success)", icon: "✅" },
                            { label: "Absent", value: attendanceRecords.filter(r => r.status === "absent").length, color: "var(--danger)", icon: "❌" },
                            { label: "Excused", value: attendanceRecords.filter(r => r.status === "excused").length, color: "var(--warning)", icon: "📋" },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: "var(--card)", border: "1px solid var(--border)",
                                borderRadius: 12, padding: "16px 18px",
                                display: "flex", gap: 12, alignItems: "center",
                            }}>
                                <span style={{ fontSize: 22 }}>{s.icon}</span>
                                <div>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Attendance table */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Attendance Record</div>
                            <div style={{ display: "flex", gap: 6 }}>
                                <div className="card-meta">
                                    {sessionForAttendance.title} · {sessionForAttendance.date}
                                </div>
                            </div>
                        </div>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Status</th>
                                <th>Arrived At</th>
                                <th>Notes</th>
                            </tr>
                            </thead>
                            <tbody>
                            {attendanceRecords.map((r, i) => {
                                const st = attendanceStatusStyle(r.status);
                                return (
                                    <tr key={i}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div className="av-initials" style={{ background: r.color }}>{r.initials}</div>
                                                <div>
                                                    <div className="patient-name">{r.patient}</div>
                                                    <div className="patient-id">{r.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                                <span style={{
                                                    display: "inline-flex", alignItems: "center", gap: 5,
                                                    padding: "4px 12px", borderRadius: 20,
                                                    background: st.bg, color: st.color,
                                                    fontSize: 11.5, fontWeight: 700,
                                                }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.color, display: "inline-block" }} />
                                                    {st.label}
                                                </span>
                                        </td>
                                        <td><span className="td-mono">{r.arrivedAt}</span></td>
                                        <td>
                                                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                                                    {r.notes || <em style={{ color: "var(--border)" }}>—</em>}
                                                </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>
                                Attendance rate: {" "}
                                <strong style={{ color: "var(--success)" }}>
                                    {Math.round((attendanceRecords.filter(r => r.status === "present").length / attendanceRecords.length) * 100)}%
                                </strong>
                            </span>
                            <button style={{
                                padding: "7px 14px", border: "1.5px solid var(--border)",
                                borderRadius: 8, background: "var(--card)",
                                cursor: "pointer", fontSize: 12, fontWeight: 700,
                                color: "var(--primary)", fontFamily: "'Nunito', sans-serif",
                            }}>Export CSV</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}