"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface Program {
  id: string;
  programId: string;
  name: string;
  sessionType: string;
  status: string;
}

interface Patient {
  id: string;
  firstname: string;
  lastname: string;
}

interface EnrolledPatientRelation {
  id: string;
  patientId: string;
  patient: Patient;
}

export default function ScheduleSessionPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [enrolledPatients, setEnrolledPatients] = useState<EnrolledPatientRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [customLocation, setCustomLocation] = useState(false);
  const [locationValue, setLocationValue] = useState("Telehealth");
  const [customLocationText, setCustomLocationText] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Scheduled",
    startDate: "",
    endDate: "",
    patientProgramId: "",
    notes: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const programRes = await fetch(`/api/programs/${programId}`);
      if (programRes.ok) {
        const programData = await programRes.json();
        setProgram(programData.program);

        // Fetch enrolled patients if program is Single (Individual) session type
        if (programData.program.sessionType === "Single") {
          const enrollRes = await fetch(`/api/programs/${programId}/enrolled`);
          if (enrollRes.ok) {
            const enrollData = await enrollRes.json();
            setEnrolledPatients(enrollData.patientPrograms || []);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load data for scheduling session:", err);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLocationValue(val);
    if (val === "Other") {
      setCustomLocation(true);
    } else {
      setCustomLocation(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const location = customLocation ? customLocationText : locationValue;
    const submissionData = {
      ...formData,
      location
    };

    try {
      setSubmitting(true);
      const res = await fetch(`/api/programs/${programId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      });

      if (res.ok) {
        alert("Session scheduled successfully!");
        router.push(`/programs/${programId}`);
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to schedule session.");
      }
    } catch (err) {
      console.error("Failed to schedule session:", err);
      alert("An unexpected error occurred while scheduling the session.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <span style={{ fontSize: 16, color: "var(--color-on-surface-variant)" }}>Loading details...</span>
      </div>
    );
  }

  if (!program) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <span style={{ fontSize: 16, color: "var(--color-on-surface-variant)" }}>Program not found</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 800, margin: "0 auto" }}>
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/programs")}>Programs</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push(`/programs/${programId}`)}>{program.programId}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>Schedule Session</span>
      </div>

      {/* ── Main Form Card ─────────────────────────────────────────────── */}
      <div style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: 12,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 28,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--color-primary-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#ffffff" }}>calendar_today</span>
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>Schedule Session</h2>
            <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: "4px 0 0" }}>
              Schedule a new session for the <strong>{program.name}</strong> ({program.programId})
            </p>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--color-outline-variant)", margin: 0 }} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Row 1: Name and Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
                Session Name <span style={{ color: "var(--color-error)" }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Weekly Group Therapy"
                required
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
                Location
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <select
                  value={locationValue}
                  onChange={handleLocationChange}
                  style={inputStyle}
                >
                  <option value="Telehealth">Telehealth</option>
                  <option value="Conference Room A">Conference Room A</option>
                  <option value="Conference Room B">Conference Room B</option>
                  <option value="Main Office">Main Office</option>
                  <option value="Other">Other (Custom Location)</option>
                </select>
                {customLocation && (
                  <input
                    type="text"
                    value={customLocationText}
                    onChange={(e) => setCustomLocationText(e.target.value)}
                    placeholder="Enter custom location"
                    required
                    style={inputStyle}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Date & Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
                Start Date & Time <span style={{ color: "var(--color-error)" }}>*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Row 3: Status and Patient (if Single) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
                <option value="No-Show">No-Show</option>
              </select>
            </div>

            {program.sessionType === "Single" && (
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
                  Target Patient <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <select
                  name="patientProgramId"
                  value={formData.patientProgramId}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="" disabled>Select enrolled patient...</option>
                  {enrolledPatients.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      {ep.patient.firstname} {ep.patient.lastname}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Row 4: Description */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide context or instructions for this session..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Row 5: Additional Notes */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>
              Additional Notes <span style={{ fontWeight: 400, color: "var(--color-on-surface-variant)" }}>(Optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any administrative or clinical notes..."
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--color-outline-variant)", margin: "8px 0" }} />

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={() => router.push(`/programs/${programId}`)}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid var(--color-outline-variant)",
                background: "transparent",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-on-surface)",
                cursor: "pointer",
                transition: "background 0.12s"
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: submitting ? "var(--color-outline-variant)" : "var(--color-primary-container)",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "background 0.15s"
              }}
              onMouseOver={(e) => {
                if (!submitting) e.currentTarget.style.background = "var(--color-primary)";
              }}
              onMouseOut={(e) => {
                if (!submitting) e.currentTarget.style.background = "var(--color-primary-container)";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {submitting ? "progress_activity" : "check"}
              </span>
              {submitting ? "Scheduling..." : "Schedule Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--color-outline-variant)",
  background: "var(--color-surface-container-lowest)",
  fontSize: 13,
  color: "var(--color-on-surface)",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s"
};
