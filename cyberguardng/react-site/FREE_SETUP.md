# Free Backend Setup Guide

## 🆓 Cost: $0/month (uses only Cloudflare free tier)

### What You Get:
- ✅ Session management (recognize returning visitors)
- ✅ Chat history (Yande remembers conversations)
- ✅ Cookie consent tracking (GDPR compliant)
- ✅ Lead capture & analytics
- ✅ Simple knowledge base (keyword search, no vectors)

---

## Step 1: Install Wrangler CLI

```powershell
npm install -g wrangler
wrangler login
```

---

## Step 2: Create D1 Database (FREE)

```powershell
cd react-site
wrangler d1 create cyberguardng_db
```

Copy the `database_id` from output and paste it into `wrangler-free.toml`:
```toml
database_id = "paste-id-here"
```

---

## Step 3: Create Tables

```powershell
wrangler d1 execute cyberguardng_db --file=schema-free.sql --remote
```

Verify tables created:
```powershell
wrangler d1 execute cyberguardng_db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```

---

## Step 4: Create KV Namespace (FREE)

```powershell
wrangler kv:namespace create "SESSIONS"
```

Copy the `id` from output and paste it into `wrangler-free.toml`:
```toml
id = "paste-id-here"
```

---

## Step 5: Set Environment Variables

```powershell
# Set OpenAI API Key
wrangler secret put OPENAI_API_KEY
# Paste your key when prompted

# Set Web3Forms Key
wrangler secret put WEB3FORMS_ACCESS_KEY
# Paste: deb5b1b1-8dfe-438e-b9ed-5c99aaeb8783
```

---

## Step 6: Populate Knowledge Base (Optional)

Add some content so Yande can answer better:

```powershell
wrangler d1 execute cyberguardng_db --command="
INSERT INTO knowledge_content (title, content, category, keywords) VALUES
('SOC 2 Certification', 'SOC 2 certification typically takes 3-6 months. Process: gap assessment, remediation, audit, certification. Pricing starts at \$25k for startups.', 'services', 'soc2,soc,compliance,audit,certification'),
('ISO 27001 Certification', 'ISO 27001 takes 6-12 months. Comprehensive information security management system. Suitable for organizations of all sizes.', 'services', 'iso,iso27001,certification,infosec'),
('GDPR Compliance', 'GDPR compliance for data protection. Privacy impact assessments, data mapping, consent management.', 'services', 'gdpr,privacy,compliance,data protection'),
('Our Approach', 'End-to-end support: Gap assessment → Remediation → Audit → Certification → Maintenance.', 'process', 'approach,process,methodology'),
('Industries We Serve', 'SaaS, Healthcare, Fintech, Government Contractors, Tech Startups.', 'about', 'industries,sectors,clients')
" --remote
```

---

## Step 7: Deploy

```powershell
# Rename wrangler-free.toml to wrangler.toml
Move-Item wrangler-free.toml wrangler.toml -Force

# Deploy
wrangler pages deploy dist
```

---

## Step 8: Test

Visit your site and:
1. ✅ Chat with Yande - should work normally
2. ✅ Close and reopen chat - Yande should remember conversation
3. ✅ Refresh page - Yande should say "Welcome back!"
4. ✅ Accept cookies - consent saved to database
5. ✅ Submit contact form - lead saved to database

---

## Verify Data

### Check visitors:
```powershell
wrangler d1 execute cyberguardng_db --command="SELECT * FROM visitors LIMIT 10;" --remote
```

### Check chat messages:
```powershell
wrangler d1 execute cyberguardng_db --command="SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10;" --remote
```

### Check leads:
```powershell
wrangler d1 execute cyberguardng_db --command="SELECT * FROM leads ORDER BY created_at DESC;" --remote
```

### Check cookie consents:
```powershell
wrangler d1 execute cyberguardng_db --command="SELECT * FROM cookie_consents ORDER BY consented_at DESC;" --remote
```

---

## Free Tier Limits

✅ **D1 Database:**
- 10 GB storage
- 5 million rows read/day
- 100,000 rows written/day

✅ **KV Storage:**
- 1 GB storage
- 100,000 reads/day
- 1,000 writes/day

✅ **Pages Functions:**
- 100,000 requests/day

**These limits are MORE than enough for a business website!**

---

## What Changed in Your Code

New API endpoints will be created:
- `/api/session` - Session management
- `/api/chat-v2` - Enhanced chat with history
- `/api/consent` - Cookie consent tracking
- `/api/contact-v2` - Lead capture with analytics

Frontend will be updated to use these endpoints automatically.
