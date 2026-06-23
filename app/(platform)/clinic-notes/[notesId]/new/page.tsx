"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SetPinModal, VerifyPinModal } from "@/components/PinModal";
import { useAuth } from "@/lib/auth/AuthContext";

export default function NewClinicNotePage() {
  const params = useParams();
  const router = useRouter();
  const notesId = params.notesId as string; // folderId
  const { user } = useAuth();

  // Patient & Program States
  const [patient, setPatient] = useState<{ name: string; dob: string; id: string } | null>(null);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // PIN Modals State
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showVerifyPinModal, setShowVerifyPinModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("Initial Intake Assessment");
  const [noteType, setNoteType] = useState("Intake Session");
  const [program, setProgram] = useState("None");
  const [tags, setTags] = useState<string[]>(["#CBT", "#Anxiety"]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Editor state
  const [editorText, setEditorText] = useState(
    "Chief Complaint: Patient presents with increased feelings of general anxiety over the past 3 weeks.\n\n" +
    "Subjective: Patient reports difficulty sleeping, racing thoughts, and physical symptoms of tension in the neck and shoulders. Rates current anxiety level at 7/10.\n\n" +
    "Objective: Patient appears restless, frequently shifting in seat. Speech is slightly accelerated but coherent and goal-directed. Affect is anxious but congruent."
  );

  // Autosave status state
  const [saveStatus, setSaveStatus] = useState("Draft");

  // Dictation States (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSpeechSupported(true);
      }
    }
  }, []);

  // Stop listening when unmounting
  useEffect(() => {
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
    };
  }, [recognition]);

  const toggleListening = () => {
    if (isListening) {
      if (recognition) {
        recognition.stop();
      }
      setIsListening(false);
    } else {
      const SpeechRecognition = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
      if (!SpeechRecognition) return;

      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          if (transcript) {
            setEditorText((prev) => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${transcript.trim()}` : transcript.trim();
            });
          }
        };

        rec.onerror = (event: any) => {
          if (event.error !== "no-speech" && event.error !== "aborted") {
            console.warn("Speech recognition warning:", event.error);
          }
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.start();
        setRecognition(rec);
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Fetch Patient folder and Programs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch folder/patient
        const folderRes = await fetch(`/api/folders/${notesId}`);
        if (folderRes.ok) {
          const folderData = await folderRes.json();
          setPatient({
            id: folderData.patient.id,
            name: `${folderData.patient.lastname}, ${folderData.patient.firstname}`,
            dob: new Date(folderData.patient.dateOfBirth).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })
          });
        }

        // 2. Fetch active programs
        const programsRes = await fetch("/api/programs");
        if (programsRes.ok) {
          const programsData = await programsRes.json();
          setProgramsList(programsData.programs || []);
        }

      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [notesId]);

  // Insert Template handler
  const handleInsertTemplate = () => {
    const template = 
      "\n\n--- CLINICAL TEMPLATE ---" +
      "\nAssessment / Diagnosis Refinement: Patient exhibits symptoms consistent with anxiety/mood triggers." +
      "\nPlan & Interventions:" +
      "\n1. Cognitive Restructuring practice." +
      "\n2. Monitor daily behavioral activation triggers.";
    setEditorText((prev) => prev + template);
  };

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
  const handleSaveNoteClick = (isLocked: boolean) => {
    if (!editorText.trim()) {
      alert("Note content cannot be empty.");
      return;
    }

    if (isLocked) {
      if (!user?.hasPin) {
        setShowSetPinModal(true);
      } else {
        setShowVerifyPinModal(true);
      }
    } else {
      completeSaveNote(false);
    }
  };

  const completeSaveNote = async (isLocked: boolean) => {
    try {
      setSaving(true);
      const res = await fetch("/api/clinic-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: notesId,
          title: title || "Untitled Clinical Note",
          noteType,
          program,
          tags,
          content: editorText,
          status: isLocked ? "SIGNED" : "DRAFT"
        })
      });

      if (res.ok) {
        router.push(`/clinic-notes/${notesId}`);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save clinic note.");
      }
    } catch (err) {
      console.error("Save note error:", err);
      alert("An error occurred while saving the note.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24, fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)" }}>Loading page...</div>;
  }

  if (!patient) {
    return <div style={{ padding: 24, fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)" }}>Folder or Patient record not found.</div>;
  }

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
                  {programsList.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.type})
                    </option>
                  ))}
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
                  type="button"
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
                  type="button"
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
              type="button"
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

            {/* Speech-to-Text Button */}
            {isSpeechSupported && (
              <button
                onClick={toggleListening}
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: isListening ? "1px solid #b3261e" : "1px solid #d2d2d7",
                  backgroundColor: isListening ? "#fce8e8" : "#ffffff",
                  fontSize: 12,
                  fontWeight: 600,
                  color: isListening ? "#b3261e" : "#1d1d1f",
                  cursor: "pointer",
                  transition: "all 0.15s ease-in-out",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: isListening ? "#b3261e" : "#1d1d1f" }}>
                  {isListening ? "mic" : "mic_none"}
                </span>
                {isListening ? "Dictating..." : "Dictate Note"}
                {isListening && (
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
            )}

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
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-primary)" }}>info</span>
            {saveStatus}
          </div>

        </div>

        {/* Text Editor Area */}
        <div style={{ padding: "24px 32px" }}>
          <textarea
            value={editorText}
            onChange={(e) => {
              setEditorText(e.target.value);
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
            onClick={() => handleSaveNoteClick(false)}
            disabled={saving}
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
              opacity: saving ? 0.7 : 1
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f5f5f7"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
          >
            Save Draft
          </button>

          <button
            onClick={() => handleSaveNoteClick(true)}
            disabled={saving}
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
              opacity: saving ? 0.7 : 1
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
            {saving ? "Signing..." : "Sign & Save Note"}
          </button>

        </div>

      </div>

      {/* PIN Modals */}
      {showSetPinModal && (
        <SetPinModal
          onClose={() => setShowSetPinModal(false)}
          onSuccess={() => {
            setShowSetPinModal(false);
            // Refresh user session state so hasPin changes to true
            if (user) user.hasPin = true;
            completeSaveNote(true);
          }}
        />
      )}
      {showVerifyPinModal && (
        <VerifyPinModal
          onClose={() => setShowVerifyPinModal(false)}
          onSuccess={() => {
            setShowVerifyPinModal(false);
            completeSaveNote(true);
          }}
        />
      )}

    </div>
  );
}
