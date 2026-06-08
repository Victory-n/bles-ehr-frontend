"use client";

import React, { useState } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   Data
══════════════════════════════════════════════════════════════════════════ */

const SCHEDULE = [
    {
        time: "10:00 AM",
        patient: "John Adeyemi",
        code: "PAT-0142",
        initials: "JA",
        avatarBg: "var(--color-primary-container)",
        avatarColor: "var(--color-on-primary-container)",
        type: "Therapy Session",
        status: "checked-in",
    },
    {
        time: "11:30 AM",
        patient: "Amara Okafor",
        code: "PAT-0089",
        initials: "AO",
        avatarBg: "var(--color-tertiary-container)",
        avatarColor: "var(--color-on-tertiary-container)",
        type: "Initial Assessment",
        status: "in-progress",
    },
    {
        time: "01:00 PM",
        patient: "Emeka Nwosu",
        code: "PAT-0201",
        initials: "EN",
        avatarBg: "var(--color-secondary-container)",
        avatarColor: "var(--color-on-secondary-container)",
        type: "Follow-Up (CBT)",
        status: "confirmed",
    },
    {
        time: "02:15 PM",
        patient: "Fatima Bello",
        code: "PAT-0057",
        initials: "FB",
        avatarBg: "var(--color-primary-container)",
        avatarColor: "var(--color-on-primary-container)",
        type: "Group Therapy",
        status: "pending",
    },
    {
        time: "04:00 PM",
        patient: "Chidi Eze",
        code: "PAT-0310",
        initials: "CE",
        avatarBg: "var(--color-secondary-container)",
        avatarColor: "var(--color-on-secondary-container)",
        type: "Psychiatric Review",
        status: "confirmed",
    },
];

type StatusKey = "checked-in" | "in-progress" | "confirmed" | "pending";

const STATUS_CFG: Record<StatusKey, { bg: string; color: string; border: string; label: string }> = {
    "checked-in": {
        bg: "#e6f4ea",
        color: "#137333",
        border: "#ceead6",
        label: "Checked In",
    },
    "in-progress": {
        bg: "#fff3e0",
        color: "#e65100",
        border: "#ffe0b2",
        label: "In Progress",
    },
    confirmed: {
        bg: "var(--color-surface-variant)",
        color: "var(--color-on-surface-variant)",
        border: "var(--color-outline-variant)",
        label: "Confirmed",
    },
    pending: {
        bg: "var(--color-error-container)",
        color: "var(--color-on-error-container)",
        border: "#fad2cf",
        label: "Pending",
    },
};

const QUICK_ACTIONS = [
    { icon: "post_add",      label: "Start Clinic Note",   color: "var(--color-primary)"   },
    { icon: "person_add",    label: "Register New Patient", color: "var(--color-secondary)" },
    { icon: "file_download", label: "Export Daily Roster",  color: "var(--color-secondary)" },
    { icon: "receipt",       label: "Generate Invoice",     color: "#1b5e20"                },
    { icon: "lock_reset",    label: "Reset Access Code",    color: "var(--color-tertiary)"  },
];

/* ══════════════════════════════════════════════════════════════════════════
   Dashboard Page
══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
    const [bannerVisible, setBannerVisible] = useState(true);

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="flex flex-col gap-lg">

            {/* ── System maintenance banner ──────────────────────────────────── */}
            {bannerVisible && (
                <div
                    className="flex items-center gap-sm px-md py-xs border-b border-secondary-container bg-surface-container-lowest"
                    style={{ marginTop: -24, marginLeft: -24, marginRight: -24 }}
                >
          <span
              className="material-symbols-outlined text-secondary shrink-0"
              style={{ fontSize: 16 }}
          >
            info
          </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant flex-1">
            System maintenance scheduled for 02:00 AM WAT. Services will be paused for approximately 30 minutes.
          </span>
                    <button
                        onClick={() => setBannerVisible(false)}
                        className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface shrink-0"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                    </button>
                </div>
            )}

            {/* ── Page header ───────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
                <div>
                    <h2 className="font-headline-xl text-headline-xl text-on-background" style={{ letterSpacing: "-0.02em" }}>
                        Good Morning, Dr. Adaeze.
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                        {`Here is your clinical overview for ${today}.`}
                    </p>
                </div>
                <div className="flex gap-sm shrink-0">
                    <button
                        className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg flex items-center gap-sm hover:bg-primary-container transition-colors"
                        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                        New Patient
                    </button>
                </div>
            </div>

            {/* ── Bento grid: 4 metric / action cards ───────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-sm">

                {/* Card 1 — Today's Appointments */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-md">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Today&apos;s Appointments
            </span>
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: 18 }}>
                calendar_today
              </span>
                        </div>
                    </div>
                    <div>
                        <span className="font-headline-xl text-headline-xl text-on-background">24</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant ml-xs">6 remaining</span>
                    </div>
                    <div className="mt-sm flex gap-xs flex-wrap">
            <span
                className="px-2 py-1 rounded-full font-label-sm text-label-sm border"
                style={{
                    background: "var(--color-surface-container-low)",
                    color: "var(--color-primary)",
                    borderColor: "var(--color-primary-container)",
                }}
            >
              Next at 10:00 AM
            </span>
                    </div>
                </div>

                {/* Card 2 — Pending Notes */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-md">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Pending Notes
            </span>
                        <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-error-container" style={{ fontSize: 18 }}>
                edit_document
              </span>
                        </div>
                    </div>
                    <div>
                        <span className="font-headline-xl text-headline-xl text-on-background">7</span>
                        <span className="font-body-sm text-body-sm text-error ml-xs">Needs attention</span>
                    </div>
                    <div className="mt-sm w-full bg-surface-container rounded-full overflow-hidden" style={{ height: 8 }}>
                        <div className="bg-error h-full rounded-full" style={{ width: "35%" }} />
                    </div>
                </div>

                {/* Card 3 — Compliance Score */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-md">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Compliance Score
            </span>
                        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: 18 }}>
                verified
              </span>
                        </div>
                    </div>
                    <div>
                        <span className="font-headline-xl text-headline-xl text-on-background">96%</span>
                        <span className="font-body-sm text-body-sm text-secondary ml-xs">↑ 1% this week</span>
                    </div>
                    <div className="mt-sm w-full bg-surface-container rounded-full overflow-hidden" style={{ height: 8 }}>
                        <div className="bg-secondary h-full rounded-full" style={{ width: "96%" }} />
                    </div>
                </div>

                {/* Card 4 — Quick Actions */}
                <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex flex-col gap-sm">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">
            Quick Actions
          </span>
                    {QUICK_ACTIONS.slice(0, 3).map(({ icon, label, color }) => (
                        <button
                            key={label}
                            className="w-full flex items-center justify-start gap-md px-sm bg-surface-container-lowest border border-outline-variant hover:bg-surface-container transition-colors rounded-lg font-label-sm text-label-sm text-on-surface"
                            style={{ paddingTop: 8, paddingBottom: 8, cursor: "pointer" }}
                        >
              <span
                  className="material-symbols-outlined shrink-0"
                  style={{ fontSize: 18, color }}
              >
                {icon}
              </span>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main content: 12-col grid ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

                {/* Schedule table — 8 cols */}
                <div
                    className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
                    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}
                >
                    {/* Table header */}
                    <div className="p-md border-b border-outline-variant flex items-center justify-between bg-surface-bright">
                        <h3 className="font-headline-md text-headline-md text-on-surface">Upcoming Schedule</h3>
                        <div className="flex gap-sm">
                            <button
                                className="text-on-surface-variant hover:bg-surface-container-low transition-colors rounded"
                                style={{ padding: 4, background: "none", border: "none", cursor: "pointer" }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>filter_list</span>
                            </button>
                            <button
                                className="text-on-surface-variant hover:bg-surface-container-low transition-colors rounded"
                                style={{ padding: 4, background: "none", border: "none", cursor: "pointer" }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>more_vert</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
                            <thead>
                            <tr
                                className="border-b border-outline-variant"
                                style={{ background: "#f1f5f9" }}
                            >
                                <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" style={{ width: 110 }}>
                                    Time
                                </th>
                                <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                                    Patient Name
                                </th>
                                <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider hidden md:table-cell">
                                    Type
                                </th>
                                <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">
                                    Status
                                </th>
                            </tr>
                            </thead>
                            <tbody className="font-body-sm text-body-sm text-on-surface">
                            {SCHEDULE.map((row, i) => {
                                const st = STATUS_CFG[row.status as StatusKey];
                                const isAlt = i % 2 !== 0;
                                return (
                                    <tr
                                        key={row.code}
                                        className="border-b border-outline-variant transition-colors cursor-pointer group"
                                        style={{ background: isAlt ? "#f8fafc" : "transparent" }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface-container-low)")}
                                        onMouseOut={(e) => (e.currentTarget.style.background = isAlt ? "#f8fafc" : "transparent")}
                                    >
                                        {/* Time */}
                                        <td className="py-md px-md font-label-sm text-label-sm text-on-surface-variant" style={{ fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                                            {row.time}
                                        </td>
                                        {/* Patient */}
                                        <td className="py-md px-md">
                                            <div className="flex items-center gap-sm">
                                                <div
                                                    className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                                                    style={{
                                                        background: row.avatarBg,
                                                        color: row.avatarColor,
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {row.initials}
                                                </div>
                                                <div>
                                                    <p className="font-label-md text-label-md text-on-surface" style={{ whiteSpace: "nowrap" }}>
                                                        {row.patient}
                                                    </p>
                                                    <p className="font-label-sm text-label-sm text-on-surface-variant" style={{ fontSize: 11 }}>
                                                        {row.code}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Type */}
                                        <td className="py-md px-md text-on-surface-variant hidden md:table-cell" style={{ whiteSpace: "nowrap" }}>
                                            {row.type}
                                        </td>
                                        {/* Status */}
                                        <td className="py-md px-md text-right">
                        <span
                            className="inline-flex items-center px-2 py-1 rounded-full font-label-sm border"
                            style={{
                                fontSize: 11,
                                background: st.bg,
                                color: st.color,
                                borderColor: st.border,
                                whiteSpace: "nowrap",
                            }}
                        >
                          {st.label}
                        </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Contextual sidebar — 4 cols */}
                <div className="lg:col-span-4 flex flex-col gap-lg">

                    {/* Alert: Incomplete Documentation */}
                    <div
                        className="bg-surface-container-lowest border border-error-container rounded-xl p-md relative overflow-hidden"
                    >
                        {/* Red left accent bar */}
                        <div
                            className="absolute top-0 left-0 h-full bg-error"
                            style={{ width: 4 }}
                        />
                        <div className="flex items-start gap-sm" style={{ paddingLeft: 8 }}>
              <span
                  className="material-symbols-outlined text-error shrink-0"
                  style={{ fontSize: 22, marginTop: 2 }}
              >
                gpp_bad
              </span>
                            <div>
                                <h4 className="font-label-md text-label-md text-on-surface" style={{ fontWeight: 700 }}>
                                    Incomplete Documentation
                                </h4>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                                    2 progress notes from yesterday remain unsigned. NDPR regulations require signature within 48 hours.
                                </p>
                                <button
                                    className="mt-sm font-label-sm text-label-sm text-on-surface border border-outline-variant rounded hover:bg-surface-container transition-colors"
                                    style={{
                                        padding: "4px 10px",
                                        background: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    Review Notes
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Clinical Insight */}
                    <div
                        className="bg-surface-container-lowest border rounded-xl p-md relative"
                        style={{
                            borderColor: "var(--color-primary-fixed-dim)",
                            boxShadow: "inset 0 0 20px rgba(15,76,129,0.03)",
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-sm border-b border-outline-variant pb-sm">
                            <h4
                                className="font-label-md text-label-md text-primary flex items-center gap-xs"
                                style={{ color: "var(--color-primary)" }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>psychology</span>
                                Clinical Insight
                            </h4>
                            <span className="material-symbols-outlined text-outline" style={{ fontSize: 16 }}>
                lock
              </span>
                        </div>

                        {/* Insight card */}
                        <div
                            className="p-sm bg-surface-container-low rounded-lg border border-outline-variant"
                        >
              <span
                  className="block font-label-sm text-label-sm text-on-surface-variant mb-xs"
                  style={{ fontSize: 11 }}
              >
                Patient: Amara Okafor (11:30 AM)
              </span>
                            <p className="font-body-sm text-body-sm text-on-surface" style={{ lineHeight: "1.45" }}>
                                Patient reported elevated anxiety scores in pre-session questionnaire (GAD-7: 16). Suggest reviewing coping strategies early in session.
                            </p>
                        </div>

                        {/* Secondary insight */}
                        <div
                            className="p-sm bg-surface-container-low rounded-lg border border-outline-variant mt-sm"
                        >
              <span
                  className="block font-label-sm text-label-sm text-on-surface-variant mb-xs"
                  style={{ fontSize: 11 }}
              >
                Patient: John Adeyemi (10:00 AM)
              </span>
                            <p className="font-body-sm text-body-sm text-on-surface" style={{ lineHeight: "1.45" }}>
                                3rd consecutive session attending on time. Positive indicator for treatment adherence — document in progress note.
                            </p>
                        </div>
                    </div>

                    {/* Additional Quick Actions */}
                    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex flex-col gap-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">
              More Actions
            </span>
                        {QUICK_ACTIONS.slice(2).map(({ icon, label, color }) => (
                            <button
                                key={label}
                                className="w-full flex items-center justify-start gap-md px-sm bg-surface-container-lowest border border-outline-variant hover:bg-surface-container transition-colors rounded-lg font-label-sm text-label-sm text-on-surface"
                                style={{ paddingTop: 8, paddingBottom: 8, cursor: "pointer" }}
                            >
                <span
                    className="material-symbols-outlined shrink-0"
                    style={{ fontSize: 18, color }}
                >
                  {icon}
                </span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
