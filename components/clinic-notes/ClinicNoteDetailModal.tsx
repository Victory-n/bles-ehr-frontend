"use client";

import React, { useState, useRef } from "react";

interface PatientData {
  name: string;
  dob: string;
  age: number;
  ehr: string;
  provider: string;
  status: string;
}

interface ClinicNoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteName: string;
  noteDate: string;
  patient: PatientData;
}

export default function ClinicNoteDetailModal({
  isOpen,
  onClose,
  noteName,
  noteDate,
  patient,
}: ClinicNoteDetailModalProps) {
  const [activeSection, setActiveSection] = useState<"Subjective" | "Objective" | "Assessment" | "Plan">("Subjective");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const subjectiveRef = useRef<HTMLDivElement>(null);
  const objectiveRef = useRef<HTMLDivElement>(null);
  const assessmentRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Extract patient initials
  const names = patient.name.split(", ");
  const lastName = names[0] || "";
  const firstName = names[1] || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const displayName = `${firstName} ${lastName}`;

  const scrollToSection = (section: "Subjective" | "Objective" | "Assessment" | "Plan", ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveSection(section);
    if (ref.current && scrollContainerRef.current) {
      const topPos = ref.current.offsetTop - 20; // 20px padding offset
      scrollContainerRef.current.scrollTo({
        top: topPos,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          transition: "opacity 0.2s ease",
        }}
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "80%",
          maxWidth: "1000px",
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

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid #e5e5e7",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#86868b" }}>description</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#86868b" }}>Progress Note</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#86868b" }} />
            
            {/* Status Chips */}
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 12,
              backgroundColor: "#e8f0fe",
              color: "#1a73e8",
              fontSize: 11,
              fontWeight: 600,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#1a73e8" }} />
              Locked
            </span>
            <span style={{
              padding: "2px 8px",
              borderRadius: 12,
              backgroundColor: "#f5f5f7",
              color: "#515154",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.03em"
            }}>
              HIPAA LOCKED
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d2d2d7",
              background: "#ffffff",
              fontSize: 13,
              fontWeight: 500,
              color: "#1d1d1f",
              cursor: "pointer",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>history</span>
              History
            </button>
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

        {/* ── Document Details ────────────────────────────────────────────── */}
        <div style={{ padding: "24px 32px 16px 32px", borderBottom: "1px solid #e5e5e7" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 16px 0", color: "#1d1d1f" }}>
            CBT Session Progress Note — Week 14
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
            {/* Patient Name Box */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: "#e3f2fd",
                color: "#1e88e5",
                fontSize: 12,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {initials}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{displayName}</span>
              <span style={{
                padding: "2px 6px",
                borderRadius: 4,
                backgroundColor: "#f5f5f7",
                color: "#86868b",
                fontSize: 11,
                fontWeight: 600,
              }}>{patient.ehr}</span>
            </div>

            <span style={{ color: "#d2d2d7" }}>|</span>

            {/* Author */}
            <span style={{ fontSize: 14, color: "#515154" }}>
              Author: <strong style={{ fontWeight: 600, color: "#1d1d1f" }}>{patient.provider}</strong>
            </span>

            <span style={{ color: "#d2d2d7" }}>|</span>

            {/* Date Created */}
            <span style={{ fontSize: 14, color: "#86868b" }}>
              Created: {noteDate}
            </span>
          </div>

          {/* Signature Details Row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#86868b", marginBottom: 16 }}>
            <span>Signed: <strong style={{ color: "#137333", fontWeight: 500 }}>{noteDate}, 04:15 PM</strong></span>
            <span>Co-signed: <strong style={{ color: "#137333", fontWeight: 500 }}>{noteDate}, 05:00 PM</strong></span>
            <span style={{ marginLeft: "auto", fontSize: 12 }}>v3 • NOTE-001</span>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: 8 }}>
            {["#CBT", "#Depression", "#Homework Review"].map(tag => (
              <span key={tag} style={{
                padding: "4px 12px",
                borderRadius: 16,
                backgroundColor: "#f5f5f7",
                color: "#515154",
                fontSize: 12,
                fontWeight: 500,
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Co-signatures Banner ────────────────────────────────────────── */}
        <div style={{
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #e5e5e7",
          padding: "12px 32px",
          display: "flex",
          gap: 40,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1d1d1f" }}>
            <span className="material-symbols-outlined icon-fill" style={{ color: "#137333", fontSize: 18 }}>check_circle</span>
            <span>
              Signed by <strong style={{ fontWeight: 600 }}>{patient.provider}</strong> on {noteDate}, 04:15 PM
            </span>
          </div>
          <div style={{ width: 1, height: 18, backgroundColor: "#e5e5e7", alignSelf: "center" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1d1d1f" }}>
            <span className="material-symbols-outlined" style={{ color: "#1d1d1f", fontSize: 18 }}>lock</span>
            <span>
              Co-signed by <strong style={{ fontWeight: 600 }}>Dr. Amaka Kolade</strong> on {noteDate}, 05:00 PM
            </span>
          </div>
        </div>

        {/* ── Split Layout Content ────────────────────────────────────────── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left Navigation Sidebar */}
          <div style={{
            width: 180,
            borderRight: "1px solid #e5e5e7",
            padding: "20px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            backgroundColor: "#ffffff",
          }}>
            {(["Subjective", "Objective", "Assessment", "Plan"] as const).map((sec) => {
              const refs = {
                Subjective: subjectiveRef,
                Objective: objectiveRef,
                Assessment: assessmentRef,
                Plan: planRef,
              };
              const isSelected = activeSection === sec;
              return (
                <button
                  key={sec}
                  onClick={() => scrollToSection(sec, refs[sec])}
                  style={{
                    padding: "8px 16px",
                    textAlign: "left",
                    borderRadius: 6,
                    border: "none",
                    background: isSelected ? "#e3f2fd" : "transparent",
                    color: isSelected ? "#0d47a1" : "#515154",
                    fontSize: 14,
                    fontWeight: isSelected ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >
                  {sec}
                </button>
              );
            })}
          </div>

          {/* Right Monospace Document Area */}
          <div
            ref={scrollContainerRef}
            style={{
              flex: 1,
              padding: "32px",
              overflowY: "auto",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 14,
              lineHeight: "1.7",
              color: "#1d1d1f",
              backgroundColor: "#ffffff",
              scrollBehavior: "smooth",
            }}
          >
            {/* Subjective */}
            <div ref={subjectiveRef} style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px 0" }}>SUBJECTIVE:</h3>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                Patient {displayName} ({patient.ehr}) presented for her 14th CBT session. She reports a subjective mood rating of 5/10 this week, compared to 4/10 at last session – a slight improvement. She completed the thought record homework assigned last week, documenting 4 negative automatic thoughts with associated evidence for and against.
                {"\n\n"}
                She reports improved sleep over the past 5 days, averaging 6-7 hours compared to 4-5 hours previously. Appetite remains suppressed, particularly in the mornings. She denied suicidal ideation, self-harm, or intent.
                {"\n\n"}
                Notable stressor this week: conflict with her supervisor at work, which she identified as a trigger for a "catastrophising" thought pattern ("I'll lose my job and everything will fall apart").
              </p>
            </div>

            {/* Objective */}
            <div ref={objectiveRef} style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px 0" }}>OBJECTIVE:</h3>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                Patient appeared well-groomed and appropriately dressed. Affect was mildly restricted but brighter than previous session. Maintained good eye contact. Speech was normal in rate, rhythm, and volume. Thought process was logical and goal-directed. No signs of psychomotor agitation or retardation observed.
              </p>
            </div>

            {/* Assessment */}
            <div ref={assessmentRef} style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px 0" }}>ASSESSMENT:</h3>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {firstName} is demonstrating gradual improvement in depressive symptoms (F32.1 Major depressive disorder, single episode, moderate). She is successfully applying cognitive restructuring techniques to workplace stressors, though she still experiences significant anxiety preceding interactions with her supervisor. Insight is good; judgment is intact. The therapeutic alliance remains strong.
              </p>
            </div>

            {/* Plan */}
            <div ref={planRef} style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px 0" }}>PLAN:</h3>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                1. Continue weekly CBT sessions focusing on cognitive restructuring for workplace anxiety.
                {"\n"}
                2. Homework assignment: Complete thought record for any instances of "catastrophizing" automatic thoughts.
                {"\n"}
                3. Monitor medication compliance and side effects.
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid #e5e5e7",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
        }}>
          <span style={{ fontSize: 12, color: "#86868b" }}>
            NOTE-001 • Version 3 • 285 words
          </span>
          <button style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: "#f5f5f7",
            fontSize: 13,
            fontWeight: 600,
            color: "#1d1d1f",
            cursor: "pointer",
            transition: "background 0.12s",
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#e8e8ed"}
          onMouseOut={(e) => e.currentTarget.style.background = "#f5f5f7"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
            Download PDF
          </button>
        </div>
      </div>
    </>
  );
}
