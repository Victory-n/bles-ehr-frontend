"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Mock patient detail data ─── */
const patientData = {
    id: "PAT-0142",
    name: "Amara Okafor",
    initials: "AO",
    color: "#2C7A6E",
    gender: "Female",
    dob: "14 March 1990",
    age: 35,
    phone: "0803 111 2233",
    email: "amara.okafor@gmail.com",
    address: "14 Aba Road, Wuse 2, Abuja",
    diagnosis: "Major Depressive Disorder",
    assignedStaff: "Dr. B. Adeyemi",
    admittedOn: "12 Feb 2025",
    sessions: 14,
    status: "active",
    bloodGroup: "O+",
    allergies: "Penicillin",
    notes:
        "Patient shows consistent engagement. PHQ-9 score improving. Monitor for medication compliance.",
};

const emergencyContacts = [
    {
        name: "Chukwuemeka Okafor",
        relationship: "Spouse",
        phone: "0803 999 1122",
    },
    {
        name: "Ngozi Okafor",
        relationship: "Sister",
        phone: "0803 888 4455",
    },
];

const enrollments = [
    {
        id: "ENR-001",
        program: "Cognitive Behavioural Therapy (CBT)",
        startDate: "15 Feb 2025",
        endDate: "15 Aug 2025",
        sessions: "14 / 24",
        therapist: "Dr. B. Adeyemi",
        status: "active",
        progress: 58,
    },
    {
        id: "ENR-002",
        program: "Group Anxiety Support",
        startDate: "01 Mar 2025",
        endDate: "30 Jun 2025",
        sessions: "6 / 12",
        therapist: "Dr. C. Obi",
        status: "active",
        progress: 50,
    },
    {
        id: "ENR-003",
        program: "Mindfulness & Stress Management",
        startDate: "10 Jan 2025",
        endDate: "10 Apr 2025",
        sessions: "12 / 12",
        therapist: "Nurse R. Bello",
        status: "completed",
        progress: 100,
    },
];

const recentSessions = [
    {
        date: "10 Apr 2026",
        type: "CBT Session",
        therapist: "Dr. B. Adeyemi",
        duration: "60 min",
        notes: "Discussed cognitive distortions. Homework assigned.",
        mood: "Improving",
    },
    {
        date: "03 Apr 2026",
        type: "Group Session",
        therapist: "Dr. C. Obi",
        duration: "75 min",
        notes: "Participated actively in group discussion.",
        mood: "Stable",
    },
    {
        date: "27 Mar 2026",
        type: "CBT Session",
        therapist: "Dr. B. Adeyemi",
        duration: "60 min",
        notes: "Behavioural activation strategies introduced.",
        mood: "Moderate",
    },
];

const tabs = ["Overview", "Programs", "Sessions", "Documents"];

const moodColorMap: Record<string, string> = {
    Improving: "var(--success)",
    Stable: "var(--primary)",
    Moderate: "var(--warning)",
    Distressed: "var(--danger)",
};

export default function PatientDetailPage({ params }: { params: { patientId: string } }) {
    const [activeTab, setActiveTab] = useState("Overview");

    const progressColor = (pct: number) =>
        pct === 100 ? "var(--success)" : pct >= 60 ? "var(--primary)" : "var(--warning)";

    return (
        <>
            {/* Breadcrumb + Back */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 20,
                    fontSize: 13,
                    color: "var(--muted)",
                }}
            >
                <Link
                    href="/patients"
                    style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                    }}
                >
                    ← Patients
                </Link>
                <span>/</span>
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>{patientData.name}</span>
                <span
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 10,
                        color: "var(--muted)",
                        marginLeft: 4,
                    }}
                >
          {patientData.id}
        </span>
            </div>

            {/* Patient Hero Card */}
            <div
                style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    marginBottom: 20,
                    overflow: "hidden",
                }}
            >
                {/* Top band */}
                <div
                    style={{
                        height: 6,
                        background: `linear-gradient(90deg, ${patientData.color}, var(--primary-mid))`,
                    }}
                />

                <div style={{ padding: "24px 28px", display: "flex", gap: 24, alignItems: "flex-start" }}>
                    {/* Avatar */}
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: 16,
                            background: `linear-gradient(135deg, ${patientData.color} 0%, var(--primary-mid) 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "'Fraunces', serif",
                            fontSize: 26,
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                            boxShadow: `0 8px 24px ${patientData.color}40`,
                        }}
                    >
                        {patientData.initials}
                    </div>

                    {/* Core Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div>
                                <h1
                                    style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: "var(--fg)",
                                        letterSpacing: "-0.02em",
                                        marginBottom: 4,
                                    }}
                                >
                                    {patientData.name}
                                </h1>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span
                      style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 10,
                          color: "var(--primary)",
                          background: "var(--primary-light)",
                          padding: "3px 9px",
                          borderRadius: 5,
                          fontWeight: 700,
                      }}
                  >
                    {patientData.id}
                  </span>
                                    <span className="chip chip-active">{patientData.status}</span>
                                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                    {patientData.gender} · {patientData.age} yrs
                  </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    style={{
                                        padding: "8px 16px",
                                        border: "1.5px solid var(--border)",
                                        borderRadius: 9,
                                        background: "var(--card)",
                                        cursor: "pointer",
                                        fontSize: 12.5,
                                        fontWeight: 700,
                                        color: "var(--fg-mid)",
                                        fontFamily: "'Nunito', sans-serif",
                                        transition: "all 0.13s",
                                    }}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    style={{
                                        padding: "8px 16px",
                                        border: "none",
                                        borderRadius: 9,
                                        background: "var(--primary)",
                                        cursor: "pointer",
                                        fontSize: 12.5,
                                        fontWeight: 700,
                                        color: "#fff",
                                        fontFamily: "'Nunito', sans-serif",
                                        boxShadow: "0 2px 8px rgba(44,122,110,0.25)",
                                        transition: "opacity 0.15s",
                                    }}
                                >
                                    + Enrol in Program
                                </button>
                            </div>
                        </div>

                        {/* Stat row */}
                        <div
                            style={{
                                display: "flex",
                                gap: 24,
                                marginTop: 16,
                                paddingTop: 16,
                                borderTop: "1px solid var(--border)",
                            }}
                        >
                            {[
                                { label: "Diagnosis", value: patientData.diagnosis },
                                { label: "Assigned Staff", value: patientData.assignedStaff },
                                { label: "Admitted", value: patientData.admittedOn },
                                { label: "Sessions", value: `${patientData.sessions} total` },
                                { label: "Blood Group", value: patientData.bloodGroup },
                            ].map((item) => (
                                <div key={item.label} style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontFamily: "'Space Mono', monospace",
                                            fontSize: 9,
                                            color: "var(--muted)",
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            marginBottom: 3,
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "var(--fg)",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div
                style={{
                    display: "flex",
                    gap: 2,
                    marginBottom: 20,
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 11,
                    padding: 4,
                    width: "fit-content",
                }}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: "8px 18px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "'Nunito', sans-serif",
                            background: activeTab === tab ? "var(--primary)" : "transparent",
                            color: activeTab === tab ? "#fff" : "var(--muted)",
                            transition: "all 0.18s",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === "Overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {/* Contact Info */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Contact Information</div>
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                            {[
                                { icon: "📞", label: "Phone", value: patientData.phone },
                                { icon: "📧", label: "Email", value: patientData.email },
                                { icon: "🏠", label: "Address", value: patientData.address },
                                { icon: "🩸", label: "Blood Group", value: patientData.bloodGroup },
                                { icon: "⚠️", label: "Allergies", value: patientData.allergies },
                            ].map((row) => (
                                <div
                                    key={row.label}
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        padding: "10px 0",
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                >
                  <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>
                    {row.icon}
                  </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontFamily: "'Space Mono', monospace",
                                                fontSize: 9,
                                                color: "var(--muted)",
                                                letterSpacing: "0.06em",
                                                textTransform: "uppercase",
                                                marginBottom: 2,
                                            }}
                                        >
                                            {row.label}
                                        </div>
                                        <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>
                                            {row.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Emergency Contacts</div>
                            <button
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    border: "1.5px solid var(--border)",
                                    background: "var(--card)",
                                    color: "var(--primary)",
                                    padding: "5px 11px",
                                    borderRadius: 7,
                                    cursor: "pointer",
                                    fontFamily: "'Nunito', sans-serif",
                                }}
                            >
                                + Add
                            </button>
                        </div>
                        <div>
                            {emergencyContacts.map((ec, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: "14px 20px",
                                        borderBottom:
                                            i < emergencyContacts.length - 1 ? "1px solid var(--border)" : "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            background: "var(--primary-light)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontFamily: "'Fraunces', serif",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "var(--primary)",
                                        }}
                                    >
                                        {ec.name
                                            .split(" ")
                                            .slice(0, 2)
                                            .map((w) => w[0])
                                            .join("")}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>
                                            {ec.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>
                                            {ec.relationship} · {ec.phone}
                                        </div>
                                    </div>
                                    <button
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: 13,
                                            color: "var(--muted)",
                                            padding: 4,
                                        }}
                                    >
                                        ✏️
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Clinical Notes */}
                        <div
                            style={{
                                margin: "0 20px 20px",
                                marginTop: 4,
                                background: "var(--warning-light)",
                                border: "1px solid #f5c58a",
                                borderRadius: 10,
                                padding: "12px 14px",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: 9,
                                    color: "var(--warning)",
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    marginBottom: 6,
                                    fontWeight: 700,
                                }}
                            >
                                Clinical Notes
                            </div>
                            <div style={{ fontSize: 13, color: "var(--fg-mid)", lineHeight: 1.6 }}>
                                {patientData.notes}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Programs (Enrollments) */}
            {activeTab === "Programs" && (
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        <div>
              <span style={{ fontSize: 13.5, color: "var(--fg-mid)", fontWeight: 500 }}>
                {enrollments.length} enrolled programs
              </span>
                        </div>
                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "9px 16px",
                                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                                border: "none",
                                borderRadius: 9,
                                color: "#fff",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "'Nunito', sans-serif",
                                boxShadow: "0 2px 8px rgba(44,122,110,0.25)",
                            }}
                        >
                            <span style={{ fontSize: 16 }}>+</span>
                            Enrol in Program
                        </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {enrollments.map((enr) => (
                            <div
                                key={enr.id}
                                style={{
                                    background: "var(--card)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 14,
                                    padding: "20px 24px",
                                    display: "flex",
                                    gap: 20,
                                    alignItems: "flex-start",
                                }}
                            >
                                {/* Left: icon */}
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 11,
                                        background:
                                            enr.status === "completed"
                                                ? "var(--success-light)"
                                                : "var(--primary-light)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 20,
                                        flexShrink: 0,
                                    }}
                                >
                                    {enr.status === "completed" ? "✅" : "📋"}
                                </div>

                                {/* Center: details */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                                        <div>
                                            <div
                                                style={{
                                                    fontFamily: "'Fraunces', serif",
                                                    fontSize: 16,
                                                    fontWeight: 700,
                                                    color: "var(--fg)",
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {enr.program}
                                            </div>
                                            <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--muted)" }}>
                        <span>
                          <span style={{ fontWeight: 700, color: "var(--fg-mid)" }}>Therapist:</span> {enr.therapist}
                        </span>
                                                <span>
                          <span style={{ fontWeight: 700, color: "var(--fg-mid)" }}>Started:</span> {enr.startDate}
                        </span>
                                                <span>
                          <span style={{ fontWeight: 700, color: "var(--fg-mid)" }}>Ends:</span> {enr.endDate}
                        </span>
                                            </div>
                                        </div>
                                        <span
                                            className={`chip ${
                                                enr.status === "completed" ? "chip-active" : "chip-progress"
                                            }`}
                                        >
                      {enr.status === "completed" ? "Completed" : "In Progress"}
                    </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: 5,
                                            }}
                                        >
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        Sessions: <strong style={{ color: "var(--fg)" }}>{enr.sessions}</strong>
                      </span>
                                            <span
                                                style={{
                                                    fontFamily: "'Space Mono', monospace",
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: progressColor(enr.progress),
                                                }}
                                            >
                        {enr.progress}%
                      </span>
                                        </div>
                                        <div
                                            style={{
                                                height: 6,
                                                background: "var(--border)",
                                                borderRadius: 6,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: "100%",
                                                    width: `${enr.progress}%`,
                                                    background: progressColor(enr.progress),
                                                    borderRadius: 6,
                                                    transition: "width 0.6s ease",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right: action */}
                                {enr.status !== "completed" && (
                                    <div>
                                        <button
                                            style={{
                                                padding: "7px 14px",
                                                border: "1.5px solid var(--danger-light)",
                                                background: "var(--danger-light)",
                                                borderRadius: 8,
                                                color: "var(--danger)",
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: "pointer",
                                                fontFamily: "'Nunito', sans-serif",
                                                whiteSpace: "nowrap",
                                                transition: "all 0.13s",
                                            }}
                                        >
                                            Discharge
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab: Sessions */}
            {activeTab === "Sessions" && (
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Session History</div>
                        <div className="card-meta">LAST 3 SESSIONS</div>
                    </div>
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Session Type</th>
                            <th>Therapist</th>
                            <th>Duration</th>
                            <th>Mood</th>
                            <th>Notes</th>
                        </tr>
                        </thead>
                        <tbody>
                        {recentSessions.map((s, i) => (
                            <tr key={i}>
                                <td><span className="td-mono">{s.date}</span></td>
                                <td><span className="td-text">{s.type}</span></td>
                                <td><span className="td-text">{s.therapist}</span></td>
                                <td><span className="td-mono">{s.duration}</span></td>
                                <td>
                    <span
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: moodColorMap[s.mood] || "var(--muted)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                      <span
                          style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: moodColorMap[s.mood] || "var(--muted)",
                              display: "inline-block",
                          }}
                      />
                        {s.mood}
                    </span>
                                </td>
                                <td>
                    <span style={{ fontSize: 12.5, color: "var(--muted)", maxWidth: 220, display: "block" }}>
                      {s.notes}
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
            )}

            {/* Tab: Documents */}
            {activeTab === "Documents" && (
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Patient Documents</div>
                        <button
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                border: "1.5px solid var(--border)",
                                background: "var(--card)",
                                color: "var(--primary)",
                                padding: "6px 13px",
                                borderRadius: 7,
                                cursor: "pointer",
                                fontFamily: "'Nunito', sans-serif",
                            }}
                        >
                            + Upload Document
                        </button>
                    </div>
                    <div style={{ padding: 40, textAlign: "center" }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>📁</div>
                        <div
                            style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: 17,
                                fontWeight: 600,
                                color: "var(--fg)",
                                marginBottom: 6,
                            }}
                        >
                            No documents yet
                        </div>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
                            Upload consent forms, referral letters, or any patient documents
                        </div>
                        <button
                            style={{
                                padding: "9px 20px",
                                background: "var(--primary-light)",
                                border: "1.5px solid var(--primary)",
                                borderRadius: 9,
                                color: "var(--primary)",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "'Nunito', sans-serif",
                            }}
                        >
                            Create Folder
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}