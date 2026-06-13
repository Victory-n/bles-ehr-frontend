"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { SetPinModal } from "@/components/PinModal";

/* ══════════════════════════════════════════════════════════════════════════
   Mock Settings Data
   ══════════════════════════════════════════════════════════════════════════ */

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    title: string;
    department: string;
    dob: string;
    sex: string;
    bio: string;
}

const INITIAL_PROFILE: UserProfile = {
    firstName: "Mia",
    lastName: "Bles",
    email: "mia@bles.com",
    phone: "(555) 019-2834",
    title: "Clinical Director",
    department: "Administration",
    dob: "1995-04-12",
    sex: "Female",
    bio: "Experienced Clinical Director specializing in mental health facility operations, HIPAA compliance, and modern EHR workflows."
};

const ROLES_DATA = [
    {
        id: "admin",
        name: "System Admin",
        description: "Full access to system settings, database management, staff credentials, and comprehensive clinical logs.",
        permissions: {
            phiRead: true,
            phiWrite: true,
            recordsDelete: true,
            staffManage: true,
            billingManage: true,
            auditView: true,
            systemConfigure: true
        }
    },
    {
        id: "clinician",
        name: "Lead Psychiatrist / Clinician",
        description: "Primary clinical access. Allowed to view/edit patient PHI, compose clinical notes, and assign patients to programs.",
        permissions: {
            phiRead: true,
            phiWrite: true,
            recordsDelete: false,
            staffManage: false,
            billingManage: false,
            auditView: true,
            systemConfigure: false
        }
    },
    {
        id: "nurse",
        name: "Clinical Nurse",
        description: "Support clinical access. Can check patient records, view compliance status, and log standard sessions.",
        permissions: {
            phiRead: true,
            phiWrite: true,
            recordsDelete: false,
            staffManage: false,
            billingManage: false,
            auditView: false,
            systemConfigure: false
        }
    },
    {
        id: "support",
        name: "IT & Support",
        description: "Non-clinical access. Can view audit logs and manage hardware/software configurations without PHI visibility.",
        permissions: {
            phiRead: false,
            phiWrite: false,
            recordsDelete: false,
            staffManage: true,
            billingManage: false,
            auditView: true,
            systemConfigure: true
        }
    }
];

const TABS = [
    { id: "My Profile", label: "My Profile", icon: "person", breadcrumb: "Profile" },
    { id: "Security", label: "Security", icon: "lock", breadcrumb: "Security" },
    { id: "Notifications", label: "Notifications", icon: "notifications", badge: 3, breadcrumb: "Notifications" },
    { id: "Appearance", label: "Appearance", icon: "palette", breadcrumb: "Appearance" },
    { id: "Roles & Permissions", label: "Roles & Permissions", icon: "rule", breadcrumb: "Roles & Permissions" }
] as const;

type TabId = typeof TABS[number]["id"];

/* ══════════════════════════════════════════════════════════════════════════
   Main Page Component
   ══════════════════════════════════════════════════════════════════════════ */

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabId>("My Profile");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const currentTabInfo = TABS.find(t => t.id === activeTab);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>

            {/* ── Toast notification banner ── */}
            {toastMessage && (
                <div style={{
                    position: "fixed",
                    top: 24,
                    right: 24,
                    background: "var(--color-inverse-surface)",
                    color: "var(--color-inverse-on-surface)",
                    padding: "12px 20px",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    animation: "fadeIn 0.2s ease-out"
                }}>
                    <span className="material-symbols-outlined" style={{ color: "#a0c9ff" }}>check_circle</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{toastMessage}</span>
                </div>
            )}

            {/* ── Breadcrumb ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/dashboard")}>Settings</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{currentTabInfo?.breadcrumb}</span>
            </div>

            {/* ── Title Area ── */}
            <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>Account Settings</h1>
                <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", marginTop: 4 }}>
                    Manage your clinical profile, security preferences, and system alerts.
                </p>
            </div>

            {/* ── Tabs Navigation ── */}
            <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--color-outline-variant)", overflowX: "auto" }}>
                {TABS.map((t) => {
                    const isActive = activeTab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "12px 20px",
                                fontSize: 14,
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? "var(--color-primary-container)" : "var(--color-on-surface-variant)",
                                background: "none",
                                border: "none",
                                borderBottom: isActive ? "2px solid var(--color-primary-container)" : "2px solid transparent",
                                marginBottom: -2,
                                cursor: "pointer",
                                transition: "all 0.12s",
                                whiteSpace: "nowrap"
                            }}
                        >
                            <span className={`material-symbols-outlined${isActive ? " icon-fill" : ""}`} style={{ fontSize: 18 }}>
                                {t.icon}
                            </span>
                            {t.label}
                            {"badge" in t && (
                                <span style={{
                                    marginLeft: 6,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    background: isActive ? "var(--color-primary-container)" : "var(--color-surface-container-highest)",
                                    color: isActive ? "#ffffff" : "var(--color-on-surface-variant)",
                                    fontSize: 11,
                                    fontWeight: 700
                                }}>
                                    {t.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Panels ── */}
            <div style={{ marginTop: 8 }}>
                {activeTab === "My Profile" && <MyProfileTab onSave={showToast} />}
                {activeTab === "Security" && <SecurityTab onSave={showToast} />}
                {activeTab === "Notifications" && <NotificationsTab onSave={showToast} />}
                {activeTab === "Appearance" && <AppearanceTab onSave={showToast} />}
                {activeTab === "Roles & Permissions" && <RolesPermissionsTab />}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Tab 1: My Profile
   ══════════════════════════════════════════════════════════════════════════ */

function MyProfileTab({ onSave }: { onSave: (msg: string) => void }) {
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        title: "",
        department: "",
        dob: "",
        sex: "Female",
        bio: ""
    });
    const [avatarChar, setAvatarChar] = useState<string>("??");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            const f = user.firstname || "";
            const l = user.lastname || "";
            setProfile({
                firstName: f,
                lastName: l,
                email: user.email || "",
                phone: user.extendedInfo?.phone || "",
                title: user.extendedInfo?.title || "",
                department: user.extendedInfo?.department || "",
                dob: user.dateofbirth ? user.dateofbirth.split("T")[0] : "",
                sex: user.sex || "Female",
                bio: user.extendedInfo?.bio || ""
            });
            const fChar = f.charAt(0).toUpperCase();
            const lChar = l.charAt(0).toUpperCase();
            setAvatarChar(fChar && lChar ? `${fChar}${lChar}` : "??");
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => {
            const next = { ...prev, [name]: value };
            if (name === "firstName" || name === "lastName") {
                const f = next.firstName.charAt(0).toUpperCase();
                const l = next.lastName.charAt(0).toUpperCase();
                setAvatarChar(`${f}${l}`);
            }
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/auth/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstname: profile.firstName,
                    lastname: profile.lastName,
                    email: profile.email,
                    sex: profile.sex,
                    dateofbirth: profile.dob,
                    phone: profile.phone,
                    title: profile.title,
                    department: profile.department,
                    bio: profile.bio
                })
            });
            if (res.ok) {
                await refreshUser();
                onSave("Profile details updated successfully.");
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("A network error occurred.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <Card title="Personal Information">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <FormGroup label="First Name" id="firstName">
                            <input
                                type="text"
                                name="firstName"
                                id="firstName"
                                value={profile.firstName}
                                onChange={handleChange}
                                style={inputStyle}
                                required
                            />
                        </FormGroup>

                        <FormGroup label="Last Name" id="lastName">
                            <input
                                type="text"
                                name="lastName"
                                id="lastName"
                                value={profile.lastName}
                                onChange={handleChange}
                                style={inputStyle}
                                required
                            />
                        </FormGroup>

                        <FormGroup label="Email Address" id="email">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={profile.email}
                                onChange={handleChange}
                                style={inputStyle}
                                required
                            />
                        </FormGroup>

                        <FormGroup label="Phone Number" id="phone">
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </FormGroup>

                        <FormGroup label="Date of Birth" id="dob">
                            <input
                                type="date"
                                name="dob"
                                id="dob"
                                value={profile.dob}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </FormGroup>

                        <FormGroup label="Gender / Sex" id="sex">
                            <select
                                name="sex"
                                id="sex"
                                value={profile.sex}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </FormGroup>
                    </div>
                </Card>

                <Card title="Organization Information">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <FormGroup label="Job Title" id="title">
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={profile.title}
                                onChange={handleChange}
                                style={inputStyle}
                                required
                            />
                        </FormGroup>

                        <FormGroup label="Department" id="department">
                            <input
                                type="text"
                                name="department"
                                id="department"
                                value={profile.department}
                                onChange={handleChange}
                                style={inputStyle}
                                required
                            />
                        </FormGroup>

                        <div style={{ gridColumn: "span 2" }}>
                            <FormGroup label="Professional Bio" id="bio">
                                <textarea
                                    name="bio"
                                    id="bio"
                                    rows={4}
                                    value={profile.bio}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                                />
                            </FormGroup>
                        </div>
                    </div>
                </Card>

                <div>
                    <button type="submit" disabled={saving} style={{ ...saveBtnStyle, opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* Profile Avatar Sidebar Card */}
            <Card title="Profile Photo">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
                    <div style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: "var(--color-primary-container)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontSize: 36,
                        fontWeight: 700,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                    }}>
                        {avatarChar}
                    </div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                            {profile.firstName} {profile.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)", marginTop: 2 }}>
                            {profile.title}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 8 }}>
                        <button type="button" onClick={() => onSave("Avatar uploading simulator initialized.")} style={avatarSecBtn}>Upload New</button>
                        <button type="button" onClick={() => { setAvatarChar("??"); onSave("Profile photo removed."); }} style={avatarRemBtn}>Remove</button>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.4 }}>
                        Allowed formats: JPG, PNG, GIF. Max file size: 2MB.
                    </p>
                </div>
            </Card>
        </form>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Tab 2: Security
   ══════════════════════════════════════════════════════════════════════════ */

function SecurityTab({ onSave }: { onSave: (msg: string) => void }) {
    const { user, refreshUser } = useAuth();
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [twoFactor, setTwoFactor] = useState(false);
    const [pinSet, setPinSet] = useState(false);
    const [showSetPinModal, setShowSetPinModal] = useState(false);

    useEffect(() => {
        if (user) {
            setTwoFactor(user.twoFactorEnabled || false);
            setPinSet(user.hasPin || false);
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            alert("New password and confirm password do not match.");
            return;
        }
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
        onSave("Security settings and credentials updated successfully.");
    };

    const handleTwoFactorChange = async (checked: boolean) => {
        if (user?.twoFactorEnabled && !checked) {
            alert("Disabling 2FA is not allowed once enabled.");
            return;
        }

        if (checked && !pinSet) {
            setShowSetPinModal(true);
            return;
        }

        try {
            const res = await fetch("/api/auth/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ twoFactorEnabled: checked })
            });

            if (res.ok) {
                setTwoFactor(checked);
                await refreshUser();
                onSave("Two-factor authentication enabled successfully.");
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.message || "Failed to update 2FA status.");
            }
        } catch (error) {
            console.error("Error updating 2FA:", error);
            alert("A network error occurred.");
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <Card title="Change Password">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <FormGroup label="Current Password" id="currentPass">
                                <input
                                    type="password"
                                    id="currentPass"
                                    value={currentPass}
                                    onChange={e => setCurrentPass(e.target.value)}
                                    style={inputStyle}
                                    placeholder="••••••••"
                                    required
                                />
                            </FormGroup>

                            <FormGroup label="New Password" id="newPass">
                                <input
                                    type="password"
                                    id="newPass"
                                    value={newPass}
                                    onChange={e => setNewPass(e.target.value)}
                                    style={inputStyle}
                                    placeholder="••••••••"
                                    required
                                />
                            </FormGroup>

                            <FormGroup label="Confirm New Password" id="confirmPass">
                                <input
                                    type="password"
                                    id="confirmPass"
                                    value={confirmPass}
                                    onChange={e => setConfirmPass(e.target.value)}
                                    style={inputStyle}
                                    placeholder="••••••••"
                                    required
                                />
                            </FormGroup>
                        </div>
                    </Card>

                    <div>
                        <button type="submit" style={saveBtnStyle}>Update Password</button>
                    </div>
                </div>

                {/* Right side widgets */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <Card title="Two-Factor Authentication">
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.5 }}>
                                Add an extra layer of security to your clinical portal account to protect Patient Health Information (PHI).
                            </p>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px 16px",
                                background: "var(--color-surface-container-low)",
                                border: "1px solid var(--color-outline-variant)",
                                borderRadius: 8,
                                marginTop: 4
                            }}>
                                <div>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", display: "block" }}>
                                        2FA Verification
                                    </span>
                                    <span style={{ fontSize: 11, color: "var(--color-outline)", display: "block", marginTop: 2 }}>
                                        Required at login
                                    </span>
                                </div>
                                <Switch checked={twoFactor} onChange={handleTwoFactorChange} disabled={user?.twoFactorEnabled} />
                            </div>
                        </div>
                    </Card>

                    <Card title="PIN for Sensitive Actions">
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.5 }}>
                                Your 6-digit PIN is required for sensitive actions like updating patient information, discharging patients, and signing notes.
                            </p>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px 16px",
                                background: "var(--color-surface-container-low)",
                                border: "1px solid var(--color-outline-variant)",
                                borderRadius: 8,
                                marginTop: 4
                            }}>
                                <div>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", display: "block" }}>
                                        PIN Status
                                    </span>
                                    <span style={{ fontSize: 11, color: pinSet ? "#137333" : "var(--color-outline)", display: "block", marginTop: 2 }}>
                                        {pinSet ? "PIN set" : "Not set"}
                                    </span>
                                </div>
                                {twoFactor && (
                                    <button
                                        onClick={() => setShowSetPinModal(true)}
                                        style={{
                                            padding: "8px 16px",
                                            borderRadius: 6,
                                            border: "1px solid var(--color-primary-container)",
                                            background: "transparent",
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "var(--color-primary-container)",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {pinSet ? "Change PIN" : "Set PIN"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card title="Active Sessions">
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ display: "flex", gap: 10 }}>
                                <span className="material-symbols-outlined" style={{ color: "var(--color-primary-container)" }}>desktop_windows</span>
                                <div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", display: "block" }}>
                                        Chrome on Windows
                                    </span>
                                    <span style={{ fontSize: 11, color: "#137333", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600, marginTop: 2 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#137333" }} />
                                        Active Now
                                    </span>
                                </div>
                            </div>
                            <hr style={{ border: "none", borderBottom: "1px solid var(--color-outline-variant)", margin: 0 }} />
                            <div style={{ display: "flex", gap: 10 }}>
                                <span className="material-symbols-outlined" style={{ color: "var(--color-outline)" }}>phone_iphone</span>
                                <div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", display: "block" }}>
                                        Safari on iPhone 15
                                    </span>
                                    <span style={{ fontSize: 11, color: "var(--color-on-surface-variant)", display: "block", marginTop: 2 }}>
                                        Lagos, Nigeria • 2 days ago
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>

            {showSetPinModal && (
                <SetPinModal 
                    onClose={() => {
                        setShowSetPinModal(false);
                        setPinSet(true);
                        refreshUser();
                        onSave("PIN set successfully.");
                    }} 
                />
            )}
        </>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Tab 3: Notifications
   ══════════════════════════════════════════════════════════════════════════ */

function NotificationsTab({ onSave }: { onSave: (msg: string) => void }) {
    const [clinicalMail, setClinicalMail] = useState(true);
    const [enrollMail, setEnrollMail] = useState(true);
    const [systemMail, setSystemMail] = useState(false);
    const [criticalSms, setCriticalSms] = useState(true);
    const [otpSms, setOtpSms] = useState(true);
    const [taskPush, setTaskPush] = useState(true);
    const [msgPush, setMsgPush] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave("Notification preferences saved successfully.");
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 800 }}>
            <Card title="Notification Preferences">
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Email Alerts Group */}
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary-container)", margin: "0 0 12px" }}>
                            Email Notifications
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <ToggleRow
                                title="Clinical Reports & Updates"
                                desc="Receive summary reports of active program enrollments and session status logs."
                                checked={clinicalMail}
                                onChange={setClinicalMail}
                            />
                            <ToggleRow
                                title="Patient Enrollment Status"
                                desc="Alerts when new patients are admitted, discharged, or pause their treatments."
                                checked={enrollMail}
                                onChange={setEnrollMail}
                            />
                            <ToggleRow
                                title="System Maintenance Windows"
                                desc="Notifications of scheduled server maintenance and administrative downtime."
                                checked={systemMail}
                                onChange={setSystemMail}
                            />
                        </div>
                    </div>

                    <hr style={{ border: "none", borderBottom: "1px solid var(--color-outline-variant)", margin: 0 }} />

                    {/* SMS Alerts Group */}
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary-container)", margin: "0 0 12px" }}>
                            SMS Alerts
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <ToggleRow
                                title="Critical Lab & Vitals Alerts"
                                desc="Urgent SMS messages for safety-critical indicators reported by patients."
                                checked={criticalSms}
                                onChange={setCriticalSms}
                            />
                            <ToggleRow
                                title="Authentication & OTPs"
                                desc="Required security verification SMS codes for secondary authorization checks."
                                checked={otpSms}
                                onChange={setOtpSms}
                                disabled={true} // OTP SMS is mandatory
                            />
                        </div>
                    </div>

                    <hr style={{ border: "none", borderBottom: "1px solid var(--color-outline-variant)", margin: 0 }} />

                    {/* Push Alerts Group */}
                    <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary-container)", margin: "0 0 12px" }}>
                            In-App Push Alerts
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <ToggleRow
                                title="Task & Query Assignments"
                                desc="Real-time alerts when clinical queries or checklists are assigned to you."
                                checked={taskPush}
                                onChange={setTaskPush}
                            />
                            <ToggleRow
                                title="Secure Patient Messages"
                                desc="Popups indicating a new secure message from a patient via their portal."
                                checked={msgPush}
                                onChange={setMsgPush}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            <div>
                <button type="submit" style={saveBtnStyle}>Save Preferences</button>
            </div>
        </form>
    );
}

interface ToggleRowProps {
    title: string;
    desc: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

function ToggleRow({ title, desc, checked, onChange, disabled }: ToggleRowProps) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", display: "block" }}>
                    {title}
                </span>
                <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)", display: "block", marginTop: 2, lineHeight: 1.4 }}>
                    {desc}
                </span>
            </div>
            <Switch checked={checked} onChange={onChange} disabled={disabled} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Tab 4: Appearance
   ══════════════════════════════════════════════════════════════════════════ */

function AppearanceTab({ onSave }: { onSave: (msg: string) => void }) {
    const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
    const [denseMode, setDenseMode] = useState(false);
    const [sidebarAlign, setSidebarAlign] = useState<"left" | "right">("left");
    const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave("Appearance and visual theme saved successfully.");
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 800 }}>
            <Card title="Interface Theme">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0 }}>
                        Select your preferred visual style for the dashboard.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 8 }}>
                        {/* Light Card */}
                        <div
                            onClick={() => setTheme("light")}
                            style={{
                                cursor: "pointer",
                                border: `2px solid ${theme === "light" ? "var(--color-primary-container)" : "var(--color-outline-variant)"}`,
                                borderRadius: 10,
                                padding: 16,
                                background: "#ffffff",
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                                transition: "all 0.15s"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#111c2c" }}>Light Theme</span>
                                {theme === "light" && <span className="material-symbols-outlined icon-fill" style={{ fontSize: 20, color: "var(--color-primary-container)" }}>check_circle</span>}
                            </div>
                            <div style={{ height: 48, background: "#f0f3ff", borderRadius: 6, border: "1px solid #c2c7d1", display: "flex", overflow: "hidden" }}>
                                <div style={{ width: 14, background: "#0c1d36" }} />
                                <div style={{ flex: 1, padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                                    <div style={{ height: 6, width: "60%", background: "#0c1d36", borderRadius: 2 }} />
                                    <div style={{ height: 4, width: "90%", background: "#c2c7d1", borderRadius: 1 }} />
                                </div>
                            </div>
                        </div>

                        {/* Dark Card */}
                        <div
                            onClick={() => setTheme("dark")}
                            style={{
                                cursor: "pointer",
                                border: `2px solid ${theme === "dark" ? "var(--color-primary-container)" : "var(--color-outline-variant)"}`,
                                borderRadius: 10,
                                padding: 16,
                                background: "#111c2c",
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                                transition: "all 0.15s"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>Dark Theme</span>
                                {theme === "dark" && <span className="material-symbols-outlined icon-fill" style={{ fontSize: 20, color: "var(--color-primary-container)" }}>check_circle</span>}
                            </div>
                            <div style={{ height: 48, background: "#1b2533", borderRadius: 6, border: "1px solid #32445e", display: "flex", overflow: "hidden" }}>
                                <div style={{ width: 14, background: "#09121d" }} />
                                <div style={{ flex: 1, padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                                    <div style={{ height: 6, width: "60%", background: "#ffffff", borderRadius: 2 }} />
                                    <div style={{ height: 4, width: "90%", background: "#4a5d78", borderRadius: 1 }} />
                                </div>
                            </div>
                        </div>

                        {/* System Card */}
                        <div
                            onClick={() => setTheme("system")}
                            style={{
                                cursor: "pointer",
                                border: `2px solid ${theme === "system" ? "var(--color-primary-container)" : "var(--color-outline-variant)"}`,
                                borderRadius: 10,
                                padding: 16,
                                background: "linear-gradient(135deg, #ffffff 50%, #111c2c 50%)",
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                                transition: "all 0.15s"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: theme === "system" ? "var(--color-primary-container)" : "var(--color-on-surface)", textShadow: "0 0 2px rgba(255,255,255,0.8)" }}>System Default</span>
                                {theme === "system" && <span className="material-symbols-outlined icon-fill" style={{ fontSize: 20, color: "var(--color-primary-container)" }}>check_circle</span>}
                            </div>
                            <div style={{ height: 48, background: "#f0f3ff", borderRadius: 6, border: "1px solid #c2c7d1", display: "flex", overflow: "hidden" }}>
                                <div style={{ width: 14, background: "#0c1d36" }} />
                                <div style={{ flex: 1, padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                                    <div style={{ height: 6, width: "50%", background: "#0c1d36", borderRadius: 2 }} />
                                    <div style={{ height: 4, width: "80%", background: "#c2c7d1", borderRadius: 1 }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Display Options">
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Dense Mode */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", display: "block" }}>
                                Dense Layout Density
                            </span>
                            <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)", display: "block", marginTop: 2 }}>
                                Reduces white space and padding for compact display of information tables.
                            </span>
                        </div>
                        <Switch checked={denseMode} onChange={setDenseMode} />
                    </div>

                    <hr style={{ border: "none", borderBottom: "1px solid var(--color-outline-variant)", margin: 0 }} />

                    {/* Sidebar Placement */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", display: "block" }}>
                                Sidebar Alignment
                            </span>
                            <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)", display: "block", marginTop: 2 }}>
                                Choose to place the main navigation sidebar on the left or right side.
                            </span>
                        </div>
                        <div style={{ display: "flex", border: "1px solid var(--color-outline-variant)", borderRadius: 8, padding: 3, background: "var(--color-surface-container-low)" }}>
                            <button
                                type="button"
                                onClick={() => setSidebarAlign("left")}
                                style={{
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    background: sidebarAlign === "left" ? "#ffffff" : "transparent",
                                    color: sidebarAlign === "left" ? "var(--color-primary-container)" : "var(--color-on-surface-variant)",
                                    boxShadow: sidebarAlign === "left" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                                }}
                            >
                                Left
                            </button>
                            <button
                                type="button"
                                onClick={() => setSidebarAlign("right")}
                                style={{
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    background: sidebarAlign === "right" ? "#ffffff" : "transparent",
                                    color: sidebarAlign === "right" ? "var(--color-primary-container)" : "var(--color-on-surface-variant)",
                                    boxShadow: sidebarAlign === "right" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                                }}
                            >
                                Right
                            </button>
                        </div>
                    </div>

                    <hr style={{ border: "none", borderBottom: "1px solid var(--color-outline-variant)", margin: 0 }} />

                    {/* Font Scaling */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", display: "block" }}>
                                Text Scaling (Font Size)
                            </span>
                            <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)", display: "block", marginTop: 2 }}>
                                Adjust readability text scaling across the clinical system dashboard.
                            </span>
                        </div>
                        <div style={{ display: "flex", border: "1px solid var(--color-outline-variant)", borderRadius: 8, padding: 3, background: "var(--color-surface-container-low)" }}>
                            {(["sm", "md", "lg"] as const).map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setFontSize(size)}
                                    style={{
                                        border: "none",
                                        padding: "6px 14px",
                                        borderRadius: 6,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        background: fontSize === size ? "#ffffff" : "transparent",
                                        color: fontSize === size ? "var(--color-primary-container)" : "var(--color-on-surface-variant)",
                                        boxShadow: fontSize === size ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                                        textTransform: "uppercase"
                                    }}
                                >
                                    {size === "sm" ? "Small" : size === "md" ? "Medium" : "Large"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            <div>
                <button type="submit" style={saveBtnStyle}>Save Appearance</button>
            </div>
        </form>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Tab 5: Roles & Permissions
   ══════════════════════════════════════════════════════════════════════════ */

// Define resources and permissions
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

function RolesPermissionsTab() {
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [permissions, setPermissions] = useState<Record<string, number[]>>({});

    // Mock staff list
    const staffList = [
        { id: "EMP-4821", name: "Dr. Eleanor Vance", position: "Lead Psychiatrist" },
        { id: "EMP-3196", name: "Marcus Thorne", position: "Clinical Nurse" },
        { id: "EMP-1862", name: "Sarah Jenkins", position: "Systems Admin" }
    ];

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

    return (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
            {/* Staff selector sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-outline)", paddingLeft: 8 }}>
                    Staff Members
                </div>
                {staffList.map((staff) => {
                    const isSelected = selectedStaff?.id === staff.id;
                    return (
                        <div
                            key={staff.id}
                            onClick={() => {
                                setSelectedStaff(staff);
                                // Reset permissions when selecting a new staff
                                setPermissions({});
                            }}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                padding: "14px 16px",
                                borderRadius: 10,
                                background: isSelected ? "var(--color-surface-container)" : "var(--color-surface-container-lowest)",
                                border: `1px solid ${isSelected ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                                cursor: "pointer",
                                transition: "all 0.15s"
                            }}
                            onMouseOver={(e) => {
                                if (!isSelected) e.currentTarget.style.borderColor = "var(--color-outline)";
                            }}
                            onMouseOut={(e) => {
                                if (!isSelected) e.currentTarget.style.borderColor = "var(--color-outline-variant)";
                            }}
                        >
                            <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 500, color: "var(--color-on-surface)" }}>
                                {staff.name}
                            </span>
                            <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                                {staff.position}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Permission matrix panel */}
            <Card title={selectedStaff ? `${selectedStaff.name} - Permission Matrix` : "Select a Staff Member to Configure Permissions"}>
                {selectedStaff ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div>
                            <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.5 }}>
                                Configure access permissions for {selectedStaff.name}. Check the boxes to grant permissions for each resource.
                            </p>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
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

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid var(--color-outline-variant)" }}>
                            <button
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: 8,
                                    border: "1px solid var(--color-outline-variant)",
                                    background: "transparent",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "var(--color-on-surface)",
                                    cursor: "pointer",
                                    transition: "background 0.12s"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = "var(--color-surface-container)"}
                                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                Cancel
                            </button>
                            <button
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
                                    transition: "background 0.15s"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = "var(--color-primary)"}
                                onMouseOut={(e) => e.currentTarget.style.background = "var(--color-primary-container)"}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
                                Save Permissions
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ 
                        padding: "60px 20px", 
                        textAlign: "center", 
                        color: "var(--color-on-surface-variant)" 
                    }}>
                        <span className="material-symbols-outlined" style={{ 
                            fontSize: 48, 
                            color: "var(--color-outline)", 
                            marginBottom: 16,
                            display: "block"
                        }}>
                            admin_panel_settings
                        </span>
                        <p style={{ fontSize: 14, margin: 0 }}>
                            Select a staff member from the sidebar to configure their permissions.
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}

function PermissionIndicator({ label, active }: { label: string; active: boolean }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
                className="material-symbols-outlined icon-fill"
                style={{
                    fontSize: 20,
                    color: active ? "#137333" : "var(--color-error)",
                    background: active ? "#e6f4ea" : "#fce8e8",
                    borderRadius: "50%",
                    padding: 2
                }}
            >
                {active ? "check" : "close"}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: active ? "var(--color-on-surface)" : "var(--color-on-surface-variant)" }}>
                {label}
            </span>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Reusable UI Controls & Styles
   ══════════════════════════════════════════════════════════════════════════ */

function Card({ title, children, noPadding }: { title: string; children: React.ReactNode; noPadding?: boolean }) {
    return (
        <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{title}</h3>
            </div>
            <div style={{ padding: noPadding ? 0 : 20 }}>{children}</div>
        </div>
    );
}

function FormGroup({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor={id} style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)" }}>
                {label}
            </label>
            {children}
        </div>
    );
}

function Switch({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!checked)}
            style={{
                width: 38,
                height: 22,
                borderRadius: 11,
                border: "none",
                background: checked ? "var(--color-primary-container)" : "var(--color-outline-variant)",
                position: "relative",
                cursor: disabled ? "not-allowed" : "pointer",
                padding: 0,
                opacity: disabled ? 0.6 : 1,
                transition: "background 0.2s"
            }}
        >
            <div style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#ffffff",
                position: "absolute",
                top: 3,
                left: checked ? 19 : 3,
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
            }} />
        </button>
    );
}

/* ── Inline Styles ── */

const inputStyle: React.CSSProperties = {
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid var(--color-outline-variant)",
    background: "#ffffff",
    fontSize: 14,
    color: "var(--color-on-surface)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
};

const saveBtnStyle: React.CSSProperties = {
    padding: "10px 20px",
    background: "var(--color-primary-container)",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const avatarSecBtn: React.CSSProperties = {
    flex: 1,
    padding: "8px 12px",
    background: "transparent",
    border: "1px solid var(--color-outline-variant)",
    color: "var(--color-on-surface)",
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 6,
    cursor: "pointer"
};

const avatarRemBtn: React.CSSProperties = {
    flex: 1,
    padding: "8px 12px",
    background: "transparent",
    border: "1px solid var(--color-error)",
    color: "var(--color-error)",
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 6,
    cursor: "pointer"
};
