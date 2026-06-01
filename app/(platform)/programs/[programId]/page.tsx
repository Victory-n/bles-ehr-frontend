"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";

type ProgramType = "GROUP" | "INDIVIDUAL";
type ProgramStatus = "ACTIVE" | "INACTIVE" | "COMPLETED";

interface Staff {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
}

interface Enrollment {
    id: string;
    patientId: string;
    status: "ACTIVE" | "DISCHARGED" | "COMPLETED";
    enrolledAt: string;
    dischargedAt: string | null;
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string | null;
        status: string;
        folder: { folderNumber: string };
    };
}

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
    createdBy: { id: string; firstName: string; lastName: string };
    enrollments: Enrollment[];
    _count: { notes: number };
}

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    folder: { folderNumber: string };
}

const typeStyle: Record<ProgramType, { color: string; bg: string; icon: string; label: string }> = {
    GROUP: { color: "#6B5ED4", bg: "#EDEBFB", icon: "👥", label: "Group" },
    INDIVIDUAL: { color: "#2C7A6E", bg: "#E6F4F2", icon: "🧠", label: "Individual" },
};

const statusChip = (s: string) => {
    if (s === "ACTIVE" || s === "active") return "chip-active";
    if (s === "INACTIVE" || s === "inactive") return "chip-inactive";
    if (s === "COMPLETED" || s === "completed") return "chip-progress";
    return "chip-pending";
};

/* ─── Enrol Patient Modal ─── */
function EnrolPatientModal({ programId, onClose, onEnrolled }: { programId: string, onClose: () => void, onEnrolled: (e: Enrollment) => void }) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPatientId, setSelectedPatientId] = useState("");

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch("http://localhost:5000/patients", { credentials: "include" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch patients.");
                setPatients(data.data || []);
            } catch (e: any) {
                setError(e.message);
            } finally { setLoading(false); }
        };
        fetchPatients();
    }, []);

    const handleEnrol = async () => {
        if (!selectedPatientId) return;
        setSaving(true); setError(null);
        try {
            const res = await fetch(`http://localhost:5000/programs/${programId}/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ patientId: selectedPatientId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Enrollment failed.");
            onEnrolled(data.data);
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally { setSaving(false); }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 460, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>Enrol Patient</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Select a patient to join this program</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
                <div style={{ padding: "24px" }}>
                    {error && <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>⚠️ {error}</div>}
                    <div className="form-group">
                        <label className="form-label">Patient Name</label>
                        <select className="form-input" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} disabled={loading || saving}>
                            <option value="">Select a patient...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.folder?.folderNumber || p.id})</option>
                            ))}
                        </select>
                        {loading && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Loading patients...</div>}
                    </div>
                </div>
                <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "10px 18px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)" }}>Cancel</button>
                    <button onClick={handleEnrol} disabled={!selectedPatientId || saving} style={{ padding: "10px 22px", border: "none", borderRadius: 9, background: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", opacity: (saving || !selectedPatientId) ? 0.6 : 1 }}>{saving ? "Enrolling..." : "Confirm Enrollment"}</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Edit Program Modal ─── */
function EditProgramModal({ program, onClose, onUpdated }: { program: Program, onClose: () => void, onUpdated: (p: Program) => void }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: program.name,
        description: program.description || "",
        status: program.status,
        programType: program.programType,
        category: program.category || "",
        totalSessions: program.totalSessions || "",
        durationMonths: program.durationMonths || "",
        frequency: program.frequency || "",
        maxEnrollment: program.maxEnrollment || "",
        startDate: program.startDate ? new Date(program.startDate).toISOString().split('T')[0] : "",
        endDate: program.endDate ? new Date(program.endDate).toISOString().split('T')[0] : "",
        lead: program.metadata?.lead || "",
        notes: program.metadata?.notes || "",
    });

    const handleUpdate = async () => {
        setSaving(true); setError(null);
        try {
            const payload = {
                ...form,
                metadata: {
                    lead: form.lead,
                    notes: form.notes,
                }
            };

            const res = await fetch(`http://localhost:5000/programs/${program.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed.");
            onUpdated(data.data);
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally { setSaving(false); }
    };

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

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 560, maxHeight: "90vh", boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflowY: "auto" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700 }}>Edit Program Settings</div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer" }}>✕</button>
                </div>
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {error && <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: 12, borderRadius: 8 }}>⚠️ {error}</div>}
                    <div className="form-group">
                        <label className="form-label">Program Name</label>
                        <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                                <option value="">Select a category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Program Type</label>
                            <select className="form-input" value={form.programType} onChange={e => setForm(p => ({ ...p, programType: e.target.value as ProgramType }))}>
                                {programTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as ProgramStatus }))}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Total Sessions</label>
                            <input className="form-input" type="number" value={form.totalSessions} onChange={e => setForm(p => ({ ...p, totalSessions: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Duration (mo)</label>
                            <input className="form-input" type="number" value={form.durationMonths} onChange={e => setForm(p => ({ ...p, durationMonths: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Enroll</label>
                            <input className="form-input" type="number" value={form.maxEnrollment} onChange={e => setForm(p => ({ ...p, maxEnrollment: e.target.value }))} />
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Frequency</label>
                            <select className="form-input" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                                <option value="">Select frequency</option>
                                {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Program Lead</label>
                            <select className="form-input" value={form.lead} onChange={e => setForm(p => ({ ...p, lead: e.target.value }))}>
                                <option value="">Select a staff member</option>
                                {staffList.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Additional Notes <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
                        <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: "none" }} />
                    </div>
                </div>
                <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, background: "var(--card)", position: "sticky", bottom: 0 }}>
                    <button onClick={onClose} style={{ padding: "10px 18px", border: "1.5px solid var(--border)", borderRadius: 9 }}>Cancel</button>
                    <button onClick={handleUpdate} disabled={saving} style={{ padding: "10px 22px", border: "none", borderRadius: 9, background: "var(--primary)", color: "#fff" }}>{saving ? "Saving..." : "Save Changes"}</button>
                </div>
            </div>
        </div>
    );
}

export default function ProgramDetailPage({ params: paramsPromise }: { params: Promise<{ programId: string }> }) {
    const params = use(paramsPromise);
    const { programId } = params;

    const [program, setProgram] = useState<Program | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("Overview");
    const [showEnrolModal, setShowEnrolModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchProgram = useCallback(async () => {
        try {
            setLoading(true); setError(null);
            const res = await fetch(`http://localhost:5000/programs/${programId}`, { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load program.");
            setProgram(data.data);
        } catch (e: any) {
            setError(e.message);
        } finally { setLoading(false); }
    }, [programId]);

    useEffect(() => { fetchProgram(); }, [fetchProgram]);

    const handleDischarge = async (patientId: string) => {
        if (!confirm("Are you sure you want to discharge this patient?")) return;
        try {
            const res = await fetch(`http://localhost:5000/programs/${programId}/patients/${patientId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Discharge failed.");
            }
            fetchProgram();
        } catch (e: any) {
            alert(e.message);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading program details...</div>;
    if (error || !program) return <div style={{ padding: 40, textAlign: "center", color: "var(--danger)" }}>⚠️ {error || "Program not found."}</div>;

    const ts = typeStyle[program.programType];
    const enrollments = program.enrollments || [];
    const activeEnrollments = enrollments.filter(e => e.status === "ACTIVE");

    return (
        <>
            {showEnrolModal && <EnrolPatientModal programId={programId} onClose={() => setShowEnrolModal(false)} onEnrolled={fetchProgram} />}
            {showEditModal && <EditProgramModal program={program} onClose={() => setShowEditModal(false)} onUpdated={fetchProgram} />}

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "var(--muted)" }}>
                <Link href="/programs" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 700 }}>← Programs</Link>
                <span>/</span>
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>{program.name}</span>
                <span style={{ marginLeft: 4, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#E6F4F2", color: "#2C7A6E", fontFamily: "'Space Mono', monospace" }}>PRG-{program.id.substring(0, 3).toUpperCase()}</span>
            </div>

            <div className="card" style={{ marginBottom: 24, overflow: "hidden" }}>
                <div style={{ height: 4, background: "#2C7A6E", opacity: 0.6 }} />
                <div style={{ padding: "24px 28px" }}>
                    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#E6F4F2", border: "1px solid #2C7A6E20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>🧠</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                <div>
                                    <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>{program.name}</h1>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: "#E6F4F2", color: "#27A76A", display: "flex", alignItems: "center", gap: 5 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#27A76A" }} />
                                            active
                                        </span>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: "#E6F4F2", color: "#2C7A6E" }}>Psychotherapy</span>
                                        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Lead: <strong>Dr. {program.createdBy.lastName}</strong></span>
                                        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Created {new Date(program.id).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button onClick={() => setShowEditModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "1.5px solid var(--border)", borderRadius: 10, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)" }}>
                                        <span style={{ color: "#D98326" }}>✏️</span> Edit Program
                                    </button>
                                    <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "1.5px solid #FEF3E2", borderRadius: 10, background: "#FEF3E2", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#D98326" }}>
                                        <span style={{ fontSize: 16 }}>⏸</span> Disable
                                    </button>
                                    <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", background: "#2C7A6E", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(44,122,110,0.2)" }}>
                                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Schedule Session
                                    </button>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "16px 0", marginBottom: 20 }}>
                                {[
                                    { label: "Total Sessions", value: program.totalSessions || "—", border: true },
                                    { label: "Duration", value: program.durationMonths ? `${program.durationMonths} months` : "—", border: true },
                                    { label: "Frequency", value: program.frequency || "—", border: true },
                                    { label: "Group Sessions Run", value: "5", border: true }, // Assuming this logic is not yet in schema
                                    { label: "Upcoming Sessions", value: "2", border: true }, // Assuming this logic is not yet in schema
                                    { label: "End Date", value: program.endDate ? new Date(program.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—", border: false },
                                ].map((s, idx) => (
                                    <div key={idx} style={{ padding: "0 20px", borderRight: s.border ? "1px solid var(--border)" : "none" }}>
                                        <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em" }}>{s.label}</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Enrollment Progress */}
                            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "flex-end" }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
                                            Enrollment: <span style={{ color: "var(--fg)" }}>{activeEnrollments.length}/{program.maxEnrollment || "∞"} patients</span>
                                        </div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#D98326", fontFamily: "'Space Mono', monospace" }}>
                                            {program.maxEnrollment ? Math.round((activeEnrollments.length / program.maxEnrollment) * 100) : 0}% capacity
                                        </div>
                                    </div>
                                    <div style={{ height: 10, background: "#E9ECEF", borderRadius: 10, overflow: "hidden" }}>
                                        <div style={{ height: "100%", background: "#D98326", width: `${program.maxEnrollment ? (activeEnrollments.length / program.maxEnrollment) * 100 : 0}%`, borderRadius: 10, transition: "width 0.5s ease" }} />
                                    </div>
                                </div>
                                <button onClick={() => setShowEnrolModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", border: "1.5px solid #2C7A6E", borderRadius: 10, background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#2C7A6E", whiteSpace: "nowrap" }}>
                                    <span style={{ fontSize: 16 }}>+</span> Enrol Patient
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: 4, width: "fit-content" }}>
                {["Overview", "Enrolled Patients", "Group Sessions", "Attendance"].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: activeTab === t ? "var(--primary)" : "transparent", color: activeTab === t ? "#fff" : "var(--muted)" }}>{t}</button>
                ))}
            </div>

            {activeTab === "Overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20 }}>
                    {/* Left Column: About This Program */}
                    <div className="card" style={{ padding: "28px 32px" }}>
                        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: "var(--fg)", marginBottom: 24 }}>About This Program</h3>
                        <p style={{ color: "var(--fg-mid)", lineHeight: 1.7, fontSize: 14.5, marginBottom: 32 }}>
                            {program.description || "Structured psychotherapy focusing on identifying and changing negative thought patterns and behaviours. Delivered in both individual and group formats, this programme targets depression, anxiety, OCD, PTSD, and related conditions using evidence-based CBT models."}
                        </p>

                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24 }}>
                            <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>Learning Objectives</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {[
                                    "Identify and challenge cognitive distortions",
                                    "Develop healthy behavioural activation strategies",
                                    "Build emotional regulation and coping skills",
                                    "Reduce depressive and anxiety symptoms",
                                    "Equip patients with long-term relapse prevention tools"
                                ].map((obj, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "var(--primary)", fontFamily: "'Space Mono', monospace" }}>
                                            0{i + 1}
                                        </div>
                                        <span style={{ fontSize: 14, color: "var(--fg-mid)", fontWeight: 500 }}>{obj}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Session Progress Card */}
                        <div className="card" style={{ padding: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
                                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "var(--fg)" }}>Session Progress</h3>
                                <span style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Programme Overview</span>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                {[
                                    { label: "Sessions Completed", current: 5, total: program.totalSessions || 0, color: "#27A76A" },
                                    { label: "Sessions Upcoming", current: 2, total: program.totalSessions || 0, color: "var(--border)" },
                                    { label: "Enrollment Filled", current: activeEnrollments.length, total: program.maxEnrollment || 0, color: "#2C7A6E" },
                                ].map((p, i) => (
                                    <div key={i}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-mid)" }}>{p.label}</span>
                                            <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "var(--fg)", fontWeight: 700 }}>{p.current}/{p.total}</span>
                                        </div>
                                        <div style={{ height: 6, background: "#E9ECEF", borderRadius: 10, overflow: "hidden" }}>
                                            <div style={{ height: "100%", background: p.color, width: `${(p.current / p.total) * 100}%`, borderRadius: 10 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Program Details Card */}
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "var(--fg)", marginBottom: 20 }}>Program Details</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {[
                                    { icon: "👨‍🏫", label: "Program Lead", value: program.metadata?.lead || `Dr. ${program.createdBy.lastName}` },
                                    { icon: "📅", label: "Start Date", value: program.startDate ? new Date(program.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                                    { icon: "🏁", label: "End Date", value: program.endDate ? new Date(program.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                                    { icon: "🔄", label: "Frequency", value: program.frequency || "—" },
                                    { icon: "🔢", label: "Total Sessions", value: program.totalSessions ? `${program.totalSessions} sessions` : "—" },
                                    { icon: "👥", label: "Max Enrollment", value: program.maxEnrollment ? `${program.maxEnrollment} patients` : "—" },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i === 5 ? 0 : 12, borderBottom: i === 5 ? "none" : "1px solid var(--border-light)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ fontSize: 16 }}>{item.icon}</span>
                                            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{item.label}</span>
                                        </div>
                                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Enrolled Patients" && (
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Folder #</th>
                                <th>Enrolled Date</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollments.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>No patients enrolled in this program.</td></tr>
                            ) : enrollments.map(e => (
                                <tr key={e.id}>
                                    <td>
                                        <Link href={`/patients/${e.patientId}`} style={{ textDecoration: "none" }}>
                                            <div style={{ fontWeight: 700, color: "var(--fg)" }}>{e.patient.firstName} {e.patient.lastName}</div>
                                            <div style={{ fontSize: 10, color: "var(--muted)" }}>{e.patientId}</div>
                                        </Link>
                                    </td>
                                    <td className="td-mono">{e.patient.folder?.folderNumber || "—"}</td>
                                    <td className="td-mono">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                                    <td><span className={`chip ${e.status === "ACTIVE" ? "chip-active" : "chip-inactive"}`}>{e.status}</span></td>
                                    <td style={{ textAlign: "right" }}>
                                        {e.status === "ACTIVE" && (
                                            <button onClick={() => handleDischarge(e.patientId)} style={{ padding: "5px 10px", border: "1.5px solid var(--danger-light)", borderRadius: 7, background: "var(--danger-light)", color: "var(--danger)", fontWeight: 700, cursor: "pointer" }}>Discharge</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === "Group Sessions" && (
                <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }} className="card">
                    <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
                    <p>Group session logs and documentation will appear here.</p>
                </div>
            )}

            {activeTab === "Attendance" && (
                <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }} className="card">
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
                    <p>Attendance tracking for group sessions is coming soon.</p>
                </div>
            )}
        </>
    );
}