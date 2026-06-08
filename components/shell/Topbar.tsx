"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* ── Derive page title from pathname ───────────────────────────────────── */
const ROUTE_TITLES: Record<string, string> = {
    "/dashboard":      "Dashboard",
    "/patients":       "Patients",
    "/appointments":   "Appointments",
    "/clinical-notes": "Clinical Notes",
    "/scheduling":     "Scheduling",
    "/programs":       "Programs",
    "/billing":        "Billing",
    "/compliance":     "Compliance",
    "/audit-log":      "Audit Log",
    "/settings":       "Settings",
};

function getPageTitle(pathname: string): string {
    for (const [route, title] of Object.entries(ROUTE_TITLES)) {
        if (pathname === route || pathname.startsWith(route + "/")) return title;
    }
    return "BrightLife EHR";
}

/* ── User info from userInfo cookie (set at login) ─────────────────────── */
interface UserInfo {
    name: string;
    role: string;
    initials: string;
}

function getUserInfo(): UserInfo {
    if (typeof document === "undefined") {
        return { name: "Staff User", role: "Clinician", initials: "SU" };
    }
    try {
        const raw = document.cookie
            .split("; ")
            .find((c) => c.startsWith("userInfo="))
            ?.split("=")[1];
        if (raw) {
            const parsed = JSON.parse(decodeURIComponent(raw));
            const nameParts = (parsed.name ?? "Staff User").trim().split(" ");
            const initials =
                nameParts.length >= 2
                    ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
                    : nameParts[0]?.slice(0, 2) ?? "SU";
            return {
                name: parsed.name ?? "Staff User",
                role: parsed.role ?? "Clinician",
                initials: initials.toUpperCase(),
            };
        }
    } catch {}
    return { name: "Staff User", role: "Clinician", initials: "SU" };
}

/* ══════════════════════════════════════════════════════════════════════════
   Topbar component
══════════════════════════════════════════════════════════════════════════ */
export default function Topbar({
                                   onMobileMenuOpen,
                               }: {
    onMobileMenuOpen: () => void;
}) {
    const pathname = usePathname();
    const pageTitle = getPageTitle(pathname);

    const [user, setUser] = useState<UserInfo>({ name: "Staff User", role: "Clinician", initials: "SU" });
    const [notifications] = useState(3); // placeholder count
    const [searchValue, setSearchValue] = useState("");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    /* Read user cookie client-side */
    useEffect(() => { setUser(getUserInfo()); }, []);

    /* Close dropdowns on outside click */
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* Placeholder notifications */
    const NOTIFS = [
        { id: 1, icon: "event",         title: "Appointment in 30 min",   sub: "John Adeyemi · 10:00 AM",    time: "28m" },
        { id: 2, icon: "description",   title: "Clinical note pending",    sub: "PAT-0142 · Review required",  time: "1h" },
        { id: 3, icon: "verified_user", title: "Compliance form due",      sub: "Submit by end of day",        time: "3h" },
    ];

    return (
        <header
            style={{
                height: 64,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 24px",
                background: "#ffffff",
                borderBottom: "1px solid var(--color-outline-variant)",
                position: "sticky",
                top: 0,
                zIndex: 30,
                flexShrink: 0,
            }}
        >
            {/* ── Mobile hamburger ──────────────────────────────────────────────── */}
            <button
                className="lg:hidden"
                onClick={onMobileMenuOpen}
                aria-label="Open navigation"
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--color-on-surface-variant)",
                    flexShrink: 0,
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>menu</span>
            </button>

            {/* ── Page title ────────────────────────────────────────────────────── */}
            <h1
                style={{
                    fontSize: 18,
                    fontWeight: 600,
                    lineHeight: "24px",
                    color: "var(--color-on-surface)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                }}
            >
                {pageTitle}
            </h1>

            {/* ── Search ────────────────────────────────────────────────────────── */}
            <div
                style={{
                    flex: 1,
                    maxWidth: 420,
                    marginLeft: "auto",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                }}
            >
        <span
            className="material-symbols-outlined"
            style={{
                position: "absolute",
                left: 10,
                fontSize: 18,
                color: "var(--color-outline)",
                pointerEvents: "none",
            }}
            aria-hidden="true"
        >
          search
        </span>
                <input
                    type="search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search patients, notes, appointments…"
                    style={{
                        width: "100%",
                        fontSize: 14,
                        lineHeight: "20px",
                        padding: "7px 12px 7px 34px",
                        borderRadius: 20,
                        border: "1px solid var(--color-outline-variant)",
                        background: "var(--color-surface-container-low)",
                        color: "var(--color-on-surface)",
                        outline: "none",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = "var(--color-primary-container)";
                        e.target.style.boxShadow = "0 0 0 2px rgba(15,76,129,0.12)";
                        e.target.style.background = "#ffffff";
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = "var(--color-outline-variant)";
                        e.target.style.boxShadow = "none";
                        e.target.style.background = "var(--color-surface-container-low)";
                    }}
                />
            </div>

            {/* ── Right controls ────────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8, flexShrink: 0 }}>

                {/* Notifications */}
                <div ref={notifRef} style={{ position: "relative" }}>
                    <button
                        onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }}
                        aria-label={`${notifications} notifications`}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            border: "none",
                            background: notifOpen ? "var(--color-surface-container)" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            position: "relative",
                            color: "var(--color-on-surface-variant)",
                            transition: "background 0.12s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                        onMouseOut={(e) => { if (!notifOpen) e.currentTarget.style.background = "transparent"; }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
                        {notifications > 0 && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: 6,
                                    right: 6,
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "var(--color-error)",
                                    border: "2px solid #ffffff",
                                }}
                            />
                        )}
                    </button>

                    {/* Notifications dropdown */}
                    {notifOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: "calc(100% + 8px)",
                                right: 0,
                                width: 320,
                                background: "#ffffff",
                                borderRadius: 12,
                                border: "1px solid var(--color-outline-variant)",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                zIndex: 60,
                                overflow: "hidden",
                            }}
                        >
                            <div style={{ padding: "12px 16px 8px", borderBottom: "1px solid var(--color-outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>Notifications</p>
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: "var(--color-primary-container)",
                                        padding: "2px 8px",
                                        borderRadius: 10,
                                        background: "var(--color-surface-container-high)",
                                    }}
                                >
                  {notifications} new
                </span>
                            </div>
                            {NOTIFS.map((n) => (
                                <div
                                    key={n.id}
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        padding: "12px 16px",
                                        borderBottom: "1px solid var(--color-surface-container)",
                                        cursor: "pointer",
                                        transition: "background 0.12s",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 8,
                                            background: "var(--color-surface-container)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary-container)" }}>
                      {n.icon}
                    </span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 2 }}>{n.title}</p>
                                        <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{n.sub}</p>
                                    </div>
                                    <p style={{ fontSize: 11, color: "var(--color-outline)", flexShrink: 0 }}>{n.time}</p>
                                </div>
                            ))}
                            <div style={{ padding: "8px 16px" }}>
                                <button style={{ width: "100%", padding: "8px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--color-primary-container)", borderRadius: 6 }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                                        onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                                >
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User avatar + menu */}
                <div ref={userMenuRef} style={{ position: "relative" }}>
                    <button
                        onClick={() => { setUserMenuOpen((v) => !v); setNotifOpen(false); }}
                        aria-label="User menu"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "4px 8px 4px 4px",
                            borderRadius: 20,
                            border: "none",
                            background: userMenuOpen ? "var(--color-surface-container)" : "transparent",
                            cursor: "pointer",
                            transition: "background 0.12s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                        onMouseOut={(e) => { if (!userMenuOpen) e.currentTarget.style.background = "transparent"; }}
                    >
                        {/* Avatar circle */}
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "var(--color-primary-container)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
              <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", letterSpacing: "0.02em" }}>
                {user.initials}
              </span>
                        </div>
                        {/* Name + role — hidden on small screens */}
                        <div className="hidden sm:block" style={{ textAlign: "left" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", lineHeight: "16px", whiteSpace: "nowrap" }}>
                                {user.name}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)", lineHeight: "14px", whiteSpace: "nowrap" }}>
                                {user.role}
                            </p>
                        </div>
                        <span className="material-symbols-outlined hidden sm:block" style={{ fontSize: 16, color: "var(--color-outline)" }}>
              expand_more
            </span>
                    </button>

                    {/* User dropdown */}
                    {userMenuOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: "calc(100% + 8px)",
                                right: 0,
                                width: 200,
                                background: "#ffffff",
                                borderRadius: 12,
                                border: "1px solid var(--color-outline-variant)",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                zIndex: 60,
                                overflow: "hidden",
                            }}
                        >
                            {/* Profile header */}
                            <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid var(--color-surface-container)" }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>{user.name}</p>
                                <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)", marginTop: 2 }}>{user.role}</p>
                            </div>

                            {[
                                { icon: "account_circle", label: "My Profile" },
                                { icon: "settings",       label: "Settings" },
                            ].map(({ icon, label }) => (
                                <button
                                    key={label}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        width: "100%",
                                        padding: "10px 16px",
                                        border: "none",
                                        background: "none",
                                        cursor: "pointer",
                                        fontSize: 13,
                                        color: "var(--color-on-surface)",
                                        transition: "background 0.12s",
                                        textAlign: "left",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-outline)" }}>{icon}</span>
                                    {label}
                                </button>
                            ))}

                            <div style={{ borderTop: "1px solid var(--color-surface-container)", marginTop: 2 }}>
                                <button
                                    onClick={async () => {
                                        await fetch("/api/auth/logout", { method: "POST" });
                                        window.location.href = "/login";
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        width: "100%",
                                        padding: "10px 16px",
                                        border: "none",
                                        background: "none",
                                        cursor: "pointer",
                                        fontSize: 13,
                                        color: "var(--color-error)",
                                        transition: "background 0.12s",
                                        textAlign: "left",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-error-container)")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
