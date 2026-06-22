"use client";

import React, { useState, useMemo, useEffect } from "react";

// Patient interface matching the API response
interface Patient {
    id: string;
    patientId: string;
    firstname: string;
    lastname: string;
    status: "Active" | "Inactive" | "Pending";
}

interface Props {
    onClose: () => void;
    onEnroll?: (patientId: string) => void;
}

export default function EnrollPatientModal({ onClose, onEnroll }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch patients from API
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch("/api/patients");
                if (res.ok) {
                    const data = await res.json();
                    setPatients(data.patients || []);
                }
            } catch (error) {
                console.error("Failed to fetch patients:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const filteredPatients = useMemo(() => {
        if (!searchQuery) return patients;
        const query = searchQuery.toLowerCase();
        return patients.filter(p => 
            `${p.lastname}, ${p.firstname}`.toLowerCase().includes(query) ||
            p.patientId.toLowerCase().includes(query)
        );
    }, [searchQuery, patients]);

    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsDropdownOpen(false);
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(3px)",
                padding: 24,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: 540,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    background: "#ffffff",
                    borderRadius: 14,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 24px",
                        borderBottom: "1px solid var(--color-outline-variant)",
                        position: "sticky",
                        top: 0,
                        background: "#ffffff",
                        zIndex: 1,
                        borderRadius: "14px 14px 0 0",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary-container)" }}>person_add</span>
                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>Enroll Patient</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", padding: 4 }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Searchable Patient Dropdown */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)" }}>
                            Select Patient
                        </label>
                        <div style={{ position: "relative" }}>
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    position: "absolute",
                                    left: 10,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: 18,
                                    color: "var(--color-outline)",
                                    pointerEvents: "none",
                                    zIndex: 1
                                }}
                            >
                                search
                            </span>
                            <input
                                type="text"
                                placeholder={loading ? "Loading patients..." : "Search patients by name or ID..."}
                                value={selectedPatient ? `${selectedPatient.lastname}, ${selectedPatient.firstname} (${selectedPatient.patientId})` : searchQuery}
                                onChange={(e) => {
                                    setSelectedPatient(null);
                                    setSearchQuery(e.target.value);
                                }}
                                onFocus={() => !loading && setIsDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "10px 36px 10px 36px",
                                    borderRadius: 8,
                                    border: "1px solid var(--color-outline-variant)",
                                    background: loading ? "var(--color-surface-container)" : "var(--color-surface-container-lowest)",
                                    fontSize: 13,
                                    color: "var(--color-on-surface)",
                                    outline: "none",
                                    transition: "border-color 0.15s",
                                    boxSizing: "border-box",
                                    fontFamily: "inherit",
                                    cursor: loading ? "not-allowed" : "text",
                                    opacity: loading ? 0.7 : 1,
                                }}
                            />
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    position: "absolute",
                                    right: 10,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: 18,
                                    color: "var(--color-outline)",
                                    pointerEvents: "none",
                                }}
                            >
                                expand_more
                            </span>

                            {/* Dropdown List */}
                            {isDropdownOpen && !loading && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        right: 0,
                                        marginTop: 4,
                                        background: "#ffffff",
                                        border: "1px solid var(--color-outline-variant)",
                                        borderRadius: 8,
                                        maxHeight: 250,
                                        overflowY: "auto",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                        zIndex: 10
                                    }}
                                >
                                    {filteredPatients.length === 0 ? (
                                        <div style={{ padding: "16px", textAlign: "center", color: "var(--color-on-surface-variant)", fontSize: 13 }}>
                                            No patients found
                                        </div>
                                    ) : (
                                        filteredPatients.map((patient) => (
                                            <button
                                                key={patient.id}
                                                onClick={() => handlePatientSelect(patient)}
                                                style={{
                                                    width: "100%",
                                                    textAlign: "left",
                                                    padding: "12px 16px",
                                                    background: selectedPatient?.id === patient.id ? "var(--color-primary-container)" : "transparent",
                                                    color: selectedPatient?.id === patient.id ? "#ffffff" : "var(--color-on-surface)",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    transition: "background 0.12s",
                                                }}
                                                onMouseOver={(e) => {
                                                    if (selectedPatient?.id !== patient.id) {
                                                        e.currentTarget.style.background = "var(--color-surface-container)";
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    if (selectedPatient?.id !== patient.id) {
                                                        e.currentTarget.style.background = "transparent";
                                                    }
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                                                        {patient.lastname}, {patient.firstname}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: selectedPatient?.id === patient.id ? "rgba(255,255,255,0.8)" : "var(--color-on-surface-variant)", fontFamily: "var(--font-mono)" }}>
                                                        {patient.patientId}
                                                    </div>
                                                </div>
                                                <span style={{
                                                    padding: "4px 10px",
                                                    borderRadius: 12,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    background: patient.status === "Active" ? "#e6f4ea" : patient.status === "Inactive" ? "#fce8e8" : "#f1f3f4",
                                                    color: patient.status === "Active" ? "#137333" : patient.status === "Inactive" ? "#b3261e" : "#5f6368",
                                                }}>
                                                    {patient.status}
                                                </span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid var(--color-outline-variant)", marginTop: 8 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 8,
                                border: "1px solid var(--color-outline-variant)",
                                background: "transparent",
                                fontSize: 14,
                                fontWeight: 600,
                                color: "var(--color-on-surface)",
                                cursor: "pointer",
                                transition: "background 0.12s",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={!selectedPatient || loading}
                            onClick={() => selectedPatient && onEnroll?.(selectedPatient.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "10px 20px",
                                borderRadius: 8,
                                border: "none",
                                background: (!selectedPatient || loading) ? "#d1d5db" : "var(--color-primary-container)",
                                color: "#ffffff",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: (!selectedPatient || loading) ? "not-allowed" : "pointer",
                                opacity: (!selectedPatient || loading) ? 0.7 : 1,
                                transition: "background 0.15s",
                            }}
                            onMouseOver={(e) => {
                                if (selectedPatient && !loading) e.currentTarget.style.background = "var(--color-primary)";
                            }}
                            onMouseOut={(e) => {
                                if (selectedPatient && !loading) e.currentTarget.style.background = "var(--color-primary-container)";
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
                            Enroll Patient
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
