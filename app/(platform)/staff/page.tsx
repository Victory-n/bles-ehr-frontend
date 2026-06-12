"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import StaffFormModal from "@/components/staff/StaffFormModal";

/* ══════════════════════════════════════════════════════════════════════════
   Mock Staff Data
══════════════════════════════════════════════════════════════════════════ */

type StaffCategory = "Clinical" | "Admin";

interface StaffMember {
    id: string;
    name: string;
    role: string;
    dept: string;
    category: StaffCategory;
    roleColor: string;
    online: boolean;
    initials: string;
    avatarBg: string;
}

const STAFF: StaffMember[] = [
    { id: "EMP-4821", name: "Dr. Eleanor Vance", role: "Lead Psychiatrist", dept: "Psychiatry", category: "Clinical", roleColor: "#e65100", online: true, initials: "EV", avatarBg: "#0f4c81" },
    { id: "EMP-3196", name: "Marcus Thorne", role: "Clinical Nurse", dept: "Pediatrics", category: "Clinical", roleColor: "#e65100", online: true, initials: "MT", avatarBg: "#006970" },
    { id: "EMP-1862", name: "Sarah Jenkins", role: "Systems Admin", dept: "IT", category: "Admin", roleColor: "#0f4c81", online: true, initials: "SJ", avatarBg: "#7a3700" },
    { id: "EMP-5512", name: "David Chen", role: "Therapist", dept: "Counseling", category: "Clinical", roleColor: "#e65100", online: false, initials: "DC", avatarBg: "#0f4c81" },
    { id: "EMP-2888", name: "Aisha Patel", role: "Head of Nursing", dept: "Nursing", category: "Clinical", roleColor: "#e65100", online: true, initials: "AP", avatarBg: "#006970" },
    { id: "EMP-9081", name: "Robert Fischer", role: "Security Officer", dept: "Security", category: "Admin", roleColor: "#0f4c81", online: false, initials: "RF", avatarBg: "#7a3700" },
    { id: "EMP-7234", name: "Dr. Amara Okafor", role: "Clinical Psychologist", dept: "Psychology", category: "Clinical", roleColor: "#e65100", online: true, initials: "AO", avatarBg: "#0f4c81" },
    { id: "EMP-6045", name: "James Rodriguez", role: "Billing Specialist", dept: "Finance", category: "Admin", roleColor: "#0f4c81", online: false, initials: "JR", avatarBg: "#006970" },
    { id: "EMP-8877", name: "Linda Osei", role: "Compliance Officer", dept: "Compliance", category: "Admin", roleColor: "#0f4c81", online: true, initials: "LO", avatarBg: "#7a3700" },
];

const COUNTS = { all: 142, clinical: 89, admin: 53 };

/* ══════════════════════════════════════════════════════════════════════════
   Staff Page
══════════════════════════════════════════════════════════════════════════ */
export default function StaffPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<"All" | StaffCategory>("All");
    const [sortBy, setSortBy] = useState("Name (A-Z)");
    const [showAddModal, setShowAddModal] = useState(false);

    const filtered = activeFilter === "All" ? STAFF : STAFF.filter((s) => s.category === activeFilter);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* ── Add New Staff Button ────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
                    Add New Staff
                </button>
            </div>

            {/* ── Filter tabs + Sort ──────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
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
                <div style={{ display: "flex", gap: 8 }}>
                    {([
                        { label: `All Staff (${COUNTS.all})`, value: "All" as const },
                        { label: `Clinical (${COUNTS.clinical})`, value: "Clinical" as const },
                        { label: `Admin (${COUNTS.admin})`, value: "Admin" as const },
                    ]).map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveFilter(tab.value)}
                            style={{
                                padding: "8px 18px",
                                borderRadius: 20,
                                border: activeFilter === tab.value ? "none" : "1px solid var(--color-outline-variant)",
                                background: activeFilter === tab.value ? "var(--color-primary-container)" : "var(--color-surface-container-lowest)",
                                color: activeFilter === tab.value ? "#ffffff" : "var(--color-on-surface)",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--color-on-surface-variant)", fontWeight: 500 }}>Sort by:</span>
                    <div style={{ position: "relative" }}>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                appearance: "none",
                                padding: "7px 32px 7px 12px",
                                borderRadius: 8,
                                border: "1px solid var(--color-outline-variant)",
                                background: "var(--color-surface-container-lowest)",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--color-on-surface)",
                                cursor: "pointer",
                                outline: "none",
                            }}
                        >
                            <option>Name (A-Z)</option>
                            <option>Name (Z-A)</option>
                            <option>Department</option>
                            <option>Recently Added</option>
                        </select>
                        <span className="material-symbols-outlined" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--color-outline)", pointerEvents: "none" }}>expand_more</span>
                    </div>
                </div>
            </div>

            {/* ── Staff card grid ─────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                {filtered.map((s) => (
                    <div
                        key={s.id}
                        style={{
                            background: "var(--color-surface-container-lowest)",
                            border: "1px solid var(--color-outline-variant)",
                            borderRadius: 12,
                            padding: 20,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 12,
                            position: "relative",
                            transition: "box-shadow 0.15s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
                        onMouseOut={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                        {/* Online dot */}
                        {s.online && (
                            <div style={{ position: "absolute", top: 12, left: 12, width: 10, height: 10, borderRadius: "50%", background: "#137333", border: "2px solid #ffffff" }} />
                        )}

                        {/* More menu */}
                        <button style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", padding: 2 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_vert</span>
                        </button>

                        {/* Avatar */}
                        <div style={{
                            width: 72,
                            height: 72,
                            borderRadius: 12,
                            background: s.avatarBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <span style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", letterSpacing: "0.02em" }}>{s.initials}</span>
                        </div>

                        {/* Name & role */}
                        <div style={{ textAlign: "center" }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-on-surface)", margin: 0 }}>{s.name}</h3>
                            <p style={{ fontSize: 13, fontWeight: 600, color: s.roleColor, margin: "4px 0 0" }}>{s.role}</p>
                        </div>

                        {/* Dept & ID */}
                        <div style={{ display: "flex", justifyContent: "center", gap: 24, width: "100%", borderTop: "1px solid var(--color-outline-variant)", paddingTop: 12 }}>
                            <div style={{ textAlign: "center" }}>
                                <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-on-surface-variant)", marginBottom: 2 }}>DEPT</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>{s.dept}</span>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <span style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-on-surface-variant)", marginBottom: 2 }}>ID</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                            </div>
                        </div>

                        {/* View Profile button */}
                        <button
                            onClick={() => router.push(`/staff/${s.id}`)}
                            style={{
                                width: "100%",
                                padding: "8px 0",
                                borderRadius: 8,
                                border: "1px solid var(--color-outline-variant)",
                                background: "transparent",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--color-on-surface)",
                                cursor: "pointer",
                                transition: "background 0.12s",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            View Profile
                        </button>
                    </div>
                ))}
            </div>

            {/* ── Load More ───────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 28px",
                        borderRadius: 8,
                        border: "1px solid var(--color-outline-variant)",
                        background: "var(--color-surface-container-lowest)",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-on-surface)",
                        cursor: "pointer",
                        transition: "background 0.12s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-surface-container-lowest)")}
                >
                    Load More
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
                </button>
            </div>

            {/* Add Staff Modal */}
            {showAddModal && <StaffFormModal onClose={() => setShowAddModal(false)} />}
        </div>
    );
}
