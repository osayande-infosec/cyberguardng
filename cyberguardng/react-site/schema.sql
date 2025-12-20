-- CyberGuardNG Client Portal Database Schema
-- Cloudflare D1 (SQLite)

-- Organizations/Clients table
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'pending')),
  subscription_tier TEXT DEFAULT 'standard' CHECK(subscription_tier IN ('basic', 'standard', 'enterprise')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Users table (linked to organizations)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  provider TEXT DEFAULT 'google',
  provider_id TEXT,
  organization_id TEXT,
  role TEXT DEFAULT 'viewer' CHECK(role IN ('admin', 'manager', 'viewer')),
  is_org_admin INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'pending_approval')),
  last_login TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Compliance programs per organization
CREATE TABLE IF NOT EXISTS compliance_programs (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  framework TEXT NOT NULL CHECK(framework IN ('soc2', 'iso27001', 'pci-dss', 'hipaa', 'gdpr', 'nist', 'other')),
  status TEXT DEFAULT 'in_progress' CHECK(status IN ('not_started', 'in_progress', 'audit_ready', 'certified', 'expired')),
  start_date TEXT,
  target_date TEXT,
  certification_date TEXT,
  expiry_date TEXT,
  progress_percent INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Security assessments/reports per organization
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('pentest', 'vulnerability_scan', 'risk_assessment', 'gap_analysis', 'security_audit', 'phishing_test')),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  severity_summary TEXT, -- JSON: {"critical": 0, "high": 2, "medium": 5, "low": 10}
  findings_count INTEGER DEFAULT 0,
  remediated_count INTEGER DEFAULT 0,
  scheduled_date TEXT,
  completed_date TEXT,
  report_url TEXT,
  executive_summary TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Documents per organization
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('policy', 'procedure', 'report', 'certificate', 'evidence', 'template', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT,
  file_url TEXT,
  file_size INTEGER,
  version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'review', 'approved', 'archived')),
  uploaded_by TEXT,
  approved_by TEXT,
  approved_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Activity log per organization (audit trail)
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT, -- JSON for additional context
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Support tickets per organization
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  assigned_to TEXT,
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_org ON compliance_programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessments_org ON assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_org ON activity_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_org ON support_tickets(organization_id);

-- Platform admins (CyberGuardNG staff)
CREATE TABLE IF NOT EXISTS platform_admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'staff' CHECK(role IN ('super_admin', 'admin', 'staff')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Onboarding requests (prospective clients)
CREATE TABLE IF NOT EXISTS onboarding_requests (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_size TEXT,
  services_interested TEXT, -- JSON array
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'contacted', 'approved', 'rejected')),
  notes TEXT, -- Admin notes
  reviewed_by TEXT,
  reviewed_at TEXT,
  organization_id TEXT, -- Set when approved and org created
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_status ON onboarding_requests(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_email ON onboarding_requests(email);
