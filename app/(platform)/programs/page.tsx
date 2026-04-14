"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ─── Mock Data ─── */
const mockPrograms = [
    {
        id: "PRG-001",
        name: "Cognitive Behavioural Therapy (CBT)",
        description: "Structured psychotherapy focusing on identifying and changing negative thought patterns and behaviours.",
        category: "Psychotherapy",
        duration: "24 sessions · 6 months",
        frequency: "Weekly",
        maxEnrollment: 30,
        currentEnrollment: 24,
        groupSessions: 18,
        status: "active",
        lead: "Dr. C. Obi",
        createdDate: "01 Jan 2025",
        color: "#2C7A6E",
        icon: "🧠",
    },
    {
        id: "PRG-002",
        name: "Mindfulness & Stress Management",
        description: "Evidence-based mindfulness practices to reduce stress, anxiety, and improve emotional regulation.",
        category: "Wellness",
        duration: "12 sessions · 3 months",
        frequency: "Bi-weekly",
        maxEnrollment: 20,
        currentEnrollment: 17,
        groupSessions: 8,
        status: "active",
        lead: "Nurse R. Bello",
        createdDate: "15 Feb 2025",
        color: "#27A76A",
        icon: "🌿",
    },
    {
        id: "PRG-003",
        name: "Substance Use Disorder Recovery",
        description: "Comprehensive 12-step and evidence-based program for individuals recovering from substance dependence.",
        category: "Addiction",
        duration: "36 sessions · 9 months",
        frequency: "Weekly",
        maxEnrollment: 15,
        currentEnrollment: 11,
        groupSessions: 22,
        status: "active",
        lead: "Dr. F. Eze",
        createdDate: "10 Mar 2025",
        color: "#D98326",
        icon: "♻️",
    },
    {
        id: "PRG-004",
        name: "Trauma Recovery & EMDR",
        description: "Eye Movement Desensitisation and Reprocessing (EMDR) therapy for trauma and PTSD patients.",
        category: "Psychotherapy",
        duration: "20 sessions · 5 months",
        frequency: "Weekly",
        maxEnrollment: 10,
        currentEnrollment: 9,
        groupSessions: 10,
        status: "active",
        lead: "Dr. C. Obi",
        createdDate: "22 Mar 2025",
        color: "#6B5ED4",
        icon: "💜",
    },
    {
        id: "PRG-005",
        name: "Group Anxiety Support Circle",
        description: "Peer-supported group therapy for individuals managing generalised anxiety and panic disorders.",
        category: "Group Therapy",
        duration: "12 sessions · 3 months",
        frequency: "Weekly",
        maxEnrollment: 12,
        currentEnrollment: 12,
        groupSessions: 12,
        status: "active",
        lead: "Dr. B. Adeyemi",
        createdDate: "05 Apr 2025",
        color: "#C94040",
        icon: "🫂",
    },
    {
        id: "PRG-006",
        name: "Bipolar Disorder Management",
        description: "Structured psychoeducation and mood-monitoring programme for patients with bipolar spectrum disorders.",
        category: "Psychoeducation",
        duration: "16 sessions · 4 months",
        frequency: "Bi-weekly",
        maxEnrollment: 10,
        currentEnrollment: 6,
        groupSessions: 6,
        status: "inactive",
        lead: "Dr. A. Kolade",
        createdDate: "18 Jan 2025",
        color: "#4A9E91",
        icon: "📊",
    },
    {
        id: "PRG-007",
        name: "Family Systems Therapy",
        description: "Family-centred therapy sessions aimed at improving communication, conflict resolution, and systemic healing.",
        category: "Family Therapy",
        duration: "10 sessions · 3 months",
        frequency: "Bi-weekly",
        maxEnrollment: 8,
        currentEnrollment: 0,
        groupSessions: 0,
        status: "inactive",
        lead: "Dr. B. Adeyemi",
        createdDate: "30 Apr 2025",
        color: "#7A9490",
        icon: "👨‍👩‍👧",
    },
];

const categoryColors: Record<string, { bg: string; color: string }> = {
    Psychotherapy: { bg: "var(--primary-light)", color: "var(--primary)" },
    Wellness: { bg: "var(--success-light)", color: "var(--success)" },
    Addiction: { bg: "var(--warning-light)", color: "var(--warning)" },
    "Group Therapy": { bg: "var(--danger-light)", color: "var(--danger)" },
    Psychoeducation: { bg: "var(--purple-light)", color: "var(--purple)" },
    "Family Therapy": { bg: "#F0F0F0", color: "#666" },
};

const tabs = [
    { label: "All Programs", count: 7 },
    { label: "Active", count: 5 },
    { label: "Inactive", count: 2 },
];

/* ─── Add Program Modal ─── */
function AddProgramModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        totalSessions: "",
        durationMonths: "",
        frequency: "",
        maxEnrollment: "",
        lead: "",
        notes: "",
    });

    const categories = ["Psychotherapy", "Wellness", "Addiction", "Group Therapy", "Psychoeducation", "Family Therapy", "Other"];
    const frequencies = ["Daily", "Twice Weekly", "Weekly", "Bi-weekly", "Monthly"];
    const staffList = [
        "Dr. C. Obi — Psychologist",
        "Dr. B. Adeyemi — Psychiatrist",
        "Dr. A. Kolade — Psychiatrist",
        "Dr. F. Eze — Counsellor",
        "Nurse R. Bello — Psychiatric Nurse",
    ];

    const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div
            style={{
                position: "fixed", inset: 0,
                background: "rgba(25,40,37,0.58)",
                backdropFilter: "blur(4px)",
                zIndex: 1000,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
            }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 18, width: "100%", maxWidth: 600,
                boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden",
            }}>
                {/* Header */}
                <div style={{
                    padding: "22px 28px", borderBottom: "1px solid var(--border)",
                    background: "var(--primary-xlight)",
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>
                            Create New Program
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                            Step {step} of 2 — {step === 1 ? "Program Details" : "Schedule & Assignment"}
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8,
                        background: "var(--card)", cursor: "pointer", fontSize: 16, color: "var(--muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                </div>

                {/* Step indicator */}
                <div style={{ padding: "14px 28px 0", display: "flex", gap: 8 }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{
                            flex: 1, height: 4, borderRadius: 4,
                            background: s <= step ? "var(--primary)" : "var(--border)",
                            transition: "background 0.3s",
                        }} />
                    ))}
                </div>

                {/* Body */}
                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {step === 1 ? (
                        <>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Program Name</label>
                                <input className="form-input" type="text" placeholder="e.g. Cognitive Behavioural Therapy"
                                       value={form.name} onChange={e => update("name", e.target.value)} />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Description</label>
                                <textarea className="form-input" rows={3}
                                          placeholder="Brief description of the program's goals and approach…"
                                          value={form.description} onChange={e => update("description", e.target.value)}
                                          style={{ resize: "vertical", minHeight: 80 }} />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Category</label>
                                <select className="form-input" value={form.category}
                                        onChange={e => update("category", e.target.value)} style={{ cursor: "pointer" }}>
                                    <option value="">Select a category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Total Sessions</label>
                                    <input className="form-input" type="number" placeholder="e.g. 24"
                                           value={form.totalSessions} onChange={e => update("totalSessions", e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Duration (Months)</label>
                                    <input className="form-input" type="number" placeholder="e.g. 6"
                                           value={form.durationMonths} onChange={e => update("durationMonths", e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Max Enrollment</label>
                                    <input className="form-input" type="number" placeholder="e.g. 30"
                                           value={form.maxEnrollment} onChange={e => update("maxEnrollment", e.target.value)} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Session Frequency</label>
                                <select className="form-input" value={form.frequency}
                                        onChange={e => update("frequency", e.target.value)} style={{ cursor: "pointer" }}>
                                    <option value="">Select frequency</option>
                                    {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Program Lead / Primary Therapist</label>
                                <select className="form-input" value={form.lead}
                                        onChange={e => update("lead", e.target.value)} style={{ cursor: "pointer" }}>
                                    <option value="">Select a staff member</option>
                                    {staffList.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Additional Notes <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
                                <textarea className="form-input" rows={2}
                                          placeholder="Any additional information…"
                                          value={form.notes} onChange={e => update("notes", e.target.value)}
                                          style={{ resize: "none" }} />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: "16px 28px", borderTop: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <button onClick={step === 1 ? onClose : () => setStep(1)} style={{
                        padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9,
                        background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700,
                        color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif",
                    }}>{step === 1 ? "Cancel" : "← Back"}</button>

                    <button onClick={() => step === 1 ? setStep(2) : onClose()} style={{
                        padding: "10px 24px", border: "none", borderRadius: 9,
                        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                        cursor: "pointer", fontSize: 13.5, fontWeight: 700,
                        color: "#fff", fontFamily: "'Nunito', sans-serif",
                        boxShadow: "0 3px 12px rgba(44,122,110,0.28)",
                    }}>{step === 1 ? "Continue →" : "Create Program"}</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Program Card ─── */
function ProgramCard({ program }: { program: typeof mockPrograms[0] }) {
    const enrollPct = Math.round((program.currentEnrollment / program.maxEnrollment) * 100);
    const isFull = program.currentEnrollment >= program.maxEnrollment;
    const catStyle = categoryColors[program.category] || { bg: "#F0F0F0", color: "#666" };

    return (
        <Link href={`/programs/${program.id}`} style={{ textDecoration: "none" }}>
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 14, overflow: "hidden", transition: "box-shadow 0.2s, transform 0.2s",
                cursor: "pointer", height: "100%", display: "flex", flexDirection: "column",
            }}
                 onMouseEnter={e => {
                     (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(44,122,110,0.14)";
                     (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                 }}
                 onMouseLeave={e => {
                     (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                     (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                 }}
            >
                {/* Top accent bar */}
                <div style={{
                    height: 4,
                    background: program.status === "active"
                        ? `linear-gradient(90deg, ${program.color}, ${program.color}88)`
                        : "var(--border)",
                }} />

                <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: program.status === "active" ? `${program.color}18` : "var(--surface)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20, flexShrink: 0,
                            border: `1px solid ${program.status === "active" ? `${program.color}30` : "var(--border)"}`,
                        }}>
                            {program.icon}
                        </div>
                        <span className={`chip ${program.status === "active" ? "chip-active" : "chip-inactive"}`}>
                            {program.status === "active" ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* Name & category */}
                    <div style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 15, fontWeight: 700,
                        color: program.status === "inactive" ? "var(--muted)" : "var(--fg)",
                        marginBottom: 5, lineHeight: 1.35,
                    }}>
                        {program.name}
                    </div>

                    <span style={{
                        display: "inline-block", marginBottom: 10,
                        fontSize: 10.5, fontWeight: 700, padding: "2px 9px",
                        borderRadius: 20, ...catStyle,
                        fontFamily: "'Space Mono', monospace",
                    }}>
                        {program.category}
                    </span>

                    <div style={{
                        fontSize: 12.5, color: "var(--muted)",
                        lineHeight: 1.55, marginBottom: 16,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}>
                        {program.description}
                    </div>

                    {/* Stats row */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 8, marginBottom: 14,
                        paddingTop: 12, borderTop: "1px solid var(--border)",
                    }}>
                        {[
                            { label: "Sessions", value: program.duration.split("·")[0].trim() },
                            { label: "Frequency", value: program.frequency },
                            { label: "Group Sessions", value: String(program.groupSessions) },
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8.5, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>
                                    {s.label}
                                </div>
                                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)" }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Enrollment progress */}
                    <div style={{ marginTop: "auto" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                                Enrollment: <strong style={{ color: isFull ? "var(--danger)" : "var(--fg)" }}>
                                    {program.currentEnrollment}/{program.maxEnrollment}
                                </strong>
                            </span>
                            <span style={{
                                fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700,
                                color: isFull ? "var(--danger)" : enrollPct >= 80 ? "var(--warning)" : "var(--success)",
                            }}>
                                {isFull ? "FULL" : `${enrollPct}%`}
                            </span>
                        </div>
                        <div style={{ height: 5, background: "var(--border)", borderRadius: 5, overflow: "hidden" }}>
                            <div style={{
                                height: "100%",
                                width: `${Math.min(enrollPct, 100)}%`,
                                background: isFull ? "var(--danger)" : enrollPct >= 80 ? "var(--warning)" : program.color,
                                borderRadius: 5, transition: "width 0.6s ease",
                            }} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: "10px 20px",
                    borderTop: "1px solid var(--border)",
                    background: "var(--surface)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{
                            width: 22, height: 22, borderRadius: 6,
                            background: "var(--primary-light)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'Fraunces', serif", fontSize: 9, fontWeight: 700, color: "var(--primary)",
                        }}>
                            {program.lead.split(" ").slice(-2).map(w => w[0]).join("")}
                        </div>
                        <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{program.lead}</span>
                    </div>
                    <span style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 9,
                        color: "var(--muted)", letterSpacing: "0.04em",
                    }}>{program.id}</span>
                </div>
            </div>
        </Link>
    );
}

/* ─── Main Page ─── */
export default function ProgramsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [view, setView] = useState<"grid" | "list">("grid");

    const filtered = mockPrograms.filter(p => {
        if (activeTab === 1) return p.status === "active";
        if (activeTab === 2) return p.status === "inactive";
        return true;
    });

    const kpis = [
        {
            label: "Total Programs",
            value: "7",
            trend: "↑ 2",
            trendSub: "this quarter",
            color: "#2C7A6E",
            sparkId: "sp1",
            points: "0,28 16,24 32,20 48,22 64,14 80,16 100,10",
        },
        {
            label: "Active Programs",
            value: "5",
            trend: "↑ 1",
            trendSub: "than last month",
            color: "#27A76A",
            sparkId: "sp2",
            points: "0,30 16,26 32,28 48,20 64,22 80,14 100,10",
        },
        {
            label: "Total Enrolled",
            value: "79",
            trend: "↑ 12%",
            trendSub: "than last month",
            color: "#6B5ED4",
            sparkId: "sp3",
            points: "0,32 16,28 32,22 48,24 64,16 80,18 100,8",
        },
        {
            label: "Group Sessions Run",
            value: "76",
            trend: "↑ 8",
            trendSub: "this month",
            color: "#D98326",
            sparkId: "sp4",
            points: "0,30 16,26 32,30 48,22 64,26 80,18 100,12",
        },
    ];

    return (
        <>
            {showModal && <AddProgramModal onClose={() => setShowModal(false)} />}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Programs</div>
                    <div className="page-subtitle">
                        Manage clinical programs, enrollments & group sessions
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => setShowModal(true)} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 18px",
                        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                        border: "none", borderRadius: 10, color: "#fff",
                        fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                        fontFamily: "'Nunito', sans-serif",
                        boxShadow: "0 3px 12px rgba(44,122,110,0.28)",
                        transition: "opacity 0.15s",
                    }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                        New Program
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(4,1fr)",
                gap: 16, marginBottom: 24,
            }}>
                {kpis.map(k => (
                    <div key={k.label} style={{
                        background: "var(--card)", border: "1px solid var(--border)",
                        borderRadius: 14, padding: "20px 20px 16px",
                        display: "flex", flexDirection: "column",
                        position: "relative", overflow: "hidden",
                    }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)" }}>{k.label}</div>
                            <div style={{ display: "flex", gap: 3 }}>
                                {[0, 1, 2].map(i => (
                                    <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--muted)", display: "inline-block" }} />
                                ))}
                            </div>
                        </div>
                        <div style={{
                            fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 700,
                            color: "var(--fg)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8,
                        }}>{k.value}</div>
                        <div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--success)" }}>
                                {k.trend}{" "}
                                <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 11.5 }}>{k.trendSub}</span>
                            </span>
                        </div>
                        <svg style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.4 }}
                             width="100" height="44" viewBox="0 0 100 44">
                            <defs>
                                <linearGradient id={k.sparkId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={k.color} stopOpacity="0.3" />
                                    <stop offset="100%" stopColor={k.color} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <polyline points={k.points} fill="none" stroke={k.color} strokeWidth="2" />
                            <polygon points={`${k.points} 100,44 0,44`} fill={`url(#${k.sparkId})`} />
                        </svg>
                    </div>
                ))}
            </div>

            {/* Tabs + View Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                {tabs.map((tab, i) => (
                    <button key={tab.label}
                            className={`filter-tab${activeTab === i ? " active" : ""}`}
                            onClick={() => setActiveTab(i)}
                    >
                        {tab.label}
                        <span style={{ marginLeft: 6, fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: 0.75 }}>
                            ({tab.count})
                        </span>
                    </button>
                ))}

                {/* View toggle */}
                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                    {(["grid", "list"] as const).map(v => (
                        <button key={v} onClick={() => setView(v)} style={{
                            width: 34, height: 34,
                            border: `1.5px solid ${view === v ? "var(--primary)" : "var(--border)"}`,
                            borderRadius: 8,
                            background: view === v ? "var(--primary-light)" : "var(--card)",
                            cursor: "pointer", fontSize: 14,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.13s",
                        }}>
                            {v === "grid" ? "⊞" : "☰"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Programs Grid */}
            {view === "grid" ? (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 16,
                }}>
                    {filtered.map(p => (
                        <ProgramCard key={p.id} program={p} />
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="card">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Program</th>
                            <th>Category</th>
                            <th>Lead</th>
                            <th>Enrollment</th>
                            <th>Group Sessions</th>
                            <th>Frequency</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" as const }}>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map(p => {
                            const enrollPct = Math.round((p.currentEnrollment / p.maxEnrollment) * 100);
                            const catStyle = categoryColors[p.category] || { bg: "#F0F0F0", color: "#666" };
                            return (
                                <tr key={p.id}>
                                    <td>
                                        <Link href={`/programs/${p.id}`} style={{ textDecoration: "none" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                                    background: `${p.color}18`,
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 16,
                                                }}>{p.icon}</div>
                                                <div>
                                                    <div className="patient-name">{p.name}</div>
                                                    <div className="patient-id">{p.id}</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td>
                                            <span style={{
                                                fontSize: 11, fontWeight: 700, padding: "3px 9px",
                                                borderRadius: 20, ...catStyle,
                                                fontFamily: "'Space Mono', monospace",
                                            }}>{p.category}</span>
                                    </td>
                                    <td><span className="td-text">{p.lead}</span></td>
                                    <td>
                                        <div style={{ minWidth: 100 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)", marginBottom: 3 }}>
                                                {p.currentEnrollment}/{p.maxEnrollment}
                                                <span style={{ fontWeight: 400, color: "var(--muted)", marginLeft: 4, fontSize: 11 }}>({enrollPct}%)</span>
                                            </div>
                                            <div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                                                <div style={{
                                                    height: "100%", width: `${Math.min(enrollPct, 100)}%`,
                                                    background: enrollPct >= 100 ? "var(--danger)" : enrollPct >= 80 ? "var(--warning)" : p.color,
                                                    borderRadius: 4,
                                                }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="td-mono">{p.groupSessions}</span></td>
                                    <td><span className="td-text">{p.frequency}</span></td>
                                    <td>
                                            <span className={`chip ${p.status === "active" ? "chip-active" : "chip-inactive"}`}>
                                                {p.status === "active" ? "Active" : "Inactive"}
                                            </span>
                                    </td>
                                    <td style={{ textAlign: "right" as const }}>
                                        <Link href={`/programs/${p.id}`}>
                                            <button style={{
                                                padding: "6px 14px", border: "1.5px solid var(--border)",
                                                borderRadius: 8, background: "var(--card)",
                                                cursor: "pointer", fontSize: 12, fontWeight: 700,
                                                color: "var(--primary)", fontFamily: "'Nunito', sans-serif",
                                                transition: "all 0.13s",
                                            }}>View →</button>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button className="page-btn disabled">« Prev</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">Next »</button>
                        <div style={{ marginLeft: "auto" }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>
                                Showing {filtered.length} programs
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}