"use client";

import React, { useState } from "react";

interface Session {
  id: string;
  sessionId: string;
  name: string;
  startDate: string;
  status: string;
  recordings?: any[];
}

interface TreatmentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  sessions: Session[];
  onSave: () => void;
}

export default function TreatmentPlanModal({
  isOpen,
  onClose,
  patient,
  sessions,
  onSave
}: TreatmentPlanModalProps) {
  const [step, setStep] = useState<"select" | "generating" | "edit">("select");
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const [generatingStatus, setGeneratingStatus] = useState("Analyzing sessions...");
  
  // Form State for editing
  const [title, setTitle] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [goals, setGoals] = useState("");
  const [interventions, setInterventions] = useState("");
  const [frequency, setFrequency] = useState("Once weekly");
  const [duration, setDuration] = useState("12 weeks");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE">("ACTIVE");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleToggleSession = (id: string) => {
    if (selectedSessionIds.includes(id)) {
      setSelectedSessionIds(selectedSessionIds.filter(sid => sid !== id));
    } else {
      setSelectedSessionIds([...selectedSessionIds, id]);
    }
  };

  const handleSelectAllSessions = () => {
    if (selectedSessionIds.length === sessions.length) {
      setSelectedSessionIds([]);
    } else {
      setSelectedSessionIds(sessions.map(s => s.id));
    }
  };

  const handleGenerate = async () => {
    if (selectedSessionIds.length === 0) {
      alert("Please select at least one session to build the treatment plan.");
      return;
    }

    try {
      setStep("generating");
      setGeneratingStatus("Fetching session notes...");

      // Simulate step transitions for premium feel
      setTimeout(() => setGeneratingStatus("Analyzing clinical observations..."), 1200);
      setTimeout(() => setGeneratingStatus("Synthesizing treatment goals with Gemini AI..."), 2500);

      const res = await fetch("/api/ai/treatment-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionIds: selectedSessionIds,
          instructions
        })
      });

      if (!res.ok) {
        throw new Error("Failed to generate treatment plan");
      }

      const data = await res.json();
      const generated = data.plan;

      // Populate form
      setTitle(generated.title || `Treatment Plan - ${patient.lastname}, ${patient.firstname}`);
      setDiagnosis(generated.diagnosis || "");
      setGoals(generated.goals || "");
      setInterventions(generated.interventions || "");
      setFrequency(generated.frequency || "Once weekly");
      setDuration(generated.duration || "12 weeks");
      
      setStep("edit");
    } catch (e) {
      console.error(e);
      alert("An error occurred during AI generation. Please try again.");
      setStep("select");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/treatment-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          title,
          diagnosis,
          goals,
          interventions,
          frequency,
          duration,
          status,
          sessionIds: selectedSessionIds
        })
      });

      if (res.ok) {
        onSave();
        onClose();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save treatment plan.");
      }
    } catch (e) {
      console.error("Save treatment plan error:", e);
      alert("Failed to save treatment plan.");
    } finally {
      setSaving(false);
    }
  };

  const hasNotes = (session: Session) => {
    return session.recordings?.some(r => r.documentType === "CLINIC_NOTES");
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
        maxWidth: step === "edit" ? 850 : 550,
        maxHeight: "85vh",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
        color: "#1d1d1f",
        overflow: "hidden",
        transition: "max-width 0.3s ease"
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
            <span style={{ fontSize: 16, fontWeight: 700 }}>
              {step === "select" && "Create Treatment Plan"}
              {step === "generating" && "Generating Plan..."}
              {step === "edit" && "Review Treatment Plan Draft"}
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={step === "generating" || saving}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "#86868b" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* STEP 1: Select Sessions */}
        {step === "select" && (
          <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <p style={{ margin: "0 0 8px 0", fontSize: 14, color: "var(--color-on-surface-variant)", lineHeight: 1.5 }}>
                Select the therapy sessions you wish to base the treatment plan on. The AI agent will analyze their clinic logs to construct measurable goals and specific interventions.
              </p>
            </div>

            {/* Sessions Selection List */}
            <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--color-outline-variant, #e5e5e7)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", background: "#f8f9fb", borderBottom: "1px solid var(--color-outline-variant, #e5e5e7)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)" }}>SESSIONS LIST</span>
                {sessions.length > 0 && (
                  <button
                    onClick={handleSelectAllSessions}
                    style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    {selectedSessionIds.length === sessions.length ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {sessions.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                    No sessions logged for this patient.
                  </div>
                ) : (
                  sessions.map((s) => {
                    const hasLog = hasNotes(s);
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleToggleSession(s.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          borderBottom: "1px solid #f1f3f4",
                          cursor: "pointer",
                          background: selectedSessionIds.includes(s.id) ? "#e8f0fe" : "transparent"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <input
                            type="checkbox"
                            checked={selectedSessionIds.includes(s.id)}
                            onChange={() => {}} // handled by row onClick
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                          />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: "var(--color-on-surface-variant)", marginTop: 2 }}>
                              {s.sessionId} • {new Date(s.startDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 8px",
                            borderRadius: 10,
                            fontSize: 10,
                            fontWeight: 600,
                            background: hasLog ? "#e6f4ea" : "#fff3cd",
                            color: hasLog ? "#137333" : "#856404"
                          }}>
                            {hasLog ? "Has Notes" : "No Notes"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Optional Guidelines / Focus (AI Prompts)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Focus on managing severe performance anxiety. Patient prefers self-guided homework. Focus on cognitive reframing."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 13,
                  border: "1px solid var(--color-outline-variant, #d2d2d7)",
                  borderRadius: 8,
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
            </div>

            {/* Footer Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid #f1f3f4", paddingTop: 16 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--color-outline-variant, #d2d2d7)", background: "transparent", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={selectedSessionIds.length === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: selectedSessionIds.length === 0 ? "#f1f3f4" : "var(--color-primary)",
                  color: selectedSessionIds.length === 0 ? "#86868b" : "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: selectedSessionIds.length === 0 ? "not-allowed" : "pointer"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
                Generate with AI
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Loading State */}
        {step === "generating" && (
          <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <span className="material-symbols-outlined" style={{
              fontSize: 48,
              color: "var(--color-primary)",
              animation: "spin 1.5s linear infinite"
            }}>
              progress_activity
            </span>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-surface)" }}>{generatingStatus}</div>
            <div style={{ fontSize: 13, color: "var(--color-on-surface-variant)", textAlign: "center", maxWidth: 350 }}>
              Gemini AI is digesting logs from the selected therapy sessions to extract patterns, clinical focus, and build structured, measurable goals.
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            ` }} />
          </div>
        )}

        {/* STEP 3: Review and Edit Form */}
        {step === "edit" && (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", height: "calc(85vh - 60px)", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
              
              {/* Left Column: Metadata */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#86868b", marginBottom: 6 }}>PLAN TITLE</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: "1px solid var(--color-outline-variant, #d2d2d7)", borderRadius: 8 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#86868b", marginBottom: 6 }}>DIAGNOSIS / CLINICAL IMPRESSION</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Generalized Anxiety Disorder (F41.1)"
                    style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: "1px solid var(--color-outline-variant, #d2d2d7)", borderRadius: 8 }}
                  />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#86868b", marginBottom: 6 }}>FREQUENCY</label>
                    <input
                      type="text"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: "1px solid var(--color-outline-variant, #d2d2d7)", borderRadius: 8 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#86868b", marginBottom: 6 }}>DURATION</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: "1px solid var(--color-outline-variant, #d2d2d7)", borderRadius: 8 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#86868b", marginBottom: 6 }}>STATUS</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={{ width: "100%", padding: "8px 12px", fontSize: 13, border: "1px solid var(--color-outline-variant, #d2d2d7)", borderRadius: 8, background: "#ffffff" }}
                  >
                    <option value="ACTIVE">Active Plan</option>
                    <option value="DRAFT">Draft Plan</option>
                  </select>
                </div>

                {/* Info Card */}
                <div style={{ padding: "12px 14px", background: "#f8f9fb", border: "1px solid var(--color-outline-variant, #e5e5e7)", borderRadius: 8, fontSize: 12, color: "var(--color-on-surface-variant)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary)" }}>info</span>
                  <span>
                    Linked to <strong>{selectedSessionIds.length}</strong> selected session logs. Review the generated goals and interventions carefully before confirming.
                  </span>
                </div>
              </div>

              {/* Right Column: Goal & Interventions Content */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#86868b", marginBottom: 6 }}>TREATMENT GOALS & OBJECTIVES</label>
                  <textarea
                    required
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    rows={8}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: 13,
                      border: "1px solid var(--color-outline-variant, #d2d2d7)",
                      borderRadius: 8,
                      outline: "none",
                      resize: "none",
                      fontFamily: "inherit",
                      lineHeight: 1.4
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#86868b", marginBottom: 6 }}>THERAPEUTIC INTERVENTIONS</label>
                  <textarea
                    value={interventions}
                    onChange={(e) => setInterventions(e.target.value)}
                    rows={7}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: 13,
                      border: "1px solid var(--color-outline-variant, #d2d2d7)",
                      borderRadius: 8,
                      outline: "none",
                      resize: "none",
                      fontFamily: "inherit",
                      lineHeight: 1.4
                    }}
                  />
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--color-outline-variant, #e5e5e7)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setStep("select")}
                style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--color-on-surface-variant)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                Back to Session Selection
              </button>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--color-outline-variant, #d2d2d7)", background: "transparent", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--color-primary)",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer"
                  }}
                >
                  {saving ? "Saving..." : "Save Treatment Plan"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
