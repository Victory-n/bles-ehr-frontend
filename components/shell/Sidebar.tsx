"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── Navigation items matching the reference design ─────────────────── */
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "grid_view" },
  { label: "Patients", href: "/patients", icon: "person" },
  { label: "Staff", href: "/staff", icon: "group" },
  { label: "Folders", href: "/clinic-notes", icon: "folder_open" },
  { label: "Programs", href: "/programs", icon: "layers" },
  { label: "Billing", href: "/billing", icon: "payments" },
  { label: "Compliance", href: "/compliance", icon: "verified_user" },
  { label: "Audit Log", href: "/audit-log", icon: "history" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

/* ══════════════════════════════════════════════════════════════════════════
   Sidebar
   – Dark navy background with white text
   – Active item gets a lighter blue highlight pill
   – "End Session" button at the bottom
══════════════════════════════════════════════════════════════════════════ */
export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Mobile backdrop ────────────────────────────────────────────── */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 49,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(2px)",
          }}
          className="lg:hidden"
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────────────────── */}
      <aside
        style={{
          width: 240,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#0c1d36",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
        className="hidden lg:flex"
      >
        <SidebarInner pathname={pathname} />
      </aside>

      {/* ── Mobile drawer ──────────────────────────────────────────────── */}
      <aside
        className="lg:hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          zIndex: 50,
          transform: isOpen ? "translateX(0)" : "translateX(-260px)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <SidebarInner pathname={pathname} />
      </aside>
    </>
  );
}

/* ── Inner contents (shared between desktop & mobile) ──────────────── */
function SidebarInner({ pathname }: { pathname: string }) {
  return (
    <div
      style={{
        width: 240,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0c1d36",
        overflow: "hidden",
      }}
    >
      {/* ── Brand ──────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.01em",
            lineHeight: "24px",
            margin: 0,
          }}
        >
          BrightLife EHR
        </h1>
        <p
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: "rgba(255,255,255,0.50)",
            lineHeight: "18px",
            marginTop: 2,
          }}
        >
          Clinical Dashboard
        </p>
      </div>

      {/* ── Nav items ──────────────────────────────────────────────────── */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 12px",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                marginBottom: 2,
                borderRadius: 8,
                textDecoration: "none",
                backgroundColor: isActive ? "#1a4a7a" : "transparent",
                transition: "background 0.15s ease",
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span
                className={`material-symbols-outlined${isActive ? " icon-fill" : ""}`}
                style={{
                  fontSize: 22,
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.70)",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── End Session button ─────────────────────────────────────────── */}
      <div
        style={{
          padding: "12px 12px 16px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 16px",
            borderRadius: 8,
            border: "none",
            background: "rgba(186, 26, 26, 0.15)",
            color: "#ff8a80",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(186, 26, 26, 0.25)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(186, 26, 26, 0.15)")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            logout
          </span>
          End Session
        </button>
      </div>
    </div>
  );
}
