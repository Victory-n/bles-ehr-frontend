"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { cleanMarkdownToPlainText } from "@/utils/formatters";

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
    } catch (_) { }
  } catch (_) { }

  const cleanBody = bodyText
    ? bodyText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150)
    : "";
  return `${defaultMsg} (Status: ${status} ${statusText})${cleanBody ? ` | Details: ${cleanBody}` : ""}`;
}

export default function NewClinicNotePage() {
  const params = useParams();
  const router = useRouter();
  const notesId = params.notesId as string; // folderId
  const { user } = useAuth();

  // Patient & Program States
  const [patient, setPatient] = useState<any | null>(null);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  // Form states
  const [title, setTitle] = useState("Click to add title");
  const [noteType, setNoteType] = useState("Intake Session");
  const [program, setProgram] = useState("None");
  const [tags, setTags] = useState<string[]>(["#CBT", "#Anxiety"]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Editor state
  const [editorText, setEditorText] = useState(
    ""
  );

  // Autosave status state
  const [saveStatus, setSaveStatus] = useState("Draft");

  // Dictation States (Web Speech API)
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
  const [activeReviewTab, setActiveReviewTab] = useState<"transcript" | "followUp" | null>(null);
  const [followUpPlan, setFollowUpPlan] = useState("");
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  // Custom Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState("0:00");
  const [audioDuration, setAudioDuration] = useState("0:00");

  const formatAudioTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (!isNaN(total)) {
        setAudioProgress((current / total) * 100);
        setAudioCurrentTime(formatAudioTime(current));
        setAudioDuration(formatAudioTime(total));
      }
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(formatAudioTime(audioRef.current.duration));
    }
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setAudioProgress(Number(e.target.value));
    }
  };

  // Reset audio state when selected recording changes
  useEffect(() => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setAudioCurrentTime("0:00");
    setAudioDuration("0:00");
  }, [selectedRecordingId]);


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

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [recordingInterval]);

  // Fetch AI Templates when page loads
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
    fetchTemplates();
  }, []);


  const fetchPatientDetails = async (patientId: string) => {
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setPatient({
          ...data.patient,
          name: `${data.patient.lastname}, ${data.patient.firstname}`,
          dob: new Date(data.patient.dateOfBirth).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })
        });
      }
    } catch (error) {
      console.error("Failed to fetch patient details:", error);
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
          // Fetch full patient details with folders
          await fetchPatientDetails(folderData.patient.id);
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
        if (patient?.id) await fetchPatientDetails(patient.id); // Refresh patient folders
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
        if (patient?.id) await fetchPatientDetails(patient.id);
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
      if (editorText.trim()) {
        const confirmReplace = window.confirm("Do you want to replace the current editor content with the AI-generated note?");
        if (confirmReplace) {
          setEditorText(cleanedNote);
        }
      } else {
        setEditorText(cleanedNote);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during note generation.");
    } finally {
      setIsGenerating(false);
      setIsTranscribing(false);
    }
  };

  const handleRegenerateTranscript = async () => {
    if (!selectedRecordingId) {
      alert("Please select a recording first.");
      return;
    }

    // Switch to transcript tab to show the loading state
    setActiveReviewTab("transcript");
    setIsTranscribing(true);

    try {
      const transcribeRes = await fetch(`/api/documents/${selectedRecordingId}/transcribe?force=true`, {
        method: "POST",
      });
      if (!transcribeRes.ok) {
        const errMsg = await getResponseError(transcribeRes, "Transcription regeneration failed.");
        throw new Error(errMsg);
      }

      const transcribeData = await transcribeRes.json().catch(() => ({}));
      if (!transcribeData.transcript) {
        throw new Error("No transcript was returned from the server.");
      }

      // Refresh patient data to load the new transcript into availableRecordings state
      if (patient?.id) await fetchPatientDetails(patient.id);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during transcription regeneration.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFollowUpClick = async () => {
    if (activeReviewTab === "followUp") {
      setActiveReviewTab(null);
      return;
    }
    setActiveReviewTab("followUp");
    if (!editorText.trim()) {
      alert("Please generate or write a clinical note first.");
      return;
    }
    if (followUpPlan) return; // already generated

    try {
      setIsGeneratingFollowUp(true);
      const res = await fetch("/api/ai/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteContent: editorText }),
      });

      if (!res.ok) {
        const errMsg = await getResponseError(res, "Follow-up generation failed.");
        throw new Error(errMsg);
      }

      const data = await res.json().catch(() => ({}));
      setFollowUpPlan(data.followUp || "");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred generating follow-up.");
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  // Helper to find recordings in current patient folders
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

    completeSaveNote(isLocked);
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
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/clinic-notes")}>Folders</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push(`/clinic-notes/${notesId}`)}>
          {patient.name} (DOB: {patient.dob})
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>New Clinical Note</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>
        
        {/* Column 1: AI Clinical Assistant (Sticky) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 24 }}>
          {/* AI Clinical Assistant Card */}
          <div style={{
            background: "linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)",
            border: "1px solid #d1c4e9",
            borderRadius: 12,
            padding: "18px 24px",
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            boxShadow: "0 2px 8px rgba(103, 58, 183, 0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: "#673ab7", fontSize: 22 }}>psychology</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#4a148c", letterSpacing: "0.03em" }}>AI CLINICAL ASSISTANT</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Left: Audio Recorder */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, borderBottom: "1px solid #d1c4e9", paddingBottom: 24 }}>
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
                  {selectedRecordingId && (
                    <div style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "#f8f9fa",
                      border: "1px solid #d1c4e9",
                      display: "flex",
                      alignItems: "center",
                      gap: 12
                    }}>
                      <audio
                        ref={audioRef}
                        src={`/api/documents/${selectedRecordingId}`}
                        onTimeUpdate={handleAudioTimeUpdate}
                        onLoadedMetadata={handleAudioLoadedMetadata}
                        onEnded={() => setIsPlayingAudio(false)}
                        style={{ display: "none" }}
                      />

                      {/* Play/Pause Button */}
                      <button
                        onClick={togglePlayAudio}
                        type="button"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#673ab7",
                          color: "#ffffff",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "background 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = "#512da8"}
                        onMouseOut={(e) => e.currentTarget.style.background = "#673ab7"}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          {isPlayingAudio ? "pause" : "play_arrow"}
                        </span>
                      </button>

                      {/* Progress Bar & Timers */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#673ab7", fontWeight: 700 }}>
                          <span>{audioCurrentTime}</span>
                          <span>{audioDuration}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={audioProgress || 0}
                          onChange={handleAudioSeek}
                          style={{
                            width: "100%",
                            height: 4,
                            cursor: "pointer",
                            accentColor: "#673ab7",
                            background: "#e8eaf6",
                            borderRadius: 2,
                            appearance: "none",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: AI Note Generator */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, borderBottom: "1px solid #d1c4e9", paddingBottom: 24 }}>
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

              {/* 3. Recording Review */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#512da8" }}>3. RECORDING REVIEW</span>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setActiveReviewTab(activeReviewTab === "transcript" ? null : "transcript")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #d1c4e9",
                      backgroundColor: activeReviewTab === "transcript" ? "#f3e5f5" : "#ffffff",
                      color: "#673ab7",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3e5f5"}
                    onMouseOut={(e) => {
                      if (activeReviewTab !== "transcript") e.currentTarget.style.backgroundColor = "#ffffff";
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>description</span>
                    Transcript
                  </button>

                  <button
                    type="button"
                    onClick={handleRegenerateTranscript}
                    disabled={isTranscribing}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #d1c4e9",
                      backgroundColor: "#ffffff",
                      color: "#673ab7",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: isTranscribing ? "not-allowed" : "pointer",
                      transition: "background 0.2s",
                      opacity: isTranscribing ? 0.7 : 1,
                    }}
                    onMouseOver={(e) => { if (!isTranscribing) e.currentTarget.style.backgroundColor = "#f3e5f5"; }}
                    onMouseOut={(e) => { if (!isTranscribing) e.currentTarget.style.backgroundColor = "#ffffff"; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14, animation: isTranscribing ? "spin 1s linear infinite" : "none" }}>refresh</span>
                    Regenerate Transcript
                  </button>

                  <button
                    type="button"
                    onClick={handleFollowUpClick}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #d1c4e9",
                      backgroundColor: activeReviewTab === "followUp" ? "#f3e5f5" : "#ffffff",
                      color: "#673ab7",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3e5f5"}
                    onMouseOut={(e) => {
                      if (activeReviewTab !== "followUp") e.currentTarget.style.backgroundColor = "#ffffff";
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_month</span>
                    Follow Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Note Editor / Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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

                {/* Template Dropdown */}
                <select
                  onChange={(e) => {
                    const templateId = e.target.value;
                    if (templateId) {
                      setSelectedTemplateId(templateId);
                      const t = templates.find((temp: any) => temp.id === templateId);
                      if (t) {
                        try {
                          const parsed = JSON.parse(t.structure);
                          if (parsed && Array.isArray(parsed.sections)) {
                            let markdown = "";
                            parsed.sections.forEach((sec: any) => {
                              markdown += `### ${sec.sectionName}\n`;
                              if (sec.instructions) {
                                markdown += `*(${sec.instructions})*\n\n`;
                              } else {
                                markdown += `\n\n`;
                              }
                            });
                            const cleanStructure = cleanMarkdownToPlainText(markdown.trim());
                            setEditorText((prev) => prev + (prev.trim() ? "\n\n" : "") + cleanStructure);
                          }
                        } catch (err) {
                          const cleanStructure = cleanMarkdownToPlainText(t.structure);
                          setEditorText((prev) => prev + (prev.trim() ? "\n\n" : "") + cleanStructure);
                        }
                      }
                    }
                    e.target.value = "";
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 10px",
                    fontSize: 12,
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
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
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
            <div style={{ display: "flex", borderTop: "1px solid var(--color-outline-variant, #e5e5e7)" }}>

              {/* Main Markdown Text Editor */}
              <div style={{
                flex: 1,
                padding: "24px 32px",
              }}>
                <textarea
                  value={editorText}
                  onChange={(e) => {
                    setEditorText(e.target.value);
                  }}
                  style={{
                    width: "100%",
                    height: "400px",
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

        </div>
      </div>

      {/* Drawer Backdrop Overlay (dim screen when open, closes on click) */}
      {activeReviewTab && (
        <div 
          onClick={() => setActiveReviewTab(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.15)",
            zIndex: 80,
            cursor: "pointer",
          }}
        />
      )}

      {/* Slide-out Review Drawer (1/3 screen width, pans from right) */}
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "33.33vw",
        minWidth: "380px",
        backgroundColor: "#ffffff",
        borderLeft: "1px solid var(--color-outline-variant, #e5e5e7)",
        boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.08)",
        transform: activeReviewTab ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
      }}>
        {/* Drawer Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid var(--color-outline-variant, #e5e5e7)",
          background: "#ffffff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="material-symbols-outlined" style={{ color: "#673ab7", fontSize: 22 }}>
              {activeReviewTab === "transcript" ? "description" : "calendar_month"}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#4a148c", letterSpacing: "0.03em" }}>
              {activeReviewTab === "transcript" ? "SESSION TRANSCRIPT" : "FOLLOW UP RECOMMENDATIONS"}
            </span>
          </div>
          <button
            onClick={() => setActiveReviewTab(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#86868b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
              borderRadius: "50%",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f5f5f7"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Drawer Content Body */}
        <div style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto",
          fontSize: 13,
          lineHeight: "1.7",
          color: "#1d1d1f",
          backgroundColor: "#ffffff",
        }}>
          {activeReviewTab === "transcript" && (
            isTranscribing ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "#673ab7" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, animation: "spin 1s linear infinite" }}>progress_activity</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Transcribing audio file...</span>
              </div>
            ) : (
              selectedRecordingId ? (
                <div style={{ whiteSpace: "pre-wrap", color: "#1d1d1f" }}>
                  {availableRecordings.find((r: any) => r.id === selectedRecordingId)?.transcript || (
                    <div style={{ textAlign: "center", color: "#86868b", padding: "40px 0" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#d2d2d7", marginBottom: 12 }}>description</span>
                      <p style={{ margin: 0, fontStyle: "italic" }}>No transcript available for this recording yet.</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: 12 }}>Click "Regenerate Transcript" in the AI assistant sidebar to process the audio.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#86868b", padding: "40px 0" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#d2d2d7", marginBottom: 12 }}>info</span>
                  <p style={{ margin: 0, fontStyle: "italic" }}>Please select a recording to view its transcript.</p>
                </div>
              )
            )
          )}

          {activeReviewTab === "followUp" && (
            isGeneratingFollowUp ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "#673ab7" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, animation: "spin 1s linear infinite" }}>progress_activity</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Generating follow-up plan...</span>
              </div>
            ) : (
              <div style={{ whiteSpace: "pre-wrap", color: "#1d1d1f" }}>
                {followUpPlan || (
                  <div style={{ textAlign: "center", color: "#86868b", padding: "40px 0" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#d2d2d7", marginBottom: 12 }}>calendar_month</span>
                    <p style={{ margin: 0, fontStyle: "italic" }}>No follow-up recommendations generated yet.</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: 12 }}>Click "Follow Up" in the AI assistant sidebar to analyze your current notes.</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>



    </div>
  );
}
