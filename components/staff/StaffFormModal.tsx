"use client";

import React from "react";
import { SetPinModal, VerifyPinModal } from "@/components/PinModal";
import StaffCreatedModal from "./StaffCreatedModal";

interface StaffFormData {
    firstName?: string;
    lastName?: string;
    email?: string;
    position?: string;
}

interface Props {
    onClose: () => void;
}

export default function StaffFormModal({ onClose }: Props) {
    const [pinSet, setPinSet] = React.useState(false);
    const [showSetPinModal, setShowSetPinModal] = React.useState(false);
    const [showVerifyPinModal, setShowVerifyPinModal] = React.useState(false);
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);
    const [formVisible, setFormVisible] = React.useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pinSet) {
            setShowSetPinModal(true);
        } else {
            setShowVerifyPinModal(true);
        }
    };

    const completeAction = () => {
        setFormVisible(false);
        setShowSuccessModal(true);
    };

    const handleDone = () => {
        onClose();
    };

    return (
        <>
            {formVisible && (
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
                        {/* ── Header ─────────────────────────────────────────────────── */}
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
                                <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary-container)" }}>
                                    person_add
                                </span>
                                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>
                                    Add New Staff Member
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", padding: 4 }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
                            </button>
                        </div>

                        {/* ── Body ────────────────────────────────────────────────────── */}
                        <form
                            onSubmit={handleSubmit}
                            style={{ padding: "8px 24px 24px", display: "flex", flexDirection: "column", gap: 18 }}
                        >
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)" }}>First Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter first name"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: 8,
                                            border: "1px solid var(--color-outline-variant)",
                                            background: "var(--color-surface-container-lowest)",
                                            fontSize: 14,
                                            color: "var(--color-on-surface)",
                                            outline: "none",
                                            transition: "border-color 0.15s",
                                            boxSizing: "border-box",
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "var(--color-primary-container)")}
                                        onBlur={(e) => (e.target.style.borderColor = "var(--color-outline-variant)")}
                                    />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)" }}>Last Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter last name"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: 8,
                                            border: "1px solid var(--color-outline-variant)",
                                            background: "var(--color-surface-container-lowest)",
                                            fontSize: 14,
                                            color: "var(--color-on-surface)",
                                            outline: "none",
                                            transition: "border-color 0.15s",
                                            boxSizing: "border-box",
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "var(--color-primary-container)")}
                                        onBlur={(e) => (e.target.style.borderColor = "var(--color-outline-variant)")}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)" }}>Email *</label>
                                <input
                                    type="email"
                                    placeholder="staff@clinic.com"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px 14px",
                                        borderRadius: 8,
                                        border: "1px solid var(--color-outline-variant)",
                                        background: "var(--color-surface-container-lowest)",
                                        fontSize: 14,
                                        color: "var(--color-on-surface)",
                                        outline: "none",
                                        transition: "border-color 0.15s",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "var(--color-primary-container)")}
                                    onBlur={(e) => (e.target.style.borderColor = "var(--color-outline-variant)")}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)" }}>Position *</label>
                                <div style={{ position: "relative" }}>
                                    <select
                                        required
                                        defaultValue=""
                                        style={{
                                            width: "100%",
                                            padding: "10px 32px 10px 14px",
                                            borderRadius: 8,
                                            border: "1px solid var(--color-outline-variant)",
                                            background: "var(--color-surface-container-lowest)",
                                            fontSize: 14,
                                            color: "var(--color-on-surface)",
                                            outline: "none",
                                            transition: "border-color 0.15s",
                                            boxSizing: "border-box",
                                            appearance: "none",
                                            cursor: "pointer",
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "var(--color-primary-container)")}
                                        onBlur={(e) => (e.target.style.borderColor = "var(--color-outline-variant)")}
                                    >
                                        <option value="" disabled>Select position</option>
                                        <option value="Lead Psychiatrist">Lead Psychiatrist</option>
                                        <option value="Clinical Nurse">Clinical Nurse</option>
                                        <option value="Therapist">Therapist</option>
                                        <option value="Systems Admin">Systems Admin</option>
                                        <option value="Security Officer">Security Officer</option>
                                        <option value="Billing Specialist">Billing Specialist</option>
                                        <option value="Compliance Officer">Compliance Officer</option>
                                    </select>
                                    <span className="material-symbols-outlined" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--color-outline)", pointerEvents: "none" }}>expand_more</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-outline-variant)" }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--color-outline-variant)", background: "transparent", fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", cursor: "pointer", transition: "background 0.12s" }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "10px 20px",
                                        borderRadius: 8,
                                        border: "none",
                                        background: "var(--color-primary-container)",
                                        color: "#ffffff",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "background 0.15s",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-primary-container)")}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
                                    Create Staff Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PIN Modals */}
            {showSetPinModal && (
                <SetPinModal
                    onClose={() => {
                        setShowSetPinModal(false);
                        setPinSet(true);
                        completeAction();
                    }}
                />
            )}
            {showVerifyPinModal && (
                <VerifyPinModal
                    onClose={() => {
                        setShowVerifyPinModal(false);
                        completeAction();
                    }}
                />
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <StaffCreatedModal onClose={handleDone} />
            )}
        </>
    );
}
