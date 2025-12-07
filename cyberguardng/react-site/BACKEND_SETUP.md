# CyberGuardNG Backend Setup Guide

## Prerequisites
- Cloudflare account
- Wrangler CLI installed: `npm install -g wrangler`
- Already deployed to Cloudflare Pages

## Step 1: Create D1 Database

```powershell
# Navigate to project directory
cd C:\Users\osayande\Downloads\cyberguardng_bundle_final\cyberguardng\react-site

# Create D1 database
wrangler d1 create cyberguardng-db
```

This will output a database ID. Copy it and update `wrangler.toml`:
```toml
database_id = "YOUR_ACTUAL_ID_HERE"
```

## Step 2: Initialize Database Schema

```powershell
# Run the schema file
wrangler d1 execute cyberguardng-db --file=schema.sql --remote
```

## Step 3: Create KV Namespace

```powershell
# Create KV namespace for sessions
wrangler kv namespace create KV
```

Copy the namespace ID and update `wrangler.toml`.

## Step 4: Deploy

```powershell
# Deploy with new bindings
git add -A
git commit -m "Add backend database infrastructure"
git push
```

## Environment Variables Already Set
✅ OPENAI_API_KEY
✅ WEB3FORMS_ACCESS_KEY

## Verify Deployment

1. Check Cloudflare Dashboard > D1 > cyberguardng-db
2. Check KV > Your namespace
3. Test chatbot on live site

## What This Enables

### 1. Knowledge Base (Keyword Search)
- Fast keyword search through company docs
- FAQ-style answers
- 100% FREE - no AI costs

### 2. Lead Management
- Track all contact form submissions
- Score leads based on engagement
- View conversation history

### 3. Chat History
- Remember returning visitors
- Personalized experiences
- Conversation continuity

### 4. Analytics
- Track popular topics
- Monitor conversion rates
- Identify drop-off points

### 5. Dynamic Pricing
- Calculate estimates instantly
- Based on company size and requirements
- Transparent pricing

### 6. Content Management
- Update chatbot knowledge via API
- Non-technical team can modify content
- Version control for content changes

### 7. Appointment Scheduling
- Book consultations directly
- Integrate with calendars
- Automated reminders

### 8. Multi-tenant Support
- White-label for partners
- Separate data per tenant
- Scalable architecture

## API Endpoints Created

- `POST /api/chat` - Enhanced chat with RAG
- `POST /api/contact` - Lead capture
- `GET /api/pricing` - Dynamic pricing calculator
- `POST /api/appointment` - Schedule meetings
- `GET /api/analytics` - Dashboard data
- `POST /api/cms/content` - Update knowledge base

## Next Steps

1. Run setup commands above
2. Test chatbot with specific questions
3. View analytics in Cloudflare Dashboard
4. Optionally: Build admin panel for CMS
