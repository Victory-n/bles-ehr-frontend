"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.email.trim() || !formData.password) {
            setError("Please enter your email and password.");
            return;
        }

        setIsLoading(true);
        try {
            // POST directly to the Express backend API
            const res = await fetch("http://localhost:5000/auth/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Handle PIN setup flow
                if (data.data?.requiresPinSetup) {
                    setError("Your account requires a PIN setup. Please contact the administrator or proceed to the PIN setup page (Pending implementation).");
                    return;
                }
                
                // Cookies are set server-side; just navigate to dashboard
                router.push("/dashboard");
                router.refresh(); // ensure server components re-read cookies
            } else {
                setError(data?.message || "Invalid email or password.");
            }
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-screen active">
            {/* Logo */}
            <div className="auth-logo-wrap">
                <div className="auth-logo">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-1 14v-1.5h2V16h-2zm1-3.5c-2.48 0-4.5-2.02-4.5-4.5S9.52 4 12 4s4.5 2.02 4.5 4.5S14.48 12.5 12 12.5z" />
                    </svg>
                </div>
                <div className="auth-brand">
                    BrightLife<span>EHR</span>
                </div>
            </div>

            {/* Card */}
            <div className="auth-card">
                <div className="auth-card-title">Welcome back</div>
                <div className="auth-card-sub">
                    Sign in to access the clinical platform
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-input"
                            placeholder="doctor@brightlife.health"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password
                        </label>
                        <div className="input-wrap">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                            <span
                                className="input-suffix"
                                onClick={() => setShowPassword((v) => !v)}
                                role="button"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? "🙈" : "👁"}
                            </span>
                        </div>
                        <div className="forgot-link">
                            <a href="#" onClick={(e) => e.preventDefault()}>
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div
                            style={{
                                background: "var(--danger-light)",
                                border: "1px solid var(--danger)",
                                borderRadius: 10,
                                padding: "10px 14px",
                                marginBottom: 16,
                                fontSize: 13,
                                color: "var(--danger)",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-auth"
                        disabled={isLoading}
                        style={{
                            opacity: isLoading ? 0.7 : 1,
                            cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                    >
                        {isLoading ? "Signing in…" : "Sign In"}
                    </button>
                </form>
            </div>

            <div className="auth-footer">
                Don&apos;t have access? &nbsp;
                <a href="/registration">Request account</a>
            </div>
        </div>
    );
}