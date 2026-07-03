"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

interface Section {
  id: string;
  type: "TEXT_FIELD" | "CHECKBOX" | "RADIO_BUTTON";
  sectionName: string;
  instructions: string;
  style?: string; // for TEXT_FIELD (flow text, bullet points, etc)
  options?: string[]; // for CHECKBOX / RADIO_BUTTON
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  structure: string; // JSON string
  prompt: string | null;
  createdAt: string;
  updatedAt: string;
}

const SPECIALTIES = [
  "Psychology",
  "Psychiatry",
  "Child and Adolescent Psychiatry",
  "Geriatric Psychiatry",
  "Forensic Psychiatry",
  "Addiction Psychiatry",
  "Consultation-Liaison Psychiatry",
  "Neuropsychiatry",
  "Psychosomatic Medicine",
  "Emergency Psychiatry",
  "Sleep Medicine",
  "Clinical Psychology",
  "Counseling Psychology",
  "School Psychology",
  "Industrial-Organizational Psychology",
  "Health Psychology",
  "Neuropsychology",
  "Forensic Psychology",
  "Sports Psychology",
  "Developmental Psychology",
  "Social Psychology",
  "Experimental Psychology",
  "Community Psychology",
  "Anesthesiology",
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "General Surgery",
  "Geriatrics",
  "Hematology",
  "Infectious Disease",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Nutritionist",
  "Obstetrics and Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology",
  "Pediatrics",
  "Physical Medicine and Rehabilitation",
  "Plastic Surgery",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
  "Other",
];

const SECTION_NAMES = [
  "Chief Complaint",
  "History of Present Illness",
  "History of Present Illness - detailed",
  "Subjective",
  "Past Psychiatric History",
  "Past Psychiatric History - detailed",
  "Review of Psychiatric History",
  "Educational History",
  "Professional History",
  "Social and Family History",
  "Family History",
  "Medical History",
  "Social History",
  "Interim History",
  "Trauma History",
  "Medication History",
  "Past Medical and Surgical History",
  "Spiritual and Cultural Factors",
  "Developmental History",
  "Employment History",
  "Review of System",
  "General Review of Function",
  "Mental Status Exam",
  "Living Situation",
  "Objective",
  "Vital Signs",
  "Symptoms",
  "Learning/Working and Functional Status",
  "Substance Use",
  "Current Medication",
  "Current Status & Functioning",
  "Assessment",
  "Assessment (BPS)",
  "DAYC-2",
  "Assessment and Plan",
  "Risk Assessment",
  "Social History and Community Integration",
  "Problem List",
  "Problem List (excl. ICD 10)",
  "Problems Discussed",
  "DSM-5",
  "Suicide Risk Assessment",
  "Plan",
  "Plan (excl. ICD 10)",
  "Protective Factors",
  "Psychotherapeutic Interventions",
  "Treatment Progress",
  "Patient Goals",
  "CPT",
  "Client Strengths",
  "Clinical Summary",
  "Treatment Goal 1",
  "Treatment Goal 2",
  "Treatment Approaches",
  "Interventions",
  "Response to Interventions",
  "Plan and Homework",
  "Treatment Goal Progress",
  "Functional Impairment Areas",
  "Impact of Symptoms on Client Functioning",
  "Session Focus",
  "Progress towards Treatment Goals",
  "Behaviour",
  "Presenting Issue or Memory",
  "Image",
  "Negative Cognition",
  "Positive Cognition",
  "Validity of Cognition",
  "Emotional Processing",
  "SUDs",
  "Location of Body Sensation",
  "Desensitization",
  "Reason for Referral",
  "Presenting Problem",
  "Medical and Development History",
  "Accademic and Occupational History",
];

const TEXT_STYLES = [
  "flow text",
  "bullet points",
  "numbered list"
];

export default function TemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();

  // State lists
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editor modes: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  // Form State
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateSpecialty, setTemplateSpecialty] = useState("Psychiatry");
  const [templatePrompt, setTemplatePrompt] = useState("");
  const [sections, setSections] = useState<Section[]>([]);

  // Option input state for check/radio options (temp storage per section)
  const [newOptionTexts, setNewOptionTexts] = useState<{ [sectionId: string]: string }>({});

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (e) {
      console.error("Failed to load templates", e);
      showToast("Error fetching templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleStartCreate = () => {
    setTemplateName("");
    setTemplateDescription("");
    setTemplateSpecialty("Psychiatry");
    setTemplatePrompt("");
    setSections([]);
    setNewOptionTexts({});
    setViewMode("create");
    setActiveTemplateId(null);
  };

  const handleStartEdit = (template: Template) => {
    setTemplateName(template.name);
    setTemplateDescription(template.description || "");
    setTemplatePrompt(template.prompt || "");
    setNewOptionTexts({});

    // Parse structure JSON
    try {
      const parsed = JSON.parse(template.structure);
      setTemplateSpecialty(parsed.specialty || "Psychiatry");
      setSections(parsed.sections || []);
    } catch (e) {
      // Fallback if legacy non-JSON structure exists
      setTemplateSpecialty("Psychiatry");
      setSections([
        {
          id: "legacy_sec",
          type: "TEXT_FIELD",
          sectionName: "Clinical Note Content",
          style: "flow text",
          instructions: "Legacy raw markdown structure loaded. Update as needed.",
        }
      ]);
    }

    setActiveTemplateId(template.id);
    setViewMode("edit");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the template "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Template deleted successfully");
        fetchTemplates();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete template");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while deleting the template");
    }
  };

  // Section builders
  const addSection = (type: "TEXT_FIELD" | "CHECKBOX" | "RADIO_BUTTON") => {
    const newSec: Section = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      sectionName: "Chief Complaint",
      instructions: "",
      style: type === "TEXT_FIELD" ? "flow text" : undefined,
      options: type !== "TEXT_FIELD" ? ["Option 1"] : undefined,
    };
    setSections([...sections, newSec]);
  };

  const updateSection = (id: string, updatedFields: Partial<Section>) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, ...updatedFields } as Section : s))
    );
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[nextIndex];
    copy[nextIndex] = temp;
    setSections(copy);
  };

  // Option lists handlers
  const handleAddOption = (sectionId: string) => {
    const text = newOptionTexts[sectionId]?.trim();
    if (!text) return;

    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const currentOptions = section.options || [];
    if (currentOptions.includes(text)) {
      alert("Option already exists");
      return;
    }

    updateSection(sectionId, {
      options: [...currentOptions, text]
    });
    setNewOptionTexts({ ...newOptionTexts, [sectionId]: "" });
  };

  const handleRemoveOption = (sectionId: string, optionToRemove: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const currentOptions = section.options || [];
    updateSection(sectionId, {
      options: currentOptions.filter((opt) => opt !== optionToRemove)
    });
  };

  // Save template
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    if (sections.length === 0) {
      alert("Please add at least one section to your template");
      return;
    }

    // Validate checkbox/radio sections have options
    for (const sec of sections) {
      if ((sec.type === "CHECKBOX" || sec.type === "RADIO_BUTTON") && (!sec.options || sec.options.length === 0)) {
        alert(`Section "${sec.sectionName}" (${sec.type}) must have at least one option.`);
        return;
      }
    }

    const structureJSON = JSON.stringify({
      specialty: templateSpecialty,
      sections: sections
    }, null, 2);

    try {
      setSaving(true);
      const payload = {
        name: templateName.trim(),
        description: templateDescription.trim() || null,
        structure: structureJSON,
        prompt: templatePrompt.trim() || null
      };

      const url = viewMode === "edit" ? `/api/templates/${activeTemplateId}` : "/api/templates";
      const method = viewMode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(viewMode === "edit" ? "Template updated successfully" : "Template created successfully");
        setViewMode("list");
        fetchTemplates();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save template");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while saving the template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: 24,
          right: 24,
          background: "var(--color-inverse-surface)",
          color: "var(--color-inverse-on-surface)",
          padding: "12px 20px",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 8,
          animation: "fadeIn 0.2s ease-out"
        }}>
          <span className="material-symbols-outlined" style={{ color: "#a0c9ff" }}>check_circle</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/dashboard")}>Dashboard</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span
          style={{ cursor: viewMode !== "list" ? "pointer" : "default", fontWeight: viewMode === "list" ? 600 : 500, color: viewMode === "list" ? "var(--color-on-surface)" : "var(--color-on-surface-variant)" }}
          onClick={() => setViewMode("list")}
        >
          Note Templates
        </span>
        {viewMode !== "list" && (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>
              {viewMode === "create" ? "Create Template" : "Edit Template"}
            </span>
          </>
        )}
      </div>

      {viewMode === "list" ? (
        /* ══════════════════════════════════════════════════════════════════════════
           LIST VIEW
           ══════════════════════════════════════════════════════════════════════════ */
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>Clinical Note Templates</h1>
              <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", marginTop: 4 }}>
                Build and manage structured templates used by clinical staff to write patient folder session notes and summaries.
              </p>
            </div>
            <button
              onClick={handleStartCreate}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                backgroundColor: "var(--color-primary-container)",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
                transition: "background-color 0.15s ease",
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1d5b96"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--color-primary-container)"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
              Create Template
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "100px 0", gap: 12 }}>
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: 32, color: "var(--color-primary-container)" }}>progress_activity</span>
              <span style={{ fontSize: 15, fontWeight: 500, color: "var(--color-on-surface-variant)" }}>Loading clinical templates...</span>
            </div>
          ) : templates.length === 0 ? (
            <div style={{
              background: "#ffffff",
              border: "1px dashed var(--color-outline-variant)",
              borderRadius: 12,
              padding: 48,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-outline)" }}>assignment_late</span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-on-surface)" }}>No templates found</h3>
                <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", marginTop: 4, maxWidth: 400 }}>
                  Clinical templates guide clinicians when drafting documents. Create your first customized template.
                </p>
              </div>
              <button
                onClick={handleStartCreate}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "var(--color-primary-container)",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                + Add First Template
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {templates.map((tpl) => {
                let sectionsCount = 0;
                let specialty = "General";
                try {
                  const parsed = JSON.parse(tpl.structure);
                  sectionsCount = parsed.sections?.length || 0;
                  specialty = parsed.specialty || "General";
                } catch (e) { }

                return (
                  <div
                    key={tpl.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--color-outline-variant)",
                      borderRadius: 12,
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)";
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {tpl.name}
                        </h3>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 12,
                          backgroundColor: "var(--color-surface-container-low)",
                          color: "var(--color-primary-container)",
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.03em"
                        }}>
                          {specialty}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0, minHeight: 36, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {tpl.description || "No description provided."}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-outline)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>view_headline</span>
                        <span>{sectionsCount} dynamic sections</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", borderTop: "1px solid var(--color-outline-variant)", paddingTop: 14, gap: 12 }}>
                      <button
                        onClick={() => handleStartEdit(tpl)}
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid var(--color-primary-container)",
                          background: "transparent",
                          color: "var(--color-primary-container)",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--color-surface-container-low)"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tpl.id, tpl.name)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "8px 8px",
                          borderRadius: 6,
                          border: "1px solid var(--color-outline-variant)",
                          background: "transparent",
                          color: "var(--color-error)",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--color-error-container)";
                          e.currentTarget.style.borderColor = "var(--color-error)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = "var(--color-outline-variant)";
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════════
           EDITOR VIEW (CREATE / EDIT)
           ══════════════════════════════════════════════════════════════════════════ */
        <form onSubmit={handleSave} style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

          {/* Main Editing Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Default parameters card */}
            <div style={{
              background: "#ffffff",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", color: "var(--color-on-surface)" }}>
                Default Template Details
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor="tplName" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>Template Name</label>
                  <input
                    type="text"
                    id="tplName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g. SOAP Note, Sleep Intake Form"
                    style={{
                      padding: "10px 14px",
                      fontSize: 14,
                      border: "1px solid var(--color-outline-variant)",
                      borderRadius: 8,
                      outline: "none",
                      background: "var(--color-surface)",
                      color: "var(--color-on-surface)"
                    }}
                    required
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor="tplSpecialty" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>Specialty / Program Type</label>
                  <select
                    id="tplSpecialty"
                    value={templateSpecialty}
                    onChange={(e) => setTemplateSpecialty(e.target.value)}
                    style={{
                      padding: "10px 14px",
                      fontSize: 14,
                      border: "1px solid var(--color-outline-variant)",
                      borderRadius: 8,
                      outline: "none",
                      cursor: "pointer",
                      background: "var(--color-surface)",
                      color: "var(--color-on-surface)"
                    }}
                  >
                    {SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor="tplDesc" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>Short Description</label>
                  <input
                    type="text"
                    id="tplDesc"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Explain when clinicians should use this note template"
                    style={{
                      padding: "10px 14px",
                      fontSize: 14,
                      border: "1px solid var(--color-outline-variant)",
                      borderRadius: 8,
                      outline: "none",
                      background: "var(--color-surface)",
                      color: "var(--color-on-surface)"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Template Builder Sections list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>
                  Template Structure Sections
                </h2>
                <span style={{ fontSize: 12, color: "var(--color-outline)", fontWeight: 500 }}>
                  {sections.length} section{sections.length === 1 ? "" : "s"} added
                </span>
              </div>

              {sections.length === 0 ? (
                <div style={{
                  background: "var(--color-surface-container-low)",
                  border: "1px dashed var(--color-outline-variant)",
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                  color: "var(--color-on-surface-variant)"
                }}>
                  <p style={{ margin: 0, fontSize: 14 }}>No template sections added yet. Click one of the buttons below to add fields.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {sections.map((sec, index) => (
                    <div
                      key={sec.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid var(--color-outline-variant)",
                        borderRadius: 12,
                        padding: 20,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16
                      }}
                    >
                      {/* Section Card Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-surface-container)", paddingBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "var(--color-primary-container)",
                            color: "#ffffff",
                            fontSize: 12,
                            fontWeight: 700
                          }}>
                            {index + 1}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)" }}>
                            {sec.type.replace("_", " ")}
                          </span>
                        </div>

                        {/* Reordering and deleting */}
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => moveSection(index, "up")}
                            disabled={index === 0}
                            style={{
                              border: "none",
                              background: "none",
                              cursor: index === 0 ? "not-allowed" : "pointer",
                              opacity: index === 0 ? 0.3 : 0.7,
                              display: "flex",
                              padding: 4
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_upward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(index, "down")}
                            disabled={index === sections.length - 1}
                            style={{
                              border: "none",
                              background: "none",
                              cursor: index === sections.length - 1 ? "not-allowed" : "pointer",
                              opacity: index === sections.length - 1 ? 0.3 : 0.7,
                              display: "flex",
                              padding: 4
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_downward</span>
                          </button>
                          <div style={{ width: 1, height: 16, backgroundColor: "var(--color-outline-variant)", margin: "0 6px" }} />
                          <button
                            type="button"
                            onClick={() => removeSection(sec.id)}
                            style={{
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              color: "var(--color-error)",
                              display: "flex",
                              padding: 4,
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Section Card Body */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                        {/* Section name dropdown */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <label htmlFor={`secName-${sec.id}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>Section Name</label>
                          <div style={{ position: "relative" }}>
                            <input
                              type="text"
                              id={`secName-${sec.id}`}
                              list="section-names-list"
                              value={sec.sectionName}
                              onChange={(e) => updateSection(sec.id, { sectionName: e.target.value })}
                              onFocus={(e) => {
                                try {
                                  (e.target as any).showPicker();
                                } catch (err) {}
                              }}
                              onClick={(e) => {
                                try {
                                  (e.target as any).showPicker();
                                } catch (err) {}
                              }}
                              style={{
                                width: "100%",
                                padding: "10px 14px",
                                fontSize: 14,
                                border: "1px solid var(--color-outline-variant)",
                                borderRadius: 8,
                                outline: "none",
                                background: "var(--color-surface)",
                                color: "var(--color-on-surface)",
                              }}
                              placeholder="Select or type section name..."
                            />
                            <span className="material-symbols-outlined" style={{
                              position: "absolute",
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                              fontSize: 18,
                              color: "var(--color-outline)"
                            }}>expand_more</span>
                          </div>
                        </div>

                        {/* Style / options configuration based on type */}
                        {sec.type === "TEXT_FIELD" ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label htmlFor={`secStyle-${sec.id}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>Style Option</label>
                            <div style={{ position: "relative" }}>
                              <select
                                id={`secStyle-${sec.id}`}
                                value={sec.style || "flow text"}
                                onChange={(e) => updateSection(sec.id, { style: e.target.value })}
                                style={{
                                  width: "100%",
                                  padding: "10px 14px",
                                  fontSize: 14,
                                  border: "1px solid var(--color-outline-variant)",
                                  borderRadius: 8,
                                  outline: "none",
                                  cursor: "pointer",
                                  background: "var(--color-surface)",
                                  color: "var(--color-on-surface)",
                                  appearance: "none"
                                }}
                              >
                                {TEXT_STYLES.map((st) => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                              <span className="material-symbols-outlined" style={{
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                                fontSize: 18,
                                color: "var(--color-outline)"
                              }}>expand_more</span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>Configure Options</label>
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                type="text"
                                placeholder="Add option item..."
                                value={newOptionTexts[sec.id] || ""}
                                onChange={(e) => setNewOptionTexts({ ...newOptionTexts, [sec.id]: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddOption(sec.id);
                                  }
                                }}
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  fontSize: 13,
                                  border: "1px solid var(--color-outline-variant)",
                                  borderRadius: 8,
                                  outline: "none",
                                  background: "var(--color-surface)"
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddOption(sec.id)}
                                style={{
                                  padding: "8px 12px",
                                  backgroundColor: "var(--color-surface-container-high)",
                                  color: "var(--color-on-surface)",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  border: "none",
                                  borderRadius: 8,
                                  cursor: "pointer"
                                }}
                              >
                                Add
                              </button>
                            </div>

                            {/* Render added options list */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                              {(sec.options || []).map((opt) => (
                                <span key={opt} style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: "4px 10px",
                                  borderRadius: 16,
                                  backgroundColor: "var(--color-surface-container-low)",
                                  color: "var(--color-on-surface)",
                                  fontSize: 12,
                                  border: "1px solid var(--color-outline-variant)"
                                }}>
                                  {opt}
                                  <span
                                    onClick={() => handleRemoveOption(sec.id, opt)}
                                    className="material-symbols-outlined"
                                    style={{ fontSize: 14, cursor: "pointer", fontWeight: 700, color: "var(--color-outline)" }}
                                  >
                                    close
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Instructions textarea */}
                        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 6 }}>
                          <label htmlFor={`secInstr-${sec.id}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>Section Instructions (Optional)</label>
                          <textarea
                            id={`secInstr-${sec.id}`}
                            rows={2}
                            value={sec.instructions}
                            onChange={(e) => updateSection(sec.id, { instructions: e.target.value })}
                            placeholder="e.g. Enter a clinical summary describing active symptoms reported by client during session."
                            style={{
                              padding: "10px 14px",
                              fontSize: 14,
                              border: "1px solid var(--color-outline-variant)",
                              borderRadius: 8,
                              outline: "none",
                              background: "var(--color-surface)",
                              color: "var(--color-on-surface)",
                              resize: "vertical",
                              fontFamily: "inherit"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Section Buttons Row */}
              <div style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                padding: "16px 24px",
                background: "var(--color-surface-container-low)",
                border: "1px dashed var(--color-outline-variant)",
                borderRadius: 12
              }}>
                <button
                  type="button"
                  onClick={() => addSection("TEXT_FIELD")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--color-outline-variant)",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--color-on-surface)"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--color-surface-container-lowest)"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-primary-container)" }}>short_text</span>
                  + Text Field
                </button>
                <button
                  type="button"
                  onClick={() => addSection("CHECKBOX")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--color-outline-variant)",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--color-on-surface)"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--color-surface-container-lowest)"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-primary-container)" }}>check_box</span>
                  + Checkbox
                </button>
                <button
                  type="button"
                  onClick={() => addSection("RADIO_BUTTON")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--color-outline-variant)",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--color-on-surface)"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--color-surface-container-lowest)"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-primary-container)" }}>radio_button_checked</span>
                  + Radio Button
                </button>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div style={{ display: "flex", gap: 12, borderTop: "1px solid var(--color-outline-variant)", paddingTop: 20 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "var(--color-primary-container)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: 8,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? "Saving Template..." : "Save Template"}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "transparent",
                  color: "var(--color-outline)",
                  border: "1px solid var(--color-outline-variant)",
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>

          </div>

          {/* Right sidebar info panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* AI Generator Instructions Card */}
            <div style={{
              background: "#ffffff",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", color: "var(--color-on-surface)", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ color: "#e09300" }}>psychology</span>
                AI Prompt Guide
              </h3>
              <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", lineHeight: 1.5, margin: "0 0 14px" }}>
                Define instructions for Gemini when generating notes from audio recording transcripts. This tells the AI how to synthesize and format the details.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="tplPrompt" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>System Prompt Prompting</label>
                <textarea
                  id="tplPrompt"
                  rows={8}
                  value={templatePrompt}
                  onChange={(e) => setTemplatePrompt(e.target.value)}
                  placeholder="e.g. Draft a clinical SOAP note. Put client's raw statements under Subjective. Put therapist's clinical observations under Objective. Put goal evaluations under Assessment..."
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    border: "1px solid var(--color-outline-variant)",
                    borderRadius: 8,
                    outline: "none",
                    background: "var(--color-surface)",
                    color: "var(--color-on-surface)",
                    resize: "vertical",
                    fontFamily: "inherit",
                    lineHeight: 1.4
                  }}
                />
              </div>
            </div>

            {/* Template Builder Guide Box */}
            <div style={{
              background: "var(--color-surface-container-low)",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: 12,
              padding: 20
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", color: "var(--color-on-surface)" }}>
                Builder Guide
              </h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "var(--color-on-surface-variant)", display: "flex", flexDirection: "column", gap: 8, lineHeight: 1.4 }}>
                <li><strong>Text Field:</strong> Renders a textbox with instructions. Useful for open-ended summaries like Chief Complaint.</li>
                <li><strong>Checkbox:</strong> Clinicians select multiple options. Ideal for symptom lists or diagnostics.</li>
                <li><strong>Radio Button:</strong> Clinicians select a single option. Ideal for status options like patient prognosis or frequencies.</li>
              </ul>
            </div>

          </div>

        </form>
      )}

      {/* Global Datalist for Section Names */}
      <datalist id="section-names-list">
        {SECTION_NAMES.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
}
