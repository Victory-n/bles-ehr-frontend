"use client";

import Link from "next/link";

/* ── helpers ── */
const Sparkline = ({
                       points,
                       color,
                       id,
                   }: {
    points: string;
    color: string;
    id: string;
}) => (
    <svg
        className="kpi-sparkline"
        width="100"
        height="44"
        viewBox="0 0 100 44"
        style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.45 }}
    >
        <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
        <polygon
            points={`${points} 100,44 0,44`}
            fill={`url(#${id})`}
        />
    </svg>
);

const kpis = [
    {
        label: "Total Active Patients",
        value: "142",
        trend: "up",
        trendLabel: "↑ 12%",
        trendSub: "than last month",
        color: "#2C7A6E",
        sparkId: "g1",
        points: "0,32 16,28 32,20 48,24 64,14 80,18 100,8",
    },
    {
        label: "Sessions Today",
        value: "18",
        trend: "up",
        trendLabel: "↑ 5",
        trendSub: "vs yesterday",
        color: "#27A76A",
        sparkId: "g2",
        points: "0,36 16,30 32,34 48,20 64,26 80,16 100,10",
    },
    {
        label: "Active Staff",
        value: "24",
        trend: "dn",
        trendLabel: "↓ 2",
        trendSub: "on leave",
        color: "#6B5ED4",
        sparkId: "g3",
        points: "0,20 16,22 32,18 48,22 64,16 80,20 100,14",
    },
    {
        label: "Pending Assessments",
        value: "11",
        trend: "dn",
        trendLabel: "↑ 3",
        trendSub: "need urgent review",
        color: "#D98326",
        sparkId: "g4",
        points: "0,30 16,28 32,32 48,24 64,28 80,20 100,14",
    },
];

const sessions = [
    {
        time: "09:00",
        ampm: "AM",
        patient: "Amara Okafor",
        type: "Cognitive Behavioural Therapy · 60 min",
        therapist: "Dr. B. Adeyemi",
        status: "chip-active",
        statusLabel: "Active",
    },
    {
        time: "10:30",
        ampm: "AM",
        patient: "Chidi Nwosu",
        type: "Psychiatric Evaluation · Initial",
        therapist: "Dr. A. Kolade",
        status: "chip-pending",
        statusLabel: "Pending",
    },
    {
        time: "01:00",
        ampm: "PM",
        patient: "Ngozi Eze",
        type: "Group Therapy Session · Anxiety",
        therapist: "Dr. C. Obi",
        status: "chip-active",
        statusLabel: "Active",
    },
    {
        time: "03:15",
        ampm: "PM",
        patient: "Emeka Afolabi",
        type: "Medication Review · Lithium 900mg",
        therapist: "Dr. A. Kolade",
        status: "chip-progress",
        statusLabel: "In Progress",
    },
    {
        time: "04:45",
        ampm: "PM",
        patient: "Fatima Hassan",
        type: "Family Therapy · Session 4",
        therapist: "Dr. B. Adeyemi",
        status: "chip-inactive",
        statusLabel: "Scheduled",
    },
];

const activity = [
    {
        ico: "🧑‍⚕️",
        icoColor: "green",
        title: "New patient admitted",
        desc: "Chidi Nwosu — Depressive Disorder, referred by GP",
        time: "2h ago",
    },
    {
        ico: "📋",
        icoColor: "amber",
        title: "Assessment flagged",
        desc: "PHQ-9 score 22 — Amara Okafor needs urgent review",
        time: "3h ago",
    },
    {
        ico: "💊",
        icoColor: "teal",
        title: "Prescription updated",
        desc: "Emeka Afolabi — Lithium titrated to 1200mg daily",
        time: "5h ago",
    },
    {
        ico: "⚠️",
        icoColor: "red",
        title: "Missed session alert",
        desc: "Kunle Balogun — 2nd consecutive missed appointment",
        time: "7h ago",
    },
    {
        ico: "📝",
        icoColor: "purple",
        title: "Session notes submitted",
        desc: "Dr. C. Obi completed notes for 3 sessions",
        time: "9h ago",
    },
];

const moodData = [
    { label: "Stable", count: 38, pct: 62, color: "#27A76A" },
    { label: "Improving", count: 29, pct: 45, color: "#4A9E91" },
    { label: "Moderate", count: 41, pct: 78, color: "#D98326" },
    { label: "Distressed", count: 22, pct: 34, color: "#C94040" },
    { label: "Critical", count: 12, pct: 18, color: "#6B5ED4" },
];

const therapists = [
    { rank: 1, name: "Dr. C. Obi", sessions: 48, rating: "4.9" },
    { rank: 2, name: "Dr. B. Adeyemi", sessions: 44, rating: "4.8" },
    { rank: 3, name: "Dr. A. Kolade", sessions: 39, rating: "4.7" },
    { rank: 4, name: "Dr. F. Eze", sessions: 35, rating: "4.6" },
    { rank: 5, name: "Nurse R. Bello", sessions: 30, rating: "4.5" },
];

export default function Dashboard() {
    const today = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <>
            {/* Page header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Good morning, Dr. Ndukwe Victory 👋</div>
                    <div className="page-subtitle">{today} · BrightLife EHR</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            border: "1.5px solid var(--border)",
                            background: "var(--card)",
                            borderRadius: 8,
                            padding: "8px 14px",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--fg-mid)",
                            cursor: "pointer",
                        }}
                    >
                        This Month &nbsp; ›
                    </div>
                    <button
                        style={{
                            width: 36,
                            height: 36,
                            background: "var(--primary)",
                            border: "none",
                            borderRadius: 10,
                            color: "#fff",
                            fontSize: 20,
                            fontWeight: 300,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 3px 10px rgba(44,122,110,0.28)",
                        }}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* KPI row */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                {kpis.map((k) => (
                    <div
                        key={k.label}
                        style={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: 14,
                            padding: "20px 20px 16px",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                marginBottom: 10,
                            }}
                        >
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)" }}>
                                {k.label}
                            </div>
                            <div style={{ display: "flex", gap: 3, cursor: "pointer", padding: 2 }}>
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        style={{
                                            width: 4,
                                            height: 4,
                                            borderRadius: "50%",
                                            background: "var(--muted)",
                                            display: "inline-block",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div
                            style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: 36,
                                fontWeight: 700,
                                color: "var(--fg)",
                                letterSpacing: "-0.03em",
                                lineHeight: 1,
                                marginBottom: 8,
                            }}
                        >
                            {k.value}
                        </div>
                        <div>
              <span
                  style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: k.trend === "up" ? "var(--success)" : "var(--danger)",
                  }}
              >
                {k.trendLabel}{" "}
                  <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 11.5 }}>
                  {k.trendSub}
                </span>
              </span>
                        </div>
                        <Sparkline points={k.points} color={k.color} id={k.sparkId} />
                    </div>
                ))}
            </div>

            {/* Two-col: Sessions + Activity */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                    marginBottom: 20,
                }}
            >
                {/* Today's Sessions */}
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Today's Sessions</div>
                        <Link
                            href="/appointments"
                            style={{
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: "var(--primary)",
                                textDecoration: "none",
                            }}
                        >
                            View all →
                        </Link>
                    </div>
                    {sessions.map((s, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                padding: "13px 20px",
                                borderBottom: i < sessions.length - 1 ? "1px solid var(--border)" : "none",
                                transition: "background 0.12s",
                            }}
                        >
                            <div style={{ minWidth: 56, textAlign: "center" }}>
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: "var(--fg)",
                                    }}
                                >
                                    {s.time}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: 9,
                                        color: "var(--muted)",
                                    }}
                                >
                                    {s.ampm}
                                </div>
                            </div>
                            <div style={{ width: 1, height: 34, background: "var(--border)" }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>
                                    {s.patient}
                                </div>
                                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 1, fontWeight: 500 }}>
                                    {s.type}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: 9.5,
                                        color: "var(--primary)",
                                        marginTop: 2,
                                    }}
                                >
                                    {s.therapist}
                                </div>
                            </div>
                            <span className={`chip ${s.status}`}>{s.statusLabel}</span>
                            <button
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    border: "1.5px solid var(--border)",
                                    background: "var(--card)",
                                    color: "var(--muted)",
                                    padding: "5px 11px",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    transition: "all 0.13s",
                                }}
                            >
                                Chart
                            </button>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Recent Activity</div>
                        <div
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: 9.5,
                                color: "var(--muted)",
                                letterSpacing: "0.06em",
                            }}
                        >
                            LAST 24 HRS
                        </div>
                    </div>
                    {activity.map((a, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                                padding: "12px 20px",
                                borderBottom: i < activity.length - 1 ? "1px solid var(--border)" : "none",
                            }}
                        >
                            <div
                                className={`activity-ico ${a.icoColor}`}
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 15,
                                    flexShrink: 0,
                                }}
                            >
                                {a.ico}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)" }}>
                                    {a.title}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                                    {a.desc}
                                </div>
                            </div>
                            <div
                                style={{
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: 9.5,
                                    color: "var(--muted)",
                                    whiteSpace: "nowrap",
                                    marginTop: 2,
                                }}
                            >
                                {a.time}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two-col: Mood + Therapists */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Mood Distribution */}
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Patient Mood Distribution</div>
                        <div
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: 9.5,
                                color: "var(--muted)",
                                letterSpacing: "0.06em",
                            }}
                        >
                            THIS WEEK · 142 PATIENTS
                        </div>
                    </div>
                    <div style={{ padding: 20 }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5,1fr)",
                                gap: 10,
                            }}
                        >
                            {moodData.map((m) => (
                                <div
                                    key={m.label}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 5,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "'Fraunces', serif",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "var(--fg)",
                                        }}
                                    >
                                        {m.count}
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            height: 80,
                                            borderRadius: 20,
                                            background: "var(--border)",
                                            overflow: "hidden",
                                            display: "flex",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                height: `${m.pct}%`,
                                                borderRadius: 20,
                                                background: m.color,
                                                transition: "height 0.6s ease",
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "'Space Mono', monospace",
                                            fontSize: 8,
                                            color: "var(--muted)",
                                            textAlign: "center",
                                            letterSpacing: "0.04em",
                                        }}
                                    >
                                        {m.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Therapists */}
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Top Therapists</div>
                        <Link
                            href="/staff"
                            style={{
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: "var(--primary)",
                                textDecoration: "none",
                            }}
                        >
                            View all →
                        </Link>
                    </div>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                        }}
                    >
                        <thead>
                        <tr>
                            {["#", "Therapist", "Sessions", "Rating"].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: 9,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        color: "var(--muted)",
                                        fontWeight: 400,
                                        padding: "8px 12px",
                                        textAlign: "left",
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {therapists.map((t, i) => (
                            <tr
                                key={t.rank}
                                style={{
                                    background: i === 0 ? "var(--primary-xlight)" : "transparent",
                                }}
                            >
                                <td
                                    style={{
                                        padding: "10px 12px",
                                        borderBottom: i < therapists.length - 1 ? "1px solid var(--border)" : "none",
                                    }}
                                >
                    <span
                        style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 14,
                            fontWeight: 700,
                            color: i === 0 ? "var(--primary)" : "var(--muted)",
                        }}
                    >
                      {t.rank}
                    </span>
                                </td>
                                <td
                                    style={{
                                        padding: "10px 12px",
                                        borderBottom: i < therapists.length - 1 ? "1px solid var(--border)" : "none",
                                        fontSize: 13,
                                        color: "var(--fg-mid)",
                                        fontWeight: i === 0 ? 600 : 400,
                                    }}
                                >
                                    {t.name}
                                </td>
                                <td
                                    style={{
                                        padding: "10px 12px",
                                        borderBottom: i < therapists.length - 1 ? "1px solid var(--border)" : "none",
                                    }}
                                >
                    <span
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: 11,
                            color: "var(--fg-mid)",
                        }}
                    >
                      {t.sessions}
                    </span>
                                </td>
                                <td
                                    style={{
                                        padding: "10px 12px",
                                        borderBottom: i < therapists.length - 1 ? "1px solid var(--border)" : "none",
                                        fontSize: 13,
                                        color: "var(--fg-mid)",
                                    }}
                                >
                                    ⭐ {t.rating}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}