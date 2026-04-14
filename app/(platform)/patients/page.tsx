"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ─── Mock Data ─── */
const mockPatients = [
    {
        id: "PAT-0142",
        name: "Amara Okafor",
        gender: "Female",
        dob: "14 Mar 1990",
        phone: "0803 111 2233",
        assignedStaff: "Dr. B. Adeyemi",
        status: "active",
        initials: "AO",
        color: "#2C7A6E",
    },
    {
        id: "PAT-0141",
        name: "Chidi Nwosu",
        gender: "Male",
        dob: "07 Jun 1996",
        phone: "0803 222 3344",
        assignedStaff: "Dr. A. Kolade",
        status: "pending",
        initials: "CN",
        color: "#6B5ED4",
    },
    {
        id: "PAT-0138",
        name: "Emeka Afolabi",
        gender: "Male",
        dob: "22 Nov 1979",
        phone: "0803 333 4455",
        assignedStaff: "Dr. A. Kolade",
        status: "critical",
        initials: "EA",
        color: "#C94040",
    },
    {
        id: "PAT-0135",
        name: "Ngozi Eze",
        gender: "Female",
        dob: "03 Feb 1993",
        phone: "0803 444 5566",
        assignedStaff: "Dr. C. Obi",
        status: "active",
        initials: "NE",
        color: "#27A76A",
    },
    {
        id: "PAT-0130",
        name: "Fatima Hassan",
        gender: "Female",
        dob: "19 Sep 2002",
        phone: "0803 555 6677",
        assignedStaff: "Dr. B. Adeyemi",
        status: "active",
        initials: "FH",
        color: "#D98326",
    },
    {
        id: "PAT-0128",
        name: "Kunle Balogun",
        gender: "Male",
        dob: "30 Jan 1985",
        phone: "0803 666 7788",
        assignedStaff: "Dr. F. Eze",
        status: "inactive",
        initials: "KB",
        color: "#7A9490",
    },
    {
        id: "PAT-0125",
        name: "Adaeze Okonkwo",
        gender: "Female",
        dob: "11 Aug 1988",
        phone: "0803 777 8899",
        assignedStaff: "Dr. C. Obi",
        status: "active",
        initials: "AO",
        color: "#4A9E91",
    },
    {
        id: "PAT-0120",
        name: "Sule Musa",
        gender: "Male",
        dob: "25 Dec 1975",
        phone: "0803 888 9900",
        assignedStaff: "Dr. B. Adeyemi",
        status: "discharged",
        initials: "SM",
        color: "#8B7355",
    },
];

const tabs = [
    { label: "All", count: 142 },
    { label: "Active", count: 98 },
    { label: "Discharged", count: 31 },
    { label: "Critical", count: 13 },
];

const statusChipMap: Record<string, string> = {
    active: "chip-active",
    pending: "chip-pending",
    critical: "chip-critical",
    inactive: "chip-inactive",
    discharged: "chip-inactive",
};

const statusLabelMap: Record<string, string> = {
    active: "Active",
    pending: "Pending",
    critical: "Critical",
    inactive: "Inactive",
    discharged: "Discharged",
};

/* ─── Add Patient Modal ─── */
function AddPatientModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(25,40,37,0.55)",
                backdropFilter: "blur(3px)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 18,
                    width: "100%",
                    maxWidth: 620,
                    boxShadow: "0 24px 64px rgba(25,40,37,0.18)",
                    overflow: "hidden",
                }}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: "22px 28px",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "var(--primary-xlight)",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: 20,
                                fontWeight: 700,
                                color: "var(--fg)",
                            }}
                        >
                            Add New Patient
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                            Step {step} of 2 — {step === 1 ? "Personal Information" : "Contact & Insurance"}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 32,
                            height: 32,
                            border: "1.5px solid var(--border)",
                            borderRadius: 8,
                            background: "var(--card)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            color: "var(--muted)",
                            transition: "all 0.13s",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Step Indicator */}
                <div style={{ padding: "16px 28px 0", display: "flex", gap: 8 }}>
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            style={{
                                flex: 1,
                                height: 4,
                                borderRadius: 4,
                                background: s <= step ? "var(--primary)" : "var(--border)",
                                transition: "background 0.3s",
                            }}
                        />
                    ))}
                </div>

                {/* Modal Body */}
                <div style={{ padding: "24px 28px" }}>
                    {step === 1 ? (
                        <div>
                            {/* Name Row */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">First Name</label>
                                    <input className="form-input" type="text" placeholder="e.g. Amara" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Last Name</label>
                                    <input className="form-input" type="text" placeholder="e.g. Okafor" />
                                </div>
                            </div>

                            {/* DOB & Gender */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Date of Birth</label>
                                    <input className="form-input" type="date" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Gender</label>
                                    <select
                                        className="form-input"
                                        style={{ cursor: "pointer" }}
                                    >
                                        <option value="">Select gender</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                        <option>Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            {/* Diagnosis */}
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label className="form-label">Primary Diagnosis</label>
                                <input className="form-input" type="text" placeholder="e.g. Major Depressive Disorder" />
                            </div>

                            {/* Assigned Staff */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Assign Staff Member</label>
                                <select className="form-input" style={{ cursor: "pointer" }}>
                                    <option value="">Select a staff member</option>
                                    <option>Dr. C. Obi — Psychologist</option>
                                    <option>Dr. B. Adeyemi — Psychiatrist</option>
                                    <option>Dr. A. Kolade — Psychiatrist</option>
                                    <option>Dr. F. Eze — Counsellor</option>
                                    <option>Nurse R. Bello — Psychiatric Nurse</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Phone & Email */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Phone Number</label>
                                    <input className="form-input" type="tel" placeholder="0803 000 0000" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Email Address</label>
                                    <input className="form-input" type="email" placeholder="patient@email.com" />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label className="form-label">Home Address</label>
                                <input className="form-input" type="text" placeholder="e.g. 12 Aba Road, Port Harcourt" />
                            </div>

                            {/* Emergency Contact */}
                            <div
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 10,
                                    padding: "14px 16px",
                                    marginBottom: 14,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 12.5,
                                        fontWeight: 700,
                                        color: "var(--fg-mid)",
                                        marginBottom: 12,
                                        fontFamily: "'Space Mono', monospace",
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase" as const,
                                        // fontSize: 10,
                                    } as React.CSSProperties}
                                >
                                    Emergency Contact
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Contact Name</label>
                                        <input className="form-input" type="text" placeholder="Full name" />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Relationship</label>
                                        <select className="form-input" style={{ cursor: "pointer" }}>
                                            <option value="">Select</option>
                                            <option>Spouse</option>
                                            <option>Parent</option>
                                            <option>Sibling</option>
                                            <option>Child</option>
                                            <option>Friend</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0, gridColumn: "span 2" }}>
                                        <label className="form-label">Emergency Phone</label>
                                        <input className="form-input" type="tel" placeholder="0803 000 0000" />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Additional Notes <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    placeholder="Any additional information about this patient…"
                                    style={{ resize: "vertical", minHeight: 72 }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div
                    style={{
                        padding: "16px 28px",
                        borderTop: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                    }}
                >
                    <button
                        onClick={step === 1 ? onClose : () => setStep(1)}
                        style={{
                            padding: "10px 20px",
                            border: "1.5px solid var(--border)",
                            borderRadius: 9,
                            background: "var(--card)",
                            cursor: "pointer",
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: "var(--fg-mid)",
                            fontFamily: "'Nunito', sans-serif",
                            transition: "all 0.13s",
                        }}
                    >
                        {step === 1 ? "Cancel" : "← Back"}
                    </button>

                    <button
                        onClick={() => (step === 1 ? setStep(2) : onClose())}
                        style={{
                            padding: "10px 24px",
                            border: "none",
                            borderRadius: 9,
                            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                            cursor: "pointer",
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: "#fff",
                            fontFamily: "'Nunito', sans-serif",
                            boxShadow: "0 3px 12px rgba(44,122,110,0.28)",
                            transition: "opacity 0.15s",
                        }}
                    >
                        {step === 1 ? "Continue →" : "Save Patient"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ─── */
export default function PatientsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    return (
        <>
            {showModal && <AddPatientModal onClose={() => setShowModal(false)} />}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Patient Management</div>
                    <div className="page-subtitle">
                        142 registered patients · Clarum Mental Health Centre
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 18px",
                            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                            border: "none",
                            borderRadius: 10,
                            color: "#fff",
                            fontSize: 13.5,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "'Nunito', sans-serif",
                            boxShadow: "0 3px 12px rgba(44,122,110,0.28)",
                            transition: "opacity 0.15s, transform 0.15s",
                        }}
                    >
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                        Add New Patient
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                {tabs.map((tab, i) => (
                    <button
                        key={tab.label}
                        className={`filter-tab${activeTab === i ? " active" : ""}`}
                        onClick={() => setActiveTab(i)}
                    >
                        {tab.label}
                        <span
                            style={{
                                marginLeft: 6,
                                fontFamily: "'Space Mono', monospace",
                                fontSize: 10,
                                opacity: 0.75,
                            }}
                        >
              ({tab.count})
            </span>
                    </button>
                ))}

                {/* Search on the right */}
                <div style={{ marginLeft: "auto", position: "relative" }}>
          <span
              style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted)",
                  fontSize: 13,
                  pointerEvents: "none",
              }}
          >
            🔍
          </span>
                    <input
                        type="text"
                        placeholder="Search patients…"
                        style={{
                            border: "1.5px solid var(--border)",
                            borderRadius: 8,
                            padding: "7px 14px 7px 34px",
                            fontFamily: "'Nunito', sans-serif",
                            fontSize: 13,
                            color: "var(--fg)",
                            background: "var(--card)",
                            outline: "none",
                            width: 200,
                            transition: "border-color 0.18s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                </div>
            </div>

            {/* Patient Table */}
            <div className="card">
                <table className="data-table">
                    <thead>
                    <tr>
                        <th style={{ width: 48 }}>S/N</th>
                        <th>Patient ID</th>
                        <th>Patient Name</th>
                        <th>Gender</th>
                        <th>Date of Birth</th>
                        <th>Assigned Staff</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" as const }}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {mockPatients.map((patient, index) => (
                        <tr
                            key={patient.id}
                            style={{ cursor: "pointer" }}
                        >
                            {/* S/N */}
                            <td>
                  <span
                      style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 11,
                          color: "var(--muted)",
                      }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                            </td>

                            {/* Patient ID */}
                            <td>
                  <span
                      style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 11,
                          color: "var(--primary)",
                          background: "var(--primary-light)",
                          padding: "3px 8px",
                          borderRadius: 5,
                          fontWeight: 700,
                      }}
                  >
                    {patient.id}
                  </span>
                            </td>

                            {/* Patient Name */}
                            <td>
                                <Link
                                    href={`/patients/${patient.id}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div
                                            className="av-initials"
                                            style={{ background: patient.color }}
                                        >
                                            {patient.initials}
                                        </div>
                                        <span
                                            className="patient-name"
                                            style={{
                                                transition: "color 0.13s",
                                            }}
                                        >
                        {patient.name}
                      </span>
                                    </div>
                                </Link>
                            </td>

                            {/* Gender */}
                            <td>
                                <span className="td-text">{patient.gender}</span>
                            </td>

                            {/* DOB */}
                            <td>
                                <span className="td-mono">{patient.dob}</span>
                            </td>

                            {/* Assigned Staff */}
                            <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    <div
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 6,
                                            background: "var(--primary-light)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: "var(--primary)",
                                            fontFamily: "'Fraunces', serif",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {patient.assignedStaff
                                            .split(" ")
                                            .slice(-2)
                                            .map((w) => w[0])
                                            .join("")}
                                    </div>
                                    <span className="td-text">{patient.assignedStaff}</span>
                                </div>
                            </td>

                            {/* Status */}
                            <td>
                  <span className={`chip ${statusChipMap[patient.status]}`}>
                    {statusLabelMap[patient.status]}
                  </span>
                            </td>

                            {/* Action */}
                            <td style={{ textAlign: "right" as const }}>
                                <div
                                    className="dots-menu-wrap"
                                    style={{ display: "inline-block" }}
                                >
                                    <button
                                        className="dots-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(
                                                openMenuId === patient.id ? null : patient.id
                                            );
                                        }}
                                    >
                                        ···
                                    </button>
                                    <div
                                        className={`dots-menu${openMenuId === patient.id ? " open" : ""}`}
                                    >
                                        <Link
                                            href={`/patients/${patient.id}`}
                                            style={{ textDecoration: "none" }}
                                        >
                                            <div className="dots-menu-item">
                                                <span className="dots-menu-icon">👤</span>
                                                View Profile
                                            </div>
                                        </Link>
                                        <div
                                            className="dots-menu-item"
                                            onClick={() => {
                                                setOpenMenuId(null);
                                                setShowModal(true);
                                            }}
                                        >
                                            <span className="dots-menu-icon">✏️</span>
                                            Edit Record
                                        </div>
                                        <div className="dots-menu-item">
                                            <span className="dots-menu-icon">📋</span>
                                            View Enrollments
                                        </div>
                                        <div className="dots-menu-item">
                                            <span className="dots-menu-icon">👩‍⚕️</span>
                                            Assign Staff
                                        </div>
                                        <div className="dots-menu-item danger">
                                            <span className="dots-menu-icon">🚪</span>
                                            Discharge
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination">
                    <button className="page-btn disabled">« Prev</button>
                    <button className="page-btn active">1</button>
                    <button className="page-btn">2</button>
                    <button className="page-btn">3</button>
                    <span
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: 10,
                            color: "var(--muted)",
                            margin: "0 8px",
                        }}
                    >
            …
          </span>
                    <button className="page-btn">15</button>
                    <button className="page-btn">Next »</button>

                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span
                style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10,
                    color: "var(--muted)",
                }}
            >
              Showing 1–8 of 142 patients
            </span>
                    </div>
                </div>
            </div>
        </>
    );
}