"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        gap: 20,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: "#ffdad6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 48, color: "#b3261e" }}
        >
          block
        </span>
      </div>

      {/* Heading */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "var(--color-on-background)",
          margin: 0,
        }}
      >
        Access Denied
      </h1>

      {/* Description */}
      <p
        style={{
          fontSize: 15,
          color: "var(--color-on-surface-variant)",
          maxWidth: 400,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        You don't have permission to access this module. Please contact your administrator if you believe this is an error.
      </p>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 8,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid var(--color-outline-variant)",
            background: "var(--color-surface-container-lowest)",
            color: "var(--color-on-surface)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.12s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "var(--color-surface-container)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background =
              "var(--color-surface-container-lowest)")
          }
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_back
          </span>
          Go Back
        </button>

        <button
          onClick={() => router.push("/dashboard")}
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
            transition: "background 0.12s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "var(--color-primary)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "var(--color-primary-container)")
          }
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            home
          </span>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
