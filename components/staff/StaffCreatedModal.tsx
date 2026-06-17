"use client";

import React from "react";

interface Props {
    onClose: () => void;
    staffId: string;
    tempPassword: string;
}

export default function StaffCreatedModal({ onClose, staffId, tempPassword }: Props) {
    const [copiedId, setCopiedId] = React.useState(false);
    const [copiedPassword, setCopiedPassword] = React.useState(false);

    const copyToClipboard = (text: string, type: "id" | "password") => {
        navigator.clipboard.writeText(text);
        if (type === "id") {
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        } else {
            setCopiedPassword(true);
            setTimeout(() => setCopiedPassword(false), 2000);
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 101,
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
                    maxWidth: 480,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    background: "#ffffff",
                    borderRadius: 14,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header with success icon */}
                <div
                    style={{
                        padding: "24px 24px 16px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        borderBottom: "1px solid var(--color-outline-variant)",
                    }}
                >
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            background: "rgba(19, 115, 51, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 16,
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#137333" }}>
                            check_circle
                        </span>
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-on-surface)", margin: 0 }}>
                        Staff Member Created
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", margin: "8px 0 0" }}>
                        Copy these credentials to send to the staff member.
                    </p>
                </div>

                {/* Credentials */}
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Staff ID</span>
                            <button
                                onClick={() => copyToClipboard(staffId, "id")}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "var(--color-primary-container)",
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                    {copiedId ? "check" : "content_copy"}
                                </span>
                                {copiedId ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <div
                            style={{
                                padding: "12px 14px",
                                borderRadius: 8,
                                background: "var(--color-surface-container-lowest)",
                                border: "1px solid var(--color-outline-variant)",
                                fontFamily: "var(--font-mono)",
                                fontSize: 14,
                                color: "var(--color-on-surface)",
                            }}
                        >
                            {staffId}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Temporary Password</span>
                            <button
                                onClick={() => copyToClipboard(tempPassword, "password")}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "var(--color-primary-container)",
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                    {copiedPassword ? "check" : "content_copy"}
                                </span>
                                {copiedPassword ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <div
                            style={{
                                padding: "12px 14px",
                                borderRadius: 8,
                                background: "var(--color-surface-container-lowest)",
                                border: "1px solid var(--color-outline-variant)",
                                fontFamily: "var(--font-mono)",
                                fontSize: 14,
                                color: "var(--color-on-surface)",
                            }}
                        >
                            {tempPassword}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "16px 24px 20px",
                        display: "flex",
                        justifyContent: "flex-end",
                        borderTop: "1px solid var(--color-outline-variant)",
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 24px",
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
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
