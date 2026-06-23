"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { computeDiff, DiffChunk } from "@/lib/utils/diff";

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
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  versions: NoteVersion[];
}

interface SessionNoteModalProps {
  sessionId: string;
  sessionName: string;
  onClose: () => void;
  onNoteStatusChange?: (status: string) => void;
}

export default function SessionNoteModal({
  sessionId,
  sessionName,
  onClose,
  onNoteStatusChange,
}: SessionNoteModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteData, setNoteData] = useState<NoteData | null>(null);

  // Form State
  const [content, setContent] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // History & Diff State
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [showDiffMode, setShowDiffMode] = useState(false);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

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

  const fetchNote = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/sessions/${sessionId}/note`);
      if (res.ok) {
        const data = await res.json();
        setNoteData(data.note);
        if (data.note && data.note.versions.length > 0) {
          const latest = data.note.versions[0];
          setContent(latest.content);
          setSelectedVersionId(latest.id);
          setIsEditing(latest.status === "DRAFT");
        } else {
          setContent("");
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error("Error fetching session note:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [sessionId]);

  const handleSave = async () => {
    if (!content.trim()) {
      alert("Note content cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/sessions/${sessionId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          editSummary: editSummary.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEditSummary("");
        await fetchNote();
        if (onNoteStatusChange) {
          onNoteStatusChange(data.version.status);
        }
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

  const handleSign = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to sign this note? Once signed, it will freeze this version and require an administrator's co-signature to lock it."
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/sessions/${sessionId}/note/sign`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        await fetchNote();
        if (onNoteStatusChange) {
          onNoteStatusChange(data.version.status);
        }
      } else {
        const err = await res.json();
        alert(err.message || "Failed to sign note.");
      }
    } catch (error) {
      console.error("Error signing note:", error);
      alert("An error occurred while signing the note.");
    } finally {
      setSaving(false);
    }
  };

  const handleCosign = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to co-sign and lock this session note? This represents the finalized EHR entry."
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/sessions/${sessionId}/note/cosign`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        await fetchNote();
        if (onNoteStatusChange) {
          onNoteStatusChange(data.version.status);
        }
      } else {
        const err = await res.json();
        alert(err.message || "Failed to co-sign note.");
      }
    } catch (error) {
      console.error("Error co-signing note:", error);
      alert("An error occurred while co-signing the note.");
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

  const latestVersion = noteData && noteData.versions.length > 0 ? noteData.versions[0] : null;
  const isLatestSelected = latestVersion && selectedVersionId === latestVersion.id;

  // Selected Version details
  const selectedVersion = noteData?.versions.find((v) => v.id === selectedVersionId);

  // Compute diff against previous version
  let diffChunks: DiffChunk[] = [];
  let prevVersion: NoteVersion | undefined;
  if (selectedVersion && noteData) {
    const currentIndex = noteData.versions.findIndex((v) => v.id === selectedVersion.id);
    // noteData.versions is sorted desc (newest first), so previous version is at index + 1
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
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        padding: 24,
      }}
    >
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
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 1100,
          height: "85vh",
          background: "#ffffff",
          borderRadius: 14,
          boxShadow: "0 24px 64px rgba(0,0,0,0.24)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-outline-variant)",
            background: "var(--color-surface-container-lowest)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 24, color: "var(--color-primary)" }}
              >
                clinical_notes
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>
                Session Note: {sessionName}
              </h3>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)", marginTop: 4 }}>
              Session ID: <span style={{ fontFamily: "var(--font-mono)" }}>{sessionId}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {latestVersion && (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  ...getStatusStyle(latestVersion.status),
                }}
              >
                {latestVersion.status} (v{latestVersion.version})
              </span>
            )}
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-on-surface-variant)",
                padding: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                close
              </span>
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
              Loading Session Note...
            </span>
          </div>
        ) : (
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 380px", overflow: "hidden" }}>
            {/* LEFT: Note View / Editor */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid var(--color-outline-variant)",
                padding: 24,
                overflowY: "auto",
                background: "var(--color-surface-container-lowest)",
              }}
            >
              {/* Alert for amendment summaries or system states */}
              {isEditing && latestVersion && (latestVersion.status === "SIGNED" || latestVersion.status === "LOCKED") && (
                <div
                  style={{
                    background: "#fff3cd",
                    border: "1px solid #ffeeba",
                    color: "#856404",
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    warning
                  </span>
                  <span>
                    Creating a new version draft (v{latestVersion.version + 1}). The active signed note will remain active until this new draft is signed and locked.
                  </span>
                </div>
              )}

              {/* Note Content display */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-on-surface-variant)" }}>
                  {isEditing ? "EDIT NOTE CONTENT" : `VIEW NOTE CONTENT (v${selectedVersion?.version || 1})`}
                </label>

                {isEditing ? (
                  <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter session summary, clinical observations, or clinical notes here..."
                      disabled={saving}
                      style={{
                        flex: 1,
                        width: "100%",
                        borderRadius: 10,
                        border: "1px solid var(--color-outline)",
                        padding: 16,
                        paddingBottom: 70,
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: "var(--color-on-surface)",
                        resize: "none",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                    {isSpeechSupported && (
                      <button
                        onClick={toggleListening}
                        type="button"
                        className={isListening ? "mic-active" : ""}
                        style={{
                          position: "absolute",
                          bottom: 16,
                          right: 16,
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          border: "none",
                          background: isListening ? "#ea4335" : "var(--color-primary)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          transition: "all 0.2s ease",
                          zIndex: 10,
                        }}
                        title={isListening ? "Stop listening" : "Start dictating"}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                          {isListening ? "mic" : "mic_off"}
                        </span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid var(--color-outline-variant)",
                      background: "var(--color-surface-container-low)",
                      padding: 20,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "var(--color-on-surface)",
                      whiteSpace: "pre-wrap",
                      overflowY: "auto",
                    }}
                  >
                    {showDiffMode && prevVersion ? (
                      // Render Diff representation
                      <div>
                        {diffChunks.map((chunk, idx) => {
                          if (chunk.added) {
                            return (
                              <span
                                key={idx}
                                style={{
                                  background: "#e6f4ea",
                                  color: "#137333",
                                  textDecoration: "underline",
                                  padding: "2px 4px",
                                  borderRadius: 4,
                                  fontWeight: 500,
                                }}
                              >
                                {chunk.value}
                              </span>
                            );
                          }
                          if (chunk.removed) {
                            return (
                              <span
                                key={idx}
                                style={{
                                  background: "#fce8e8",
                                  color: "#c5221f",
                                  textDecoration: "line-through",
                                  padding: "2px 4px",
                                  borderRadius: 4,
                                }}
                              >
                                {chunk.value}
                              </span>
                            );
                          }
                          return <span key={idx}>{chunk.value}</span>;
                        })}
                      </div>
                    ) : (
                      selectedVersion?.content || "No content entered."
                    )}
                  </div>
                )}

                {/* Edit Reason input (Only shown when editing a note that had previous versions) */}
                {isEditing && latestVersion && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)" }}>
                      AMENDMENT / CHANGE REASON
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Added detail about patient feedback (Optional)"
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      disabled={saving}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid var(--color-outline)",
                        fontSize: 13,
                        outline: "none",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons Panel */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid var(--color-outline-variant)",
                }}
              >
                <div>
                  {!isEditing && prevVersion && (
                    <button
                      onClick={() => setShowDiffMode(!showDiffMode)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: showDiffMode ? "var(--color-primary-container)" : "none",
                        border: "1px solid var(--color-outline)",
                        color: showDiffMode ? "#ffffff" : "var(--color-on-surface)",
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        difference
                      </span>
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
                          }}
                          disabled={saving}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1px solid var(--color-outline-variant)",
                            background: "transparent",
                            color: "var(--color-on-surface-variant)",
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
                          background: "var(--color-primary)",
                          color: "#ffffff",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          opacity: saving ? 0.7 : 1,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          save
                        </span>
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
                            border: "1px solid var(--color-outline)",
                            background: "transparent",
                            color: "var(--color-on-surface)",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            edit_note
                          </span>
                          Amend Note
                        </button>
                      )}

                      {/* Primary sign button */}
                      {isLatestSelected && latestVersion.status === "DRAFT" && (
                        <button
                          onClick={handleSign}
                          disabled={saving}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: "var(--color-primary)",
                            color: "#ffffff",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            opacity: saving ? 0.7 : 1,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            draw
                          </span>
                          Sign Note
                        </button>
                      )}

                      {/* Co-sign button */}
                      {isLatestSelected && canCoSign && (
                        <button
                          onClick={handleCosign}
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
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            verified_user
                          </span>
                          Co-sign & Lock
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: History Log */}
            <div
              style={{
                background: "var(--color-surface-container-low)",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--color-outline-variant)",
                  background: "var(--color-surface-container-low)",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>
                  Version History Log
                </h4>
                <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)", margin: "4px 0 0 0" }}>
                  All updates are perfectly preserved.
                </p>
              </div>

              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                {!noteData || noteData.versions.length === 0 ? (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-on-surface-variant)",
                      textAlign: "center",
                      marginTop: 20,
                    }}
                  >
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
                          }
                        }}
                        style={{
                          border: isSelected
                            ? "2px solid var(--color-primary)"
                            : "1px solid var(--color-outline-variant)",
                          borderRadius: 10,
                          padding: 14,
                          background: isSelected ? "#ffffff" : "var(--color-surface-container-lowest)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {/* Title & Version info */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-on-surface)" }}>
                            Version v{ver.version}
                          </span>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 8,
                              fontSize: 10,
                              fontWeight: 700,
                              background: verStatusStyle.bg,
                              color: verStatusStyle.color,
                            }}
                          >
                            {ver.status}
                          </span>
                        </div>

                        {/* Editor and timestamp */}
                        <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)", marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                              edit
                            </span>
                            <span>
                              Edited by: <b>{ver.editedBy.firstname} {ver.editedBy.lastname}</b>
                            </span>
                          </div>
                          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", opacity: 0.8 }}>
                            {formattedDate}
                          </div>
                        </div>

                        {/* Reason / Summary */}
                        {ver.editSummary && (
                          <div
                            style={{
                              fontSize: 11,
                              background: "var(--color-surface-container)",
                              padding: "6px 8px",
                              borderRadius: 6,
                              color: "var(--color-on-surface-variant)",
                              marginBottom: 8,
                              fontStyle: "italic",
                            }}
                          >
                            "{ver.editSummary}"
                          </div>
                        )}

                        {/* Signatures verification details */}
                        <div
                          style={{
                            borderTop: "1px solid var(--color-outline-variant)",
                            paddingTop: 8,
                            marginTop: 8,
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            fontSize: 11,
                          }}
                        >
                          {ver.signedBy ? (
                            <div style={{ color: "#137333", display: "flex", alignItems: "center", gap: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                check_circle
                              </span>
                              <span>
                                Signed: {ver.signedBy.firstname} {ver.signedBy.lastname}
                              </span>
                            </div>
                          ) : (
                            <div style={{ color: "var(--color-on-surface-variant)", display: "flex", alignItems: "center", gap: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                pending
                              </span>
                              <span>Unsigned</span>
                            </div>
                          )}

                          {ver.cosignedBy && (
                            <div style={{ color: "#137333", display: "flex", alignItems: "center", gap: 4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                verified
                              </span>
                              <span>
                                Locked: {ver.cosignedBy.firstname} {ver.cosignedBy.lastname}
                              </span>
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
    </div>
  );
}
