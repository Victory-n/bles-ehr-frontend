"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

/* ══════════════════════════════════════════════════════════════════════════
   Mock Program Data
══════════════════════════════════════════════════════════════════════════ */

type ProgramStatus = "Active" | "Closed" | "Paused";

interface Program {
    id: string;
    name: string;
    type: string;
    sessionType: string;
    dateCreated: string;
    status: ProgramStatus;
}

const STATUS_STYLES: Record<ProgramStatus, { bg: string; color: string; dot: string; label: string }> = {
    Active: { bg: "#e6f4ea", color: "#137333", dot: "#137333", label: "Active" },
    Paused: { bg: "#fff8e1", color: "#f57f17", dot: "#f57f17", label: "Paused" },
    Closed: { bg: "#fce8e8", color: "#b3261e", dot: "#b3261e", label: "Closed" },
};

const PROGRAMS: Program[] = [
    { id: "PRG-001", name: "Cognitive Behavioral Therapy", type: "PHP", sessionType: "Group", dateCreated: "2026-01-12", status: "Active" },
    { id: "PRG-002", name: "Anxiety Management", type: "POP", sessionType: "Single", dateCreated: "2026-02-15", status: "Active" },
    { id: "PRG-003", name: "Substance Abuse Recovery", type: "IOP", sessionType: "Group", dateCreated: "2025-11-20", status: "Closed" },
    { id: "PRG-004", name: "Family Counseling", type: "POP", sessionType: "Group", dateCreated: "2026-03-05", status: "Paused" },
    { id: "PRG-005", name: "Mindfulness Training", type: "PHP", sessionType: "Single", dateCreated: "2026-04-10", status: "Active" },
    { id: "PRG-006", name: "Anger Management", type: "IOP", sessionType: "Group", dateCreated: "2025-08-22", status: "Closed" },
    { id: "PRG-007", name: "Trauma Support", type: "PHP", sessionType: "Group", dateCreated: "2026-05-01", status: "Active" },
];

const TOTAL = PROGRAMS.length;
const ACTIVE = PROGRAMS.filter((p) => p.status === "Active").length;

/* ══════════════════════════════════════════════════════════════════════════
   Programs Page
══════════════════════════════════════════════════════════════════════════ */
export default function ProgramsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    
    // We will hardcode 1 page for this demo
    const totalPages = 1;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* ── Stat cards ─────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                <StatCard label="TOTAL PROGRAMS" value={TOTAL.toLocaleString()} icon="list_alt" iconBg="var(--color-primary-container)" iconColor="#ffffff" />
                <StatCard label="ACTIVE PROGRAMS" value={ACTIVE.toLocaleString()} icon="check_circle" iconBg="var(--color-secondary)" iconColor="#ffffff" />
            </div>

            {/* ── Header row ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-on-background)", margin: 0, letterSpacing: "-0.01em" }}>
                    Programs
                </h2>
                <button
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
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                    Create Program
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
                        placeholder="Search programs..."
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
                    options={["All", "Active", "Paused", "Closed"]}
                />

                {/* Type dropdown */}
                <FilterSelect
                    label="Type"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={["All", "POP", "PHP", "IOP"]}
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
                            {["S/N", "PROGRAM NAME", "PROGRAM TYPE", "SESSION TYPE", "DATE CREATED", "STATUS", "ACTION"].map((h, i) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: "12px 20px",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        letterSpacing: "0.05em",
                                        color: "var(--color-on-surface-variant)",
                                        textAlign: i === 6 ? "right" : "left",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PROGRAMS.map((p, i) => {
                            const st = STATUS_STYLES[p.status];
                            return (
                                <tr
                                    key={p.id}
                                    style={{
                                        borderBottom: i < PROGRAMS.length - 1 ? "1px solid var(--color-outline-variant)" : "none",
                                        transition: "background 0.12s",
                                        cursor: "pointer",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    {/* S/N */}
                                    <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-primary-container)" }}>
                                        {i + 1}
                                    </td>
                                    {/* Name */}
                                    <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                                        {p.name}
                                    </td>
                                    {/* Type */}
                                    <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                                        {p.type}
                                    </td>
                                    {/* Session Type */}
                                    <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                                        {p.sessionType}
                                    </td>
                                    {/* Date Created */}
                                    <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                                        {p.dateCreated}
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
                                            <ActionBtn icon="visibility" title="View" onClick={() => router.push(`/programs/${p.id}`)} />
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
                        Showing 1 to {PROGRAMS.length} of {TOTAL} entries
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
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
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                        </button>
                        {[1].map((n) => (
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
