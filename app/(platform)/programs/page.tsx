"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type ProgramType = "PHP" | "IOP" | "POP" | "OP" | "GROUP" | "INDIVIDUAL";
type ProgramStatus = "ACTIVE" | "INACTIVE" | "COMPLETED";

interface Program {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    programType: ProgramType;
    status: ProgramStatus;
    totalSessions: number | null;
    durationMonths: number | null;
    frequency: string | null;
    maxEnrollment: number | null;
    startDate: string | null;
    endDate: string | null;
    metadata: any;
    createdAt: string;
    createdBy: { id: string; firstName: string; lastName: string };
    _count: { enrollments: number; notes: number };
}

const typeStyle: Record<ProgramType, { color: string; bg: string; icon: string; label: string }> = {
    GROUP:      { color: "#6B5ED4", bg: "#EDEBFB", icon: "👥", label: "Group" },
    INDIVIDUAL: { color: "#2C7A6E", bg: "#E6F4F2", icon: "🧠", label: "Individual" },
};

const statusChip: Record<ProgramStatus, string> = {
    ACTIVE: "chip-active", INACTIVE: "chip-inactive",
    COMPLETED: "chip-progress",
};
const statusLabel: Record<ProgramStatus, string> = {
    ACTIVE: "Active", INACTIVE: "Inactive", COMPLETED: "Completed",
};

/* ─── Add Program Modal ─── */
function AddProgramModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Program) => void }) {
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        programType: "GROUP" as ProgramType,
        totalSessions: "",
        durationMonths: "",
        frequency: "",
        maxEnrollment: "",
        lead: "",
        notes: "",
    });

    const categories = ["Psychotherapy", "Wellness", "Addiction", "Group Therapy", "Psychoeducation", "Family Therapy", "Other"];
    const programTypes = ["PHP", "IOP", "POP", "OP", "GROUP", "INDIVIDUAL"];
    const frequencies = ["Daily", "Twice Weekly", "Weekly", "Bi-weekly", "Monthly"];
    const staffList = [
        "Dr. C. Obi — Psychologist",
        "Dr. B. Adeyemi — Psychiatrist",
        "Dr. A. Kolade — Psychiatrist",
        "Dr. F. Eze — Counsellor",
        "Nurse R. Bello — Psychiatric Nurse",
    ];

    const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    const handleCreate = async () => {
        if (!form.name.trim()) { setError("Program name is required."); return; }
        setSaving(true); setError(null);
        try {
            const res = await fetch("http://localhost:5000/programs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description || undefined,
                    category: form.category || undefined,
                    programType: form.programType,
                    totalSessions: form.totalSessions || undefined,
                    durationMonths: form.durationMonths || undefined,
                    frequency: form.frequency || undefined,
                    maxEnrollment: form.maxEnrollment || undefined,
                    metadata: {
                        lead: form.lead,
                        notes: form.notes,
                    }
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || "Failed to create program."); return; }
            onCreated(data.data);
            onClose();
        } catch {
            setError("Network error. Please try again.");
        } finally { setSaving(false); }
    };

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
                    {error && <div style={{ background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>⚠️ {error}</div>}

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

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Category</label>
                                    <select className="form-input" value={form.category}
                                            onChange={e => update("category", e.target.value)} style={{ cursor: "pointer" }}>
                                        <option value="">Select a category</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Program Type</label>
                                    <select className="form-input" value={form.programType}
                                            onChange={e => update("programType", e.target.value)} style={{ cursor: "pointer" }}>
                                        {programTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
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

                    <button onClick={step === 1 ? () => setStep(2) : handleCreate} disabled={saving} style={{
                        padding: "10px 24px", border: "none", borderRadius: 9,
                        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                        cursor: saving ? "not-allowed" : "pointer", fontSize: 13.5, fontWeight: 700,
                        color: "#fff", fontFamily: "'Nunito', sans-serif",
                        boxShadow: "0 3px 12px rgba(44,122,110,0.28)",
                        opacity: saving ? 0.7 : 1
                    }}>{step === 1 ? "Continue →" : saving ? "Creating..." : "Create Program"}</button>
                </div>
            </div>
        </div>
    );
}

const categoryColors: Record<string, { bg: string; color: string }> = {
    Psychotherapy: { bg: "#EDEBFB", color: "#6B5ED4" }, // Using existing brand colors for consistency
    Wellness: { bg: "#E6F4F2", color: "#2C7A6E" },
    Addiction: { bg: "#FEF3E2", color: "#D98326" },
    "Group Therapy": { bg: "var(--danger-light)", color: "var(--danger)" },
    Psychoeducation: { bg: "var(--purple-light)", color: "var(--purple)" },
    "Family Therapy": { bg: "#F0F0F0", color: "#666" },
    Other: { bg: "var(--surface)", color: "var(--muted)" },
};

/* ─── Program Card ─── */
function ProgramCard({ program }: { program: Program }) {
    const isActive = program.status === "ACTIVE";
    const lead = program.metadata?.lead || `${program.createdBy.firstName} ${program.createdBy.lastName}`;
    const category = program.category || "Other";
    const colors = categoryColors[category] || categoryColors.Other;

    return (
        <Link href={`/programs/${program.id}`} style={{ textDecoration: "none" }}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", transition: "box-shadow 0.2s, transform 0.2s", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
                 onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(44,122,110,0.14)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                 onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
                <div style={{ height: 4, background: isActive ? `linear-gradient(90deg, ${colors.color}, ${colors.color}88)` : "var(--border)" }} />
                <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: isActive ? `${colors.color}18` : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: `1px solid ${isActive ? `${colors.color}30` : "var(--border)"}` }}>
                            {category === "Psychotherapy" ? "🧠" : category === "Wellness" ? "🌱" : category === "Addiction" ? "⚓" : category === "Group Therapy" ? "👥" : "📋"}
                        </div>
                        <span className={`chip ${statusChip[program.status]}`}>{statusLabel[program.status]}</span>
                    </div>

                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: isActive ? "var(--fg)" : "var(--muted)", marginBottom: 5, lineHeight: 1.35 }}>{program.name}</div>

                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                        <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: colors.bg, color: colors.color, fontFamily: "'Space Mono', monospace" }}>
                            {category}
                        </span>
                        <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "var(--surface)", color: "var(--muted)", fontFamily: "'Space Mono', monospace", border: "1px solid var(--border)" }}>
                            {program.programType}
                        </span>
                    </div>

                    <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.55, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {program.description || "No description provided."}
                    </div>

                    <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                        {[
                            { label: "Enrolled", value: `${program._count.enrollments}/${program.maxEnrollment || "∞"}` },
                            { label: "Sessions", value: String(program.totalSessions || "—") },
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8.5, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{s.label}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 9, fontWeight: 700, color: "var(--primary)" }}>
                            {lead.split(" ").slice(0, 2).map(w => w[0]).join("")}
                        </div>
                        <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{lead.split(" — ")[0]}</span>
                    </div>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.04em" }}>
                        {program.frequency || "No frequency"}
                    </span>
                </div>
            </div>
        </Link>
    );
}

/* ─── Loading Skeleton ─── */
function Skeleton() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", height: 220 }}>
                    <div style={{ height: 4, background: "var(--border)" }} />
                    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--surface)", animation: "pulse 1.5s ease infinite" }} />
                        <div style={{ height: 14, width: "70%", background: "var(--surface)", borderRadius: 6, animation: "pulse 1.5s ease infinite" }} />
                        <div style={{ height: 11, width: "40%", background: "var(--surface)", borderRadius: 20, animation: "pulse 1.5s ease infinite" }} />
                        <div style={{ height: 10, width: "90%", background: "var(--surface)", borderRadius: 6, animation: "pulse 1.5s ease infinite" }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Main Page ─── */
export default function ProgramsPage() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [view, setView] = useState<"grid" | "list">("grid");

    const fetchPrograms = useCallback(async () => {
        try {
            setLoading(true); setError(null);
            const res = await fetch("http://localhost:5000/programs", { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load programs.");
            setPrograms(data.data || []);
        } catch (e: any) {
            setError(e.message || "Network error.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

    const filtered = programs.filter(p => {
        if (activeTab === 1) return p.status === "ACTIVE";
        if (activeTab === 2) return p.status === "INACTIVE" || p.status === "COMPLETED";
        return true;
    });

    const totalEnrolled = programs.reduce((s, p) => s + p._count.enrollments, 0);
    const activeCount   = programs.filter(p => p.status === "ACTIVE").length;
    const inactiveCount = programs.length - activeCount;

    const kpis = [
        { label: "Total Programs",   value: String(programs.length), trend: "↑",  color: "#2C7A6E", points: "0,28 20,24 40,20 60,22 80,14 100,10" },
        { label: "Active Programs",  value: String(activeCount),     trend: "↑",  color: "#27A76A", points: "0,30 20,26 40,28 60,20 80,22 100,10" },
        { label: "Total Enrolled",   value: String(totalEnrolled),   trend: "↑",  color: "#6B5ED4", points: "0,32 20,28 40,22 60,24 80,16 100,8"  },
        { label: "Inactive / Closed",value: String(inactiveCount),   trend: "—",  color: "#D98326", points: "0,20 20,22 40,18 60,24 80,20 100,22" },
    ];

    const tabs = [
        { label: "All Programs",       count: programs.length },
        { label: "Active",             count: activeCount },
        { label: "Inactive / Closed",  count: inactiveCount },
    ];

    return (
        <>
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
            {showModal && (
                <AddProgramModal
                    onClose={() => setShowModal(false)}
                    onCreated={p => setPrograms(prev => [p, ...prev])}
                />
            )}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Programs</div>
                    <div className="page-subtitle">Manage clinical programmes, enrolments &amp; group sessions</div>
                </div>
                <div className="header-actions">
                    <button onClick={fetchPrograms} style={{ padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 10, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>
                        ↻ Refresh
                    </button>
                    <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)" }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Program
                    </button>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div style={{ background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>
                    ⚠️ {error} — <button onClick={fetchPrograms} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontWeight: 700, textDecoration: "underline", fontSize: 13 }}>Retry</button>
                </div>
            )}

            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                {kpis.map((k, idx) => (
                    <div key={k.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 20px 16px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 10 }}>{k.label}</div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4 }}>
                            {loading ? "—" : k.value}
                        </div>
                        <svg style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.35 }} width="100" height="44" viewBox="0 0 100 44">
                            <polyline points={k.points} fill="none" stroke={k.color} strokeWidth="2" />
                        </svg>
                    </div>
                ))}
            </div>

            {/* Tabs + View Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                {tabs.map((tab, i) => (
                    <button key={tab.label} className={`filter-tab${activeTab === i ? " active" : ""}`} onClick={() => setActiveTab(i)}>
                        {tab.label}
                        <span style={{ marginLeft: 6, fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: 0.75 }}>({loading ? "…" : tab.count})</span>
                    </button>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                    {(["grid", "list"] as const).map(v => (
                        <button key={v} onClick={() => setView(v)} style={{ width: 34, height: 34, border: `1.5px solid ${view === v ? "var(--primary)" : "var(--border)"}`, borderRadius: 8, background: view === v ? "var(--primary-light)" : "var(--card)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.13s" }}>
                            {v === "grid" ? "⊞" : "☰"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? <Skeleton /> : filtered.length === 0 ? (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
                        {activeTab === 0 ? "No programs yet" : "No programs in this category"}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>
                        {activeTab === 0 ? "Create your first programme to get started." : "Try switching to 'All Programs'."}
                    </div>
                </div>
            ) : view === "grid" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {filtered.map(p => <ProgramCard key={p.id} program={p} />)}
                </div>
            ) : (
                <div className="card">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Program</th>
                            <th>Type</th>
                            <th>Lead (Created By)</th>
                            <th>Enrolled</th>
                            <th>Notes</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map(p => {
                            const ts = typeStyle[p.programType];
                            const lead = `${p.createdBy.firstName} ${p.createdBy.lastName}`;
                            return (
                                <tr key={p.id}>
                                    <td>
                                        <Link href={`/programs/${p.id}`} style={{ textDecoration: "none" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${ts.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{ts.icon}</div>
                                                <div>
                                                    <div className="patient-name">{p.name}</div>
                                                    <div className="patient-id">{p.id.substring(0, 8).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: ts.bg, color: ts.color, fontFamily: "'Space Mono', monospace" }}>{ts.label}</span>
                                    </td>
                                    <td><span className="td-text">{lead}</span></td>
                                    <td><span className="td-mono">{p._count.enrollments}</span></td>
                                    <td><span className="td-mono">{p._count.notes}</span></td>
                                    <td><span className={`chip ${statusChip[p.status]}`}>{statusLabel[p.status]}</span></td>
                                    <td style={{ textAlign: "right" }}>
                                        <Link href={`/programs/${p.id}`}>
                                            <button style={{ padding: "6px 14px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>View →</button>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <div style={{ marginLeft: "auto" }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>
                                {filtered.length} programme{filtered.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}