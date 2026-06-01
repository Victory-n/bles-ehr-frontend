import os

page_content = """\
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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
function AddPatientModal({ onClose, onSuccess, staffList }: { onClose: () => void, onSuccess: () => void, staffList: any[] }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        primaryDiagnosis: "",
        assignedStaffId: "",
        phone: "",
        email: "",
        address: "",
        contactName: "",
        contactRelationship: "",
        contactPhone: "",
        notes: "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    dateOfBirth: form.dateOfBirth,
                    gender: form.gender,
                    phone: form.phone,
                    email: form.email,
                    address: form.address,
                    assignedStaffId: form.assignedStaffId || null,
                    metadata: {
                        primaryDiagnosis: form.primaryDiagnosis,
                        emergencyContact: {
                            name: form.contactName,
                            relationship: form.contactRelationship,
                            phone: form.contactPhone,
                        },
                        notes: form.notes,
                    }
                })
            });
            if (res.ok) {
                onSuccess();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to add patient.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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
                                    <input className="form-input" type="text" placeholder="e.g. Amara" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Last Name</label>
                                    <input className="form-input" type="text" placeholder="e.g. Okafor" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                                </div>
                            </div>

                            {/* DOB & Gender */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Date of Birth</label>
                                    <input className="form-input" type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Gender</label>
                                    <select
                                        className="form-input"
                                        style={{ cursor: "pointer" }}
                                        value={form.gender}
                                        onChange={e => setForm({...form, gender: e.target.value})}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer_not_to_say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            {/* Diagnosis */}
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label className="form-label">Primary Diagnosis</label>
                                <input className="form-input" type="text" placeholder="e.g. Major Depressive Disorder" value={form.primaryDiagnosis} onChange={e => setForm({...form, primaryDiagnosis: e.target.value})} />
                            </div>

                            {/* Assigned Staff */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Assign Staff Member</label>
                                <select className="form-input" style={{ cursor: "pointer" }} value={form.assignedStaffId} onChange={e => setForm({...form, assignedStaffId: e.target.value})}>
                                    <option value="">Select a staff member</option>
                                    {staffList.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.metadata?.position || 'Staff'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Phone & Email */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Phone Number</label>
                                    <input className="form-input" type="tel" placeholder="0803 000 0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Email Address</label>
                                    <input className="form-input" type="email" placeholder="patient@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label className="form-label">Home Address</label>
                                <input className="form-input" type="text" placeholder="e.g. 12 Aba Road, Port Harcourt" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
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
                                    } as React.CSSProperties}
                                >
                                    Emergency Contact
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Contact Name</label>
                                        <input className="form-input" type="text" placeholder="Full name" value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Relationship</label>
                                        <select className="form-input" style={{ cursor: "pointer" }} value={form.contactRelationship} onChange={e => setForm({...form, contactRelationship: e.target.value})}>
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
                                        <input className="form-input" type="tel" placeholder="0803 000 0000" value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} />
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
                                    value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
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
                        onClick={() => (step === 1 ? setStep(2) : handleSubmit())}
                        disabled={loading}
                        style={{
                            padding: "10px 24px",
                            border: "none",
                            borderRadius: 9,
                            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: "#fff",
                            fontFamily: "'Nunito', sans-serif",
                            boxShadow: "0 3px 12px rgba(44,122,110,0.28)",
                            transition: "opacity 0.15s",
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? "Saving..." : step === 1 ? "Continue →" : "Save Patient"}
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
    const [patients, setPatients] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [patientsRes, staffRes] = await Promise.all([
                    fetch("http://localhost:5000/patients", { credentials: "include" }),
                    fetch("http://localhost:5000/staff", { credentials: "include" })
                ]);
                
                if (patientsRes.ok) {
                    const data = await patientsRes.json();
                    setPatients(data.data || []);
                }
                
                if (staffRes.ok) {
                    const data = await staffRes.json();
                    setStaffList(data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePatientAdded = async () => {
        setShowModal(false);
        const res = await fetch("http://localhost:5000/patients", { credentials: "include" });
        if (res.ok) {
            const data = await res.json();
            setPatients(data.data || []);
        }
    };

    const tabs = [
        { label: "All", count: patients.length },
        { label: "Active", count: patients.filter(p => p.status === "active").length },
        { label: "Discharged", count: patients.filter(p => p.status === "discharged").length },
        { label: "Critical", count: patients.filter(p => p.status === "critical").length },
    ];
    
    const filteredPatients = patients.filter(p => {
        if (activeTab === 0) return true;
        if (activeTab === 1) return p.status === "active";
        if (activeTab === 2) return p.status === "discharged";
        if (activeTab === 3) return p.status === "critical";
        return true;
    });

    return (
        <>
            {showModal && <AddPatientModal onClose={() => setShowModal(false)} onSuccess={handlePatientAdded} staffList={staffList} />}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Patient Management</div>
                    <div className="page-subtitle">
                        {patients.length} registered patients · BrightLife EHR
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
                    {loading ? (
                        <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>Loading patients...</td></tr>
                    ) : filteredPatients.length === 0 ? (
                        <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>No patients found.</td></tr>
                    ) : filteredPatients.map((patient, index) => (
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
                    {patient.id.substring(0, 8)}
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
                                            style={{ background: "#2C7A6E" }}
                                        >
                                            {patient.firstName[0]}{patient.lastName[0]}
                                        </div>
                                        <span
                                            className="patient-name"
                                            style={{
                                                transition: "color 0.13s",
                                            }}
                                        >
                        {patient.firstName} {patient.lastName}
                      </span>
                                    </div>
                                </Link>
                            </td>

                            {/* Gender */}
                            <td>
                                <span className="td-text">{patient.gender || '-'}</span>
                            </td>

                            {/* DOB */}
                            <td>
                                <span className="td-mono">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '-'}</span>
                            </td>

                            {/* Assigned Staff */}
                            <td>
                                {patient.assignedStaff ? (
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
                                            {patient.assignedStaff.firstName[0]}{patient.assignedStaff.lastName[0]}
                                        </div>
                                        <span className="td-text">{patient.assignedStaff.firstName} {patient.assignedStaff.lastName}</span>
                                    </div>
                                ) : (
                                    <span className="td-text" style={{ color: "var(--muted)" }}>Unassigned</span>
                                )}
                            </td>

                            {/* Status */}
                            <td>
                  <span className={`chip ${statusChipMap[patient.status] || "chip-active"}`}>
                    {statusLabelMap[patient.status] || patient.status}
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
                                                // setShowModal(true); // TODO: Edit modal
                                            }}
                                        >
                                            <span className="dots-menu-icon">✏️</span>
                                            Edit Record
                                        </div>
                                        <div className="dots-menu-item">
                                            <span className="dots-menu-icon">📋</span>
                                            <p className={"text-nowrap"}>View Enrollments</p>
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
                    <button className="page-btn">Next »</button>

                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span
                style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10,
                    color: "var(--muted)",
                }}
            >
              Showing {filteredPatients.length} patients
            </span>
                    </div>
                </div>
            </div>
        </>
    );
}
"""

with open(r"C:\Users\VICTORY\Documents\GitHub\bles-ehr-frontend\app\(platform)\patients\page.tsx", "w", encoding="utf-8") as f:
    f.write(page_content)

print("Successfully wrote patients page.tsx")
