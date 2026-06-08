"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";

type TabType = "staff" | "admin";

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<TabType>("staff");
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            try {
                const endpoint =
                    activeTab === "staff"
                        ? "/api/auth/login"
                        : "/api/auth/admin/login";

                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setError(data?.message ?? "Invalid credentials. Please try again.");
                    return;
                }

                // Successful login — middleware / server will redirect
                window.location.href = "/dashboard";
            } catch {
                setError("A network error occurred. Please try again.");
            }
        });
    }

    return (
        <div className="flex min-h-screen w-full overflow-hidden">
            {/* ── Left panel — hero ─────────────────────────────────────────────── */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-(--color-primary-container) overflow-hidden">
                {/* Background imagery */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&q=80')",
                    }}
                    aria-hidden="true"
                />
                {/* Gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(15,76,129,0.85) 0%, rgba(0,53,95,0.70) 100%)",
                    }}
                    aria-hidden="true"
                />

                {/* Hero content */}
                <div className="relative z-10 flex flex-col items-center text-center px-(--spacing-xl) py-(--spacing-2xl)">
                    {/* Logo container */}
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-(--spacing-lg) border-2 border-white/30">
                        <img
                            src="/brightlife-logo.svg"
                            alt="BrightLife EHR logo"
                            width={72}
                            height={72}
                            className="rounded-full"
                        />
                    </div>

                    <h1
                        className="text-white mb-(--spacing-sm)"
                        style={{
                            fontSize: "36px",
                            lineHeight: "44px",
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        BrightLife EHR
                    </h1>
                    <p
                        className="text-white/85 mb-(--spacing-2xl)"
                        style={{ fontSize: "18px", lineHeight: "28px", fontWeight: 400 }}
                    >
                        Secure Provider Portal
                    </p>

                    {/* Feature badges */}
                    <div className="flex flex-col gap-(--spacing-sm) w-full max-w-xs">
                        {[
                            { icon: "verified_user", label: "HIPAA & NDPR Compliant" },
                            { icon: "encrypted", label: "End-to-End Encrypted" },
                            { icon: "monitor_heart", label: "Real-Time Clinical Insights" },
                        ].map(({ icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-(--spacing-sm) px-(--spacing-md) py-(--spacing-sm) rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm"
                            >
                <span
                    className="material-symbols-outlined icon-fill text-(--color-secondary-container) text-[18px]"
                >
                  {icon}
                </span>
                                <span
                                    className="text-white"
                                    style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500 }}
                                >
                  {label}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right panel — form ────────────────────────────────────────────── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-(--color-surface-container-lowest) px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop) py-(--spacing-2xl)">
                <div className="w-full max-w-105 flex flex-col gap-(--spacing-lg)">

                    {/* ── Mobile-only logo ────────────────────────────────────────── */}
                    <div className="lg:hidden flex flex-col items-center text-center gap-(--spacing-sm) mb-(--spacing-md)">
                        <div className="w-14 h-14 bg-(--color-surface-container) rounded-full flex items-center justify-center border border-(--color-outline-variant) shadow-sm">
                            <img
                                src="/brightlife-logo.svg"
                                alt="BrightLife EHR logo"
                                width={44}
                                height={44}
                            />
                        </div>
                        <div>
                            <h1
                                className="text-(--color-on-surface)"
                                style={{ fontSize: "28px", lineHeight: "36px", fontWeight: 600, letterSpacing: "-0.01em" }}
                            >
                                BrightLife EHR
                            </h1>
                            <p
                                className="text-(--color-on-surface-variant) mt-(--spacing-xs)"
                                style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 400 }}
                            >
                                Secure Provider Portal
                            </p>
                        </div>
                    </div>

                    {/* ── Tab switcher ─────────────────────────────────────────────── */}
                    <div className="bg-(--color-surface-container-low) p-(--spacing-xs) rounded-lg flex items-center border border-(--color-outline-variant)">
                        {(["staff", "admin"] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab);
                                    setError(null);
                                }}
                                className={[
                                    "flex-1 py-(--spacing-sm) rounded transition-all duration-200",
                                    "text-[14px] font-semibold leading-[16px] tracking-[0.01em]",
                                    activeTab === tab
                                        ? "bg-(--color-surface-container-lowest) text-(--color-primary-container) shadow-sm border border-(--color-outline-variant)"
                                        : "text-(--color-on-surface-variant) hover:text-(--color-on-surface)",
                                ].join(" ")}
                            >
                                {tab === "staff" ? "Staff Login" : "Admin Portal"}
                            </button>
                        ))}
                    </div>

                    {/* ── Heading ─────────────────────────────────────────────────── */}
                    <div>
                        <h2
                            className="text-(--color-on-surface)"
                            style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600 }}
                        >
                            {activeTab === "staff" ? "Staff Sign In" : "Admin Sign In"}
                        </h2>
                        <p
                            className="text-(--color-on-surface-variant) mt-(--spacing-xs)"
                            style={{ fontSize: "14px", lineHeight: "20px" }}
                        >
                            {activeTab === "staff"
                                ? "Access clinical records and patient management tools."
                                : "Access system settings and administrative controls."}
                        </p>
                    </div>

                    {/* ── Error banner ─────────────────────────────────────────────── */}
                    {error && (
                        <div
                            role="alert"
                            className="bg-(--color-error-container) border border-on-error-container/20 rounded-lg px-(--spacing-md) py-(--spacing-sm) flex items-start gap-(--spacing-sm)"
                        >
              <span className="material-symbols-outlined text-(--color-on-error-container) text-[18px] mt-0.5 shrink-0">
                error
              </span>
                            <p
                                className="text-(--color-on-error-container)"
                                style={{ fontSize: "14px", lineHeight: "20px" }}
                            >
                                {error}
                            </p>
                        </div>
                    )}

                    {/* ── Form ─────────────────────────────────────────────────────── */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-(--spacing-md)"
                        noValidate
                    >
                        {/* Email / User ID field */}
                        <div className="flex flex-col gap-(--spacing-xs)">
                            <label
                                htmlFor="email"
                                className="text-(--color-on-surface) font-semibold"
                                style={{ fontSize: "12px", lineHeight: "14px" }}
                            >
                                Email or User ID
                            </label>
                            <div className="relative flex items-center">
                <span
                    className="material-symbols-outlined absolute left-(--spacing-sm) text-(--color-outline) text-[20px] pointer-events-none"
                    aria-hidden="true"
                >
                  person
                </span>
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={
                                        activeTab === "staff"
                                            ? "provider@brightlife.ng or STF-001"
                                            : "admin@brightlife.ng"
                                    }
                                    className={[
                                        "w-full bg-(--color-surface-container-lowest) border rounded-xl",
                                        "py-(--spacing-sm) pl-9 pr-(--spacing-sm)",
                                        "text-(--color-on-surface) placeholder:text-(--color-outline-variant)",
                                        "focus:outline-none focus:border-(--color-primary-container) focus:ring-1 focus:ring-(--color-primary-container)",
                                        "transition-all duration-150",
                                        error
                                            ? "border-(--color-error)"
                                            : "border-(--color-outline-variant)",
                                    ].join(" ")}
                                    style={{ fontSize: "16px", lineHeight: "24px" }}
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="flex flex-col gap-(--spacing-xs)">
                            <div className="flex justify-between items-center">
                                <label
                                    htmlFor="password"
                                    className="text-(--color-on-surface) font-semibold"
                                    style={{ fontSize: "12px", lineHeight: "14px" }}
                                >
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-(--color-primary-container) hover:underline"
                                    style={{ fontSize: "12px", lineHeight: "14px" }}
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative flex items-center">
                <span
                    className="material-symbols-outlined absolute left-(--spacing-sm) text-(--color-outline) text-[20px] pointer-events-none"
                    aria-hidden="true"
                >
                  lock
                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={[
                                        "w-full bg-(--color-surface-container-lowest) border rounded-xl",
                                        "py-(--spacing-sm) pl-9 pr-10",
                                        "text-(--color-on-surface) placeholder:text-(--color-outline-variant)",
                                        "focus:outline-none focus:border-(--color-primary-container) focus:ring-1 focus:ring-(--color-primary-container)",
                                        "transition-all duration-150",
                                        error
                                            ? "border-(--color-error)"
                                            : "border-(--color-outline-variant)",
                                    ].join(" ")}
                                    style={{ fontSize: "16px", lineHeight: "24px" }}
                                />
                                {/* Show / hide password toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-(--spacing-sm) text-(--color-outline) hover:text-(--color-on-surface-variant) transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                                </button>
                            </div>
                        </div>

                        {/* 2FA notice */}
                        <div className="bg-(--color-surface-container) px-(--spacing-sm) py-(--spacing-sm) rounded-lg border border-(--color-outline-variant) flex items-start gap-(--spacing-sm)">
              <span
                  className="material-symbols-outlined text-(--color-primary-container) text-[20px] shrink-0 mt-0.5"
                  aria-hidden="true"
              >
                phonelink_lock
              </span>
                            <p
                                className="text-(--color-on-surface-variant) leading-tight"
                                style={{ fontSize: "14px", lineHeight: "20px" }}
                            >
                                Two-factor authentication (2FA) will be required on the next
                                step to protect patient health information (PHI).
                            </p>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className={[
                                "w-full flex items-center justify-center gap-(--spacing-sm)",
                                "bg-(--color-primary-container) text-white rounded-xl py-(--spacing-md) mt-(--spacing-xs)",
                                "font-semibold tracking-[0.01em]",
                                "hover:bg-(--color-primary) transition-colors duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--color-primary-container)",
                                "disabled:opacity-60 disabled:cursor-not-allowed",
                            ].join(" ")}
                            style={{ fontSize: "14px", lineHeight: "16px" }}
                        >
                            {isPending ? (
                                <>
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        />
                                    </svg>
                                    Signing in…
                                </>
                            ) : (
                                <>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    lock_open
                  </span>
                                    Secure Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* ── Footer strip ─────────────────────────────────────────────── */}
                    <div className="flex justify-between items-center pt-(--spacing-lg) border-t border-(--color-outline-variant)">
                        <div className="flex items-center gap-(--spacing-xs) text-(--color-secondary)">
              <span
                  className="material-symbols-outlined icon-fill text-[16px]"
                  aria-hidden="true"
              >
                verified_user
              </span>
                            <span
                                className="font-semibold"
                                style={{ fontSize: "12px", lineHeight: "14px" }}
                            >
                HIPAA &amp; NDPR Compliant
              </span>
                        </div>
                        <a
                            href="mailto:support@brightlife.ng"
                            className="flex items-center gap-(--spacing-xs) text-(--color-on-surface-variant) hover:text-(--color-primary-container) transition-colors"
                            style={{ fontSize: "12px", lineHeight: "14px" }}
                        >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                help
              </span>
                            Help
                        </a>
                    </div>

                    {/* ── Version / env tag ─────────────────────────────────────────── */}
                    <p
                        className="text-center text-(--color-outline) select-none"
                        style={{ fontSize: "12px", lineHeight: "14px" }}
                    >
                        BrightLife EHR &mdash; v1.0.0 &bull; &copy; {new Date().getFullYear()} BrightLife Health Systems
                    </p>
                </div>
            </div>
        </div>
    );
}
