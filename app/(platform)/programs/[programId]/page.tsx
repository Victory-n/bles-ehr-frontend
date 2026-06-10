"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* ══════════════════════════════════════════════════════════════════════════
   Mock Data
══════════════════════════════════════════════════════════════════════════ */

const MOCK_PROGRAMS: Record<string, any> = {
    "PRG-001": {
        id: "PRG-001",
        name: "Cognitive Behavioral Therapy",
        type: "PHP",
        sessionType: "Group",
        status: "Active",
        totalSessions: 24,
        startDate: "Jan 12, 2026",
        endDate: "Jul 12, 2026",
        frequency: "Weekly",
        createdDate: "Jan 10, 2026",
        about: "A structured, time-limited, problem-directed form of psychotherapy designed to identify and modify faulty or distorted thinking patterns, emotional responses, and behaviors. This program aims to equip patients with coping strategies and problem-solving skills.",
        maxEnrollment: 15,
        currentEnrollment: 12,
        assignedStaff: [
            { id: "EMP-4821", name: "Dr. Eleanor Vance", role: "Lead Psychiatrist", initials: "EV", color: "#0f4c81" },
            { id: "EMP-3196", name: "Marcus Thorne", role: "Clinical Nurse", initials: "MT", color: "#006970" },
        ],
    },
    "DEFAULT": {
        id: "PRG-000",
        name: "General Therapy Program",
        type: "POP",
        sessionType: "Single",
        status: "Active",
        totalSessions: 12,
        startDate: "Feb 01, 2026",
        endDate: "May 01, 2026",
        frequency: "Bi-weekly",
        createdDate: "Jan 15, 2026",
        about: "Standard therapy session program focusing on general mental well-being and routine checks.",
        maxEnrollment: 20,
        currentEnrollment: 8,
        assignedStaff: [
            { id: "EMP-1862", name: "Sarah Jenkins", role: "Therapist", initials: "SJ", color: "#7a3700" }
        ],
    }
};

const MOCK_PATIENTS = [
    { id: "RC-84920", name: "Abernathy, Sarah", enrolledDate: "Jan 15, 2026", status: "Active" },
    { id: "RC-84921", name: "Chen, Wei", enrolledDate: "Feb 02, 2026", status: "Active" },
    { id: "RC-84922", name: "Doe, Jonathan", enrolledDate: "Jan 10, 2026", status: "Inactive" },
    { id: "RC-84924", name: "Johnson, Marcus", enrolledDate: "Feb 05, 2026", status: "Active" },
];

const MOCK_SESSIONS = [
    { id: "SESS-01", name: "Introductory CBT", count: "Session 1", status: "Completed", duration: "Feb 10, 2026 | 9:00 AM - 12:00 PM" },
    { id: "SESS-02", name: "Cognitive Restructuring", count: "Session 2", status: "Completed", duration: "Feb 17, 2026 | 9:00 AM - 12:00 PM" },
    { id: "SESS-03", name: "Behavioral Activation", count: "Session 3", status: "Upcoming", duration: "Feb 24, 2026 | 9:00 AM - 12:00 PM" },
    { id: "SESS-04", name: "Identifying Triggers", count: "Session 4", status: "Upcoming", duration: "Mar 03, 2026 | 9:00 AM - 12:00 PM" },
];

const TABS = ["Overview", "Enrolled Patients", "Sessions"] as const;
type Tab = (typeof TABS)[number];

/* ══════════════════════════════════════════════════════════════════════════
   Program Detailed Page
══════════════════════════════════════════════════════════════════════════ */

export default function ProgramDetailPage() {
    const params = useParams();
    const router = useRouter();
    const programId = params.programId as string;
    const [activeTab, setActiveTab] = useState<Tab>("Overview");

    const p = MOCK_PROGRAMS[programId] ?? { ...MOCK_PROGRAMS["DEFAULT"], id: programId };

    const statusColor = p.status === "Active" ? "#137333" : p.status === "Closed" ? "#b3261e" : "#f57f17";
    const statusBg = p.status === "Active" ? "#e6f4ea" : p.status === "Closed" ? "#fce8e8" : "#fff8e1";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/programs")}>Programs</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{p.id}</span>
            </div>

            {/* ── Header Card ─────────────────────────────────────────────────── */}
            <div style={{
                background: "var(--color-surface-container-lowest)",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: 12,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 20,
            }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap", justifyContent: "space-between" }}>

                    {/* Left: Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minWidth: 300 }}>
                        <div style={{ width: 72, height: 72, borderRadius: 12, background: "var(--color-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#ffffff" }}>diversity_3</span>
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{p.name}</h2>
                                <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: statusBg, color: statusColor, display: "inline-flex", alignItems: "center", gap: 5 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
                                    {p.status}
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                                <InfoChip icon="category" text={`Type: ${p.type}`} />
                                <InfoChip icon="group" text={`Session: ${p.sessionType}`} />
                                <InfoChip icon="people" text={`Enrolled: ${p.currentEnrollment} / ${p.maxEnrollment}`} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <PrimaryBtn icon="person_add" label="Enroll Patient" />
                        <SecondaryBtn icon="event" label="Schedule Session" />
                        <SecondaryBtn icon="edit" label="Edit Program" />

                        {/* More Actions Dropdown Simulation */}
                        <div style={{ display: "flex", gap: 10 }}>
                            {p.status === "Active" && (
                                <SecondaryBtn icon="pause" label="Pause Program" color="#f57f17" />
                            )}
                            {p.status === "Paused" && (
                                <SecondaryBtn icon="play_arrow" label="Resume Program" color="#137333" />
                            )}
                            <SecondaryBtn icon="cancel" label="End Program" color="var(--color-error)" />
                        </div>
                    </div>
                </div>

                {/* Progress Bar for Enrollment */}
                <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)", marginBottom: 6 }}>
                        <span>Capacity Utilization</span>
                        <span>{Math.round((p.currentEnrollment / p.maxEnrollment) * 100)}%</span>
                    </div>
                    <div style={{ width: "100%", height: 8, borderRadius: 4, background: "var(--color-surface-container-high)", overflow: "hidden" }}>
                        <div style={{
                            width: `${(p.currentEnrollment / p.maxEnrollment) * 100}%`,
                            height: "100%",
                            background: "var(--color-primary)",
                            borderRadius: 4
                        }} />
                    </div>
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

            {/* ── Tab Content ─────────────────────────────────────────────────── */}
            {activeTab === "Overview" && <OverviewTab p={p} />}
            {activeTab === "Enrolled Patients" && <EnrolledPatientsTab />}
            {activeTab === "Sessions" && <SessionsTab />}

        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Tab Components
══════════════════════════════════════════════════════════════════════════ */

function OverviewTab({ p }: { p: any }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
            {/* Left Column: Program Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <Card title="About Program">
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-on-surface)", margin: 0 }}>
                        {p.about}
                    </p>
                </Card>

                <Card title="Program Details">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
                        <DetailRow icon="calendar_today" label="Created Date" value={p.createdDate} />
                        <DetailRow icon="update" label="Frequency" value={p.frequency} />
                        <DetailRow icon="date_range" label="Start Date" value={p.startDate} />
                        <DetailRow icon="event_available" label="End Date" value={p.endDate} />
                        <DetailRow icon="view_list" label="Total Sessions" value={p.totalSessions.toString()} />
                        <DetailRow icon="group_add" label="Max Enrollment" value={p.maxEnrollment.toString()} />
                    </div>
                </Card>
            </div>

            {/* Right Column: Assigned Staff */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <Card title={`Assigned Staff (${p.assignedStaff.length})`}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {p.assignedStaff.map((staff: any, index: number) => (
                            <div key={staff.id} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: index === p.assignedStaff.length - 1 ? 0 : 12, borderBottom: index === p.assignedStaff.length - 1 ? "none" : "1px solid var(--color-outline-variant)" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: staff.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 14, fontWeight: 700 }}>
                                    {staff.initials}
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>{staff.name}</div>
                                    <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{staff.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: 16,
                        borderRadius: 8,
                        border: "1px dashed var(--color-outline)",
                        background: "transparent",
                        color: "var(--color-on-surface-variant)",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "all 0.15s"
                    }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--color-outline)"; e.currentTarget.style.color = "var(--color-on-surface-variant)"; }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                        Assign Staff Member
                    </button>
                </Card>
            </div>
        </div>
    );
}

function EnrolledPatientsTab() {
    return (
        <Card title="Enrolled Patients" noPadding>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-low)" }}>
                        {["S/N", "PATIENT", "ENROLLED DATE", "STATUS", "ACTION"].map((h, i) => (
                            <th key={h} style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", textAlign: i === 4 ? "right" : "left", whiteSpace: "nowrap" }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {MOCK_PATIENTS.map((p, i) => (
                        <tr key={p.id} style={{ borderBottom: i < MOCK_PATIENTS.length - 1 ? "1px solid var(--color-outline-variant)" : "none" }}>
                            <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-primary-container)" }}>
                                {i + 1}
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>{p.name}</div>
                                <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{p.id}</div>
                            </td>
                            <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                                {p.enrolledDate}
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                                <span style={{
                                    padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                                    background: p.status === "Active" ? "#e6f4ea" : "#fce8e8",
                                    color: p.status === "Active" ? "#137333" : "#b3261e",
                                    display: "inline-flex", alignItems: "center", gap: 6
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.status === "Active" ? "#137333" : "#b3261e" }} />
                                    {p.status}
                                </span>
                            </td>
                            <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                                    <ActionBtn icon="visibility" title="View Patient" />
                                    <ActionBtn icon="person_remove" title="Discharge" color="var(--color-error)" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}

function SessionsTab() {
    return (
        <Card title="Program Sessions" noPadding>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-low)" }}>
                        {["S/N", "SESSION NAME", "SESSION COUNT", "STATUS", "DURATION", "ACTION"].map((h, i) => (
                            <th key={h} style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", textAlign: i === 5 ? "right" : "left", whiteSpace: "nowrap" }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {MOCK_SESSIONS.map((s, i) => (
                        <tr key={s.id} style={{ borderBottom: i < MOCK_SESSIONS.length - 1 ? "1px solid var(--color-outline-variant)" : "none" }}>
                            <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-primary-container)" }}>
                                {i + 1}
                            </td>
                            <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                                {s.name}
                            </td>
                            <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                                {s.count}
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                                <span style={{
                                    padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                                    background: s.status === "Completed" ? "#e6f4ea" : "#e8f0fe",
                                    color: s.status === "Completed" ? "#137333" : "#1967d2",
                                    display: "inline-flex", alignItems: "center", gap: 6
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.status === "Completed" ? "#137333" : "#1967d2" }} />
                                    {s.status}
                                </span>
                            </td>
                            <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                                {s.duration}
                            </td>
                            <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                                    <ActionBtn icon="edit" title="Edit Session" />
                                    <ActionBtn icon="delete" title="Delete Session" color="var(--color-error)" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Shared UI Sub-components
══════════════════════════════════════════════════════════════════════════ */

function Card({ title, children, noPadding }: { title: string; children: React.ReactNode; noPadding?: boolean }) {
    return (
        <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{title}</h3>
            </div>
            <div style={{ padding: noPadding ? 0 : 24 }}>{children}</div>
        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
            </div>
            <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>{value}</div>
            </div>
        </div>
    );
}

function InfoChip({ icon, text }: { icon: string; text: string }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>{text}
        </span>
    );
}

function PrimaryBtn({ icon, label }: { icon: string; label: string }) {
    return (
        <button
            style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
                border: "none", background: "var(--color-primary)", color: "#ffffff",
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#004a52")}
            onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
        >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>{label}
        </button>
    );
}

function SecondaryBtn({ icon, label, color }: { icon: string; label: string; color?: string }) {
    return (
        <button
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

function ActionBtn({ icon, title, color, onClick }: { icon: string; title: string; color?: string; onClick?: () => void }) {
    return (
        <button
            title={title}
            onClick={onClick}
            style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: color ?? "var(--color-on-surface-variant)",
                transition: "background 0.12s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
        </button>
    );
}
