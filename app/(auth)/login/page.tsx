"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

/** Inline SVG logo — no external image dependency */
function BrightLifeLogo({ size = 56 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 160 160"
            fill="none"
            role="img"
            aria-label="BrightLife EHR logo"
        >
            <circle cx="80" cy="80" r="72" stroke="#0f4c81" strokeWidth="6" fill="#ffffff" />
            <circle cx="80" cy="80" r="69" fill="#e7eeff" />
            {/* Medical cross */}
            <rect x="63" y="44" width="14" height="72" rx="4" fill="#0f4c81" />
            <rect x="44" y="63" width="72" height="14" rx="4" fill="#0f4c81" />
            {/* Teal centre dot */}
            <circle cx="80" cy="80" r="7" fill="#006970" />
        </svg>
    );
}

export default function LoginPage() {
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
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setError(data?.message ?? "Invalid credentials. Please try again.");
                    return;
                }

                window.location.href = "/dashboard";
            } catch {
                setError("A network error occurred. Please try again.");
            }
        });
    }

    const BADGES = [
        { icon: "verified_user", label: "HIPAA & NDPR Compliant" },
        { icon: "encrypted",     label: "End-to-End Encrypted" },
        { icon: "monitor_heart", label: "Real-Time Clinical Insights" },
    ];

    return (
        <div className="flex min-h-screen w-full overflow-hidden">

            {/* ══════════════════════════════════════════════════════════════
          LEFT PANEL — hero (desktop only)
      ══════════════════════════════════════════════════════════════ */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
                 style={{ backgroundColor: "#0f4c81" }}>

                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&q=80')",
                        opacity: 0.18,
                    }}
                    aria-hidden="true"
                />
                {/* Deep gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(155deg, rgba(0,35,70,0.82) 0%, rgba(15,76,129,0.75) 100%)",
                    }}
                    aria-hidden="true"
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center w-full px-12 py-16">

                    {/* Logo circle */}
                    <div
                        className="flex items-center justify-center rounded-full shadow-2xl mb-6"
                        style={{
                            width: 96,
                            height: 96,
                            background: "rgba(255,255,255,0.95)",
                            border: "2px solid rgba(255,255,255,0.4)",
                        }}
                    >
                        <BrightLifeLogo size={68} />
                    </div>

                    <h1 style={{ fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: 6 }}>
                        BrightLife EHR
                    </h1>
                    <p style={{ fontSize: 18, lineHeight: "28px", color: "rgba(255,255,255,0.82)", marginBottom: 40 }}>
                        Secure Provider Portal
                    </p>

                    {/* Feature badges */}
                    <div className="flex flex-col w-full" style={{ gap: 10, maxWidth: 300 }}>
                        {BADGES.map(({ icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center"
                                style={{
                                    gap: 12,
                                    padding: "10px 16px",
                                    borderRadius: 10,
                                    background: "rgba(255,255,255,0.10)",
                                    border: "1px solid rgba(255,255,255,0.18)",
                                    backdropFilter: "blur(4px)",
                                }}
                            >
                <span
                    className="material-symbols-outlined icon-fill shrink-0"
                    style={{ fontSize: 20, color: "#8df2fc" }}
                >
                  {icon}
                </span>
                                <span style={{ fontSize: 14, lineHeight: "20px", fontWeight: 500, color: "#fff", whiteSpace: "nowrap" }}>
                  {label}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
          RIGHT PANEL — login form
      ══════════════════════════════════════════════════════════════ */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-4 md:px-8 py-12 overflow-y-auto">
                <div className="w-full flex flex-col" style={{ maxWidth: 420, gap: 24 }}>

                    {/* ── Mobile logo (hidden on desktop) ── */}
                    <div className="lg:hidden flex flex-col items-center text-center" style={{ gap: 10, marginBottom: 8 }}>
                        <div
                            className="flex items-center justify-center rounded-full"
                            style={{
                                width: 56,
                                height: 56,
                                background: "var(--color-surface-container)",
                                border: "1px solid var(--color-outline-variant)",
                            }}
                        >
                            <BrightLifeLogo size={40} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 28, lineHeight: "36px", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--color-on-surface)" }}>
                                BrightLife EHR
                            </h1>
                            <p style={{ fontSize: 14, lineHeight: "20px", color: "var(--color-on-surface-variant)", marginTop: 4 }}>
                                Secure Provider Portal
                            </p>
                        </div>
                    </div>

                    {/* ── Heading ── */}
                    <div>
                        <h2 style={{ fontSize: 20, lineHeight: "28px", fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 4 }}>
                            Sign In
                        </h2>
                        <p style={{ fontSize: 14, lineHeight: "20px", color: "var(--color-on-surface-variant)" }}>
                            Access clinical records, patient management tools, or administrative controls.
                        </p>
                    </div>

                    {/* ── Error banner ── */}
                    {error && (
                        <div
                            role="alert"
                            className="flex items-start"
                            style={{
                                gap: 10,
                                padding: "10px 14px",
                                borderRadius: 8,
                                background: "var(--color-error-container)",
                                border: "1px solid rgba(147,0,10,0.15)",
                            }}
                        >
              <span
                  className="material-symbols-outlined shrink-0"
                  style={{ fontSize: 18, color: "var(--color-on-error-container)", marginTop: 1 }}
              >
                error
              </span>
                            <p style={{ fontSize: 14, lineHeight: "20px", color: "var(--color-on-error-container)" }}>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 16 }} noValidate>

                        {/* Email / User ID */}
                        <div className="flex flex-col" style={{ gap: 6 }}>
                            <label
                                htmlFor="email"
                                style={{ fontSize: 12, lineHeight: "14px", fontWeight: 600, color: "var(--color-on-surface)" }}
                            >
                                Email or User ID
                            </label>
                            <div className="relative flex items-center">
                <span
                    className="material-symbols-outlined absolute pointer-events-none"
                    style={{ left: 10, fontSize: 20, color: "var(--color-outline)" }}
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
                                    placeholder="provider@brightlife.ng or admin@brightlife.ng"
                                    style={{
                                        width: "100%",
                                        fontSize: 16,
                                        lineHeight: "24px",
                                        padding: "9px 12px 9px 36px",
                                        borderRadius: 10,
                                        border: `1px solid ${error ? "var(--color-error)" : "var(--color-outline-variant)"}`,
                                        background: "#ffffff",
                                        color: "var(--color-on-surface)",
                                        outline: "none",
                                        transition: "border-color 0.15s, box-shadow 0.15s",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = "var(--color-primary-container)";
                                        e.target.style.boxShadow = "0 0 0 2px rgba(15,76,129,0.15)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = error ? "var(--color-error)" : "var(--color-outline-variant)";
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col" style={{ gap: 6 }}>
                            <div className="flex justify-between items-center">
                                <label
                                    htmlFor="password"
                                    style={{ fontSize: 12, lineHeight: "14px", fontWeight: 600, color: "var(--color-on-surface)" }}
                                >
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    style={{ fontSize: 12, lineHeight: "14px", color: "var(--color-primary-container)", textDecoration: "none" }}
                                    onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                    onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative flex items-center">
                <span
                    className="material-symbols-outlined absolute pointer-events-none"
                    style={{ left: 10, fontSize: 20, color: "var(--color-outline)" }}
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
                                    style={{
                                        width: "100%",
                                        fontSize: 16,
                                        lineHeight: "24px",
                                        padding: "9px 40px 9px 36px",
                                        borderRadius: 10,
                                        border: `1px solid ${error ? "var(--color-error)" : "var(--color-outline-variant)"}`,
                                        background: "#ffffff",
                                        color: "var(--color-on-surface)",
                                        outline: "none",
                                        transition: "border-color 0.15s, box-shadow 0.15s",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = "var(--color-primary-container)";
                                        e.target.style.boxShadow = "0 0 0 2px rgba(15,76,129,0.15)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = error ? "var(--color-error)" : "var(--color-outline-variant)";
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    style={{
                                        position: "absolute",
                                        right: 10,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        color: "var(--color-outline)",
                                    }}
                                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                                </button>
                            </div>
                        </div>

                        {/* 2FA notice */}
                        <div
                            className="flex items-start"
                            style={{
                                gap: 10,
                                padding: "10px 12px",
                                borderRadius: 8,
                                background: "var(--color-surface-container)",
                                border: "1px solid var(--color-outline-variant)",
                            }}
                        >
              <span
                  className="material-symbols-outlined shrink-0"
                  style={{ fontSize: 20, color: "var(--color-primary-container)", marginTop: 1 }}
                  aria-hidden="true"
              >
                phonelink_lock
              </span>
                            <p style={{ fontSize: 14, lineHeight: "20px", color: "var(--color-on-surface-variant)", margin: 0 }}>
                                Two-factor authentication (2FA) will be required on the next step to protect patient health information (PHI).
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center justify-center"
                            style={{
                                gap: 8,
                                width: "100%",
                                padding: "14px 24px",
                                marginTop: 4,
                                borderRadius: 10,
                                border: "none",
                                background: isPending ? "var(--color-primary)" : "var(--color-primary-container)",
                                color: "#ffffff",
                                fontSize: 14,
                                fontWeight: 600,
                                letterSpacing: "0.01em",
                                cursor: isPending ? "not-allowed" : "pointer",
                                opacity: isPending ? 0.7 : 1,
                                transition: "background 0.2s, opacity 0.2s",
                            }}
                            onMouseOver={(e) => { if (!isPending) e.currentTarget.style.background = "var(--color-primary)"; }}
                            onMouseOut={(e) => { if (!isPending) e.currentTarget.style.background = "var(--color-primary-container)"; }}
                        >
                            {isPending ? (
                                <>
                                    <svg className="animate-spin" width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity={0.25} />
                                        <path fill="currentColor" opacity={0.75} d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : (
                                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">
                    lock_open
                  </span>
                                    Secure Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* ── Footer strip ── */}
                    <div
                        className="flex justify-between items-center"
                        style={{ paddingTop: 20, borderTop: "1px solid var(--color-outline-variant)" }}
                    >
                        <div className="flex items-center" style={{ gap: 6, color: "var(--color-secondary)" }}>
              <span
                  className="material-symbols-outlined icon-fill shrink-0"
                  style={{ fontSize: 16 }}
                  aria-hidden="true"
              >
                verified_user
              </span>
                            <span style={{ fontSize: 12, lineHeight: "14px", fontWeight: 600 }}>
                HIPAA &amp; NDPR Compliant
              </span>
                        </div>
                        <a
                            href="mailto:support@brightlife.ng"
                            className="flex items-center"
                            style={{ gap: 4, fontSize: 12, lineHeight: "14px", color: "var(--color-on-surface-variant)", textDecoration: "none", transition: "color 0.15s" }}
                            onMouseOver={(e) => (e.currentTarget.style.color = "var(--color-primary-container)")}
                            onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-on-surface-variant)")}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">help</span>
                            Help
                        </a>
                    </div>

                    {/* ── Version tag ── */}
                    <p style={{ textAlign: "center", fontSize: 12, lineHeight: "14px", color: "var(--color-outline)", userSelect: "none" }}>
                        BrightLife EHR &mdash; v1.0.0 &bull; &copy; {new Date().getFullYear()} BrightLife Health Systems
                    </p>
                </div>
            </div>
        </div>
    );
}
