"use client";

import React, { useState } from "react";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError("");

        setIsLoading(true);
        try {
            const res = await fetch("/auth/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (res.status === 201) {
                setSuccess(true);
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data?.message || "Login failed. Please try again.");
            }
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-screen active">
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

            <div className="auth-card">
                <div className="auth-card-title">Login to your account</div>
                <div className="auth-card-sub">
                    Request staff access to BrightLife EHR Platform
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Work Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-input"
                            placeholder="your@hospital.org"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
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
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
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
                        style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
                    >
                        {isLoading ? "Logging in…" : "Login"}
                    </button>
                </form>
            </div>

            <div className="auth-footer">
                Already have an account? &nbsp;
                <a href="/login">Sign in</a>
            </div>
        </div>
    );
}