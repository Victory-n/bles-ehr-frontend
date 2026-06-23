"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ══════════════════════════════════════════════════════════════════════════
   Clinic Notes Data Types
══════════════════════════════════════════════════════════════════════════ */

interface ClinicNote {
    patientId: string;
    patientName: string;
    folderId: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   Clinic Notes Page
══════════════════════════════════════════════════════════════════════════ */
export default function ClinicNotesPage() {
    const router = useRouter();
    const [clinicNotes, setClinicNotes] = useState<ClinicNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch clinic notes from API
    useEffect(() => {
        async function fetchClinicNotes() {
            try {
                const response = await fetch("/api/clinic-notes");
                if (response.ok) {
                    const data = await response.json();
                    setClinicNotes(data.clinicNotes);
                }
            } catch (error) {
                console.error("Failed to fetch clinic notes:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchClinicNotes();
    }, []);

    // Filter notes based on search
    const filteredNotes = clinicNotes.filter(note =>
        note.patientName.toLowerCase().includes(search.toLowerCase()) ||
        note.patientId.toLowerCase().includes(search.toLowerCase()) ||
        note.folderId.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredNotes.length / 10);
    const paginatedNotes = filteredNotes.slice((currentPage - 1) * 10, currentPage * 10);

    const handleOpenFolder = (folderId: string) => {
        router.push(`/clinic-notes/${folderId}`);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* ── Stat cards ─────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <StatCard label="TOTAL CLINIC FOLDERS" value={clinicNotes.length.toLocaleString()} icon="folder" iconBg="var(--color-primary-container)" iconColor="#ffffff" />
                <StatCard label="RECENT FOLDERS" value={Math.min(clinicNotes.length, 10).toLocaleString()} icon="schedule" iconBg="var(--color-secondary)" iconColor="#ffffff" />
                <StatCard label="PENDING REVIEW" value="0" icon="pending_actions" iconBg="var(--color-tertiary-container)" iconColor="var(--color-on-tertiary-container)" />
            </div>

            {/* ── Header row ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-on-background)", margin: 0, letterSpacing: "-0.01em" }}>
                    Clinic Folders
                </h2>
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

                {/* Department dropdown */}
                <FilterSelect
                    label="Department"
                    value={departmentFilter}
                    onChange={setDepartmentFilter}
                    options={["All", "Cardiology", "Neurology", "General Practice"]}
                />

                {/* Date range */}
                <FilterSelect
                    label=""
                    value="Last 30 Days"
                    onChange={() => { }}
                    options={["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"]}
                />
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
                            {["S/N", "PATIENT NAME", "FOLDER ID", "ACTION"].map((h, i) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: "12px 20px",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        letterSpacing: "0.05em",
                                        color: "var(--color-on-surface-variant)",
                                        textAlign: i === 3 ? "right" : "left",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-on-surface-variant)" }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : paginatedNotes.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-on-surface-variant)" }}>
                                    No folders found
                                </td>
                            </tr>
                        ) : (
                            paginatedNotes.map((note, i) => (
                                <tr
                                    key={note.folderId}
                                    style={{
                                        borderBottom: i < paginatedNotes.length - 1 ? "1px solid var(--color-outline-variant)" : "none",
                                        transition: "background 0.12s",
                                        cursor: "pointer",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                    onClick={() => handleOpenFolder(note.folderId)}
                                >
                                    {/* S/N */}
                                    <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-primary-container)", width: "60px" }}>
                                        {(currentPage - 1) * 10 + i + 1}
                                    </td>

                                    {/* PATIENT NAME (ID underneath) */}
                                    <td style={{ padding: "14px 20px" }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 4 }}>
                                            {note.patientName}
                                        </div>
                                        <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-on-surface-variant)" }}>
                                            {note.patientId}
                                        </div>
                                    </td>

                                    {/* FOLDER ID */}
                                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 500, color: "var(--color-on-surface)", fontFamily: "var(--font-mono)" }}>
                                        {note.folderId}
                                    </td>

                                    {/* ACTION */}
                                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                        <button
                                            onClick={() => handleOpenFolder(note.folderId)}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 6,
                                                padding: "8px 16px",
                                                borderRadius: 8,
                                                border: "1px solid var(--color-outline-variant)",
                                                background: "var(--color-surface-container-lowest)",
                                                color: "var(--color-primary-container)",
                                                fontSize: 13,
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                transition: "all 0.15s ease",
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = "var(--color-primary-container)";
                                                e.currentTarget.style.color = "#ffffff";
                                                e.currentTarget.style.borderColor = "var(--color-primary-container)";
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = "var(--color-surface-container-lowest)";
                                                e.currentTarget.style.color = "var(--color-primary-container)";
                                                e.currentTarget.style.borderColor = "var(--color-outline-variant)";
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>folder_open</span>
                                            Open Folder
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
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
                        Showing {paginatedNotes.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to {Math.min(currentPage * 10, filteredNotes.length)} of {filteredNotes.length.toLocaleString()} entries
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                        {/* Previous button */}
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: "1px solid var(--color-outline-variant)",
                                background: "var(--color-surface-container-lowest)",
                                color: currentPage === 1 ? "var(--color-outline)" : "var(--color-on-surface)",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = i + 1;
                            if (totalPages > 5) {
                                if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 6,
                                        border: currentPage === pageNum ? "none" : "1px solid var(--color-outline-variant)",
                                        background: currentPage === pageNum ? "var(--color-primary-container)" : "var(--color-surface-container-lowest)",
                                        color: currentPage === pageNum ? "#ffffff" : "var(--color-on-surface)",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "background 0.12s",
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {/* Next button */}
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: "1px solid var(--color-outline-variant)",
                                background: "var(--color-surface-container-lowest)",
                                color: currentPage === totalPages || totalPages === 0 ? "var(--color-outline)" : "var(--color-on-surface)",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: currentPage === totalPages || totalPages === 0 ? "not-allowed" : "pointer",
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
