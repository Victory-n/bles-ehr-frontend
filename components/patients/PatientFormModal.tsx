"use client";

import React, { useState } from "react";
import { SetPinModal, VerifyPinModal } from "@/components/PinModal";
import { useAuth } from "@/lib/auth/AuthContext";

/* ══════════════════════════════════════════════════════════════════════════
   Patient Form Modal — shared between Add & Edit flows
══════════════════════════════════════════════════════════════════════════ */

export interface PatientFormData {
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  diagnosis?: string;
  provider?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  zip?: string;
  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyPhone?: string;
  notes?: string;
}

interface Props {
  mode: "add" | "edit";
  initialData?: PatientFormData;
  editPatientId?: string;
  onClose: () => void;
  onSave?: (data: PatientFormData) => void;
}

export default function PatientFormModal({ mode, initialData, editPatientId, onClose, onSave }: Props) {
  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Patient" : "Add New Patient";
  const icon = isEdit ? "edit" : "person_add";
  const saveLabel = isEdit ? "Update Patient" : "Save Patient";
  const { user } = useAuth();
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showVerifyPinModal, setShowVerifyPinModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPendingFormData(fd);

    if (!user?.hasPin) {
      setShowSetPinModal(true);
    } else {
      setShowVerifyPinModal(true);
    }
  };

  const submitPatientData = async () => {
    if (!pendingFormData) return;
    setLoading(true);
    setError("");

    try {
      const payload = Object.fromEntries(pendingFormData.entries());
      const url = isEdit && editPatientId ? `/api/patients/${editPatientId}` : "/api/patients";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSave?.(payload as any);
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to save patient.");
      }
    } catch (err) {
      setError("A network error occurred.");
    } finally {
      setLoading(false);
    }
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
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary-container)" }}>{icon}</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{title}</h3>
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
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--color-error-container)", color: "var(--color-on-error-container)", fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Personal Information */}
          <SectionHeading icon="person" color="var(--color-primary-container)" label="Personal Information" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField name="firstName" label="First Name" placeholder="e.g. Jane" defaultValue={initialData?.firstName} required />
            <FormField name="lastName" label="Last Name" placeholder="e.g. Doe" defaultValue={initialData?.lastName} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField name="dateOfBirth" label="Date of Birth" placeholder="dd/mm/yyyy" type="date" icon="calendar_today" defaultValue={initialData?.dob} required />
            <FormField name="gender" label="Gender Identity" placeholder="Select gender..." type="select" options={["Male", "Female", "Non-Binary", "Prefer not to say"]} defaultValue={initialData?.gender} required />
          </div>

          <Divider />

          {/* Clinical Details */}
          <SectionHeading icon="stethoscope" color="var(--color-secondary)" label="Clinical Details" />
          <FormField name="diagnosis" label="Primary Diagnosis (ICD-10/DSM-5)" placeholder="Search diagnosis codes..." icon="search" defaultValue={initialData?.diagnosis} />
          <FormField name="provider" label="Assigned Provider" placeholder="Select primary clinician..." type="select" options={["Dr. E. Vance", "Dr. A. Okafor", "Dr. S. Adeyemi", "Dr. R. Mensah"]} defaultValue={initialData?.provider} />

          <Divider />

          {/* Contact Information */}
          <SectionHeading icon="call" color="var(--color-primary-container)" label="Contact Information" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField name="phone" label="Phone Number" placeholder="(555) 000-0000" icon="call" defaultValue={initialData?.phone} />
            <FormField name="email" label="Email Address" placeholder="patient@example.com" icon="mail" defaultValue={initialData?.email} />
          </div>
          <FormField name="address" label="Home Address" placeholder="Street Address" defaultValue={initialData?.address} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 14 }}>
            <FormField name="city" label="" placeholder="City" defaultValue={initialData?.city} />
            <FormField name="zip" label="" placeholder="ZIP" defaultValue={initialData?.zip} />
          </div>

          <Divider />

          {/* Emergency Contact */}
          <SectionHeading icon="emergency" color="var(--color-on-error-container)" label="Emergency Contact" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField name="emergencyName" label="Contact Name" placeholder="Full Name" defaultValue={initialData?.emergencyName} />
            <FormField name="emergencyRelationship" label="Relationship" placeholder="e.g. Spouse, Parent" defaultValue={initialData?.emergencyRelationship} />
          </div>
          <FormField name="emergencyPhone" label="Emergency Phone Number" placeholder="(555) 000-0000" defaultValue={initialData?.emergencyPhone} />

          <Divider />

          {/* Intake Notes */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
              {isEdit ? "Notes" : "Intake Notes"} <span style={{ fontWeight: 400, color: "var(--color-on-surface-variant)" }}>(Optional)</span>
            </label>
            <textarea
              name="notes"
              placeholder="Brief context or special requirements..."
              rows={3}
              defaultValue={initialData?.notes}
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
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
              {loading ? "Saving..." : saveLabel}
            </button>
          </div>
        </form>
      </div>

      {/* PIN Modals */}
      {showSetPinModal && (
        <SetPinModal 
          onClose={() => setShowSetPinModal(false)}
          onSuccess={() => {
            setShowSetPinModal(false);
            submitPatientData();
          }} 
        />
      )}
      {showVerifyPinModal && (
        <VerifyPinModal 
          onClose={() => setShowVerifyPinModal(false)}
          onSuccess={() => {
            setShowVerifyPinModal(false);
            submitPatientData();
          }} 
        />
      )}
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
  label, name, placeholder, type = "text", icon, options, defaultValue, required,
}: {
  label: string; name?: string; placeholder: string; type?: "text" | "date" | "select"; icon?: string; options?: string[]; defaultValue?: string; required?: boolean;
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
          />
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid var(--color-outline-variant)", margin: 0 }} />;
}
