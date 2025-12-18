import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Portal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        // Not authenticated, redirect to login
        navigate("/portal/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      navigate("/portal/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      navigate("/portal/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  if (loading) {
    return (
      <main>
        <section className="section">
          <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: "1rem", color: "var(--muted)" }}>Loading portal...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <main>
      <section className="section">
        <div className="container">
          {/* Portal Header */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {user.picture && (
                <img 
                  src={user.picture} 
                  alt={user.name}
                  style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "50%",
                    border: "2px solid var(--accent)"
                  }}
                />
              )}
              <div>
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Welcome, {user.name}</h2>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>{user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ fontSize: "0.9rem" }}
            >
              Sign Out
            </button>
          </div>

          {/* Portal Dashboard */}
          <div className="section-header" style={{ textAlign: "left", marginBottom: "2rem" }}>
            <h1>Client Portal</h1>
            <p>Access your security assessments, compliance reports, and documentation.</p>
          </div>

          {/* Dashboard Cards */}
          <div className="services-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {/* Compliance Status */}
            <div className="card">
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📊</div>
              <h3>Compliance Status</h3>
              <p>Track your SOC 2, ISO 27001, and other compliance program progress.</p>
              <div style={{ 
                marginTop: "1rem", 
                padding: "0.75rem", 
                backgroundColor: "rgba(34, 197, 94, 0.1)", 
                borderRadius: "8px",
                border: "1px solid rgba(34, 197, 94, 0.3)"
              }}>
                <span style={{ color: "#22c55e", fontWeight: "600" }}>● On Track</span>
                <span style={{ color: "var(--muted)", marginLeft: "0.5rem" }}>- Next audit: Q1 2026</span>
              </div>
            </div>

            {/* Security Reports */}
            <div className="card">
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📋</div>
              <h3>Security Reports</h3>
              <p>View penetration test results, vulnerability assessments, and remediation status.</p>
              <div style={{ marginTop: "1rem" }}>
                <a href="#" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
                  View Reports →
                </a>
              </div>
            </div>

            {/* Documents */}
            <div className="card">
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📁</div>
              <h3>Documents</h3>
              <p>Access policies, procedures, and compliance documentation.</p>
              <div style={{ marginTop: "1rem" }}>
                <a href="#" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
                  Browse Documents →
                </a>
              </div>
            </div>

            {/* Support */}
            <div className="card">
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>💬</div>
              <h3>Support</h3>
              <p>Need help? Contact your dedicated security consultant.</p>
              <div style={{ marginTop: "1rem" }}>
                <a href="mailto:support@cyberguardng.ca" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
                  Contact Support
                </a>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ marginTop: "3rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Recent Activity</h3>
            <div className="card" style={{ padding: "0" }}>
              <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>🔒 Security assessment completed</span>
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>2 days ago</span>
                </div>
              </div>
              <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>📄 SOC 2 policy documents updated</span>
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>1 week ago</span>
                </div>
              </div>
              <div style={{ padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>✅ Vulnerability remediation verified</span>
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>2 weeks ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
