"use client";

import React, { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function VerifyPinModal({ onClose }: Props) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setError("PIN must be 6 digits.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/pin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Invalid PIN.");
      }
    } catch (err) {
      setError("A network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 6
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPin(digits);
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
              lock
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>
              Verify Your PIN
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
          style={{ padding: "8px 24px 24px", display: "flex", flexDirection: "column", gap: 24 }}
        >
          <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", margin: 0 }}>
            Please enter your 6-digit PIN to verify this sensitive action.
          </p>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--color-error-container)", color: "var(--color-on-error-container)", fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
              Enter PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="••••••"
              value={pin}
              onChange={handlePinChange}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid var(--color-outline-variant)",
                background: "var(--color-surface-container-lowest)",
                fontSize: 18,
                fontFamily: "var(--font-mono)",
                letterSpacing: 8,
                textAlign: "center",
                color: "var(--color-on-surface)",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-primary-container)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-outline-variant)")}
            />
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid var(--color-outline-variant)" }}>
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
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--color-primary-container)", color: "#ffffff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "background 0.15s" }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.background = "var(--color-primary)")}
              onMouseOut={(e) => !loading && (e.currentTarget.style.background = "var(--color-primary-container)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
