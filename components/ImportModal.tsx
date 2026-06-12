"use client";

import React, { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function ImportModal({ onClose }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const clearFile = () => {
    setSelectedFile(null);
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
          maxWidth: 540,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
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
            position: "sticky",
            top: 0,
            background: "#ffffff",
            zIndex: 1,
            borderRadius: "14px 14px 0 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--color-primary-container)" }}>
              upload
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--color-on-surface)" }}>
              Import Patients
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-on-surface-variant)", padding: 4 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: "8px 24px 24px", display: "flex", flexDirection: "column", gap: 24 }}
        >
          <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.5 }}>
            Upload an Excel file (.xlsx or .xls) containing patient data. The file should follow the template format.
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
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 36, color: "var(--color-primary-container)" }}
              >
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
                Import Tips
              </span>
            </div>
            <ul style={{ fontSize: 12, color: "var(--color-on-surface-variant)", margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
              <li>Make sure your file matches the required template format</li>
              <li>Required columns: First Name, Last Name, Date of Birth</li>
              <li>Duplicate patient records will be skipped</li>
              <li>All data will be validated before import</li>
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
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
