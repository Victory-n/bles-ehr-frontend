"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface NavItem {
    label: string;
    href: string;
    icon: string;
}
interface NavGroup {
    heading?: string;
    items: NavItem[];
}

/* ── Navigation definition ──────────────────────────────────────────────── */
const NAV: NavGroup[] = [
    {
        items: [
            { label: "Dashboard",      href: "/dashboard",       icon: "grid_view" },
            { label: "Patients",       href: "/patients",        icon: "people" },
            { label: "Appointments",   href: "/appointments",    icon: "event" },
            { label: "Clinical Notes", href: "/clinical-notes",  icon: "description" },
        ],
    },
    {
        heading: "Clinical",
        items: [
            { label: "Scheduling",     href: "/scheduling",      icon: "calendar_month" },
            { label: "Programs",       href: "/programs",        icon: "psychology" },
        ],
    },
    {
        heading: "Administration",
        items: [
            { label: "Billing",        href: "/billing",         icon: "receipt_long" },
            { label: "Compliance",     href: "/compliance",      icon: "verified_user" },
            { label: "Audit Log",      href: "/audit-log",       icon: "manage_search" },
        ],
    },
    {
        heading: "System",
        items: [
            { label: "Settings",       href: "/settings",        icon: "settings" },
        ],
    },
];

/* ── BrightLife inline SVG logo ─────────────────────────────────────────── */
function Logo({ size = 32 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 160 160" fill="none" aria-hidden="true">
            <circle cx="80" cy="80" r="72" stroke="#8ebdf9" strokeWidth="6" fill="rgba(255,255,255,0.08)" />
            <rect x="63" y="44" width="14" height="72" rx="4" fill="#ffffff" />
            <rect x="44" y="63" width="72" height="14" rx="4" fill="#ffffff" />
            <circle cx="80" cy="80" r="7" fill="#8df2fc" />
        </svg>
    );
}

/* ── Constants ──────────────────────────────────────────────────────────── */
const SIDEBAR_EXPANDED_W = 240;
const SIDEBAR_COLLAPSED_W = 64;
const STORAGE_KEY = "bles-sidebar-collapsed";

/* ══════════════════════════════════════════════════════════════════════════
   Sidebar component
══════════════════════════════════════════════════════════════════════════ */
export default function Sidebar({
                                    mobileOpen,
                                    onMobileClose,
                                }: {
    mobileOpen: boolean;
    onMobileClose: () => void;
}) {
    const pathname = usePathname();

    const [collapsed, setCollapsed] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem(STORAGE_KEY) === "true";
    });

    /* Persist collapse preference */
    const toggleCollapsed = useCallback(() => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    }, []);

    /* Close mobile drawer on route change */
    useEffect(() => { onMobileClose(); }, [pathname, onMobileClose]);

    /* Lock body scroll when mobile drawer is open */
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const sidebarW = collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W;

    /* ── Shared sidebar inner ─────────────────────────────────────────────── */
    function SidebarInner({ mobile = false }: { mobile?: boolean }) {
        const effectiveCollapsed = mobile ? false : collapsed;
        const innerW = mobile ? SIDEBAR_EXPANDED_W : sidebarW;

        return (
            <div
                style={{
                    width: innerW,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--color-primary-container)",
                    transition: mobile ? undefined : "width 0.22s cubic-bezier(0.4,0,0.2,1)",
                    overflow: "hidden",
                }}
            >
                {/* ── Logo / brand strip ─────────────────────────────────────────── */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "0 16px",
                        height: 64,
                        flexShrink: 0,
                        borderBottom: "1px solid rgba(255,255,255,0.10)",
                    }}
                >
                    <div style={{ flexShrink: 0 }}>
                        <Logo size={32} />
                    </div>

                    {!effectiveCollapsed && (
                        <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                            <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: "18px", letterSpacing: "-0.01em" }}>
                                BrightLife
                            </p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.60)", lineHeight: "14px", marginTop: 1 }}>
                                EHR Platform
                            </p>
                        </div>
                    )}

                    {/* Desktop collapse toggle — only on non-mobile sidebar */}
                    {!mobile && (
                        <button
                            onClick={toggleCollapsed}
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            style={{
                                marginLeft: "auto",
                                flexShrink: 0,
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                border: "none",
                                background: "rgba(255,255,255,0.10)",
                                color: "rgba(255,255,255,0.75)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "background 0.15s",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                        >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {collapsed ? "chevron_right" : "chevron_left"}
              </span>
                        </button>
                    )}
                </div>

                {/* ── Nav groups ────────────────────────────────────────────────── */}
                <nav
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        padding: "8px 0",
                        scrollbarWidth: "none",
                    }}
                >
                    {NAV.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: 4 }}>
                            {/* Group heading */}
                            {group.heading && !effectiveCollapsed && (
                                <p
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                        color: "rgba(255,255,255,0.45)",
                                        padding: "10px 16px 4px",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {group.heading}
                                </p>
                            )}
                            {group.heading && effectiveCollapsed && (
                                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px 12px" }} />
                            )}

                            {/* Nav items */}
                            {group.items.map((item) => {
                                const isActive =
                                    item.href === "/dashboard"
                                        ? pathname === "/dashboard"
                                        : pathname.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        title={effectiveCollapsed ? item.label : undefined}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            margin: "2px 8px",
                                            padding: effectiveCollapsed ? "9px 0" : "9px 10px",
                                            justifyContent: effectiveCollapsed ? "center" : "flex-start",
                                            borderRadius: 8,
                                            textDecoration: "none",
                                            transition: "background 0.12s",
                                            background: isActive
                                                ? "rgba(255,255,255,0.15)"
                                                : "transparent",
                                            position: "relative",
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isActive)
                                                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isActive) e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <span
                                                style={{
                                                    position: "absolute",
                                                    left: -8,
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    width: 3,
                                                    height: 20,
                                                    borderRadius: "0 3px 3px 0",
                                                    background: "#8df2fc",
                                                }}
                                            />
                                        )}

                                        <span
                                            className={`material-symbols-outlined${isActive ? " icon-fill" : ""}`}
                                            style={{
                                                fontSize: 20,
                                                flexShrink: 0,
                                                color: isActive ? "#ffffff" : "rgba(255,255,255,0.65)",
                                            }}
                                        >
                      {item.icon}
                    </span>

                                        {!effectiveCollapsed && (
                                            <span
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: isActive ? 600 : 400,
                                                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.75)",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                        {item.label}
                      </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* ── Bottom: logout ────────────────────────────────────────────── */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", padding: "8px 0" }}>
                    <button
                        onClick={async () => {
                            await fetch("/api/auth/logout", { method: "POST" });
                            window.location.href = "/login";
                        }}
                        title={effectiveCollapsed ? "Sign out" : undefined}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "calc(100% - 16px)",
                            margin: "0 8px",
                            padding: effectiveCollapsed ? "9px 0" : "9px 10px",
                            justifyContent: effectiveCollapsed ? "center" : "flex-start",
                            background: "transparent",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            transition: "background 0.12s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                    >
            <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, flexShrink: 0, color: "rgba(255,255,255,0.65)" }}
            >
              logout
            </span>
                        {!effectiveCollapsed && (
                            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>
                Sign Out
              </span>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ── Desktop sidebar (always mounted, width transitions) ─────────── */}
            <aside
                className="hidden lg:block"
                style={{
                    width: sidebarW,
                    flexShrink: 0,
                    height: "100vh",
                    position: "sticky",
                    top: 0,
                    transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
                    zIndex: 40,
                }}
            >
                <SidebarInner />
            </aside>

            {/* ── Mobile: backdrop ────────────────────────────────────────────── */}
            {mobileOpen && (
                <div
                    className="lg:hidden"
                    onClick={onMobileClose}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 49,
                        background: "rgba(0,0,0,0.45)",
                        backdropFilter: "blur(2px)",
                    }}
                    aria-hidden="true"
                />
            )}

            {/* ── Mobile: slide-in drawer ──────────────────────────────────────── */}
            <aside
                className="lg:hidden"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100%",
                    zIndex: 50,
                    transform: mobileOpen ? "translateX(0)" : `translateX(-${SIDEBAR_EXPANDED_W}px)`,
                    transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
                }}
            >
                <SidebarInner mobile />
            </aside>
        </>
    );
}
