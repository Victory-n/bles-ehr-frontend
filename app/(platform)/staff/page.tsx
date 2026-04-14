"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ─── Mock Data ─── */
const mockStaff = [
    {
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
        rating: 4.9,
        initials: "CO",
        color: "#2C7A6E",
        joinedDate: "12 Jan 2024",
        lastSeen: "Today, 09:14 AM",
    },
    {
        id: "STF-002",
        firstName: "Bola",
        lastName: "Adeyemi",
        fullName: "Dr. Bola Adeyemi",
        position: "Psychiatrist",
        email: "b.adeyemi@brightlife.health",
        phone: "0803 222 3355",
        status: "active",
        roles: ["Psychiatrist", "Prescriber"],
        assignedPatients: 18,
        sessionsMonth: 44,
        rating: 4.8,
        initials: "BA",
        color: "#6B5ED4",
        joinedDate: "03 Mar 2024",
        lastSeen: "Today, 08:50 AM",
    },
    {
        id: "STF-003",
        firstName: "Amaka",
        lastName: "Kolade",
        fullName: "Dr. Amaka Kolade",
        position: "Psychiatrist",
        email: "a.kolade@brightlife.health",
        phone: "0803 333 4466",
        status: "active",
        roles: ["Admin", "Psychiatrist", "Prescriber"],
        assignedPatients: 15,
        sessionsMonth: 39,
        rating: 4.7,
        initials: "AK",
        color: "#27A76A",
        joinedDate: "01 Jan 2024",
        lastSeen: "Today, 10:02 AM",
    },
    {
        id: "STF-004",
        firstName: "Femi",
        lastName: "Eze",
        fullName: "Dr. Femi Eze",
        position: "Counsellor",
        email: "f.eze@brightlife.health",
        phone: "0803 444 5577",
        status: "active",
        roles: ["Counsellor"],
        assignedPatients: 10,
        sessionsMonth: 35,
        rating: 4.6,
        initials: "FE",
        color: "#D98326",
        joinedDate: "15 Feb 2024",
        lastSeen: "Yesterday, 05:30 PM",
    },
    {
        id: "STF-005",
        firstName: "Rita",
        lastName: "Bello",
        fullName: "Nurse Rita Bello",
        position: "Psychiatric Nurse",
        email: "r.bello@brightlife.health",
        phone: "0803 555 6688",
        status: "active",
        roles: ["Nurse", "Medication Admin"],
        assignedPatients: 8,
        sessionsMonth: 30,
        rating: 4.5,
        initials: "RB",
        color: "#4A9E91",
        joinedDate: "20 Apr 2024",
        lastSeen: "Today, 07:45 AM",
    },
    {
        id: "STF-006",
        firstName: "Musa",
        lastName: "Sule",
        fullName: "M. Sule",
        position: "Counsellor",
        email: "m.sule@brightlife.health",
        phone: "0803 666 7799",
        status: "suspended",
        roles: ["Counsellor"],
        assignedPatients: 0,
        sessionsMonth: 12,
        rating: 3.2,
        initials: "MS",
        color: "#7A9490",
        joinedDate: "10 Jun 2024",
        lastSeen: "3 days ago",
    },
    {
        id: "STF-007",
        firstName: "Tunde",
        lastName: "Onyeka",
        fullName: "T. Onyeka",
        position: "Social Worker",
        email: "t.onyeka@brightlife.health",
        phone: "0803 777 8800",
        status: "terminated",
        roles: [],
        assignedPatients: 0,
        sessionsMonth: 0,
        rating: 3.4,
        initials: "TO",
        color: "#C94040",
        joinedDate: "05 Aug 2024",
        lastSeen: "2 weeks ago",
    },
];

const positions = [
    "Doctor",
    "Psychiatrist",
    "Psychologist",
    "Counsellor",
    "Psychiatric Nurse",
    "Nurse",
    "Social Worker",
    "Therapist",
    "Occupational Therapist",
    "Addiction Counsellor",
    "Community Health Officer",
];

const availableRoles = [
    "Admin",
    "Therapist",
    "Session Lead",
    "Psychiatrist",
    "Prescriber",
    "Nurse",
    "Medication Admin",
    "Counsellor",
    "Social Worker",
    "Viewer Only",
];

const statusChipMap: Record<string, string> = {
    active: "chip-active",
    suspended: "chip-pending",
    terminated: "chip-critical",
};
const statusLabelMap: Record<string, string> = {
    active: "Active",
    suspended: "Suspended",
    terminated: "Terminated",
};

const tabs = [
    { label: "All Staff", count: 7 },
    { label: "Active", count: 5 },
    { label: "Suspended", count: 1 },
    { label: "Terminated", count: 1 },
];

/* ─────────────────────────────────────
   ADD STAFF MODAL
───────────────────────────────────── */
function AddStaffModal({ onClose, onSuccess }: {
    onClose: () => void;
    onSuccess: (creds: { staffId: string; email: string; password: string }) => void;
}) {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        position: "",
        email: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.firstName.trim()) errs.firstName = "First name is required";
        if (!form.lastName.trim()) errs.lastName = "Last name is required";
        if (!form.position) errs.position = "Position is required";
        if (!form.email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
        if (!form.phone.trim()) errs.phone = "Phone number is required";
        return errs;
    };

    const handleSubmit = () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            onSuccess({
                staffId: `STF-${Math.floor(100 + Math.random() * 900)}`,
                email: form.email,
                password: `Bl@${Math.random().toString(36).slice(2, 10).toUpperCase()}#1`,
            });
        }, 1400);
    };

    const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
        <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{label}</label>
            <input
                className="form-input"
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: "" })); }}
                style={errors[key] ? { borderColor: "var(--danger)" } : {}}
            />
            {errors[key] && <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4, fontWeight: 600 }}>{errors[key]}</div>}
        </div>
    );

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
                {/* Header */}
                <div style={{
                    padding: "22px 28px", borderBottom: "1px solid var(--border)",
                    background: "var(--primary-xlight)",
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>
                            Add New Staff Member
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                            Fill in the details below — login credentials will be generated automatically.
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8,
                        background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {field("firstName", "First Name", "text", "e.g. Chisom")}
                        {field("lastName", "Last Name", "text", "e.g. Obi")}
                    </div>

                    {/* Position */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Position / Role</label>
                        <select
                            className="form-input"
                            value={form.position}
                            onChange={e => { setForm(p => ({ ...p, position: e.target.value })); setErrors(p => ({ ...p, position: "" })); }}
                            style={{ cursor: "pointer", ...(errors.position ? { borderColor: "var(--danger)" } : {}) }}
                        >
                            <option value="">Select a position</option>
                            {positions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {errors.position && <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4, fontWeight: 600 }}>{errors.position}</div>}
                    </div>

                    {field("email", "Work Email Address", "email", "staff@brightlife.health")}

                    {field("phone", "Phone Number", "tel", "0803 000 0000")}

                    {/* Info callout */}
                    <div style={{
                        background: "var(--primary-light)", border: "1px solid var(--primary-mid)",
                        borderRadius: 10, padding: "11px 14px",
                        display: "flex", gap: 10, alignItems: "flex-start",
                    }}>
                        <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                        <div style={{ fontSize: 12.5, color: "var(--primary-dark)", lineHeight: 1.6 }}>
                            After creating the staff member, the system will generate a <strong>Staff ID</strong> and a <strong>temporary password</strong>. Share these with the staff member so they can log in and update their password.
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: "16px 28px", borderTop: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10,
                }}>
                    <button onClick={onClose} style={{
                        padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9,
                        background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700,
                        color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif",
                    }}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            padding: "10px 24px", border: "none", borderRadius: 9,
                            background: loading ? "var(--primary-mid)" : "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                            cursor: loading ? "not-allowed" : "pointer", fontSize: 13.5, fontWeight: 700,
                            color: "#fff", fontFamily: "'Nunito', sans-serif",
                            boxShadow: "0 3px 12px rgba(44,122,110,0.28)",
                            display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.8 : 1,
                            transition: "opacity 0.15s",
                        }}
                    >
                        {loading ? (
                            <>
                                <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                                Creating…
                            </>
                        ) : "Create Staff Member"}
                    </button>
                </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

/* ─────────────────────────────────────
   CREDENTIALS MODAL (shown after creation)
───────────────────────────────────── */
function CredentialsModal({ creds, onClose }: {
    creds: { staffId: string; email: string; password: string };
    onClose: () => void;
}) {
    const [copied, setCopied] = useState<string | null>(null);
    const copy = (val: string, key: string) => {
        navigator.clipboard.writeText(val).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const CopyBtn = ({ val, k }: { val: string; k: string }) => (
        <button
            onClick={() => copy(val, k)}
            style={{
                padding: "5px 10px", border: "1.5px solid var(--border)", borderRadius: 7,
                background: copied === k ? "var(--success-light)" : "var(--card)",
                color: copied === k ? "var(--success)" : "var(--primary)",
                cursor: "pointer", fontSize: 11.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
                transition: "all 0.18s", flexShrink: 0,
            }}
        >{copied === k ? "✓ Copied" : "Copy"}</button>
    );

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)",
            backdropFilter: "blur(4px)", zIndex: 1100,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 18, width: "100%", maxWidth: 480,
                boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden",
            }}>
                {/* Success Header */}
                <div style={{
                    padding: "28px 28px 24px",
                    background: "linear-gradient(135deg, var(--success-light) 0%, var(--primary-xlight) 100%)",
                    borderBottom: "1px solid var(--border)", textAlign: "center",
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: "var(--success-light)", border: "2px solid var(--success)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 14px", fontSize: 24,
                    }}>✅</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>
                        Staff Member Created!
                    </div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                        Share the credentials below with the staff member. These are shown only once.
                    </div>
                </div>

                {/* Credentials */}
                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                        { label: "Staff ID", value: creds.staffId, mono: true },
                        { label: "Email Address", value: creds.email, mono: false },
                        { label: "Temporary Password", value: creds.password, mono: true },
                    ].map(item => (
                        <div key={item.label} style={{
                            background: "var(--surface)", border: "1px solid var(--border)",
                            borderRadius: 10, padding: "12px 14px",
                        }}>
                            <div style={{
                                fontFamily: "'Space Mono', monospace", fontSize: 9,
                                color: "var(--muted)", letterSpacing: "0.08em",
                                textTransform: "uppercase" as const, marginBottom: 6, fontWeight: 700,
                            }}>{item.label}</div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{
                    fontFamily: item.mono ? "'Space Mono', monospace" : "'Nunito', sans-serif",
                    fontSize: item.mono ? 14 : 14, fontWeight: 700, color: "var(--fg)",
                    letterSpacing: item.mono ? "0.04em" : 0,
                }}>{item.value}</span>
                                <CopyBtn val={item.value} k={item.label} />
                            </div>
                        </div>
                    ))}

                    <div style={{
                        background: "var(--warning-light)", border: "1px solid #f5c58a",
                        borderRadius: 10, padding: "11px 14px",
                        display: "flex", gap: 9, alignItems: "flex-start",
                    }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                        <div style={{ fontSize: 12, color: "var(--fg-mid)", lineHeight: 1.6 }}>
                            The staff member must log in and change their temporary password on first access. This dialog cannot be re-opened.
                        </div>
                    </div>
                </div>

                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{
                        padding: "10px 28px", border: "none", borderRadius: 9,
                        background: "var(--primary)", cursor: "pointer", fontSize: 13.5, fontWeight: 700,
                        color: "#fff", fontFamily: "'Nunito', sans-serif",
                        boxShadow: "0 3px 12px rgba(44,122,110,0.28)",
                    }}>Done</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   SUSPEND / TERMINATE / RECALL CONFIRM MODAL
───────────────────────────────────── */
function ActionConfirmModal({ staff, action, onClose }: {
    staff: typeof mockStaff[0];
    action: "suspend" | "terminate" | "recall";
    onClose: () => void;
}) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const config = {
        suspend: {
            icon: "🚫", title: "Suspend Staff Member",
            desc: `${staff.fullName} will lose access to the platform immediately. You can recall them at any time.`,
            btnLabel: "Suspend Now", btnColor: "var(--warning)", requireReason: true,
        },
        terminate: {
            icon: "⛔", title: "Terminate Employment",
            desc: `${staff.fullName} will be permanently removed from active duty. This action can be reversed by recalling the staff member.`,
            btnLabel: "Terminate", btnColor: "var(--danger)", requireReason: true,
        },
        recall: {
            icon: "♻️", title: "Recall Staff Member",
            desc: `${staff.fullName} will be reinstated and regain platform access. Previous roles may need to be re-assigned.`,
            btnLabel: "Recall & Reinstate", btnColor: "var(--success)", requireReason: false,
        },
    }[action];

    const handleAction = () => {
        if (config.requireReason && !reason.trim()) return;
        setLoading(true);
        setTimeout(() => { setLoading(false); onClose(); }, 1000);
    };

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)",
            backdropFilter: "blur(4px)", zIndex: 1200,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 16, width: "100%", maxWidth: 460,
                boxShadow: "0 24px 64px rgba(25,40,37,0.2)", overflow: "hidden",
            }}>
                <div style={{ padding: "24px 26px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{config.icon}</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
                        {config.title}
                    </div>
                    <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6 }}>{config.desc}</div>
                </div>

                <div style={{ padding: "20px 26px" }}>
                    {config.requireReason && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Reason <span style={{ color: "var(--danger)" }}>*</span></label>
                            <textarea
                                className="form-input"
                                rows={3}
                                placeholder="State the reason for this action…"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                style={{ resize: "none" }}
                            />
                            {!reason.trim() && reason !== "" && (
                                <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4, fontWeight: 600 }}>Reason is required</div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{
                    padding: "14px 26px", borderTop: "1px solid var(--border)",
                    display: "flex", gap: 10, justifyContent: "flex-end",
                }}>
                    <button onClick={onClose} style={{
                        padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 8,
                        background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700,
                        color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif",
                    }}>Cancel</button>
                    <button
                        onClick={handleAction}
                        disabled={loading || (config.requireReason && !reason.trim())}
                        style={{
                            padding: "9px 20px", border: "none", borderRadius: 8,
                            background: config.btnColor, cursor: (loading || (config.requireReason && !reason.trim())) ? "not-allowed" : "pointer",
                            fontSize: 13, fontWeight: 700, color: "#fff",
                            fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.7 : 1,
                            transition: "opacity 0.15s",
                        }}
                    >{loading ? "Processing…" : config.btnLabel}</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   ASSIGN PATIENT MODAL
───────────────────────────────────── */
function AssignPatientModal({ staff, onClose }: { staff: typeof mockStaff[0]; onClose: () => void }) {
    const patients = [
        { id: "PAT-0142", name: "Amara Okafor", diagnosis: "Major Depressive Disorder" },
        { id: "PAT-0141", name: "Chidi Nwosu", diagnosis: "Generalised Anxiety Disorder" },
        { id: "PAT-0138", name: "Emeka Afolabi", diagnosis: "Bipolar Disorder Type I" },
        { id: "PAT-0135", name: "Ngozi Eze", diagnosis: "PTSD — Complex Trauma" },
        { id: "PAT-0130", name: "Fatima Hassan", diagnosis: "OCD — Contamination Subtype" },
    ];
    const [selected, setSelected] = useState<string[]>([]);
    const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(25,40,37,0.6)",
            backdropFilter: "blur(4px)", zIndex: 1200,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 16, width: "100%", maxWidth: 520,
                boxShadow: "0 24px 64px rgba(25,40,37,0.2)", overflow: "hidden",
            }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)" }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>
                        Assign Patients to {staff.fullName}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                        Select one or more patients to assign.
                    </div>
                </div>

                <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {patients.map((p, i) => (
                        <div
                            key={p.id}
                            onClick={() => toggle(p.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "13px 20px",
                                borderBottom: i < patients.length - 1 ? "1px solid var(--border)" : "none",
                                cursor: "pointer",
                                background: selected.includes(p.id) ? "var(--primary-xlight)" : "transparent",
                                transition: "background 0.13s",
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(p.id)}
                                onChange={() => toggle(p.id)}
                                style={{ accentColor: "var(--primary)", width: 15, height: 15, flexShrink: 0 }}
                            />
                            <div style={{
                                width: 34, height: 34, borderRadius: 9,
                                background: selected.includes(p.id) ? "var(--primary)" : "var(--border)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "'Fraunces', serif", fontSize: 12, fontWeight: 700,
                                color: selected.includes(p.id) ? "#fff" : "var(--muted)", flexShrink: 0,
                                transition: "all 0.18s",
                            }}>
                                {p.name.split(" ").slice(0, 2).map(w => w[0]).join("")}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>{p.name}</div>
                                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 1 }}>{p.diagnosis}</div>
                            </div>
                            <span style={{
                                fontFamily: "'Space Mono', monospace", fontSize: 9.5,
                                color: "var(--primary)", background: "var(--primary-light)",
                                padding: "2px 8px", borderRadius: 5, fontWeight: 700,
                            }}>{p.id}</span>
                        </div>
                    ))}
                </div>

                <div style={{
                    padding: "14px 24px", borderTop: "1px solid var(--border)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
                        {selected.length} patient{selected.length !== 1 ? "s" : ""} selected
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={onClose} style={{
                            padding: "9px 16px", border: "1.5px solid var(--border)", borderRadius: 8,
                            background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700,
                            color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif",
                        }}>Cancel</button>
                        <button
                            onClick={onClose}
                            disabled={!selected.length}
                            style={{
                                padding: "9px 18px", border: "none", borderRadius: 8,
                                background: selected.length ? "var(--primary)" : "var(--border)",
                                cursor: selected.length ? "pointer" : "not-allowed",
                                fontSize: 13, fontWeight: 700, color: "#fff",
                                fontFamily: "'Nunito', sans-serif", transition: "background 0.15s",
                            }}
                        >Assign Patients</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   MANAGE ROLES MODAL
───────────────────────────────────── */
function ManageRolesModal({ staff, onClose }: { staff: typeof mockStaff[0]; onClose: () => void }) {
    const [roles, setRoles] = useState<string[]>([...staff.roles]);
    const toggle = (r: string) => setRoles(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r]);

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(25,40,37,0.6)",
            backdropFilter: "blur(4px)", zIndex: 1200,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 16, width: "100%", maxWidth: 500,
                boxShadow: "0 24px 64px rgba(25,40,37,0.2)", overflow: "hidden",
            }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)" }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>
                        Manage Roles — {staff.fullName}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                        Toggle roles to assign or revoke permissions.
                    </div>
                </div>

                <div style={{ padding: "18px 24px", display: "flex", flexWrap: "wrap" as const, gap: 10 }}>
                    {availableRoles.map(role => {
                        const active = roles.includes(role);
                        return (
                            <button
                                key={role}
                                onClick={() => toggle(role)}
                                style={{
                                    padding: "7px 14px", border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`,
                                    borderRadius: 20, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                                    background: active ? "var(--primary)" : "var(--card)",
                                    color: active ? "#fff" : "var(--muted)",
                                    fontFamily: "'Nunito', sans-serif", transition: "all 0.18s",
                                    display: "flex", alignItems: "center", gap: 6,
                                }}
                            >
                                {active && <span style={{ fontSize: 11 }}>✓</span>}
                                {role}
                            </button>
                        );
                    })}
                </div>

                {roles.length === 0 && (
                    <div style={{ padding: "0 24px 16px" }}>
                        <div style={{
                            background: "var(--warning-light)", border: "1px solid #f5c58a",
                            borderRadius: 9, padding: "10px 13px", fontSize: 12.5, color: "var(--fg-mid)",
                        }}>
                            ⚠️ Staff member will have <strong>no system access</strong> if no roles are assigned.
                        </div>
                    </div>
                )}

                <div style={{
                    padding: "14px 24px", borderTop: "1px solid var(--border)",
                    display: "flex", gap: 10, justifyContent: "flex-end",
                }}>
                    <button onClick={onClose} style={{
                        padding: "9px 16px", border: "1.5px solid var(--border)", borderRadius: 8,
                        background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700,
                        color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif",
                    }}>Cancel</button>
                    <button onClick={onClose} style={{
                        padding: "9px 20px", border: "none", borderRadius: 8,
                        background: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 700,
                        color: "#fff", fontFamily: "'Nunito', sans-serif",
                        boxShadow: "0 2px 8px rgba(44,122,110,0.22)",
                    }}>Save Roles</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   ISSUE QUERY MODAL
───────────────────────────────────── */
function IssueQueryModal({ staff, onClose }: { staff: typeof mockStaff[0]; onClose: () => void }) {
    const [form, setForm] = useState({ subject: "", message: "", severity: "low" });
    const [loading, setLoading] = useState(false);

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(25,40,37,0.6)",
            backdropFilter: "blur(4px)", zIndex: 1200,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 16, width: "100%", maxWidth: 520,
                boxShadow: "0 24px 64px rgba(25,40,37,0.2)", overflow: "hidden",
            }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--warning-light)" }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>
                        Issue Query to {staff.fullName}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                        Staff member will be notified and required to respond.
                    </div>
                </div>

                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Subject</label>
                        <input
                            className="form-input" type="text" placeholder="e.g. Missed session documentation"
                            value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Severity</label>
                        <div style={{ display: "flex", gap: 8 }}>
                            {["low", "medium", "high"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setForm(p => ({ ...p, severity: s }))}
                                    style={{
                                        flex: 1, padding: "9px", border: `1.5px solid ${form.severity === s ? (s === "high" ? "var(--danger)" : s === "medium" ? "var(--warning)" : "var(--primary)") : "var(--border)"}`,
                                        borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700,
                                        background: form.severity === s ? (s === "high" ? "var(--danger-light)" : s === "medium" ? "var(--warning-light)" : "var(--primary-light)") : "var(--card)",
                                        color: form.severity === s ? (s === "high" ? "var(--danger)" : s === "medium" ? "var(--warning)" : "var(--primary)") : "var(--muted)",
                                        fontFamily: "'Nunito', sans-serif", textTransform: "capitalize" as const,
                                        transition: "all 0.15s",
                                    }}
                                >{s}</button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Query Message</label>
                        <textarea
                            className="form-input" rows={4}
                            placeholder="Describe the query in detail…"
                            value={form.message}
                            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                            style={{ resize: "none" }}
                        />
                    </div>
                </div>

                <div style={{
                    padding: "14px 24px", borderTop: "1px solid var(--border)",
                    display: "flex", gap: 10, justifyContent: "flex-end",
                }}>
                    <button onClick={onClose} style={{
                        padding: "9px 16px", border: "1.5px solid var(--border)", borderRadius: 8,
                        background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700,
                        color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif",
                    }}>Cancel</button>
                    <button
                        onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onClose(); }, 900); }}
                        disabled={!form.subject.trim() || !form.message.trim() || loading}
                        style={{
                            padding: "9px 20px", border: "none", borderRadius: 8,
                            background: "var(--warning)", cursor: "pointer", fontSize: 13, fontWeight: 700,
                            color: "#fff", fontFamily: "'Nunito', sans-serif",
                            opacity: (!form.subject.trim() || !form.message.trim() || loading) ? 0.6 : 1,
                            transition: "opacity 0.15s",
                        }}
                    >{loading ? "Sending…" : "Send Query"}</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
type ModalType = "add" | "credentials" | "assign" | "roles" | "query" | "suspend" | "terminate" | "recall" | null;

export default function StaffPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedStaff, setSelectedStaff] = useState<typeof mockStaff[0] | null>(null);
    const [credentials, setCredentials] = useState<{ staffId: string; email: string; password: string } | null>(null);

    const openModal = (type: ModalType, staff?: typeof mockStaff[0]) => {
        setSelectedStaff(staff || null);
        setOpenMenuId(null);
        setModal(type);
    };

    const filteredStaff = mockStaff.filter(s => {
        if (activeTab === 0) return true;
        if (activeTab === 1) return s.status === "active";
        if (activeTab === 2) return s.status === "suspended";
        if (activeTab === 3) return s.status === "terminated";
        return true;
    });

    const kpis = [
        { label: "Total Staff", value: "24", trend: "↑ 3", trendSub: "this month", color: "var(--primary)" },
        { label: "Active Now", value: "19", trend: "↑ 2", trendSub: "vs last week", color: "var(--success)" },
        { label: "Suspended", value: "3", trend: "↑ 1", trendSub: "pending review", color: "var(--warning)" },
        { label: "Terminated", value: "2", trend: "—", trendSub: "this quarter", color: "var(--danger)" },
    ];

    return (
        <>
            {/* ── Modals ── */}
            {modal === "add" && (
                <AddStaffModal
                    onClose={() => setModal(null)}
                    onSuccess={creds => { setCredentials(creds); setModal("credentials"); }}
                />
            )}
            {modal === "credentials" && credentials && (
                <CredentialsModal creds={credentials} onClose={() => { setModal(null); setCredentials(null); }} />
            )}
            {modal === "assign" && selectedStaff && (
                <AssignPatientModal staff={selectedStaff} onClose={() => setModal(null)} />
            )}
            {modal === "roles" && selectedStaff && (
                <ManageRolesModal staff={selectedStaff} onClose={() => setModal(null)} />
            )}
            {modal === "query" && selectedStaff && (
                <IssueQueryModal staff={selectedStaff} onClose={() => setModal(null)} />
            )}
            {(modal === "suspend" || modal === "terminate" || modal === "recall") && selectedStaff && (
                <ActionConfirmModal staff={selectedStaff} action={modal} onClose={() => setModal(null)} />
            )}

            {/* close menus on outside click */}
            {openMenuId && (
                <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setOpenMenuId(null)} />
            )}

            {/* ── Page Header ── */}
            <div className="page-header">
                <div>
                    <div className="page-title">Staff Management</div>
                    <div className="page-subtitle">Manage clinical staff — roles, assignments, attendance & queries</div>
                </div>
                <div className="header-actions">
                    <button
                        onClick={() => openModal("add")}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 18px",
                            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                            border: "none", borderRadius: 10, color: "#fff",
                            fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                            fontFamily: "'Nunito', sans-serif",
                            boxShadow: "0 3px 12px rgba(44,122,110,0.28)",
                        }}
                    >
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                        Add Staff Member
                    </button>
                </div>
            </div>

            {/* ── KPI Mini Row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
                {kpis.map(k => (
                    <div key={k.label} style={{
                        background: "var(--card)", border: "1px solid var(--border)",
                        borderRadius: 12, padding: "16px 18px",
                    }}>
                        <div style={{
                            fontFamily: "'Space Mono', monospace", fontSize: 9,
                            color: "var(--muted)", letterSpacing: "0.1em",
                            textTransform: "uppercase" as const, marginBottom: 8, fontWeight: 700,
                        }}>{k.label}</div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, color: "var(--fg)", lineHeight: 1 }}>
                            {k.value}
                        </div>
                        <div style={{ fontSize: 12, marginTop: 6, fontWeight: 700, color: k.color }}>
                            {k.trend} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 11 }}>{k.trendSub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Filter Tabs ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                {tabs.map((tab, i) => (
                    <button
                        key={tab.label}
                        className={`filter-tab${activeTab === i ? " active" : ""}`}
                        onClick={() => setActiveTab(i)}
                    >
                        {tab.label}
                        <span style={{ marginLeft: 6, fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: 0.75 }}>
              ({tab.count})
            </span>
                    </button>
                ))}

                <div style={{ marginLeft: "auto", position: "relative" }}>
          <span style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              color: "var(--muted)", fontSize: 13, pointerEvents: "none",
          }}>🔍</span>
                    <input
                        type="text" placeholder="Search staff…"
                        style={{
                            border: "1.5px solid var(--border)", borderRadius: 8,
                            padding: "7px 14px 7px 34px", fontFamily: "'Nunito', sans-serif",
                            fontSize: 13, color: "var(--fg)", background: "var(--card)",
                            outline: "none", width: 200, transition: "border-color 0.18s",
                        }}
                        onFocus={e => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={e => (e.target.style.borderColor = "var(--border)")}
                    />
                </div>
            </div>

            {/* ── Staff Table ── */}
            <div className="card">
                <table className="data-table">
                    <thead>
                    <tr>
                        <th style={{ width: 48 }}>S/N</th>
                        <th>Staff Member</th>
                        <th>Position</th>
                        <th>Roles</th>
                        <th>Assigned Patients</th>
                        <th>Sessions (Mo.)</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" as const }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredStaff.map((s, idx) => (
                        <tr key={s.id}>
                            <td>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--muted)" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                            </td>
                            <td>
                                <Link href={`/staff/${s.id}`} style={{ textDecoration: "none" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                            background: s.status !== "active"
                                                ? "#e5e5e5"
                                                : `linear-gradient(135deg, ${s.color} 0%, ${s.color}99 100%)`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 700,
                                            color: s.status !== "active" ? "#999" : "#fff",
                                            position: "relative",
                                            filter: s.status === "terminated" ? "grayscale(1)" : "none",
                                        }}>
                                            {s.initials}
                                            {s.status === "suspended" && (
                                                <span style={{
                                                    position: "absolute", bottom: -2, right: -2,
                                                    width: 12, height: 12, borderRadius: "50%",
                                                    background: "var(--warning)", border: "2px solid var(--card)",
                                                }} />
                                            )}
                                            {s.status === "terminated" && (
                                                <span style={{
                                                    position: "absolute", bottom: -2, right: -2,
                                                    width: 12, height: 12, borderRadius: "50%",
                                                    background: "var(--danger)", border: "2px solid var(--card)",
                                                }} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="patient-name" style={{ color: s.status !== "active" ? "var(--muted)" : "var(--fg)" }}>
                                                {s.fullName}
                                            </div>
                                            <div style={{
                                                fontFamily: "'Space Mono', monospace", fontSize: 9,
                                                color: "var(--primary)", background: "var(--primary-light)",
                                                padding: "1px 7px", borderRadius: 4, fontWeight: 700,
                                                display: "inline-block", marginTop: 2,
                                            }}>{s.id}</div>
                                        </div>
                                    </div>
                                </Link>
                            </td>
                            <td><span className="td-text">{s.position}</span></td>
                            <td>
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, maxWidth: 200 }}>
                                    {s.roles.length === 0
                                        ? <span style={{ fontSize: 11.5, color: "var(--muted)", fontStyle: "italic" }}>No roles</span>
                                        : s.roles.slice(0, 2).map(r => (
                                            <span key={r} style={{
                                                fontSize: 10.5, fontWeight: 700, padding: "2px 8px",
                                                borderRadius: 20, background: "var(--purple-light)",
                                                color: "var(--purple)", fontFamily: "'Space Mono', monospace",
                                            }}>{r}</span>
                                        ))
                                    }
                                    {s.roles.length > 2 && (
                                        <span style={{
                                            fontSize: 10.5, fontWeight: 700, padding: "2px 8px",
                                            borderRadius: 20, background: "var(--border)", color: "var(--muted)",
                                            fontFamily: "'Space Mono', monospace",
                                        }}>+{s.roles.length - 2}</span>
                                    )}
                                </div>
                            </td>
                            <td>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: "var(--fg)" }}>
                    {s.assignedPatients}
                  </span>
                                <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 3 }}>pts</span>
                            </td>
                            <td>
                                <span className="td-mono">{s.sessionsMonth}</span>
                            </td>
                            <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <span style={{ fontSize: 13 }}>⭐</span>
                                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--fg)" }}>
                      {s.rating}
                    </span>
                                </div>
                            </td>
                            <td>
                  <span className={`chip ${statusChipMap[s.status]}`}>
                    {statusLabelMap[s.status]}
                  </span>
                            </td>
                            <td style={{ textAlign: "right" as const }}>
                                <div className="dots-menu-wrap" style={{ display: "inline-block", position: "relative", zIndex: openMenuId === s.id ? 100 : "auto" }}>
                                    <button className="dots-btn" onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === s.id ? null : s.id); }}>···</button>
                                    <div className={`dots-menu${openMenuId === s.id ? " open" : ""}`} style={{ minWidth: 190 }}>
                                        <Link href={`/staff/${s.id}`} style={{ textDecoration: "none" }}>
                                            <div className="dots-menu-item"><span className="dots-menu-icon">👤</span>View Profile</div>
                                        </Link>
                                        <div className="dots-menu-item" onClick={() => openModal("assign", s)}>
                                            <span className="dots-menu-icon">🧑‍⚕️</span>Assign Patients
                                        </div>
                                        <div className="dots-menu-item" onClick={() => openModal("roles", s)}>
                                            <span className="dots-menu-icon">🔑</span>Manage Roles
                                        </div>
                                        <div className="dots-menu-item" onClick={() => openModal("query", s)}>
                                            <span className="dots-menu-icon">📝</span>Issue a Query
                                        </div>
                                        <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                                        {s.status === "active" && (
                                            <div className="dots-menu-item danger" onClick={() => openModal("suspend", s)}>
                                                <span className="dots-menu-icon">🚫</span>Suspend
                                            </div>
                                        )}
                                        {s.status === "active" && (
                                            <div className="dots-menu-item danger" onClick={() => openModal("terminate", s)}>
                                                <span className="dots-menu-icon">⛔</span>Terminate
                                            </div>
                                        )}
                                        {(s.status === "suspended" || s.status === "terminated") && (
                                            <div className="dots-menu-item" style={{ color: "var(--success)" }} onClick={() => openModal("recall", s)}>
                                                <span className="dots-menu-icon">♻️</span>Recall
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                    <div style={{ marginLeft: "auto" }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>
              Showing 1–{filteredStaff.length} of {filteredStaff.length} members
            </span>
                    </div>
                </div>
            </div>
        </>
    );
}