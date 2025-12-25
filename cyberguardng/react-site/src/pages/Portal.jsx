import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Portal() {
  const [loading, setLoading] = useState(true);
  const [portalData, setPortalData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPortalData();
  }, []);

  async function loadPortalData() {
    try {
      // First check if user is authenticated
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      
      if (!sessionData.authenticated) {
        navigate("/portal/login");
        return;
      }

      // Then load portal data (which checks DB access)
      const portalRes = await fetch("/api/portal/data");
      const data = await portalRes.json();
      
      if (portalRes.status === 401) {
        navigate("/portal/login");
        return;
      }

      // If DB not configured, show session user with pending state
      if (data.error === "Database not configured") {
        setPortalData({
          access: "pending",
          user: sessionData.user,
          message: "Portal database is being configured."
        });
      } else {
        setPortalData(data);
      }
    } catch (err) {
      console.error("Portal load error:", err);
      setError("Failed to load portal data");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      navigate("/portal/login");
    } catch (err) {
      console.error("Logout failed:", err);
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

  if (error) {
    return (
      <main>
        <section className="section">
          <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>
            <h2>Error</h2>
            <p style={{ color: "var(--muted)" }}>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Retry
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Handle different access states
  if (portalData?.access === "not_found") {
    return <NotFoundAccount user={portalData.user} onLogout={handleLogout} />;
  }

  if (portalData?.access === "pending") {
    return <PendingApproval user={portalData.user} onLogout={handleLogout} />;
  }

  if (portalData?.access === "inactive") {
    return <InactiveAccount user={portalData.user} message={portalData.message} onLogout={handleLogout} />;
  }

  if (portalData?.access === "admin") {
    return <AdminDashboard user={portalData.user} onLogout={handleLogout} />;
  }

  // Full client portal access
  return <ClientDashboard data={portalData} onLogout={handleLogout} />;
}

// No account found - redirect to onboarding
function NotFoundAccount({ user, onLogout }) {
  return (
    <main>
      <section className="section">
        <div className="container" style={{ maxWidth: "600px", textAlign: "center", padding: "4rem 0" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔐</div>
          <h1>No Account Found</h1>
          <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
            Hi {user?.name?.split(" ")[0] || "there"}, we don't have a client account associated with <strong>{user?.email}</strong>.
          </p>
          <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
            If you're a new client, please request access to get started.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/portal/onboarding" className="btn btn-primary">
              Request Client Access
            </a>
            <button onClick={onLogout} className="btn btn-secondary">
              Sign Out
            </button>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "2rem" }}>
            Already submitted a request? Your approval is in progress. We'll email you once your account is ready.
          </p>
        </div>
      </section>
    </main>
  );
}

// Pending approval screen (for users who have been added but org not fully approved)
function PendingApproval({ user, onLogout }) {
  return (
    <main>
      <section className="section">
        <div className="container" style={{ maxWidth: "600px", textAlign: "center", padding: "4rem 0" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⏳</div>
          <h1>Account Pending Approval</h1>
          <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
            Hi {user?.name?.split(" ")[0] || user?.email || "there"}, your account is pending approval.
          </p>
          <div className="card" style={{ textAlign: "left", marginBottom: "2rem" }}>
            <h3>Next Steps</h3>
            <ol style={{ color: "var(--muted)", paddingLeft: "1.5rem" }}>
              <li>Contact CyberGuardNG to complete your onboarding</li>
              <li>Our team will verify your organization details</li>
              <li>Once approved, you'll have full access to your portal</li>
            </ol>
          </div>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:info@cyberguardng.ca" className="btn btn-primary">
              Contact Us
            </a>
            <button onClick={onLogout} className="btn btn-secondary">
              Sign Out
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

// Inactive account screen
function InactiveAccount({ user, message, onLogout }) {
  return (
    <main>
      <section className="section">
        <div className="container" style={{ maxWidth: "600px", textAlign: "center", padding: "4rem 0" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔒</div>
          <h1>Account Inactive</h1>
          <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>{message}</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:support@cyberguardng.ca" className="btn btn-primary">
              Contact Support
            </a>
            <button onClick={onLogout} className="btn btn-secondary">
              Sign Out
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

// Admin dashboard (for CyberGuardNG staff)
function AdminDashboard({ user, onLogout }) {
  return (
    <main>
      <section className="section">
        <div className="container">
          <PortalHeader user={user} onLogout={onLogout} />
          
          <div className="section-header" style={{ textAlign: "left", marginBottom: "2rem" }}>
            <h1>🛡️ Admin Dashboard</h1>
            <p>Manage client organizations, users, and documents.</p>
          </div>

          <div className="card" style={{ marginBottom: "2rem" }}>
            <h3>Quick Actions</h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <a href="/portal/admin/clients" className="btn btn-primary">
                Manage Clients
              </a>
              <a href="/portal/admin/documents" className="btn btn-primary">
                📄 Manage Documents
              </a>
              <a href="/portal/admin/users" className="btn btn-secondary">
                Manage Users
              </a>
            </div>
          </div>

          <div className="card">
            <h3>Admin API Endpoints</h3>
            <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
              Use these endpoints to manage clients:
            </p>
            <code style={{ display: "block", padding: "1rem", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "8px", fontSize: "0.85rem" }}>
              GET /api/admin/clients - List all organizations<br/>
              POST /api/admin/clients - Create org or add user<br/>
              GET /api/admin/documents - List all documents<br/>
              POST /api/admin/documents - Upload document for client
            </code>
          </div>
        </div>
      </section>
    </main>
  );
}

// Client dashboard (main portal view)
function ClientDashboard({ data, onLogout }) {
  const { user, organization, dashboard } = data;

  return (
    <main>
      <section className="section">
        <div className="container">
          <PortalHeader user={user} organization={organization} onLogout={onLogout} />

          <div className="section-header" style={{ textAlign: "left", marginBottom: "2rem" }}>
            <h1>{organization?.name || "Client"} Portal</h1>
            <p>Access your security assessments, compliance reports, and documentation.</p>
          </div>

          {/* Dashboard Cards */}
          <div className="services-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {/* Compliance Status */}
            <div className="card">
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📊</div>
              <h3>Compliance Programs</h3>
              {dashboard?.compliance?.length > 0 ? (
                <div style={{ marginTop: "1rem" }}>
                  {dashboard.compliance.map((program) => (
                    <div key={program.id} style={{ 
                      padding: "0.75rem", 
                      backgroundColor: "rgba(255,255,255,0.05)", 
                      borderRadius: "8px",
                      marginBottom: "0.5rem"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "600" }}>{program.framework?.toUpperCase()}</span>
                        <StatusBadge status={program.status} />
                      </div>
                      {program.progress_percent > 0 && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <ProgressBar percent={program.progress_percent} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--muted)" }}>No compliance programs yet.</p>
              )}
            </div>

            {/* Security Assessments */}
            <div className="card">
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
              <h3>Security Assessments</h3>
              {dashboard?.assessments?.length > 0 ? (
                <div style={{ marginTop: "1rem" }}>
                  {dashboard.assessments.slice(0, 3).map((assessment) => (
                    <div key={assessment.id} style={{ 
                      padding: "0.75rem", 
                      backgroundColor: "rgba(255,255,255,0.05)", 
                      borderRadius: "8px",
                      marginBottom: "0.5rem"
                    }}>
                      <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{assessment.title}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                        {assessment.type?.replace(/_/g, " ")} • <StatusBadge status={assessment.status} small />
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem", fontSize: "0.85rem" }}>
                    View All Reports →
                  </button>
                </div>
              ) : (
                <p style={{ color: "var(--muted)" }}>No assessments scheduled yet.</p>
              )}
            </div>

            {/* Documents */}
            <div className="card">
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📁</div>
              <h3>Reports & Documents</h3>
              {dashboard?.documents?.length > 0 ? (
                <div style={{ marginTop: "1rem" }}>
                  {dashboard.documents.slice(0, 4).map((doc) => (
                    <div key={doc.id} style={{ 
                      padding: "0.75rem",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                      marginBottom: "0.5rem"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "0.5rem" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{doc.title}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                            {formatCategory(doc.category)} • v{doc.version || "1.0"}
                          </div>
                        </div>
                        {doc.file_url && (
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            download
                            className="btn btn-primary"
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", whiteSpace: "nowrap" }}
                          >
                            ⬇ Download
                          </a>
                        )}
                      </div>
                      {doc.description && (
                        <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                          {doc.description}
                        </div>
                      )}
                    </div>
                  ))}
                  {dashboard.documents.length > 4 && (
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", marginTop: "0.5rem" }}>
                      +{dashboard.documents.length - 4} more documents
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ color: "var(--muted)" }}>No documents available yet. Your reports will appear here once uploaded.</p>
              )}
            </div>

            {/* Support */}
            <div className="card">
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>💬</div>
              <h3>Support</h3>
              <p>Need help? Contact your dedicated security consultant.</p>
              {dashboard?.openTickets?.length > 0 && (
                <div style={{ 
                  marginTop: "1rem", 
                  padding: "0.75rem", 
                  backgroundColor: "rgba(234, 179, 8, 0.1)", 
                  borderRadius: "8px",
                  border: "1px solid rgba(234, 179, 8, 0.3)"
                }}>
                  <span style={{ color: "#eab308" }}>
                    {dashboard.openTickets.length} open ticket{dashboard.openTickets.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              <div style={{ marginTop: "1rem" }}>
                <a href="mailto:support@cyberguardng.ca" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
                  Contact Support
                </a>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {dashboard?.recentActivity?.length > 0 && (
            <div style={{ marginTop: "3rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>Recent Activity</h3>
              <div className="card" style={{ padding: "0" }}>
                {dashboard.recentActivity.map((activity, index) => (
                  <div key={activity.id} style={{ 
                    padding: "1rem", 
                    borderBottom: index < dashboard.recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{activity.action?.replace(/_/g, " ")}</span>
                      <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// Shared portal header
function PortalHeader({ user, organization, onLogout }) {
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      marginBottom: "2rem",
      paddingBottom: "1.5rem",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      flexWrap: "wrap",
      gap: "1rem"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user?.picture ? (
          <img 
            src={user.picture} 
            alt=""
            referrerPolicy="no-referrer"
            style={{ 
              width: "56px", 
              height: "56px", 
              borderRadius: "50%",
              border: "2px solid var(--accent)",
              objectFit: "cover"
            }}
          />
        ) : (
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "2px solid var(--accent)",
            backgroundColor: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "var(--bg)"
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Welcome, {user?.name?.split(" ")[0] || "User"}</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            {user?.email}
            {organization && <span> • {organization.name}</span>}
          </p>
        </div>
      </div>
      <button 
        onClick={onLogout}
        className="btn btn-secondary"
        style={{ fontSize: "0.9rem" }}
      >
        Sign Out
      </button>
    </div>
  );
}

// Format document category for display
function formatCategory(category) {
  const labels = {
    pentest_report: "Penetration Test",
    vulnerability_scan: "Vulnerability Scan",
    compliance_audit: "Compliance Audit",
    risk_assessment: "Risk Assessment",
    security_policy: "Security Policy",
    incident_report: "Incident Report",
    training_material: "Training",
    certificate: "Certificate",
    other: "Other"
  };
  return labels[category] || category?.replace(/_/g, " ") || "Document";
}

// Status badge component
function StatusBadge({ status, small }) {
  const colors = {
    in_progress: { bg: "rgba(59, 130, 246, 0.2)", text: "#3b82f6" },
    completed: { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e" },
    certified: { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e" },
    audit_ready: { bg: "rgba(234, 179, 8, 0.2)", text: "#eab308" },
    scheduled: { bg: "rgba(156, 163, 175, 0.2)", text: "#9ca3af" },
    not_started: { bg: "rgba(156, 163, 175, 0.2)", text: "#9ca3af" },
  };
  
  const color = colors[status] || colors.not_started;
  
  return (
    <span style={{
      padding: small ? "0.15rem 0.4rem" : "0.25rem 0.5rem",
      backgroundColor: color.bg,
      color: color.text,
      borderRadius: "4px",
      fontSize: small ? "0.75rem" : "0.8rem",
      fontWeight: "500"
    }}>
      {status?.replace(/_/g, " ") || "unknown"}
    </span>
  );
}

// Progress bar component
function ProgressBar({ percent }) {
  return (
    <div style={{
      width: "100%",
      height: "6px",
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: "3px",
      overflow: "hidden"
    }}>
      <div style={{
        width: `${percent}%`,
        height: "100%",
        backgroundColor: percent >= 100 ? "#22c55e" : "#3b82f6",
        borderRadius: "3px",
        transition: "width 0.3s ease"
      }} />
    </div>
  );
}
