import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Onboarding() {
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    companySize: "",
    servicesInterested: [],
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const industries = [
    "Technology / SaaS",
    "Financial Services",
    "Healthcare",
    "E-commerce / Retail",
    "Manufacturing",
    "Professional Services",
    "Education",
    "Government",
    "Non-profit",
    "Other"
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "500+ employees"
  ];

  const services = [
    { id: "compliance", label: "Compliance (SOC 2, ISO 27001)" },
    { id: "pentest", label: "Penetration Testing" },
    { id: "vciso", label: "Virtual CISO" },
    { id: "risk", label: "Risk Assessment" },
    { id: "training", label: "Security Training" },
    { id: "incident", label: "Incident Response" }
  ];

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleServiceToggle(serviceId) {
    setFormData(prev => ({
      ...prev,
      servicesInterested: prev.servicesInterested.includes(serviceId)
        ? prev.servicesInterested.filter(s => s !== serviceId)
        : [...prev.servicesInterested, serviceId]
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main>
        <section className="section">
          <div className="container" style={{ maxWidth: "600px", textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
            <h1>Request Submitted!</h1>
            <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "1.1rem" }}>
              Thank you, {formData.contactName.split(" ")[0]}! We've received your onboarding request for <strong>{formData.companyName}</strong>.
            </p>
            <div className="card" style={{ textAlign: "left", marginBottom: "2rem" }}>
              <h3>What's Next?</h3>
              <ol style={{ color: "var(--muted)", paddingLeft: "1.5rem", lineHeight: "1.8" }}>
                <li>Our team will review your request within <strong>1-2 business days</strong></li>
                <li>We'll reach out to schedule an introductory call</li>
                <li>Once approved, you'll receive portal access credentials</li>
              </ol>
            </div>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/" className="btn btn-primary">
                Back to Home
              </Link>
              <Link to="/portal/login" className="btn btn-secondary">
                Already have access? Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="section">
        <div className="container" style={{ maxWidth: "700px" }}>
          <div className="section-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1>Client Onboarding</h1>
            <p>
              Ready to strengthen your security posture? Fill out the form below to get started.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: "1rem",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  marginBottom: "1.5rem",
                  color: "#ef4444"
                }}>
                  {error}
                </div>
              )}

              {/* Company Information */}
              <h3 style={{ marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                Company Information
              </h3>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="companyName" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Company Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Your Company Inc."
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="form-group">
                  <label htmlFor="industry" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="" style={{ backgroundColor: "#1a1a2e", color: "#fff" }}>Select industry...</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind} style={{ backgroundColor: "#1a1a2e", color: "#fff" }}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="companySize" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    Company Size
                  </label>
                  <select
                    id="companySize"
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="" style={{ backgroundColor: "#1a1a2e", color: "#fff" }}>Select size...</option>
                    {companySizes.map(size => (
                      <option key={size} value={size} style={{ backgroundColor: "#1a1a2e", color: "#fff" }}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <h3 style={{ marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", marginTop: "2rem" }}>
                Contact Information
              </h3>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="contactName" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Your Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  placeholder="John Smith"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="form-group">
                  <label htmlFor="contactEmail" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    Work Email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    placeholder="john@company.com"
                    style={inputStyle}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Services */}
              <h3 style={{ marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", marginTop: "2rem" }}>
                Services Interested In
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {services.map(service => (
                  <label
                    key={service.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem",
                      backgroundColor: formData.servicesInterested.includes(service.id) 
                        ? "rgba(0, 212, 255, 0.1)" 
                        : "rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: formData.servicesInterested.includes(service.id)
                        ? "1px solid var(--accent)"
                        : "1px solid transparent",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.servicesInterested.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span style={{ fontSize: "0.9rem" }}>{service.label}</span>
                  </label>
                ))}
              </div>

              {/* Message */}
              <h3 style={{ marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", marginTop: "2rem" }}>
                Additional Information
              </h3>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="message" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Tell us about your security needs
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your current security challenges, upcoming compliance requirements, or any specific concerns..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
              >
                {submitting ? "Submitting..." : "Submit Onboarding Request"}
              </button>

              <p style={{ textAlign: "center", marginTop: "1rem", color: "var(--muted)", fontSize: "0.85rem" }}>
                Already have an account? <Link to="/portal/login" style={{ color: "var(--accent)" }}>Sign in here</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "1rem"
};

const selectStyle = {
  ...inputStyle,
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fff' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.75rem center",
  paddingRight: "2.5rem",
  cursor: "pointer"
};
