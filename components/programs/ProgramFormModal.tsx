"use client";

import React, { useState } from "react";


interface Program {
  id: string;
  programId: string;
  name: string;
  description?: string;
  type: string;
  sessionType: string;
  frequency: string;
  totalSessions: number;
  duration: string;
  maxEnrollment: number;
  extraInfo?: { notes?: string };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  onClose: () => void;
  onSave?: (data: any) => void;
  program?: Program;
}

export default function ProgramFormModal({ onClose, onSave, program }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!program;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");

    try {
      const payload = Object.fromEntries(fd.entries());
      const res = await fetch(isEditMode ? `/api/programs/${program.programId}` : "/api/programs", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        onSave?.(data.program);
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || `Failed to ${isEditMode ? 'update' : 'create'} program.`);
      }
    } catch (err) {
      setError("A network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const defaultValues = isEditMode ? {
    name: program.name,
    description: program.description || "",
    type: program.type,
    frequency: program.frequency,
    totalSessions: program.totalSessions,
    duration: program.duration,
    maxEnrollment: program.maxEnrollment,
    sessionType: program.sessionType,
    notes: (program.extraInfo as { notes?: string })?.notes || ""
  } : {};

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
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary-container)" }}>{isEditMode ? "edit" : "add_box"}</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{isEditMode ? "Edit Program" : "Create Program"}</h3>
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
          style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}
        >
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--color-error-container)", color: "var(--color-on-error-container)", fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Section: Program Details */}
          <SectionHeading icon="settings_suggest" color="var(--color-primary-container)" label="Program Configuration" />

          {/* Name of the program */}
          <FormField name="name" label="Program Name" placeholder="e.g. Cognitive Behavioral Therapy" defaultValue={defaultValues.name} required />

          {/* Description of the program */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
              Description
            </label>
            <textarea
              name="description"
              placeholder="Provide a detailed description of the program..."
              rows={3}
              defaultValue={defaultValues.description}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--color-outline-variant)",
                background: "var(--color-surface-container-lowest)",
                fontSize: 13,
                color: "var(--color-on-surface)",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-primary-container)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-outline-variant)")}
            />
          </div>

          <Divider />

          {/* Configuration Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Program types (Eg. PHP, POP, IOP, etc) */}
            <FormField
              name="type"
              label="Program Type"
              placeholder="Select type..."
              type="select"
              options={["PHP (Partial Hospitalization Program)", "POP (Post-Op Program)", "IOP (Intensive Outpatient Program)", "OP (Outpatient Program)"]}
              defaultValue={defaultValues.type}
              required
            />
            {/* Session frequency */}
            <FormField
              name="frequency"
              label="Session Frequency"
              placeholder="Select frequency..."
              type="select"
              options={["Daily", "Weekly", "Weekends", "Monthly", "Bi-Weekly"]}
              defaultValue={defaultValues.frequency}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Total sessions the program will have */}
            <FormField
              name="totalSessions"
              label="Total Sessions"
              placeholder="e.g. 12"
              type="number"
              min={1}
              defaultValue={defaultValues.totalSessions}
              required
            />
            {/* Duration of the program */}
            <FormField
              name="duration"
              label="Duration"
              placeholder="e.g. 6 weeks"
              defaultValue={defaultValues.duration}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Max patient enrollment */}
            <FormField
              name="maxEnrollment"
              label="Max Patient Enrollment"
              placeholder="e.g. 15"
              type="number"
              min={1}
              defaultValue={defaultValues.maxEnrollment}
              required
            />
            {/* Session Type */}
            <FormField
              name="sessionType"
              label="Session Type"
              placeholder="Select session type..."
              type="select"
              options={["Group", "Single"]}
              defaultValue={defaultValues.sessionType}
              required
            />
          </div>

          <Divider />

          {/* Additional notes */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
              Additional Notes <span style={{ fontWeight: 400, color: "var(--color-on-surface-variant)" }}>(Optional)</span>
            </label>
            <textarea
              name="notes"
              placeholder="Enter any additional staff, facility, or patient-specific guidelines..."
              rows={3}
              defaultValue={defaultValues.notes}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--color-outline-variant)",
                background: "var(--color-surface-container-lowest)",
                fontSize: 13,
                color: "var(--color-on-surface)",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-primary-container)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-outline-variant)")}
            />
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid var(--color-outline-variant)", marginTop: 8 }}>
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
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{isEditMode ? "save" : "add"}</span>
              {loading ? `${isEditMode ? "Updating" : "Creating"}...` : `${isEditMode ? "Update" : "Create"} Program`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────────────── */

function SectionHeading({ icon, color, label }: { icon: string; color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="material-symbols-outlined icon-fill" style={{ fontSize: 20, color }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color }}>{label}</span>
    </div>
  );
}

function FormField({
  label, name, placeholder, type = "text", icon, options, defaultValue, required, min
}: {
  label: string; name?: string; placeholder: string; type?: "text" | "number" | "select"; icon?: string; options?: string[]; defaultValue?: string | number; required?: boolean; min?: number;
}) {
  const baseStyle: React.CSSProperties = {
    width: "100%",
    padding: icon ? "8px 12px 8px 36px" : "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--color-outline-variant)",
    background: "var(--color-surface-container-lowest)",
    fontSize: 13,
    color: "var(--color-on-surface)",
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "var(--color-primary-container)");
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "var(--color-outline-variant)");

  return (
    <div>
      {label && (
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            className="material-symbols-outlined"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--color-outline)", pointerEvents: "none" }}
          >
            {icon}
          </span>
        )}
        {type === "select" ? (
          <>
            <select
              name={name}
              style={{ ...baseStyle, appearance: "none", paddingRight: 32, cursor: "pointer" }}
              onFocus={handleFocus as any}
              onBlur={handleBlur as any}
              defaultValue={defaultValue ?? ""}
              required={required}
            >
              <option value="" disabled>{placeholder}</option>
              {options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <span
              className="material-symbols-outlined"
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--color-outline)", pointerEvents: "none" }}
            >
              expand_more
            </span>
          </>
        ) : (
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            defaultValue={defaultValue}
            style={baseStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            min={min}
          />
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid var(--color-outline-variant)", margin: 0 }} />;
}
