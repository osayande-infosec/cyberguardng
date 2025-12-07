# CyberGuardNG Backend Architecture

## 🎯 Overview

The CyberGuardNG backend is a **100% FREE** serverless architecture using Cloudflare's free tier services. Total cost: **$0/month** for infrastructure (only OpenAI API ~$5-10/month).

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  React App   │  │  ChatLauncher│  │ CookieBanner │         │
│  │   (Vite)     │  │   (Yande AI) │  │   (GDPR)     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
          │ HTTPS            │ WebSocket-like   │ POST /api/consent
          │                  │ POST /api/chat   │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE PAGES (Edge)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Static Assets (React SPA)                    │  │
│  │  • index.html, CSS, JS bundles                           │  │
│  │  • Images, fonts, sitemap.xml                            │  │
│  │  • Cached globally on Cloudflare CDN                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Cloudflare Pages Functions (Serverless)          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │ /api/session│  │ /api/chat-v2│  │/api/consent│         │  │
│  │  │  (Session  │  │ (AI Chat + │  │  (Cookie   │         │  │
│  │  │  Tracking) │  │  History)  │  │  Tracking) │         │  │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘         │  │
│  │        │                │                │                │  │
│  │  ┌─────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐         │  │
│  │  │/api/contact│  │/api/analytics│ Environment │         │  │
│  │  │  (Lead     │  │  (Metrics) │  │  Variables │         │  │
│  │  │  Capture)  │  │            │  │  • OPENAI  │         │  │
│  │  └────────────┘  └────────────┘  │  • WEB3FORMS│         │  │
│  │                                   └────────────┘         │  │
│  └────────┬─────────────────┬─────────────────┬────────────┘  │
└───────────┼─────────────────┼─────────────────┼───────────────┘
            │                 │                 │
            ▼                 ▼                 ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Cloudflare D1  │  │ Cloudflare KV   │  │   OpenAI API    │
│   (Database)    │  │  (Cache Store)  │  │   (GPT-4o-mini) │
│                 │  │                 │  │                 │
│  Tables:        │  │  • Session IDs  │  │  • Chat         │
│  • visitors     │  │  • Temp data    │  │    completions  │
│  • sessions     │  │  • Fast lookups │  │  • Embeddings   │
│  • chat_msgs    │  │                 │  │    (optional)   │
│  • leads        │  │ 📊 100k reads/  │  │                 │
│  • consents     │  │    1k writes    │  │ 💰 ~$5-10/mo   │
│  • analytics    │  │    per day      │  │                 │
│  • knowledge    │  │    (FREE)       │  │                 │
│  📊 5M reads/   │  └─────────────────┘  └─────────────────┘
│     100k writes │
│     per day     │
│     (FREE)      │
└─────────────────┘
```

---

## 📊 Data Flow Examples

### 1️⃣ New Visitor Arrives
```
User loads site
    ↓
React App generates visitor_id (localStorage)
    ↓
POST /api/session { visitor_id }
    ↓
Function checks D1: visitors table
    ↓
If new: INSERT INTO visitors
If existing: UPDATE visit_count++
    ↓
Return { is_returning: true/false }
    ↓
Yande greets: "Welcome back! 🎉" or "Hello! 👋"
```

### 2️⃣ User Chats with Yande
```
User types message
    ↓
POST /api/chat-v2 { message, visitor_id, session_id }
    ↓
Function:
  1. INSERT user message → chat_messages
  2. Retrieve last 5 messages → chat_messages
  3. Search knowledge base → keywords match
  4. Build context with history
  5. Call OpenAI API
  6. INSERT assistant response → chat_messages
  7. Track analytics → analytics_events
    ↓
Return AI response
    ↓
Display in chat widget
```

### 3️⃣ Cookie Consent
```
User clicks "Accept All"
    ↓
POST /api/consent { visitor_id, analytics: true, marketing: true }
    ↓
INSERT INTO cookie_consents (visitor_id, analytics, marketing, ip, user_agent)
    ↓
Return { success: true }
    ↓
Enable tracking scripts
```

### 4️⃣ Lead Submission
```
User fills consultation form
    ↓
POST /api/contact-v2 { name, email, company, message, visitor_id, session_id }
    ↓
Function:
  1. INSERT INTO leads
  2. UPDATE sessions SET has_form_submission=1
  3. Track analytics event
  4. Send Web3Forms email notification
    ↓
Return success
    ↓
Show "Thank you" message
```

---

## 🗄️ Database Schema

### **visitors** (Track unique users)
```sql
- id (PRIMARY KEY)
- visitor_id (UNIQUE) - UUID from localStorage
- first_seen - Timestamp
- last_seen - Timestamp
- visit_count - Integer
- last_ip - For security
- last_user_agent - Device info
```

### **sessions** (Individual visits)
```sql
- id (PRIMARY KEY)
- session_id (UNIQUE) - UUID per page load
- visitor_id (FOREIGN KEY → visitors)
- started_at - Timestamp
- has_chat - Boolean (did they open chat?)
- has_form_submission - Boolean (did they submit form?)
```

### **chat_messages** (Full conversation history)
```sql
- id (PRIMARY KEY)
- session_id (FOREIGN KEY → sessions)
- role - 'user' or 'assistant'
- content - Message text
- created_at - Timestamp
```

### **leads** (Contact form submissions)
```sql
- id (PRIMARY KEY)
- visitor_id (FOREIGN KEY → visitors)
- session_id (FOREIGN KEY → sessions)
- name, email, company, phone, message
- source - How they found us
- created_at - Timestamp
```

### **cookie_consents** (GDPR compliance)
```sql
- id (PRIMARY KEY)
- visitor_id (FOREIGN KEY → visitors)
- analytics - Boolean
- marketing - Boolean
- preferences - Boolean
- ip_address - For audit trail
- user_agent - For audit trail
- consented_at - Timestamp
```

### **analytics_events** (User behavior tracking)
```sql
- id (PRIMARY KEY)
- visitor_id (FOREIGN KEY → visitors)
- session_id (FOREIGN KEY → sessions)
- event_type - 'page_view', 'chat_open', 'form_submit', etc.
- page_url - Where it happened
- created_at - Timestamp
```

### **knowledge_content** (Yande's knowledge base)
```sql
- id (PRIMARY KEY)
- title - Content title
- content - The actual text
- category - 'services', 'pricing', 'process', etc.
- keywords - Comma-separated for simple search
- created_at - Timestamp
- updated_at - Timestamp
```

---

## 🔧 Cloudflare Setup Required

### 1. D1 Database (FREE)
```powershell
wrangler d1 create cyberguardng_db
```
**Limits:** 10GB storage, 5M reads/day, 100k writes/day

### 2. KV Namespace (FREE)
```powershell
wrangler kv:namespace create "SESSIONS"
```
**Limits:** 1GB storage, 100k reads/day, 1k writes/day

### 3. Environment Variables
Set in Cloudflare Dashboard → Pages → Settings → Environment Variables:
- `OPENAI_API_KEY` - Your OpenAI key
- `WEB3FORMS_ACCESS_KEY` - deb5b1b1-8dfe-438e-b9ed-5c99aaeb8783

### 4. Deploy
```powershell
wrangler pages deploy dist
```

---

## 💰 Cost Breakdown

| Service | Usage | Cost |
|---------|-------|------|
| **Cloudflare Pages** | Hosting + CDN | $0 (Free tier: unlimited requests) |
| **Cloudflare D1** | Database | $0 (Free tier: 5M reads, 100k writes/day) |
| **Cloudflare KV** | Cache | $0 (Free tier: 100k reads, 1k writes/day) |
| **Pages Functions** | Serverless APIs | $0 (Free tier: 100k requests/day) |
| **OpenAI API** | GPT-4o-mini | ~$5-10/month (depends on chat volume) |
| **Web3Forms** | Contact form emails | $0 (Free tier: 250 emails/month) |
| **TOTAL** | | **~$5-10/month** |

---

## 🚀 Features Enabled

✅ **Returning Visitor Detection** - "Welcome back!"  
✅ **Chat History Persistence** - Yande remembers conversations  
✅ **Lead Capture** - Contact forms saved to database  
✅ **GDPR Compliance** - Cookie consent tracking  
✅ **Analytics Dashboard** - Track visitors, conversions, popular topics  
✅ **Knowledge Base** - Yande searches internal content  
✅ **Session Tracking** - Understand user journeys  

---

## 📝 Activation Checklist

Follow **FREE_SETUP.md** for step-by-step instructions:

- [ ] Install Wrangler CLI
- [ ] Create D1 database
- [ ] Run schema-free.sql
- [ ] Create KV namespace
- [ ] Set environment variables
- [ ] Populate knowledge base (optional)
- [ ] Deploy to Cloudflare
- [ ] Test all features

---

## 🔍 Monitoring & Debugging

### Check Database Data
```powershell
# See recent visitors
wrangler d1 execute cyberguardng_db --command="SELECT * FROM visitors ORDER BY last_seen DESC LIMIT 10;" --remote

# See chat messages
wrangler d1 execute cyberguardng_db --command="SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 20;" --remote

# See leads
wrangler d1 execute cyberguardng_db --command="SELECT * FROM leads ORDER BY created_at DESC;" --remote
```

### View Function Logs
Cloudflare Dashboard → Pages → Your Project → Functions → Logs

### Analytics Endpoint
`GET /api/analytics-simple` returns:
- Total visitors
- Total sessions
- Total chat messages
- Total leads
- Conversion rate
- Top events

---

## 🔐 Security Features

✅ HTTPS everywhere (Cloudflare SSL)  
✅ CORS protection on API endpoints  
✅ Rate limiting (Cloudflare automatic)  
✅ DDoS protection (Cloudflare automatic)  
✅ SQL injection protection (parameterized queries)  
✅ IP logging for audit trails  
✅ Environment variable encryption  

---

## 📚 Related Documentation

- **FREE_SETUP.md** - Step-by-step deployment guide
- **README.md** - Project overview
- **SEO_SUMMARY.md** - SEO configuration details

---

**Built with Cloudflare's free tier. Zero infrastructure costs. Enterprise capabilities.**
