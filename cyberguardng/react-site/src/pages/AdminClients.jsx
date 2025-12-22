import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminClients() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState({ organizations: [], pendingRequests: [] });
  const [activeTab, setActiveTab] = useState("requests");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  async function checkAdminAndLoadData() {
    try {
      // Check authentication
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      
      if (!session.authenticated) {
        navigate("/portal/login");
        return;
      }

      // Load admin data
      const adminRes = await fetch("/api/admin/clients");
      
      if (adminRes.status === 403) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (!adminRes.ok) {
        throw new Error("Failed to load admin data");
      }

      const adminData = await adminRes.json();
      
      // Load onboarding requests
      const requestsRes = await fetch("/api/admin/onboarding");
      let requests = [];
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        requests = requestsData.requests || [];
      }

      setData({
        organizations: adminData.organizations || [],
        pendingRequests: requests
      });
      setIsAdmin(true);

    } catch (err) {
      console.error("Admin load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveRequest(request) {
    if (!confirm(`Approve ${request.company_name} and create their organization?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          requestId: request.id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve");
      }

      alert(`✅ ${request.company_name} has been approved and organization created!`);
      checkAdminAndLoadData(); // Reload

    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function handleRejectRequest(request) {
    const reason = prompt(`Reason for rejecting ${request.company_name}?`);
    if (reason === null) return;

    try {
      const response = await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          requestId: request.id,
          notes: reason
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject");
      }

      alert(`Request from ${request.company_name} has been rejected.`);
      checkAdminAndLoadData();

    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  if (loading) {
    return (
      <main>
        <section className="section">
          <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: "1rem", color: "var(--muted)" }}>Loading admin panel...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main>
        <section className="section">
          <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🚫</div>
            <h1>Access Denied</h1>
            <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
              You don't have admin privileges to access this page.
            </p>
            <button onClick={() => navigate("/portal")} className="btn btn-primary">
              Go to Portal
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="section">
        <div className="container">
          {/* Header */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div>
              <h1 style={{ margin: 0 }}>🛡️ Admin Panel</h1>
              <p style={{ color: "var(--muted)", margin: "0.5rem 0 0 0" }}>Manage client organizations and onboarding requests</p>
            </div>
            <button onClick={() => navigate("/portal")} className="btn btn-secondary">
              ← Back to Portal
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
            <button
              onClick={() => setActiveTab("requests")}
              className={activeTab === "requests" ? "btn btn-primary" : "btn btn-secondary"}
              style={{ position: "relative" }}
            >
              Onboarding Requests
              {data.pendingRequests.filter(r => r.status === 'pending').length > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {data.pendingRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("organizations")}
              className={activeTab === "organizations" ? "btn btn-primary" : "btn btn-secondary"}
            >
              Organizations ({data.organizations.length})
            </button>
          </div>

          {/* Onboarding Requests Tab */}
          {activeTab === "requests" && (
            <div>
              {data.pendingRequests.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                  <h3>No Onboarding Requests</h3>
                  <p style={{ color: "var(--muted)" }}>
                    New client requests will appear here when they submit the onboarding form.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {data.pendingRequests.map(request => (
                    <div key={request.id} className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                            <h3 style={{ margin: 0 }}>{request.company_name}</h3>
                            <StatusBadge status={request.status} />
                          </div>
                          <p style={{ color: "var(--muted)", margin: "0 0 0.5rem 0" }}>
                            {request.contact_name} • {request.email}
                          </p>
                          {request.phone && (
                            <p style={{ color: "var(--muted)", margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>
                              📞 {request.phone}
                            </p>
                          )}
                          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem", color: "var(--muted)" }}>
                            {request.industry && <span>🏢 {request.industry}</span>}
                            {request.company_size && <span>👥 {request.company_size}</span>}
                          </div>
                          {request.services_interested && (
                            <div style={{ marginTop: "0.75rem" }}>
                              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Interested in: </span>
                              {JSON.parse(request.services_interested).map(s => (
                                <span key={s} style={{
                                  display: "inline-block",
                                  padding: "0.2rem 0.5rem",
                                  backgroundColor: "rgba(0, 212, 255, 0.1)",
                                  borderRadius: "4px",
                                  fontSize: "0.8rem",
                                  marginRight: "0.5rem",
                                  marginTop: "0.25rem"
                                }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {request.message && (
                            <div style={{ 
                              marginTop: "1rem", 
                              padding: "0.75rem", 
                              backgroundColor: "rgba(255,255,255,0.05)", 
                              borderRadius: "8px",
                              fontSize: "0.9rem"
                            }}>
                              <strong>Message:</strong> {request.message}
                            </div>
                          )}
                          <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
                            Submitted: {new Date(request.created_at).toLocaleString()}
                          </p>
                        </div>
                        {request.status === 'pending' && (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button 
                              onClick={() => handleApproveRequest(request)}
                              className="btn btn-primary"
                              style={{ fontSize: "0.85rem" }}
                            >
                              ✓ Approve
                            </button>
                            <button 
                              onClick={() => handleRejectRequest(request)}
                              className="btn btn-secondary"
                              style={{ fontSize: "0.85rem" }}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Organizations Tab */}
          {activeTab === "organizations" && (
            <div>
              {data.organizations.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏢</div>
                  <h3>No Organizations Yet</h3>
                  <p style={{ color: "var(--muted)" }}>
                    Approved clients will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
                  {data.organizations.map(org => (
                    <div key={org.id} className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h3 style={{ margin: "0 0 0.5rem 0" }}>{org.name}</h3>
                        <StatusBadge status={org.status} />
                      </div>
                      <p style={{ color: "var(--muted)", margin: "0 0 1rem 0", fontSize: "0.9rem" }}>
                        {org.contact_email}
                      </p>
                      <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
                        <span>👥 {org.user_count || 0} users</span>
                        <span>📊 {org.compliance_count || 0} programs</span>
                        <span>🔍 {org.assessment_count || 0} assessments</span>
                      </div>
                      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ 
                          padding: "0.25rem 0.5rem", 
                          backgroundColor: "rgba(0, 212, 255, 0.1)", 
                          borderRadius: "4px",
                          fontSize: "0.8rem"
                        }}>
                          {org.subscription_tier || 'standard'}
                        </span>
                        <button 
                          onClick={() => navigate(`/portal/admin/clients/${org.id}`)}
                          className="btn btn-primary"
                          style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}
                        >
                          Manage →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }) {
  const colors = {
    active: { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e" },
    pending: { bg: "rgba(234, 179, 8, 0.2)", text: "#eab308" },
    contacted: { bg: "rgba(59, 130, 246, 0.2)", text: "#3b82f6" },
    approved: { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e" },
    rejected: { bg: "rgba(239, 68, 68, 0.2)", text: "#ef4444" },
    inactive: { bg: "rgba(156, 163, 175, 0.2)", text: "#9ca3af" },
  };
  
  const color = colors[status] || colors.pending;
  
  return (
    <span style={{
      padding: "0.25rem 0.5rem",
      backgroundColor: color.bg,
      color: color.text,
      borderRadius: "4px",
      fontSize: "0.8rem",
      fontWeight: "500"
    }}>
      {status}
    </span>
  );
}
