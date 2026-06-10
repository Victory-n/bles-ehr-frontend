"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/* ── Patient Mock Database ──────────────────────────────────────────────── */
const MOCK_PATIENTS: Record<string, { name: string; dob: string }> = {
  "FLD-1001": { name: "Abernathy, Sarah", dob: "04/12/1988" },
  "FLD-1002": { name: "Chen, Wei", dob: "11/03/1995" },
};

export default function NewClinicNotePage() {
  const params = useParams();
  const router = useRouter();
  const notesId = params.notesId as string;

  const patient = MOCK_PATIENTS[notesId] || { name: "Abernathy, Sarah", dob: "04/12/1988" };

  // Form states
  const [title, setTitle] = useState("Initial Intake Assessment");
  const [noteType, setNoteType] = useState("Intake Session");
  const [program, setProgram] = useState("None");
  const [tags, setTags] = useState(["#CBT", "#Anxiety"]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  
  // Editor state
  const [editorText, setEditorText] = useState(
    "Chief Complaint: Patient presents with increased feelings of general anxiety over the past 3 weeks.\n\n" +
    "Subjective: Patient reports difficulty sleeping, racing thoughts, and physical symptoms of tension in the neck and shoulders. Rates current anxiety level at 7/10.\n\n" +
    "Objective: Patient appears restless, frequently shifting in seat. Speech is slightly accelerated but coherent and goal-directed. Affect is anxious but congruent."
  );

  // Autosave status state
  const [saveStatus, setSaveStatus] = useState("Saved 2 mins ago");
  const [saveCounter, setSaveCounter] = useState(120); // 2 minutes

  // Background auto-save simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSaveCounter((prev) => {
        if (prev <= 1) {
          // Trigger mock "save"
          setSaveStatus("Saving...");
          setTimeout(() => {
            setSaveStatus("Saved just now");
          }, 800);
          return 60; // reset to 1 min
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format the counter for display
  useEffect(() => {
    if (saveStatus === "Saving...") return;
    if (saveCounter === 0 || saveCounter < 60) {
      setSaveStatus("Saved just now");
    } else {
      const mins = Math.floor(saveCounter / 60);
      setSaveStatus(`Saved ${mins} min${mins > 1 ? "s" : ""} ago`);
    }
  }, [saveCounter, saveStatus]);

  // Insert Template handler
  const handleInsertTemplate = () => {
    const template = 
      "\n\n--- CLINICAL TEMPLATE ---" +
      "\nAssessment / Diagnosis Refinement: Patient exhibits symptoms consistent with anxiety/mood triggers." +
      "\nPlan & Interventions:" +
      "\n1. Cognitive Restructuring practice." +
      "\n2. Monitor daily behavioral activation triggers.";
    setEditorText((prev) => prev + template);
    setSaveStatus("Saving...");
    setTimeout(() => {
      setSaveStatus("Saved just now");
      setSaveCounter(60);
    }, 600);
  };

  // Dictation States
  const [isDictating, setIsDictating] = useState(false);
  const [dictationIndex, setDictationIndex] = useState(0);

  const dictationWords = [
    "Plan", "and", "Recommendations:", 
    "Patient", "will", "continue", "with", "weekly", "cognitive", "behavioral", "therapy.", 
    "Therapist", "to", "introduce", "mindfulness", "practices", "for", "somatic", "tension.", 
    "Next", "session", "is", "scheduled", "for", "Wednesday."
  ];

  useEffect(() => {
    let interval: any;
    if (isDictating) {
      setSaveStatus("Saving...");
      setEditorText((prev) => prev + "\n\n");

      let currentIdx = 0;
      interval = setInterval(() => {
        if (currentIdx < dictationWords.length) {
          const nextWord = dictationWords[currentIdx];
          setEditorText((prev) => prev + nextWord + " ");
          currentIdx++;
          setDictationIndex(currentIdx);

          const textarea = document.querySelector("textarea");
          if (textarea) {
            textarea.scrollTop = textarea.scrollHeight;
          }
        } else {
          setIsDictating(false);
          setSaveStatus("Saved just now");
          setSaveCounter(60);
          clearInterval(interval);
        }
      }, 400);
    } else {
      if (dictationIndex > 0) {
        setSaveStatus("Saved just now");
        setSaveCounter(60);
      }
    }

    return () => clearInterval(interval);
  }, [isDictating]);

  // Add Tag handler
  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = newTagInput.trim();
    if (!cleaned) return;
    if (!cleaned.startsWith("#")) {
      cleaned = "#" + cleaned;
    }
    if (!tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setNewTagInput("");
    setIsAddingTag(false);
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Discard handler
  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard this note? All unsaved progress will be lost.")) {
      router.push(`/clinic-notes/${notesId}`);
    }
  };

  // Save/Sign Note handler
  const handleSaveNote = (isLocked: boolean) => {
    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const newNoteObject = {
      name: title || "Untitled Clinical Note",
      date: formattedDate,
      type: noteType,
      isDraft: !isLocked,
    };

    if (typeof window !== "undefined") {
      const defaultDocs = [
        { name: "Progress Note — Session 4", date: "Mar 02, 2024", type: "Progress Note" },
        { name: "Progress Note — Session 5", date: "Mar 10, 2024", type: "Progress Note" },
        { name: "Intake Assessment", date: "Jan 15, 2024", type: "Intake Session" },
      ];
      const saved = localStorage.getItem(`notes_${notesId}`);
      const currentNotes = saved ? JSON.parse(saved) : defaultDocs;

      // Add to list (unshift to place it at the top)
      const updatedNotes = [newNoteObject, ...currentNotes];
      localStorage.setItem(`notes_${notesId}`, JSON.stringify(updatedNotes));
    }

    router.push(`/clinic-notes/${notesId}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)", color: "#1d1d1f" }}>
      
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/clinic-notes")}>Patients</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push(`/clinic-notes/${notesId}`)}>
          {patient.name} (DOB: {patient.dob})
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>New Clinical Note</span>
      </div>

      {/* ── Card 1: Note Details ─────────────────────────────────────────── */}
      <div style={{
        background: "var(--color-surface-container-lowest, #ffffff)",
        border: "1px solid var(--color-outline-variant, #e5e5e7)",
        borderRadius: 12,
        padding: "24px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          
          {/* Note Title Input */}
          <div style={{ flex: 1.2, minWidth: 300 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-on-surface-variant, #86868b)", display: "block", marginBottom: 6 }}>NOTE TITLE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                fontSize: 24,
                fontWeight: 700,
                color: "#1d1d1f",
                border: "none",
                borderBottom: "1px solid transparent",
                padding: "4px 0",
                outline: "none",
                background: "transparent",
              }}
              placeholder="Enter note title..."
            />
          </div>

          {/* Note Type & Programs Group (side-by-side on the right) */}
          <div style={{ flex: 2, minWidth: 320, display: "flex", gap: 16 }}>
            
            {/* Note Type Select */}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-on-surface-variant, #86868b)", display: "block", marginBottom: 6 }}>NOTE TYPE</label>
              <div style={{ position: "relative" }}>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#1d1d1f",
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--color-outline-variant, #d2d2d7)",
                    borderRadius: 8,
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                  }}
                >
                  <option value="Intake Session">Intake Session</option>
                  <option value="Progress Note">Progress Note</option>
                  <option value="Group Therapy Note">Group Therapy Note</option>
                  <option value="Assessment Summary">Assessment Summary</option>
                </select>
                <span className="material-symbols-outlined" style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  fontSize: 20,
                  color: "#86868b",
                }}>
                  expand_more
                </span>
              </div>
            </div>

            {/* Programs Select */}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-on-surface-variant, #86868b)", display: "block", marginBottom: 6 }}>PROGRAMS</label>
              <div style={{ position: "relative" }}>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#1d1d1f",
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--color-outline-variant, #d2d2d7)",
                    borderRadius: 8,
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                  }}
                >
                  <option value="None">None</option>
                  <option value="CBT Group Therapy">CBT Group Therapy</option>
                  <option value="Medication Management">Medication Management</option>
                  <option value="Individual Counseling">Individual Counseling</option>
                  <option value="Intensive Outpatient Program (IOP)">Intensive Outpatient Program (IOP)</option>
                </select>
                <span className="material-symbols-outlined" style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  fontSize: 20,
                  color: "#86868b",
                }}>
                  expand_more
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Tags Section */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-on-surface-variant, #86868b)", display: "block", marginBottom: 8 }}>TAGS</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            
            {tags.map((tag) => (
              <span key={tag} style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 16,
                backgroundColor: "#e8f0fe",
                color: "#1a73e8",
                fontSize: 12,
                fontWeight: 600,
              }}>
                {tag}
                <span
                  onClick={() => handleRemoveTag(tag)}
                  className="material-symbols-outlined"
                  style={{ fontSize: 14, cursor: "pointer", fontWeight: 700 }}
                >
                  close
                </span>
              </span>
            ))}

            {isAddingTag ? (
              <form onSubmit={handleAddTagSubmit} style={{ display: "inline-flex" }}>
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Tag name..."
                  autoFocus
                  onBlur={() => setIsAddingTag(false)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 12,
                    border: "1px solid #1a73e8",
                    fontSize: 12,
                    outline: "none",
                  }}
                />
              </form>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  color: "#1a73e8",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "6px 8px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Add Tag
              </button>
            )}

          </div>
        </div>

      </div>

      {/* ── Card 2: Note Editor ─────────────────────────────────────────── */}
      <div style={{
        background: "var(--color-surface-container-lowest, #ffffff)",
        border: "1px solid var(--color-outline-variant, #e5e5e7)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        
        {/* Editor Toolbar */}
        <div style={{
          backgroundColor: "#f5f6f8",
          borderBottom: "1px solid var(--color-outline-variant, #e5e5e7)",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          
          {/* Format Tools */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            
            {/* Style Group */}
            <div style={{ display: "flex", borderRadius: 6, border: "1px solid #d2d2d7", backgroundColor: "#ffffff", overflow: "hidden" }}>
              {["format_bold", "format_italic", "format_underlined", "format_strikethrough"].map((tool) => (
                <button
                  key={tool}
                  style={{
                    padding: "6px 10px",
                    border: "none",
                    borderRight: tool === "format_strikethrough" ? "none" : "1px solid #d2d2d7",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#515154" }}>{tool}</span>
                </button>
              ))}
            </div>

            {/* List Group */}
            <div style={{ display: "flex", borderRadius: 6, border: "1px solid #d2d2d7", backgroundColor: "#ffffff", overflow: "hidden" }}>
              {["format_list_bulleted", "format_list_numbered"].map((tool) => (
                <button
                  key={tool}
                  style={{
                    padding: "6px 10px",
                    border: "none",
                    borderRight: tool === "format_list_numbered" ? "none" : "1px solid #d2d2d7",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#515154" }}>{tool}</span>
                </button>
              ))}
            </div>

            <div style={{ width: 1, height: 24, backgroundColor: "#d2d2d7" }} />

            {/* Template Button */}
            <button
              onClick={handleInsertTemplate}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #d2d2d7",
                backgroundColor: "#ffffff",
                fontSize: 12,
                fontWeight: 600,
                color: "#1d1d1f",
                cursor: "pointer",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>feed</span>
              Insert Clinical Template
            </button>

            {/* Recording Button (Speech-to-Text) */}
            <button
              onClick={() => setIsDictating(!isDictating)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                border: isDictating ? "1px solid #b3261e" : "1px solid #d2d2d7",
                backgroundColor: isDictating ? "#fce8e8" : "#ffffff",
                fontSize: 12,
                fontWeight: 600,
                color: isDictating ? "#b3261e" : "#1d1d1f",
                cursor: "pointer",
                transition: "all 0.15s ease-in-out",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: isDictating ? "#b3261e" : "#1d1d1f" }}>
                {isDictating ? "mic" : "mic_none"}
              </span>
              {isDictating ? "Dictating..." : "Dictate Note"}
              {isDictating && (
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#b3261e",
                  display: "inline-block",
                  marginLeft: 2,
                  animation: "pulse 1.2s infinite",
                }} />
              )}
            </button>

            <style>{`
              @keyframes pulse {
                0% { transform: scale(0.95); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.4; }
                100% { transform: scale(0.95); opacity: 1; }
              }
            `}</style>

          </div>

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#86868b" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#137333" }}>cloud_done</span>
            {saveStatus}
          </div>

        </div>

        {/* Text Editor Area */}
        <div style={{ padding: "24px 32px" }}>
          <textarea
            value={editorText}
            onChange={(e) => {
              setEditorText(e.target.value);
              setSaveStatus("Saving...");
              setSaveCounter(60);
            }}
            style={{
              width: "100%",
              height: "320px",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 14,
              fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
              lineHeight: "1.7",
              color: "#1d1d1f",
              backgroundColor: "transparent",
            }}
            placeholder="Type clinical notes here..."
          />
        </div>

      </div>

      {/* ── Footer Actions ──────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
      }}>
        
        <button
          onClick={handleDiscard}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            color: "#b3261e",
            cursor: "pointer",
          }}
        >
          Discard
        </button>

        <div style={{ display: "flex", gap: 12 }}>
          
          <button
            onClick={() => handleSaveNote(false)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid #d2d2d7",
              backgroundColor: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              color: "#1d1d1f",
              cursor: "pointer",
              transition: "background 0.12s",
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f5f5f7"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
          >
            Save Draft
          </button>

          <button
            onClick={() => handleSaveNote(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#0d47a1",
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
              cursor: "pointer",
              transition: "opacity 0.12s",
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
            Sign & Lock Note
          </button>

        </div>

      </div>

    </div>
  );
}
