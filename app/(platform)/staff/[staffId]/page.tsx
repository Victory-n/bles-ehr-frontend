"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Mock Data ─── */
const staffDetail = {
    id: "STF-001",
    firstName: "Chisom",
    lastName: "Obi",
    fullName: "Dr. Chisom Obi",
    position: "Psychologist",
    email: "c.obi@brightlife.health",
    phone: "0803 111 2244",
    status: "active",
    roles: ["Therapist", "Session Lead"],
    assignedPatients: 12,
    sessionsMonth: 48,
    sessionsTotal: 214,
    rating: 4.9,
    initials: "CO",
    color: "#2C7A6E",
    joinedDate: "12 Jan 2024",
    lastSeen: "Today, 09:14 AM",
    specialisation: "Trauma & PTSD, Cognitive Behavioural Therapy",
    bio: "Dr. Chisom Obi is a licensed psychologist with over 8 years of experience in trauma-focused therapy and CBT. She holds a PhD in Clinical Psychology from the University of Lagos.",
};

const assignedPatients = [
    { id: "PAT-0142", name: "Amara Okafor", diagnosis: "Major Depressive Disorder", sessions: 14, status: "active", initials: "AO", color: "#2C7A6E" },
    { id: "PAT-0135", name: "Ngozi Eze", diagnosis: "PTSD — Complex Trauma", sessions: 19, status: "active", initials: "NE", color: "#27A76A" },
    { id: "PAT-0130", name: "Fatima Hassan", diagnosis: "OCD — Contamination Subtype", sessions: 11, status: "active", initials: "FH", color: "#D98326" },
    { id: "PAT-0119", name: "David Onu", diagnosis: "Bipolar Disorder Type II", sessions: 7, status: "pending", initials: "DO", color: "#6B5ED4" },
];

const queries = [
    {
        id: "QRY-001", subject: "Missed session documentation",
        message: "You failed to submit session notes for Patient PAT-0135 on 8th April 2026. Please provide an explanation within 48 hours.",
        severity: "medium", date: "10 Apr 2026", status: "pending",
    },
    {
        id: "QRY-002", subject: "Late session start — 3 incidents",
        message: "Three consecutive sessions started 15+ minutes late in March. This affects patient scheduling and must be addressed.",
        severity: "low", date: "28 Mar 2026", status: "resolved",
    },
];

const attendance = [
    { date: "Mon 14 Apr", checkIn: "08:02 AM", checkOut: "05:30 PM", sessions: 6, status: "present" },
    { date: "Fri 11 Apr", checkIn: "08:15 AM", checkOut: "04:45 PM", sessions: 5, status: "present" },
    { date: "Thu 10 Apr", checkIn: "08:00 AM", checkOut: "05:00 PM", sessions: 6, status: "present" },
    { date: "Wed 09 Apr", checkIn: "—", checkOut: "—", sessions: 0, status: "absent" },
    { date: "Tue 08 Apr", checkIn: "08:30 AM", checkOut: "05:15 PM", sessions: 5, status: "late" },
    { date: "Mon 07 Apr", checkIn: "08:05 AM", checkOut: "05:00 PM", sessions: 6, status: "present" },
];

const statusHistory = [
    { date: "12 Jan 2024", action: "Onboarded", note: "Staff member created and onboarded.", actor: "Admin" },
    { date: "15 Feb 2024", action: "Roles Assigned", note: "Roles: Therapist, Session Lead", actor: "Dr. Kolade" },
    { date: "10 Apr 2026", action: "Query Issued", note: "Query QRY-001 issued for missing session notes.", actor: "Admin" },
];

const tabs = ["Overview", "Assigned Patients", "Queries", "Attendance", "Status History"];

const severityStyle = (s: string) => {
    if (s === "high") return { background: "var(--danger-light)", color: "var(--danger)" };
    if (s === "medium") return { background: "var(--warning-light)", color: "var(--warning)" };
    return { background: "var(--primary-light)", color: "var(--primary)" };
};

export default function StaffDetailPage({ params }: { params: { staffId: string } }) {
    const [activeTab, setActiveTab] = useState("Overview");

    const statusColors: Record<string, string> = {
        present: "var(--success)", late: "var(--warning)", absent: "var(--danger)",
    };

    return (
        <>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "var(--muted)" }}>
                <Link href="/staff" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 700 }}>
                    ← Staff
                </Link>
                <span>/</span>
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>{staffDetail.fullName}</span>
                <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--primary)",
                    background: "var(--primary-light)", padding: "2px 8px", borderRadius: 5, fontWeight: 700, marginLeft: 4,
                }}>{staffDetail.id}</span>
            </div>

            {/* ── Hero Card ── */}
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 16, marginBottom: 20, overflow: "hidden",
            }}>
                <div style={{ height: 6, background: `linear-gradient(90deg, ${staffDetail.color}, var(--primary-mid))` }} />

                <div style={{ padding: "24px 28px", display: "flex", gap: 24, alignItems: "flex-start" }}>
                    {/* Avatar */}
                    <div style={{
                        width: 72, height: 72, borderRadius: 16, flexShrink: 0,
                        background: `linear-gradient(135deg, ${staffDetail.color} 0%, ${staffDetail.color}99 100%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: "#fff",
                        boxShadow: `0 8px 24px ${staffDetail.color}40`,
                    }}>{staffDetail.initials}</div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div>
                                <h1 style={{
                                    fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700,
                                    color: "var(--fg)", letterSpacing: "-0.02em", marginBottom: 6,
                                }}>{staffDetail.fullName}</h1>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
                                    <span className="chip chip-active">{staffDetail.status}</span>
                                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{staffDetail.position}</span>
                                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>·</span>
                                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Joined {staffDetail.joinedDate}</span>
                                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>·</span>
                                    <span style={{ fontSize: 12.5, color: "var(--success)", fontWeight: 600 }}>
                    Last seen: {staffDetail.lastSeen}
                  </span>
                                </div>

                                {/* Roles */}
                                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" as const }}>
                                    {staffDetail.roles.map(r => (
                                        <span key={r} style={{
                                            fontSize: 11, fontWeight: 700, padding: "3px 10px",
                                            borderRadius: 20, background: "var(--purple-light)", color: "var(--purple)",
                                            fontFamily: "'Space Mono', monospace",
                                        }}>{r}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                <button style={{
                                    padding: "8px 14px", border: "1.5px solid var(--border)", borderRadius: 9,
                                    background: "var(--card)", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                                    color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif",
                                }}>🔑 Manage Roles</button>
                                <button style={{
                                    padding: "8px 14px", border: "1.5px solid var(--border)", borderRadius: 9,
                                    background: "var(--card)", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                                    color: "var(--warning)", borderColor: "var(--warning)", fontFamily: "'Nunito', sans-serif",
                                }}>📝 Issue Query</button>
                                <button style={{
                                    padding: "8px 14px", border: "1.5px solid var(--danger)", borderRadius: 9,
                                    background: "var(--danger-light)", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                                    color: "var(--danger)", fontFamily: "'Nunito', sans-serif",
                                }}>🚫 Suspend</button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{
                            display: "flex", gap: 24, marginTop: 16,
                            paddingTop: 16, borderTop: "1px solid var(--border)",
                        }}>
                            {[
                                { label: "Assigned Patients", value: staffDetail.assignedPatients },
                                { label: "Sessions (Month)", value: staffDetail.sessionsMonth },
                                { label: "Sessions (Total)", value: staffDetail.sessionsTotal },
                                { label: "Patient Rating", value: `⭐ ${staffDetail.rating}` },
                                { label: "Specialisation", value: staffDetail.specialisation },
                            ].map(item => (
                                <div key={item.label} style={{ minWidth: 0, flex: typeof item.value === "string" && item.value.length > 10 ? 2 : 1 }}>
                                    <div style={{
                                        fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)",
                                        letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 3,
                                    }}>{item.label}</div>
                                    <div style={{
                                        fontSize: 13, fontWeight: 600, color: "var(--fg)",
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    }}>{item.value}</div>
                                </div>
                            ))}
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
                        padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                        fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
                        background: activeTab === tab ? "var(--primary)" : "transparent",
                        color: activeTab === tab ? "#fff" : "var(--muted)",
                        transition: "all 0.18s", whiteSpace: "nowrap",
                    }}>{tab}</button>
                ))}
            </div>

            {/* ── Tab: Overview ── */}
            {activeTab === "Overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {/* Contact */}
                    <div className="card">
                        <div className="card-head"><div className="card-title">Contact Information</div></div>
                        <div style={{ padding: "16px 20px" }}>
                            {[
                                { icon: "📧", label: "Email", value: staffDetail.email },
                                { icon: "📞", label: "Phone", value: staffDetail.phone },
                                { icon: "🏥", label: "Position", value: staffDetail.position },
                                { icon: "🎓", label: "Specialisation", value: staffDetail.specialisation },
                            ].map((row, i, arr) => (
                                <div key={row.label} style={{
                                    display: "flex", gap: 12, padding: "11px 0",
                                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                                }}>
                                    <span style={{ fontSize: 16, width: 22, textAlign: "center" as const, flexShrink: 0 }}>{row.icon}</span>
                                    <div>
                                        <div style={{
                                            fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)",
                                            letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 2,
                                        }}>{row.label}</div>
                                        <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{row.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bio & Perf */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="card">
                            <div className="card-head"><div className="card-title">Professional Bio</div></div>
                            <div style={{ padding: "16px 20px", fontSize: 13.5, color: "var(--fg-mid)", lineHeight: 1.7 }}>
                                {staffDetail.bio}
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Performance Summary</div>
                                <div className="card-meta">THIS MONTH</div>
                            </div>
                            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                                {[
                                    { label: "Sessions Completed", value: staffDetail.sessionsMonth, max: 60, color: "var(--primary)" },
                                    { label: "Patient Satisfaction", value: Math.round(staffDetail.rating * 20), max: 100, color: "var(--success)", suffix: "%" },
                                    { label: "Attendance Rate", value: 83, max: 100, color: "var(--warning)", suffix: "%" },
                                ].map(m => (
                                    <div key={m.label}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-mid)" }}>{m.label}</span>
                                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: m.color }}>
                        {m.value}{m.suffix || ""}
                      </span>
                                        </div>
                                        <div style={{ height: 6, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%", width: `${(m.value / m.max) * 100}%`,
                                                background: m.color, borderRadius: 6, transition: "width 0.6s ease",
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tab: Assigned Patients ── */}
            {activeTab === "Assigned Patients" && (
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Assigned Patients</div>
                        <button style={{
                            fontSize: 12, fontWeight: 700, border: "1.5px solid var(--primary)",
                            background: "var(--primary-light)", color: "var(--primary)",
                            padding: "6px 13px", borderRadius: 7, cursor: "pointer",
                            fontFamily: "'Nunito', sans-serif",
                        }}>+ Assign More</button>
                    </div>
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Diagnosis</th>
                            <th>Sessions</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {assignedPatients.map(p => (
                            <tr key={p.id}>
                                <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div className="av-initials" style={{ background: p.color }}>{p.initials}</div>
                                        <div>
                                            <div className="patient-name">{p.name}</div>
                                            <div className="patient-id">{p.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="td-text">{p.diagnosis}</span></td>
                                <td><span className="td-mono">{p.sessions}</span></td>
                                <td><span className={`chip ${p.status === "active" ? "chip-active" : "chip-pending"}`}>{p.status}</span></td>
                                <td>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <Link href={`/patients/${p.id}`}>
                                            <button style={{
                                                padding: "5px 11px", border: "1.5px solid var(--border)",
                                                borderRadius: 7, background: "var(--card)", cursor: "pointer",
                                                fontSize: 12, fontWeight: 700, color: "var(--primary)",
                                                fontFamily: "'Nunito', sans-serif",
                                            }}>View</button>
                                        </Link>
                                        <button style={{
                                            padding: "5px 11px", border: "1.5px solid var(--danger-light)",
                                            borderRadius: 7, background: "var(--danger-light)", cursor: "pointer",
                                            fontSize: 12, fontWeight: 700, color: "var(--danger)",
                                            fontFamily: "'Nunito', sans-serif",
                                        }}>Unassign</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Tab: Queries ── */}
            {activeTab === "Queries" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                        <button style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
                            background: "var(--warning)", border: "none", borderRadius: 10,
                            color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                            fontFamily: "'Nunito', sans-serif",
                        }}>📝 Issue New Query</button>
                    </div>

                    {queries.length === 0 ? (
                        <div className="card" style={{ padding: 40, textAlign: "center" as const }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>
                                No queries issued
                            </div>
                            <div style={{ fontSize: 13, color: "var(--muted)" }}>This staff member has no outstanding queries.</div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {queries.map(q => (
                                <div key={q.id} style={{
                                    background: "var(--card)", border: "1px solid var(--border)",
                                    borderRadius: 14, overflow: "hidden",
                                }}>
                                    <div style={{
                                        padding: "14px 20px",
                                        borderLeft: `4px solid ${q.severity === "high" ? "var(--danger)" : q.severity === "medium" ? "var(--warning)" : "var(--primary)"}`,
                                    }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{
                              fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700,
                              color: "var(--muted)",
                          }}>{q.id}</span>
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 700, padding: "2px 8px",
                                                        borderRadius: 20, ...severityStyle(q.severity),
                                                        fontFamily: "'Space Mono', monospace", textTransform: "uppercase" as const,
                                                    }}>{q.severity}</span>
                                                    <span className={`chip ${q.status === "resolved" ? "chip-active" : "chip-pending"}`}>
                            {q.status}
                          </span>
                                                </div>
                                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
                                                    {q.subject}
                                                </div>
                                                <div style={{ fontSize: 13, color: "var(--fg-mid)", lineHeight: 1.6 }}>{q.message}</div>
                                            </div>
                                            <div style={{
                                                fontFamily: "'Space Mono', monospace", fontSize: 10,
                                                color: "var(--muted)", flexShrink: 0, marginTop: 2,
                                            }}>{q.date}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Tab: Attendance ── */}
            {activeTab === "Attendance" && (
                <div>
                    {/* Attendance summary */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
                        {[
                            { label: "Present Days", value: "18", color: "var(--success)", icon: "✅" },
                            { label: "Late Arrivals", value: "3", color: "var(--warning)", icon: "⏰" },
                            { label: "Absent Days", value: "2", color: "var(--danger)", icon: "❌" },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: "var(--card)", border: "1px solid var(--border)",
                                borderRadius: 12, padding: "16px 18px", display: "flex", gap: 14, alignItems: "center",
                            }}>
                                <span style={{ fontSize: 22 }}>{s.icon}</span>
                                <div>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Attendance log */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Attendance Log</div>
                            <div className="card-meta">LAST 7 DAYS</div>
                        </div>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Sessions</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {attendance.map((a, i) => (
                                <tr key={i}>
                                    <td><span className="td-mono">{a.date}</span></td>
                                    <td><span className="td-mono">{a.checkIn}</span></td>
                                    <td><span className="td-mono">{a.checkOut}</span></td>
                                    <td><span className="td-mono">{a.sessions}</span></td>
                                    <td>
                      <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          fontSize: 12, fontWeight: 700,
                          color: statusColors[a.status],
                          textTransform: "capitalize" as const,
                      }}>
                        <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: statusColors[a.status], display: "inline-block",
                        }} />
                          {a.status}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button className="page-btn disabled">« Prev</button>
                            <button className="page-btn active">1</button>
                            <button className="page-btn">2</button>
                            <button className="page-btn">Next »</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tab: Status History ── */}
            {activeTab === "Status History" && (
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Status & Activity History</div>
                        <div className="card-meta">ALL TIME</div>
                    </div>
                    <div style={{ padding: "8px 20px" }}>
                        {statusHistory.map((h, i) => (
                            <div key={i} style={{
                                display: "flex", gap: 16, padding: "16px 0",
                                borderBottom: i < statusHistory.length - 1 ? "1px solid var(--border)" : "none",
                                position: "relative",
                            }}>
                                {/* Timeline dot */}
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                                    background: i === 0 ? "var(--primary)" : "var(--primary-light)",
                                    border: `2px solid ${i === 0 ? "var(--primary)" : "var(--border)"}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 14,
                                }}>
                                    {h.action === "Onboarded" ? "👤" : h.action === "Roles Assigned" ? "🔑" : h.action === "Query Issued" ? "📝" : "📋"}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: "var(--fg)", marginBottom: 4 }}>
                                            {h.action}
                                        </div>
                                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>
                      {h.date}
                    </span>
                                    </div>
                                    <div style={{ fontSize: 13, color: "var(--fg-mid)", marginBottom: 4 }}>{h.note}</div>
                                    <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>
                                        By: <span style={{ color: "var(--primary)" }}>{h.actor}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}