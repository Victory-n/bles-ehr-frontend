"use client";

import React, { useState } from "react";
import StaffCreatedModal from "./StaffCreatedModal";
import { useAuth } from "@/lib/auth/AuthContext";

// Define resources and permissions for the form
const RESOURCES = [
    { key: "p", label: "Patient" },
    { key: "pr", label: "Programs" },
    { key: "cn", label: "Clinic Notes" },
    { key: "s", label: "Staff" },
    { key: "b", label: "Billing" },
    { key: "c", label: "Compliance" },
    { key: "al", label: "Audit Log" }
];

const PERMISSIONS = [
    { key: 1, label: "Create" },
    { key: 2, label: "Read" },
    { key: 3, label: "Update" },
    { key: 4, label: "Write" },
    { key: 5, label: "Delete" }
];

interface CreatedStaff {
    staffId: string;
    tempPassword: string;
}

interface Props {
    onClose: () => void;
}

export default function StaffFormModal({ onClose }: Props) {
    const { user: currentUser } = useAuth();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formVisible, setFormVisible] = useState(true);
    const [activeTab, setActiveTab] = useState<"profile" | "permissions">("profile");
    const [permissions, setPermissions] = useState<Record<string, number[]>>({});
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        position: "",
    });
    const [createdStaff, setCreatedStaff] = useState<CreatedStaff | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'profile') {
            setActiveTab('permissions');
        } else {
            if (!currentUser) return;
            await createStaffMember();
        }
    };

    const createStaffMember = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/staff", {
                method: "POST",
                headers: {
                    "Content-Type": "Application/json",
                },
                body: JSON.stringify({
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    email: formData.email,
                    position: formData.position,
                    permissions: permissions,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setCreatedStaff({
                    staffId: data.user.staffId,
                    tempPassword: data.tempPassword,
                });
                setFormVisible(false);
                setShowSuccessModal(true);
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Failed to create staff member");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to create staff member");
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleDone = () => {
        onClose();
    };

    const togglePermission = (resourceKey: string, permissionKey: number) => {
        setPermissions(prev => {
            const current = prev[resourceKey] || [];
            const updated = current.includes(permissionKey)
                ? current.filter(p => p !== permissionKey)
                : [...current, permissionKey];
            return { ...prev, [resourceKey]: updated };
        });
    };

    const selectAllForResource = (resourceKey: string) => {
        setPermissions(prev => ({
            ...prev,
            [resourceKey]: PERMISSIONS.map(p => p.key)
        }));
    };

    const clearAllForResource = (resourceKey: string) => {
        setPermissions(prev => ({
            ...prev,
            [resourceKey]: []
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
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
                            maxWidth: activeTab === 'profile' ? 540 : 900,
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

                        {/* ── Tabs ─────────────────────────────────────────────────── */}
                        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--color-outline-variant)" }}>
                            {[
                                { id: 'profile', label: 'Profile' },
                                { id: 'permissions', label: 'Permissions' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    style={{
                                        padding: "10px 24px",
                                        fontSize: 14,
                                        fontWeight: activeTab === tab.id ? 700 : 500,
                                        color: activeTab === tab.id ? "var(--color-primary-container)" : "var(--color-on-surface-variant)",
                                        background: "none",
                                        border: "none",
                                        borderBottom: activeTab === tab.id ? "2px solid var(--color-primary-container)" : "2px solid transparent",
                                        marginBottom: -2,
                                        cursor: "pointer",
                                        transition: "color 0.12s",
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Body ────────────────────────────────────────────────────── */}
                        <form
                            onSubmit={handleSubmit}
                            style={{ padding: "8px 24px 24px", display: "flex", flexDirection: "column", gap: 18 }}
                        >
                            {activeTab === 'profile' && (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)" }}>First Name *</label>
                                            <input
                                                type="text"
                                                name="firstname"
                                                value={formData.firstname}
                                                onChange={handleInputChange}
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
                                                name="lastname"
                                                value={formData.lastname}
                                                onChange={handleInputChange}
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
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
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
                                                name="position"
                                                value={formData.position}
                                                onChange={handleInputChange}
                                                required
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
                                </>
                            )}

                            {activeTab === 'permissions' && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.5 }}>
                                        Configure access permissions for the new staff member. Check the boxes to grant permissions for each resource.
                                    </p>
                                    
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                                            <thead>
                                                <tr style={{ borderBottom: "2px solid var(--color-outline-variant)" }}>
                                                    <th style={{ 
                                                        padding: "12px 16px", 
                                                        textAlign: "left", 
                                                        fontSize: 12, 
                                                        fontWeight: 700, 
                                                        textTransform: "uppercase", 
                                                        letterSpacing: "0.05em", 
                                                        color: "var(--color-on-surface-variant)" 
                                                    }}>
                                                        Resource
                                                    </th>
                                                    {PERMISSIONS.map(perm => (
                                                        <th key={perm.key} style={{ 
                                                            padding: "12px 8px", 
                                                            textAlign: "center", 
                                                            fontSize: 12, 
                                                            fontWeight: 700, 
                                                            textTransform: "uppercase", 
                                                            letterSpacing: "0.05em", 
                                                            color: "var(--color-on-surface-variant)" 
                                                        }}>
                                                            {perm.label}
                                                        </th>
                                                    ))}
                                                    <th style={{ 
                                                        padding: "12px 16px", 
                                                        textAlign: "center", 
                                                        fontSize: 12, 
                                                        fontWeight: 700, 
                                                        textTransform: "uppercase", 
                                                        letterSpacing: "0.05em", 
                                                        color: "var(--color-on-surface-variant)" 
                                                    }}>
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {RESOURCES.map(resource => {
                                                    const resourcePerms = permissions[resource.key] || [];
                                                    return (
                                                        <tr key={resource.key} style={{ 
                                                            borderBottom: "1px solid var(--color-outline-variant)",
                                                            background: "var(--color-surface-container-lowest)"
                                                        }}>
                                                            <td style={{ 
                                                                padding: "12px 16px", 
                                                                fontSize: 14, 
                                                                fontWeight: 600, 
                                                                color: "var(--color-on-surface)" 
                                                            }}>
                                                                {resource.label}
                                                            </td>
                                                            {PERMISSIONS.map(perm => (
                                                                <td key={perm.key} style={{ 
                                                                    padding: "12px 8px", 
                                                                    textAlign: "center" 
                                                                }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={resourcePerms.includes(perm.key)}
                                                                        onChange={() => togglePermission(resource.key, perm.key)}
                                                                        style={{
                                                                            width: 18,
                                                                            height: 18,
                                                                            cursor: "pointer",
                                                                            accentColor: "var(--color-primary-container)"
                                                                        }}
                                                                    />
                                                                </td>
                                                            ))}
                                                            <td style={{ 
                                                                padding: "12px 16px", 
                                                                textAlign: "center" 
                                                            }}>
                                                                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => selectAllForResource(resource.key)}
                                                                        style={{
                                                                            padding: "4px 12px",
                                                                            fontSize: 11,
                                                                            fontWeight: 600,
                                                                            borderRadius: 6,
                                                                            border: "1px solid var(--color-outline-variant)",
                                                                            background: "transparent",
                                                                            color: "var(--color-on-surface-variant)",
                                                                            cursor: "pointer",
                                                                            transition: "all 0.12s"
                                                                        }}
                                                                        onMouseOver={(e) => {
                                                                            e.currentTarget.style.background = "var(--color-surface-container)";
                                                                            e.currentTarget.style.borderColor = "var(--color-outline)";
                                                                        }}
                                                                        onMouseOut={(e) => {
                                                                            e.currentTarget.style.background = "transparent";
                                                                            e.currentTarget.style.borderColor = "var(--color-outline-variant)";
                                                                        }}
                                                                    >
                                                                        All
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => clearAllForResource(resource.key)}
                                                                        style={{
                                                                            padding: "4px 12px",
                                                                            fontSize: 11,
                                                                            fontWeight: 600,
                                                                            borderRadius: 6,
                                                                            border: "1px solid var(--color-outline-variant)",
                                                                            background: "transparent",
                                                                            color: "var(--color-error)",
                                                                            cursor: "pointer",
                                                                            transition: "all 0.12s"
                                                                        }}
                                                                        onMouseOver={(e) => {
                                                                            e.currentTarget.style.background = "#fce8e8";
                                                                            e.currentTarget.style.borderColor = "var(--color-error)";
                                                                        }}
                                                                        onMouseOut={(e) => {
                                                                            e.currentTarget.style.background = "transparent";
                                                                            e.currentTarget.style.borderColor = "var(--color-outline-variant)";
                                                                        }}
                                                                    >
                                                                        None
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-outline-variant)" }}>
                                {activeTab === 'permissions' && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('profile')}
                                        style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--color-outline-variant)", background: "transparent", fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", cursor: "pointer", transition: "background 0.12s" }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                                        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        Back
                                    </button>
                                )}
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
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                        {activeTab === 'profile' ? 'arrow_forward' : 'person_add'}
                                    </span>
                                    {activeTab === 'profile' ? 'Next' : 'Create Staff Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}



            {/* Success Modal */}
            {showSuccessModal && createdStaff && (
                <StaffCreatedModal
                    onClose={handleDone}
                    staffId={createdStaff.staffId}
                    tempPassword={createdStaff.tempPassword}
                />
            )}
        </>
    );
}
