"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

/* ══════════════════════════════════════════════════════════════════════════
   Mock Clinic Notes Data
══════════════════════════════════════════════════════════════════════════ */

interface ClinicNote {
    patientId: string;
    patientName: string;
    folderId: string;
}

const CLINIC_NOTES: ClinicNote[] = [
    { patientId: "RC-84920", patientName: "Abernathy, Sarah", folderId: "FLD-1001" },
    { patientId: "RC-84921", patientName: "Chen, Wei", folderId: "FLD-1002" },
    { patientId: "RC-84922", patientName: "Doe, Jonathan", folderId: "FLD-1003" },
    { patientId: "RC-84923", patientName: "Garcia, Maria", folderId: "FLD-1004" },
    { patientId: "RC-84924", patientName: "Johnson, Marcus", folderId: "FLD-1005" },
    { patientId: "RC-84925", patientName: "Kim, Sun-Hee", folderId: "FLD-1006" },
    { patientId: "RC-84926", patientName: "Martinez, Luis", folderId: "FLD-1007" },
    { patientId: "RC-84927", patientName: "Patel, Ananya", folderId: "FLD-1008" },
    { patientId: "RC-84928", patientName: "Roberts, Emily", folderId: "FLD-1009" },
    { patientId: "RC-84929", patientName: "Thompson, David", folderId: "FLD-1010" },
];

const TOTAL = 1248;
const RECENT = 342;
const PENDING = 56;

/* ══════════════════════════════════════════════════════════════════════════
   Clinic Notes Page
══════════════════════════════════════════════════════════════════════════ */
export default function ClinicNotesPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(TOTAL / 10);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* ── Stat cards ─────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <StatCard label="TOTAL CLINIC NOTES" value={TOTAL.toLocaleString()} icon="folder" iconBg="var(--color-primary-container)" iconColor="#ffffff" />
                <StatCard label="RECENT NOTES" value={RECENT.toLocaleString()} icon="schedule" iconBg="var(--color-secondary)" iconColor="#ffffff" />
                <StatCard label="PENDING REVIEW" value={PENDING.toLocaleString()} icon="pending_actions" iconBg="var(--color-tertiary-container)" iconColor="var(--color-on-tertiary-container)" />
            </div>

            {/* ── Header row ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-on-background)", margin: 0, letterSpacing: "-0.01em" }}>
                    Clinic Notes
                </h2>
                <button
                    onClick={() => {}}
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
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>note_add</span>
                    New Clinic Note
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
                        {CLINIC_NOTES.map((note, i) => (
                            <tr
                                key={note.folderId}
                                style={{
                                    borderBottom: i < CLINIC_NOTES.length - 1 ? "1px solid var(--color-outline-variant)" : "none",
                                    transition: "background 0.12s",
                                    cursor: "pointer",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                {/* S/N */}
                                <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-primary-container)", width: "60px" }}>
                                    {i + 1}
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/clinic-notes/${note.folderId}`);
                                        }}
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
                        ))}
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
                        Showing 1 to 10 of {TOTAL.toLocaleString()} entries
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
