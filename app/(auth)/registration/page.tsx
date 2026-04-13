"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("You must agree to the terms of service and privacy policy.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/auth/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      if (res.status === 201) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--success-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 24,
            }}
          >
            ✅
          </div>
          <div className="auth-card-title">Request Submitted</div>
          <div className="auth-card-sub" style={{ marginBottom: 24 }}>
            Your admin account request has been submitted successfully. An
            administrator will review and approve your account shortly.
          </div>
          <a href="/login" className="btn-auth" style={{ display: "block", textDecoration: "none", padding: "13px", textAlign: "center" }}>
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

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
        <div className="auth-card-title">Create account</div>
        <div className="auth-card-sub">
          Request staff access to BrightLife EHR Platform
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label className="form-label" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="form-input"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label className="form-label" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="form-input"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
              />
            </div>
          </div>

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

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="input-wrap">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className="form-input"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <span
                className="input-suffix"
                onClick={() => setShowConfirm((v) => !v)}
                role="button"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? "🙈" : "👁"}
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

          {/* Terms checkbox */}
          <div className="checkbox-row">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="agree">
              By creating an account you agree to Clarum&apos;s{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                terms of service
              </a>{" "}
              &amp;{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                privacy policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="btn-auth"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
          >
            {isLoading ? "Submitting…" : "Submit Request"}
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