-- CyberGuardNG Backend Database Schema
-- Run this with: wrangler d1 execute cyberguardng-db --file=schema.sql

-- 1. Knowledge Base Content (for RAG)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'service', 'compliance', 'faq', 'case_study'
  tags TEXT, -- JSON array of tags
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Leads & Contact Form Submissions
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  source TEXT, -- 'chatbot', 'contact_form', 'newsletter'
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  lead_score INTEGER DEFAULT 0, -- 0-100 based on engagement
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Chat Conversations & History
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  lead_id INTEGER, -- Foreign key to leads table if user submitted form
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- 4. Analytics & Insights
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, -- 'question_asked', 'form_shown', 'form_submitted', 'page_view'
  conversation_id INTEGER,
  data TEXT, -- JSON with event details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

CREATE TABLE IF NOT EXISTS popular_topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic TEXT NOT NULL UNIQUE,
  question_count INTEGER DEFAULT 1,
  last_asked DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Dynamic Pricing Matrix
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_type TEXT NOT NULL, -- 'soc2', 'iso27001', 'pentest', etc.
  company_size TEXT NOT NULL, -- 'startup', 'small', 'medium', 'enterprise'
  base_price REAL NOT NULL,
  price_factors TEXT, -- JSON with additional cost factors
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. CMS - Dynamic Content Management
CREATE TABLE IF NOT EXISTS cms_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_key TEXT NOT NULL UNIQUE, -- e.g., 'homepage_hero', 'about_mission'
  content_value TEXT NOT NULL,
  content_type TEXT DEFAULT 'text', -- 'text', 'html', 'json'
  updated_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Appointment Scheduling
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  scheduled_time DATETIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  meeting_type TEXT, -- 'consultation', 'demo', 'follow-up'
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no-show'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- 8. Multi-tenant Support (for white-label)
CREATE TABLE IF NOT EXISTS tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  branding TEXT, -- JSON with logo, colors, etc.
  settings TEXT, -- JSON with tenant-specific settings
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_time);

-- Sample data for knowledge base
INSERT INTO knowledge_base (title, content, category, tags) VALUES
('SOC 2 Compliance Overview', 'SOC 2 is a compliance framework developed by AICPA for service organizations. CyberGuardNG offers comprehensive SOC 2 Type I and Type II audit services. Our process includes gap assessment, control implementation, documentation, and audit support. Timeline: 3-6 months. We support all five trust service criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy.', 'compliance', '["soc2", "audit", "compliance"]'),
('ISO 27001 Certification', 'ISO 27001 is an international standard for information security management. CyberGuardNG guides organizations through the entire certification process including ISMS development, risk assessment, control implementation, internal audits, and external certification. Timeline: 6-12 months. We have certified over 50 organizations globally.', 'compliance', '["iso27001", "certification", "compliance"]'),
('Penetration Testing Services', 'Our penetration testing services identify vulnerabilities before attackers do. We offer web application testing, network testing, mobile app testing, and social engineering assessments. All tests follow OWASP and NIST guidelines. Reports include executive summaries, technical findings, and remediation guidance. Typical duration: 2-4 weeks.', 'service', '["pentest", "security", "testing"]'),
('GDPR Compliance Support', 'CyberGuardNG helps organizations achieve and maintain GDPR compliance. Services include data mapping, privacy impact assessments, DPO services, policy development, and breach response planning. We work with companies processing EU citizen data globally.', 'compliance', '["gdpr", "privacy", "compliance"]'),
('Why Choose CyberGuardNG', 'CyberGuardNG stands out with our practical, business-focused approach to cybersecurity. Unlike traditional consultants, we focus on efficient compliance that doesn''t slow down your business. Our team has 15+ years of experience, we offer fixed-price engagements, and provide ongoing support post-certification. We specialize in high-growth technology companies.', 'faq', '["about", "value"]'),
('Pricing Structure', 'Our pricing is transparent and based on company size and scope. Typical ranges: SOC 2 Type I ($25K-$50K), SOC 2 Type II ($40K-$80K), ISO 27001 ($30K-$60K), Penetration Testing ($10K-$30K). We offer package deals for multiple services. Contact our sales team for a detailed quote based on your specific needs.', 'faq', '["pricing", "cost"]');

-- Sample pricing data
INSERT INTO pricing_tiers (service_type, company_size, base_price, price_factors) VALUES
('soc2_type1', 'startup', 25000, '{"employees_under_50": 0, "cloud_first": -2000, "complex_systems": 5000}'),
('soc2_type1', 'small', 35000, '{"employees_50_200": 0, "multi_region": 3000, "complex_integrations": 5000}'),
('soc2_type1', 'medium', 45000, '{"employees_200_1000": 0, "multi_region": 5000, "legacy_systems": 8000}'),
('soc2_type2', 'startup', 40000, '{"includes_type1": 0, "quarterly_reviews": 5000}'),
('iso27001', 'startup', 30000, '{"employees_under_50": 0, "international": 5000}'),
('pentest_web', 'startup', 12000, '{"apps_1_3": 0, "critical_app": 3000, "api_testing": 2000}');
