import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PortalLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for error from OAuth callback
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }

    // Check if already authenticated
    checkExistingAuth();
  }, [searchParams]);

  async function checkExistingAuth() {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      if (data.authenticated) {
        navigate("/portal");
      }
    } catch (error) {
      // Not authenticated, stay on login page
    }
  }

  function handleGoogleLogin() {
    setLoading(true);
    setError("");
    // Redirect to Google OAuth endpoint
    window.location.href = "/api/auth/google/login";
  }

  function handleSSOLogin() {
    setLoading(true);
    setError("");
    // Redirect to SAML SSO endpoint
    window.location.href = "/api/auth/saml/login";
  }

  return (
    <main>
      <section className="section">
        <div className="container">
          <div style={{ 
            maxWidth: "420px", 
            margin: "0 auto", 
            padding: "2rem 0"
          }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                backgroundColor: "var(--accent)", 
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.75rem"
              }}>
                🔐
              </div>
              <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Client Portal</h1>
              <p style={{ color: "var(--muted)" }}>
                Sign in to access your security assessments and compliance reports.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: "1rem",
                marginBottom: "1.5rem",
                borderRadius: "8px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444"
              }}>
                {error}
              </div>
            )}

            {/* Login Card */}
            <div className="card" style={{ padding: "2rem" }}>
              {/* Google Sign In */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  padding: "0.875rem 1.5rem",
                  backgroundColor: "#fff",
                  color: "#1f2937",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = "#f9fafb")}
                onMouseOut={(e) => e.target.style.backgroundColor = "#fff"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? "Signing in..." : "Sign in with Google"}
              </button>

              {/* Divider */}
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                margin: "1.5rem 0",
                gap: "1rem"
              }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.1)" }}></div>
                <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>or</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.1)" }}></div>
              </div>

              {/* Enterprise SSO */}
              <button
                onClick={handleSSOLogin}
                disabled={loading}
                className="btn btn-secondary"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  opacity: loading ? 0.7 : 1
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                {loading ? "Redirecting..." : "Sign in with Enterprise SSO"}
              </button>

              <p style={{ 
                marginTop: "1rem", 
                fontSize: "0.8rem", 
                color: "var(--muted)",
                textAlign: "center"
              }}>
                For enterprise SSO setup, contact{" "}
                <a href="mailto:sales@cyberguardng.ca" style={{ color: "var(--accent)" }}>
                  sales@cyberguardng.ca
                </a>
              </p>
            </div>

            {/* Footer Info */}
            <div style={{ 
              marginTop: "2rem", 
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.85rem"
            }}>
              <p style={{ marginBottom: "0.5rem" }}>
                🔒 Secured with industry-standard encryption
              </p>
              <p>
                By signing in, you agree to our{" "}
                <a href="/privacy" style={{ color: "var(--accent)" }}>Privacy Policy</a>
                {" "}and{" "}
                <a href="/terms" style={{ color: "var(--accent)" }}>Terms of Service</a>
              </p>
            </div>

            {/* New Client CTA */}
            <div style={{ 
              marginTop: "2rem", 
              padding: "1.5rem",
              backgroundColor: "rgba(0, 212, 255, 0.05)",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid rgba(0, 212, 255, 0.2)"
            }}>
              <p style={{ margin: "0 0 1rem 0" }}>
                <strong>New to CyberGuardNG?</strong>
              </p>
              <p style={{ color: "var(--muted)", margin: "0 0 1rem 0", fontSize: "0.9rem" }}>
                Request access to our client portal and start your security journey.
              </p>
              <a href="/portal/onboarding" className="btn btn-primary" style={{ fontSize: "0.9rem" }}>
                Request Client Access →
              </a>
            </div>

            {/* Back to Home */}
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <a href="/" style={{ color: "var(--accent)", textDecoration: "none" }}>
                ← Back to CyberGuardNG
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
