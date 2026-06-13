"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PatientFormModal from "@/components/patients/PatientFormModal";
import { useAuth } from "@/lib/auth/AuthContext";
import { SetPinModal, VerifyPinModal } from "@/components/PinModal";
import ImportModal from "@/components/ImportModal";

/* ══════════════════════════════════════════════════════════════════════════
   Types & Constants
══════════════════════════════════════════════════════════════════════════ */

type PatientStatus = "Active" | "Inactive" | "Pending";

interface Patient {
    id: string;
    patientId: string;
    firstname: string;
    lastname: string;
    dateOfBirth: string;
    gender: string;
    status: PatientStatus;
    contactInformation: { phone?: string; email?: string; address?: string; city?: string; zip?: string };
    emergencyContact: { name?: string; relationship?: string; phone?: string };
    intakeNotes: { diagnosis?: string; notes?: string };
    createdAt: string;
}

const STATUS_STYLES: Record<PatientStatus, { bg: string; color: string; dot: string; label: string }> = {
    Active: { bg: "#e6f4ea", color: "#137333", dot: "#137333", label: "Active" },
    Inactive: { bg: "#fce8e8", color: "#b3261e", dot: "#b3261e", label: "Inactive" },
    Pending: { bg: "#f1f3f4", color: "#5f6368", dot: "#9aa0a6", label: "Pending" },
};

const PAGE_SIZE = 10;

/* ══════════════════════════════════════════════════════════════════════════
   Patients Page
══════════════════════════════════════════════════════════════════════════ */
export default function PatientsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [staffFilter, setStaffFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSetPinModal, setShowSetPinModal] = useState(false);
    const [showVerifyPinModal, setShowVerifyPinModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

    const fetchPatients = useCallback(async () => {
        try {
            setLoadingPatients(true);
            const res = await fetch("/api/patients");
            if (res.ok) {
                const data = await res.json();
                setPatients(data.patients ?? []);
            }
        } catch (err) {
            console.error("Failed to fetch patients:", err);
        } finally {
            setLoadingPatients(false);
        }
    }, []);

    useEffect(() => { fetchPatients(); }, [fetchPatients]);

    /* ── Derived data ──────────────────────────────────────────────────── */
    const filtered = patients.filter((p) => {
        const name = `${p.lastname}, ${p.firstname}`.toLowerCase();
        const matchesSearch = !search || name.includes(search.toLowerCase()) || p.patientId.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const totalActive = patients.filter((p) => p.status === "Active").length;
    const totalInactive = patients.filter((p) => p.status === "Inactive").length;

    const requirePinForAction = (action: () => void) => {
        setPendingAction(() => action);
        if (!user?.hasPin) {
            setShowSetPinModal(true);
        } else {
            setShowVerifyPinModal(true);
        }
    };

    const completePendingAction = () => {
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* ── Stat cards ─────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <StatCard label="TOTAL PATIENTS" value={patients.length.toLocaleString()} icon="groups" iconBg="var(--color-primary-container)" iconColor="#ffffff" />
                <StatCard label="ACTIVE PATIENTS" value={totalActive.toLocaleString()} icon="person_check" iconBg="var(--color-secondary)" iconColor="#ffffff" />
                <StatCard label="INACTIVE PATIENTS" value={totalInactive.toLocaleString()} icon="person_off" iconBg="var(--color-tertiary-container)" iconColor="var(--color-on-tertiary-container)" />
            </div>

            {/* ── Header row ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-on-background)", margin: 0, letterSpacing: "-0.01em" }}>
                    Patient Directory
                </h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: "var(--color-secondary)",
                        color: "#ffffff",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.15s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#005a61")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-secondary)")}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_add</span>
                    Add New Patient
                </button>
            </div>

            {/* ── Filters ────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {/* Search */}
                <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 300 }}>
                    <span
                        className="material-symbols-outlined"
                        style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--color-outline)", pointerEvents: "none" }}
                    >
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search by ID, Name, or Folder..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px 12px 8px 36px",
                            borderRadius: 8,
                            border: "1px solid var(--color-outline-variant)",
                            background: "var(--color-surface-container-lowest)",
                            fontSize: 13,
                            color: "var(--color-on-surface)",
                            outline: "none",
                            transition: "border-color 0.15s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--color-primary-container)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--color-outline-variant)")}
                    />
                </div>

                {/* Status dropdown */}
                <FilterSelect
                    label="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={["All", "Active", "Inactive", "Pending"]}
                />

                {/* Staff dropdown */}
                <FilterSelect
                    label="Staff"
                    value={staffFilter}
                    onChange={setStaffFilter}
                    options={["All", "Dr. Vance", "Dr. Adeyemi", "Dr. Okafor"]}
                />

                {/* Date range */}
                <FilterSelect
                    label=""
                    value="Last 30 Days"
                    onChange={() => { }}
                    options={["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"]}
                />

                {/* Import & Export — pushed right */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button
                    onClick={() => requirePinForAction(() => setShowImportModal(true))}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "1px solid var(--color-outline-variant)",
                        background: "var(--color-surface-container-lowest)",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-on-surface)",
                        cursor: "pointer",
                        transition: "background 0.12s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-surface-container-lowest)")}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
                    Import
                </button>
                    <button
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 14px",
                            borderRadius: 8,
                            border: "1px solid var(--color-outline-variant)",
                            background: "var(--color-surface-container-lowest)",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--color-on-surface)",
                            cursor: "pointer",
                            transition: "background 0.12s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-surface-container-lowest)")}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                        Export
                    </button>
                </div>
            </div>

            {/* ── Table ──────────────────────────────────────────────────────── */}
            <div style={{
                background: "var(--color-surface-container-lowest)",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: 12,
                overflow: "hidden",
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-low)" }}>
                            {["S/N", "PATIENT ID", "NAME", "PATIENT STATUS", "ACTION"].map((h, i) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: "12px 20px",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        letterSpacing: "0.05em",
                                        color: "var(--color-on-surface-variant)",
                                        textAlign: i === 4 ? "right" : "left",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loadingPatients ? (
                            <tr><td colSpan={5} style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-on-surface-variant)", fontSize: 14 }}>Loading patients…</td></tr>
                        ) : paginated.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-on-surface-variant)", fontSize: 14 }}>No patients found.</td></tr>
                        ) : paginated.map((p, i) => {
                            const st = STATUS_STYLES[p.status] ?? STATUS_STYLES.Pending;
                            return (
                                <tr
                                    key={p.id}
                                    style={{
                                        borderBottom: i < paginated.length - 1 ? "1px solid var(--color-outline-variant)" : "none",
                                        transition: "background 0.12s",
                                        cursor: "pointer",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    {/* S/N */}
                                    <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-primary-container)" }}>
                                        {(currentPage - 1) * PAGE_SIZE + i + 1}
                                    </td>
                                    {/* Patient ID */}
                                    <td style={{ padding: "14px 20px", fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--color-on-surface-variant)" }}>
                                        {p.patientId}
                                    </td>
                                    {/* Name */}
                                    <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                                        {p.lastname}, {p.firstname}
                                    </td>
                                    {/* Status */}
                                    <td style={{ padding: "14px 20px" }}>
                                        <span style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            padding: "4px 12px",
                                            borderRadius: 12,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            background: st.bg,
                                            color: st.color,
                                        }}>
                                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.dot, flexShrink: 0 }} />
                                            {st.label}
                                        </span>
                                    </td>
                                    {/* Action */}
                                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                                            <ActionBtn icon="visibility" title="View" onClick={() => router.push(`/patients/${p.patientId}`)} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* ── Pagination ────────────────────────────────────────────────── */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    borderTop: "1px solid var(--color-outline-variant)",
                    background: "var(--color-surface-container-low)",
                }}>
                    <span style={{ fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                        Showing {totalFiltered === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalFiltered)} of {totalFiltered.toLocaleString()} entries
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                        {[1, 2, 3].map((n) => (
                            <button
                                key={n}
                                onClick={() => setCurrentPage(n)}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 6,
                                    border: currentPage === n ? "none" : "1px solid var(--color-outline-variant)",
                                    background: currentPage === n ? "var(--color-primary-container)" : "var(--color-surface-container-lowest)",
                                    color: currentPage === n ? "#ffffff" : "var(--color-on-surface)",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "background 0.12s",
                                }}
                            >
                                {n}
                            </button>
                        ))}
                        <span style={{ padding: "0 6px", fontSize: 13, color: "var(--color-outline)", alignSelf: "center" }}>…</span>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: "1px solid var(--color-outline-variant)",
                                background: "var(--color-surface-container-lowest)",
                                color: "var(--color-on-surface)",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {totalPages}
                        </button>
                        <button
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: "1px solid var(--color-outline-variant)",
                                background: "var(--color-surface-container-lowest)",
                                color: "var(--color-on-surface-variant)",
                                fontSize: 13,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Add Patient Modal ──────────────────────────────────────────── */}
            {showAddModal && <PatientFormModal mode="add" onClose={() => setShowAddModal(false)} onSave={() => fetchPatients()} />}

            {/* PIN Modals */}
            {showSetPinModal && (
                <SetPinModal 
                    onClose={() => setShowSetPinModal(false)}
                    onSuccess={() => {
                        setShowSetPinModal(false);
                        completePendingAction();
                    }} 
                />
            )}
            {showVerifyPinModal && (
                <VerifyPinModal 
                    onClose={() => setShowVerifyPinModal(false)}
                    onSuccess={() => {
                        setShowVerifyPinModal(false);
                        completePendingAction();
                    }} 
                />
            )}
            {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} />}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════════════════════════════════ */

function StatCard({
    label,
    value,
    icon,
    iconBg,
    iconColor,
}: {
    label: string;
    value: string;
    icon: string;
    iconBg: string;
    iconColor: string;
}) {
    return (
        <div style={{
            background: "var(--color-surface-container-lowest)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        }}>
            <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-on-surface-variant)", display: "block", marginBottom: 6 }}>
                    {label}
                </span>
                <span style={{ fontSize: 30, fontWeight: 700, color: "var(--color-on-background)", lineHeight: 1 }}>
                    {value}
                </span>
            </div>
            <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: iconColor }}>{icon}</span>
            </div>
        </div>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
}) {
    return (
        <div style={{ position: "relative" }}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    appearance: "none",
                    padding: "8px 32px 8px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--color-outline-variant)",
                    background: "var(--color-surface-container-lowest)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-on-surface)",
                    cursor: "pointer",
                    outline: "none",
                    minWidth: 110,
                }}
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {label ? `${label}: ${opt}` : opt}
                    </option>
                ))}
            </select>
            <span
                className="material-symbols-outlined"
                style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 18,
                    color: "var(--color-outline)",
                    pointerEvents: "none",
                }}
            >
                expand_more
            </span>
        </div>
    );
}

function ActionBtn({ icon, title, color, onClick }: { icon: string; title: string; color?: string; onClick?: () => void }) {
    return (
        <button
            title={title}
            onClick={onClick}
            style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: color ?? "var(--color-on-surface-variant)",
                transition: "background 0.12s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
        </button>
    );
}
