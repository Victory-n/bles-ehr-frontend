"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
type FormStatus = "signed" | "pending" | "not_started" | "expired";
type DocStatus = "active" | "draft" | "archived";
type ViewMode = "overview" | "patient-folder";
type OverviewTab = "all" | "compliance" | "notes" | "billing" | "general";
type FolderTab = "compliance" | "notes" | "billing" | "general";
type ModalType =
    | "upload"
    | "send_signature"
    | "share_folder"
    | "revoke_share"
    | "doc_preview"
    | "folder_share_detail"
    | null;

/* ─────────────────────────────────────
   MOCK DATA
───────────────────────────────────── */
const COMPLIANCE_FORM_TEMPLATES = [
    {
        id: "CF-001",
        name: "HIPAA Notice of Privacy Practices",
        description:
            "Informs the patient of their rights regarding health information use and disclosure.",
        required: true,
        validityMonths: 12,
        category: "Privacy & Rights",
    },
    {
        id: "CF-002",
        name: "Consent to Treatment",
        description:
            "General authorisation for the facility to provide psychiatric/therapeutic services.",
        required: true,
        validityMonths: null,
        category: "Clinical Consent",
    },
    {
        id: "CF-003",
        name: "Informed Consent for Mental Health Services",
        description:
            "Details risks, benefits, alternatives, and the voluntary nature of mental health treatment.",
        required: true,
        validityMonths: null,
        category: "Clinical Consent",
    },
    {
        id: "CF-004",
        name: "Release of Information (ROI)",
        description:
            "Authorises the facility to release protected health information to specified third parties.",
        required: false,
        validityMonths: 12,
        category: "Information Sharing",
    },
    {
        id: "CF-005",
        name: "Financial Responsibility Agreement",
        description:
            "Confirms the patient's understanding of billing obligations, co-pays, and payment policies.",
        required: true,
        validityMonths: 12,
        category: "Billing & Finance",
    },
    {
        id: "CF-006",
        name: "Emergency Contact & Authorization",
        description:
            "Designates emergency contacts and authorises contact in crisis situations.",
        required: true,
        validityMonths: null,
        category: "Safety & Emergency",
    },
    {
        id: "CF-007",
        name: "Telehealth Consent",
        description:
            "Consent for receiving services via telehealth platforms, including technology risks.",
        required: false,
        validityMonths: 12,
        category: "Clinical Consent",
    },
    {
        id: "CF-008",
        name: "Assignment of Benefits",
        description:
            "Authorises direct payment from insurance to the facility on the patient's behalf.",
        required: false,
        validityMonths: 12,
        category: "Billing & Finance",
    },
    {
        id: "CF-009",
        name: "Patient Rights & Grievance Process",
        description:
            "Acknowledges the patient's understanding of their rights and the facility's complaint process.",
        required: true,
        validityMonths: null,
        category: "Privacy & Rights",
    },
    {
        id: "CF-010",
        name: "No-Show & Cancellation Policy",
        description:
            "Confirms patient awareness of attendance expectations and associated fees.",
        required: true,
        validityMonths: null,
        category: "Billing & Finance",
    },
];

const MOCK_PATIENTS = [
    {
        id: "PAT-0142",
        name: "Amara Okafor",
        initials: "AO",
        color: "#2C7A6E",
        diagnosis: "Major Depressive Disorder",
        assignedStaff: "Dr. B. Adeyemi",
        compliance: 8,
        totalRequired: 10,
        sharedWith: null as string | null,
    },
    {
        id: "PAT-0141",
        name: "Chidi Nwosu",
        initials: "CN",
        color: "#6B5ED4",
        diagnosis: "Generalised Anxiety Disorder",
        assignedStaff: "Dr. A. Kolade",
        compliance: 4,
        totalRequired: 10,
        sharedWith: "Lagos General Hospital",
    },
    {
        id: "PAT-0138",
        name: "Emeka Afolabi",
        initials: "EA",
        color: "#C94040",
        diagnosis: "Bipolar Disorder Type I",
        assignedStaff: "Dr. A. Kolade",
        compliance: 10,
        totalRequired: 10,
        sharedWith: null,
    },
    {
        id: "PAT-0135",
        name: "Ngozi Eze",
        initials: "NE",
        color: "#27A76A",
        diagnosis: "PTSD — Complex Trauma",
        assignedStaff: "Dr. C. Obi",
        compliance: 7,
        totalRequired: 10,
        sharedWith: null,
    },
    {
        id: "PAT-0130",
        name: "Fatima Hassan",
        initials: "FH",
        color: "#D98326",
        diagnosis: "OCD — Contamination Subtype",
        assignedStaff: "Dr. B. Adeyemi",
        compliance: 9,
        totalRequired: 10,
        sharedWith: null,
    },
    {
        id: "PAT-0128",
        name: "Kunle Balogun",
        initials: "KB",
        color: "#7A9490",
        diagnosis: "Substance Use Disorder",
        assignedStaff: "Dr. F. Eze",
        compliance: 5,
        totalRequired: 10,
        sharedWith: "Mirabel Hospital",
    },
];

const PATIENT_COMPLIANCE_FORMS: Record<string, { formId: string; status: FormStatus; signedDate: string | null; signedBy: string | null; expiryDate: string | null; sentDate: string | null }[]> = {
    "PAT-0142": [
        { formId: "CF-001", status: "signed", signedDate: "14 Feb 2025", signedBy: "Amara Okafor", expiryDate: "14 Feb 2026", sentDate: "12 Feb 2025" },
        { formId: "CF-002", status: "signed", signedDate: "14 Feb 2025", signedBy: "Amara Okafor", expiryDate: null, sentDate: "12 Feb 2025" },
        { formId: "CF-003", status: "signed", signedDate: "14 Feb 2025", signedBy: "Amara Okafor", expiryDate: null, sentDate: "12 Feb 2025" },
        { formId: "CF-004", status: "signed", signedDate: "20 Feb 2025", signedBy: "Amara Okafor", expiryDate: "20 Feb 2026", sentDate: "18 Feb 2025" },
        { formId: "CF-005", status: "signed", signedDate: "14 Feb 2025", signedBy: "Amara Okafor", expiryDate: "14 Feb 2026", sentDate: "12 Feb 2025" },
        { formId: "CF-006", status: "signed", signedDate: "14 Feb 2025", signedBy: "Amara Okafor", expiryDate: null, sentDate: "12 Feb 2025" },
        { formId: "CF-007", status: "signed", signedDate: "14 Feb 2025", signedBy: "Amara Okafor", expiryDate: "14 Feb 2026", sentDate: "12 Feb 2025" },
        { formId: "CF-008", status: "pending", signedDate: null, signedBy: null, expiryDate: null, sentDate: "10 Apr 2026" },
        { formId: "CF-009", status: "signed", signedDate: "14 Feb 2025", signedBy: "Amara Okafor", expiryDate: null, sentDate: "12 Feb 2025" },
        { formId: "CF-010", status: "not_started", signedDate: null, signedBy: null, expiryDate: null, sentDate: null },
    ],
    "PAT-0141": [
        { formId: "CF-001", status: "signed", signedDate: "02 Mar 2026", signedBy: "Chidi Nwosu", expiryDate: "02 Mar 2027", sentDate: "01 Mar 2026" },
        { formId: "CF-002", status: "signed", signedDate: "02 Mar 2026", signedBy: "Chidi Nwosu", expiryDate: null, sentDate: "01 Mar 2026" },
        { formId: "CF-003", status: "pending", signedDate: null, signedBy: null, expiryDate: null, sentDate: "10 Apr 2026" },
        { formId: "CF-004", status: "not_started", signedDate: null, signedBy: null, expiryDate: null, sentDate: null },
        { formId: "CF-005", status: "pending", signedDate: null, signedBy: null, expiryDate: null, sentDate: "10 Apr 2026" },
        { formId: "CF-006", status: "signed", signedDate: "02 Mar 2026", signedBy: "Chidi Nwosu", expiryDate: null, sentDate: "01 Mar 2026" },
        { formId: "CF-007", status: "not_started", signedDate: null, signedBy: null, expiryDate: null, sentDate: null },
        { formId: "CF-008", status: "not_started", signedDate: null, signedBy: null, expiryDate: null, sentDate: null },
        { formId: "CF-009", status: "signed", signedDate: "02 Mar 2026", signedBy: "Chidi Nwosu", expiryDate: null, sentDate: "01 Mar 2026" },
        { formId: "CF-010", status: "not_started", signedDate: null, signedBy: null, expiryDate: null, sentDate: null },
    ],
    "PAT-0138": COMPLIANCE_FORM_TEMPLATES.map((f) => ({
        formId: f.id,
        status: "signed" as FormStatus,
        signedDate: "15 Jan 2025",
        signedBy: "Emeka Afolabi",
        expiryDate: f.validityMonths ? "15 Jan 2026" : null,
        sentDate: "14 Jan 2025",
    })),
    "PAT-0135": [
        { formId: "CF-001", status: "signed", signedDate: "20 Feb 2025", signedBy: "Ngozi Eze", expiryDate: "20 Feb 2026", sentDate: "19 Feb 2025" },
        { formId: "CF-002", status: "signed", signedDate: "20 Feb 2025", signedBy: "Ngozi Eze", expiryDate: null, sentDate: "19 Feb 2025" },
        { formId: "CF-003", status: "signed", signedDate: "20 Feb 2025", signedBy: "Ngozi Eze", expiryDate: null, sentDate: "19 Feb 2025" },
        { formId: "CF-004", status: "signed", signedDate: "25 Feb 2025", signedBy: "Ngozi Eze", expiryDate: "25 Feb 2026", sentDate: "22 Feb 2025" },
        { formId: "CF-005", status: "signed", signedDate: "20 Feb 2025", signedBy: "Ngozi Eze", expiryDate: "20 Feb 2026", sentDate: "19 Feb 2025" },
        { formId: "CF-006", status: "signed", signedDate: "20 Feb 2025", signedBy: "Ngozi Eze", expiryDate: null, sentDate: "19 Feb 2025" },
        { formId: "CF-007", status: "not_started", signedDate: null, signedBy: null, expiryDate: null, sentDate: null },
        { formId: "CF-008", status: "not_started", signedDate: null, signedBy: null, expiryDate: null, sentDate: null },
        { formId: "CF-009", status: "signed", signedDate: "20 Feb 2025", signedBy: "Ngozi Eze", expiryDate: null, sentDate: "19 Feb 2025" },
        { formId: "CF-010", status: "pending", signedDate: null, signedBy: null, expiryDate: null, sentDate: "08 Apr 2026" },
    ],
    "PAT-0130": [
        ...COMPLIANCE_FORM_TEMPLATES.slice(0, 9).map((f) => ({
            formId: f.id,
            status: "signed" as FormStatus,
            signedDate: "05 Mar 2025",
            signedBy: "Fatima Hassan",
            expiryDate: f.validityMonths ? "05 Mar 2026" : null,
            sentDate: "04 Mar 2025",
        })),
        { formId: "CF-010", status: "pending", signedDate: null, signedBy: null, expiryDate: null, sentDate: "11 Apr 2026" },
    ],
    "PAT-0128": [
        { formId: "CF-001", status: "expired", signedDate: "10 Jan 2025", signedBy: "Kunle Balogun", expiryDate: "10 Jan 2026", sentDate: "09 Jan 2025" },
        { formId: "CF-002", status: "signed", signedDate: "10 Jan 2025", signedBy: "Kunle Balogun", expiryDate: null, sentDate: "09 Jan 2025" },
        { formId: "CF-003", status: "signed", signedDate: "10 Jan 2025", signedBy: "Kunle Balogun", expiryDate: null, sentDate: "09 Jan 2025" },
        { formId: "CF-004", status: "not_started", signedDate: null, signedBy: null, expiryDate: null, sentDate: null },
        { formId: "CF-005", status: "expired", signedDate: "10 Jan 2025", signedBy: "Kunle Balogun", expiryDate: "10 Jan 2026", sentDate: "09 Jan 2025" },
        { formId: "CF-006", status: "signed", signedDate: "10 Jan 2025", signedBy: "Kunle Balogun", expiryDate: null, sentDate: "09 Jan 2025" },
        { formId: "CF-007", status: "not_started", signedDate: null, signedBy: null, expiryDate: null, sentDate: null },
        { formId: "CF-008", status: "not_started", signedDate: null, signedBy: null, expiryDate: null, sentDate: null },
        { formId: "CF-009", status: "signed", signedDate: "10 Jan 2025", signedBy: "Kunle Balogun", expiryDate: null, sentDate: "09 Jan 2025" },
        { formId: "CF-010", status: "not_started", signedDate: null, signedBy: null, expiryDate: null, sentDate: null },
    ],
};

const PATIENT_CLINICAL_NOTES: Record<string, { id: string; title: string; type: string; author: string; date: string; status: string }[]> = {
    "PAT-0142": [
        { id: "CN-001", title: "Initial Psychiatric Evaluation", type: "Psychiatric Evaluation", author: "Dr. A. Kolade", date: "14 Feb 2025", status: "signed" },
        { id: "CN-002", title: "CBT Session Progress Note", type: "Progress Note", author: "Dr. B. Adeyemi", date: "10 Apr 2026", status: "signed" },
        { id: "CN-003", title: "Group Therapy Session Note", type: "Progress Note", author: "Dr. C. Obi", date: "03 Apr 2026", status: "signed" },
        { id: "CN-004", title: "Medication Review Note", type: "Medication Note", author: "Dr. A. Kolade", date: "01 Apr 2026", status: "signed" },
        { id: "CN-005", title: "Crisis Assessment Note", type: "Assessment", author: "Dr. B. Adeyemi", date: "22 Mar 2026", status: "draft" },
    ],
    "PAT-0141": [
        { id: "CN-006", title: "Initial Intake Assessment", type: "Intake Assessment", author: "Dr. A. Kolade", date: "12 Apr 2026", status: "draft" },
    ],
    "PAT-0138": [
        { id: "CN-007", title: "Psychiatric Evaluation — Bipolar Type I", type: "Psychiatric Evaluation", author: "Dr. A. Kolade", date: "15 Jan 2025", status: "signed" },
        { id: "CN-008", title: "Medication Review — Lithium Titration", type: "Medication Note", author: "Dr. A. Kolade", date: "09 Apr 2026", status: "signed" },
        { id: "CN-009", title: "YMRS Assessment Note", type: "Assessment", author: "Dr. A. Kolade", date: "09 Apr 2026", status: "signed" },
    ],
    "PAT-0135": [
        { id: "CN-010", title: "Trauma Intake Assessment", type: "Intake Assessment", author: "Dr. C. Obi", date: "20 Feb 2025", status: "signed" },
        { id: "CN-011", title: "EMDR Session Note #1", type: "Progress Note", author: "Dr. C. Obi", date: "11 Apr 2026", status: "signed" },
    ],
    "PAT-0130": [
        { id: "CN-012", title: "OCD Evaluation & Y-BOCS", type: "Assessment", author: "Dr. B. Adeyemi", date: "05 Mar 2025", status: "signed" },
        { id: "CN-013", title: "ERP Session Progress Note", type: "Progress Note", author: "Dr. B. Adeyemi", date: "08 Apr 2026", status: "signed" },
    ],
    "PAT-0128": [
        { id: "CN-014", title: "SUD Initial Assessment", type: "Intake Assessment", author: "Dr. F. Eze", date: "10 Jan 2025", status: "signed" },
    ],
};

const PATIENT_BILLING_DOCS: Record<string, { id: string; description: string; type: string; date: string; amount: string; status: string }[]> = {
    "PAT-0142": [
        { id: "INV-0142-001", description: "CBT Session — Apr 10, 2026", type: "Invoice", date: "10 Apr 2026", amount: "₦18,000", status: "paid" },
        { id: "INV-0142-002", description: "Group Session — Apr 3, 2026", type: "Invoice", date: "03 Apr 2026", amount: "₦9,000", status: "pending" },
        { id: "EOB-0142-001", description: "NHIS Claim — Q1 2026", type: "Insurance Claim", date: "31 Mar 2026", amount: "₦54,000", status: "approved" },
    ],
    "PAT-0141": [
        { id: "INV-0141-001", description: "Psychiatric Evaluation — Apr 12, 2026", type: "Invoice", date: "12 Apr 2026", amount: "₦35,000", status: "pending" },
    ],
    "PAT-0138": [
        { id: "INV-0138-001", description: "Medication Review — Apr 9, 2026", type: "Invoice", date: "09 Apr 2026", amount: "₦22,000", status: "paid" },
        { id: "INV-0138-002", description: "Psychiatric Session — Mar 2026", type: "Invoice", date: "28 Mar 2026", amount: "₦22,000", status: "paid" },
        { id: "EOB-0138-001", description: "NHIS Claim — Q1 2026", type: "Insurance Claim", date: "31 Mar 2026", amount: "₦66,000", status: "approved" },
    ],
    "PAT-0135": [
        { id: "INV-0135-001", description: "EMDR Session — Apr 11, 2026", type: "Invoice", date: "11 Apr 2026", amount: "₦28,000", status: "paid" },
    ],
    "PAT-0130": [
        { id: "INV-0130-001", description: "ERP Session — Apr 8, 2026", type: "Invoice", date: "08 Apr 2026", amount: "₦18,000", status: "pending" },
    ],
    "PAT-0128": [],
};

const PATIENT_GENERAL_DOCS: Record<string, { id: string; name: string; type: string; uploadedBy: string; date: string; size: string; fileType: string }[]> = {
    "PAT-0142": [
        { id: "DOC-0142-001", name: "GP Referral Letter", type: "Referral", uploadedBy: "Dr. B. Adeyemi", date: "12 Feb 2025", size: "248 KB", fileType: "pdf" },
        { id: "DOC-0142-002", name: "Previous Psychiatrist Report — St. Nicholas", type: "External Report", uploadedBy: "Dr. B. Adeyemi", date: "15 Feb 2025", size: "1.2 MB", fileType: "pdf" },
        { id: "DOC-0142-003", name: "Blood Panel Results — Mar 2026", type: "Lab Result", uploadedBy: "Nurse R. Bello", date: "20 Mar 2026", size: "340 KB", fileType: "pdf" },
        { id: "DOC-0142-004", name: "Insurance Card — NHIS", type: "Insurance", uploadedBy: "Dr. B. Adeyemi", date: "14 Feb 2025", size: "120 KB", fileType: "jpg" },
    ],
    "PAT-0141": [
        { id: "DOC-0141-001", name: "GP Referral Letter", type: "Referral", uploadedBy: "Dr. A. Kolade", date: "12 Apr 2026", size: "184 KB", fileType: "pdf" },
    ],
    "PAT-0138": [
        { id: "DOC-0138-001", name: "Previous Hospital Records — LASUTH", type: "External Report", uploadedBy: "Dr. A. Kolade", date: "16 Jan 2025", size: "2.8 MB", fileType: "pdf" },
        { id: "DOC-0138-002", name: "Lithium Level Lab Results", type: "Lab Result", uploadedBy: "Nurse R. Bello", date: "08 Apr 2026", size: "210 KB", fileType: "pdf" },
        { id: "DOC-0138-003", name: "Cardiology Clearance Letter", type: "Medical Clearance", uploadedBy: "Dr. A. Kolade", date: "22 Feb 2025", size: "310 KB", fileType: "pdf" },
    ],
    "PAT-0135": [
        { id: "DOC-0135-001", name: "Police Report — Trauma Incident", type: "Legal Document", uploadedBy: "Dr. C. Obi", date: "22 Feb 2025", size: "890 KB", fileType: "pdf" },
        { id: "DOC-0135-002", name: "Court Referral Order", type: "Legal Document", uploadedBy: "Dr. C. Obi", date: "20 Feb 2025", size: "420 KB", fileType: "pdf" },
    ],
    "PAT-0130": [
        { id: "DOC-0130-001", name: "GP Referral Letter", type: "Referral", uploadedBy: "Dr. B. Adeyemi", date: "04 Mar 2025", size: "200 KB", fileType: "pdf" },
        { id: "DOC-0130-002", name: "Allergy Test Results", type: "Lab Result", uploadedBy: "Nurse R. Bello", date: "15 Mar 2025", size: "180 KB", fileType: "pdf" },
    ],
    "PAT-0128": [
        { id: "DOC-0128-001", name: "Substance Abuse Assessment — NDLEA", type: "External Report", uploadedBy: "Dr. F. Eze", date: "12 Jan 2025", size: "660 KB", fileType: "pdf" },
    ],
};

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const formStatusConfig = {
    signed: { label: "Signed", chip: "chip-active", dot: "var(--success)" },
    pending: { label: "Pending Signature", chip: "chip-pending", dot: "var(--warning)" },
    not_started: { label: "Not Started", chip: "chip-inactive", dot: "#aaa" },
    expired: { label: "Expired", chip: "chip-critical", dot: "var(--danger)" },
};

const fileTypeIcon: Record<string, string> = {
    pdf: "📄",
    jpg: "🖼️",
    png: "🖼️",
    doc: "📝",
    docx: "📝",
    xlsx: "📊",
};

const billingStatusConfig: Record<string, { color: string; bg: string }> = {
    paid: { color: "var(--success)", bg: "var(--success-light)" },
    pending: { color: "var(--warning)", bg: "var(--warning-light)" },
    approved: { color: "var(--primary)", bg: "var(--primary-light)" },
    rejected: { color: "var(--danger)", bg: "var(--danger-light)" },
};

function complianceRate(patientId: string) {
    const forms = PATIENT_COMPLIANCE_FORMS[patientId] || [];
    const signed = forms.filter((f) => f.status === "signed").length;
    return Math.round((signed / forms.length) * 100);
}

/* ─────────────────────────────────────
   UPLOAD DOCUMENT MODAL
───────────────────────────────────── */
function UploadDocumentModal({
                                 onClose,
                                 patientName,
                             }: {
    onClose: () => void;
    patientName?: string;
}) {
    const [form, setForm] = useState({
        patient: patientName || "",
        category: "general",
        docType: "",
        description: "",
        file: null as File | null,
    });
    const [dragging, setDragging] = useState(false);
    const [uploaded, setUploaded] = useState(false);

    const docTypes: Record<string, string[]> = {
        compliance: COMPLIANCE_FORM_TEMPLATES.map((t) => t.name),
        general: ["Referral Letter", "Lab Result", "External Report", "Medical Clearance", "Legal Document", "Insurance Card", "Other"],
        billing: ["Invoice", "Insurance Claim", "Receipt", "Payment Plan", "EOB"],
    };

    return (
        <div
            style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 560, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>Upload Document</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                            {patientName ? `Adding to ${patientName}'s folder` : "Select a patient folder"}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Patient selector (only if not in patient folder) */}
                    {!patientName && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Patient</label>
                            <select className="form-input" value={form.patient} onChange={(e) => setForm((p) => ({ ...p, patient: e.target.value }))} style={{ cursor: "pointer" }}>
                                <option value="">Select patient</option>
                                {MOCK_PATIENTS.map((p) => (<option key={p.id} value={p.name}>{p.name} — {p.id}</option>))}
                            </select>
                        </div>
                    )}

                    {/* Category + Doc type */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Category</label>
                            <select className="form-input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value, docType: "" }))} style={{ cursor: "pointer" }}>
                                <option value="compliance">Compliance Form</option>
                                <option value="general">General Document</option>
                                <option value="billing">Billing Document</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Document Type</label>
                            <select className="form-input" value={form.docType} onChange={(e) => setForm((p) => ({ ...p, docType: e.target.value }))} style={{ cursor: "pointer" }}>
                                <option value="">Select type</option>
                                {(docTypes[form.category] || []).map((t) => (<option key={t} value={t}>{t}</option>))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Description <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
                        <input className="form-input" type="text" placeholder="Brief description of this document…" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                    </div>

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) { setForm((p) => ({ ...p, file })); setUploaded(true); } }}
                        onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf,.doc,.docx,.jpg,.png,.xlsx"; input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) { setForm((p) => ({ ...p, file })); setUploaded(true); } }; input.click(); }}
                        style={{
                            border: `2px dashed ${dragging ? "var(--primary)" : uploaded ? "var(--success)" : "var(--border)"}`,
                            borderRadius: 12,
                            padding: "28px 20px",
                            textAlign: "center",
                            cursor: "pointer",
                            background: dragging ? "var(--primary-xlight)" : uploaded ? "var(--success-light)" : "var(--surface)",
                            transition: "all 0.2s",
                        }}
                    >
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{uploaded ? "✅" : "📁"}</div>
                        {uploaded ? (
                            <>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: "var(--success)" }}>{form.file?.name}</div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{form.file ? (form.file.size / 1024).toFixed(1) + " KB" : ""} · Click to change</div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: "var(--fg)", marginBottom: 4 }}>Drop file here or click to browse</div>
                                <div style={{ fontSize: 12, color: "var(--muted)" }}>PDF, DOC, JPG, PNG, XLSX — max 20MB</div>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button onClick={onClose} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)" }}>Upload Document</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   SEND FOR SIGNATURE MODAL
───────────────────────────────────── */
function SendSignatureModal({
                                onClose,
                                formName,
                                patientName,
                                patientId,
                            }: {
    onClose: () => void;
    formName?: string;
    patientName?: string;
    patientId?: string;
}) {
    const [selectedForms, setSelectedForms] = useState<string[]>(formName ? [formName] : []);
    const [deliveryMethod, setDeliveryMethod] = useState<"email" | "sms" | "both">("email");
    const [message, setMessage] = useState("Dear patient, please review and sign the attached compliance form(s) at your earliest convenience. Your care team requires these forms before your next appointment.");
    const [loading, setLoading] = useState(false);

    const pendingForms = patientId
        ? (PATIENT_COMPLIANCE_FORMS[patientId] || [])
            .filter((f) => f.status === "not_started" || f.status === "expired")
            .map((f) => COMPLIANCE_FORM_TEMPLATES.find((t) => t.id === f.formId)?.name || f.formId)
        : [];

    const toggleForm = (name: string) => setSelectedForms((p) => p.includes(name) ? p.filter((x) => x !== name) : [...p, name]);

    return (
        <div
            style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 580, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>Send for Signature</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{patientName ? `Sending to ${patientName}` : "Select forms to send"}</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Forms selection (if no specific form pre-selected) */}
                    {!formName && pendingForms.length > 0 && (
                        <div>
                            <label className="form-label">Select Forms to Send</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto", border: "1.5px solid var(--border)", borderRadius: 10, padding: "8px 12px" }}>
                                {pendingForms.map((name) => (
                                    <label key={name} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 0" }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedForms.includes(name)}
                                            onChange={() => toggleForm(name)}
                                            style={{ accentColor: "var(--primary)", width: 14, height: 14 }}
                                        />
                                        <span style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {formName && (
                        <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary-mid)", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10 }}>
                            <span style={{ fontSize: 16 }}>📋</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary-dark)" }}>{formName}</span>
                        </div>
                    )}

                    {/* Delivery method */}
                    <div>
                        <label className="form-label">Delivery Method</label>
                        <div style={{ display: "flex", gap: 8 }}>
                            {(["email", "sms", "both"] as const).map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setDeliveryMethod(method)}
                                    style={{
                                        flex: 1, padding: "10px", border: `1.5px solid ${deliveryMethod === method ? "var(--primary)" : "var(--border)"}`,
                                        borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700,
                                        background: deliveryMethod === method ? "var(--primary-light)" : "var(--card)",
                                        color: deliveryMethod === method ? "var(--primary)" : "var(--muted)",
                                        fontFamily: "'Nunito', sans-serif", transition: "all 0.15s",
                                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                                    }}
                                >
                                    <span style={{ fontSize: 18 }}>{method === "email" ? "📧" : method === "sms" ? "📱" : "📧 + 📱"}</span>
                                    <span style={{ textTransform: "capitalize" }}>{method === "both" ? "Email & SMS" : method.toUpperCase()}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom message */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Message to Patient <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
                        <textarea className="form-input" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} style={{ resize: "none" }} />
                    </div>

                    {/* Info */}
                    <div style={{ background: "var(--warning-light)", border: "1px solid #f5c58a", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 9 }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
                        <div style={{ fontSize: 12, color: "var(--fg-mid)", lineHeight: 1.6 }}>
                            The patient will receive a secure link to view and electronically sign the selected form(s). Signatures are legally binding and HIPAA-compliant.
                        </div>
                    </div>
                </div>

                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button
                        onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onClose(); }, 1000); }}
                        disabled={loading || selectedForms.length === 0}
                        style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: selectedForms.length ? "var(--primary)" : "var(--border)", cursor: selectedForms.length ? "pointer" : "not-allowed", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.8 : 1, transition: "opacity 0.15s" }}
                    >{loading ? "Sending…" : `Send ${selectedForms.length || ""} Form${selectedForms.length !== 1 ? "s" : ""}`}</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   SHARE FOLDER MODAL
───────────────────────────────────── */
function ShareFolderModal({ onClose, patientName }: { onClose: () => void; patientName: string }) {
    const [orgName, setOrgName] = useState("");
    const [accessLevel, setAccessLevel] = useState<"view" | "download">("view");
    const [expiryDays, setExpiryDays] = useState("30");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [shared, setShared] = useState(false);
    const [shareLink] = useState("https://brightlife.health/share/secure/a9f3kx2m");

    if (shared) {
        return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 480, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                    <div style={{ padding: "32px 28px", textAlign: "center" }}>
                        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-light)", border: "2px solid var(--success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>✅</div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>Folder Shared Successfully</div>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>A secure share link has been generated for <strong>{patientName}</strong>'s folder. Share this link with <strong>{orgName}</strong>.</div>
                        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 20 }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11.5, color: "var(--primary)", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareLink}</span>
                            <button onClick={() => navigator.clipboard.writeText(shareLink)} style={{ padding: "5px 12px", border: "1.5px solid var(--primary)", borderRadius: 7, background: "var(--primary-light)", color: "var(--primary)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, fontFamily: "'Nunito', sans-serif", flexShrink: 0 }}>Copy</button>
                        </div>
                        <button onClick={onClose} style={{ padding: "10px 28px", border: "none", borderRadius: 9, background: "var(--primary)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif" }}>Done</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 520, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>Share Patient Folder</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Grant a third party time-limited access to {patientName}'s records</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Organisation / Recipient Name</label>
                        <input className="form-input" type="text" placeholder="e.g. Lagos General Hospital" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                            <label className="form-label">Access Level</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                {(["view", "download"] as const).map((level) => (
                                    <button key={level} onClick={() => setAccessLevel(level)} style={{ flex: 1, padding: "9px 6px", border: `1.5px solid ${accessLevel === level ? "var(--primary)" : "var(--border)"}`, borderRadius: 8, cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: accessLevel === level ? "var(--primary-light)" : "var(--card)", color: accessLevel === level ? "var(--primary)" : "var(--muted)", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s", textTransform: "capitalize" }}>{level === "view" ? "👁 View Only" : "⬇ Download"}</button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Link Expiry</label>
                            <select className="form-input" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} style={{ cursor: "pointer" }}>
                                <option value="7">7 days</option>
                                <option value="14">14 days</option>
                                <option value="30">30 days</option>
                                <option value="60">60 days</option>
                                <option value="90">90 days</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Reason / Note <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
                        <input className="form-input" type="text" placeholder="e.g. Referral continuity of care" value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>

                    <div style={{ background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: 10, padding: "11px 14px", display: "flex", gap: 9 }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                        <div style={{ fontSize: 12, color: "var(--danger)", lineHeight: 1.6, fontWeight: 600 }}>
                            Sharing a patient folder grants access to protected health information (PHI). Ensure you have the patient's written consent (ROI form) before proceeding. This action is logged for HIPAA compliance.
                        </div>
                    </div>
                </div>

                <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button
                        onClick={() => { if (!orgName.trim()) return; setLoading(true); setTimeout(() => { setLoading(false); setShared(true); }, 1200); }}
                        disabled={!orgName.trim() || loading}
                        style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: orgName.trim() ? "var(--primary)" : "var(--border)", cursor: orgName.trim() ? "pointer" : "not-allowed", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.8 : 1 }}
                    >{loading ? "Generating link…" : "Share Folder"}</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   REVOKE SHARE MODAL
───────────────────────────────────── */
function RevokeShareModal({ onClose, patientName, orgName }: { onClose: () => void; patientName: string; orgName: string }) {
    const [loading, setLoading] = useState(false);
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(25,40,37,0.2)", overflow: "hidden" }}>
                <div style={{ padding: "24px 26px" }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 8 }}>Revoke Folder Share</div>
                    <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6 }}>You are about to revoke <strong style={{ color: "var(--fg)" }}>{orgName}</strong>'s access to <strong style={{ color: "var(--fg)" }}>{patientName}</strong>'s folder. The shared link will be immediately deactivated.</div>
                </div>
                <div style={{ padding: "14px 26px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                    <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); onClose(); }, 900); }} style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: "var(--danger)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", opacity: loading ? 0.7 : 1, transition: "opacity 0.15s" }}>{loading ? "Revoking…" : "Revoke Access"}</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   PATIENT FOLDER VIEW
───────────────────────────────────── */
function PatientFolderView({
                               patient,
                               onBack,
                           }: {
    patient: typeof MOCK_PATIENTS[0];
    onBack: () => void;
}) {
    const [folderTab, setFolderTab] = useState<FolderTab>("compliance");
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedFormName, setSelectedFormName] = useState<string | undefined>();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const complianceForms = PATIENT_COMPLIANCE_FORMS[patient.id] || [];
    const clinicalNotes = PATIENT_CLINICAL_NOTES[patient.id] || [];
    const billingDocs = PATIENT_BILLING_DOCS[patient.id] || [];
    const generalDocs = PATIENT_GENERAL_DOCS[patient.id] || [];

    const signedCount = complianceForms.filter((f) => f.status === "signed").length;
    const pendingCount = complianceForms.filter((f) => f.status === "pending").length;
    const notStartedCount = complianceForms.filter((f) => f.status === "not_started").length;
    const expiredCount = complianceForms.filter((f) => f.status === "expired").length;
    const compRate = Math.round((signedCount / complianceForms.length) * 100);

    const folderTabs = [
        { key: "compliance" as FolderTab, label: "Compliance Forms", count: complianceForms.length },
        { key: "notes" as FolderTab, label: "Clinical Notes", count: clinicalNotes.length },
        { key: "billing" as FolderTab, label: "Billing Records", count: billingDocs.length },
        { key: "general" as FolderTab, label: "General Documents", count: generalDocs.length },
    ];

    return (
        <>
            {modal === "upload" && <UploadDocumentModal onClose={() => setModal(null)} patientName={patient.name} />}
            {modal === "send_signature" && <SendSignatureModal onClose={() => setModal(null)} formName={selectedFormName} patientName={patient.name} patientId={patient.id} />}
            {modal === "share_folder" && <ShareFolderModal onClose={() => setModal(null)} patientName={patient.name} />}
            {modal === "revoke_share" && patient.sharedWith && <RevokeShareModal onClose={() => setModal(null)} patientName={patient.name} orgName={patient.sharedWith} />}
            {openMenuId && <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setOpenMenuId(null)} />}

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "var(--muted)" }}>
                <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontWeight: 700, fontSize: 13, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>← Documents</button>
                <span>/</span>
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>{patient.name}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--primary)", background: "var(--primary-light)", padding: "2px 8px", borderRadius: 5, fontWeight: 700, marginLeft: 4 }}>{patient.id}</span>
            </div>

            {/* Patient Folder Header */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, marginBottom: 20, overflow: "hidden" }}>
                <div style={{ height: 5, background: `linear-gradient(90deg, ${patient.color}, ${patient.color}66)` }} />
                <div style={{ padding: "22px 28px" }}>
                    <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                        {/* Avatar */}
                        <div style={{ width: 60, height: 60, borderRadius: 14, flexShrink: 0, background: `linear-gradient(135deg, ${patient.color} 0%, ${patient.color}99 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "#fff", boxShadow: `0 6px 20px ${patient.color}40` }}>{patient.initials}</div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <div>
                                    <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em", marginBottom: 5 }}>{patient.name}'s Records</h1>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--primary)", background: "var(--primary-light)", padding: "3px 9px", borderRadius: 5, fontWeight: 700 }}>{patient.id}</span>
                                        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{patient.diagnosis}</span>
                                        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>·</span>
                                        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{patient.assignedStaff}</span>
                                        {patient.sharedWith && (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--warning-light)", color: "var(--warning)", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, fontFamily: "'Space Mono', monospace" }}>
                        🔗 Shared with {patient.sharedWith}
                      </span>
                                        )}
                                    </div>
                                </div>
                                {/* Actions */}
                                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                    <button onClick={() => setModal("upload")} style={{ padding: "8px 14px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>📎 Upload</button>
                                    <button onClick={() => { setSelectedFormName(undefined); setModal("send_signature"); }} style={{ padding: "8px 14px", border: "1.5px solid var(--primary)", borderRadius: 9, background: "var(--primary-light)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>✉️ Send for Signature</button>
                                    {patient.sharedWith ? (
                                        <button onClick={() => setModal("revoke_share")} style={{ padding: "8px 14px", border: "1.5px solid var(--danger)", borderRadius: 9, background: "var(--danger-light)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--danger)", fontFamily: "'Nunito', sans-serif" }}>🔒 Revoke Share</button>
                                    ) : (
                                        <button onClick={() => setModal("share_folder")} style={{ padding: "8px 14px", border: "none", borderRadius: 9, background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", boxShadow: "0 2px 8px rgba(44,122,110,0.25)" }}>🔗 Share Folder</button>
                                    )}
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div style={{ display: "flex", gap: 0, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                                {[
                                    { label: "Total Documents", value: String(complianceForms.length + clinicalNotes.length + billingDocs.length + generalDocs.length), color: "var(--fg)" },
                                    { label: "Compliance Rate", value: `${compRate}%`, color: compRate === 100 ? "var(--success)" : compRate >= 70 ? "var(--warning)" : "var(--danger)" },
                                    { label: "Signed Forms", value: String(signedCount), color: "var(--success)" },
                                    { label: "Pending Signatures", value: String(pendingCount + notStartedCount), color: pendingCount + notStartedCount > 0 ? "var(--warning)" : "var(--muted)" },
                                    { label: "Expired", value: String(expiredCount), color: expiredCount > 0 ? "var(--danger)" : "var(--muted)" },
                                    { label: "Clinical Notes", value: String(clinicalNotes.length), color: "var(--primary)" },
                                ].map((stat, i) => (
                                    <div key={stat.label} style={{ flex: 1, paddingLeft: i > 0 ? 16 : 0, borderLeft: i > 0 ? "1px solid var(--border)" : "none", marginLeft: i > 0 ? 16 : 0 }}>
                                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8.5, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{stat.label}</div>
                                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Folder Tabs */}
            <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: 4, width: "fit-content" }}>
                {folderTabs.map((tab) => (
                    <button key={tab.key} onClick={() => setFolderTab(tab.key)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif", background: folderTab === tab.key ? "var(--primary)" : "transparent", color: folderTab === tab.key ? "#fff" : "var(--muted)", transition: "all 0.18s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 7 }}>
                        {tab.label}
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, background: folderTab === tab.key ? "rgba(255,255,255,0.25)" : "var(--surface)", padding: "1px 7px", borderRadius: 20, color: folderTab === tab.key ? "#fff" : "var(--muted)" }}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* ── TAB: COMPLIANCE FORMS ── */}
            {folderTab === "compliance" && (
                <div>
                    {/* Summary mini cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                        {[
                            { label: "Signed", value: signedCount, color: "var(--success)", bg: "var(--success-light)", icon: "✅" },
                            { label: "Pending", value: pendingCount, color: "var(--warning)", bg: "var(--warning-light)", icon: "⏳" },
                            { label: "Not Started", value: notStartedCount, color: "#888", bg: "#F2F2F2", icon: "⬜" },
                            { label: "Expired", value: expiredCount, color: "var(--danger)", bg: "var(--danger-light)", icon: "❌" },
                        ].map((s) => (
                            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}28`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontSize: 20 }}>{s.icon}</span>
                                <div>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: 11.5, color: s.color, fontWeight: 600, opacity: 0.8 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Compliance Progress Bar */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>Overall Compliance</span>
                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: compRate === 100 ? "var(--success)" : compRate >= 70 ? "var(--warning)" : "var(--danger)" }}>{compRate}%</span>
                            </div>
                            <div style={{ height: 10, background: "var(--border)", borderRadius: 10, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${compRate}%`, background: compRate === 100 ? "var(--success)" : compRate >= 70 ? `linear-gradient(90deg, var(--warning), var(--success))` : "var(--danger)", borderRadius: 10, transition: "width 0.8s ease" }} />
                            </div>
                        </div>
                        {notStartedCount > 0 && (
                            <button onClick={() => { setSelectedFormName(undefined); setModal("send_signature"); }} style={{ padding: "8px 16px", border: "none", borderRadius: 8, background: "var(--primary)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", boxShadow: "0 2px 8px rgba(44,122,110,0.22)", flexShrink: 0, whiteSpace: "nowrap" }}>Send {notStartedCount} Unsigned Form{notStartedCount !== 1 ? "s" : ""}</button>
                        )}
                    </div>

                    {/* Forms Table */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">HIPAA Compliance Forms</div>
                            <div className="card-meta">{signedCount}/{complianceForms.length} COMPLETED</div>
                        </div>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Form Name</th>
                                <th>Category</th>
                                <th>Required</th>
                                <th>Status</th>
                                <th>Signed Date</th>
                                <th>Expiry</th>
                                <th style={{ textAlign: "right" as const }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {complianceForms.map((entry) => {
                                const template = COMPLIANCE_FORM_TEMPLATES.find((t) => t.id === entry.formId)!;
                                const config = formStatusConfig[entry.status];
                                return (
                                    <tr key={entry.formId}>
                                        <td>
                                            <div style={{ fontWeight: 700, color: "var(--fg)", fontSize: 13.5 }}>{template.name}</div>
                                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{template.id}</div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "var(--surface)", color: "var(--fg-mid)", fontFamily: "'Space Mono', monospace" }}>{template.category}</span>
                                        </td>
                                        <td>
                                            {template.required ? (
                                                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--danger)", display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />Required
                          </span>
                                            ) : (
                                                <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>Optional</span>
                                            )}
                                        </td>
                                        <td><span className={`chip ${config.chip}`}>{config.label}</span></td>
                                        <td><span className="td-mono">{entry.signedDate || "—"}</span></td>
                                        <td>
                                            {entry.expiryDate ? (
                                                <span className="td-mono" style={{ color: entry.status === "expired" ? "var(--danger)" : "var(--fg-mid)" }}>{entry.expiryDate}</span>
                                            ) : (
                                                <span style={{ fontSize: 11.5, color: "var(--muted)" }}>No expiry</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: "right" as const }}>
                                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                {entry.status === "signed" && (
                                                    <button style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>View</button>
                                                )}
                                                {entry.status === "signed" && (
                                                    <button style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>⬇</button>
                                                )}
                                                {(entry.status === "not_started" || entry.status === "expired") && (
                                                    <button onClick={() => { setSelectedFormName(template.name); setModal("send_signature"); }} style={{ padding: "5px 11px", border: `1.5px solid ${entry.status === "expired" ? "var(--danger)" : "var(--primary)"}`, borderRadius: 7, background: entry.status === "expired" ? "var(--danger-light)" : "var(--primary-light)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: entry.status === "expired" ? "var(--danger)" : "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>
                                                        {entry.status === "expired" ? "Renew" : "Send"}
                                                    </button>
                                                )}
                                                {entry.status === "pending" && (
                                                    <button style={{ padding: "5px 11px", border: "1.5px solid var(--warning)", borderRadius: 7, background: "var(--warning-light)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--warning)", fontFamily: "'Nunito', sans-serif" }}>Resend</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── TAB: CLINICAL NOTES ── */}
            {folderTab === "notes" && (
                <div>
                    <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary-mid)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 15 }}>ℹ️</span>
                        <div style={{ fontSize: 12.5, color: "var(--primary-dark)", lineHeight: 1.6 }}>
                            Clinical notes are managed by the clinical team and are read-only in this view. To create or edit notes, use the <strong>Clinical Notes module</strong>.
                        </div>
                    </div>

                    {clinicalNotes.length === 0 ? (
                        <div className="card" style={{ padding: 40, textAlign: "center" as const }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>No clinical notes yet</div>
                            <div style={{ fontSize: 13, color: "var(--muted)" }}>Notes will appear here once the clinical team begins documenting sessions.</div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Clinical Notes</div>
                                <div className="card-meta">{clinicalNotes.length} NOTE{clinicalNotes.length !== 1 ? "S" : ""}</div>
                            </div>
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Note</th>
                                    <th>Type</th>
                                    <th>Author</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" as const }}>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {clinicalNotes.map((note) => (
                                    <tr key={note.id}>
                                        <td>
                                            <div style={{ fontWeight: 700, color: "var(--fg)", fontSize: 13.5 }}>{note.title}</div>
                                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{note.id}</div>
                                        </td>
                                        <td><span className="td-text">{note.type}</span></td>
                                        <td><span className="td-text">{note.author}</span></td>
                                        <td><span className="td-mono">{note.date}</span></td>
                                        <td>
                                            <span className={`chip ${note.status === "signed" ? "chip-active" : "chip-pending"}`}>{note.status === "signed" ? "Signed & Locked" : "Draft"}</span>
                                        </td>
                                        <td style={{ textAlign: "right" as const }}>
                                            <button style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>View</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: BILLING RECORDS ── */}
            {folderTab === "billing" && (
                <div>
                    <div style={{ background: "var(--warning-light)", border: "1px solid #f5c58a", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 15 }}>💡</span>
                        <div style={{ fontSize: 12.5, color: "var(--fg-mid)", lineHeight: 1.6 }}>Billing records are managed through the <strong>Billing & Payments module</strong> (coming soon). This is a read-only reference view.</div>
                    </div>

                    {billingDocs.length === 0 ? (
                        <div className="card" style={{ padding: 40, textAlign: "center" as const }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>💰</div>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>No billing records</div>
                            <div style={{ fontSize: 13, color: "var(--muted)" }}>Invoices and insurance claims will appear here once generated.</div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Billing Records</div>
                                <div className="card-meta">{billingDocs.length} RECORD{billingDocs.length !== 1 ? "S" : ""}</div>
                            </div>
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" as const }}>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {billingDocs.map((doc) => {
                                    const bStyle = billingStatusConfig[doc.status] || { color: "var(--muted)", bg: "var(--surface)" };
                                    return (
                                        <tr key={doc.id}>
                                            <td><span className="td-mono" style={{ color: "var(--primary)", fontWeight: 700 }}>{doc.id}</span></td>
                                            <td><span className="td-text">{doc.description}</span></td>
                                            <td>
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "var(--surface)", color: "var(--fg-mid)", fontFamily: "'Space Mono', monospace" }}>{doc.type}</span>
                                            </td>
                                            <td><span className="td-mono">{doc.date}</span></td>
                                            <td><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{doc.amount}</span></td>
                                            <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: bStyle.bg, color: bStyle.color, fontSize: 11.5, fontWeight: 700, textTransform: "capitalize" }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: bStyle.color, display: "inline-block" }} />
                              {doc.status}
                          </span>
                                            </td>
                                            <td style={{ textAlign: "right" as const }}>
                                                <button style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>View</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: GENERAL DOCUMENTS ── */}
            {folderTab === "general" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                        <button onClick={() => setModal("upload")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 2px 8px rgba(44,122,110,0.25)" }}>
                            <span style={{ fontSize: 16 }}>+</span> Upload Document
                        </button>
                    </div>

                    {generalDocs.length === 0 ? (
                        <div className="card" style={{ padding: 40, textAlign: "center" as const }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>📁</div>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>No documents uploaded</div>
                            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Upload referral letters, lab results, external reports, or any other patient documents.</div>
                            <button onClick={() => setModal("upload")} style={{ padding: "9px 20px", background: "var(--primary-light)", border: "1.5px solid var(--primary)", borderRadius: 9, color: "var(--primary)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>Upload First Document</button>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">General Documents</div>
                                <div className="card-meta">{generalDocs.length} FILE{generalDocs.length !== 1 ? "S" : ""}</div>
                            </div>
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Document Name</th>
                                    <th>Type</th>
                                    <th>Uploaded By</th>
                                    <th>Date</th>
                                    <th>Size</th>
                                    <th style={{ textAlign: "right" as const }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {generalDocs.map((doc) => (
                                    <tr key={doc.id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{fileTypeIcon[doc.fileType] || "📄"}</div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: "var(--fg)", fontSize: 13.5 }}>{doc.name}</div>
                                                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{doc.id} · {doc.fileType.toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "var(--surface)", color: "var(--fg-mid)", fontFamily: "'Space Mono', monospace" }}>{doc.type}</span></td>
                                        <td><span className="td-text">{doc.uploadedBy}</span></td>
                                        <td><span className="td-mono">{doc.date}</span></td>
                                        <td><span className="td-mono">{doc.size}</span></td>
                                        <td style={{ textAlign: "right" as const }}>
                                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                <button style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>View</button>
                                                <button style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>⬇</button>
                                                <div className="dots-menu-wrap" style={{ position: "relative", zIndex: openMenuId === doc.id ? 200 : "auto" }}>
                                                    <button className="dots-btn" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === doc.id ? null : doc.id); }}>···</button>
                                                    <div className={`dots-menu${openMenuId === doc.id ? " open" : ""}`}>
                                                        <div className="dots-menu-item"><span className="dots-menu-icon">✏️</span>Rename</div>
                                                        <div className="dots-menu-item"><span className="dots-menu-icon">📋</span>Copy Link</div>
                                                        <div className="dots-menu-item danger"><span className="dots-menu-icon">🗑️</span>Delete</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

/* ─────────────────────────────────────
   MAIN DOCUMENTS PAGE
───────────────────────────────────── */
export default function DocumentsPage() {
    const [view, setView] = useState<ViewMode>("overview");
    const [selectedPatient, setSelectedPatient] = useState<typeof MOCK_PATIENTS[0] | null>(null);
    const [overviewTab, setOverviewTab] = useState<OverviewTab>("all");
    const [modal, setModal] = useState<ModalType>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // All documents flat list for the "All" tab
    const allRecentDocs = [
        ...Object.entries(PATIENT_GENERAL_DOCS).flatMap(([pid, docs]) =>
            docs.map((d) => ({
                ...d,
                patient: MOCK_PATIENTS.find((p) => p.id === pid)!,
                category: "General Document",
                statusLabel: "active",
                statusChip: "chip-active",
            }))
        ),
        ...Object.entries(PATIENT_COMPLIANCE_FORMS).flatMap(([pid, forms]) =>
            forms
                .filter((f) => f.status !== "not_started")
                .map((f) => {
                    const template = COMPLIANCE_FORM_TEMPLATES.find((t) => t.id === f.formId)!;
                    const config = formStatusConfig[f.status];
                    return {
                        id: f.formId + "-" + pid,
                        name: template.name,
                        type: "Compliance Form",
                        uploadedBy: f.signedBy || "System",
                        date: f.signedDate || f.sentDate || "—",
                        size: "—",
                        fileType: "pdf",
                        patient: MOCK_PATIENTS.find((p) => p.id === pid)!,
                        category: "Compliance Form",
                        statusLabel: config.label,
                        statusChip: config.chip,
                    };
                })
        ),
    ]
        .sort((a, b) => {
            // Sort by date descending (simple string comparison works for "DD Mon YYYY")
            return b.date.localeCompare(a.date);
        })
        .slice(0, 20);

    // Compliance overview tab data
    const complianceOverview = MOCK_PATIENTS.map((p) => {
        const forms = PATIENT_COMPLIANCE_FORMS[p.id] || [];
        return {
            ...p,
            signed: forms.filter((f) => f.status === "signed").length,
            pending: forms.filter((f) => f.status === "pending").length,
            notStarted: forms.filter((f) => f.status === "not_started").length,
            expired: forms.filter((f) => f.status === "expired").length,
            total: forms.length,
            rate: Math.round((forms.filter((f) => f.status === "signed").length / forms.length) * 100),
        };
    });

    if (view === "patient-folder" && selectedPatient) {
        return (
            <PatientFolderView
                patient={selectedPatient}
                onBack={() => { setView("overview"); setSelectedPatient(null); }}
            />
        );
    }

    const kpis = [
        { label: "Total Documents", value: "284", trend: "↑ 22", trendSub: "this month", color: "#2C7A6E", sparkId: "dk1", points: "0,30 16,26 32,22 48,24 64,14 80,16 100,8" },
        { label: "Pending Signatures", value: "8", trend: "↓ 3", trendSub: "vs last week", color: "#D98326", sparkId: "dk2", points: "0,20 16,22 32,18 48,24 64,16 80,14 100,18" },
        { label: "Compliance Rate", value: "87%", trend: "↑ 5%", trendSub: "than last month", color: "#27A76A", sparkId: "dk3", points: "0,36 16,30 32,26 48,22 64,18 80,14 100,10" },
        { label: "Shared Folders", value: "2", trend: "— ", trendSub: "active shares", color: "#6B5ED4", sparkId: "dk4", points: "0,30 16,28 32,30 48,26 64,28 80,24 100,22" },
    ];

    const overviewTabs = [
        { key: "all" as OverviewTab, label: "All Documents" },
        { key: "compliance" as OverviewTab, label: "Compliance Tracker" },
        { key: "notes" as OverviewTab, label: "Clinical Notes" },
        { key: "billing" as OverviewTab, label: "Billing Records" },
        { key: "general" as OverviewTab, label: "General" },
    ];

    return (
        <>
            {modal === "upload" && <UploadDocumentModal onClose={() => setModal(null)} />}
            {openMenuId && <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setOpenMenuId(null)} />}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Documents</div>
                    <div className="page-subtitle">Patient records, compliance forms, clinical notes & billing documents</div>
                </div>
                <div className="header-actions">
                    <button onClick={() => setModal("upload")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)" }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Upload Document
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                {kpis.map((k) => (
                    <div key={k.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 20px 16px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)" }}>{k.label}</div>
                            <div style={{ display: "flex", gap: 3 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--muted)", display: "inline-block" }} />)}</div>
                        </div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>{k.value}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--success)" }}>{k.trend} <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 11.5 }}>{k.trendSub}</span></div>
                        <svg style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.4 }} width="100" height="44" viewBox="0 0 100 44">
                            <defs><linearGradient id={k.sparkId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity="0.3" /><stop offset="100%" stopColor={k.color} stopOpacity="0" /></linearGradient></defs>
                            <polyline points={k.points} fill="none" stroke={k.color} strokeWidth="2" />
                            <polygon points={`${k.points} 100,44 0,44`} fill={`url(#${k.sparkId})`} />
                        </svg>
                    </div>
                ))}
            </div>

            {/* Patient Folder Quick Access */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-head">
                    <div className="card-title">Patient Folders</div>
                    <div className="card-meta">CLICK A FOLDER TO OPEN</div>
                </div>
                <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                    {MOCK_PATIENTS.map((patient) => {
                        const rate = complianceRate(patient.id);
                        const docCount = (PATIENT_GENERAL_DOCS[patient.id] || []).length + (PATIENT_CLINICAL_NOTES[patient.id] || []).length + (PATIENT_BILLING_DOCS[patient.id] || []).length + (PATIENT_COMPLIANCE_FORMS[patient.id] || []).length;
                        return (
                            <div
                                key={patient.id}
                                onClick={() => { setSelectedPatient(patient); setView("patient-folder"); }}
                                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.18s", display: "flex", gap: 12, alignItems: "flex-start" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 18px rgba(44,122,110,0.14)"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                            >
                                {/* Folder icon + avatar */}
                                <div style={{ position: "relative", flexShrink: 0 }}>
                                    <div style={{ fontSize: 32 }}>📁</div>
                                    <div style={{ position: "absolute", bottom: -4, right: -4, width: 20, height: 20, borderRadius: 5, background: patient.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 8, fontWeight: 700, color: "#fff", border: "2px solid var(--card)" }}>{patient.initials}</div>
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{patient.name}</div>
                                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--primary)", marginBottom: 8 }}>{patient.id}</div>

                                    {/* Compliance mini bar */}
                                    <div style={{ marginBottom: 5 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                            <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>Compliance</span>
                                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 700, color: rate === 100 ? "var(--success)" : rate >= 70 ? "var(--warning)" : "var(--danger)" }}>{rate}%</span>
                                        </div>
                                        <div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${rate}%`, background: rate === 100 ? "var(--success)" : rate >= 70 ? "var(--warning)" : "var(--danger)", borderRadius: 4 }} />
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{docCount} documents</span>
                                        {patient.sharedWith && <span style={{ fontSize: 10, background: "var(--warning-light)", color: "var(--warning)", padding: "1px 7px", borderRadius: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>Shared</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                {overviewTabs.map((tab) => (
                    <button key={tab.key} className={`filter-tab${overviewTab === tab.key ? " active" : ""}`} onClick={() => setOverviewTab(tab.key)}>{tab.label}</button>
                ))}
                <div style={{ marginLeft: "auto", position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 13, pointerEvents: "none" }}>🔍</span>
                    <input type="text" placeholder="Search documents…" style={{ border: "1.5px solid var(--border)", borderRadius: 8, padding: "7px 14px 7px 34px", fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--fg)", background: "var(--card)", outline: "none", width: 200, transition: "border-color 0.18s" }} onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
            </div>

            {/* ── ALL DOCUMENTS TAB ── */}
            {overviewTab === "all" && (
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Recent Documents</div>
                        <div className="card-meta">ALL PATIENTS · LATEST FIRST</div>
                    </div>
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Document</th>
                            <th>Patient</th>
                            <th>Category</th>
                            <th>Uploaded / Signed By</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" as const }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {allRecentDocs.map((doc, i) => (
                            <tr key={doc.id + i}>
                                <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{fileTypeIcon[doc.fileType] || "📋"}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: "var(--fg)", fontSize: 13, lineHeight: 1.3 }}>{doc.name}</div>
                                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", marginTop: 1 }}>{doc.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 26, height: 26, borderRadius: 6, background: doc.patient?.color || "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{doc.patient?.initials}</div>
                                        <div>
                                            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)" }}>{doc.patient?.name}</div>
                                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8.5, color: "var(--muted)" }}>{doc.patient?.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: doc.category === "Compliance Form" ? "var(--purple-light)" : "var(--surface)", color: doc.category === "Compliance Form" ? "var(--purple)" : "var(--fg-mid)", fontFamily: "'Space Mono', monospace" }}>{doc.category}</span>
                                </td>
                                <td><span className="td-text">{doc.uploadedBy}</span></td>
                                <td><span className="td-mono">{doc.date}</span></td>
                                <td><span className={`chip ${(doc as any).statusChip || "chip-active"}`}>{(doc as any).statusLabel || "Active"}</span></td>
                                <td style={{ textAlign: "right" as const }}>
                                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                        <button onClick={() => { setSelectedPatient(doc.patient); setView("patient-folder"); }} style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>Open Folder</button>
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
                        <div style={{ marginLeft: "auto" }}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>Showing 1–{allRecentDocs.length} of 284 documents</span></div>
                    </div>
                </div>
            )}

            {/* ── COMPLIANCE TRACKER TAB ── */}
            {overviewTab === "compliance" && (
                <div>
                    {/* Overall compliance stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
                        {[
                            { label: "Fully Compliant Patients", value: String(complianceOverview.filter((p) => p.rate === 100).length), total: MOCK_PATIENTS.length, color: "var(--success)", icon: "✅" },
                            { label: "Partially Compliant", value: String(complianceOverview.filter((p) => p.rate > 0 && p.rate < 100).length), total: MOCK_PATIENTS.length, color: "var(--warning)", icon: "⚠️" },
                            { label: "Forms Awaiting Signature", value: String(complianceOverview.reduce((a, p) => a + p.pending + p.notStarted, 0)), total: null, color: "var(--danger)", icon: "✍️" },
                        ].map((s) => (
                            <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                                <span style={{ fontSize: 24 }}>{s.icon}</span>
                                <div>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}{s.total ? <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 400, color: "var(--muted)" }}>/{s.total}</span> : ""}</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Patient Compliance Tracker</div>
                            <div className="card-meta">HIPAA FORM STATUS</div>
                        </div>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Compliance</th>
                                <th>Signed</th>
                                <th>Pending</th>
                                <th>Not Started</th>
                                <th>Expired</th>
                                <th style={{ textAlign: "right" as const }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {complianceOverview.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${p.color} 0%, ${p.color}88 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{p.initials}</div>
                                            <div>
                                                <div className="patient-name">{p.name}</div>
                                                <div className="patient-id">{p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ minWidth: 120 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{p.signed}/{p.total}</span>
                                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, color: p.rate === 100 ? "var(--success)" : p.rate >= 70 ? "var(--warning)" : "var(--danger)" }}>{p.rate}%</span>
                                            </div>
                                            <div style={{ height: 6, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${p.rate}%`, background: p.rate === 100 ? "var(--success)" : p.rate >= 70 ? "var(--warning)" : "var(--danger)", borderRadius: 6 }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "var(--success)" }}>{p.signed}</span></td>
                                    <td><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: p.pending > 0 ? "var(--warning)" : "var(--muted)" }}>{p.pending}</span></td>
                                    <td><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: p.notStarted > 0 ? "var(--muted)" : "var(--muted)" }}>{p.notStarted}</span></td>
                                    <td><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: p.expired > 0 ? "var(--danger)" : "var(--muted)" }}>{p.expired}</span></td>
                                    <td style={{ textAlign: "right" as const }}>
                                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                            {(p.notStarted > 0 || p.expired > 0) && (
                                                <button style={{ padding: "5px 11px", border: "1.5px solid var(--warning)", borderRadius: 7, background: "var(--warning-light)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--warning)", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" }}>Send Reminder</button>
                                            )}
                                            <button onClick={() => { setSelectedPatient(MOCK_PATIENTS.find((mp) => mp.id === p.id)!); setView("patient-folder"); }} style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>Open Folder</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── CLINICAL NOTES TAB ── */}
            {overviewTab === "notes" && (
                <div>
                    <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary-mid)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 15 }}>ℹ️</span>
                        <div style={{ fontSize: 12.5, color: "var(--primary-dark)", lineHeight: 1.6 }}>
                            Clinical notes are managed through the <strong>Clinical Notes module</strong>. This view shows a read-only reference of all signed and draft notes across patients.
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">All Clinical Notes</div>
                            <div className="card-meta">{Object.values(PATIENT_CLINICAL_NOTES).flat().length} NOTES</div>
                        </div>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Note</th>
                                <th>Patient</th>
                                <th>Type</th>
                                <th>Author</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" as const }}>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Object.entries(PATIENT_CLINICAL_NOTES).flatMap(([pid, notes]) =>
                                notes.map((note) => {
                                    const patient = MOCK_PATIENTS.find((p) => p.id === pid)!;
                                    return (
                                        <tr key={note.id}>
                                            <td>
                                                <div style={{ fontWeight: 700, color: "var(--fg)", fontSize: 13.5 }}>{note.title}</div>
                                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{note.id}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: 6, background: patient?.color || "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{patient?.initials}</div>
                                                    <span className="td-text">{patient?.name}</span>
                                                </div>
                                            </td>
                                            <td><span className="td-text">{note.type}</span></td>
                                            <td><span className="td-text">{note.author}</span></td>
                                            <td><span className="td-mono">{note.date}</span></td>
                                            <td><span className={`chip ${note.status === "signed" ? "chip-active" : "chip-pending"}`}>{note.status === "signed" ? "Signed" : "Draft"}</span></td>
                                            <td style={{ textAlign: "right" as const }}>
                                                <button onClick={() => { setSelectedPatient(patient); setView("patient-folder"); }} style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>View in Folder</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button className="page-btn disabled">« Prev</button>
                            <button className="page-btn active">1</button>
                            <button className="page-btn">Next »</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── BILLING RECORDS TAB ── */}
            {overviewTab === "billing" && (
                <div>
                    <div style={{ background: "var(--warning-light)", border: "1px solid #f5c58a", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 15 }}>💡</span>
                        <div style={{ fontSize: 12.5, color: "var(--fg-mid)", lineHeight: 1.6 }}>Full billing management is coming soon in the <strong>Billing & Payments module</strong>. Below is a read-only overview of billing records across all patient folders.</div>
                    </div>
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">All Billing Records</div>
                            <div className="card-meta">{Object.values(PATIENT_BILLING_DOCS).flat().length} RECORDS</div>
                        </div>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Record ID</th>
                                <th>Patient</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Object.entries(PATIENT_BILLING_DOCS).flatMap(([pid, docs]) =>
                                    docs.map((doc) => {
                                        const patient = MOCK_PATIENTS.find((p) => p.id === pid)!;
                                        const bStyle = billingStatusConfig[doc.status] || { color: "var(--muted)", bg: "var(--surface)" };
                                        return (
                                            <tr key={doc.id}>
                                                <td><span className="td-mono" style={{ color: "var(--primary)", fontWeight: 700 }}>{doc.id}</span></td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <div style={{ width: 24, height: 24, borderRadius: 6, background: patient?.color || "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{patient?.initials}</div>
                                                        <span className="td-text">{patient?.name}</span>
                                                    </div>
                                                </td>
                                                <td><span className="td-text">{doc.description}</span></td>
                                                <td><span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "var(--surface)", color: "var(--fg-mid)", fontFamily: "'Space Mono', monospace" }}>{doc.type}</span></td>
                                                <td><span className="td-mono">{doc.date}</span></td>
                                                <td><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{doc.amount}</span></td>
                                                <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: bStyle.bg, color: bStyle.color, fontSize: 11.5, fontWeight: 700, textTransform: "capitalize" }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: bStyle.color, display: "inline-block" }} />
                              {doc.status}
                          </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── GENERAL DOCUMENTS TAB ── */}
            {overviewTab === "general" && (
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">General Documents</div>
                        <div className="card-meta">{Object.values(PATIENT_GENERAL_DOCS).flat().length} FILES</div>
                    </div>
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Document</th>
                            <th>Patient</th>
                            <th>Type</th>
                            <th>Uploaded By</th>
                            <th>Date</th>
                            <th>Size</th>
                            <th style={{ textAlign: "right" as const }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.entries(PATIENT_GENERAL_DOCS).flatMap(([pid, docs]) =>
                            docs.map((doc) => {
                                const patient = MOCK_PATIENTS.find((p) => p.id === pid)!;
                                return (
                                    <tr key={doc.id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{fileTypeIcon[doc.fileType] || "📄"}</div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: "var(--fg)", fontSize: 13.5 }}>{doc.name}</div>
                                                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", marginTop: 1 }}>{doc.id} · {doc.fileType.toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 24, height: 24, borderRadius: 6, background: patient?.color || "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{patient?.initials}</div>
                                                <span className="td-text">{patient?.name}</span>
                                            </div>
                                        </td>
                                        <td><span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "var(--surface)", color: "var(--fg-mid)", fontFamily: "'Space Mono', monospace" }}>{doc.type}</span></td>
                                        <td><span className="td-text">{doc.uploadedBy}</span></td>
                                        <td><span className="td-mono">{doc.date}</span></td>
                                        <td><span className="td-mono">{doc.size}</span></td>
                                        <td style={{ textAlign: "right" as const }}>
                                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                                <button style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>View</button>
                                                <button style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>⬇</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button className="page-btn disabled">« Prev</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">Next »</button>
                        <div style={{ marginLeft: "auto" }}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>Showing {Object.values(PATIENT_GENERAL_DOCS).flat().length} files</span></div>
                    </div>
                </div>
            )}
        </>
    );
}