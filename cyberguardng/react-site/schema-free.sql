-- Simplified Free-Tier Database Schema for CyberGuardNG
-- No Vectorize (costs $5/month), just essential tracking

-- 1. Visitors & Sessions (recognize returning users)
CREATE TABLE IF NOT EXISTS visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT UNIQUE NOT NULL,
  first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  visit_count INTEGER DEFAULT 1,
  user_agent TEXT,
  country TEXT,
  city TEXT
);

CREATE INDEX idx_visitor_id ON visitors(visitor_id);
CREATE INDEX idx_last_seen ON visitors(last_seen);

-- 2. Sessions (track individual visits)
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  visitor_id TEXT NOT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  pages_viewed INTEGER DEFAULT 1,
  chat_opened BOOLEAN DEFAULT 0,
  form_submitted BOOLEAN DEFAULT 0,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id)
);

CREATE INDEX idx_session_id ON sessions(session_id);
CREATE INDEX idx_visitor_sessions ON sessions(visitor_id);

-- 3. Chat Messages (conversation history)
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE INDEX idx_chat_session ON chat_messages(session_id);
CREATE INDEX idx_chat_visitor ON chat_messages(visitor_id);

-- 4. Leads (contact form submissions)
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT,
  session_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  source TEXT, -- 'chat' or 'contact_form'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id)
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created ON leads(created_at);

-- 5. Cookie Consents (GDPR tracking)
CREATE TABLE IF NOT EXISTS cookie_consents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  analytics_consent BOOLEAN DEFAULT 0,
  marketing_consent BOOLEAN DEFAULT 0,
  preferences_consent BOOLEAN DEFAULT 0,
  consented_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id)
);

CREATE INDEX idx_consent_visitor ON cookie_consents(visitor_id);

-- 6. Analytics Events (simple tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT,
  session_id TEXT,
  event_type TEXT NOT NULL, -- 'page_view', 'chat_open', 'form_submit', 'link_click'
  event_data TEXT, -- JSON string
  page_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_type ON analytics_events(event_type);
CREATE INDEX idx_events_date ON analytics_events(created_at);
CREATE INDEX idx_events_visitor ON analytics_events(visitor_id);

-- 7. Simple Content (for chatbot knowledge - no vectors)
CREATE TABLE IF NOT EXISTS knowledge_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'services', 'pricing', 'process', 'faq'
  keywords TEXT, -- Comma-separated for simple search
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_category ON knowledge_content(category);
CREATE INDEX idx_content_keywords ON knowledge_content(keywords);
