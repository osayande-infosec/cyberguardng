import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function AdminClientDetail() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadClientData();
  }, [orgId]);

  async function loadClientData() {
    try {
      const res = await fetch(`/api/admin/client/${orgId}`);
      if (res.status === 401) {
        navigate("/portal/login");
        return;
      }
      if (res.status === 403) {
        navigate("/portal");
        return;
      }
      if (!res.ok) throw new Error("Failed to load client");
      
      const clientData = await res.json();
      setData(clientData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action, payload) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/client/${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }
      
      await loadClientData();
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(type, itemId) {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      const res = await fetch(`/api/admin/client/${orgId}?type=${type}&id=${itemId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Delete failed");
      await loadClientData();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <main>
        <section className="section">
          <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
            <p>Loading client data...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main>
        <section className="section">
          <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
            <p>{error || "Client not found"}</p>
            <Link to="/portal/admin/clients" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
              Back to Clients
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const { organization, users, compliance, assessments, documents, activity } = data;

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "compliance", label: "Compliance", icon: "✅", count: compliance.length },
    { id: "assessments", label: "Assessments", icon: "🔍", count: assessments.length },
    { id: "documents", label: "Documents", icon: "📄", count: documents.length },
    { id: "users", label: "Users", icon: "👥", count: users.length },
    { id: "activity", label: "Activity", icon: "📋" }
  ];

  return (
    <main>
      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container">
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <Link to="/portal/admin/clients" style={{ color: "var(--muted)", fontSize: "0.9rem", textDecoration: "none" }}>
                ← Back to Clients
              </Link>
              <h1 style={{ marginTop: "0.5rem" }}>{organization.name}</h1>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                <span style={{ ...statusBadge, backgroundColor: organization.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(156,163,175,0.2)', color: organization.status === 'active' ? '#22c55e' : '#9ca3af' }}>
                  {organization.status}
                </span>
                <span style={{ color: "var(--muted)" }}>{organization.industry || "No industry"}</span>
                <span style={{ color: "var(--muted)" }}>•</span>
                <span style={{ color: "var(--muted)" }}>{organization.subscription_tier} tier</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-secondary" onClick={() => setShowUserModal(true)}>
                + Add User
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...tabButton,
                  backgroundColor: activeTab === tab.id ? "var(--accent)" : "rgba(255,255,255,0.05)",
                  color: activeTab === tab.id ? "#fff" : "var(--muted)"
                }}
              >
                {tab.icon} {tab.label}
                {tab.count !== undefined && <span style={{ marginLeft: "0.5rem", opacity: 0.7 }}>({tab.count})</span>}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="card">
            {activeTab === "overview" && (
              <OverviewTab org={organization} compliance={compliance} assessments={assessments} documents={documents} users={users} />
            )}
            
            {activeTab === "compliance" && (
              <ComplianceTab 
                compliance={compliance} 
                onAdd={() => setShowComplianceModal(true)}
                onDelete={(id) => handleDelete("compliance", id)}
                onUpdate={(id, updates) => handleAction("update_compliance", { complianceId: id, ...updates })}
              />
            )}
            
            {activeTab === "assessments" && (
              <AssessmentsTab 
                assessments={assessments} 
                onAdd={() => setShowAssessmentModal(true)}
                onDelete={(id) => handleDelete("assessment", id)}
              />
            )}
            
            {activeTab === "documents" && (
              <DocumentsTab 
                documents={documents} 
                onAdd={() => setShowDocumentModal(true)}
                onDelete={(id) => handleDelete("document", id)}
              />
            )}
            
            {activeTab === "users" && (
              <UsersTab 
                users={users} 
                onAdd={() => setShowUserModal(true)}
                onDelete={(id) => handleDelete("user", id)}
              />
            )}
            
            {activeTab === "activity" && (
              <ActivityTab activity={activity} />
            )}
          </div>
        </div>
      </section>

      {/* Modals */}
      {showComplianceModal && (
        <ComplianceModal 
          onClose={() => setShowComplianceModal(false)}
          onSubmit={async (data) => {
            const success = await handleAction("add_compliance", data);
            if (success) setShowComplianceModal(false);
          }}
          loading={actionLoading}
        />
      )}

      {showAssessmentModal && (
        <AssessmentModal 
          onClose={() => setShowAssessmentModal(false)}
          onSubmit={async (data) => {
            const success = await handleAction("add_assessment", data);
            if (success) setShowAssessmentModal(false);
          }}
          loading={actionLoading}
        />
      )}

      {showDocumentModal && (
        <DocumentModal 
          onClose={() => setShowDocumentModal(false)}
          onSubmit={async (data) => {
            const success = await handleAction("add_document", data);
            if (success) setShowDocumentModal(false);
          }}
          loading={actionLoading}
        />
      )}

      {showUserModal && (
        <UserModal 
          orgId={orgId}
          onClose={() => setShowUserModal(false)}
          onSubmit={async (data) => {
            try {
              const res = await fetch("/api/admin/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "add_user", organizationId: orgId, ...data })
              });
              if (!res.ok) throw new Error("Failed to add user");
              await loadClientData();
              setShowUserModal(false);
            } catch (err) {
              alert(err.message);
            }
          }}
          loading={actionLoading}
        />
      )}
    </main>
  );
}

// ============ TAB COMPONENTS ============

function OverviewTab({ org, compliance, assessments, documents, users }) {
  const stats = [
    { label: "Users", value: users.length, icon: "👥" },
    { label: "Compliance Programs", value: compliance.length, icon: "✅" },
    { label: "Assessments", value: assessments.length, icon: "🔍" },
    { label: "Documents", value: documents.length, icon: "📄" }
  ];

  const activeCompliance = compliance.filter(c => c.status === 'in_progress' || c.status === 'certified').length;
  const completedAssessments = assessments.filter(a => a.status === 'completed').length;

  return (
    <div>
      <h3 style={{ marginBottom: "1rem" }}>Overview</h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map(stat => (
          <div key={stat.label} style={statCard}>
            <div style={{ fontSize: "1.5rem" }}>{stat.icon}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stat.value}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <h4 style={{ marginBottom: "0.75rem" }}>Organization Details</h4>
          <div style={detailGrid}>
            <span style={{ color: "var(--muted)" }}>Contact:</span>
            <span>{org.contact_name || "—"}</span>
            <span style={{ color: "var(--muted)" }}>Email:</span>
            <span>{org.contact_email || "—"}</span>
            <span style={{ color: "var(--muted)" }}>Domain:</span>
            <span>{org.domain || "—"}</span>
            <span style={{ color: "var(--muted)" }}>Industry:</span>
            <span>{org.industry || "—"}</span>
            <span style={{ color: "var(--muted)" }}>Tier:</span>
            <span style={{ textTransform: "capitalize" }}>{org.subscription_tier}</span>
            <span style={{ color: "var(--muted)" }}>Created:</span>
            <span>{new Date(org.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div>
          <h4 style={{ marginBottom: "0.75rem" }}>Quick Stats</h4>
          <div style={detailGrid}>
            <span style={{ color: "var(--muted)" }}>Active Compliance:</span>
            <span>{activeCompliance} / {compliance.length}</span>
            <span style={{ color: "var(--muted)" }}>Completed Assessments:</span>
            <span>{completedAssessments} / {assessments.length}</span>
            <span style={{ color: "var(--muted)" }}>Admin Users:</span>
            <span>{users.filter(u => u.is_org_admin).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceTab({ compliance, onAdd, onDelete, onUpdate }) {
  const frameworks = ["SOC 2", "ISO 27001", "ISO 42001", "GDPR", "PIPEDA", "PHIPA", "HIPAA", "PCI DSS"];
  const statuses = ["not_started", "in_progress", "audit_scheduled", "certified"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3>Compliance Programs</h3>
        <button className="btn btn-primary" onClick={onAdd}>+ Add Program</button>
      </div>

      {compliance.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
          No compliance programs yet. Click "Add Program" to get started.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {compliance.map(c => (
            <div key={c.id} style={itemCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>{c.framework}</div>
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    <select 
                      value={c.status} 
                      onChange={(e) => onUpdate(c.id, { status: e.target.value })}
                      style={selectStyle}
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                    <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                      Progress: {c.progress || 0}%
                    </span>
                    {c.target_date && (
                      <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        Target: {new Date(c.target_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => onDelete(c.id)} style={deleteBtn}>🗑️</button>
              </div>
              {c.notes && <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--muted)" }}>{c.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssessmentsTab({ assessments, onAdd, onDelete }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3>Assessments</h3>
        <button className="btn btn-primary" onClick={onAdd}>+ Add Assessment</button>
      </div>

      {assessments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
          No assessments yet. Click "Add Assessment" to schedule one.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {assessments.map(a => (
            <div key={a.id} style={itemCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>{a.title}</div>
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ ...statusBadge, backgroundColor: getStatusColor(a.status) }}>{a.status}</span>
                    <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Type: {a.type}</span>
                    {a.risk_score && <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Risk: {a.risk_score}</span>}
                    {a.scheduled_date && <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Scheduled: {new Date(a.scheduled_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button onClick={() => onDelete(a.id)} style={deleteBtn}>🗑️</button>
              </div>
              {a.findings_summary && <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--muted)" }}>{a.findings_summary}</div>}
              {a.report_url && <a href={a.report_url} target="_blank" rel="noopener" style={{ color: "var(--accent)", fontSize: "0.85rem" }}>View Report →</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ documents, onAdd, onDelete }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3>Documents</h3>
        <button className="btn btn-primary" onClick={onAdd}>+ Add Document</button>
      </div>

      {documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
          No documents yet. Click "Add Document" to upload one.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {documents.map(d => (
            <div key={d.id} style={{ ...itemCard, padding: "0.75rem 1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>{getDocIcon(d.type)}</span>
                  <div>
                    <a href={d.url} target="_blank" rel="noopener" style={{ color: "var(--text)", textDecoration: "none", fontWeight: "500" }}>
                      {d.name}
                    </a>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      {d.category} • {d.type} • {new Date(d.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a href={d.url} target="_blank" rel="noopener" className="btn btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                    Download
                  </a>
                  <button onClick={() => onDelete(d.id)} style={deleteBtn}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersTab({ users, onAdd, onDelete }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3>Users</h3>
        <button className="btn btn-primary" onClick={onAdd}>+ Add User</button>
      </div>

      {users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
          No users yet. Click "Add User" to invite someone.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Last Login</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.name || "—"}</td>
                <td style={tdStyle}>
                  <span style={{ textTransform: "capitalize" }}>{u.role}</span>
                  {u.is_org_admin ? <span style={{ marginLeft: "0.5rem", color: "var(--accent)" }}>👑</span> : null}
                </td>
                <td style={tdStyle}>
                  <span style={{ ...statusBadge, backgroundColor: u.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(156,163,175,0.2)', color: u.status === 'active' ? '#22c55e' : '#9ca3af' }}>
                    {u.status}
                  </span>
                </td>
                <td style={tdStyle}>{u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}</td>
                <td style={tdStyle}>
                  <button onClick={() => onDelete(u.id)} style={deleteBtn}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ActivityTab({ activity }) {
  return (
    <div>
      <h3 style={{ marginBottom: "1rem" }}>Activity Log</h3>
      
      {activity.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
          No activity recorded yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {activity.map(a => (
            <div key={a.id} style={{ padding: "0.75rem", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "6px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontWeight: "500" }}>{a.action.replace(/_/g, " ")}</span>
                {a.resource_type && <span style={{ color: "var(--muted)", marginLeft: "0.5rem" }}>({a.resource_type})</span>}
              </div>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{new Date(a.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ MODAL COMPONENTS ============

function ComplianceModal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ framework: "", status: "not_started", targetDate: "", notes: "" });
  const frameworks = ["SOC 2", "ISO 27001", "ISO 42001", "GDPR", "PIPEDA", "PHIPA", "HIPAA", "PCI DSS"];

  return (
    <Modal title="Add Compliance Program" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Framework *</label>
          <select value={form.framework} onChange={e => setForm({...form, framework: e.target.value})} style={inputStyle}>
            <option value="">Select framework...</option>
            {frameworks.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inputStyle}>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="audit_scheduled">Audit Scheduled</option>
            <option value="certified">Certified</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Target Date</label>
          <input type="date" value={form.targetDate} onChange={e => setForm({...form, targetDate: e.target.value})} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{...inputStyle, minHeight: "80px"}} placeholder="Any additional notes..." />
        </div>
        <button className="btn btn-primary" disabled={!form.framework || loading} onClick={() => onSubmit(form)}>
          {loading ? "Adding..." : "Add Program"}
        </button>
      </div>
    </Modal>
  );
}

function AssessmentModal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ type: "", title: "", status: "scheduled", scheduledDate: "", findings: "" });
  const types = ["Penetration Test", "Vulnerability Assessment", "Risk Assessment", "Gap Analysis", "Security Audit", "Compliance Audit"];

  return (
    <Modal title="Add Assessment" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Type *</label>
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inputStyle}>
            <option value="">Select type...</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Title *</label>
          <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} placeholder="e.g., Q4 2025 External Pentest" />
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inputStyle}>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Scheduled Date</label>
          <input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Findings Summary</label>
          <textarea value={form.findings} onChange={e => setForm({...form, findings: e.target.value})} style={{...inputStyle, minHeight: "80px"}} placeholder="Summary of findings..." />
        </div>
        <button className="btn btn-primary" disabled={!form.type || !form.title || loading} onClick={() => onSubmit(form)}>
          {loading ? "Adding..." : "Add Assessment"}
        </button>
      </div>
    </Modal>
  );
}

function DocumentModal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ name: "", type: "report", category: "general", url: "", description: "" });
  const types = ["report", "policy", "certificate", "audit", "other"];
  const categories = ["general", "compliance", "assessment", "policy", "training"];

  return (
    <Modal title="Add Document" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Document Name *</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} placeholder="e.g., SOC 2 Type II Report 2025" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Type</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inputStyle}>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Document URL *</label>
          <input type="url" value={form.url} onChange={e => setForm({...form, url: e.target.value})} style={inputStyle} placeholder="https://drive.google.com/..." />
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>
            Upload to Google Drive, Dropbox, or any file host and paste the link here
          </div>
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...inputStyle, minHeight: "60px"}} placeholder="Brief description..." />
        </div>
        <button className="btn btn-primary" disabled={!form.name || !form.url || loading} onClick={() => onSubmit(form)}>
          {loading ? "Adding..." : "Add Document"}
        </button>
      </div>
    </Modal>
  );
}

function UserModal({ orgId, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ email: "", name: "", role: "viewer", isOrgAdmin: false });

  return (
    <Modal title="Add User" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Email *</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle} placeholder="user@company.com" />
        </div>
        <div>
          <label style={labelStyle}>Name</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} placeholder="John Smith" />
        </div>
        <div>
          <label style={labelStyle}>Role</label>
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={inputStyle}>
            <option value="viewer">Viewer (read-only)</option>
            <option value="member">Member (can upload)</option>
            <option value="admin">Admin (full access)</option>
          </select>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
          <input type="checkbox" checked={form.isOrgAdmin} onChange={e => setForm({...form, isOrgAdmin: e.target.checked})} />
          <span>Organization Admin (can manage other users)</span>
        </label>
        <button className="btn btn-primary" disabled={!form.email || loading} onClick={() => onSubmit(form)}>
          {loading ? "Adding..." : "Add User"}
        </button>
      </div>
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.5rem" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============ HELPERS ============

function getStatusColor(status) {
  const colors = {
    scheduled: "rgba(59,130,246,0.2)",
    in_progress: "rgba(234,179,8,0.2)",
    completed: "rgba(34,197,94,0.2)",
    certified: "rgba(34,197,94,0.2)"
  };
  return colors[status] || "rgba(156,163,175,0.2)";
}

function getDocIcon(type) {
  const icons = { report: "📊", policy: "📋", certificate: "🏆", audit: "🔍", other: "📄" };
  return icons[type] || "📄";
}

// ============ STYLES ============

const tabButton = {
  padding: "0.6rem 1rem",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.9rem",
  whiteSpace: "nowrap",
  transition: "all 0.2s ease"
};

const statCard = {
  backgroundColor: "rgba(255,255,255,0.03)",
  padding: "1rem",
  borderRadius: "8px",
  textAlign: "center"
};

const detailGrid = {
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  gap: "0.5rem",
  fontSize: "0.9rem"
};

const itemCard = {
  backgroundColor: "rgba(255,255,255,0.03)",
  padding: "1rem",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.05)"
};

const statusBadge = {
  padding: "0.25rem 0.6rem",
  borderRadius: "4px",
  fontSize: "0.8rem",
  textTransform: "capitalize"
};

const selectStyle = {
  padding: "0.3rem 0.5rem",
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "0.85rem"
};

const deleteBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  opacity: 0.6,
  fontSize: "1rem"
};

const thStyle = {
  textAlign: "left",
  padding: "0.75rem",
  color: "var(--muted)",
  fontSize: "0.85rem",
  fontWeight: "500"
};

const tdStyle = {
  padding: "0.75rem",
  fontSize: "0.9rem"
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: "1rem"
};

const modalContent = {
  backgroundColor: "#0b1124",
  borderRadius: "12px",
  padding: "1.5rem",
  width: "100%",
  maxWidth: "500px",
  maxHeight: "90vh",
  overflow: "auto",
  border: "1px solid rgba(255,255,255,0.1)"
};

const labelStyle = {
  display: "block",
  marginBottom: "0.4rem",
  fontSize: "0.9rem",
  fontWeight: "500"
};

const inputStyle = {
  width: "100%",
  padding: "0.6rem",
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "0.95rem"
};
