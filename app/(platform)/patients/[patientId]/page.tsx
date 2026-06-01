"use client";

import React, { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";

const tabs = ["Overview", "Programs", "Notes", "Documents"];

const statusChipMap: Record<string, string> = {
    active: "chip-active",
    ACTIVE: "chip-active",
    pending: "chip-pending",
    critical: "chip-critical",
    inactive: "chip-inactive",
    discharged: "chip-inactive",
    DISCHARGED: "chip-inactive",
};

const statusLabelMap: Record<string, string> = {
    active: "Active",
    ACTIVE: "Active",
    pending: "Pending",
    critical: "Critical",
    inactive: "Inactive",
    discharged: "Discharged",
    DISCHARGED: "Discharged",
};

/* ─── Create Note Modal ─── */
function CreateNoteModal({ patientFolderId, onClose, onCreated }: { patientFolderId: string, onClose: () => void, onCreated: () => void }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        noteType: "SOAP",
        noteStyle: "CLINICAL",
        sessionDate: new Date().toISOString().split('T')[0],
        content: { text: "" },
    });

    const handleCreate = async () => {
        if (!form.content.text.trim()) return;
        setSaving(true); setError(null);
        try {
            const res = await fetch("http://localhost:5000/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    patientFolderId,
                    ...form,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to create note.");
            }
            onCreated();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally { setSaving(false); }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 600, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700 }}>New Clinical Note</div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)" }}>✕</button>
                </div>
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Note Type</label>
                            <select className="form-input" value={form.noteType} onChange={e => setForm(p => ({ ...p, noteType: e.target.value }))}>
                                <option value="SOAP">SOAP</option>
                                <option value="DAP">DAP</option>
                                <option value="HPI">HPI</option>
                                <option value="FREE_TEXT">Free Text</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-input" value={form.noteStyle} onChange={e => setForm(p => ({ ...p, noteStyle: e.target.value }))}>
                                <option value="CLINICAL">Clinical Note</option>
                                <option value="INTAKE">Intake Assessment</option>
                                <option value="DISCHARGE">Discharge Summary</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Session Date</label>
                            <input className="form-input" type="date" value={form.sessionDate} onChange={e => setForm(p => ({ ...p, sessionDate: e.target.value }))} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Content</label>
                        <textarea className="form-input" rows={10} value={form.content.text} onChange={e => setForm(p => ({ ...p, content: { text: e.target.value } }))} placeholder="Type your note here..." style={{ fontFamily: "inherit" }} />
                    </div>
                </div>
                <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "10px 18px", border: "1.5px solid var(--border)", borderRadius: 9 }}>Cancel</button>
                    <button onClick={handleCreate} disabled={saving || !form.content.text.trim()} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: "var(--primary)", color: "#fff" }}>{saving ? "Saving..." : "Save Draft"}</button>
                </div>
            </div>
        </div>
    );
}

export default function PatientDetailPage({ params: paramsPromise }: { params: Promise<{ patientId: string }> }) {
    const params = use(paramsPromise);
    const { patientId } = params;

    const [activeTab, setActiveTab] = useState("Overview");
    const [patientData, setPatientData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Tab-specific data
    const [notes, setNotes] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [fetchingNotes, setFetchingNotes] = useState(false);
    const [fetchingDocs, setFetchingDocs] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);

    const fetchPatient = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:5000/patients/${patientId}`, { credentials: "include" });
            const data = await res.json();
            if (res.ok) setPatientData(data.data);
            else setError(data.message || "Failed to load patient.");
        } catch (err) { setError("Network error."); }
        finally { setLoading(false); }
    }, [patientId]);

    useEffect(() => { fetchPatient(); }, [fetchPatient]);

    const fetchNotes = useCallback(async () => {
        if (!patientData?.folder?.id) return;
        try {
            setFetchingNotes(true);
            const res = await fetch(`http://localhost:5000/notes?patientFolderId=${patientData.folder.id}`, { credentials: "include" });
            const data = await res.json();
            if (res.ok) setNotes(data.data || []);
        } catch (e) { console.error(e); }
        finally { setFetchingNotes(false); }
    }, [patientData?.folder?.id]);

    const fetchDocuments = useCallback(async () => {
        if (!patientData?.folder?.id) return;
        try {
            setFetchingDocs(true);
            const res = await fetch(`http://localhost:5000/documents/folder/${patientData.folder.id}`, { credentials: "include" });
            const data = await res.json();
            if (res.ok) setDocuments(data.data || []);
        } catch (e) { console.error(e); }
        finally { setFetchingDocs(false); }
    }, [patientData?.folder?.id]);

    useEffect(() => {
        if (activeTab === "Notes") fetchNotes();
        if (activeTab === "Documents") fetchDocuments();
    }, [activeTab, fetchNotes, fetchDocuments]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !patientData?.folder?.id) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "OTHER");
        formData.append("description", `Uploaded from patient profile`);

        try {
            const res = await fetch(`http://localhost:5000/documents/folder/${patientData.folder.id}`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });
            if (res.ok) fetchDocuments();
            else alert("Upload failed.");
        } catch (err) { alert("Network error during upload."); }
    };

    const handleDeleteDoc = async (id: string) => {
        if (!confirm("Delete this document?")) return;
        try {
            const res = await fetch(`http://localhost:5000/documents/${id}`, { method: "DELETE", credentials: "include" });
            if (res.ok) fetchDocuments();
        } catch (e) { alert("Error deleting document."); }
    };

    if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading patient details...</div>;
    if (error || !patientData) return <div style={{ padding: 40, textAlign: "center" }}>⚠️ {error || "Patient not found."}</div>;

    const fullName = `${patientData.firstName} ${patientData.lastName}`;
    const initials = `${patientData.firstName[0]}${patientData.lastName[0]}`;
    const age = patientData.dateOfBirth ? new Date().getFullYear() - new Date(patientData.dateOfBirth).getFullYear() : '-';

    return (
        <>
            {showNoteModal && <CreateNoteModal patientFolderId={patientData.folder.id} onClose={() => setShowNoteModal(false)} onCreated={fetchNotes} />}

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "var(--muted)" }}>
                <Link href="/patients" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 700 }}>← Patients</Link>
                <span>/</span>
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>{fullName}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#2C7A6E", background: "#E6F4F2", padding: "2px 8px", borderRadius: 5, fontWeight: 700, marginLeft: 4 }}>{patientData.folder?.folderNumber || "NO FOLDER"}</span>
            </div>

            <div className="card" style={{ marginBottom: 20, overflow: "hidden" }}>
                <div style={{ height: 4, background: "#2C7A6E", opacity: 0.6 }} />
                <div style={{ padding: "24px 28px" }}>
                    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                        <div style={{ width: 72, height: 72, borderRadius: 18, background: "#E6F4F2", border: "1px solid #2C7A6E20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#2C7A6E", flexShrink: 0, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>{initials}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                <div>
                                    <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>{fullName}</h1>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "#E6F4F2", color: "#2C7A6E", fontFamily: "'Space Mono', monospace" }}>{patientData.folder?.folderNumber}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: "#E6F4F2", color: "#27A76A", display: "flex", alignItems: "center", gap: 5 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#27A76A" }} />
                                            active
                                        </span>
                                        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{patientData.gender} · {age} yrs</span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "1.5px solid var(--border)", borderRadius: 10, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)" }}>
                                        <span style={{ color: "#D98326" }}>✏️</span> Edit
                                    </button>
                                    <button onClick={() => setShowNoteModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", background: "#2C7A6E", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(44,122,110,0.2)" }}>
                                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Enrol in Program
                                    </button>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", borderTop: "1px solid var(--border)", padding: "16px 0" }}>
                                {[
                                    { label: "Diagnosis", value: patientData.metadata?.primaryDiagnosis || "Major Depressive Disorder" },
                                    { label: "Assigned Staff", value: patientData.assignedStaff ? `Dr. ${patientData.assignedStaff.lastName}` : "Unassigned" },
                                    { label: "Admitted", value: new Date(patientData.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
                                    { label: "Sessions", value: `${patientData.metadata?.totalSessions || "14"} total` },
                                    { label: "Blood Group", value: patientData.metadata?.bloodGroup || "O+" },
                                ].map((s, idx) => (
                                    <div key={idx} style={{ padding: "0 10px" }}>
                                        <div style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em" }}>{s.label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: 4, width: "fit-content" }}>
                {["Overview", "Programs", "Sessions", "Documents"].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: activeTab === t ? "var(--primary)" : "transparent", color: activeTab === t ? "#fff" : "var(--muted)" }}>{t}</button>
                ))}
            </div>

            {activeTab === "Overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div className="card" style={{ padding: 0 }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "var(--fg)" }}>Contact Information</h3>
                        </div>
                        <div style={{ padding: "12px 24px 24px" }}>
                            {[
                                { icon: "📞", label: "Phone", value: patientData.phone || "0803 111 2233" },
                                { icon: "📧", label: "Email", value: patientData.email || "amara.okafor@gmail.com" },
                                { icon: "🏠", label: "Address", value: patientData.address || "14 Aba Road, Wuse 2, Abuja" },
                                { icon: "🩸", label: "Blood Group", value: patientData.metadata?.bloodGroup || "O+" },
                                { icon: "⚠️", label: "Allergies", value: patientData.metadata?.allergies || "Penicillin" },
                            ].map((item, i) => (
                                <div key={i} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: i === 4 ? "none" : "1px solid var(--border-light)" }}>
                                    <div style={{ fontSize: 20, width: 24, display: "flex", justifyContent: "center" }}>{item.icon}</div>
                                    <div>
                                        <div style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                                        <div style={{ fontSize: 14, color: "var(--fg)", fontWeight: 500 }}>{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div className="card" style={{ padding: 0 }}>
                            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "var(--fg)" }}>Emergency Contacts</h3>
                                <button style={{ padding: "4px 12px", border: "1.5px solid var(--border)", borderRadius: 6, background: "var(--card)", fontSize: 12, fontWeight: 700, color: "var(--fg-mid)", cursor: "pointer" }}>+ Add</button>
                            </div>
                            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                                {[
                                    { initials: "CO", name: "Chukwuemeka Okafor", relation: "Spouse", phone: "0803 999 1122" },
                                    { initials: "NO", name: "Ngozi Okafor", relation: "Sister", phone: "0803 888 4455" },
                                ].map((contact, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#E6F4F2", color: "#2C7A6E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{contact.initials}</div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)" }}>{contact.name}</div>
                                                <div style={{ fontSize: 12, color: "var(--muted)" }}>{contact.relation} · {contact.phone}</div>
                                            </div>
                                        </div>
                                        <button style={{ background: "none", border: "none", color: "#D98326", cursor: "pointer", fontSize: 16 }}>✏️</button>
                                    </div>
                                ))}

                                <div style={{ marginTop: 8, padding: 16, background: "#FEF3E2", borderRadius: 12, border: "1px solid #D9832620" }}>
                                    <div style={{ fontSize: 8, fontFamily: "'Space Mono', monospace", color: "#D98326", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.05em" }}>Clinical Notes</div>
                                    <div style={{ fontSize: 13, color: "#D98326", lineHeight: 1.5, fontWeight: 500 }}>
                                        Patient shows consistent engagement. PHQ-9 score improving. Monitor for medication compliance.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Programs" && (
                <div className="card">
                    <table className="data-table">
                        <thead><tr><th>Program</th><th>Type</th><th>Enrolled Date</th><th>Status</th></tr></thead>
                        <tbody>
                            {(patientData.enrollments || []).length === 0 ? <tr><td colSpan={4} style={{ textAlign: "center", padding: 40 }}>Not enrolled in any programs.</td></tr> : patientData.enrollments.map((e: any) => (
                                <tr key={e.id}>
                                    <td><Link href={`/programs/${e.program.id}`} style={{ fontWeight: 700, color: "var(--primary)" }}>{e.program.name}</Link></td>
                                    <td><span className="td-mono">{e.program.programType}</span></td>
                                    <td><span className="td-mono">{new Date(e.enrolledAt).toLocaleDateString()}</span></td>
                                    <td><span className={`chip ${statusChipMap[e.status]}`}>{e.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === "Notes" && (
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Clinical Notes</div>
                        <button onClick={() => setShowNoteModal(true)} style={{ padding: "6px 12px", border: "none", borderRadius: 6, background: "var(--primary)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>+ Add Note</button>
                    </div>
                    {fetchingNotes ? <div style={{ padding: 40, textAlign: "center" }}>Fetching notes...</div> : notes.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>No notes recorded.</div> : (
                        <table className="data-table">
                            <thead><tr><th>Date</th><th>Type</th><th>Status</th><th>Author</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
                            <tbody>
                                {notes.map(n => (
                                    <tr key={n.id}>
                                        <td className="td-mono">{new Date(n.createdAt).toLocaleDateString()}</td>
                                        <td><span className="td-text">{n.noteType}</span></td>
                                        <td><span className={`chip ${n.status === "SIGNED" ? "chip-active" : "chip-pending"}`}>{n.status}</span></td>
                                        <td><span className="td-text">{n.author.firstName} {n.author.lastName}</span></td>
                                        <td style={{ textAlign: "right" }}><button style={{ padding: "4px 8px", border: "1.5px solid var(--border)", borderRadius: 6, background: "var(--card)", cursor: "pointer", fontSize: 11 }}>View</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === "Documents" && (
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Files & Documents</div>
                        <label style={{ padding: "6px 12px", border: "none", borderRadius: 6, background: "var(--primary)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
                            Upload <input type="file" style={{ display: "none" }} onChange={handleFileUpload} />
                        </label>
                    </div>
                    {fetchingDocs ? <div style={{ padding: 40, textAlign: "center" }}>Fetching documents...</div> : documents.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>No documents uploaded.</div> : (
                        <table className="data-table">
                            <thead><tr><th>Name</th><th>Size</th><th>Uploaded</th><th>Actions</th></tr></thead>
                            <tbody>
                                {documents.map(d => (
                                    <tr key={d.id}>
                                        <td style={{ fontWeight: 600 }}>{d.originalName}</td>
                                        <td className="td-mono">{(d.size / 1024).toFixed(1)} KB</td>
                                        <td className="td-mono">{new Date(d.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <a href={`http://localhost:5000${d.fileUrl}`} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 700, fontSize: 12 }}>Download</a>
                                                <button onClick={() => handleDeleteDoc(d.id)} style={{ color: "var(--danger)", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </>
    );
}
