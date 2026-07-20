"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DocumentType } from "@prisma/client";
import PatientFormModal from "@/components/patients/PatientFormModal";
import ClinicNoteDetailModal from "@/components/clinic-notes/ClinicNoteDetailModal";
import TreatmentPlanModal from "@/components/treatment-plans/TreatmentPlanModal";
import TreatmentPlanDetailModal from "@/components/treatment-plans/TreatmentPlanDetailModal";
import { cleanMarkdownToPlainText } from "@/utils/formatters";

const TABS = ["Overview", "Profile", "Session", "Treatment Plan", "Diagnosis", "Appointments", "Medications & Allergies", "Compliance", "Clinic Notes", "Documents", "Billing Records"] as const;
type Tab = (typeof TABS)[number];

export default function ClinicNotesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const notesId = params.notesId as string;
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isTreatmentPlanModalOpen, setIsTreatmentPlanModalOpen] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [folder, setFolder] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [uploadFolderId, setUploadFolderId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isPlanDetailModalOpen, setIsPlanDetailModalOpen] = useState(false);

  const fetchFolder = useCallback(async () => {
    try {
      setLoadingPatient(true);
      const res = await fetch(`/api/folders/${notesId}`);
      if (res.ok) {
        const data = await res.json();
        setPatient(data.patient);
        setFolder(data.folder);
        setDocuments(data.documents || []);
        setSessions(data.sessions || []);
        setTreatmentPlans(data.treatmentPlans || []);
      }
    } catch (err) {
      console.error("Error loading folder details:", err);
    } finally {
      setLoadingPatient(false);
    }
  }, [notesId]);

  useEffect(() => {
    if (notesId) {
      fetchFolder();
    }
  }, [notesId, fetchFolder]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const activeUploadId = uploadFolderId || notesId;
      const res = await fetch(`/api/folders/${activeUploadId}`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        showToast('File uploaded successfully!', 'success');
        setIsUploadModalOpen(false);
        setUploadFolderId(null);
        fetchFolder();
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to upload file', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload file', 'error');
    }
  };

  const displayName = patient ? `${patient.lastname}, ${patient.firstname}` : "";
  const dob = patient && patient.dateOfBirth ? new Date(patient.dateOfBirth) : null;
  const dobStr = dob ? dob.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "—";
  const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

  const statusColor = patient && patient.status === "Active" ? "#137333" : patient && patient.status === "Inactive" ? "#b3261e" : "#5f6368";
  const statusBg = patient && patient.status === "Active" ? "#e6f4ea" : patient && patient.status === "Inactive" ? "#fce8e8" : "#f1f3f4";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* --- Toast ----------------------------------------------------- */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          padding: '12px 24px',
          borderRadius: 8,
          backgroundColor: toast.type === 'success' ? '#137333' : toast.type === 'error' ? '#b3261e' : '#1a73e8',
          color: '#ffffff',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          {toast.message}
        </div>
      )}

      {/* --- Breadcrumb ------------------------------------------------ */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)", marginBottom: 8 }}>
        {/* <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/clinic-notes")}>Folders</span> */}
        <span style={{ cursor: "pointer", fontWeight: 500 }} onClick={() => router.push("/patients")}>Patients</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>
          {patient ? `${patient.lastname}, ${patient.firstname} (${notesId})` : notesId}
        </span>
      </div>

      {/* --- Patient Header Card ---------------------------------------- */}
      {patient && (
        <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, padding: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 8 }}>
          {/* Avatar */}
          <div style={{ width: 72, height: 72, borderRadius: 12, background: "var(--color-primary-container)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#ffffff" }}>person</span>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{displayName}</h2>
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 18, color: "var(--color-secondary)" }}>verified</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
              <InfoChip icon="cake" text={`DOB: ${dobStr} (${age !== null ? `${age}y` : "—"})`} />
              <InfoChip icon="badge" text={`ID: ${patient.patientId}`} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: statusBg, color: statusColor }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor }} />{patient.status}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
            <HeaderBtn icon="note_add" label="Add Clinic Note" onClick={() => router.push(`/clinic-notes/${notesId}/new`)} />
            <HeaderBtn icon="mic" label="Start recording" onClick={() => { }} />
            <HeaderBtn icon="upload_file" label="Upload File" filled color="var(--color-secondary)" onClick={handleUploadClick} />
            <HeaderBtn icon="edit" label="Edit Profile" onClick={() => setShowEditModal(true)} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 32, alignItems: "start" }}>

        {/* --- Left Sidebar Navigation ------------------- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 24 }}>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", paddingLeft: 12, marginBottom: 8 }}>PATIENT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <SidebarBtn
                active={activeTab === "Overview"}
                onClick={() => setActiveTab("Overview")}
                icon="dashboard"
                label="Overview"
              />
              <SidebarBtn
                active={activeTab === "Profile"}
                onClick={() => setActiveTab("Profile")}
                icon="person"
                label="Profile"
              />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", paddingLeft: 12, marginBottom: 8 }}>CLINICAL</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <SidebarBtn
                active={activeTab === "Session"}
                onClick={() => setActiveTab("Session")}
                icon="event_note"
                label="Session"
              />
              <SidebarBtn
                active={activeTab === "Treatment Plan"}
                onClick={() => setActiveTab("Treatment Plan")}
                icon="medical_services"
                label="Treatment Plan"
              />
              <SidebarBtn
                active={activeTab === "Diagnosis"}
                onClick={() => setActiveTab("Diagnosis")}
                icon="medical_information"
                label="Diagnosis"
              />
              <SidebarBtn
                active={activeTab === "Appointments"}
                onClick={() => setActiveTab("Appointments")}
                icon="calendar_today"
                label="Appointments"
              />
              <SidebarBtn
                active={activeTab === "Medications & Allergies"}
                onClick={() => setActiveTab("Medications & Allergies")}
                icon="medication"
                label="Medications & Allergies"
              />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-on-surface-variant)", letterSpacing: "0.08em", paddingLeft: 12, marginBottom: 8 }}>ADMINISTRATIVE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <SidebarBtn
                active={activeTab === "Clinic Notes"}
                onClick={() => setActiveTab("Clinic Notes")}
                icon="edit_note"
                label="Clinic Notes"
              />
              <SidebarBtn
                active={activeTab === "Compliance"}
                onClick={() => setActiveTab("Compliance")}
                icon="verified_user"
                label="Compliance"
              />
              <SidebarBtn
                active={activeTab === "Documents"}
                onClick={() => setActiveTab("Documents")}
                icon="folder"
                label="Documents"
              />
              <SidebarBtn
                active={activeTab === "Billing Records"}
                onClick={() => setActiveTab("Billing Records")}
                icon="receipt_long"
                label="Billing Records"
              />
            </div>
          </div>

        </div>

        {/* --- Right Main Content Area -------------------------------- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Top Action Buttons moved to Patient Header Card */}

          {activeTab === "Overview" && <OverviewView />}
          {activeTab === "Profile" && <ProfileView patient={patient} loading={loadingPatient} />}
          {activeTab === "Session" && (
            <SessionTable
              sessions={sessions}
              folderId={notesId}
              onOpenNote={(docId) => {
                setSelectedDocId(docId);
                setIsDetailModalOpen(true);
              }}
            />
          )}
          {activeTab === "Treatment Plan" && (
            <TreatmentPlanView
              plans={treatmentPlans}
              onViewPlan={(plan) => {
                setSelectedPlan(plan);
                setIsPlanDetailModalOpen(true);
              }}
              onSetPlan={() => setIsTreatmentPlanModalOpen(true)}
            />
          )}
          {activeTab === "Diagnosis" && <TierUpgradeCard featureName="Diagnosis" tier={3} />}
          {activeTab === "Appointments" && <AppointmentsView onSetAppointment={() => setIsAppointmentModalOpen(true)} />}
          {activeTab === "Medications & Allergies" && <MedicationsAndAllergiesView onAddMedication={() => setIsMedicationModalOpen(true)} />}
          {activeTab === "Compliance" && <TierUpgradeCard featureName="Compliance" tier={3} />}
          {activeTab === "Billing Records" && <TierUpgradeCard featureName="Billing Records" tier={2} />}
          {activeTab === "Clinic Notes" && (
            <ClinicNotesView
              documents={documents}
              patient={patient}
              onOpenNote={(docId) => {
                setSelectedDocId(docId);
                setIsDetailModalOpen(true);
              }}
            />
          )}
          {activeTab === "Documents" && (
            <DocumentsView
              parentFolder={folder}
              patient={patient}
              onOpenNote={(docId) => {
                setSelectedDocId(docId);
                setIsDetailModalOpen(true);
              }}
              onUploadClick={(folderId) => {
                setUploadFolderId(folderId);
                setIsUploadModalOpen(true);
              }}
            />
          )}

        </div> {/* End of Right Main Content Area */}
      </div> {/* End of Grid Wrapper */}

      {/* --- Upload modal ---------------------------------------------- */}
      {isUploadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 500
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 16 }}>Upload File</h3>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Document Name (optional)</label>
                <input
                  type="text"
                  name="documentName"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                  placeholder="Enter document name"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Document Type (optional)</label>
                <select
                  name="documentType"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                >
                  <option value="">Auto-detect</option>
                  <option value={DocumentType.COMPLIANCE}>Compliance</option>
                  <option value={DocumentType.CLINIC_NOTES}>Clinic Notes</option>
                  <option value={DocumentType.GENERAL}>General</option>
                  <option value={DocumentType.BILLING}>Billing</option>
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Select File</label>
                <input
                  type="file"
                  name="file"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px dashed var(--color-outline-variant)',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--color-outline-variant)',
                    background: 'transparent',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--color-secondary)',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Appointment modal ---------------------------------------------- */}
      {isAppointmentModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 500
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 16 }}>Set Appointment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              showToast("Appointment successfully scheduled!", "success");
              setIsAppointmentModalOpen(false);
            }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Appointment Name</label>
                <input type="text" placeholder="Enter appointment name" required style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Date</label>
                  <input type="date" required style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Time</label>
                  <input type="time" required style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14 }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Provider</label>
                <select required style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14 }}>
                  <option value="">Select provider</option>
                  <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins</option>
                  <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Location</label>
                <select required style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14 }}>
                  <option value="Telehealth">Telehealth</option>
                  <option value="In-Person (Main Clinic)">In-Person (Main Clinic)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAppointmentModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--color-outline-variant)', background: 'transparent', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#ffffff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Treatment Plan modal ---------------------------------------------- */}
      <TreatmentPlanModal
        isOpen={isTreatmentPlanModalOpen}
        onClose={() => setIsTreatmentPlanModalOpen(false)}
        patient={patient}
        sessions={sessions}
        onSave={() => {
          showToast("Treatment plan successfully created!", "success");
          fetchFolder();
        }}
      />

      <TreatmentPlanDetailModal
        isOpen={isPlanDetailModalOpen}
        onClose={() => {
          setIsPlanDetailModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onUpdate={fetchFolder}
      />

      {/* --- Medication modal ---------------------------------------------- */}
      {isMedicationModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 24 }}>Add Medication</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              showToast("Medication successfully added!", "success");
              setIsMedicationModalOpen(false);
            }}>

              {/* Medication Input */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Medication *</label>
                <input type="text" required style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14 }} />
                <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 6 }}>Search, then select the specific form and strength</div>
              </div>

              {/* Dosage Instructions */}
              <h4 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0', color: 'var(--color-on-surface)' }}>Dosage Instructions</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ position: 'absolute', top: -8, left: 12, background: 'var(--color-surface-container-lowest)', padding: '0 4px', fontSize: 12, color: 'var(--color-on-surface-variant)' }}>Dose</label>
                  <input type="text" defaultValue="-" style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ position: 'absolute', top: -8, left: 12, background: 'var(--color-surface-container-lowest)', padding: '0 4px', fontSize: 12, color: 'var(--color-on-surface-variant)' }}>Unit</label>
                  <select style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14, appearance: 'none', background: 'transparent' }}>
                    <option value=""></option>
                    <option value="tablet">tablet</option>
                    <option value="capsule">capsule</option>
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="gram">gram</option>
                    <option value="puff">puff</option>
                    <option value="patch">patch</option>
                    <option value="drop">drop</option>
                    <option value="spray">spray</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: 12, top: 12, fontSize: 20, pointerEvents: 'none', color: 'var(--color-on-surface-variant)' }}>arrow_drop_down</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ position: 'absolute', top: -8, left: 12, background: 'var(--color-surface-container-lowest)', padding: '0 4px', fontSize: 12, color: 'var(--color-on-surface-variant)' }}>Route</label>
                  <select style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14, appearance: 'none', background: 'transparent' }}>
                    <option value=""></option>
                    <option value="oral">oral</option>
                    <option value="topical">topical</option>
                    <option value="inhalation">inhalation</option>
                    <option value="injection">injection</option>
                    <option value="intravenous">intravenous</option>
                    <option value="intramuscular">intramuscular</option>
                    <option value="nasal">nasal</option>
                    <option value="ophthalmic">ophthalmic</option>
                    <option value="otic">otic</option>
                    <option value="rectal">rectal</option>
                    <option value="subcutaneous">subcutaneous</option>
                    <option value="sublingual">sublingual</option>
                    <option value="transdermal">transdermal</option>
                    <option value="vaginal">vaginal</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: 12, top: 12, fontSize: 20, pointerEvents: 'none', color: 'var(--color-on-surface-variant)' }}>arrow_drop_down</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ position: 'absolute', top: -8, left: 12, background: 'var(--color-surface-container-lowest)', padding: '0 4px', fontSize: 12, color: 'var(--color-on-surface-variant)' }}>Frequency</label>
                  <select style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14, appearance: 'none', background: 'transparent' }}>
                    <option value=""></option>
                    <option value="once a day">once a day</option>
                    <option value="twice a day">twice a day</option>
                    <option value="thrice a day">thrice a day</option>
                    <option value="four times a day">four times a day</option>
                    <option value="every 4 hours">every 4 hours</option>
                    <option value="every 6 hours">every 6 hours</option>
                    <option value="every 8 hours">every 8 hours</option>
                    <option value="every 12 hours">every 12 hours</option>
                    <option value="at bedtime">at bedtime</option>
                    <option value="in the morning">in the morning</option>
                    <option value="in the afternoon">in the afternoon</option>
                    <option value="in the evening">in the evening</option>
                    <option value="as needed">as needed</option>
                    <option value="every day">every day</option>
                    <option value="every week">every week</option>
                    <option value="every month">every month</option>
                    <option value="every year">every year</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: 12, top: 12, fontSize: 20, pointerEvents: 'none', color: 'var(--color-on-surface-variant)' }}>arrow_drop_down</span>
                </div>
                <div>
                  <input type="text" placeholder="Duration (days)" style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <input type="text" placeholder="Quantity" style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <input type="text" placeholder="Refills" style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" style={{ width: 18, height: 18, cursor: 'pointer' }} />
                  <label style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', lineHeight: 1.2 }}>PRN (As<br />Needed)</label>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <textarea placeholder="Additional Instructions" rows={3} style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18, cursor: 'pointer' }} />
                <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>Currently Taking</label>
              </div>

              {/* Notes */}
              <h4 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px 0', color: 'var(--color-on-surface)' }}>Notes</h4>
              <div style={{ marginBottom: 32 }}>
                <textarea placeholder="Internal Comment" rows={3} style={{ width: '100%', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--color-outline-variant)' }}>
                <button type="button" onClick={() => setIsMedicationModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--color-outline-variant)', background: 'transparent', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#ffffff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit Patient Modal ------------------------------------------- */}
      {showEditModal && patient && (
        <PatientFormModal
          mode="edit"
          editPatientId={patient.id}
          initialData={{
            firstName: patient.firstname,
            lastName: patient.lastname,
            dob: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split("T")[0] : "",
            gender: patient.gender,
            diagnosis: patient.intakeNotes?.diagnosis || "",
            provider: patient.staffId || "none",
            phone: patient.contactInformation?.phone || "",
            email: patient.contactInformation?.email || "",
            address: patient.contactInformation?.address || "",
            city: patient.contactInformation?.city || "",
            zip: patient.contactInformation?.zip || "",
            emergencyName: patient.emergencyContact?.name || "",
            emergencyRelationship: patient.emergencyContact?.relationship || "",
            emergencyPhone: patient.emergencyContact?.phone || "",
            notes: patient.intakeNotes?.notes || "",
          }}
          onClose={() => setShowEditModal(false)}
          onSave={() => fetchFolder()}
        />
      )}

      {/* --- Clinic Note Detail Modal ------------------------------------- */}
      {isDetailModalOpen && selectedDocId && patient && (
        <ClinicNoteDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          documentId={selectedDocId}
          patient={patient}
          onUpdate={() => {
            fetchFolder();
            setIsDetailModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ClinicNotesView({
  documents,
  patient,
  onOpenNote,
}: {
  documents: any[];
  patient: any;
  onOpenNote: (docId: string) => void;
}) {
  const notes = documents.filter(
    (doc) => doc.documentType === DocumentType.CLINIC_NOTES && doc.clinicNote
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "var(--color-surface-container-lowest)",
        padding: "16px 20px",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: 12
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>Clinical Notes</h3>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "var(--color-on-surface-variant)" }}>
            List of all clinical documents and evaluations for this patient.
          </p>
        </div>
      </div>

      {notes.length === 0 ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "60px 24px",
          background: "var(--color-surface-container-lowest)",
          border: "1px dashed var(--color-outline)",
          borderRadius: 12,
          textAlign: "center"
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-outline)" }}>edit_note</span>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)" }}>No Clinical Notes</h4>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-on-surface-variant)", maxWidth: 320 }}>
              There are no clinical notes documented for this patient.
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 20
        }}>
          {notes.map((doc) => {
            const clinicNote = doc.clinicNote;
            const versions = clinicNote?.versions || [];
            const latestVersion = versions[0];
            
            if (!latestVersion) return null;

            const versionNum = latestVersion.version;
            const title = latestVersion.title || doc.name || "Untitled Note";
            const noteType = latestVersion.noteType || "Session Note";
            const program = latestVersion.program && latestVersion.program !== "None" ? latestVersion.program : "";
            const status = (latestVersion.status || "DRAFT").toUpperCase();
            
            // Format content plain text snippet
            const plainText = cleanMarkdownToPlainText(latestVersion.content || "");
            const snippet = plainText.slice(0, 140) + (plainText.length > 140 ? "..." : "");

            // Edited by info
            const editorName = latestVersion.editedBy 
              ? `${latestVersion.editedBy.firstname} ${latestVersion.editedBy.lastname}`
              : "System";
              
            // Date formatting
            const dateStr = new Date(latestVersion.createdAt || doc.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            // Badge styling
            let statusBg = "#fff8e1";
            let statusColor = "#f57c00";
            let statusBorder = "1px solid #ffe082";
            let statusIcon = "edit_document";

            if (status === "SIGNED") {
              statusBg = "#e6f4ea";
              statusColor = "#137333";
              statusBorder = "1px solid #c2e7c9";
              statusIcon = "check_circle";
            } else if (status === "LOCKED") {
              statusBg = "#f3e5f5";
              statusColor = "#7b1fa2";
              statusBorder = "1px solid #e1bee7";
              statusIcon = "lock";
            }

            return (
              <div
                key={doc.id}
                onClick={() => onOpenNote(doc.id)}
                style={{
                  background: "var(--color-surface-container-lowest)",
                  border: "1px solid var(--color-outline-variant)",
                  borderRadius: 12,
                  padding: 20,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  transition: "all 0.2s ease-in-out",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                  e.currentTarget.style.borderColor = "var(--color-outline-variant)";
                }}
              >
                <div>
                  {/* Top Badge Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    {/* Status Badge */}
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 8px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: statusBg,
                      color: statusColor,
                      border: statusBorder
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{statusIcon}</span>
                      {status}
                    </span>

                    {/* Version Badge */}
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      background: "var(--color-surface-container-low)",
                      border: "1px solid var(--color-outline-variant)",
                      color: "var(--color-on-surface-variant)"
                    }}>
                      v{versionNum}
                    </span>
                  </div>

                  {/* Note Title */}
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 700, color: "var(--color-on-surface)", lineHeight: 1.3 }}>
                    {title}
                  </h4>

                  {/* Subtitle / Program / Note Type */}
                  <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)", display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                    <span>{noteType}</span>
                    {program && (
                      <>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--color-outline)" }} />
                        <span>{program}</span>
                      </>
                    )}
                  </div>

                  {/* Snippet */}
                  <p style={{
                    margin: 0,
                    fontSize: 13,
                    color: "var(--color-on-surface-variant)",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minHeight: 58
                  }}>
                    {snippet || <span style={{ fontStyle: "italic", color: "#86868b" }}>No content in note.</span>}
                  </p>
                </div>

                {/* Footer / Editor & Timestamp */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: "1px solid var(--color-outline-variant)",
                  fontSize: 11,
                  color: "var(--color-on-surface-variant)"
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
                    By {editorName}
                  </span>
                  <span>{dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   Shared Sub-components
========================================================================== */

function HeaderBtn({ icon, label, color, filled, onClick }: { icon: string; label: string; color?: string; filled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
        border: filled ? "none" : `1px solid ${color ?? "var(--color-outline-variant)"}`,
        background: filled ? (color ?? "var(--color-secondary)") : "transparent",
        fontSize: 13, fontWeight: 600,
        color: filled ? "#ffffff" : (color ?? "var(--color-on-surface)"),
        cursor: "pointer", transition: "all 0.12s",
      }}
      onMouseOver={(e) => {
        if (filled) e.currentTarget.style.opacity = "0.9";
        else e.currentTarget.style.background = "var(--color-surface-container)";
      }}
      onMouseOut={(e) => {
        if (filled) e.currentTarget.style.opacity = "1";
        else e.currentTarget.style.background = "transparent";
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>{label}
    </button>
  );
}

function SidebarBtn({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8,
        border: "none",
        background: active ? "var(--color-primary-container)" : "transparent",
        color: active ? "#ffffff" : "var(--color-on-surface-variant)",
        fontSize: 14, fontWeight: active ? 600 : 500,
        cursor: "pointer", transition: "all 0.12s", textAlign: "left", width: "100%"
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.currentTarget.style.background = "var(--color-surface-container)";
          e.currentTarget.style.color = "var(--color-on-surface)";
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--color-on-surface-variant)";
        }
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>{label}
    </button>
  );
}

function SessionTable({
  sessions,
  folderId,
  onOpenNote
}: {
  sessions: any[];
  folderId: string;
  onOpenNote: (docId: string) => void;
}) {
  const router = useRouter();

  // Helper to format date
  const formatSessionDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      }) + " at " + d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>Session Table</h3>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8f9fb", borderTop: "1px solid var(--color-outline-variant)", borderBottom: "1px solid var(--color-outline-variant)" }}>
            {["S/N", "SESSION ID", "SESSION NAME", "DATE & TIME", "LOCATION", "STATUS", "CLINICAL NOTE"].map((h) => (
              <th key={h} style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sessions.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: "32px 20px", textAlign: "center", fontSize: 14, color: "var(--color-on-surface-variant)" }}>
                No sessions found for this patient.
              </td>
            </tr>
          ) : (
            sessions.map((session, idx) => {
              const clinicNoteDoc = session.recordings?.find(
                (r: any) => r.documentType === "CLINIC_NOTES"
              );

              return (
                <tr key={session.id} style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--color-on-surface-variant)", fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>{session.sessionId}</td>
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--color-on-surface)", fontWeight: 600 }}>{session.name}</td>
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>{formatSessionDate(session.startDate)}</td>
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>{session.location || "Telehealth"}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: session.status === "Completed" ? "#e6f4ea" : "#e8f0fe",
                      color: session.status === "Completed" ? "#137333" : "#1a73e8"
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: session.status === "Completed" ? "#137333" : "#1a73e8" }} />
                      {session.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    {clinicNoteDoc ? (
                      <button 
                        onClick={() => onOpenNote(clinicNoteDoc.documentId)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid #1a73e8",
                          background: "#e8f0fe",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#1a73e8",
                          cursor: "pointer"
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                        View Note
                      </button>
                    ) : (
                      <button 
                        onClick={() => router.push(`/clinic-notes/${folderId}/new?sessionId=${session.id}`)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid var(--color-outline-variant)",
                          background: "#f8f9fb",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--color-on-surface-variant)",
                          cursor: "pointer"
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>note_add</span>
                        Empty
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function TierUpgradeCard({ featureName, tier }: { featureName: string; tier: number }) {
  return (
    <div style={{
      background: "var(--color-surface-container-lowest)",
      border: "1px dashed var(--color-outline)",
      borderRadius: 12,
      padding: 48,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 16
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "#fff8e1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#f57c00" }}>workspace_premium</span>
      </div>

      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px 0", color: "var(--color-on-surface)" }}>
          {featureName} is a Tier {tier} feature
        </h3>
        <p style={{ margin: 0, fontSize: 14, color: "var(--color-on-surface-variant)", maxWidth: 400, lineHeight: 1.5 }}>
          Upgrade your plan to unlock {featureName.toLowerCase()} and other advanced clinical tools for your practice.
        </p>
      </div>
    </div>
  );
}

function AppointmentsView({ onSetAppointment }: { onSetAppointment: () => void }) {
  const upcoming = [
    { id: 1, date: "Jul 12, 2026 at 10:00 AM", type: "Follow-up Consultation", provider: "Dr. Sarah Jenkins", status: "Confirmed" }
  ];

  const past = [
    { id: 2, date: "Jun 15, 2026 at 02:30 PM", type: "Initial Intake", provider: "Dr. Sarah Jenkins", status: "Completed" },
    { id: 3, date: "May 10, 2026 at 11:00 AM", type: "General Assessment", provider: "Dr. Sarah Jenkins", status: "Completed" }
  ];

  const AppointmentCard = ({ appt, isPast }: { appt: any, isPast: boolean }) => (
    <div style={{
      padding: 16,
      border: "1px solid var(--color-outline-variant)",
      borderRadius: 8,
      background: "var(--color-surface-container-lowest)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <h4 style={{ margin: "0 0 6px 0", fontSize: 15, color: "var(--color-on-surface)" }}>{appt.type}</h4>
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
            {appt.date}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
            {appt.provider}
          </span>
        </div>
      </div>
      <div>
        <span style={{
          padding: "4px 10px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          background: isPast ? "#f1f3f4" : "#e6f4ea",
          color: isPast ? "#5f6368" : "#137333"
        }}>
          {appt.status}
        </span>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Header and Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-surface-container-lowest)", padding: "16px 20px", border: "1px solid var(--color-outline-variant)", borderRadius: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>Appointments</h3>
        <button
          onClick={onSetAppointment}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
            border: "none", background: "var(--color-primary)", color: "#ffffff",
            fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Set Appointment
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Upcoming */}
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 4 }}>Upcoming Appointments</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcoming.map(appt => <AppointmentCard key={appt.id} appt={appt} isPast={false} />)}
          </div>
        </div>

        {/* Past */}
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 4 }}>Past Appointments</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {past.map(appt => <AppointmentCard key={appt.id} appt={appt} isPast={true} />)}
          </div>
        </div>
      </div>

    </div>
  );
}

function TreatmentPlanView({
  plans,
  onViewPlan,
  onSetPlan
}: {
  plans: any[];
  onViewPlan: (plan: any) => void;
  onSetPlan: () => void;
}) {
  const activePlans = plans.filter(p => p.status === "ACTIVE" || p.status === "DRAFT");
  const completedPlans = plans.filter(p => p.status === "COMPLETED");

  const PlanCard = ({ plan, isPast }: { plan: any, isPast: boolean }) => (
    <div
      onClick={() => onViewPlan(plan)}
      style={{
        padding: 16,
        border: "1px solid var(--color-outline-variant)",
        borderRadius: 8,
        background: "var(--color-surface-container-lowest)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        transition: "box-shadow 0.2s"
      }}
      onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)"}
      onMouseOut={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div>
        <h4 style={{ margin: "0 0 6px 0", fontSize: 15, color: "var(--color-on-surface)", fontWeight: 600 }}>{plan.title}</h4>
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
            {new Date(plan.createdAt).toLocaleDateString()}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
            {plan.createdBy?.firstname} {plan.createdBy?.lastname}
          </span>
          {plan.diagnosis && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>healing</span>
              {plan.diagnosis}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          padding: "4px 10px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          background: plan.status === "ACTIVE" ? "#e6f4ea" : plan.status === "COMPLETED" ? "#e8f0fe" : "#f1f3f4",
          color: plan.status === "ACTIVE" ? "#137333" : plan.status === "COMPLETED" ? "#1a73e8" : "#5f6368"
        }}>
          {plan.status}
        </span>
        <span className="material-symbols-outlined" style={{ color: "var(--color-primary)", fontSize: 18 }}>chevron_right</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Header and Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-surface-container-lowest)", padding: "16px 20px", border: "1px solid var(--color-outline-variant)", borderRadius: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>Treatment Plans</h3>
        <button
          onClick={onSetPlan}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
            border: "none", background: "var(--color-primary)", color: "#ffffff",
            fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Create Treatment Plan
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Active & Draft */}
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 4 }}>Active & Draft Treatment Plans</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activePlans.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", border: "1px dashed var(--color-outline-variant)", borderRadius: 8, color: "var(--color-on-surface-variant)", fontSize: 13 }}>
                No active or draft treatment plans found.
              </div>
            ) : (
              activePlans.map(plan => <PlanCard key={plan.id} plan={plan} isPast={false} />)
            )}
          </div>
        </div>

        {/* Completed */}
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 4 }}>Completed Treatment Plans</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {completedPlans.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", border: "1px dashed var(--color-outline-variant)", borderRadius: 8, color: "var(--color-on-surface-variant)", fontSize: 13 }}>
                No completed treatment plans found.
              </div>
            ) : (
              completedPlans.map(plan => <PlanCard key={plan.id} plan={plan} isPast={true} />)
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function OverviewView() {
  const notesReadyForReview = [
    { id: "SES-76137", title: "Cognitive Behavioural Therapy", date: "Jul 10, 2026", provider: "Dr. Sarah Jenkins" }
  ];

  const nextAppointment = {
    date: "Jul 12, 2026 at 10:00 AM",
    type: "Follow-up Consultation",
    provider: "Dr. Sarah Jenkins",
    location: "Telehealth"
  };

  const lastSession = {
    id: "SES-76136",
    title: "Initial Assessment",
    date: "Jun 15, 2026",
    status: "Signed",
    provider: "Dr. Sarah Jenkins"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Notes Ready For Review */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>Notes Ready for Review</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notesReadyForReview.map((note, i) => (
            <div key={i} style={{ padding: 16, border: "1px solid var(--color-outline-variant)", borderRadius: 8, background: "var(--color-surface-container-lowest)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div>
                <h4 style={{ margin: "0 0 6px 0", fontSize: 15, color: "var(--color-on-surface)" }}>{note.title} <span style={{ fontSize: 13, color: "var(--color-on-surface-variant)", fontWeight: 500 }}>({note.id})</span></h4>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>{note.date}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>{note.provider}</span>
                </div>
              </div>
              <button style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--color-primary)", background: "var(--color-primary)", color: "#ffffff", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }} onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"} onMouseOut={(e) => e.currentTarget.style.opacity = "1"}>
                Review & Sign
              </button>
            </div>
          ))}
          {notesReadyForReview.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", border: "1px dashed var(--color-outline)", borderRadius: 8, color: "var(--color-on-surface-variant)", fontSize: 14 }}>
              No notes pending review.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Next Appointment */}
        <div style={{ padding: 24, border: "1px solid var(--color-outline-variant)", borderRadius: 12, background: "var(--color-surface-container-lowest)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#e8f0fe", color: "#1a73e8", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>calendar_month</span>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Next Appointment</h3>
          </div>
          {nextAppointment ? (
            <div>
              <h4 style={{ margin: "0 0 12px 0", fontSize: 16, color: "var(--color-on-surface)" }}>{nextAppointment.type}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--color-on-surface-variant)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>schedule</span>{nextAppointment.date}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>{nextAppointment.provider}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>videocam</span>{nextAppointment.location}</span>
              </div>
            </div>
          ) : (
            <div style={{ color: "var(--color-on-surface-variant)", fontSize: 14, paddingTop: 8 }}>No upcoming appointments.</div>
          )}
        </div>

        {/* Last Session */}
        <div style={{ padding: 24, border: "1px solid var(--color-outline-variant)", borderRadius: 12, background: "var(--color-surface-container-lowest)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#e6f4ea", color: "#137333", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>history</span>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last Session</h3>
          </div>
          {lastSession ? (
            <div>
              <h4 style={{ margin: "0 0 12px 0", fontSize: 16, color: "var(--color-on-surface)" }}>{lastSession.title}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--color-on-surface-variant)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>tag</span>{lastSession.id}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>{lastSession.date}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="material-symbols-outlined" style={{ fontSize: 18, color: "#137333" }}>check_circle</span><span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>{lastSession.status}</span></span>
              </div>
            </div>
          ) : (
            <div style={{ color: "var(--color-on-surface-variant)", fontSize: 14, paddingTop: 8 }}>No previous sessions.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MedicationsAndAllergiesView({ onAddMedication }: { onAddMedication: () => void }) {
  const activeMedications = [
    { id: 1, name: "Lisinopril 10mg", dose: "1 tablet", frequency: "Daily", status: "Active" }
  ];

  const MedicationCard = ({ med }: { med: any }) => (
    <div style={{
      padding: 16,
      border: "1px solid var(--color-outline-variant)",
      borderRadius: 8,
      background: "var(--color-surface-container-lowest)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <h4 style={{ margin: "0 0 6px 0", fontSize: 15, color: "var(--color-on-surface)" }}>{med.name}</h4>
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--color-on-surface-variant)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>medication</span>
            {med.dose}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>update</span>
            {med.frequency}
          </span>
        </div>
      </div>
      <div>
        <span style={{
          padding: "4px 10px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          background: "#e6f4ea",
          color: "#137333"
        }}>
          {med.status}
        </span>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header and Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-surface-container-lowest)", padding: "16px 20px", border: "1px solid var(--color-outline-variant)", borderRadius: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>Medications & Allergies</h3>
        <button
          onClick={onAddMedication}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
            border: "none", background: "var(--color-primary)", color: "#ffffff",
            fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Add Medication
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface-variant)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 4 }}>Active Medications</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activeMedications.map(med => <MedicationCard key={med.id} med={med} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ patient, loading }: { patient: any; loading: boolean }) {
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        padding: "80px 24px", background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)", borderRadius: 12,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary-container)", animation: "spin 1s linear infinite" }}>progress_activity</span>
        <span style={{ fontSize: 15, fontWeight: 500, color: "var(--color-on-surface-variant)" }}>Loading profile data...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
        padding: "80px 24px", background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)", borderRadius: 12,
      }}>
        <span className="material-symbols-outlined icon-fill" style={{ fontSize: 48, color: "var(--color-error)" }}>error</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-surface)" }}>Patient profile not found.</span>
      </div>
    );
  }

  const contact = patient.contactInformation ?? {};
  const emergency = patient.emergencyContact ?? {};
  const intake = patient.intakeNotes ?? {};

  const emergencyDisplay = emergency.name
    ? `${emergency.name}${emergency.relationship ? ` (${emergency.relationship})` : ""}${emergency.phone ? ` — ${emergency.phone}` : ""}`
    : "—";
  const addressDisplay = [contact.address, contact.city, contact.zip].filter(Boolean).join(", ") || "—";
  const providerDisplay = patient.staff ? `${patient.staff.firstname} ${patient.staff.lastname}` : "None";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
      {/* Left — clinical summary */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card title="Clinical Summary">
          <Row label="Primary Diagnosis" value={intake.diagnosis || "—"} />
          <Row label="Gender" value={patient.gender || "—"} />
          <Row label="Assigned Provider" value={providerDisplay} />
        </Card>
        <Card title="Contact Information">
          <Row label="Phone" value={contact.phone || "—"} />
          <Row label="Email" value={contact.email || "—"} />
          <Row label="Address" value={addressDisplay} />
          <Row label="Emergency Contact" value={emergencyDisplay} />
        </Card>
      </div>
      {/* Right — Profile details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card title="Enrolled Programs">
          {(!patient.patientPrograms || patient.patientPrograms.length === 0) ? (
            <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0 }}>
              Not enrolled in any programs.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {patient.patientPrograms.map((pp: any) => (
                <div
                  key={pp.id}
                  style={{
                    background: "var(--color-surface-container-low)",
                    border: "1px solid var(--color-outline-variant)",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 2px", color: "var(--color-on-surface)" }}>
                        {pp.program.name}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "var(--color-on-surface-variant)" }}>{pp.program.type}</span>
                        <span style={{ fontSize: 11, background: pp.status === "Active" ? "#e6f4ea" : "#fce8e8", color: pp.status === "Active" ? "#137333" : "#b3261e", padding: "1px 6px", borderRadius: 8, fontWeight: 600 }}>
                          {pp.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-on-surface-variant)" }}>
                    Enrolled: {new Date(pp.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-outline-variant)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>{title}</h3>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-outline-variant)" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-on-surface)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

function InfoChip({ icon, text }: { icon: string; text: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>{text}
    </span>
  );
}

interface FolderData {
  id: string;
  folderId: string;
  name: string;
  children?: FolderData[];
  documents?: any[];
}

function DocumentsView({
  parentFolder,
  patient,
  onOpenNote,
  onUploadClick,
}: {
  parentFolder: FolderData | null;
  patient: any;
  onOpenNote: (docId: string) => void;
  onUploadClick: (folderId: string) => void;
}) {
  const [activeFolder, setActiveFolder] = useState<FolderData | null>(null);
  const [activeFolderDocs, setActiveFolderDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const openFolder = useCallback(async (folderObj: FolderData) => {
    setActiveFolder(folderObj);
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/folders/${folderObj.folderId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveFolderDocs(data.documents || []);
      }
    } catch (e) {
      console.error("Failed to load subfolder documents", e);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  const goBack = () => {
    setActiveFolder(null);
    setActiveFolderDocs([]);
  };

  const children = parentFolder?.children || [];

  const getFileExtensionLabel = (fileType: string) => {
    return fileType || "Document";
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (res.ok) {
        if (activeFolder) {
          openFolder(activeFolder);
        }
      } else {
        alert("Failed to delete document.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (activeFolder) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--color-surface-container-lowest)",
          padding: "16px 20px",
          border: "1px solid var(--color-outline-variant)",
          borderRadius: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={goBack}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--color-outline-variant)",
                background: "var(--color-surface-container-low)", color: "var(--color-on-surface)",
                cursor: "pointer", fontSize: 18, transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "var(--color-surface-container-high)"}
              onMouseOut={(e) => e.currentTarget.style.background = "var(--color-surface-container-low)"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                <span>Documents</span>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
                <span>{activeFolder.name}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0 0", color: "var(--color-on-surface)" }}>
                {activeFolder.name}
              </h3>
            </div>
          </div>

          <button
            onClick={() => onUploadClick(activeFolder.folderId)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
              border: "none", background: "var(--color-primary)", color: "#ffffff",
              fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
            Upload File
          </button>
        </div>

        <div style={{
          background: "var(--color-surface-container-lowest)",
          border: "1px solid var(--color-outline-variant)",
          borderRadius: 12,
          overflow: "hidden"
        }}>
          {loadingDocs ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-on-surface-variant)" }}>
              Loading documents...
            </div>
          ) : activeFolderDocs.length === 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "60px 24px",
              textAlign: "center"
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-outline)" }}>folder_open</span>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 600, color: "var(--color-on-surface)" }}>Folder is Empty</h4>
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-on-surface-variant)", maxWidth: 300 }}>
                  Upload a document to start organizing files in this folder.
                </p>
              </div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-low)" }}>
                  {["S/N", "DOCUMENT NAME", "FILE TYPE", "DATE ADDED", "ACTIONS"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 20px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: "var(--color-on-surface-variant)",
                        textAlign: i === 4 ? "right" : "left",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeFolderDocs.map((doc, i) => {
                  const dateStr = new Date(doc.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <tr
                      key={doc.id}
                      style={{
                        borderBottom: i < activeFolderDocs.length - 1 ? "1px solid var(--color-outline-variant)" : "none",
                        transition: "background 0.12s"
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "var(--color-primary-container)", width: "50px" }}>
                        {i + 1}
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <div
                          onClick={() => {
                            if (doc.documentType === "CLINIC_NOTES") {
                              onOpenNote(doc.id);
                            } else if (doc.url) {
                              window.open(doc.url, "_blank");
                            }
                          }}
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--color-on-surface)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                          }}
                          onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                          onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-outline)" }}>
                            {doc.documentType === "CLINIC_NOTES" ? "description" : "draft"}
                          </span>
                          {doc.name || "Untitled Document"}
                        </div>
                      </td>

                      <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                        {getFileExtensionLabel(doc.fileType)}
                      </td>

                      <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                        {dateStr}
                      </td>

                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 28, height: 28, borderRadius: 6, border: "1px solid var(--color-outline-variant)",
                                background: "var(--color-surface-container-low)", color: "var(--color-on-surface)",
                                textDecoration: "none"
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16, margin: "auto" }}>download</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              width: 28, height: 28, borderRadius: 6, border: "1px solid #f8d7da",
                              background: "#f8d7da", color: "#721c24", cursor: "pointer"
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16, margin: "auto" }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: "var(--color-surface-container-lowest)",
        padding: "16px 20px",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: 12
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>Patient Directory</h3>
        <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "var(--color-on-surface-variant)" }}>
          Double-click or click on a folder to view its documents and files.
        </p>
      </div>

      <div style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: 12,
        padding: "32px 24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
        gap: "28px 20px",
        minHeight: 280
      }}>
        {children.map((childFolder) => {
          return (
            <div
              key={childFolder.id}
              onClick={() => openFolder(childFolder)}
              onDoubleClick={() => openFolder(childFolder)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                cursor: "pointer",
                padding: "8px 6px",
                borderRadius: 8,
                transition: "background-color 0.15s, transform 0.1s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.04)";
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div style={{
                position: "relative",
                width: 58,
                height: 48,
                marginBottom: 8,
                background: "linear-gradient(135deg, #ffd54f 0%, #ffb300 100%)",
                borderRadius: "4px 8px 4px 4px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center"
              }}>
                <div style={{
                  position: "absolute",
                  top: -6,
                  left: 0,
                  width: 20,
                  height: 8,
                  background: "#ffd54f",
                  borderRadius: "3px 3px 0 0"
                }} />
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "85%",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.05) 100%)",
                  borderRadius: "2px 7px 3px 3px",
                  borderTop: "1px solid rgba(255,255,255,0.25)"
                }} />
                <span className="material-symbols-outlined" style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.75)",
                  marginBottom: 6,
                  zIndex: 2,
                  textShadow: "0 1px 2px rgba(0,0,0,0.15)"
                }}>
                  {childFolder.name.includes("Clinic") ? "edit_note" :
                   childFolder.name.includes("Billing") ? "payments" :
                   childFolder.name.includes("Compliance") ? "verified_user" : "folder"}
                </span>
              </div>

              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-on-surface)",
                lineHeight: 1.3,
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                padding: "0 4px"
              }}>
                {childFolder.name}
              </span>
            </div>
          );
        })}

        {children.length === 0 && (
          <div style={{
            gridColumn: "1 / -1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            textAlign: "center",
            padding: "40px 0",
            color: "var(--color-on-surface-variant)"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-outline)" }}>folder_zip</span>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 600 }}>No Folders Available</h4>
              <p style={{ margin: 0, fontSize: 13 }}>There are no folders configured for this patient directory.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

