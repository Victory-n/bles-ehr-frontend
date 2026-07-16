"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ProgramFormModal from "@/components/programs/ProgramFormModal";
import EnrollPatientModal from "@/components/programs/EnrollPatientModal";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasPermission, PERMISSION_LEVELS } from "@/lib/auth/permissions";
import SessionNoteModal from "@/components/programs/SessionNoteModal";

/* ════════════════════════════════════════════════════════════════════════
   Types & Constants
═══════════════════════════════════════════════════════════════════════════ */

type ProgramStatus = "Active" | "Closed" | "Paused";

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
  status: ProgramStatus;
  createdAt: string;
  updatedAt: string;
  assignedStaff: {
    id: string;
    staffId: string;
    firstname: string;
    lastname: string;
    email: string;
  }[];
}

interface Staff {
  id: string;
  staffId: string;
  firstname: string;
  lastname: string;
  email: string;
  role: number;
  status: string;
}

interface Session {
  id: string;
  sessionId: string;
  name: string;
  description?: string;
  location?: string;
  status: string;
  startDate: string;
  endDate?: string;
  patientProgram?: {
    patient: {
      firstname: string;
      lastname: string;
    };
  };
  note?: {
    versions: {
      status: string;
    }[];
  } | null;
}

const TABS = ["Overview", "Enrolled Patients", "Sessions"] as const;
type Tab = (typeof TABS)[number];

/* ════════════════════════════════════════════════════════════════════════
   Program Detailed Page
═══════════════════════════════════════════════════════════════════════════ */

export default function ProgramDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showAssignStaffModal, setShowAssignStaffModal] = useState(false);
  const [enrolledPatients, setEnrolledPatients] = useState<any[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [activeNoteSession, setActiveNoteSession] = useState<{ id: string; name: string } | null>(null);

  const fetchProgram = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching program with ID:", programId);
      console.log("🔍 API URL:", `/api/programs/${programId}`);
      
      const res = await fetch(`/api/programs/${programId}`);
      console.log("🔍 Response status:", res.status);
      
      const responseText = await res.text();
      console.log("🔍 Full response:", responseText);
      
      if (res.ok) {
        const data = JSON.parse(responseText);
        console.log("🔍 Parsed program data:", data);
        setProgram(data.program);
      } else {
        console.error("❌ API returned error:", responseText);
      }
    } catch (error) {
      console.error("❌ Failed to fetch program:", error);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  const fetchEnrolledPatients = useCallback(async () => {
    try {
      setLoadingEnrolled(true);
      const res = await fetch(`/api/programs/${programId}/enrolled`);
      if (res.ok) {
        const data = await res.json();
        setEnrolledPatients(data.patientPrograms || []);
      }
    } catch (error) {
      console.error("Failed to fetch enrolled patients:", error);
    } finally {
      setLoadingEnrolled(false);
    }
  }, [programId]);

  const fetchAllStaff = useCallback(async () => {
    try {
      setLoadingStaff(true);
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setAllStaff(data.staff || []);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  const handleAssignStaff = async () => {
    try {
      const res = await fetch(`/api/programs/${programId}/assign-staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffIds: selectedStaffIds }),
      });
      if (res.ok) {
        const data = await res.json();
        setProgram(data.program);
        setShowAssignStaffModal(false);
      }
    } catch (error) {
      console.error("Failed to assign staff:", error);
    }
  };

  const fetchSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const res = await fetch(`/api/programs/${programId}/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchProgram();
    fetchEnrolledPatients();
    fetchSessions();
  }, [fetchProgram, fetchEnrolledPatients, fetchSessions]);

  const handleEnrollPatient = async (patientId: string) => {
    if (!program) return;
    if (enrolledPatients.length >= program.maxEnrollment) {
      alert(`Cannot enroll patient. The program has reached its maximum enrollment capacity of ${program.maxEnrollment} patients.`);
      return;
    }

    try {
      const res = await fetch(`/api/programs/${programId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId })
      });

      if (res.ok) {
        // Refresh the enrolled patients list
        await fetchEnrolledPatients();
        setShowEnrollModal(false);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to enroll patient.");
      }
    } catch (error) {
      console.error("Failed to enroll patient:", error);
      alert("An error occurred while enrolling the patient.");
    }
  };

  const handleRemovePatient = async (patientId: string) => {
    const confirmed = window.confirm("Are you sure you want to remove this patient from the program?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/programs/${programId}/enroll`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId })
      });

      if (res.ok) {
        // Refresh the enrolled patients list
        await fetchEnrolledPatients();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to remove patient from program.");
      }
    } catch (error) {
      console.error("Failed to remove patient:", error);
      alert("An error occurred while removing the patient.");
    }
  };

  const handlePauseProgram = async () => {
    const confirmed = window.confirm("Are you sure you want to pause this program? Enrolls, edits, and sessions will be disabled until it is resumed.");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/programs/${programId}/pause`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchProgram();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to pause program.");
      }
    } catch (error) {
      console.error("Failed to pause program:", error);
      alert("An error occurred while pausing the program.");
    }
  };

  const handleResumeProgram = async () => {
    try {
      const res = await fetch(`/api/programs/${programId}/resume`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchProgram();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to resume program.");
      }
    } catch (error) {
      console.error("Failed to resume program:", error);
      alert("An error occurred while resuming the program.");
    }
  };

  const handleResumeClosedClick = async () => {
    if (user?.role !== 1) {
      alert("Only an administrator can resume an ended program.");
      return;
    }
    const endedBy = (program?.extraInfo as any)?.endedBy;
    if (endedBy && user.id !== endedBy) {
      alert("Only the administrator who ended this program can resume it.");
      return;
    }
    try {
      const res = await fetch(`/api/programs/${programId}/resume`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchProgram();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to resume program.");
      }
    } catch (error) {
      console.error("Failed to resume program:", error);
      alert("An error occurred while resuming the program.");
    }
  };

  const handleEndProgramClick = async () => {
    if (user?.role !== 1) {
      alert("Only administrators can end a program.");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to end this program?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/programs/${programId}/end`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchProgram();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to end program.");
      }
    } catch (error) {
      console.error("Failed to end program:", error);
      alert("An error occurred while ending the program.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <span style={{ fontSize: 16, color: "var(--color-on-surface-variant)" }}>Loading program...</span>
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

  const statusColor = program.status === "Active" ? "#137333" : program.status === "Closed" ? "#b3261e" : "#f57f17";
  const statusBg = program.status === "Active" ? "#e6f4ea" : program.status === "Closed" ? "#fce8e8" : "#fff8e1";
  const createdDate = new Date(program.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const about = program.description || "No description available.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/programs")}>Programs</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{program.programId}</span>
      </div>

      {/* ── Header Card ─────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: 12,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap", justifyContent: "space-between" }}>

          {/* Left: Info */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minWidth: 300 }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, background: "var(--color-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#ffffff" }}>diversity_3</span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{program.name}</h2>
                <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: statusBg, color: statusColor, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
                  {program.status}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                <InfoChip icon="category" text={`Type: ${program.type}`} />
                <InfoChip icon="group" text={`Session: ${program.sessionType}`} />
                <InfoChip icon="people" text={`Max Enrollment: ${program.maxEnrollment}`} />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PrimaryBtn 
              icon="person_add" 
              label="Enroll Patient" 
              onClick={() => {
                if (program.status !== "Active") {
                  alert(`This program is currently ${program.status.toLowerCase()}. It must be active to enroll patients.`);
                  return;
                }
                if (enrolledPatients.length >= program.maxEnrollment) {
                  alert(`This program is at maximum enrollment capacity (${program.maxEnrollment}/${program.maxEnrollment}). Please remove a patient or increase the capacity before enrolling another patient.`);
                  return;
                }
                setShowEnrollModal(true);
              }} 
            />
            <SecondaryBtn 
              icon="event" 
              label="Schedule Session" 
              onClick={() => {
                if (program.status !== "Active") {
                  alert(`This program is currently ${program.status.toLowerCase()}. It must be active to schedule a session.`);
                  return;
                }
                router.push(`/programs/${programId}/schedule-session`);
              }}
            />
            {program.status === "Active" && (
              <SecondaryBtn icon="edit" label="Edit Program" onClick={() => setShowEditModal(true)} />
            )}

            {/* More Actions Dropdown Simulation */}
            <div style={{ display: "flex", gap: 10 }}>
              {program.status === "Active" && (
                <SecondaryBtn icon="pause" label="Pause Program" color="#f57f17" onClick={handlePauseProgram} />
              )}
              {program.status === "Paused" && (
                <SecondaryBtn icon="play_arrow" label="Resume Program" color="#137333" onClick={handleResumeProgram} />
              )}
              {program.status === "Closed" && user?.role === 1 && user.id === (program.extraInfo as any)?.endedBy && (
                <SecondaryBtn icon="play_arrow" label="Resume Program" color="#137333" onClick={handleResumeClosedClick} />
              )}
              {program.status !== "Closed" && (
                <SecondaryBtn icon="cancel" label="End Program" color="var(--color-error)" onClick={handleEndProgramClick} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--color-outline-variant)" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: activeTab === t ? 700 : 500,
              color: activeTab === t ? "var(--color-primary-container)" : "var(--color-on-surface-variant)",
              background: "none",
              border: "none",
              borderBottom: activeTab === t ? "2px solid var(--color-primary-container)" : "2px solid transparent",
              marginBottom: -2,
              cursor: "pointer",
              transition: "color 0.12s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      {activeTab === "Overview" && (
        <OverviewTab
          p={program}
          createdDate={createdDate}
          about={about}
          onAssignStaffClick={() => {
            // Initialize selected staff with current assigned staff
            setSelectedStaffIds(program.assignedStaff.map(s => s.id));
            fetchAllStaff();
            setShowAssignStaffModal(true);
          }}
        />
      )}
      {activeTab === "Enrolled Patients" && (
        <EnrolledPatientsTab
          enrolledPatients={enrolledPatients}
          loadingEnrolled={loadingEnrolled}
          onRemovePatient={handleRemovePatient}
        />
      )}
      {activeTab === "Sessions" && (
        <SessionsTab 
          sessions={sessions} 
          loadingSessions={loadingSessions} 
          onOpenNote={(session) => setActiveNoteSession({ id: session.id, name: session.name })} 
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <ProgramFormModal
          onClose={() => setShowEditModal(false)}
          program={program}
          onSave={(updatedProgram) => {
            setProgram(updatedProgram);
          }}
        />
      )}

      {/* Enroll Patient Modal */}
      {showEnrollModal && (
        <EnrollPatientModal
          onClose={() => setShowEnrollModal(false)}
          onEnroll={handleEnrollPatient}
        />
      )}

      {/* Assign Staff Modal */}
      {showAssignStaffModal && (
        <div
          onClick={() => setShowAssignStaffModal(false)}
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
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: 14,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
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
                position: "sticky",
                top: 0,
                background: "#ffffff",
                zIndex: 1,
                borderRadius: "14px 14px 0 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary-container)" }}>
                  group
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>
                  Assign Staff Members
                </h3>
              </div>
              <button
                onClick={() => setShowAssignStaffModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", padding: 4 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {loadingStaff ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-primary-container)", animation: "spin 1s linear infinite" }}>
                    progress_activity
                  </span>
                  <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", marginTop: 8, marginBottom: 0 }}>
                    Loading staff...
                  </p>
                </div>
              ) : allStaff.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0, textAlign: "center" }}>
                  No staff available.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "50vh", overflowY: "auto" }}>
                  {allStaff.map((staff) => {
                    const isSelected = selectedStaffIds.includes(staff.id);
                    return (
                      <label
                        key={staff.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid var(--color-outline-variant)",
                          background: isSelected ? "var(--color-surface-container)" : "var(--color-surface-container-lowest)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "var(--color-outline)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "var(--color-outline-variant)";
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStaffIds([...selectedStaffIds, staff.id]);
                            } else {
                              setSelectedStaffIds(selectedStaffIds.filter(id => id !== staff.id));
                            }
                          }}
                          style={{
                            width: 20,
                            height: 20,
                            cursor: "pointer",
                            accentColor: "var(--color-primary-container)",
                          }}
                        />
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "var(--color-primary-container)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                        >
                          {staff.firstname[0]}{staff.lastname[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                            {staff.firstname} {staff.lastname}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)", display: "flex", gap: 8 }}>
                            <span style={{ fontFamily: "var(--font-mono)" }}>{staff.staffId}</span>
                            <span>•</span>
                            <span>{staff.email}</span>
                          </div>
                        </div>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 600,
                            background: staff.status === "Active" ? "#e6f4ea" : "#fce8e8",
                            color: staff.status === "Active" ? "#137333" : "#b3261e",
                          }}
                        >
                          {staff.status}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Footer Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <SecondaryBtn
                  icon="close"
                  label="Cancel"
                  onClick={() => setShowAssignStaffModal(false)}
                />
                <PrimaryBtn
                  icon="check"
                  label="Save Assignments"
                  onClick={handleAssignStaff}
                />
              </div>
            </div>
          </div>
        </div>
      )}



      {activeNoteSession && (
        <SessionNoteModal
          sessionId={activeNoteSession.id}
          sessionName={activeNoteSession.name}
          onClose={() => {
            setActiveNoteSession(null);
            fetchSessions();
          }}
          onNoteStatusChange={() => {
            fetchSessions();
          }}
        />
      )}

    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Tab Components
═══════════════════════════════════════════════════════════════════════════ */

function OverviewTab({
  p,
  createdDate,
  about,
  onAssignStaffClick
}: {
  p: Program;
  createdDate: string;
  about: string;
  onAssignStaffClick: () => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
      {/* Left Column: Program Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Card title="About Program">
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-on-surface)", margin: 0 }}>
            {about}
          </p>
        </Card>

        <Card title="Program Details">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
            <DetailRow icon="calendar_today" label="Created Date" value={createdDate} />
            <DetailRow icon="update" label="Frequency" value={p.frequency} />
            <DetailRow icon="schedule" label="Duration" value={p.duration} />
            <DetailRow icon="view_list" label="Total Sessions" value={p.totalSessions.toString()} />
            <DetailRow icon="group_add" label="Max Enrollment" value={p.maxEnrollment.toString()} />
          </div>
        </Card>
      </div>

      {/* Right Column: Assigned Staff */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Card title={`Assigned Staff (${p.assignedStaff.length})`}>
          {p.assignedStaff.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)" }}>No staff assigned yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {p.assignedStaff.map((staff) => (
                <div
                  key={staff.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "var(--color-surface-container-low)",
                    border: "1px solid var(--color-outline-variant)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--color-primary-container)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {staff.firstname[0]}{staff.lastname[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>
                      {staff.firstname} {staff.lastname}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-on-surface-variant)", fontFamily: "var(--font-mono)" }}>
                      {staff.staffId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={onAssignStaffClick}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: 16,
              borderRadius: 8,
              border: "1px dashed var(--color-outline)",
              background: "transparent",
              color: "var(--color-on-surface-variant)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.color = "var(--color-primary)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--color-outline)";
              e.currentTarget.style.color = "var(--color-on-surface-variant)";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Assign Staff Member
          </button>
        </Card>
      </div>
    </div>
  );
}

function EnrolledPatientsTab({
  enrolledPatients,
  loadingEnrolled,
  onRemovePatient
}: {
  enrolledPatients: any[];
  loadingEnrolled: boolean;
  onRemovePatient?: (patientId: string) => void;
}) {
  const router = useRouter();
  return (
    <Card title="Enrolled Patients" noPadding>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-low)" }}>
            {["S/N", "PATIENT", "ENROLLED DATE", "STATUS", "ACTION"].map((h, i) => (
              <th key={h} style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", textAlign: i === 4 ? "right" : "left", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loadingEnrolled ? (
            <tr>
              <td colSpan={5} style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-on-surface-variant)", fontSize: 14 }}>Loading enrolled patients...</td>
            </tr>
          ) : enrolledPatients.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-on-surface-variant)", fontSize: 14 }}>No patients enrolled yet.</td>
            </tr>
          ) : (
            enrolledPatients.map((pp, index) => {
              const patient = pp.patient;
              type PatientStatus = "Active" | "Inactive" | "Completed";
              const statusStyles: Record<PatientStatus, { bg: string; color: string; dot: string }> = {
                Active: { bg: "#e6f4ea", color: "#137333", dot: "#137333" },
                Inactive: { bg: "#fce8e8", color: "#b3261e", dot: "#b3261e" },
                Completed: { bg: "#fff8e1", color: "#f57f17", dot: "#f57f17" }
              };
              const statusStylesValue = statusStyles[pp.status as keyof typeof statusStyles] || statusStyles.Active;

              const enrolledDate = new Date(pp.enrolledAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <tr
                  key={pp.id}
                  style={{
                    borderBottom: "1px solid var(--color-outline-variant)",
                    transition: "background 0.12s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-primary-container)" }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                      {patient.lastname}, {patient.firstname}
                    </div>
                    <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-on-surface-variant)" }}>
                      {patient.patientId}
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                    {enrolledDate}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: statusStylesValue.bg,
                      color: statusStylesValue.color
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusStylesValue.dot }} />
                      {pp.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <ActionBtn 
                        icon="visibility" 
                        title="View Patient" 
                        onClick={() => {
                          const folderId = patient.folders?.[0]?.folderId;
                          router.push(`/clinic-notes/${folderId || patient.id}`);
                        }}
                      />
                      <ActionBtn 
                        icon="person_remove" 
                        title="Remove Patient from Program" 
                        color="var(--color-error)"
                        onClick={() => onRemovePatient?.(patient.id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </Card>
  );
}

function SessionsTab({
  sessions,
  loadingSessions,
  onOpenNote
}: {
  sessions: Session[];
  loadingSessions: boolean;
  onOpenNote: (session: Session) => void;
}) {
  return (
    <Card title="Program Sessions" noPadding>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-low)" }}>
            {["S/N", "SESSION ID", "SESSION NAME", "DATE & TIME", "LOCATION", "STATUS", "CLINICAL NOTE"].map((h, i) => (
              <th key={h} style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", textAlign: "left", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loadingSessions ? (
            <tr>
              <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-on-surface-variant)", fontSize: 14 }}>Loading sessions...</td>
            </tr>
          ) : sessions.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-on-surface-variant)", fontSize: 14 }}>No sessions scheduled yet.</td>
            </tr>
          ) : (
            sessions.map((session, index) => {
              type SessionStatus = "Scheduled" | "Completed" | "Canceled" | "No-Show";
              const statusStyles: Record<SessionStatus, { bg: string; color: string; dot: string }> = {
                Scheduled: { bg: "#e8f0fe", color: "#1a73e8", dot: "#1a73e8" },
                Completed: { bg: "#e6f4ea", color: "#137333", dot: "#137333" },
                Canceled: { bg: "#fce8e8", color: "#b3261e", dot: "#b3261e" },
                "No-Show": { bg: "#fff8e1", color: "#f57f17", dot: "#f57f17" }
              };
              const statusStylesValue = statusStyles[session.status as SessionStatus] || statusStyles.Scheduled;

              const start = new Date(session.startDate);
              const dateStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              const dateTimeText = `${dateStr} at ${timeStr}`;

              const patient = session.patientProgram?.patient;

              return (
                <tr
                  key={session.id}
                  style={{
                    borderBottom: "1px solid var(--color-outline-variant)",
                    transition: "background 0.12s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-primary-container)" }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--color-on-surface-variant)" }}>
                    {session.sessionId}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>
                      {session.name}
                    </div>
                    {patient && (
                      <div style={{ fontSize: 12, color: "var(--color-primary-container)", marginTop: 2 }}>
                        Patient: {patient.firstname} {patient.lastname}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-on-surface)" }}>
                    {dateTimeText}
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                    {session.location || "N/A"}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: statusStylesValue.bg,
                      color: statusStylesValue.color
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusStylesValue.dot }} />
                      {session.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    {(() => {
                      const latestStatus = session.note?.versions?.[0]?.status;
                      let badgeBg = "var(--color-surface-container)";
                      let badgeColor = "var(--color-on-surface-variant)";
                      let badgeText = "Empty";
                      let icon = "note_add";

                      if (latestStatus === "DRAFT") {
                        badgeBg = "#e8f0fe";
                        badgeColor = "#1a73e8";
                        badgeText = "Draft";
                        icon = "edit_note";
                      } else if (latestStatus === "SIGNED") {
                        badgeBg = "#fff8e1";
                        badgeColor = "#f57f17";
                        badgeText = "Signed";
                        icon = "draw";
                      } else if (latestStatus === "LOCKED") {
                        badgeBg = "#e6f4ea";
                        badgeColor = "#137333";
                        badgeText = "Locked";
                        icon = "verified_user";
                      }

                      return (
                        <button
                          onClick={() => onOpenNote(session)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            background: badgeBg,
                            color: badgeColor,
                            border: "1px solid var(--color-outline-variant)",
                            cursor: "pointer",
                            transition: "all 0.12s"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = badgeColor;
                            e.currentTarget.style.background = "var(--color-surface-container-low)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-outline-variant)";
                            e.currentTarget.style.background = badgeBg;
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                          {badgeText}
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </Card>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Shared UI Sub-components
═══════════════════════════════════════════════════════════════════════════ */

function Card({ title, children, noPadding }: { title: string; children: React.ReactNode; noPadding?: boolean }) {
  return (
    <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{title}</h3>
      </div>
      <div style={{ padding: noPadding ? 0 : 24 }}>{children}</div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>{value}</div>
      </div>
    </div>
  );
}

function InfoChip({ icon, text }: { icon: string; text: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>{text}
    </span>
  );
}

function PrimaryBtn({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
        border: "none", background: "var(--color-primary)", color: "#ffffff",
        fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.15s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "#004a52")}
      onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>{label}
    </button>
  );
}

function SecondaryBtn({ icon, label, color, onClick }: { icon: string; label: string; color?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
        border: `1px solid ${color ?? "var(--color-outline-variant)"}`,
        background: "transparent", fontSize: 13, fontWeight: 600,
        color: color ?? "var(--color-on-surface)", cursor: "pointer", transition: "background 0.12s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>{label}
    </button>
  );
}

function ActionBtn({ icon, title, color, onClick }: { icon: string; title: string; color?: string; onClick?: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 6,
        border: "none",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: color ?? "var(--color-on-surface-variant)",
        transition: "background 0.12s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
    </button>
  );
}
