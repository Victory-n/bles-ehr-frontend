"use client";

import React from "react";

export default function AuditLogsPage() {
  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-on-surface)", marginBottom: 32 }}>Audit Logs</h1>

      <div style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px dashed var(--color-outline)",
        borderRadius: 12,
        padding: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 16,
        maxWidth: 800,
        margin: "0 auto",
        marginTop: 40
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#fff8e1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#f57c00" }}>workspace_premium</span>
        </div>

        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px 0", color: "var(--color-on-surface)" }}>
            Audit Log is a Tier 2 feature
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: "var(--color-on-surface-variant)", maxWidth: 400, lineHeight: 1.5 }}>
            Upgrade your plan to unlock audit logs and other advanced clinical tools for your practice.
          </p>
        </div>
      </div>
    </div>
  );
}
