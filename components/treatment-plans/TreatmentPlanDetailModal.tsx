"use client";

import React, { useState } from "react";

interface TreatmentPlan {
  id: string;
  title: string;
  diagnosis?: string;
  goals: string;
  interventions?: string;
  frequency?: string;
  duration?: string;
  status: string;
  createdAt: string;
  createdBy: {
    firstname: string;
    lastname: string;
  };
  sessions?: any[];
}

interface TreatmentPlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TreatmentPlan | null;
  onUpdate: () => void;
}

export default function TreatmentPlanDetailModal({
  isOpen,
  onClose,
  plan,
  onUpdate
}: TreatmentPlanDetailModalProps) {
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !plan) return null;

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      // Wait, we need an endpoint to update a treatment plan status. Let's make one!
      // But we can also do it directly in this save callback or a general update route.
      // Let's call PUT /api/treatment-plans with { id, status }
      const res = await fetch(`/api/treatment-plans`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plan.id, status: newStatus })
      });

      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        alert("Failed to update treatment plan status.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 9999
        }}
      />

      {/* Modal Container */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: 700,
        maxHeight: "85vh",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
        color: "#1d1d1f",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--color-outline-variant, #e5e5e7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)", fontSize: 22 }}>assignment</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Treatment Plan Detail</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "#86868b" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Title & Metadata Header */}
          <div style={{ borderBottom: "1px solid #f1f3f4", paddingBottom: 16 }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 700 }}>{plan.title}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "var(--color-on-surface-variant)" }}>
              <span>
                <strong>Diagnosis:</strong> {plan.diagnosis || "N/A"}
              </span>
              <span>
                <strong>Provider:</strong> {plan.createdBy.firstname} {plan.createdBy.lastname}
              </span>
              <span>
                <strong>Date:</strong> {new Date(plan.createdAt).toLocaleDateString()}
              </span>
              <span>
                <strong>Frequency:</strong> {plan.frequency || "N/A"}
              </span>
              <span>
                <strong>Duration:</strong> {plan.duration || "N/A"}
              </span>
            </div>
          </div>

          {/* Goals & Interventions Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: 12, fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Goals & Objectives</h4>
              <div style={{
                padding: 12,
                border: "1px solid var(--color-outline-variant, #e5e5e7)",
                borderRadius: 8,
                background: "#f8f9fb",
                fontSize: 13,
                whiteSpace: "pre-wrap",
                lineHeight: 1.4,
                maxHeight: 250,
                overflowY: "auto"
              }}>
                {plan.goals}
              </div>
            </div>

            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: 12, fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Therapeutic Interventions</h4>
              <div style={{
                padding: 12,
                border: "1px solid var(--color-outline-variant, #e5e5e7)",
                borderRadius: 8,
                background: "#f8f9fb",
                fontSize: 13,
                whiteSpace: "pre-wrap",
                lineHeight: 1.4,
                maxHeight: 250,
                overflowY: "auto"
              }}>
                {plan.interventions || "No interventions documented."}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f3f4", paddingTop: 16, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Plan Status:</span>
              <span style={{
                padding: "3px 8px",
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
                background: plan.status === "ACTIVE" ? "#e6f4ea" : plan.status === "COMPLETED" ? "#e8f0fe" : "#f1f3f4",
                color: plan.status === "ACTIVE" ? "#137333" : plan.status === "COMPLETED" ? "#1a73e8" : "#5f6368"
              }}>
                {plan.status}
              </span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {plan.status === "DRAFT" && (
                <button
                  onClick={() => handleUpdateStatus("ACTIVE")}
                  disabled={updating}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "none",
                    background: "var(--color-primary)",
                    color: "#ffffff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Activate Plan
                </button>
              )}
              {plan.status === "ACTIVE" && (
                <button
                  onClick={() => handleUpdateStatus("COMPLETED")}
                  disabled={updating}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "none",
                    background: "#1e8e3e",
                    color: "#ffffff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Mark Completed
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "1px solid var(--color-outline-variant, #d2d2d7)",
                  background: "transparent",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
