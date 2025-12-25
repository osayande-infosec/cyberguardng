import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const CATEGORIES = [
  { value: "pentest_report", label: "Penetration Test Report" },
  { value: "vulnerability_scan", label: "Vulnerability Scan" },
  { value: "compliance_audit", label: "Compliance Audit" },
  { value: "risk_assessment", label: "Risk Assessment" },
  { value: "security_policy", label: "Security Policy" },
  { value: "incident_report", label: "Incident Report" },
  { value: "training_material", label: "Training Material" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" }
];

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [filterOrg, setFilterOrg] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadDocuments();
    }
  }, [filterOrg, filterCategory]);

  async function checkAuth() {
    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      
      if (!session.authenticated) {
        navigate("/portal/login");
        return;
      }

      // Load organizations for filter
      const orgsRes = await fetch("/api/admin/clients");
      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        setOrganizations(orgsData.organizations || []);
      }

      await loadDocuments();
      setLoading(false);
    } catch (err) {
      setError("Failed to authenticate");
      setLoading(false);
    }
  }

  async function loadDocuments() {
    try {
      let url = "/api/admin/documents";
      const params = new URLSearchParams();
      if (filterOrg) params.set("organization_id", filterOrg);
      if (filterCategory) params.set("category", filterCategory);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.status === 403) {
        navigate("/portal");
        return;
      }
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Load documents error:", err);
    }
  }

  async function handleSaveDocument(formData) {
    try {
      const method = editingDoc ? "PUT" : "POST";
      const body = editingDoc ? { id: editingDoc.id, ...formData } : formData;

      const res = await fetch("/api/admin/documents", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save document");
        return;
      }

      setShowModal(false);
      setEditingDoc(null);
      await loadDocuments();
      alert(data.message || "Document saved successfully");
    } catch (err) {
      alert("Error saving document: " + err.message);
    }
  }

  async function handleDeleteDocument(doc) {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/documents?id=${doc.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete document");
        return;
      }
      await loadDocuments();
    } catch (err) {
      alert("Error deleting document: " + err.message);
    }
  }

  if (loading) {
    return (
      <main>
        <section className="section">
          <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: "1rem", color: "var(--muted)" }}>Loading...</p>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div>
              <h1>📄 Document Management</h1>
              <p style={{ color: "var(--muted)" }}>Upload and manage client reports and documents</p>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                className="btn btn-primary"
                onClick={() => { setEditingDoc(null); setShowModal(true); }}
              >
                + Add Document
              </button>
              <Link to="/portal" className="btn btn-secondary">← Back to Portal</Link>
            </div>
          </div>

          {/* Filters */}
          <div className="card" style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "var(--muted)" }}>Organization:</span>
                <select 
                  value={filterOrg} 
                  onChange={(e) => setFilterOrg(e.target.value)}
                  style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "var(--card-bg)", color: "var(--text)" }}
                >
                  <option value="">All Organizations</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "var(--muted)" }}>Category:</span>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "var(--card-bg)", color: "var(--text)" }}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </label>
              <span style={{ color: "var(--muted)", marginLeft: "auto" }}>
                {documents.length} document{documents.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Documents Table */}
          <div className="card">
            {documents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
                <p>No documents found. Click "Add Document" to upload one.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <th style={{ textAlign: "left", padding: "1rem 0.5rem" }}>Title</th>
                      <th style={{ textAlign: "left", padding: "1rem 0.5rem" }}>Organization</th>
                      <th style={{ textAlign: "left", padding: "1rem 0.5rem" }}>Category</th>
                      <th style={{ textAlign: "left", padding: "1rem 0.5rem" }}>Version</th>
                      <th style={{ textAlign: "left", padding: "1rem 0.5rem" }}>Status</th>
                      <th style={{ textAlign: "left", padding: "1rem 0.5rem" }}>Date</th>
                      <th style={{ textAlign: "right", padding: "1rem 0.5rem" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(doc => (
                      <tr key={doc.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          <div style={{ fontWeight: "600" }}>{doc.title}</div>
                          {doc.description && (
                            <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                              {doc.description.substring(0, 60)}{doc.description.length > 60 ? "..." : ""}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "1rem 0.5rem", color: "var(--muted)" }}>
                          {doc.organization_name || "—"}
                        </td>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          <span style={{ 
                            backgroundColor: "rgba(59, 130, 246, 0.2)", 
                            color: "#3b82f6",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.8rem"
                          }}>
                            {CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 0.5rem", color: "var(--muted)" }}>
                          v{doc.version || "1.0"}
                        </td>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          <StatusBadge status={doc.status} />
                        </td>
                        <td style={{ padding: "1rem 0.5rem", color: "var(--muted)", fontSize: "0.85rem" }}>
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "1rem 0.5rem", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            {doc.file_url && (
                              <a 
                                href={doc.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}
                              >
                                View
                              </a>
                            )}
                            <button 
                              className="btn btn-secondary"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}
                              onClick={() => { setEditingDoc(doc); setShowModal(true); }}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-secondary"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.85rem", color: "#ef4444" }}
                              onClick={() => handleDeleteDocument(doc)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Add/Edit Modal */}
      {showModal && (
        <DocumentModal
          document={editingDoc}
          organizations={organizations}
          onSave={handleSaveDocument}
          onClose={() => { setShowModal(false); setEditingDoc(null); }}
        />
      )}
    </main>
  );
}

// Document Modal Component
function DocumentModal({ document, organizations, onSave, onClose }) {
  const [formData, setFormData] = useState({
    organization_id: document?.organization_id || "",
    category: document?.category || "pentest_report",
    title: document?.title || "",
    description: document?.description || "",
    file_url: document?.file_url || "",
    file_name: document?.file_name || "",
    version: document?.version || "1.0",
    status: document?.status || "published"
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(formData);
  }

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "1rem"
    }}>
      <div className="card" style={{ maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>
          {document ? "Edit Document" : "Add New Document"}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--muted)" }}>
              Organization *
            </label>
            <select
              name="organization_id"
              value={formData.organization_id}
              onChange={handleChange}
              required
              disabled={!!document}
              style={{ 
                width: "100%", 
                padding: "0.75rem", 
                borderRadius: "8px", 
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "var(--text)"
              }}
            >
              <option value="">Select Organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--muted)" }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{ 
                width: "100%", 
                padding: "0.75rem", 
                borderRadius: "8px", 
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "var(--text)"
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--muted)" }}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Q4 2024 Penetration Test Report"
              style={{ 
                width: "100%", 
                padding: "0.75rem", 
                borderRadius: "8px", 
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "var(--text)"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--muted)" }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the document..."
              style={{ 
                width: "100%", 
                padding: "0.75rem", 
                borderRadius: "8px", 
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "var(--text)",
                resize: "vertical"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--muted)" }}>
              File URL (Google Drive, Dropbox, etc.)
            </label>
            <input
              type="url"
              name="file_url"
              value={formData.file_url}
              onChange={handleChange}
              placeholder="https://drive.google.com/file/..."
              style={{ 
                width: "100%", 
                padding: "0.75rem", 
                borderRadius: "8px", 
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "var(--text)"
              }}
            />
            <small style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
              Upload your file to cloud storage and paste the share link here
            </small>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--muted)" }}>
                Version
              </label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="1.0"
                style={{ 
                  width: "100%", 
                  padding: "0.75rem", 
                  borderRadius: "8px", 
                  border: "1px solid rgba(255,255,255,0.2)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "var(--text)"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--muted)" }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ 
                  width: "100%", 
                  padding: "0.75rem", 
                  borderRadius: "8px", 
                  border: "1px solid rgba(255,255,255,0.2)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "var(--text)"
                }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {document ? "Update Document" : "Add Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const colors = {
    draft: { bg: "rgba(234, 179, 8, 0.2)", text: "#eab308" },
    published: { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e" },
    archived: { bg: "rgba(156, 163, 175, 0.2)", text: "#9ca3af" }
  };
  
  const color = colors[status] || colors.draft;
  
  return (
    <span style={{
      padding: "0.25rem 0.5rem",
      backgroundColor: color.bg,
      color: color.text,
      borderRadius: "4px",
      fontSize: "0.8rem",
      fontWeight: "500"
    }}>
      {status || "draft"}
    </span>
  );
}
