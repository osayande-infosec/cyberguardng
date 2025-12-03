import React, { useEffect, useState } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true, // always true
    analytics: false,
    marketing: false,
    functional: false,
  });

  const CONSENT_KEY = "cg-consent";
  const CONSENT_EXPIRY_KEY = "cg-consent-expiry";
  const CONSENT_EXPIRY_DAYS = 30;

  // Load consent from localStorage
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      const expiry = window.localStorage.getItem(CONSENT_EXPIRY_KEY);

      if (stored && expiry && new Date(expiry) > new Date()) {
        // Consent still valid
        setConsent(JSON.parse(stored));
        setShow(false);
      } else {
        // No consent or expired
        setShow(true);
      }
    } catch (err) {
      console.error("Error loading consent:", err);
      setShow(true);
    }
  }, []);

  function saveConsent(consentObj) {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);

      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consentObj));
      window.localStorage.setItem(
        CONSENT_EXPIRY_KEY,
        expiryDate.toISOString()
      );

      setConsent(consentObj);
      setShow(false);
      setShowPreferences(false);

      // Optional: Send consent to backend for logging
      logConsentToBackend(consentObj);
    } catch (err) {
      console.error("Error saving consent:", err);
    }
  }

  function logConsentToBackend(consentObj) {
    // Optional: Send to your backend for audit/compliance
    fetch("/.netlify/functions/consent-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consent: consentObj,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
    }).catch((err) => console.error("Could not log consent:", err));
  }

  function acceptAll() {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  }

  function acceptEssential() {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  }

  function handlePreferencesChange(category) {
    if (category === "necessary") return; // necessary is always on
    setConsent((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }

  function savePreferences() {
    saveConsent(consent);
  }

  function openPreferences() {
    setShowPreferences(true);
  }

  if (!show && !showPreferences) return null;

  return (
    <>
      {/* Main Banner */}
      {show && !showPreferences && (
        <div className="cookie-banner" id="cookie-banner">
          <div>
            <h3 style={{ marginBottom: "0.5rem", fontSize: "0.95rem" }}>
              Privacy & Cookies
            </h3>
            <p style={{ marginBottom: "0.75rem", fontSize: "0.85rem" }}>
              We use cookies to enhance your experience, analyze traffic, and
              enable personalization. Your privacy matters to us.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={acceptEssential}
              style={{
                background: "transparent",
                border: "1px solid #9ca3af",
                color: "#f9fafb",
                padding: "0.4rem 0.8rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Essential Only
            </button>
            <button
              onClick={openPreferences}
              style={{
                background: "transparent",
                border: "1px solid #9ca3af",
                color: "#f9fafb",
                padding: "0.4rem 0.8rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Manage Preferences
            </button>
            <button
              onClick={acceptAll}
              style={{
                background: "#2563eb",
                border: "none",
                color: "#fff",
                padding: "0.4rem 0.8rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Accept All
            </button>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
          onClick={() => setShowPreferences(false)}
        >
          <div
            style={{
              background: "#0b1120",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "450px",
              border: "1px solid #1f2937",
              color: "#f9fafb",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Cookie Preferences</h2>

            {/* Necessary */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "not-allowed",
                  opacity: 0.7,
                }}
              >
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  style={{ cursor: "not-allowed" }}
                />
                <span style={{ fontWeight: "600" }}>Necessary</span>
              </label>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.3rem" }}>
                Essential for site functionality. Always enabled.
              </p>
            </div>

            {/* Analytics */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={() => handlePreferencesChange("analytics")}
                />
                <span style={{ fontWeight: "600" }}>Analytics</span>
              </label>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.3rem" }}>
                Helps us understand how you use our site.
              </p>
            </div>

            {/* Marketing */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={() => handlePreferencesChange("marketing")}
                />
                <span style={{ fontWeight: "600" }}>Marketing</span>
              </label>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.3rem" }}>
                Personalized ads and retargeting campaigns.
              </p>
            </div>

            {/* Functional */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={consent.functional}
                  onChange={() => handlePreferencesChange("functional")}
                />
                <span style={{ fontWeight: "600" }}>Functional</span>
              </label>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.3rem" }}>
                Enhanced features and personalization.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={savePreferences}
                style={{
                  background: "#2563eb",
                  border: "none",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  borderRadius: "999px",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowPreferences(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #1f2937",
                  color: "#f9fafb",
                  padding: "0.5rem 1rem",
                  borderRadius: "999px",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}