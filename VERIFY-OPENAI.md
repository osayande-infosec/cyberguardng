# OpenAI API Key Verification Guide

## Where to Check in Cloudflare

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com
2. Navigate to: **Pages** → **cyberguardng** project
3. Go to: **Settings** → **Environment variables**
4. Look for: `OPENAI_API_KEY`
   - Should be listed under **Production** variables
   - Value should be hidden (shows as `***`)

## Expected Value Format

Your OpenAI API key should look like:
```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Test the Chatbot

### Method 1: Live Site Test
1. Visit your deployed site: `https://cyberguardng.pages.dev`
2. Wait for the chatbot to appear (bottom right corner)
3. Click the chat icon
4. Type: "Hello, what services do you offer?"
5. **Expected result**: Yande responds with information about CyberGuardNG services

### Method 2: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Click chatbot and send a message
4. Look for errors:
   - ✅ **Good**: No errors, response appears
   - ❌ **Bad**: "OPENAI_API_KEY not configured"
   - ❌ **Bad**: 401 Unauthorized (invalid API key)
   - ❌ **Bad**: 429 Rate limit (quota exceeded)

### Method 3: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Send a chat message
4. Look for request to `/functions/chat`
5. Click it and check:
   - **Status**: Should be 200 OK
   - **Response**: Should contain `{"reply": "..."}`

## Common Issues

### Error: "OPENAI_API_KEY not configured"
**Cause**: Environment variable not set in Cloudflare
**Fix**:
1. Go to Cloudflare Pages → Settings → Environment variables
2. Add `OPENAI_API_KEY` with your OpenAI key
3. Save and wait for automatic redeployment (~1-2 minutes)

### Error: 401 Unauthorized
**Cause**: Invalid API key
**Fix**:
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Update in Cloudflare environment variables
4. Save and redeploy

### Error: 429 Rate Limit / Quota Exceeded
**Cause**: OpenAI quota limit reached
**Fix**:
1. Go to https://platform.openai.com/usage
2. Check your usage and billing
3. Add payment method if needed
4. Upgrade plan if necessary

### Chatbot appears but doesn't respond
**Cause**: Function not deployed or error in function
**Fix**:
1. Check Cloudflare Pages → Deployments
2. Ensure latest deployment succeeded
3. Check Functions logs for errors

## Verify Deployment Status

Run this in your browser console on your live site:
```javascript
fetch('/functions/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'test',
    history: []
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Expected output**:
```json
{
  "reply": "Hello! I'm Yande, the CyberGuardNG assistant..."
}
```

**Error outputs**:
- `{"error": "OPENAI_API_KEY not configured"}` → Add API key
- `{"error": "401 Unauthorized"}` → Invalid API key
- Network error → Function not deployed

## Getting Your OpenAI API Key

1. Visit: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Name it: "CyberGuardNG Production"
5. Copy the key (starts with `sk-proj-...`)
6. **Important**: Save it somewhere safe - you can't view it again!

## Adding to Cloudflare

1. Cloudflare Dashboard → Pages → cyberguardng
2. Settings → Environment variables
3. Click "Add variable"
4. Variable name: `OPENAI_API_KEY`
5. Value: Paste your key
6. Environment: **Production** (check this!)
7. Click "Save"
8. Wait 1-2 minutes for automatic redeployment

## Verification Complete

✅ If chatbot responds with relevant answers → **Working correctly!**
❌ If you see error messages → Follow troubleshooting above

Need help? The error messages in browser console will tell you exactly what's wrong.
