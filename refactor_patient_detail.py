import os

page_content = """\
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const tabs = ["Overview", "Programs", "Sessions", "Documents"];

const moodColorMap: Record<string, string> = {
    Improving: "var(--success)",
    Stable: "var(--primary)",
    Moderate: "var(--warning)",
    Distressed: "var(--danger)",
};

export default function PatientDetailPage({ params }: { params: { patientId: string } }) {
    const [activeTab, setActiveTab] = useState("Overview");
    const [patientData, setPatientData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await fetch(`http://localhost:5000/patients/${params.patientId}`, {
                    credentials: "include"
                });
                if (res.ok) {
                    const data = await res.json();
                    setPatientData(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [params.patientId]);

    const progressColor = (pct: number) =>
        pct === 100 ? "var(--success)" : pct >= 60 ? "var(--primary)" : "var(--warning)";

    if (loading) {
        return <div style={{ padding: 40, textAlign: "center" }}>Loading patient details...</div>;
    }

    if (!patientData) {
        return <div style={{ padding: 40, textAlign: "center" }}>Patient not found.</div>;
    }

    const fullName = `${patientData.firstName} ${patientData.lastName}`;
    const initials = `${patientData.firstName[0]}${patientData.lastName[0]}`;
    const age = patientData.dateOfBirth ? new Date().getFullYear() - new Date(patientData.dateOfBirth).getFullYear() : '-';
    
    // Fallback static data for tabs that are not fully implemented yet
    const enrollments: any[] = [];
    const recentSessions: any[] = [];
    const emergencyContacts = patientData.metadata?.emergencyContact?.name 
        ? [patientData.metadata.emergencyContact] 
        : [];

    return (
        <>
            {/* Breadcrumb + Back */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 20,
                    fontSize: 13,
                    color: "var(--muted)",
                }}
            >
                <Link
                    href="/patients"
                    style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                    }}
                >
                    ← Patients
                </Link>
                <span>/</span>
                <span style={{ color: "var(--fg)", fontWeight: 600 }}>{fullName}</span>
                <span
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 10,
                        color: "var(--muted)",
                        marginLeft: 4,
                    }}
                >
          {patientData.id.substring(0, 8)}
        </span>
            </div>

            {/* Patient Hero Card */}
            <div
                style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    marginBottom: 20,
                    overflow: "hidden",
                }}
            >
                {/* Top band */}
                <div
                    style={{
                        height: 6,
                        background: `linear-gradient(90deg, #2C7A6E, var(--primary-mid))`,
                    }}
                />

                <div style={{ padding: "24px 28px", display: "flex", gap: 24, alignItems: "flex-start" }}>
                    {/* Avatar */}
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: 16,
                            background: `linear-gradient(135deg, #2C7A6E 0%, var(--primary-mid) 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "'Fraunces', serif",
                            fontSize: 26,
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                            boxShadow: `0 8px 24px rgba(44,122,110,0.25)`,
                        }}
                    >
                        {initials}
                    </div>

                    {/* Core Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div>
                                <h1
                                    style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: "var(--fg)",
                                        letterSpacing: "-0.02em",
                                        marginBottom: 4,
                                    }}
                                >
                                    {fullName}
                                </h1>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span
                      style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 10,
                          color: "var(--primary)",
                          background: "var(--primary-light)",
                          padding: "3px 9px",
                          borderRadius: 5,
                          fontWeight: 700,
                      }}
                  >
                    {patientData.id}
                  </span>
                                    <span className="chip chip-active">{patientData.status}</span>
                                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                    {patientData.gender || 'Unknown'} · {age} yrs
                  </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    style={{
                                        padding: "8px 16px",
                                        border: "1.5px solid var(--border)",
                                        borderRadius: 9,
                                        background: "var(--card)",
                                        cursor: "pointer",
                                        fontSize: 12.5,
                                        fontWeight: 700,
                                        color: "var(--fg-mid)",
                                        fontFamily: "'Nunito', sans-serif",
                                        transition: "all 0.13s",
                                    }}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    style={{
                                        padding: "8px 16px",
                                        border: "none",
                                        borderRadius: 9,
                                        background: "var(--primary)",
                                        cursor: "pointer",
                                        fontSize: 12.5,
                                        fontWeight: 700,
                                        color: "#fff",
                                        fontFamily: "'Nunito', sans-serif",
                                        boxShadow: "0 2px 8px rgba(44,122,110,0.25)",
                                        transition: "opacity 0.15s",
                                    }}
                                >
                                    + Enrol in Program
                                </button>
                            </div>
                        </div>

                        {/* Stat row */}
                        <div
                            style={{
                                display: "flex",
                                gap: 24,
                                marginTop: 16,
                                paddingTop: 16,
                                borderTop: "1px solid var(--border)",
                            }}
                        >
                            {[
                                { label: "Diagnosis", value: patientData.metadata?.primaryDiagnosis || 'None' },
                                { label: "Assigned Staff", value: patientData.assignedStaff ? `${patientData.assignedStaff.firstName} ${patientData.assignedStaff.lastName}` : 'Unassigned' },
                                { label: "Admitted", value: new Date(patientData.createdAt).toLocaleDateString() },
                                { label: "Sessions", value: `0 total` },
                                { label: "Blood Group", value: patientData.metadata?.bloodGroup || 'Unknown' },
                            ].map((item) => (
                                <div key={item.label} style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontFamily: "'Space Mono', monospace",
                                            fontSize: 9,
                                            color: "var(--muted)",
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            marginBottom: 3,
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "var(--fg)",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div
                style={{
                    display: "flex",
                    gap: 2,
                    marginBottom: 20,
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 11,
                    padding: 4,
                    width: "fit-content",
                }}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: "8px 18px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "'Nunito', sans-serif",
                            background: activeTab === tab ? "var(--primary)" : "transparent",
                            color: activeTab === tab ? "#fff" : "var(--muted)",
                            transition: "all 0.18s",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === "Overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {/* Contact Info */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Contact Information</div>
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                            {[
                                { icon: "📞", label: "Phone", value: patientData.phone || 'N/A' },
                                { icon: "📧", label: "Email", value: patientData.email || 'N/A' },
                                { icon: "🏠", label: "Address", value: patientData.address || 'N/A' },
                                { icon: "🩸", label: "Blood Group", value: patientData.metadata?.bloodGroup || 'N/A' },
                                { icon: "⚠️", label: "Allergies", value: patientData.metadata?.allergies || 'N/A' },
                            ].map((row) => (
                                <div
                                    key={row.label}
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        padding: "10px 0",
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                >
                  <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>
                    {row.icon}
                  </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontFamily: "'Space Mono', monospace",
                                                fontSize: 9,
                                                color: "var(--muted)",
                                                letterSpacing: "0.06em",
                                                textTransform: "uppercase",
                                                marginBottom: 2,
                                            }}
                                        >
                                            {row.label}
                                        </div>
                                        <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>
                                            {row.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="card">
                        <div className="card-head">
                            <div className="card-title">Emergency Contacts</div>
                            <button
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    border: "1.5px solid var(--border)",
                                    background: "var(--card)",
                                    color: "var(--primary)",
                                    padding: "5px 11px",
                                    borderRadius: 7,
                                    cursor: "pointer",
                                    fontFamily: "'Nunito', sans-serif",
                                }}
                            >
                                + Add
                            </button>
                        </div>
                        <div>
                            {emergencyContacts.length === 0 ? (
                                <div style={{ padding: "14px 20px", color: "var(--muted)", fontSize: 13 }}>No emergency contacts added.</div>
                            ) : emergencyContacts.map((ec: any, i: number) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: "14px 20px",
                                        borderBottom:
                                            i < emergencyContacts.length - 1 ? "1px solid var(--border)" : "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            background: "var(--primary-light)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontFamily: "'Fraunces', serif",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "var(--primary)",
                                        }}
                                    >
                                        {ec.name ? ec.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("") : "?"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg)" }}>
                                            {ec.name || 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>
                                            {ec.relationship || 'Unknown'} · {ec.phone || 'No phone'}
                                        </div>
                                    </div>
                                    <button
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: 13,
                                            color: "var(--muted)",
                                            padding: 4,
                                        }}
                                    >
                                        ✏️
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Clinical Notes */}
                        {patientData.metadata?.notes && (
                            <div
                                style={{
                                    margin: "0 20px 20px",
                                    marginTop: 4,
                                    background: "var(--warning-light)",
                                    border: "1px solid #f5c58a",
                                    borderRadius: 10,
                                    padding: "12px 14px",
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: 9,
                                        color: "var(--warning)",
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                        marginBottom: 6,
                                        fontWeight: 700,
                                    }}
                                >
                                    Clinical Notes
                                </div>
                                <div style={{ fontSize: 13, color: "var(--fg-mid)", lineHeight: 1.6 }}>
                                    {patientData.metadata.notes}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab: Programs (Enrollments) */}
            {activeTab === "Programs" && (
                <div style={{ padding: 40, textAlign: "center" }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>No enrollments yet</div>
                </div>
            )}

            {/* Tab: Sessions */}
            {activeTab === "Sessions" && (
                <div style={{ padding: 40, textAlign: "center" }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🗓️</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>No sessions yet</div>
                </div>
            )}

            {/* Tab: Documents */}
            {activeTab === "Documents" && (
                <div className="card">
                    <div className="card-head">
                        <div className="card-title">Patient Documents</div>
                        <button
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                border: "1.5px solid var(--border)",
                                background: "var(--card)",
                                color: "var(--primary)",
                                padding: "6px 13px",
                                borderRadius: 7,
                                cursor: "pointer",
                                fontFamily: "'Nunito', sans-serif",
                            }}
                        >
                            + Upload Document
                        </button>
                    </div>
                    <div style={{ padding: 40, textAlign: "center" }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>📁</div>
                        <div
                            style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: 17,
                                fontWeight: 600,
                                color: "var(--fg)",
                                marginBottom: 6,
                            }}
                        >
                            No documents yet
                        </div>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
                            Upload consent forms, referral letters, or any patient documents
                        </div>
                        <button
                            style={{
                                padding: "9px 18px",
                                border: "none",
                                borderRadius: 8,
                                background: "var(--primary)",
                                color: "#fff",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "'Nunito', sans-serif",
                                boxShadow: "0 2px 8px rgba(44,122,110,0.25)",
                            }}
                        >
                            Select File
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
"""

with open(r"C:\Users\VICTORY\Documents\GitHub\bles-ehr-frontend\app\(platform)\patients\[patientId]\page.tsx", "w", encoding="utf-8") as f:
    f.write(page_content)

print("Successfully wrote patient details page.tsx")
