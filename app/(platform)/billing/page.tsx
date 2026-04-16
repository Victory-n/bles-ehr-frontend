"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
type CPTStatus = "active" | "inactive";
type RecordStatus = "draft" | "ready" | "submitted" | "accepted" | "rejected" | "paid" | "partial";
type PaymentMethod = "cash" | "card" | "check" | "bank_transfer" | "insurance";

type ModalType =
    | "add_cpt"
    | "edit_cpt"
    | "create_record"
    | "record_payment"
    | "mark_ready"
    | "submit_claim"
    | "accept_claim"
    | "reject_claim"
    | "mark_paid"
    | "mark_partial"
    | "view_record"
    | null;

interface CPTCode {
    code: string;
    description: string;
    category: string;
    defaultFee: number;
    status: CPTStatus;
    createdAt: string;
    usageCount: number;
}

interface BillingRecord {
    id: string;
    patientId: string;
    patientName: string;
    patientInitials: string;
    patientColor: string;
    cptCode: string;
    cptDescription: string;
    dateOfService: string;
    amount: number;
    paidAmount: number;
    insurancePayer: string;
    status: RecordStatus;
    createdAt: string;
    submittedAt: string | null;
    denialReason: string | null;
    createdBy: string;
}

interface Payment {
    id: string;
    patientId: string;
    patientName: string;
    patientInitials: string;
    patientColor: string;
    amount: number;
    method: PaymentMethod;
    referenceNote: string;
    recordedBy: string;
    date: string;
}

/* ─────────────────────────────────────
   MOCK DATA
───────────────────────────────────── */
const MOCK_CPT_CODES: CPTCode[] = [
    { code: "90837", description: "Psychotherapy, 60 min with patient", category: "Psychotherapy", defaultFee: 180000, status: "active", createdAt: "01 Jan 2025", usageCount: 148 },
    { code: "90834", description: "Psychotherapy, 45 min with patient", category: "Psychotherapy", defaultFee: 145000, status: "active", createdAt: "01 Jan 2025", usageCount: 93 },
    { code: "90832", description: "Psychotherapy, 30 min with patient", category: "Psychotherapy", defaultFee: 110000, status: "active", createdAt: "01 Jan 2025", usageCount: 57 },
    { code: "90847", description: "Family psychotherapy with patient present", category: "Family Therapy", defaultFee: 200000, status: "active", createdAt: "01 Jan 2025", usageCount: 34 },
    { code: "90853", description: "Group psychotherapy", category: "Group Therapy", defaultFee: 90000, status: "active", createdAt: "15 Jan 2025", usageCount: 76 },
    { code: "90801", description: "Psychiatric diagnostic evaluation", category: "Assessment", defaultFee: 350000, status: "active", createdAt: "01 Jan 2025", usageCount: 29 },
    { code: "90839", description: "Psychotherapy for crisis, first 60 min", category: "Crisis", defaultFee: 250000, status: "active", createdAt: "01 Jan 2025", usageCount: 11 },
    { code: "99213", description: "Office visit, established patient, moderate complexity", category: "Office Visit", defaultFee: 95000, status: "inactive", createdAt: "20 Feb 2025", usageCount: 8 },
];

const MOCK_BILLING_RECORDS: BillingRecord[] = [
    { id: "BLR-0001", patientId: "PAT-0142", patientName: "Amara Okafor", patientInitials: "AO", patientColor: "#2C7A6E", cptCode: "90837", cptDescription: "Psychotherapy, 60 min", dateOfService: "10 Apr 2026", amount: 180000, paidAmount: 0, insurancePayer: "NHIS", status: "draft", createdAt: "10 Apr 2026", submittedAt: null, denialReason: null, createdBy: "Dr. B. Adeyemi" },
    { id: "BLR-0002", patientId: "PAT-0141", patientName: "Chidi Nwosu", patientInitials: "CN", patientColor: "#6B5ED4", cptCode: "90801", cptDescription: "Psychiatric Evaluation", dateOfService: "12 Apr 2026", amount: 350000, paidAmount: 0, insurancePayer: "AXA Mansard", status: "ready", createdAt: "12 Apr 2026", submittedAt: null, denialReason: null, createdBy: "Dr. A. Kolade" },
    { id: "BLR-0003", patientId: "PAT-0138", patientName: "Emeka Afolabi", patientInitials: "EA", patientColor: "#C94040", cptCode: "90837", cptDescription: "Psychotherapy, 60 min", dateOfService: "09 Apr 2026", amount: 180000, paidAmount: 0, insurancePayer: "NHIS", status: "submitted", createdAt: "09 Apr 2026", submittedAt: "11 Apr 2026", denialReason: null, createdBy: "Dr. A. Kolade" },
    { id: "BLR-0004", patientId: "PAT-0135", patientName: "Ngozi Eze", patientInitials: "NE", patientColor: "#27A76A", cptCode: "90847", cptDescription: "Family Therapy with patient", dateOfService: "11 Apr 2026", amount: 200000, paidAmount: 200000, insurancePayer: "Hygeia HMO", status: "paid", createdAt: "11 Apr 2026", submittedAt: "12 Apr 2026", denialReason: null, createdBy: "Dr. C. Obi" },
    { id: "BLR-0005", patientId: "PAT-0130", patientName: "Fatima Hassan", patientInitials: "FH", patientColor: "#D98326", cptCode: "90834", cptDescription: "Psychotherapy, 45 min", dateOfService: "08 Apr 2026", amount: 145000, paidAmount: 80000, insurancePayer: "Reliance HMO", status: "partial", createdAt: "08 Apr 2026", submittedAt: "10 Apr 2026", denialReason: null, createdBy: "Dr. B. Adeyemi" },
    { id: "BLR-0006", patientId: "PAT-0128", patientName: "Kunle Balogun", patientInitials: "KB", patientColor: "#7A9490", cptCode: "90853", cptDescription: "Group Psychotherapy", dateOfService: "05 Apr 2026", amount: 90000, paidAmount: 0, insurancePayer: "NHIS", status: "rejected", createdAt: "05 Apr 2026", submittedAt: "07 Apr 2026", denialReason: "Service not covered under current plan. Pre-authorisation required for group therapy.", createdBy: "Dr. F. Eze" },
    { id: "BLR-0007", patientId: "PAT-0142", patientName: "Amara Okafor", patientInitials: "AO", patientColor: "#2C7A6E", cptCode: "90832", cptDescription: "Psychotherapy, 30 min", dateOfService: "03 Apr 2026", amount: 110000, paidAmount: 110000, insurancePayer: "NHIS", status: "paid", createdAt: "03 Apr 2026", submittedAt: "05 Apr 2026", denialReason: null, createdBy: "Dr. B. Adeyemi" },
    { id: "BLR-0008", patientId: "PAT-0135", patientName: "Ngozi Eze", patientInitials: "NE", patientColor: "#27A76A", cptCode: "90839", cptDescription: "Psychotherapy for Crisis", dateOfService: "01 Apr 2026", amount: 250000, paidAmount: 0, insurancePayer: "Self-Pay", status: "accepted", createdAt: "01 Apr 2026", submittedAt: "03 Apr 2026", denialReason: null, createdBy: "Dr. C. Obi" },
];

const MOCK_PAYMENTS: Payment[] = [
    { id: "PAY-0001", patientId: "PAT-0135", patientName: "Ngozi Eze", patientInitials: "NE", patientColor: "#27A76A", amount: 200000, method: "bank_transfer", referenceNote: "Transfer ref: TRF240411-NGZ", recordedBy: "Admin", date: "12 Apr 2026" },
    { id: "PAY-0002", patientId: "PAT-0130", patientName: "Fatima Hassan", patientInitials: "FH", patientColor: "#D98326", amount: 80000, method: "card", referenceNote: "POS terminal — partial payment", recordedBy: "Nurse R. Bello", date: "11 Apr 2026" },
    { id: "PAY-0003", patientId: "PAT-0142", patientName: "Amara Okafor", patientInitials: "AO", patientColor: "#2C7A6E", amount: 110000, method: "cash", referenceNote: "Cash received at front desk", recordedBy: "Admin", date: "05 Apr 2026" },
    { id: "PAY-0004", patientId: "PAT-0138", patientName: "Emeka Afolabi", patientInitials: "EA", patientColor: "#C94040", amount: 180000, method: "insurance", referenceNote: "NHIS claim #NHI-2026-0382", recordedBy: "Dr. A. Kolade", date: "02 Apr 2026" },
    { id: "PAY-0005", patientId: "PAT-0141", patientName: "Chidi Nwosu", patientInitials: "CN", patientColor: "#6B5ED4", amount: 350000, method: "check", referenceNote: "Cheque no. 00814 — First Bank", recordedBy: "Admin", date: "30 Mar 2026" },
];

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const formatNaira = (kobo: number) => `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const recordStatusConfig: Record<RecordStatus, { label: string; chip: string; color: string; icon: string }> = {
    draft:     { label: "Draft",     chip: "chip-pending",  color: "var(--warning)", icon: "✏️" },
    ready:     { label: "Ready",     chip: "chip-progress", color: "var(--purple)",  icon: "📋" },
    submitted: { label: "Submitted", chip: "chip-inactive", color: "#888",           icon: "📤" },
    accepted:  { label: "Accepted",  chip: "chip-active",   color: "var(--success)", icon: "✅" },
    rejected:  { label: "Rejected",  chip: "chip-critical", color: "var(--danger)",  icon: "❌" },
    paid:      { label: "Paid",      chip: "chip-active",   color: "var(--success)", icon: "💰" },
    partial:   { label: "Partial",   chip: "chip-pending",  color: "var(--warning)", icon: "⚡" },
};

const paymentMethodIcon: Record<PaymentMethod, string> = {
    cash: "💵", card: "💳", check: "📄", bank_transfer: "🏦", insurance: "🏥",
};
const paymentMethodLabel: Record<PaymentMethod, string> = {
    cash: "Cash", card: "Card (POS)", check: "Cheque", bank_transfer: "Bank Transfer", insurance: "Insurance",
};

const cptCategories = ["Psychotherapy", "Family Therapy", "Group Therapy", "Assessment", "Crisis", "Office Visit", "Medication Management", "Other"];
const insurancePayers = ["NHIS", "AXA Mansard", "Hygeia HMO", "Reliance HMO", "Leadway Assurance", "Custodian Life", "Self-Pay", "Other"];

/* ─────────────────────────────────────
   ADD CPT CODE MODAL
───────────────────────────────────── */
function AddCPTCodeModal({ onClose, onSave }: { onClose: () => void; onSave: (code: CPTCode) => void }) {
    const [form, setForm] = useState({ code: "", description: "", category: "", defaultFee: "", status: "active" as CPTStatus });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.code.trim()) e.code = "CPT code is required";
        else if (!/^\d{4,5}[A-Za-z]?$/.test(form.code.trim())) e.code = "Enter a valid CPT code (e.g. 90837)";
        if (!form.description.trim()) e.description = "Description is required";
        if (!form.category) e.category = "Category is required";
        if (!form.defaultFee) e.defaultFee = "Default fee is required";
        else if (isNaN(Number(form.defaultFee)) || Number(form.defaultFee) <= 0) e.defaultFee = "Enter a valid fee amount";
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            onSave({
                code: form.code.trim().toUpperCase(),
                description: form.description.trim(),
                category: form.category,
                defaultFee: Math.round(Number(form.defaultFee) * 100),
                status: form.status,
                createdAt: "14 Apr 2026",
                usageCount: 0,
            });
        }, 900);
    };

    const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
        <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{label}</label>
            <input
                className="form-input"
                type={type}
                placeholder={placeholder}
                value={form[key] as string}
                onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: "" })); }}
                style={errors[key] ? { borderColor: "var(--danger)" } : {}}
            />
            {errors[key] && <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4, fontWeight: 600 }}>{errors[key]}</div>}
        </div>
    );

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 540, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>Add New CPT Code</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Create a new procedure code for billing records</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Code + Category row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {field("code", "CPT Code", "text", "e.g. 90837")}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Category</label>
                            <select className="form-input" value={form.category}
                                    onChange={e => { setForm(p => ({ ...p, category: e.target.value })); setErrors(p => ({ ...p, category: "" })); }}
                                    style={{ cursor: "pointer", ...(errors.category ? { borderColor: "var(--danger)" } : {}) }}>
                                <option value="">Select category</option>
                                {cptCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.category && <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4, fontWeight: 600 }}>{errors.category}</div>}
                        </div>
                    </div>

                    {field("description", "Service Description", "text", "e.g. Psychotherapy, 60 min with patient")}

                    {/* Fee + Status row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Default Fee (₦)</label>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14, fontWeight: 700 }}>₦</span>
                                <input
                                    className="form-input"
                                    type="number"
                                    placeholder="0.00"
                                    value={form.defaultFee}
                                    onChange={e => { setForm(p => ({ ...p, defaultFee: e.target.value })); setErrors(p => ({ ...p, defaultFee: "" })); }}
                                    style={{ paddingLeft: 28, ...(errors.defaultFee ? { borderColor: "var(--danger)" } : {}) }}
                                />
                            </div>
                            {errors.defaultFee && <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4, fontWeight: 600 }}>{errors.defaultFee}</div>}
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Status</label>
                            <select className="form-input" value={form.status}
                                    onChange={e => setForm(p => ({ ...p, status: e.target.value as CPTStatus }))}
                                    style={{ cursor: "pointer" }}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Info callout */}
                    <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary-mid)", borderRadius: 10, padding: "11px 14px", display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 15, flexShrink: 0 }}>ℹ️</span>
                        <div style={{ fontSize: 12.5, color: "var(--primary-dark)", lineHeight: 1.6 }}>
                            CPT codes are used when creating billing records for patient services. The default fee can be overridden on individual billing records. Ensure the code matches the official AMA CPT codebook.
                        </div>
                    </div>
                </div>

                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: saving ? "var(--primary-mid)" : "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", cursor: saving ? "not-allowed" : "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)", opacity: saving ? 0.8 : 1 }}>
                        {saving ? "Saving…" : "Save CPT Code"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   EDIT CPT CODE MODAL
───────────────────────────────────── */
function EditCPTCodeModal({ code, onClose, onSave }: { code: CPTCode; onClose: () => void; onSave: (updated: CPTCode) => void }) {
    const [form, setForm] = useState({
        description: code.description,
        category: code.category,
        defaultFee: String(code.defaultFee / 100),
        status: code.status,
    });
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            onSave({ ...code, description: form.description, category: form.category, defaultFee: Math.round(Number(form.defaultFee) * 100), status: form.status });
        }, 800);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 520, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>Edit CPT Code</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "2px 10px", borderRadius: 6 }}>{code.code}</span>
                            <span style={{ fontSize: 12, color: "var(--muted)" }}>Code cannot be changed after creation</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Service Description</label>
                        <input className="form-input" type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Category</label>
                            <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ cursor: "pointer" }}>
                                {cptCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Default Fee (₦)</label>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14, fontWeight: 700 }}>₦</span>
                                <input className="form-input" type="number" value={form.defaultFee} onChange={e => setForm(p => ({ ...p, defaultFee: e.target.value }))} style={{ paddingLeft: 28 }} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Status</label>
                        <div style={{ display: "flex", gap: 10 }}>
                            {(["active", "inactive"] as CPTStatus[]).map(s => (
                                <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))} style={{ flex: 1, padding: "9px 12px", border: `1.5px solid ${form.status === s ? (s === "active" ? "var(--success)" : "var(--danger)") : "var(--border)"}`, borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, background: form.status === s ? (s === "active" ? "var(--success-light)" : "var(--danger-light)") : "var(--card)", color: form.status === s ? (s === "active" ? "var(--success)" : "var(--danger)") : "var(--muted)", fontFamily: "'Nunito', sans-serif", textTransform: "capitalize", transition: "all 0.15s" }}>
                                    {s === "active" ? "✅ Active" : "⛔ Inactive"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {form.status === "inactive" && (
                        <div style={{ background: "var(--warning-light)", border: "1px solid #f5c58a", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "var(--fg-mid)", lineHeight: 1.6 }}>
                            ⚠️ Inactive CPT codes cannot be selected when creating new billing records, but existing records using this code are unaffected.
                        </div>
                    )}
                </div>

                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: "var(--primary)", cursor: saving ? "not-allowed" : "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: saving ? 0.8 : 1 }}>
                        {saving ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   CREATE BILLING RECORD MODAL
───────────────────────────────────── */
function CreateBillingRecordModal({ cptCodes, onClose, onSave }: { cptCodes: CPTCode[]; onClose: () => void; onSave: () => void }) {
    const PATIENTS_LIST = [
        { id: "PAT-0142", name: "Amara Okafor", initials: "AO", color: "#2C7A6E" },
        { id: "PAT-0141", name: "Chidi Nwosu", initials: "CN", color: "#6B5ED4" },
        { id: "PAT-0138", name: "Emeka Afolabi", initials: "EA", color: "#C94040" },
        { id: "PAT-0135", name: "Ngozi Eze", initials: "NE", color: "#27A76A" },
        { id: "PAT-0130", name: "Fatima Hassan", initials: "FH", color: "#D98326" },
        { id: "PAT-0128", name: "Kunle Balogun", initials: "KB", color: "#7A9490" },
    ];

    const [form, setForm] = useState({ patientId: "", cptCode: "", dateOfService: "", customFee: "", insurancePayer: "", notes: "" });
    const [saving, setSaving] = useState(false);

    const selectedCPT = cptCodes.find(c => c.code === form.cptCode);
    const effectiveFee = form.customFee ? Number(form.customFee) * 100 : selectedCPT?.defaultFee;

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); onSave(); }, 900);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 580, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>Create Billing Record</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Record starts as a draft — complete & submit to payer</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Patient + CPT */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Patient</label>
                            <select className="form-input" value={form.patientId} onChange={e => setForm(p => ({ ...p, patientId: e.target.value }))} style={{ cursor: "pointer" }}>
                                <option value="">Select patient</option>
                                {PATIENTS_LIST.map(p => <option key={p.id} value={p.id}>{p.name} — {p.id}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">CPT Code</label>
                            <select className="form-input" value={form.cptCode} onChange={e => setForm(p => ({ ...p, cptCode: e.target.value, customFee: "" }))} style={{ cursor: "pointer" }}>
                                <option value="">Select CPT code</option>
                                {cptCodes.filter(c => c.status === "active").map(c => (
                                    <option key={c.code} value={c.code}>{c.code} — {c.description}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* CPT preview */}
                    {selectedCPT && (
                        <div style={{ background: "var(--primary-xlight)", border: "1px solid var(--primary-light)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>Selected code</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>{selectedCPT.code} — {selectedCPT.description}</div>
                                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{selectedCPT.category}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 11, color: "var(--muted)" }}>Default fee</div>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--primary)" }}>{formatNaira(selectedCPT.defaultFee)}</div>
                            </div>
                        </div>
                    )}

                    {/* Date + Custom fee */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Date of Service</label>
                            <input className="form-input" type="date" value={form.dateOfService} onChange={e => setForm(p => ({ ...p, dateOfService: e.target.value }))} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Custom Fee (₦) <span style={{ fontWeight: 400, color: "var(--muted)" }}>(overrides default)</span></label>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14, fontWeight: 700 }}>₦</span>
                                <input className="form-input" type="number" placeholder="Leave blank for default" value={form.customFee} onChange={e => setForm(p => ({ ...p, customFee: e.target.value }))} style={{ paddingLeft: 28 }} />
                            </div>
                        </div>
                    </div>

                    {/* Insurance payer */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Insurance Payer / Billing To</label>
                        <select className="form-input" value={form.insurancePayer} onChange={e => setForm(p => ({ ...p, insurancePayer: e.target.value }))} style={{ cursor: "pointer" }}>
                            <option value="">Select payer</option>
                            {insurancePayers.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* Fee summary */}
                    {effectiveFee !== undefined && (
                        <div style={{ background: "var(--success-light)", border: "1px solid var(--success)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-mid)" }}>Total amount to be billed:</span>
                            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "var(--success)" }}>{formatNaira(effectiveFee)}</span>
                        </div>
                    )}
                </div>

                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving || !form.patientId || !form.cptCode} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: (!form.patientId || !form.cptCode) ? "var(--border)" : "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", cursor: (!form.patientId || !form.cptCode) ? "not-allowed" : "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: saving ? 0.8 : 1, boxShadow: "0 3px 12px rgba(44,122,110,0.28)" }}>
                        {saving ? "Creating…" : "Create Draft Record"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   RECORD PAYMENT MODAL
───────────────────────────────────── */
function RecordPaymentModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
    const PATIENTS_LIST = [
        { id: "PAT-0142", name: "Amara Okafor" }, { id: "PAT-0141", name: "Chidi Nwosu" },
        { id: "PAT-0138", name: "Emeka Afolabi" }, { id: "PAT-0135", name: "Ngozi Eze" },
        { id: "PAT-0130", name: "Fatima Hassan" }, { id: "PAT-0128", name: "Kunle Balogun" },
    ];
    const [form, setForm] = useState({ patientId: "", amount: "", method: "cash" as PaymentMethod, referenceNote: "", date: "" });
    const [saving, setSaving] = useState(false);

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 500, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--success-light)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>Record Payment</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Log a patient payment — cash, card, insurance, etc.</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Patient</label>
                        <select className="form-input" value={form.patientId} onChange={e => setForm(p => ({ ...p, patientId: e.target.value }))} style={{ cursor: "pointer" }}>
                            <option value="">Select patient</option>
                            {PATIENTS_LIST.map(p => <option key={p.id} value={p.id}>{p.name} — {p.id}</option>)}
                        </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Amount (₦)</label>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14, fontWeight: 700 }}>₦</span>
                                <input className="form-input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={{ paddingLeft: 28 }} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Date</label>
                            <input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                    </div>

                    {/* Payment method */}
                    <div>
                        <label className="form-label">Payment Method</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                            {(Object.keys(paymentMethodIcon) as PaymentMethod[]).map(m => (
                                <button key={m} onClick={() => setForm(p => ({ ...p, method: m }))} style={{ padding: "10px 8px", border: `1.5px solid ${form.method === m ? "var(--primary)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", fontSize: 11, fontWeight: 700, background: form.method === m ? "var(--primary-light)" : "var(--card)", color: form.method === m ? "var(--primary)" : "var(--muted)", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                    <span style={{ fontSize: 18 }}>{paymentMethodIcon[m]}</span>
                                    <span>{paymentMethodLabel[m]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Reference / Note <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></label>
                        <input className="form-input" type="text" placeholder="e.g. Transfer ref: TRF240411-NGZ" value={form.referenceNote} onChange={e => setForm(p => ({ ...p, referenceNote: e.target.value }))} />
                    </div>
                </div>

                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button
                        onClick={() => { setSaving(true); setTimeout(() => { setSaving(false); onSave(); }, 800); }}
                        disabled={saving || !form.patientId || !form.amount}
                        style={{ padding: "10px 22px", border: "none", borderRadius: 9, background: (!form.patientId || !form.amount) ? "var(--border)" : "var(--success)", cursor: (!form.patientId || !form.amount) ? "not-allowed" : "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: saving ? 0.8 : 1 }}>
                        {saving ? "Recording…" : "Record Payment"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   STATUS ACTION MODAL (Reject / Mark Paid / etc.)
───────────────────────────────────── */
function StatusActionModal({ record, action, onClose, onConfirm }: {
    record: BillingRecord;
    action: "mark_ready" | "submit_claim" | "accept_claim" | "reject_claim" | "mark_paid" | "mark_partial";
    onClose: () => void;
    onConfirm: () => void;
}) {
    const [reason, setReason] = useState("");
    const [partialAmount, setPartialAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const config = {
        mark_ready:   { icon: "📋", title: "Mark as Ready",          desc: "This claim is ready to be submitted to the payer.", btnLabel: "Mark Ready",       btnColor: "var(--purple)",  requireReason: false, requireAmount: false },
        submit_claim: { icon: "📤", title: "Submit Claim to Payer",   desc: `Submit this claim to ${record.insurancePayer} for processing.`, btnLabel: "Submit Claim",    btnColor: "var(--primary)", requireReason: false, requireAmount: false },
        accept_claim: { icon: "✅", title: "Mark Claim as Accepted",  desc: "The payer has accepted this claim.", btnLabel: "Mark Accepted",    btnColor: "var(--success)", requireReason: false, requireAmount: false },
        reject_claim: { icon: "❌", title: "Mark Claim as Rejected",  desc: "The payer has rejected this claim. Record the denial reason.", btnLabel: "Mark Rejected",    btnColor: "var(--danger)",  requireReason: true,  requireAmount: false },
        mark_paid:    { icon: "💰", title: "Mark as Fully Paid",      desc: "This claim has been fully paid by the payer.", btnLabel: "Mark as Paid",     btnColor: "var(--success)", requireReason: false, requireAmount: false },
        mark_partial: { icon: "⚡", title: "Mark as Partially Paid",  desc: "Record the amount partially paid by the payer.", btnLabel: "Mark Partial",     btnColor: "var(--warning)", requireReason: false, requireAmount: true  },
    }[action];

    const canConfirm = (!config.requireReason || reason.trim()) && (!config.requireAmount || (partialAmount && Number(partialAmount) > 0));

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 460, boxShadow: "0 24px 64px rgba(25,40,37,0.2)", overflow: "hidden" }}>
                <div style={{ padding: "24px 26px" }}>
                    <div style={{ fontSize: 30, marginBottom: 10 }}>{config.icon}</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>{config.title}</div>
                    <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>{config.desc}</div>

                    {/* Record summary */}
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Claim</div>
                        <div style={{ fontWeight: 700, color: "var(--fg)", fontSize: 13.5 }}>{record.id} — {record.patientName}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{record.cptCode} · {record.cptDescription} · {formatNaira(record.amount)}</div>
                    </div>

                    {config.requireReason && (
                        <div className="form-group" style={{ marginBottom: 8 }}>
                            <label className="form-label">Denial Reason <span style={{ color: "var(--danger)" }}>*</span></label>
                            <textarea className="form-input" rows={3} placeholder="State the payer's denial reason…" value={reason} onChange={e => setReason(e.target.value)} style={{ resize: "none" }} />
                        </div>
                    )}
                    {config.requireAmount && (
                        <div className="form-group" style={{ marginBottom: 8 }}>
                            <label className="form-label">Amount Paid (₦) <span style={{ color: "var(--danger)" }}>*</span></label>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 14, fontWeight: 700 }}>₦</span>
                                <input className="form-input" type="number" placeholder="0.00" value={partialAmount} onChange={e => setPartialAmount(e.target.value)} style={{ paddingLeft: 28 }} />
                            </div>
                            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>Total billed: {formatNaira(record.amount)}</div>
                        </div>
                    )}
                </div>

                <div style={{ padding: "14px 26px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button
                        onClick={() => { if (!canConfirm) return; setLoading(true); setTimeout(() => { setLoading(false); onConfirm(); }, 800); }}
                        disabled={!canConfirm || loading}
                        style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: canConfirm ? config.btnColor : "var(--border)", cursor: canConfirm ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Processing…" : config.btnLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   STATUS PIPELINE VISUAL
───────────────────────────────────── */
function StatusPipeline({ current }: { current: RecordStatus }) {
    const steps: RecordStatus[] = ["draft", "ready", "submitted", "accepted", "paid"];
    const isTerminal = current === "rejected";
    const currentIdx = steps.indexOf(current);

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "14px 20px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            {steps.map((step, i) => {
                const isDone = !isTerminal && (currentIdx > i || current === step);
                const isActive = current === step;
                const cfg = recordStatusConfig[step];
                return (
                    <React.Fragment key={step}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: isDone ? cfg.color : "var(--border)", border: `2px solid ${isDone ? cfg.color : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "all 0.3s" }}>
                                {isDone ? <span style={{ color: "#fff" }}>✓</span> : <span style={{ color: "var(--muted)", fontFamily: "'Space Mono', monospace", fontSize: 9 }}>{i + 1}</span>}
                            </div>
                            <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 400, color: isDone ? cfg.color : "var(--muted)", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{cfg.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: !isTerminal && currentIdx > i ? "var(--success)" : "var(--border)", margin: "0 6px", marginBottom: 22, transition: "background 0.3s" }} />
                        )}
                    </React.Fragment>
                );
            })}
            {isTerminal && (
                <>
                    <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 8px 22px" }} />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                            <span style={{ color: "#fff" }}>✕</span>
                        </div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--danger)", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.04em" }}>Rejected</span>
                    </div>
                </>
            )}
        </div>
    );
}

/* ─────────────────────────────────────
   VIEW BILLING RECORD MODAL
───────────────────────────────────── */
function ViewRecordModal({ record, onClose, onAction }: {
    record: BillingRecord;
    onClose: () => void;
    onAction: (action: "mark_ready" | "submit_claim" | "accept_claim" | "reject_claim" | "mark_paid" | "mark_partial") => void;
}) {
    const cfg = recordStatusConfig[record.status];
    const nextActions: Array<{ action: "mark_ready" | "submit_claim" | "accept_claim" | "reject_claim" | "mark_paid" | "mark_partial"; label: string; color: string }> = [];

    if (record.status === "draft") nextActions.push({ action: "mark_ready", label: "Mark as Ready", color: "var(--purple)" });
    if (record.status === "ready") nextActions.push({ action: "submit_claim", label: "Submit to Payer", color: "var(--primary)" });
    if (record.status === "submitted") {
        nextActions.push({ action: "accept_claim", label: "Mark Accepted", color: "var(--success)" });
        nextActions.push({ action: "reject_claim", label: "Mark Rejected", color: "var(--danger)" });
    }
    if (record.status === "accepted") {
        nextActions.push({ action: "mark_paid", label: "Mark as Paid", color: "var(--success)" });
        nextActions.push({ action: "mark_partial", label: "Mark Partial", color: "var(--warning)" });
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 620, boxShadow: "0 32px 80px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "3px 10px", borderRadius: 6 }}>{record.id}</span>
                            <span className={`chip ${cfg.chip}`}>{cfg.label}</span>
                        </div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>{record.patientName}</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{record.cptCode} — {record.cptDescription}</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                {/* Status pipeline */}
                <StatusPipeline current={record.status} />

                {/* Details grid */}
                <div style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    {[
                        { label: "Date of Service", value: record.dateOfService },
                        { label: "Insurance Payer", value: record.insurancePayer },
                        { label: "Created By", value: record.createdBy },
                        { label: "Amount Billed", value: formatNaira(record.amount) },
                        { label: "Amount Paid", value: formatNaira(record.paidAmount) },
                        { label: "Outstanding", value: formatNaira(record.amount - record.paidAmount) },
                    ].map(item => (
                        <div key={item.label}>
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                {/* Denial reason */}
                {record.denialReason && (
                    <div style={{ margin: "0 28px 16px", background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--danger)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5, fontWeight: 700 }}>Denial Reason</div>
                        <div style={{ fontSize: 13, color: "var(--fg-mid)", lineHeight: 1.6 }}>{record.denialReason}</div>
                    </div>
                )}

                {/* Action buttons */}
                {nextActions.length > 0 && (
                    <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button onClick={onClose} style={{ padding: "9px 16px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Close</button>
                        {nextActions.map(na => (
                            <button key={na.action} onClick={() => onAction(na.action)} style={{ padding: "9px 18px", border: "none", borderRadius: 8, background: na.color, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif" }}>{na.label}</button>
                        ))}
                    </div>
                )}
                {nextActions.length === 0 && (
                    <div style={{ padding: "14px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={onClose} style={{ padding: "9px 22px", border: "none", borderRadius: 8, background: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif" }}>Close</button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
export default function BillingPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedCPT, setSelectedCPT] = useState<CPTCode | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
    const [pendingAction, setPendingAction] = useState<"mark_ready" | "submit_claim" | "accept_claim" | "reject_claim" | "mark_paid" | "mark_partial" | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [cptCodes, setCptCodes] = useState<CPTCode[]>(MOCK_CPT_CODES);
    const [billingRecords, setBillingRecords] = useState<BillingRecord[]>(MOCK_BILLING_RECORDS);
    const [payments] = useState<Payment[]>(MOCK_PAYMENTS);
    const [cptTab, setCptTab] = useState(0);
    const [recordTab, setRecordTab] = useState(0);

    const openRecordAction = (record: BillingRecord, action: typeof pendingAction) => {
        setSelectedRecord(record);
        setPendingAction(action);
        setOpenMenuId(null);
        setModal("mark_ready"); // reuse status action modal slot
    };

    /* Summary KPIs */
    const totalBilled = billingRecords.reduce((s, r) => s + r.amount, 0);
    const totalPaid = billingRecords.reduce((s, r) => s + r.paidAmount, 0);
    const totalOutstanding = totalBilled - totalPaid;
    const pendingClaims = billingRecords.filter(r => ["draft", "ready", "submitted"].includes(r.status)).length;
    const rejectedClaims = billingRecords.filter(r => r.status === "rejected").length;

    const tabs = [
        { label: "Overview", icon: "📊" },
        { label: "CPT Codes", icon: "🏷️" },
        { label: "Billing Records", icon: "📋" },
        { label: "Payments", icon: "💳" },
    ];

    const cptFilteredTabs = [
        { label: "All", count: cptCodes.length },
        { label: "Active", count: cptCodes.filter(c => c.status === "active").length },
        { label: "Inactive", count: cptCodes.filter(c => c.status === "inactive").length },
    ];

    const filteredCPTs = cptCodes.filter(c => {
        if (cptTab === 1) return c.status === "active";
        if (cptTab === 2) return c.status === "inactive";
        return true;
    });

    const recordFilterTabs = [
        { label: "All", count: billingRecords.length },
        { label: "Draft", count: billingRecords.filter(r => r.status === "draft").length },
        { label: "Submitted", count: billingRecords.filter(r => r.status === "submitted").length },
        { label: "Accepted", count: billingRecords.filter(r => r.status === "accepted").length },
        { label: "Paid", count: billingRecords.filter(r => ["paid", "partial"].includes(r.status)).length },
        { label: "Rejected", count: billingRecords.filter(r => r.status === "rejected").length },
    ];

    const filteredRecords = billingRecords.filter(r => {
        if (recordTab === 1) return r.status === "draft";
        if (recordTab === 2) return r.status === "submitted";
        if (recordTab === 3) return r.status === "accepted";
        if (recordTab === 4) return ["paid", "partial"].includes(r.status);
        if (recordTab === 5) return r.status === "rejected";
        return true;
    });

    /* Status action next state map */
    const applyStatusAction = (action: typeof pendingAction) => {
        if (!selectedRecord || !action) return;
        const nextStatus: Record<string, RecordStatus> = {
            mark_ready: "ready", submit_claim: "submitted", accept_claim: "accepted",
            reject_claim: "rejected", mark_paid: "paid", mark_partial: "partial",
        };
        setBillingRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, status: nextStatus[action] || r.status, submittedAt: action === "submit_claim" ? "14 Apr 2026" : r.submittedAt } : r));
        setModal(null);
        setSelectedRecord(null);
        setPendingAction(null);
    };

    return (
        <>
            {/* ── Modals ── */}
            {openMenuId && <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setOpenMenuId(null)} />}

            {modal === "add_cpt" && (
                <AddCPTCodeModal onClose={() => setModal(null)} onSave={code => { setCptCodes(p => [code, ...p]); setModal(null); }} />
            )}
            {modal === "edit_cpt" && selectedCPT && (
                <EditCPTCodeModal code={selectedCPT} onClose={() => setModal(null)} onSave={updated => { setCptCodes(p => p.map(c => c.code === updated.code ? updated : c)); setModal(null); }} />
            )}
            {modal === "create_record" && (
                <CreateBillingRecordModal cptCodes={cptCodes} onClose={() => setModal(null)} onSave={() => setModal(null)} />
            )}
            {modal === "record_payment" && (
                <RecordPaymentModal onClose={() => setModal(null)} onSave={() => setModal(null)} />
            )}
            {modal === "view_record" && selectedRecord && (
                <ViewRecordModal
                    record={selectedRecord}
                    onClose={() => { setModal(null); setSelectedRecord(null); }}
                    onAction={action => { setPendingAction(action); setModal("mark_ready"); }}
                />
            )}
            {modal === "mark_ready" && selectedRecord && pendingAction && (
                <StatusActionModal record={selectedRecord} action={pendingAction} onClose={() => { setModal(null); setSelectedRecord(null); setPendingAction(null); }} onConfirm={() => applyStatusAction(pendingAction)} />
            )}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Billing & Claims</div>
                    <div className="page-subtitle">Manage CPT codes, billing records, insurance claims & payments</div>
                </div>
                <div className="header-actions">
                    <button onClick={() => setModal("record_payment")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: "1.5px solid var(--border)", borderRadius: 10, background: "var(--card)", color: "var(--fg-mid)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                        💳 Record Payment
                    </button>
                    <button onClick={() => setModal("create_record")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)" }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Billing Record
                    </button>
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: 5, width: "fit-content" }}>
                {tabs.map((tab, i) => (
                    <button key={tab.label} onClick={() => setActiveTab(i)} style={{ padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif", background: activeTab === i ? "var(--primary)" : "transparent", color: activeTab === i ? "#fff" : "var(--muted)", transition: "all 0.18s", display: "flex", alignItems: "center", gap: 7 }}>
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* ══════ TAB: OVERVIEW ══════ */}
            {activeTab === 0 && (
                <>
                    {/* KPI Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                        {[
                            { label: "Total Billed", value: formatNaira(totalBilled), trend: "↑ 14%", sub: "than last month", color: "#2C7A6E", sparkId: "bs1", points: "0,30 20,24 40,18 60,22 80,14 100,8" },
                            { label: "Total Collected", value: formatNaira(totalPaid), trend: "↑ 9%", sub: "collection rate", color: "#27A76A", sparkId: "bs2", points: "0,32 20,28 40,22 60,20 80,14 100,10" },
                            { label: "Outstanding", value: formatNaira(totalOutstanding), trend: `${pendingClaims} claims`, sub: "pending processing", color: "#D98326", sparkId: "bs3", points: "0,20 20,24 40,18 60,22 80,20 100,16" },
                            { label: "Rejected Claims", value: String(rejectedClaims), trend: "↑ 1", sub: "require follow-up", color: "#C94040", sparkId: "bs4", points: "0,26 20,22 40,26 60,20 80,24 100,18" },
                        ].map(k => (
                            <div key={k.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 20px 16px", position: "relative", overflow: "hidden" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)" }}>{k.label}</div>
                                    <div style={{ display: "flex", gap: 3 }}>{[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--muted)", display: "inline-block" }} />)}</div>
                                </div>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: k.value.length > 10 ? 24 : 30, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 8 }}>{k.value}</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: k.color }}>{k.trend} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 11.5 }}>{k.sub}</span></div>
                                <svg style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.4 }} width="100" height="44" viewBox="0 0 100 44">
                                    <defs><linearGradient id={k.sparkId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity="0.3" /><stop offset="100%" stopColor={k.color} stopOpacity="0" /></linearGradient></defs>
                                    <polyline points={k.points} fill="none" stroke={k.color} strokeWidth="2" />
                                    <polygon points={`${k.points} 100,44 0,44`} fill={`url(#${k.sparkId})`} />
                                </svg>
                            </div>
                        ))}
                    </div>

                    {/* Claims status breakdown + Recent records */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {/* Status breakdown */}
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Claims by Status</div>
                                <div className="card-meta">ALL RECORDS</div>
                            </div>
                            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                                {(["draft","ready","submitted","accepted","rejected","paid","partial"] as RecordStatus[]).map(status => {
                                    const count = billingRecords.filter(r => r.status === status).length;
                                    const cfg = recordStatusConfig[status];
                                    const pct = Math.round((count / billingRecords.length) * 100);
                                    return (
                                        <div key={status}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>
                          <span>{cfg.icon}</span> {cfg.label}
                        </span>
                                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: cfg.color }}>{count} ({pct}%)</span>
                                            </div>
                                            <div style={{ height: 6, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${pct}%`, background: cfg.color, borderRadius: 6, transition: "width 0.6s ease" }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent activity */}
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Recent Billing Activity</div>
                                <button onClick={() => setActiveTab(2)} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>View all →</button>
                            </div>
                            {billingRecords.slice(0, 6).map((r, i) => {
                                const cfg = recordStatusConfig[r.status];
                                return (
                                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", borderBottom: i < 5 ? "1px solid var(--border)" : "none", transition: "background 0.12s", cursor: "pointer" }}
                                         onClick={() => { setSelectedRecord(r); setModal("view_record"); }}
                                         onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--primary-xlight)"}
                                         onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${r.patientColor}22`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 11, fontWeight: 700, color: r.patientColor, flexShrink: 0 }}>{r.patientInitials}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.patientName}</div>
                                            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{r.cptCode} · {r.dateOfService}</div>
                                        </div>
                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{formatNaira(r.amount)}</div>
                                            <span className={`chip ${cfg.chip}`} style={{ fontSize: 10, padding: "2px 8px" }}>{cfg.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* ══════ TAB: CPT CODES ══════ */}
            {activeTab === 1 && (
                <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div className="filter-tabs" style={{ marginBottom: 0 }}>
                            {cptFilteredTabs.map((tab, i) => (
                                <button key={tab.label} className={`filter-tab${cptTab === i ? " active" : ""}`} onClick={() => setCptTab(i)}>
                                    {tab.label} <span style={{ marginLeft: 5, fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: 0.75 }}>({tab.count})</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setModal("add_cpt")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)" }}>
                            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add CPT Code
                        </button>
                    </div>

                    <div className="card">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>CPT Code</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Default Fee</th>
                                <th>Usage</th>
                                <th>Created</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" as const }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredCPTs.map(cpt => (
                                <tr key={cpt.code}>
                                    <td>
                                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "4px 10px", borderRadius: 6 }}>{cpt.code}</span>
                                    </td>
                                    <td><span className="td-text">{cpt.description}</span></td>
                                    <td>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "var(--primary-light)", color: "var(--primary)", fontFamily: "'Space Mono', monospace" }}>{cpt.category}</span>
                                    </td>
                                    <td>
                                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{formatNaira(cpt.defaultFee)}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <span className="td-mono">{cpt.usageCount}</span>
                                            <span style={{ fontSize: 10, color: "var(--muted)" }}>records</span>
                                        </div>
                                    </td>
                                    <td><span className="td-mono">{cpt.createdAt}</span></td>
                                    <td>
                                        <span className={`chip ${cpt.status === "active" ? "chip-active" : "chip-inactive"}`}>{cpt.status === "active" ? "Active" : "Inactive"}</span>
                                    </td>
                                    <td style={{ textAlign: "right" as const }}>
                                        <div className="dots-menu-wrap" style={{ position: "relative", zIndex: openMenuId === cpt.code ? 200 : "auto", display: "inline-block" }}>
                                            <button className="dots-btn" onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === cpt.code ? null : cpt.code); }}>···</button>
                                            <div className={`dots-menu${openMenuId === cpt.code ? " open" : ""}`}>
                                                <div className="dots-menu-item" onClick={() => { setSelectedCPT(cpt); setOpenMenuId(null); setModal("edit_cpt"); }}>
                                                    <span className="dots-menu-icon">✏️</span> Edit Code
                                                </div>
                                                <div className="dots-menu-item" onClick={() => { setCptCodes(prev => prev.map(c => c.code === cpt.code ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c)); setOpenMenuId(null); }}>
                                                    <span className="dots-menu-icon">{cpt.status === "active" ? "⛔" : "✅"}</span> {cpt.status === "active" ? "Deactivate" : "Activate"}
                                                </div>
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
                            <button className="page-btn">Next »</button>
                            <div style={{ marginLeft: "auto" }}>
                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>Showing {filteredCPTs.length} codes</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ══════ TAB: BILLING RECORDS ══════ */}
            {activeTab === 2 && (
                <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div className="filter-tabs" style={{ marginBottom: 0, flexWrap: "wrap" }}>
                            {recordFilterTabs.map((tab, i) => (
                                <button key={tab.label} className={`filter-tab${recordTab === i ? " active" : ""}`} onClick={() => setRecordTab(i)}>
                                    {tab.label} <span style={{ marginLeft: 5, fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: 0.75 }}>({tab.count})</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setModal("create_record")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)", flexShrink: 0 }}>
                            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Record
                        </button>
                    </div>

                    <div className="card">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Record ID</th>
                                <th>Patient</th>
                                <th>CPT Code</th>
                                <th>Date of Service</th>
                                <th>Payer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" as const }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredRecords.map(record => {
                                const cfg = recordStatusConfig[record.status];
                                const nextActionMap: Record<RecordStatus, string | null> = {
                                    draft: "Mark Ready", ready: "Submit Claim", submitted: "Update Status",
                                    accepted: "Mark Paid", rejected: null, paid: null, partial: null,
                                };
                                const quickAction = nextActionMap[record.status];

                                return (
                                    <tr key={record.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedRecord(record); setModal("view_record"); }}>
                                        <td>
                                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "3px 8px", borderRadius: 5 }}>{record.id}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 30, height: 30, borderRadius: 8, background: record.patientColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{record.patientInitials}</div>
                                                <div>
                                                    <div className="patient-name" style={{ fontSize: 13 }}>{record.patientName}</div>
                                                    <div className="patient-id">{record.patientId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--fg)" }}>{record.cptCode}</span>
                                                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{record.cptDescription}</div>
                                            </div>
                                        </td>
                                        <td><span className="td-mono">{record.dateOfService}</span></td>
                                        <td><span className="td-text">{record.insurancePayer}</span></td>
                                        <td>
                                            <div>
                                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{formatNaira(record.amount)}</div>
                                                {record.paidAmount > 0 && (
                                                    <div style={{ fontSize: 10.5, color: "var(--success)", fontWeight: 700 }}>Paid: {formatNaira(record.paidAmount)}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <span className={`chip ${cfg.chip}`}>{cfg.label}</span>
                                        </td>
                                        <td style={{ textAlign: "right" as const }} onClick={e => e.stopPropagation()}>
                                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                {quickAction && record.status === "draft" && (
                                                    <button onClick={() => openRecordAction(record, "mark_ready")} style={{ padding: "5px 11px", border: "1.5px solid var(--purple)", borderRadius: 7, background: "var(--purple-light)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--purple)", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" }}>Mark Ready</button>
                                                )}
                                                {record.status === "ready" && (
                                                    <button onClick={() => openRecordAction(record, "submit_claim")} style={{ padding: "5px 11px", border: "1.5px solid var(--primary)", borderRadius: 7, background: "var(--primary-light)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" }}>Submit</button>
                                                )}
                                                {record.status === "accepted" && (
                                                    <button onClick={() => openRecordAction(record, "mark_paid")} style={{ padding: "5px 11px", border: "1.5px solid var(--success)", borderRadius: 7, background: "var(--success-light)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--success)", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" }}>Mark Paid</button>
                                                )}
                                                <div className="dots-menu-wrap" style={{ position: "relative", zIndex: openMenuId === record.id ? 200 : "auto", display: "inline-block" }}>
                                                    <button className="dots-btn" onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === record.id ? null : record.id); }}>···</button>
                                                    <div className={`dots-menu${openMenuId === record.id ? " open" : ""}`} style={{ minWidth: 195 }}>
                                                        <div className="dots-menu-item" onClick={() => { setSelectedRecord(record); setModal("view_record"); setOpenMenuId(null); }}><span className="dots-menu-icon">👁</span>View Details</div>
                                                        {record.status === "draft" && <div className="dots-menu-item" style={{ color: "var(--purple)" }} onClick={() => openRecordAction(record, "mark_ready")}><span className="dots-menu-icon">📋</span>Mark as Ready</div>}
                                                        {record.status === "ready" && <div className="dots-menu-item" style={{ color: "var(--primary)" }} onClick={() => openRecordAction(record, "submit_claim")}><span className="dots-menu-icon">📤</span>Submit to Payer</div>}
                                                        {record.status === "submitted" && <div className="dots-menu-item" style={{ color: "var(--success)" }} onClick={() => openRecordAction(record, "accept_claim")}><span className="dots-menu-icon">✅</span>Mark Accepted</div>}
                                                        {record.status === "submitted" && <div className="dots-menu-item danger" onClick={() => openRecordAction(record, "reject_claim")}><span className="dots-menu-icon">❌</span>Mark Rejected</div>}
                                                        {record.status === "accepted" && <div className="dots-menu-item" style={{ color: "var(--success)" }} onClick={() => openRecordAction(record, "mark_paid")}><span className="dots-menu-icon">💰</span>Mark as Paid</div>}
                                                        {record.status === "accepted" && <div className="dots-menu-item" style={{ color: "var(--warning)" }} onClick={() => openRecordAction(record, "mark_partial")}><span className="dots-menu-icon">⚡</span>Mark Partial</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button className="page-btn disabled">« Prev</button>
                            <button className="page-btn active">1</button>
                            <button className="page-btn">2</button>
                            <button className="page-btn">Next »</button>
                            <div style={{ marginLeft: "auto" }}>
                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>Showing {filteredRecords.length} of {billingRecords.length} records</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ══════ TAB: PAYMENTS ══════ */}
            {activeTab === 3 && (
                <>
                    {/* Payment KPIs */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
                        {[
                            { label: "Total Payments Recorded", value: formatNaira(payments.reduce((s, p) => s + p.amount, 0)), icon: "💰", color: "var(--success)" },
                            { label: "Payments This Month", value: String(payments.length), icon: "📅", color: "var(--primary)" },
                            { label: "Most Used Method", value: "Bank Transfer", icon: "🏦", color: "var(--purple)" },
                        ].map(k => (
                            <div key={k.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
                                <span style={{ fontSize: 24 }}>{k.icon}</span>
                                <div>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{k.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                        <button onClick={() => setModal("record_payment")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)" }}>
                            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Record Payment
                        </button>
                    </div>

                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Payment History</div>
                            <div className="card-meta">{payments.length} PAYMENTS</div>
                        </div>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Payment ID</th>
                                <th>Patient</th>
                                <th>Method</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Recorded By</th>
                                <th>Reference</th>
                            </tr>
                            </thead>
                            <tbody>
                            {payments.map(pay => (
                                <tr key={pay.id}>
                                    <td>
                                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "3px 8px", borderRadius: 5 }}>{pay.id}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 7, background: pay.patientColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{pay.patientInitials}</div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>{pay.patientName}</div>
                                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)" }}>{pay.patientId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                            <span style={{ fontSize: 16 }}>{paymentMethodIcon[pay.method]}</span>
                                            <span className="td-text">{paymentMethodLabel[pay.method]}</span>
                                        </div>
                                    </td>
                                    <td><span className="td-mono">{pay.date}</span></td>
                                    <td>
                                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: "var(--success)" }}>{formatNaira(pay.amount)}</span>
                                    </td>
                                    <td><span className="td-text">{pay.recordedBy}</span></td>
                                    <td>
                      <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: pay.referenceNote ? "normal" : "italic" }}>
                        {pay.referenceNote || "—"}
                      </span>
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
                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>Showing {payments.length} payments</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}