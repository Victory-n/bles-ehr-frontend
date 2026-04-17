"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
type LogStatus = "success" | "failed" | "warning" | "info";
type LogModule =
    | "auth"
    | "patients"
    | "notes"
    | "billing"
    | "compliance"
    | "documents"
    | "scheduling"
    | "staff"
    | "programs"
    | "settings"
    | "system";

type LogAction =
    | "LOGIN"
    | "LOGOUT"
    | "FAILED_LOGIN"
    | "PASSWORD_CHANGE"
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "VIEW"
    | "SIGN"
    | "COSIGN"
    | "EXPORT"
    | "PRINT"
    | "UPLOAD"
    | "DOWNLOAD"
    | "SHARE"
    | "REVOKE"
    | "SUBMIT"
    | "APPROVE"
    | "REJECT"
    | "RESOLVE"
    | "REOPEN"
    | "SCAN"
    | "ASSIGN"
    | "DISCHARGE"
    | "ENROL"
    | "CLOCK_IN"
    | "CLOCK_OUT"
    | "PRESCRIBE"
    | "RECORD_PAYMENT";

type ReportTab =
    | "overview"
    | "audit_log"
    | "login_history"
    | "data_access"
    | "exports";

type ModalType = "view_log" | "export" | null;

interface AuditLog {
    id: string;
    timestamp: string;
    date: string;
    time: string;
    actorId: string;
    actorName: string;
    actorRole: string;
    actorInitials: string;
    actorColor: string;
    action: LogAction;
    module: LogModule;
    entityType: string;
    entityId: string;
    entityLabel: string;
    description: string;
    status: LogStatus;
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    changes: { field: string; from: string; to: string }[] | null;
    metadata: Record<string, string> | null;
}

/* ─────────────────────────────────────
   MOCK DATA
───────────────────────────────────── */
const MOCK_LOGS: AuditLog[] = [
    {
        id: "LOG-00142", timestamp: "2026-04-16T09:14:02Z", date: "16 Apr 2026", time: "09:14 AM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "LOGIN", module: "auth", entityType: "Session", entityId: "SESS-8821",
        entityLabel: "Staff Login", description: "Successful login from Chrome on Windows 11.",
        status: "success", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8821", changes: null, metadata: { location: "Abuja, NG", device: "Desktop" },
    },
    {
        id: "LOG-00141", timestamp: "2026-04-16T09:00:12Z", date: "16 Apr 2026", time: "09:00 AM",
        actorId: "STF-001", actorName: "Dr. Chisom Obi", actorRole: "Psychologist",
        actorInitials: "CO", actorColor: "#2C7A6E",
        action: "SIGN", module: "notes", entityType: "Clinical Note", entityId: "NOTE-005",
        entityLabel: "EMDR Session — Ngozi Eze",
        description: "Clinical note NOTE-005 signed by Dr. Chisom Obi with 6-digit security PIN. Note status changed to Signed.",
        status: "success", ipAddress: "197.210.54.82", userAgent: "Firefox 124 / macOS",
        sessionId: "SESS-8819", changes: [{ field: "status", from: "draft", to: "signed" }],
        metadata: { noteType: "Progress Note", patientId: "PAT-0135" },
    },
    {
        id: "LOG-00140", timestamp: "2026-04-16T08:55:33Z", date: "16 Apr 2026", time: "08:55 AM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "COSIGN", module: "notes", entityType: "Clinical Note", entityId: "NOTE-004",
        entityLabel: "Lithium Crisis Note — Emeka Afolabi",
        description: "Note NOTE-004 co-signed and permanently locked by Dr. Amaka Kolade. HIPAA audit trail archived.",
        status: "success", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8818", changes: [{ field: "status", from: "signed", to: "locked" }],
        metadata: { noteType: "Crisis Assessment", patientId: "PAT-0138", hipaaEvent: "true" },
    },
    {
        id: "LOG-00139", timestamp: "2026-04-16T08:45:00Z", date: "16 Apr 2026", time: "08:45 AM",
        actorId: "STF-002", actorName: "Dr. Bola Adeyemi", actorRole: "Psychiatrist",
        actorInitials: "BA", actorColor: "#6B5ED4",
        action: "UPDATE", module: "patients", entityType: "Patient Record", entityId: "PAT-0138",
        entityLabel: "Emeka Afolabi — PAT-0138",
        description: "Patient record PAT-0138 updated. Medication field modified: Lithium dose adjusted.",
        status: "success", ipAddress: "197.210.54.90", userAgent: "Safari 17 / macOS",
        sessionId: "SESS-8817", changes: [{ field: "medication.lithium", from: "900mg", to: "1200mg" }],
        metadata: { patientId: "PAT-0138", section: "Medications" },
    },
    {
        id: "LOG-00138", timestamp: "2026-04-16T08:30:22Z", date: "16 Apr 2026", time: "08:30 AM",
        actorId: "STF-005", actorName: "Nurse Rita Bello", actorRole: "Psychiatric Nurse",
        actorInitials: "RB", actorColor: "#4A9E91",
        action: "CLOCK_IN", module: "scheduling", entityType: "Attendance", entityId: "ATT-0416-005",
        entityLabel: "Clock In — Nurse R. Bello",
        description: "Nurse Rita Bello clocked in at 07:45 AM. Attendance recorded for 16 Apr 2026.",
        status: "success", ipAddress: "197.210.54.88", userAgent: "Chrome 123 / Android",
        sessionId: "SESS-8816", changes: null, metadata: { clockTime: "07:45 AM", method: "manual" },
    },
    {
        id: "LOG-00137", timestamp: "2026-04-15T17:10:44Z", date: "15 Apr 2026", time: "05:10 PM",
        actorId: "STF-001", actorName: "Dr. Chisom Obi", actorRole: "Psychologist",
        actorInitials: "CO", actorColor: "#2C7A6E",
        action: "EXPORT", module: "notes", entityType: "Clinical Note", entityId: "NOTE-005",
        entityLabel: "EMDR Note — Ngozi Eze",
        description: "Clinical note NOTE-005 exported as PDF by Dr. Chisom Obi.",
        status: "success", ipAddress: "197.210.54.82", userAgent: "Firefox 124 / macOS",
        sessionId: "SESS-8814", changes: null, metadata: { format: "PDF", fileSize: "184 KB" },
    },
    {
        id: "LOG-00136", timestamp: "2026-04-15T16:45:00Z", date: "15 Apr 2026", time: "04:45 PM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "SCAN", module: "compliance", entityType: "Compliance Scan", entityId: "SCAN-0415",
        entityLabel: "Full Compliance Scan",
        description: "Full compliance scan executed by Dr. Amaka Kolade. Detected 3 new alerts, 5 skipped (already open).",
        status: "success", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8813", changes: null,
        metadata: { newAlerts: "3", skipped: "5", scanType: "full", duration: "4.2s" },
    },
    {
        id: "LOG-00135", timestamp: "2026-04-15T15:30:11Z", date: "15 Apr 2026", time: "03:30 PM",
        actorId: "STF-002", actorName: "Dr. Bola Adeyemi", actorRole: "Psychiatrist",
        actorInitials: "BA", actorColor: "#6B5ED4",
        action: "SHARE", module: "documents", entityType: "Patient Folder", entityId: "PAT-0141",
        entityLabel: "Chidi Nwosu — Folder Share",
        description: "Patient folder for Chidi Nwosu (PAT-0141) shared with Lagos General Hospital. Expiry: 30 days. ROI form CF-004 on file.",
        status: "warning", ipAddress: "197.210.54.90", userAgent: "Safari 17 / macOS",
        sessionId: "SESS-8812", changes: null,
        metadata: { sharedWith: "Lagos General Hospital", expiryDays: "30", accessLevel: "view", hipaaEvent: "true" },
    },
    {
        id: "LOG-00134", timestamp: "2026-04-15T14:20:00Z", date: "15 Apr 2026", time: "02:20 PM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "CREATE", module: "billing", entityType: "Billing Record", entityId: "BLR-0002",
        entityLabel: "Psychiatric Evaluation — Chidi Nwosu",
        description: "New billing record BLR-0002 created for Chidi Nwosu. CPT 90801, ₦350,000. Payer: AXA Mansard.",
        status: "success", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8811", changes: null,
        metadata: { cptCode: "90801", amount: "₦350,000", payer: "AXA Mansard", patientId: "PAT-0141" },
    },
    {
        id: "LOG-00133", timestamp: "2026-04-15T13:00:00Z", date: "15 Apr 2026", time: "01:00 PM",
        actorId: "STF-006", actorName: "M. Sule", actorRole: "Counsellor",
        actorInitials: "MS", actorColor: "#7A9490",
        action: "FAILED_LOGIN", module: "auth", entityType: "Session", entityId: "SESS-FAIL-0415",
        entityLabel: "Failed Login Attempt",
        description: "3 consecutive failed login attempts for M. Sule. Account temporarily locked for 30 minutes per security policy.",
        status: "failed", ipAddress: "105.112.20.44", userAgent: "Chrome 122 / Windows 10",
        sessionId: "N/A", changes: null,
        metadata: { attempts: "3", lockDuration: "30 min", alertSent: "true" },
    },
    {
        id: "LOG-00132", timestamp: "2026-04-15T11:45:00Z", date: "15 Apr 2026", time: "11:45 AM",
        actorId: "STF-001", actorName: "Dr. Chisom Obi", actorRole: "Psychologist",
        actorInitials: "CO", actorColor: "#2C7A6E",
        action: "UPLOAD", module: "documents", entityType: "Document", entityId: "DOC-0135-002",
        entityLabel: "Court Referral Order — Ngozi Eze",
        description: "Document 'Court Referral Order' uploaded to Ngozi Eze's general documents folder.",
        status: "success", ipAddress: "197.210.54.82", userAgent: "Firefox 124 / macOS",
        sessionId: "SESS-8810", changes: null,
        metadata: { fileSize: "420 KB", fileType: "PDF", category: "Legal Document", patientId: "PAT-0135" },
    },
    {
        id: "LOG-00131", timestamp: "2026-04-15T10:30:00Z", date: "15 Apr 2026", time: "10:30 AM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "RESOLVE", module: "compliance", entityType: "Compliance Alert", entityId: "ALT-0007",
        entityLabel: "Telehealth Consent — Ngozi Eze",
        description: "Compliance alert ALT-0007 resolved. Patient signed Telehealth Consent form (CF-007). Resolution note recorded.",
        status: "success", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8809", changes: [{ field: "status", from: "open", to: "resolved" }],
        metadata: { alertType: "missing_document", resolvedBy: "Dr. A. Kolade" },
    },
    {
        id: "LOG-00130", timestamp: "2026-04-15T09:15:00Z", date: "15 Apr 2026", time: "09:15 AM",
        actorId: "STF-004", actorName: "Dr. Femi Eze", actorRole: "Counsellor",
        actorInitials: "FE", actorColor: "#D98326",
        action: "CREATE", module: "notes", entityType: "Clinical Note", entityId: "NOTE-008",
        entityLabel: "SUD Counselling Draft — Kunle Balogun",
        description: "New draft clinical note NOTE-008 created for Kunle Balogun. SUD Counselling — Relapse Risk Review.",
        status: "success", ipAddress: "197.210.54.93", userAgent: "Chrome 123 / Windows 10",
        sessionId: "SESS-8808", changes: null,
        metadata: { noteType: "Progress Note", patientId: "PAT-0128", status: "draft" },
    },
    {
        id: "LOG-00129", timestamp: "2026-04-14T17:00:00Z", date: "14 Apr 2026", time: "05:00 PM",
        actorId: "STF-002", actorName: "Dr. Bola Adeyemi", actorRole: "Psychiatrist",
        actorInitials: "BA", actorColor: "#6B5ED4",
        action: "LOGOUT", module: "auth", entityType: "Session", entityId: "SESS-8806",
        entityLabel: "Staff Logout",
        description: "Dr. Bola Adeyemi logged out. Session duration: 8h 45m.",
        status: "info", ipAddress: "197.210.54.90", userAgent: "Safari 17 / macOS",
        sessionId: "SESS-8806", changes: null, metadata: { sessionDuration: "8h 45m" },
    },
    {
        id: "LOG-00128", timestamp: "2026-04-14T16:00:00Z", date: "14 Apr 2026", time: "04:00 PM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "CREATE", module: "staff", entityType: "Staff Account", entityId: "STF-NEW-001",
        entityLabel: "New Staff Account Created",
        description: "New staff member account created. Temporary credentials generated and issued. Role: Counsellor.",
        status: "success", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8805", changes: null,
        metadata: { newStaffRole: "Counsellor", credentialsIssued: "true" },
    },
    {
        id: "LOG-00127", timestamp: "2026-04-14T14:30:00Z", date: "14 Apr 2026", time: "02:30 PM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "RECORD_PAYMENT", module: "billing", entityType: "Payment", entityId: "PAY-0001",
        entityLabel: "Payment — Ngozi Eze ₦200,000",
        description: "Payment of ₦200,000 recorded for Ngozi Eze via Bank Transfer. Ref: TRF240411-NGZ.",
        status: "success", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8804", changes: null,
        metadata: { amount: "₦200,000", method: "bank_transfer", patientId: "PAT-0135", reference: "TRF240411-NGZ" },
    },
    {
        id: "LOG-00126", timestamp: "2026-04-14T11:00:00Z", date: "14 Apr 2026", time: "11:00 AM",
        actorId: "STF-004", actorName: "Dr. Femi Eze", actorRole: "Counsellor",
        actorInitials: "FE", actorColor: "#D98326",
        action: "ASSIGN", module: "patients", entityType: "Patient Assignment", entityId: "PAT-0128",
        entityLabel: "Kunle Balogun — Reassigned",
        description: "Patient PAT-0128 (Kunle Balogun) reassigned from M. Sule to Dr. Femi Eze due to staff suspension.",
        status: "success", ipAddress: "197.210.54.93", userAgent: "Chrome 123 / Windows 10",
        sessionId: "SESS-8803", changes: [{ field: "assignedStaff", from: "M. Sule", to: "Dr. Femi Eze" }],
        metadata: { patientId: "PAT-0128", reason: "staff_suspension" },
    },
    {
        id: "LOG-00125", timestamp: "2026-04-14T09:30:00Z", date: "14 Apr 2026", time: "09:30 AM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "UPDATE", module: "staff", entityType: "Staff Account", entityId: "STF-006",
        entityLabel: "M. Sule — Status Changed",
        description: "Staff member M. Sule (STF-006) suspended. Reason: 3 consecutive failed performance reviews. Platform access revoked.",
        status: "warning", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8802", changes: [{ field: "status", from: "active", to: "suspended" }],
        metadata: { staffId: "STF-006", reason: "performance_review", accessRevoked: "true" },
    },
    {
        id: "LOG-00124", timestamp: "2026-04-13T15:00:00Z", date: "13 Apr 2026", time: "03:00 PM",
        actorId: "STF-002", actorName: "Dr. Bola Adeyemi", actorRole: "Psychiatrist",
        actorInitials: "BA", actorColor: "#6B5ED4",
        action: "SUBMIT", module: "billing", entityType: "Billing Record", entityId: "BLR-0003",
        entityLabel: "Claim Submitted — Emeka Afolabi",
        description: "Billing claim BLR-0003 for Emeka Afolabi submitted to NHIS. CPT 90837, ₦180,000.",
        status: "success", ipAddress: "197.210.54.90", userAgent: "Safari 17 / macOS",
        sessionId: "SESS-8800", changes: [{ field: "status", from: "ready", to: "submitted" }],
        metadata: { cptCode: "90837", amount: "₦180,000", payer: "NHIS", submittedAt: "11 Apr 2026" },
    },
    {
        id: "LOG-00123", timestamp: "2026-04-13T10:00:00Z", date: "13 Apr 2026", time: "10:00 AM",
        actorId: "STF-001", actorName: "Dr. Chisom Obi", actorRole: "Psychologist",
        actorInitials: "CO", actorColor: "#2C7A6E",
        action: "CREATE", module: "patients", entityType: "Patient Record", entityId: "PAT-0141",
        entityLabel: "Chidi Nwosu — New Admission",
        description: "New patient Chidi Nwosu (PAT-0141) registered. Diagnosis: Generalised Anxiety Disorder. Referred by GP.",
        status: "success", ipAddress: "197.210.54.82", userAgent: "Firefox 124 / macOS",
        sessionId: "SESS-8799", changes: null,
        metadata: { diagnosis: "Generalised Anxiety Disorder", admissionType: "outpatient", referredBy: "GP" },
    },
    {
        id: "LOG-00122", timestamp: "2026-04-12T16:30:00Z", date: "12 Apr 2026", time: "04:30 PM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "VIEW", module: "notes", entityType: "Clinical Note", entityId: "NOTE-004",
        entityLabel: "Crisis Note — Emeka Afolabi",
        description: "Sensitive crisis note NOTE-004 accessed by Dr. Amaka Kolade for supervision review.",
        status: "info", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8797", changes: null,
        metadata: { reason: "supervision_review", sensitiveRecord: "true" },
    },
    {
        id: "LOG-00121", timestamp: "2026-04-12T14:00:00Z", date: "12 Apr 2026", time: "02:00 PM",
        actorId: "STF-002", actorName: "Dr. Bola Adeyemi", actorRole: "Psychiatrist",
        actorInitials: "BA", actorColor: "#6B5ED4",
        action: "DISCHARGE", module: "programs", entityType: "Program Enrollment", entityId: "ENR-004",
        entityLabel: "Chidi Nwosu — Program Removed",
        description: "Patient Chidi Nwosu removed from CBT Programme (PRG-001). Clinical justification documented.",
        status: "warning", ipAddress: "197.210.54.90", userAgent: "Safari 17 / macOS",
        sessionId: "SESS-8796", changes: [{ field: "enrollmentStatus", from: "active", to: "discharged" }],
        metadata: { programId: "PRG-001", patientId: "PAT-0141", justification: "documented" },
    },
    {
        id: "LOG-00120", timestamp: "2026-04-11T09:00:00Z", date: "11 Apr 2026", time: "09:00 AM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "PASSWORD_CHANGE", module: "auth", entityType: "Account Security", entityId: "STF-003",
        entityLabel: "Password Updated — Dr. A. Kolade",
        description: "Account password changed by Dr. Amaka Kolade. 2FA verification required. Previous session invalidated.",
        status: "success", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8793", changes: null,
        metadata: { twoFAUsed: "true", previousSessionsInvalidated: "true" },
    },
    {
        id: "LOG-00119", timestamp: "2026-04-10T11:30:00Z", date: "10 Apr 2026", time: "11:30 AM",
        actorId: "STF-001", actorName: "Dr. Chisom Obi", actorRole: "Psychologist",
        actorInitials: "CO", actorColor: "#2C7A6E",
        action: "ENROL", module: "programs", entityType: "Program Enrollment", entityId: "ENR-003",
        entityLabel: "Ngozi Eze — Enrolled in EMDR",
        description: "Ngozi Eze (PAT-0135) enrolled in Trauma Recovery & EMDR Programme (PRG-004).",
        status: "success", ipAddress: "197.210.54.82", userAgent: "Firefox 124 / macOS",
        sessionId: "SESS-8790", changes: null,
        metadata: { programId: "PRG-004", patientId: "PAT-0135", sessionCount: "20" },
    },
    {
        id: "LOG-00118", timestamp: "2026-04-09T16:45:00Z", date: "09 Apr 2026", time: "04:45 PM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "PRESCRIBE", module: "patients", entityType: "Prescription", entityId: "RX-0138-002",
        entityLabel: "Lithium Prescription — Emeka Afolabi",
        description: "Prescription updated for Emeka Afolabi. Lithium Carbonate titrated from 900mg to 1200mg daily.",
        status: "warning", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8788", changes: [{ field: "Lithium Carbonate", from: "900mg OD", to: "1200mg OD" }],
        metadata: { patientId: "PAT-0138", drug: "Lithium Carbonate", hipaaEvent: "true" },
    },
    {
        id: "LOG-00117", timestamp: "2026-04-09T08:05:00Z", date: "09 Apr 2026", time: "08:05 AM",
        actorId: "STF-002", actorName: "Dr. Bola Adeyemi", actorRole: "Psychiatrist",
        actorInitials: "BA", actorColor: "#6B5ED4",
        action: "LOGIN", module: "auth", entityType: "Session", entityId: "SESS-8787",
        entityLabel: "Staff Login",
        description: "Successful login from Safari on macOS.",
        status: "success", ipAddress: "197.210.54.90", userAgent: "Safari 17 / macOS",
        sessionId: "SESS-8787", changes: null, metadata: { location: "Lagos, NG", device: "Desktop" },
    },
    {
        id: "LOG-00116", timestamp: "2026-04-08T15:00:00Z", date: "08 Apr 2026", time: "03:00 PM",
        actorId: "STF-003", actorName: "Dr. Amaka Kolade", actorRole: "Admin · Psychiatrist",
        actorInitials: "AK", actorColor: "#27A76A",
        action: "UPDATE", module: "settings", entityType: "System Settings", entityId: "SYS-001",
        entityLabel: "2FA Policy Updated",
        description: "Platform 2FA requirement enforced for all staff accounts. Previous setting: optional. New setting: mandatory.",
        status: "success", ipAddress: "197.210.54.81", userAgent: "Chrome 123 / Windows 11",
        sessionId: "SESS-8785", changes: [{ field: "twoFARequired", from: "optional", to: "mandatory" }],
        metadata: { settingCategory: "security", affectedAccounts: "24" },
    },
    {
        id: "LOG-00115", timestamp: "2026-04-08T10:00:00Z", date: "08 Apr 2026", time: "10:00 AM",
        actorId: "STF-001", actorName: "Dr. Chisom Obi", actorRole: "Psychologist",
        actorInitials: "CO", actorColor: "#2C7A6E",
        action: "REJECT", module: "billing", entityType: "Billing Record", entityId: "BLR-0006",
        entityLabel: "Rejected Claim — Kunle Balogun",
        description: "NHIS claim BLR-0006 for Kunle Balogun rejected. Reason: Service not covered under current plan.",
        status: "failed", ipAddress: "197.210.54.82", userAgent: "Firefox 124 / macOS",
        sessionId: "SESS-8783", changes: [{ field: "status", from: "submitted", to: "rejected" }],
        metadata: { cptCode: "90853", payer: "NHIS", denialCode: "PR-204", patientId: "PAT-0128" },
    },
];

/* ─────────────────────────────────────
   CONFIG MAPS
───────────────────────────────────── */
const actionConfig: Record<LogAction, { label: string; color: string; bg: string; icon: string }> = {
    LOGIN:          { label: "Login",           color: "var(--success)",  bg: "var(--success-light)",  icon: "🔓" },
    LOGOUT:         { label: "Logout",          color: "var(--muted)",    bg: "#F2F2F2",               icon: "🚪" },
    FAILED_LOGIN:   { label: "Failed Login",    color: "var(--danger)",   bg: "var(--danger-light)",   icon: "⛔" },
    PASSWORD_CHANGE:{ label: "Password Change", color: "#b45309",         bg: "var(--warning-light)",  icon: "🔑" },
    CREATE:         { label: "Created",         color: "var(--primary)",  bg: "var(--primary-light)",  icon: "➕" },
    UPDATE:         { label: "Updated",         color: "var(--purple)",   bg: "var(--purple-light)",   icon: "✏️" },
    DELETE:         { label: "Deleted",         color: "var(--danger)",   bg: "var(--danger-light)",   icon: "🗑️" },
    VIEW:           { label: "Viewed",          color: "#888",            bg: "#F2F2F2",               icon: "👁" },
    SIGN:           { label: "Signed",          color: "var(--success)",  bg: "var(--success-light)",  icon: "✍️" },
    COSIGN:         { label: "Co-signed",       color: "var(--purple)",   bg: "var(--purple-light)",   icon: "🔒" },
    EXPORT:         { label: "Exported",        color: "var(--primary)",  bg: "var(--primary-light)",  icon: "📤" },
    PRINT:          { label: "Printed",         color: "#888",            bg: "#F2F2F2",               icon: "🖨️" },
    UPLOAD:         { label: "Uploaded",        color: "var(--primary)",  bg: "var(--primary-light)",  icon: "📎" },
    DOWNLOAD:       { label: "Downloaded",      color: "#888",            bg: "#F2F2F2",               icon: "⬇️" },
    SHARE:          { label: "Shared",          color: "#b45309",         bg: "var(--warning-light)",  icon: "🔗" },
    REVOKE:         { label: "Revoked",         color: "var(--danger)",   bg: "var(--danger-light)",   icon: "🔴" },
    SUBMIT:         { label: "Submitted",       color: "var(--primary)",  bg: "var(--primary-light)",  icon: "📤" },
    APPROVE:        { label: "Approved",        color: "var(--success)",  bg: "var(--success-light)",  icon: "✅" },
    REJECT:         { label: "Rejected",        color: "var(--danger)",   bg: "var(--danger-light)",   icon: "❌" },
    RESOLVE:        { label: "Resolved",        color: "var(--success)",  bg: "var(--success-light)",  icon: "✅" },
    REOPEN:         { label: "Reopened",        color: "#b45309",         bg: "var(--warning-light)",  icon: "♻️" },
    SCAN:           { label: "Scan Run",        color: "var(--primary)",  bg: "var(--primary-light)",  icon: "🔍" },
    ASSIGN:         { label: "Assigned",        color: "var(--purple)",   bg: "var(--purple-light)",   icon: "👤" },
    DISCHARGE:      { label: "Discharged",      color: "#b45309",         bg: "var(--warning-light)",  icon: "🚪" },
    ENROL:          { label: "Enrolled",        color: "var(--success)",  bg: "var(--success-light)",  icon: "📋" },
    CLOCK_IN:       { label: "Clocked In",      color: "var(--success)",  bg: "var(--success-light)",  icon: "⏰" },
    CLOCK_OUT:      { label: "Clocked Out",     color: "var(--muted)",    bg: "#F2F2F2",               icon: "🕐" },
    PRESCRIBE:      { label: "Prescribed",      color: "#b45309",         bg: "var(--warning-light)",  icon: "💊" },
    RECORD_PAYMENT: { label: "Payment Recorded",color: "var(--success)",  bg: "var(--success-light)",  icon: "💰" },
};

const moduleConfig: Record<LogModule, { label: string; color: string; bg: string; icon: string }> = {
    auth:        { label: "Authentication", color: "var(--fg)",     bg: "#F2F2F2",               icon: "🔐" },
    patients:    { label: "Patients",       color: "var(--primary)",bg: "var(--primary-light)",  icon: "🧑‍⚕️" },
    notes:       { label: "Clinical Notes", color: "var(--purple)", bg: "var(--purple-light)",   icon: "📝" },
    billing:     { label: "Billing",        color: "var(--success)",bg: "var(--success-light)",  icon: "💳" },
    compliance:  { label: "Compliance",     color: "var(--danger)", bg: "var(--danger-light)",   icon: "🛡️" },
    documents:   { label: "Documents",      color: "#b45309",       bg: "var(--warning-light)",  icon: "📄" },
    scheduling:  { label: "Scheduling",     color: "var(--primary)",bg: "var(--primary-light)",  icon: "📅" },
    staff:       { label: "Staff",          color: "var(--purple)", bg: "var(--purple-light)",   icon: "👥" },
    programs:    { label: "Programs",       color: "var(--primary)",bg: "var(--primary-light)",  icon: "📋" },
    settings:    { label: "Settings",       color: "#888",          bg: "#F2F2F2",               icon: "⚙️" },
    system:      { label: "System",         color: "var(--fg)",     bg: "#F2F2F2",               icon: "🖥️" },
};

const statusConfig: Record<LogStatus, { label: string; chip: string; dot: string }> = {
    success: { label: "Success", chip: "chip-active",   dot: "var(--success)" },
    failed:  { label: "Failed",  chip: "chip-critical", dot: "var(--danger)"  },
    warning: { label: "Warning", chip: "chip-pending",  dot: "var(--warning)" },
    info:    { label: "Info",    chip: "chip-inactive", dot: "#888"           },
};

/* ─────────────────────────────────────
   VIEW LOG MODAL
───────────────────────────────────── */
function ViewLogModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
    const act = actionConfig[log.action];
    const mod = moduleConfig[log.module];
    const sta = statusConfig[log.status];
    const isHipaa = log.metadata?.hipaaEvent === "true" || log.metadata?.sensitiveRecord === "true";

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 680, maxHeight: "92vh", overflow: "hidden", boxShadow: "0 32px 80px rgba(25,40,37,0.22)", display: "flex", flexDirection: "column" }}>
                {/* Colour strip */}
                <div style={{ height: 4, background: sta.dot }} />

                {/* Header */}
                <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "3px 9px", borderRadius: 5 }}>{log.id}</span>
                            <span className={`chip ${sta.chip}`}>{sta.label}</span>
                            {isHipaa && (
                                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "var(--danger-light)", color: "var(--danger)", border: "1px solid var(--danger)", fontFamily: "'Space Mono', monospace" }}>
                                    🛡️ HIPAA EVENT
                                </span>
                            )}
                        </div>
                        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 700, color: "var(--fg)", marginBottom: 4 }}>{act.icon} {act.label} — {log.entityLabel}</h2>
                        <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{log.date} at {log.time} · IP {log.ipAddress}</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
                </div>

                <div style={{ flex: 1, overflow: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Description */}
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", fontSize: 13.5, color: "var(--fg-mid)", lineHeight: 1.7 }}>
                        {log.description}
                    </div>

                    {/* Detail grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                        {[
                            { label: "Actor", value: `${log.actorName} (${log.actorId})` },
                            { label: "Role", value: log.actorRole },
                            { label: "Module", value: `${mod.icon} ${mod.label}` },
                            { label: "Action", value: `${act.icon} ${act.label}` },
                            { label: "Entity", value: `${log.entityType} — ${log.entityId}` },
                            { label: "Session ID", value: log.sessionId },
                            { label: "IP Address", value: log.ipAddress },
                            { label: "User Agent", value: log.userAgent },
                            { label: "Timestamp", value: `${log.date} ${log.time}` },
                        ].map(row => (
                            <div key={row.label}>
                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{row.label}</div>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Changes diff */}
                    {log.changes && log.changes.length > 0 && (
                        <div>
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Field Changes</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {log.changes.map((change, i) => (
                                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto", gap: 10, alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: "10px 14px" }}>
                                        <div>
                                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", marginBottom: 3 }}>FIELD</div>
                                            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)" }}>{change.field}</div>
                                        </div>
                                        <div>
                                            <div style={{ background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontFamily: "'Space Mono', monospace", color: "var(--danger)", fontWeight: 700 }}>
                                                — {change.from}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ background: "var(--success-light)", border: "1px solid var(--success)", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontFamily: "'Space Mono', monospace", color: "var(--success)", fontWeight: 700 }}>
                                                + {change.to}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: 16 }}>→</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div>
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Additional Metadata</div>
                            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {Object.entries(log.metadata).map(([k, v]) => (
                                    <div key={k} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", fontWeight: 700, flexShrink: 0 }}>{k}:</span>
                                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--fg)", fontWeight: 600 }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* HIPAA notice */}
                    {isHipaa && (
                        <div style={{ background: "var(--danger-light)", border: "1px solid var(--danger)", borderRadius: 10, padding: "11px 14px", display: "flex", gap: 9 }}>
                            <span style={{ fontSize: 14, flexShrink: 0 }}>🛡️</span>
                            <div style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600, lineHeight: 1.6 }}>
                                This event involves Protected Health Information (PHI). It is permanently logged per HIPAA Security Rule §164.312(b) and cannot be altered or deleted.
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ padding: "14px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
                    <button onClick={onClose} style={{ padding: "9px 22px", border: "none", borderRadius: 9, background: "var(--primary)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif" }}>Close</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   EXPORT MODAL
───────────────────────────────────── */
function ExportModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({ format: "csv", dateFrom: "2026-04-01", dateTo: "2026-04-16", module: "all", status: "all", actor: "all" });
    const [exporting, setExporting] = useState(false);
    const [done, setDone] = useState(false);

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(25,40,37,0.58)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
             onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 520, boxShadow: "0 28px 72px rgba(25,40,37,0.22)", overflow: "hidden" }}>
                <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--border)", background: "var(--primary-xlight)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: "var(--fg)" }}>Export Audit Report</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Download filtered audit logs for compliance or regulatory review</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 15, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                {done ? (
                    <div style={{ padding: "40px 28px", textAlign: "center" }}>
                        <div style={{ fontSize: 42, marginBottom: 14 }}>📥</div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>Export Ready</div>
                        <div style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 20 }}>Your audit report has been generated. The download will begin automatically.</div>
                        <button onClick={onClose} style={{ padding: "10px 28px", border: "none", borderRadius: 9, background: "var(--primary)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif" }}>Done</button>
                    </div>
                ) : (
                    <>
                        <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
                            {/* Date range */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Date From</label>
                                    <input className="form-input" type="date" value={form.dateFrom} onChange={e => setForm(p => ({ ...p, dateFrom: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Date To</label>
                                    <input className="form-input" type="date" value={form.dateTo} onChange={e => setForm(p => ({ ...p, dateTo: e.target.value }))} />
                                </div>
                            </div>

                            {/* Module + Status */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Module</label>
                                    <select className="form-input" value={form.module} onChange={e => setForm(p => ({ ...p, module: e.target.value }))} style={{ cursor: "pointer" }}>
                                        <option value="all">All Modules</option>
                                        {Object.entries(moduleConfig).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Status</label>
                                    <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ cursor: "pointer" }}>
                                        <option value="all">All Statuses</option>
                                        <option value="success">Success</option>
                                        <option value="failed">Failed</option>
                                        <option value="warning">Warning</option>
                                        <option value="info">Info</option>
                                    </select>
                                </div>
                            </div>

                            {/* Format */}
                            <div>
                                <label className="form-label">Export Format</label>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                                    {[{ v: "csv", label: "CSV", icon: "📊" }, { v: "pdf", label: "PDF Report", icon: "📄" }, { v: "json", label: "JSON", icon: "🔧" }].map(f => (
                                        <button key={f.v} onClick={() => setForm(p => ({ ...p, format: f.v }))} style={{ padding: "10px", border: `1.5px solid ${form.format === f.v ? "var(--primary)" : "var(--border)"}`, borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, background: form.format === f.v ? "var(--primary-light)" : "var(--card)", color: form.format === f.v ? "var(--primary)" : "var(--muted)", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                            <span style={{ fontSize: 20 }}>{f.icon}</span>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: "var(--warning-light)", border: "1px solid #f5c58a", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 9 }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
                                <div style={{ fontSize: 12, color: "var(--fg-mid)", lineHeight: 1.6 }}>
                                    Audit log exports are themselves logged as actions per HIPAA policy. This export will record who generated the report and when.
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid var(--border)", borderRadius: 9, background: "var(--card)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>Cancel</button>
                            <button onClick={() => { setExporting(true); setTimeout(() => { setExporting(false); setDone(true); }, 1500); }} disabled={exporting} style={{ padding: "10px 24px", border: "none", borderRadius: 9, background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)", opacity: exporting ? 0.8 : 1, display: "flex", alignItems: "center", gap: 8 }}>
                                {exporting ? (
                                    <>
                                        <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                        </svg>
                                        Generating…
                                    </>
                                ) : `⬇ Export ${form.format.toUpperCase()}`}
                            </button>
                        </div>
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<ReportTab>("overview");
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [moduleFilter, setModuleFilter] = useState<LogModule | "all">("all");
    const [statusFilter, setStatusFilter] = useState<LogStatus | "all">("all");
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [actorFilter, setActorFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [filterTab, setFilterTab] = useState(0);

    /* ── Derived ── */
    const totalLogs = MOCK_LOGS.length;
    const failedLogs = MOCK_LOGS.filter(l => l.status === "failed").length;
    const warningLogs = MOCK_LOGS.filter(l => l.status === "warning").length;
    const hipaaEvents = MOCK_LOGS.filter(l => l.metadata?.hipaaEvent === "true" || l.metadata?.sensitiveRecord === "true").length;
    const todayLogs = MOCK_LOGS.filter(l => l.date === "16 Apr 2026").length;
    const loginAttempts = MOCK_LOGS.filter(l => l.module === "auth").length;
    const uniqueActors = [...new Set(MOCK_LOGS.map(l => l.actorName))];

    const filterTabs = [
        { label: "All Events", count: MOCK_LOGS.length },
        { label: "Auth", count: MOCK_LOGS.filter(l => l.module === "auth").length },
        { label: "Clinical", count: MOCK_LOGS.filter(l => ["notes","patients","compliance"].includes(l.module)).length },
        { label: "Billing", count: MOCK_LOGS.filter(l => l.module === "billing").length },
        { label: "Security Alerts", count: MOCK_LOGS.filter(l => l.status === "failed" || l.status === "warning").length },
        { label: "HIPAA Events", count: hipaaEvents },
    ];

    const filteredLogs = useMemo(() => {
        return MOCK_LOGS.filter(log => {
            const matchSearch = !search || log.description.toLowerCase().includes(search.toLowerCase()) || log.actorName.toLowerCase().includes(search.toLowerCase()) || log.entityLabel.toLowerCase().includes(search.toLowerCase()) || log.id.toLowerCase().includes(search.toLowerCase());
            const matchModule = moduleFilter === "all" || log.module === moduleFilter;
            const matchStatus = statusFilter === "all" || log.status === statusFilter;
            const matchAction = actionFilter === "all" || log.action === actionFilter;
            const matchActor = actorFilter === "all" || log.actorName === actorFilter;
            const matchDate = dateFilter === "all" || log.date === dateFilter;
            const matchTab =
                filterTab === 0 ? true :
                    filterTab === 1 ? log.module === "auth" :
                        filterTab === 2 ? ["notes","patients","compliance"].includes(log.module) :
                            filterTab === 3 ? log.module === "billing" :
                                filterTab === 4 ? (log.status === "failed" || log.status === "warning") :
                                    filterTab === 5 ? (log.metadata?.hipaaEvent === "true" || log.metadata?.sensitiveRecord === "true") : true;
            return matchSearch && matchModule && matchStatus && matchAction && matchActor && matchDate && matchTab;
        });
    }, [search, moduleFilter, statusFilter, actionFilter, actorFilter, dateFilter, filterTab]);

    const reportTabs = [
        { key: "overview" as ReportTab, label: "📊 Overview", icon: "📊" },
        { key: "audit_log" as ReportTab, label: "🗒️ Audit Log", icon: "🗒️" },
        { key: "login_history" as ReportTab, label: "🔐 Login History", icon: "🔐" },
        { key: "data_access" as ReportTab, label: "👁 Data Access", icon: "👁" },
        { key: "exports" as ReportTab, label: "📤 Export", icon: "📤" },
    ];

    const loginLogs = MOCK_LOGS.filter(l => ["LOGIN","LOGOUT","FAILED_LOGIN","PASSWORD_CHANGE"].includes(l.action));
    const dataAccessLogs = MOCK_LOGS.filter(l => ["VIEW","EXPORT","DOWNLOAD","PRINT","SHARE"].includes(l.action));

    /* ── Module Activity ── */
    const moduleActivity = Object.entries(moduleConfig).map(([key, val]) => ({
        module: key as LogModule,
        ...val,
        count: MOCK_LOGS.filter(l => l.module === key).length,
    })).filter(m => m.count > 0).sort((a, b) => b.count - a.count);

    /* ── Actor Activity ── */
    const actorActivity = uniqueActors.map(name => {
        const actorLogs = MOCK_LOGS.filter(l => l.actorName === name);
        const log = actorLogs[0];
        return {
            name, initials: log.actorInitials, color: log.actorColor, role: log.actorRole,
            total: actorLogs.length,
            failed: actorLogs.filter(l => l.status === "failed").length,
            lastSeen: actorLogs[0]?.date || "—",
        };
    }).sort((a, b) => b.total - a.total);

    /* ── Daily activity ── */
    const dailyDates = ["09 Apr 2026", "10 Apr 2026", "11 Apr 2026", "12 Apr 2026", "13 Apr 2026", "14 Apr 2026", "15 Apr 2026", "16 Apr 2026"];
    const dailyData = dailyDates.map(date => ({
        date, short: date.split(" ")[0],
        count: MOCK_LOGS.filter(l => l.date === date).length,
    }));
    const maxDailyCount = Math.max(...dailyData.map(d => d.count));

    return (
        <>
            {/* ── Modals ── */}
            {openMenuId && <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setOpenMenuId(null)} />}
            {modal === "view_log" && selectedLog && <ViewLogModal log={selectedLog} onClose={() => { setModal(null); setSelectedLog(null); }} />}
            {modal === "export" && <ExportModal onClose={() => setModal(null)} />}

            {/* ── Page Header ── */}
            <div className="page-header">
                <div>
                    <div className="page-title">Reports & Audit Log</div>
                    <div className="page-subtitle">Complete activity trail — logins, clinical actions, data access & compliance events</div>
                </div>
                <div className="header-actions">
                    <button onClick={() => setModal("export")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 3px 12px rgba(44,122,110,0.28)" }}>
                        📤 Export Report
                    </button>
                </div>
            </div>

            {/* ── KPI Row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 24 }}>
                {[
                    { label: "Total Events", value: String(totalLogs), sub: `${todayLogs} today`, color: "var(--primary)", icon: "📋", bg: "var(--primary-light)" },
                    { label: "Login Events", value: String(loginAttempts), sub: `${MOCK_LOGS.filter(l => l.action === "FAILED_LOGIN").length} failed`, color: "#888", icon: "🔐", bg: "#F2F2F2" },
                    { label: "Security Alerts", value: String(failedLogs + warningLogs), sub: `${failedLogs} failed · ${warningLogs} warnings`, color: "var(--warning)", icon: "⚠️", bg: "var(--warning-light)" },
                    { label: "HIPAA Events", value: String(hipaaEvents), sub: "PHI access logs", color: "var(--danger)", icon: "🛡️", bg: "var(--danger-light)" },
                    { label: "Active Users", value: String(uniqueActors.length), sub: "logged actions this month", color: "var(--purple)", icon: "👥", bg: "var(--purple-light)" },
                ].map(k => (
                    <div key={k.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ width: 42, height: 42, borderRadius: 11, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{k.icon}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8.5, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{k.label}</div>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: k.color, lineHeight: 1, marginBottom: 3 }}>{k.value}</div>
                            <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>{k.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tab Navigation ── */}
            <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: 5, width: "fit-content" }}>
                {reportTabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif", background: activeTab === tab.key ? "var(--primary)" : "transparent", color: activeTab === tab.key ? "#fff" : "var(--muted)", transition: "all 0.18s", whiteSpace: "nowrap" }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ══════ TAB: OVERVIEW ══════ */}
            {activeTab === "overview" && (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                        {/* Activity over time */}
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Daily Activity — Last 8 Days</div>
                                <div className="card-meta">EVENTS PER DAY</div>
                            </div>
                            <div style={{ padding: "20px 20px 16px" }}>
                                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                                    {dailyData.map((d, i) => {
                                        const height = maxDailyCount > 0 ? Math.max((d.count / maxDailyCount) * 100, 8) : 8;
                                        const isToday = d.date === "16 Apr 2026";
                                        return (
                                            <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 11, fontWeight: 700, color: isToday ? "var(--primary)" : "var(--muted)" }}>{d.count}</div>
                                                <div style={{ width: "100%", height: `${height}%`, background: isToday ? "var(--primary)" : "var(--primary-light)", borderRadius: "4px 4px 0 0", transition: "height 0.6s ease", border: isToday ? "none" : "1px solid var(--border)", boxSizing: "border-box" }} />
                                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: isToday ? "var(--primary)" : "var(--muted)", fontWeight: isToday ? 700 : 400 }}>{d.short}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Module activity */}
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Activity by Module</div>
                                <div className="card-meta">ALL TIME</div>
                            </div>
                            <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                                {moduleActivity.map(m => {
                                    const pct = Math.round((m.count / totalLogs) * 100);
                                    return (
                                        <div key={m.module} style={{ cursor: "pointer" }} onClick={() => { setModuleFilter(m.module); setActiveTab("audit_log"); }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6 }}>
                                                    <span>{m.icon}</span> {m.label}
                                                </span>
                                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, fontWeight: 700, color: m.color }}>{m.count} ({pct}%)</span>
                                            </div>
                                            <div style={{ height: 5, background: "var(--border)", borderRadius: 5, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${pct}%`, background: m.color, borderRadius: 5, transition: "width 0.6s ease" }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {/* Action type breakdown */}
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Status Distribution</div>
                                <div className="card-meta">ALL EVENTS</div>
                            </div>
                            <div style={{ padding: "16px 20px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    {(["success", "warning", "failed", "info"] as LogStatus[]).map(s => {
                                        const count = MOCK_LOGS.filter(l => l.status === s).length;
                                        const cfg = statusConfig[s];
                                        const pct = Math.round((count / totalLogs) * 100);
                                        const colors: Record<string, string> = { success: "var(--success)", failed: "var(--danger)", warning: "var(--warning)", info: "#888" };
                                        const bgs: Record<string, string> = { success: "var(--success-light)", failed: "var(--danger-light)", warning: "var(--warning-light)", info: "#F2F2F2" };
                                        return (
                                            <div key={s} style={{ background: bgs[s], border: `1px solid ${colors[s]}28`, borderRadius: 12, padding: "14px 16px", cursor: "pointer" }} onClick={() => { setStatusFilter(s); setActiveTab("audit_log"); }}>
                                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, color: colors[s], lineHeight: 1 }}>{count}</div>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: colors[s], textTransform: "capitalize", marginTop: 4 }}>{s}</div>
                                                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: colors[s], opacity: 0.7, marginTop: 2 }}>{pct}% of events</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Actor leaderboard */}
                        <div className="card">
                            <div className="card-head">
                                <div className="card-title">Most Active Users</div>
                                <div className="card-meta">BY EVENT COUNT</div>
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr>
                                    {["User", "Events", "Failed", "Last Active"].map(h => (
                                        <th key={h} style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 400, padding: "8px 14px", textAlign: "left", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {actorActivity.map((a, i) => (
                                    <tr key={a.name} style={{ background: i === 0 ? "var(--primary-xlight)" : "transparent" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i === 0 ? "var(--primary-xlight)" : "transparent"}>
                                        <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 7, background: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{a.initials}</div>
                                                <div>
                                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)" }}>{a.name}</div>
                                                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{a.role.split(" · ")[0]}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                                            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>{a.total}</span>
                                        </td>
                                        <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: a.failed > 0 ? "var(--danger)" : "var(--muted)" }}>{a.failed}</span>
                                        </td>
                                        <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>{a.lastSeen}</span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ══════ AUDIT LOG TABLE (shared for multiple tabs) ══════ */}
            {(activeTab === "audit_log" || activeTab === "login_history" || activeTab === "data_access") && (
                <>
                    {/* Contextual banner */}
                    {activeTab === "login_history" && (
                        <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary-mid)", borderRadius: 12, padding: "12px 18px", marginBottom: 16, display: "flex", gap: 10 }}>
                            <span style={{ fontSize: 16 }}>🔐</span>
                            <div style={{ fontSize: 13, color: "var(--primary-dark)", lineHeight: 1.5 }}>
                                Showing <strong>authentication events only</strong> — logins, logouts, failed attempts, and password changes.
                            </div>
                        </div>
                    )}
                    {activeTab === "data_access" && (
                        <div style={{ background: "var(--warning-light)", border: "1px solid #f5c58a", borderRadius: 12, padding: "12px 18px", marginBottom: 16, display: "flex", gap: 10 }}>
                            <span style={{ fontSize: 16 }}>👁</span>
                            <div style={{ fontSize: 13, color: "var(--fg-mid)", lineHeight: 1.5 }}>
                                Showing <strong>data access events only</strong> — records viewed, exported, downloaded, printed, or shared. HIPAA-relevant.
                            </div>
                        </div>
                    )}

                    {/* Filters row */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                        {activeTab === "audit_log" && (
                            <>
                                {/* Filter tabs */}
                                <div className="filter-tabs" style={{ marginBottom: 0 }}>
                                    {filterTabs.map((tab, i) => (
                                        <button key={tab.label} className={`filter-tab${filterTab === i ? " active" : ""}`} onClick={() => setFilterTab(i)}>
                                            {tab.label} <span style={{ marginLeft: 5, fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: 0.75 }}>({tab.count})</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Module filter */}
                        {activeTab === "audit_log" && (
                            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value as LogModule | "all")} style={{ border: "1.5px solid var(--border)", borderRadius: 8, padding: "7px 14px", fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--fg)", background: "var(--card)", outline: "none", cursor: "pointer" }}>
                                <option value="all">All Modules</option>
                                {Object.entries(moduleConfig).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                            </select>
                        )}

                        {/* Status filter */}
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as LogStatus | "all")} style={{ border: "1.5px solid var(--border)", borderRadius: 8, padding: "7px 14px", fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--fg)", background: "var(--card)", outline: "none", cursor: "pointer" }}>
                            <option value="all">All Statuses</option>
                            <option value="success">✅ Success</option>
                            <option value="warning">⚠️ Warning</option>
                            <option value="failed">❌ Failed</option>
                            <option value="info">ℹ️ Info</option>
                        </select>

                        {/* Actor filter */}
                        <select value={actorFilter} onChange={e => setActorFilter(e.target.value)} style={{ border: "1.5px solid var(--border)", borderRadius: 8, padding: "7px 14px", fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--fg)", background: "var(--card)", outline: "none", cursor: "pointer" }}>
                            <option value="all">All Users</option>
                            {uniqueActors.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>

                        {/* Clear filters */}
                        {(moduleFilter !== "all" || statusFilter !== "all" || actorFilter !== "all" || search) && (
                            <button onClick={() => { setModuleFilter("all"); setStatusFilter("all"); setActorFilter("all"); setSearch(""); }} style={{ padding: "7px 14px", border: "1.5px solid var(--danger)", borderRadius: 8, background: "var(--danger-light)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--danger)", fontFamily: "'Nunito', sans-serif" }}>✕ Clear</button>
                        )}

                        {/* Search */}
                        <div style={{ marginLeft: "auto", position: "relative" }}>
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 13, pointerEvents: "none" }}>🔍</span>
                            <input type="text" placeholder="Search logs…" value={search} onChange={e => setSearch(e.target.value)} style={{ border: "1.5px solid var(--border)", borderRadius: 8, padding: "7px 14px 7px 34px", fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "var(--fg)", background: "var(--card)", outline: "none", width: 230, transition: "border-color 0.18s" }} onFocus={e => (e.target.style.borderColor = "var(--primary)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
                        </div>

                        {/* Export */}
                        <button onClick={() => setModal("export")} style={{ padding: "7px 14px", border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--card)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Nunito', sans-serif" }}>📤 Export</button>
                    </div>

                    {/* Table */}
                    {(() => {
                        const displayLogs =
                            activeTab === "login_history" ? loginLogs :
                                activeTab === "data_access" ? dataAccessLogs :
                                    filteredLogs;

                        return (
                            <div className="card">
                                {displayLogs.length === 0 ? (
                                    <div style={{ padding: 48, textAlign: "center" }}>
                                        <div style={{ fontSize: 36, marginBottom: 12 }}>🗒️</div>
                                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>No audit events found</div>
                                        <div style={{ fontSize: 13, color: "var(--muted)" }}>No logs match the current filters.</div>
                                    </div>
                                ) : (
                                    <>
                                        <table className="data-table">
                                            <thead>
                                            <tr>
                                                <th>Event ID</th>
                                                <th>Timestamp</th>
                                                <th>User</th>
                                                <th>Action</th>
                                                <th>Module</th>
                                                <th>Entity</th>
                                                <th>IP Address</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: "right" as const }}>Detail</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {displayLogs.map(log => {
                                                const act = actionConfig[log.action];
                                                const mod = moduleConfig[log.module];
                                                const sta = statusConfig[log.status];
                                                const isHipaa = log.metadata?.hipaaEvent === "true" || log.metadata?.sensitiveRecord === "true";

                                                return (
                                                    <tr key={log.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedLog(log); setModal("view_log"); }}>
                                                        {/* ID */}
                                                        <td>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "2px 8px", borderRadius: 4 }}>{log.id}</span>
                                                                {isHipaa && <span title="HIPAA Event" style={{ fontSize: 12 }}>🛡️</span>}
                                                            </div>
                                                        </td>
                                                        {/* Timestamp */}
                                                        <td>
                                                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--fg)" }}>{log.time}</div>
                                                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", marginTop: 1 }}>{log.date}</div>
                                                        </td>
                                                        {/* Actor */}
                                                        <td>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                <div style={{ width: 28, height: 28, borderRadius: 7, background: log.actorColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{log.actorInitials}</div>
                                                                <div>
                                                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg)" }}>{log.actorName}</div>
                                                                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{log.actorRole.split(" · ")[0]}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {/* Action */}
                                                        <td onClick={e => e.stopPropagation()}>
                                                            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: act.bg, color: act.color, fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5 }}>
                                                                <span>{act.icon}</span> {act.label}
                                                            </span>
                                                        </td>
                                                        {/* Module */}
                                                        <td onClick={e => e.stopPropagation()}>
                                                            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", color: mod.color, fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>
                                                                {mod.icon} {mod.label}
                                                            </span>
                                                        </td>
                                                        {/* Entity */}
                                                        <td>
                                                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.entityLabel}</div>
                                                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", marginTop: 1 }}>{log.entityId}</div>
                                                        </td>
                                                        {/* IP */}
                                                        <td>
                                                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: "var(--fg-mid)" }}>{log.ipAddress}</span>
                                                        </td>
                                                        {/* Status */}
                                                        <td onClick={e => e.stopPropagation()}>
                                                            <span className={`chip ${sta.chip}`} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: sta.dot, display: "inline-block" }} />
                                                                {sta.label}
                                                            </span>
                                                        </td>
                                                        {/* Detail */}
                                                        <td style={{ textAlign: "right" as const }} onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => { setSelectedLog(log); setModal("view_log"); }} style={{ padding: "5px 12px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif", transition: "all 0.13s" }}>
                                                                View →
                                                            </button>
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
                                            <button className="page-btn">3</button>
                                            <button className="page-btn">Next »</button>
                                            <div style={{ marginLeft: "auto" }}>
                                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)" }}>Showing {displayLogs.length} events</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })()}
                </>
            )}

            {/* ══════ TAB: EXPORTS ══════ */}
            {activeTab === "exports" && (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                        {/* Quick export cards */}
                        {[
                            { title: "Full Audit Log", desc: "Complete record of all system events, all modules, all users.", icon: "📋", color: "var(--primary)", bg: "var(--primary-light)" },
                            { title: "Login & Auth Report", desc: "All authentication events — logins, logouts, failed attempts, password changes.", icon: "🔐", color: "#888", bg: "#F2F2F2" },
                            { title: "HIPAA Events Report", desc: "All events flagged as involving Protected Health Information (PHI).", icon: "🛡️", color: "var(--danger)", bg: "var(--danger-light)" },
                            { title: "Clinical Notes Audit", desc: "All note create, edit, sign, co-sign, and export events.", icon: "📝", color: "var(--purple)", bg: "var(--purple-light)" },
                            { title: "Billing Activity", desc: "All billing records, claims, payment logs and status changes.", icon: "💳", color: "var(--success)", bg: "var(--success-light)" },
                            { title: "Security Alerts", desc: "Failed logins, unauthorised access attempts, account suspensions.", icon: "⚠️", color: "var(--warning)", bg: "var(--warning-light)" },
                        ].map(card => (
                            <div key={card.title} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px", display: "flex", gap: 16, alignItems: "flex-start", transition: "box-shadow 0.18s", cursor: "pointer" }}
                                 onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 22px rgba(44,122,110,0.12)"}
                                 onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}
                                 onClick={() => setModal("export")}>
                                <div style={{ width: 46, height: 46, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: `1px solid ${card.color}28` }}>{card.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: "var(--fg)", marginBottom: 4 }}>{card.title}</div>
                                    <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, marginBottom: 12 }}>{card.desc}</div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {["CSV", "PDF", "JSON"].map(fmt => (
                                            <button key={fmt} onClick={e => { e.stopPropagation(); setModal("export"); }} style={{ padding: "4px 12px", border: "1.5px solid var(--border)", borderRadius: 6, background: "var(--surface)", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "var(--fg-mid)", fontFamily: "'Space Mono', monospace", transition: "all 0.13s" }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = card.color; (e.currentTarget as HTMLButtonElement).style.color = card.color; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--fg-mid)"; }}>
                                                ↓ {fmt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Export history */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Export History</div>
                            <div className="card-meta">RECENT EXPORTS</div>
                        </div>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Export ID</th>
                                <th>Report Type</th>
                                <th>Generated By</th>
                                <th>Date</th>
                                <th>Format</th>
                                <th>Records</th>
                                <th style={{ textAlign: "right" as const }}>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {[
                                { id: "EXP-001", type: "Full Audit Log", by: "Dr. A. Kolade", date: "16 Apr 2026, 08:00 AM", format: "PDF", records: "142" },
                                { id: "EXP-002", type: "HIPAA Events Report", by: "Dr. A. Kolade", date: "14 Apr 2026, 05:00 PM", format: "CSV", records: "8" },
                                { id: "EXP-003", type: "Billing Activity", by: "Dr. A. Kolade", date: "12 Apr 2026, 03:30 PM", format: "CSV", records: "28" },
                                { id: "EXP-004", type: "Login & Auth Report", by: "Dr. A. Kolade", date: "10 Apr 2026, 09:00 AM", format: "JSON", records: "54" },
                                { id: "EXP-005", type: "Clinical Notes Audit", by: "Dr. C. Obi", date: "08 Apr 2026, 02:00 PM", format: "PDF", records: "31" },
                            ].map((exp, i) => (
                                <tr key={exp.id}>
                                    <td><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "3px 8px", borderRadius: 5 }}>{exp.id}</span></td>
                                    <td><span className="td-text">{exp.type}</span></td>
                                    <td><span className="td-text">{exp.by}</span></td>
                                    <td><span className="td-mono">{exp.date}</span></td>
                                    <td><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: exp.format === "PDF" ? "var(--danger-light)" : exp.format === "CSV" ? "var(--success-light)" : "var(--primary-light)", color: exp.format === "PDF" ? "var(--danger)" : exp.format === "CSV" ? "var(--success)" : "var(--primary)" }}>{exp.format}</span></td>
                                    <td><span className="td-mono">{exp.records} rows</span></td>
                                    <td style={{ textAlign: "right" as const }}>
                                        <button style={{ padding: "5px 11px", border: "1.5px solid var(--border)", borderRadius: 7, background: "var(--card)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--primary)", fontFamily: "'Nunito', sans-serif" }}>⬇ Re-download</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ── HIPAA footer ── */}
            <div style={{ marginTop: 20, padding: "12px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🛡️</span>
                <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
                    <strong style={{ color: "var(--fg)" }}>HIPAA Audit Trail:</strong> All system events are permanently recorded per HIPAA Security Rule §164.312(b). Audit logs are immutable and cannot be altered or deleted. Exports of audit logs are themselves logged. Contact your compliance officer for regulatory inquiries or breach notification procedures.
                </div>
            </div>
        </>
    );
}