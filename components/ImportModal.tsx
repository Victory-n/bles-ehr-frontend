"use client";

import React, { useState } from "react";

interface Props {
  onClose: () => void;
  onImportSuccess?: () => void;
}

interface ImportFailure {
  row: number;
  name: string;
  reason: string;
}

interface ImportSuccess {
  name: string;
  patientId: string;
}

interface ImportReport {
  successCount: number;
  failedCount: number;
  failures: ImportFailure[];
  importedPatients: ImportSuccess[];
}

export default function ImportModal({ onClose, onImportSuccess }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "importing" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [report, setReport] = useState<ImportReport | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (isValidExcelFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (isValidExcelFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const isValidExcelFile = (file: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel"
    ];
    const validExtensions = [".xlsx", ".xls"];
    const isValidType = validTypes.includes(file.type);
    const isValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    return isValidType || isValidExtension;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setStatus("importing");
      setErrorMessage("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/patients/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to import file.");
      }

      const data: ImportReport = await res.json();
      setReport(data);
      setStatus("done");

      // Trigger directory refresh if any patients were imported
      if (data.successCount > 0 && onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      console.error("Import error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during import.");
      setStatus("error");
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setReport(null);
    setErrorMessage("");
    setStatus("idle");
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
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 580,
          maxHeight: "85vh",
          background: "#ffffff",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-outline-variant)",
            background: "#ffffff",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary-container)" }}>
              upload
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>
              {status === "done" ? "Import Results" : "Import Patients"}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", padding: 4 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>

        {/* ── Scrollable Body ────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          
          {/* 1. Importing Loader */}
          {status === "importing" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "40px 0" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-primary-container)", animation: "spin 1.5s linear infinite" }}>
                progress_activity
              </span>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-surface)" }}>
                Parsing and importing patients...
              </div>
              <div style={{ fontSize: 13, color: "var(--color-on-surface-variant)" }}>
                Checking unique IDs and duplicates. Please do not close this modal.
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* 2. Error State */}
          {status === "error" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "#fce8e8", borderRadius: 8, border: "1px solid #f5c2c2" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-error)" }}>
                  error
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#b3261e" }}>
                  {errorMessage}
                </div>
              </div>
              <button
                onClick={handleReset}
                style={{
                  alignSelf: "center",
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--color-primary-container)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* 3. Idle Upload State */}
          {status === "idle" && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.5 }}>
                Upload an Excel file (.xlsx or .xls) containing patient data. The system requires **First Name**, **Last Name**, and **Date of Birth** columns to create patient profiles.
              </p>

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input")?.click()}
                  style={{
                    padding: "40px 20px",
                    border: "2px dashed " + (isDragging ? "var(--color-primary-container)" : "var(--color-outline-variant)"),
                    borderRadius: 10,
                    background: isDragging ? "var(--color-surface-container-low)" : "transparent",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 48, color: "var(--color-on-surface-variant)", marginBottom: 12, display: "block" }}
                  >
                    cloud_upload
                  </span>
                  <div style={{ fontSize: 14, color: "var(--color-on-surface)", marginBottom: 4 }}>
                    <strong>Drag and drop your file here</strong> or click to browse
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                    Accepted formats: .xlsx, .xls
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "var(--color-surface-container-low)", borderRadius: 8, border: "1px solid var(--color-outline-variant)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 36, color: "var(--color-primary-container)" }}>
                    description
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                      {selectedFile.size < 1024 * 1024 ? `${(selectedFile.size / 1024).toFixed(1)} KB` : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", padding: 4 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                  </button>
                </div>
              )}

              <div style={{ background: "var(--color-surface-container-low)", borderRadius: 8, padding: "12px 16px", border: "1px solid var(--color-outline-variant)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-on-surface-variant)" }}>
                    info
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>
                    Import Guidelines
                  </span>
                </div>
                <ul style={{ fontSize: 12, color: "var(--color-on-surface-variant)", margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                  <li>Required columns: **First Name**, **Last Name**, **Date of Birth**</li>
                  <li>Duplicate records (exact name + DOB match) will be skipped safely</li>
                  <li>Other columns are optional and can be edited on the platform later</li>
                </ul>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid var(--color-outline-variant)" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--color-outline-variant)", background: "transparent", fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", cursor: "pointer", transition: "background 0.12s" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, border: "none", background: selectedFile ? "var(--color-primary-container)" : "var(--color-outline-variant)", color: "#ffffff", fontSize: 14, fontWeight: 600, cursor: selectedFile ? "pointer" : "not-allowed", transition: "background 0.15s" }}
                  onMouseOver={(e) => { if (selectedFile) e.currentTarget.style.background = "var(--color-primary)"; }}
                  onMouseOut={(e) => { if (selectedFile) e.currentTarget.style.background = "var(--color-primary-container)"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
                  Upload & Import
                </button>
              </div>
            </form>
          )}

          {/* 4. Import Results (Done) State */}
          {status === "done" && report && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Summary Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "#e6f4ea", border: "1px solid #c4ebd0", borderRadius: 10, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="material-symbols-outlined icon-fill" style={{ fontSize: 32, color: "#137333" }}>check_circle</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#137333" }}>SUCCESSFULLY IMPORTED</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#137333" }}>{report.successCount}</div>
                  </div>
                </div>

                <div style={{ background: report.failedCount > 0 ? "#fff3e0" : "var(--color-surface-container-low)", border: report.failedCount > 0 ? "1px solid #ffe0b2" : "1px solid var(--color-outline-variant)", borderRadius: 10, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="material-symbols-outlined icon-fill" style={{ fontSize: 32, color: report.failedCount > 0 ? "#e65100" : "var(--color-outline)" }}>
                    {report.failedCount > 0 ? "warning" : "info"}
                  </span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: report.failedCount > 0 ? "#e65100" : "var(--color-on-surface-variant)" }}>ROWS SKIPPED / FAILED</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: report.failedCount > 0 ? "#e65100" : "var(--color-on-surface-variant)" }}>{report.failedCount}</div>
                  </div>
                </div>
              </div>

              {/* Imported Patients List */}
              {report.importedPatients.length > 0 && (
                <div style={{ border: "1px solid var(--color-outline-variant)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ background: "var(--color-surface-container-low)", padding: "10px 14px", borderBottom: "1px solid var(--color-outline-variant)", fontSize: 13, fontWeight: 700, color: "var(--color-on-surface)" }}>
                    Imported Patients
                  </div>
                  <div style={{ maxHeight: 150, overflowY: "auto", padding: "8px 14px" }}>
                    {report.importedPatients.map((pat, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: idx < report.importedPatients.length - 1 ? "1px solid var(--color-outline-variant)" : "none", fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{pat.name}</span>
                        <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-on-surface-variant)" }}>{pat.patientId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failures List */}
              {report.failures.length > 0 && (
                <div style={{ border: "1px solid #ffe0b2", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ background: "#fff3e0", padding: "10px 14px", borderBottom: "1px solid #ffe0b2", fontSize: 13, fontWeight: 700, color: "#e65100" }}>
                    Skipped Rows & Reasons
                  </div>
                  <div style={{ maxHeight: 180, overflowY: "auto", padding: "8px 14px" }}>
                    {report.failures.map((fail, idx) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "6px 0", borderBottom: idx < report.failures.length - 1 ? "1px solid #ffe0b2" : "none", fontSize: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 700, color: "#b3261e" }}>Row {fail.row}</span>
                          <span style={{ fontStyle: "italic", color: "var(--color-on-surface-variant)" }}>{fail.name}</span>
                        </div>
                        <div style={{ color: "#e65100" }}>{fail.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid var(--color-outline-variant)" }}>
                <button
                  onClick={handleReset}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "1px solid var(--color-outline-variant)",
                    background: "transparent",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--color-on-surface)",
                    cursor: "pointer",
                  }}
                >
                  Import Another File
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--color-primary-container)",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
