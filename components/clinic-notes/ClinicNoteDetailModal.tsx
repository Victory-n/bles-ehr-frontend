"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { computeDiff, DiffChunk } from "@/lib/utils/diff";
import { SetPinModal, VerifyPinModal } from "@/components/PinModal";
import { cleanMarkdownToPlainText } from "@/utils/formatters";

interface UserInfo {
  id: string;
  firstname: string;
  lastname: string;
  role: number;
  staffId: string;
}

interface NoteVersion {
  id: string;
  version: number;
  title: string;
  noteType: string;
  program: string | null;
  tags: any; // string or array
  content: string;
  status: "DRAFT" | "SIGNED" | "LOCKED" | string;
  editSummary: string | null;
  createdAt: string;
  editedBy: UserInfo;
  signedBy: UserInfo | null;
  signedAt: string | null;
  cosignedBy: UserInfo | null;
  cosignedAt: string | null;
}

interface NoteData {
  id: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  versions: NoteVersion[];
}

interface ClinicNoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  patient: any;
  onUpdate?: () => void;
}

async function getResponseError(res: Response, defaultMsg: string): Promise<string> {
  const status = res.status;
  const statusText = res.statusText;
  let bodyText = "";
  try {
    bodyText = await res.text();
    try {
      const parsed = JSON.parse(bodyText);
      if (parsed && parsed.message) {
        return `${parsed.message} (Status: ${status})`;
      }
    } catch (_) {}
  } catch (_) {}

  const cleanBody = bodyText 
    ? bodyText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150) 
    : "";
  return `${defaultMsg} (Status: ${status} ${statusText})${cleanBody ? ` | Details: ${cleanBody}` : ""}`;
}

export default function ClinicNoteDetailModal({
  isOpen,
  onClose,
  documentId,
  patient,
  onUpdate,
}: ClinicNoteDetailModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteData, setNoteData] = useState<NoteData | null>(null);

  // Form State
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState("");
  const [program, setProgram] = useState("None");
  const [tags, setTags] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // History & Diff State
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [showDiffMode, setShowDiffMode] = useState(false);

  // Lists
  const [programsList, setProgramsList] = useState<any[]>([]);

  // PIN Modals State
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showVerifyPinModal, setShowVerifyPinModal] = useState(false);
  const [pinActionType, setPinActionType] = useState<"sign" | "cosign" | null>(null);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<any>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // AI & Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecordingId, setSelectedRecordingId] = useState("");

  // Setup speech recognition check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSpeechSupported(true);
      }
    }
  }, []);

  // Stop listening when unmounting or modal closes
  useEffect(() => {
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) { }
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
            setContent((prev) => {
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

  // Fetch programs list on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch("/api/programs");
        if (res.ok) {
          const data = await res.json();
          setProgramsList(data.programs || []);
        }
      } catch (e) {
        console.error("Failed to fetch programs", e);
      }
    };
    if (isOpen) {
      fetchPrograms();
    }
  }, [isOpen]);

  const fetchNote = async () => {
    if (!documentId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/clinic-notes/${documentId}`);
      if (res.ok) {
        const data = await res.json();
        setNoteData(data.clinicNote);
        if (data.clinicNote && data.clinicNote.versions.length > 0) {
          const latest = data.clinicNote.versions[0];
          setContent(latest.content);
          setTitle(latest.title);
          setNoteType(latest.noteType);
          setProgram(latest.program || "None");

          try {
            setTags(typeof latest.tags === "string" ? JSON.parse(latest.tags) : latest.tags || []);
          } catch (e) {
            setTags([]);
          }

          setSelectedVersionId(latest.id);
          setIsEditing(latest.status === "DRAFT");
        } else {
          setContent("");
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error("Error fetching clinic note:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && documentId) {
      fetchNote();
    }
  }, [isOpen, documentId]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [recordingInterval]);

  // Fetch AI Templates when modal opens
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.templates || []);
          if (data.templates.length > 0) {
            setSelectedTemplateId(data.templates[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to fetch templates", e);
      }
    };
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      setAudioChunks([]);
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingSeconds(0);

      const interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    const recordingsFolder = patient?.folders?.find(
      (f: any) => f.name.toLowerCase().includes("session") || f.name.toLowerCase().includes("recording")
    );
    if (!recordingsFolder) {
      alert("Error: 'Session Recordings' folder not found. Please refresh.");
      return;
    }

    try {
      setIsUploadingAudio(true);
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentName", `Live Session - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);

      const res = await fetch(`/api/folders/${recordingsFolder.folderId}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        if (onUpdate) onUpdate(); // Refresh patient folders
        alert("Session audio recorded and uploaded successfully!");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to upload recording.");
      }
    } catch (e) {
      console.error("Audio upload error:", e);
      alert("Failed to upload audio recording.");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // AI Generation Handler
  const handleAIGenerate = async () => {
    if (!selectedRecordingId) {
      alert("Please record or select an audio recording first.");
      return;
    }
    if (!selectedTemplateId) {
      alert("Please select a clinical template.");
      return;
    }

    try {
      setIsGenerating(true);

      // Extract current recordings documents list
      const recordingsFolder = patient?.folders?.find(
        (f: any) => f.name.toLowerCase().includes("session") || f.name.toLowerCase().includes("recording")
      );
      const availableRecs = recordingsFolder?.documents || [];
      const activeRec = availableRecs.find((r: any) => r.id === selectedRecordingId);

      let transcript = activeRec?.transcript;

      // Step 1: Transcribe audio if needed
      if (!transcript) {
        setIsTranscribing(true);
        const transcribeRes = await fetch(`/api/documents/${selectedRecordingId}/transcribe`, {
          method: "POST",
        });
        if (!transcribeRes.ok) {
          const errMsg = await getResponseError(transcribeRes, "Transcription failed.");
          throw new Error(errMsg);
        }
        const transcribeData = await transcribeRes.json().catch(() => ({}));
        transcript = transcribeData.transcript;
        if (!transcript) {
          throw new Error("No transcript was returned from the server.");
        }
        setIsTranscribing(false);
        if (onUpdate) onUpdate();
      }

      // Step 2: Generate clinical note
      const generateRes = await fetch(`/api/documents/${selectedRecordingId}/generate-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplateId }),
      });

      if (!generateRes.ok) {
        const errMsg = await getResponseError(generateRes, "Note generation failed.");
        throw new Error(errMsg);
      }

      const generateData = await generateRes.json().catch(() => ({}));
      if (!generateData.note) {
        throw new Error("No note content was returned from the server.");
      }

      const cleanedNote = cleanMarkdownToPlainText(generateData.note);
      if (content.trim()) {
        const confirmReplace = window.confirm("Do you want to replace the current editor content with the AI-generated note?");
        if (confirmReplace) {
          setContent(cleanedNote);
        }
      } else {
        setContent(cleanedNote);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during note generation.");
    } finally {
      setIsGenerating(false);
      setIsTranscribing(false);
    }
  };

  // Helper to find recordings in current folder prop
  const recordingsFolder = patient?.folders?.find(
    (f: any) => f.name.toLowerCase().includes("session") || f.name.toLowerCase().includes("recording")
  );
  const availableRecordings = recordingsFolder?.documents || [];

  // Auto-select latest recording when available
  useEffect(() => {
    if (availableRecordings.length > 0 && !selectedRecordingId) {
      setSelectedRecordingId(availableRecordings[0].id);
    }
  }, [availableRecordings, selectedRecordingId]);

  const handleSave = async () => {
    if (!content.trim()) {
      alert("Note content cannot be empty.");
      return;
    }
    if (!title.trim()) {
      alert("Note title cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/clinic-notes/${documentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          title,
          noteType,
          program,
          tags,
          editSummary: editSummary.trim() || undefined,
        }),
      });

      if (res.ok) {
        setEditSummary("");
        await fetchNote();
        if (onUpdate) onUpdate();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save note.");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("An error occurred while saving the note.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignClick = () => {
    setPinActionType("sign");
    if (!user?.hasPin) {
      setShowSetPinModal(true);
    } else {
      setShowVerifyPinModal(true);
    }
  };

  const handleCosignClick = () => {
    setPinActionType("cosign");
    if (!user?.hasPin) {
      setShowSetPinModal(true);
    } else {
      setShowVerifyPinModal(true);
    }
  };

  const completeSign = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/clinic-notes/${documentId}/sign`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchNote();
        if (onUpdate) onUpdate();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to sign note.");
      }
    } catch (error) {
      console.error("Error signing note:", error);
    } finally {
      setSaving(false);
    }
  };

  const completeCosign = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/clinic-notes/${documentId}/cosign`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchNote();
        if (onUpdate) onUpdate();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to co-sign note.");
      }
    } catch (error) {
      console.error("Error co-signing note:", error);
    } finally {
      setSaving(false);
    }
  };

  const startAmendment = () => {
    const confirmed = window.confirm(
      "Amending this note will create a new draft version (e.g. v2). The previous signed/locked versions will remain frozen in the history log. Do you want to proceed?"
    );
    if (!confirmed) return;

    setIsEditing(true);
    setEditSummary(`Amendment to version v${latestVersion?.version || 1}`);
  };



  // Add Tag
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

  const latestVersion = noteData && noteData.versions.length > 0 ? noteData.versions[0] : null;
  const isLatestSelected = latestVersion && selectedVersionId === latestVersion.id;

  // Selected Version details
  const selectedVersion = noteData?.versions.find((v) => v.id === selectedVersionId);

  // Compute diff against previous version
  let diffChunks: DiffChunk[] = [];
  let prevVersion: NoteVersion | undefined;
  if (selectedVersion && noteData) {
    const currentIndex = noteData.versions.findIndex((v) => v.id === selectedVersion.id);
    prevVersion = noteData.versions[currentIndex + 1];
    if (prevVersion) {
      diffChunks = computeDiff(prevVersion.content, selectedVersion.content);
    }
  }

  // Permission checks
  const isAdmin = user?.role === 1;
  const isPrimarySigner = latestVersion?.signedBy?.id === user?.id;
  const canCoSign = isAdmin && latestVersion?.status === "SIGNED" && !isPrimarySigner;
  const canAmend = isAdmin && (latestVersion?.status === "SIGNED" || latestVersion?.status === "LOCKED");

  // Status Styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "DRAFT":
        return { bg: "#e8f0fe", color: "#1a73e8" };
      case "SIGNED":
        return { bg: "#fff8e1", color: "#f57f17" };
      case "LOCKED":
        return { bg: "#e6f4ea", color: "#137333" };
      default:
        return { bg: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" };
    }
  };

  if (!isOpen) return null;

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
          zIndex: 9999,
          transition: "opacity 0.2s ease",
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes mic-pulse {
          0% { transform: scale(1); box-shadow: 0 4px 12px rgba(234, 67, 53, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 4px 20px rgba(234, 67, 53, 0.7); }
          100% { transform: scale(1); box-shadow: 0 4px 12px rgba(234, 67, 53, 0.4); }
        }
        .mic-active {
          animation: mic-pulse 1.5s infinite ease-in-out !important;
        }
      `}} />

      {/* Slide-over Container */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "90%",
          maxWidth: "1200px",
          backgroundColor: "#ffffff",
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.15)",
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
          color: "#1d1d1f",
          animation: "slideIn 0.3s ease-out forwards",
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid #e5e5e7",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#86868b" }}>description</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#86868b" }}>Clinic Note Details</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#86868b" }} />

            {latestVersion && (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 600,
                background: getStatusStyle(latestVersion.status).bg,
                color: getStatusStyle(latestVersion.status).color,
              }}>
                {latestVersion.status} (v{latestVersion.version})
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1d1d1f",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 36,
                color: "var(--color-primary)",
                animation: "spin 1s linear infinite",
              }}
            >
              progress_activity
            </span>
            <span style={{ fontSize: 14, color: "var(--color-on-surface-variant)", marginTop: 12 }}>
              Loading Clinical Note...
            </span>
          </div>
        ) : (
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 380px", overflow: "hidden" }}>

            {/* LEFT SIDE: Content and Fields */}
            <div style={{ display: "flex", flexDirection: "column", padding: "24px 32px", overflowY: "auto", gap: 20 }}>

              {/* Alert for amendment */}
              {isEditing && latestVersion && (latestVersion.status === "SIGNED" || latestVersion.status === "LOCKED") && (
                <div style={{
                  background: "#fff3cd",
                  border: "1px solid #ffeeba",
                  color: "#856404",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>
                  <span>
                    Creating a new version draft (v{latestVersion.version + 1}). The active signed note will remain active until this new draft is signed.
                  </span>
                </div>
              )}

              {/* Editable Fields (Only if isEditing is true) */}
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, borderBottom: "1px solid #e5e5e7", paddingBottom: 20 }}>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

                    {/* Note Title */}
                    <div style={{ flex: 1.2, minWidth: 260 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#86868b", display: "block", marginBottom: 6 }}>NOTE TITLE</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{
                          width: "100%",
                          fontSize: 20,
                          fontWeight: 700,
                          color: "#1d1d1f",
                          border: "none",
                          borderBottom: "1px solid #d2d2d7",
                          padding: "4px 0",
                          outline: "none",
                          background: "transparent",
                        }}
                      />
                    </div>

                    {/* Note Type & Program */}
                    <div style={{ flex: 2, display: "flex", gap: 12, minWidth: 320 }}>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#86868b", display: "block", marginBottom: 6 }}>NOTE TYPE</label>
                        <select
                          value={noteType}
                          onChange={(e) => setNoteType(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            fontSize: 13,
                            fontWeight: 500,
                            borderRadius: 6,
                            border: "1px solid #d2d2d7",
                            outline: "none",
                          }}
                        >
                          <option value="Intake Session">Intake Session</option>
                          <option value="Progress Note">Progress Note</option>
                          <option value="Group Therapy Note">Group Therapy Note</option>
                          <option value="Assessment Summary">Assessment Summary</option>
                        </select>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#86868b", display: "block", marginBottom: 6 }}>PROGRAMS</label>
                        <select
                          value={program}
                          onChange={(e) => setProgram(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            fontSize: 13,
                            fontWeight: 500,
                            borderRadius: 6,
                            border: "1px solid #d2d2d7",
                            outline: "none",
                          }}
                        >
                          <option value="None">None</option>
                          {programsList.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#86868b", display: "block", marginBottom: 6 }}>TAGS</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      {tags.map((tag) => (
                        <span key={tag} style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 10px",
                          borderRadius: 12,
                          backgroundColor: "#e8f0fe",
                          color: "#1a73e8",
                          fontSize: 11,
                          fontWeight: 600,
                        }}>
                          {tag}
                          <span onClick={() => handleRemoveTag(tag)} className="material-symbols-outlined" style={{ fontSize: 12, cursor: "pointer" }}>close</span>
                        </span>
                      ))}

                      {isAddingTag ? (
                        <form onSubmit={handleAddTagSubmit} style={{ display: "inline-flex" }}>
                          <input
                            type="text"
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            placeholder="Tag..."
                            autoFocus
                            onBlur={() => setIsAddingTag(false)}
                            style={{
                              padding: "2px 8px",
                              borderRadius: 8,
                              border: "1px solid #1a73e8",
                              fontSize: 11,
                              outline: "none",
                            }}
                          />
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsAddingTag(true)}
                          style={{
                            border: "none",
                            background: "none",
                            color: "#1a73e8",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 2
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                          Add Tag
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                // View Mode Metadata Details
                <div style={{ display: "flex", flexDirection: "column", gap: 12, borderBottom: "1px solid #e5e5e7", paddingBottom: 16 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                    {selectedVersion?.title || "Untitled Note"}
                  </h1>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 13, color: "#515154" }}>
                    <span>Type: <strong style={{ color: "#1d1d1f" }}>{selectedVersion?.noteType}</strong></span>
                    <span style={{ color: "#d2d2d7" }}>|</span>
                    <span>Program: <strong style={{ color: "#1d1d1f" }}>{selectedVersion?.program || "None"}</strong></span>
                    <span style={{ color: "#d2d2d7" }}>|</span>
                    <span>Author: <strong style={{ color: "#1d1d1f" }}>{selectedVersion?.editedBy.firstname} {selectedVersion?.editedBy.lastname}</strong></span>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {tags.map(tag => (
                      <span key={tag} style={{
                        padding: "3px 10px",
                        borderRadius: 12,
                        backgroundColor: "#f5f5f7",
                        color: "#515154",
                        fontSize: 11,
                        fontWeight: 500,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Editor Toolbar (Only if isEditing is true) */}
              {isEditing && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "6px 12px",
                  backgroundColor: "#f5f6f8",
                  borderRadius: 8,
                  border: "1px solid #e5e5e7",
                }}>
                  {/* Template Dropdown */}
                  <select
                    onChange={(e) => {
                      const t = templates.find((temp: any) => temp.id === e.target.value);
                      if (t) {
                        const cleanStructure = cleanMarkdownToPlainText(t.structure);
                        setContent((prev) => prev + (prev.trim() ? "\n\n" : "") + cleanStructure);
                      }
                      e.target.value = "";
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "6px 10px",
                      fontSize: 11,
                      borderRadius: 6,
                      border: "1px solid #d2d2d7",
                      backgroundColor: "#ffffff",
                      color: "#1d1d1f",
                      fontWeight: 600,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">Insert Template...</option>
                    {templates.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  {isSpeechSupported && (
                    <button
                      onClick={toggleListening}
                      type="button"
                      className={isListening ? "mic-active" : ""}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: isListening ? "1px solid #b3261e" : "1px solid #d2d2d7",
                        backgroundColor: isListening ? "#fce8e8" : "#ffffff",
                        fontSize: 11,
                        fontWeight: 600,
                        color: isListening ? "#b3261e" : "#1d1d1f",
                        cursor: "pointer",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                        {isListening ? "mic" : "mic_none"}
                      </span>
                      {isListening ? "Listening..." : "Dictate Note"}
                    </button>
                  )}
                </div>
              )}

              {/* AI Clinical Assistant Card (Only in edit mode) */}
              {isEditing && (
                <div style={{
                  background: "linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)",
                  border: "1px solid #d1c4e9",
                  borderRadius: 12,
                  padding: "18px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  boxShadow: "0 2px 8px rgba(103, 58, 183, 0.08)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ color: "#673ab7", fontSize: 22 }}>psychology</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#4a148c", letterSpacing: "0.03em" }}>AI CLINICAL ASSISTANT</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {/* Left: Audio Recorder */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, borderRight: "1px solid #d1c4e9", paddingRight: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#512da8" }}>1. SESSION RECORDING</span>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {isRecording ? (
                          <button
                            onClick={stopRecording}
                            type="button"
                            className="mic-active"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "8px 14px",
                              borderRadius: 8,
                              border: "none",
                              backgroundColor: "#ea4335",
                              color: "#ffffff",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>stop</span>
                            Stop & Upload ({Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')})
                          </button>
                        ) : (
                          <button
                            onClick={startRecording}
                            type="button"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "8px 14px",
                              borderRadius: 8,
                              border: "1px solid #673ab7",
                              backgroundColor: "#ffffff",
                              color: "#673ab7",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "background 0.12s",
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#f3e5f5"; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mic</span>
                            Record Live Audio
                          </button>
                        )}

                        {isUploadingAudio && (
                          <span style={{ fontSize: 11, color: "#673ab7", display: "flex", alignItems: "center", gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, animation: "spin 1s linear infinite" }}>progress_activity</span>
                            Uploading...
                          </span>
                        )}
                      </div>

                      {/* Select existing recording */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                        <label style={{ fontSize: 10, fontWeight: 600, color: "#512da8" }}>OR SELECT RECORDING</label>
                        <select
                          value={selectedRecordingId}
                          onChange={(e) => setSelectedRecordingId(e.target.value)}
                          style={{
                            padding: "6px 10px",
                            fontSize: 12,
                            borderRadius: 6,
                            border: "1px solid #d1c4e9",
                            outline: "none",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <option value="">-- Choose Recording --</option>
                          {availableRecordings.map((r: any) => (
                            <option key={r.id} value={r.id}>
                              {r.name} {r.transcript ? "✓" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Right: AI Note Generator */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#512da8" }}>2. TEMPLATE & GENERATION</span>

                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label style={{ fontSize: 10, fontWeight: 600, color: "#512da8" }}>SELECT TEMPLATE</label>
                        <select
                          value={selectedTemplateId}
                          onChange={(e) => setSelectedTemplateId(e.target.value)}
                          style={{
                            padding: "6px 10px",
                            fontSize: 12,
                            borderRadius: 6,
                            border: "1px solid #d1c4e9",
                            outline: "none",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <option value="">-- Choose Template --</option>
                          {templates.map((t: any) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleAIGenerate}
                        disabled={isGenerating || !selectedRecordingId || !selectedTemplateId}
                        type="button"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "10px 16px",
                          borderRadius: 8,
                          border: "none",
                          backgroundColor: (!selectedRecordingId || !selectedTemplateId) ? "#d1c4e9" : "#673ab7",
                          color: "#ffffff",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: (!selectedRecordingId || !selectedTemplateId) ? "not-allowed" : "pointer",
                          boxShadow: "0 2px 4px rgba(103, 58, 183, 0.2)",
                          marginTop: "auto",
                          opacity: isGenerating ? 0.8 : 1,
                        }}
                      >
                        {isGenerating ? (
                          <>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, animation: "spin 1s linear infinite" }}>progress_activity</span>
                            {isTranscribing ? "Transcribing Audio..." : "Generating Note..."}
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>magic_button</span>
                            Generate Note from AI
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Note Content Area */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#86868b" }}>
                  NOTE CONTENT
                </label>

                {isEditing ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter clinical observations..."
                    disabled={saving}
                    style={{
                      flex: 1,
                      minHeight: 240,
                      borderRadius: 8,
                      border: "1px solid #d2d2d7",
                      padding: 16,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "#1d1d1f",
                      resize: "none",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <div style={{
                    flex: 1,
                    minHeight: 240,
                    borderRadius: 8,
                    border: "1px solid #e5e5e7",
                    background: "#f9f9fb",
                    padding: 16,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#1d1d1f",
                    whiteSpace: "pre-wrap",
                    overflowY: "auto",
                  }}>
                    {showDiffMode && prevVersion ? (
                      <div>
                        {diffChunks.map((chunk, idx) => {
                          if (chunk.added) {
                            return (
                              <span key={idx} style={{ background: "#e6f4ea", color: "#137333", textDecoration: "underline", padding: "2px 4px", borderRadius: 4, fontWeight: 500 }}>
                                {chunk.value}
                              </span>
                            );
                          }
                          if (chunk.removed) {
                            return (
                              <span key={idx} style={{ background: "#fce8e8", color: "#c5221f", textDecoration: "line-through", padding: "2px 4px", borderRadius: 4 }}>
                                {chunk.value}
                              </span>
                            );
                          }
                          return <span key={idx}>{chunk.value}</span>;
                        })}
                      </div>
                    ) : (
                      selectedVersion?.content || "No content."
                    )}
                  </div>
                )}

                {/* Edit Reason input */}
                {isEditing && latestVersion && (latestVersion.status === "SIGNED" || latestVersion.status === "LOCKED") && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#86868b" }}>
                      AMENDMENT / CHANGE REASON
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Corrected date or expanded assessment detail"
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      disabled={saving}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid #d2d2d7",
                        fontSize: 13,
                        outline: "none",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons Panel */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "auto",
                paddingTop: 16,
                borderTop: "1px solid #e5e5e7",
              }}>
                <div>
                  {!isEditing && prevVersion && (
                    <button
                      onClick={() => setShowDiffMode(!showDiffMode)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: showDiffMode ? "#e8f0fe" : "none",
                        border: "1px solid #d2d2d7",
                        color: showDiffMode ? "#1a73e8" : "#1d1d1f",
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>difference</span>
                      {showDiffMode ? "Hide Diff" : "Show Diff vs Previous"}
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  {isEditing ? (
                    <>
                      {latestVersion && (
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setContent(latestVersion.content);
                            setTitle(latestVersion.title);
                            setNoteType(latestVersion.noteType);
                            setProgram(latestVersion.program || "None");
                            try {
                              setTags(typeof latestVersion.tags === "string" ? JSON.parse(latestVersion.tags) : latestVersion.tags || []);
                            } catch (e) {
                              setTags([]);
                            }
                          }}
                          disabled={saving}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1px solid #d2d2d7",
                            background: "transparent",
                            color: "#515154",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "none",
                          background: "#0d47a1",
                          color: "#ffffff",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          opacity: saving ? 0.7 : 1,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
                        {saving ? "Saving..." : "Save Draft"}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Amend button */}
                      {canAmend && (
                        <button
                          onClick={startAmendment}
                          disabled={saving}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1px solid #d2d2d7",
                            background: "transparent",
                            color: "#1d1d1f",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_note</span>
                          Amend Note
                        </button>
                      )}

                      {/* Primary sign button */}
                      {isLatestSelected && latestVersion.status === "DRAFT" && (
                        <button
                          onClick={handleSignClick}
                          disabled={saving}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: "#0d47a1",
                            color: "#ffffff",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            opacity: saving ? 0.7 : 1,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>draw</span>
                          Sign Note
                        </button>
                      )}

                      {/* Co-sign button */}
                      {isLatestSelected && canCoSign && (
                        <button
                          onClick={handleCosignClick}
                          disabled={saving}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: "#137333",
                            color: "#ffffff",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            opacity: saving ? 0.7 : 1,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified_user</span>
                          Co-sign & Lock
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: Version History Log */}
            <div style={{
              background: "#f5f6f8",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              borderLeft: "1px solid #e5e5e7",
            }}>
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e5e5e7",
                background: "#f5f6f8",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#1d1d1f" }}>
                  Version History Log
                </h4>
                <p style={{ fontSize: 11, color: "#86868b", margin: "4px 0 0 0" }}>
                  Full revision history is tracked here.
                </p>
              </div>

              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                {!noteData || noteData.versions.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#86868b", textAlign: "center", marginTop: 20 }}>
                    No version history available.
                  </p>
                ) : (
                  noteData.versions.map((ver) => {
                    const isSelected = selectedVersionId === ver.id;
                    const verStatusStyle = getStatusStyle(ver.status);
                    const formattedDate = new Date(ver.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={ver.id}
                        onClick={() => {
                          setSelectedVersionId(ver.id);
                          setShowDiffMode(false);
                          if (ver.status !== "DRAFT") {
                            setIsEditing(false);
                            setContent(ver.content);
                            setTitle(ver.title);
                            setNoteType(ver.noteType);
                            setProgram(ver.program || "None");
                            try {
                              setTags(typeof ver.tags === "string" ? JSON.parse(ver.tags) : ver.tags || []);
                            } catch (e) {
                              setTags([]);
                            }
                          } else {
                            setIsEditing(true);
                            setContent(ver.content);
                            setTitle(ver.title);
                            setNoteType(ver.noteType);
                            setProgram(ver.program || "None");
                            try {
                              setTags(typeof ver.tags === "string" ? JSON.parse(ver.tags) : ver.tags || []);
                            } catch (e) {
                              setTags([]);
                            }
                          }
                        }}
                        style={{
                          border: isSelected
                            ? "2px solid #0d47a1"
                            : "1px solid #e5e5e7",
                          borderRadius: 10,
                          padding: 14,
                          background: isSelected ? "#ffffff" : "#fbfbfd",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {/* Title & Version info */}
                        <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f" }}>
                            Version v{ver.version}
                          </span>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: 8,
                            fontSize: 10,
                            fontWeight: 700,
                            background: verStatusStyle.bg,
                            color: verStatusStyle.color,
                          }}>
                            {ver.status}
                          </span>
                        </div>

                        {/* Editor and timestamp */}
                        <div style={{ fontSize: 12, color: "#515154", marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                            <span>
                              By: <b>{ver.editedBy.firstname} {ver.editedBy.lastname}</b>
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: "#86868b" }}>
                            {formattedDate}
                          </div>
                        </div>

                        {/* Reason / Summary */}
                        {ver.editSummary && (
                          <div style={{
                            fontSize: 11,
                            background: "#f5f5f7",
                            padding: "6px 8px",
                            borderRadius: 6,
                            color: "#515154",
                            marginBottom: 8,
                            fontStyle: "italic",
                          }}>
                            "{ver.editSummary}"
                          </div>
                        )}

                        {/* Signatures details */}
                        <div style={{
                          borderTop: "1px solid #e5e5e7",
                          paddingTop: 8,
                          marginTop: 8,
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          fontSize: 11,
                        }}>
                          {ver.signedBy ? (
                            <div style={{ color: "#137333", display: "flex", alignItems: "center", gap: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                              <span>Signed: {ver.signedBy.firstname} {ver.signedBy.lastname}</span>
                            </div>
                          ) : (
                            <div style={{ color: "#86868b", display: "flex", alignItems: "center", gap: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>pending</span>
                              <span>Unsigned</span>
                            </div>
                          )}

                          {ver.cosignedBy && (
                            <div style={{ color: "#137333", display: "flex", alignItems: "center", gap: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified</span>
                              <span>Locked: {ver.cosignedBy.firstname} {ver.cosignedBy.lastname}</span>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* PIN Modals */}
      {showSetPinModal && (
        <SetPinModal
          onClose={() => setShowSetPinModal(false)}
          onSuccess={() => {
            setShowSetPinModal(false);
            if (user) user.hasPin = true;
            if (pinActionType === "sign") completeSign();
            if (pinActionType === "cosign") completeCosign();
          }}
        />
      )}
      {showVerifyPinModal && (
        <VerifyPinModal
          onClose={() => setShowVerifyPinModal(false)}
          onSuccess={() => {
            setShowVerifyPinModal(false);
            if (pinActionType === "sign") completeSign();
            if (pinActionType === "cosign") completeCosign();
          }}
        />
      )}
    </>
  );
}
