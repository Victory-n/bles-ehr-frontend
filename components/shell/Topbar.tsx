"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

/* ══════════════════════════════════════════════════════════════════════════
   Topbar
   – White background, 64px tall
   – Search bar on the left
   – Icons + user profile on the right
══════════════════════════════════════════════════════════════════════════ */
export default function Topbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const { user, loading } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fullName = user ? `${user.firstname} ${user.lastname}` : "Dr. E. Vance";
  const userRoleName = user
    ? (user.role === 1 ? "System Admin" : (user.jsonColumn?.title ?? "Lead Clinician"))
    : "Lead Clinician";
  
  const initials = user
    ? (user.firstname[0] + user.lastname[0]).toUpperCase()
    : "EV";

  /* Close dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 24px",
        background: "#ffffff",
        borderBottom: "1px solid var(--color-outline-variant)",
        position: "sticky",
        top: 0,
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      {/* ── Mobile hamburger ───────────────────────────────────────────── */}
      <button
        className="lg:hidden"
        onClick={onMenuClick}
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
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
          menu
        </span>
      </button>

      {/* ── Search bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          maxWidth: 480,
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            position: "absolute",
            left: 12,
            fontSize: 20,
            color: "var(--color-outline)",
            pointerEvents: "none",
          }}
        >
          search
        </span>
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search patients, staff, or settings..."
          style={{
            width: "100%",
            fontSize: 14,
            lineHeight: "20px",
            padding: "8px 14px 8px 40px",
            borderRadius: 10,
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

      {/* ── Right controls ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginLeft: "auto",
          flexShrink: 0,
        }}
      >
        {/* Lock icon */}
        <button
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
            transition: "background 0.12s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background =
              "var(--color-surface-container)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
            lock
          </span>
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "none",
              background: notifOpen
                ? "var(--color-surface-container)"
                : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              color: "var(--color-on-surface-variant)",
              transition: "background 0.12s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background =
                "var(--color-surface-container)")
            }
            onMouseOut={(e) => {
              if (!notifOpen)
                e.currentTarget.style.background = "transparent";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
              notifications
            </span>
            {/* Red dot */}
            <span
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-error)",
                border: "2px solid #ffffff",
              }}
            />
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 300,
                background: "#ffffff",
                borderRadius: 12,
                border: "1px solid var(--color-outline-variant)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 60,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--color-outline-variant)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--color-on-surface)",
                }}
              >
                Notifications
              </div>
              <div style={{ padding: "16px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button
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
            transition: "background 0.12s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background =
              "var(--color-surface-container)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
            help
          </span>
        </button>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 28,
            background: "var(--color-outline-variant)",
            margin: "0 6px",
          }}
        />

        {/* User avatar + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            padding: "4px 6px 4px 4px",
            borderRadius: 20,
            transition: "background 0.12s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background =
              "var(--color-surface-container)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--color-primary-container)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.02em",
              }}
            >
              {loading ? "..." : initials}
            </span>
          </div>
          {/* Name + role */}
          <div className="hidden sm:block" style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-on-surface)",
                lineHeight: "16px",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              {loading ? "Loading..." : fullName}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--color-on-surface-variant)",
                lineHeight: "14px",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              {loading ? "Please wait" : userRoleName}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
