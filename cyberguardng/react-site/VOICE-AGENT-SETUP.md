# AI Voice Agent Deployment Guide

## Overview
This voice agent uses Twilio for phone handling and OpenAI Realtime API for conversational AI. Calls are processed through Cloudflare Workers with real-time audio streaming.

## Architecture
```
Caller → Fido (forwarded) → Twilio Phone Number → Cloudflare Worker
                                                    ↓
                                            OpenAI Realtime API
                                                    ↓
                                            D1 Knowledge Base
```

## Prerequisites
✅ Twilio account with $15.50 free credit  
✅ Canadian phone number purchased ($1/month)  
✅ OpenAI API key (already configured: `OPENAI_API_KEY`)  
✅ Cloudflare Pages deployment (already set up)

## Setup Steps

### 1. Configure Fido Call Forwarding

**Option A: Via Phone Dial Code**
```
Dial: *21*[YOUR_TWILIO_NUMBER]#
Example: *21*14165551234#
```

**Option B: Via Fido Website/App**
1. Login to Fido account
2. Go to Settings → Call Management → Call Forwarding
3. Enable "Forward all calls"
4. Enter your Twilio number
5. Save changes

**To Disable Forwarding:**
```
Dial: #21#
```

### 2. Configure Twilio Webhook

In Twilio Console:
1. Go to **Phone Numbers** → **Manage** → **Active Numbers**
2. Click your purchased number
3. Scroll to **Voice & Fax** section
4. **A Call Comes In**: Select `Webhook`
5. Enter webhook URL:
   ```
   https://cyberguardng.ca/voice-webhook
   ```
6. Method: `HTTP POST`
7. Click **Save**

### 3. Deploy to Cloudflare

The voice agent functions are already in the `functions/` directory:
- `voice-webhook.js` - Handles incoming calls from Twilio
- `voice-stream.js` - WebSocket bridge between Twilio and OpenAI
- `knowledge-base.js` - D1 database queries for service info

**Deploy Command:**
```powershell
cd C:\Users\osayande\Downloads\cyberguardng_bundle_final\cyberguardng\react-site
git add functions/voice-webhook.js functions/voice-stream.js functions/knowledge-base.js
git commit -m "Add AI voice agent with Twilio and OpenAI Realtime API integration"
git push
```

GitHub will auto-deploy to Cloudflare Pages (~2 minutes).

### 4. Environment Variables

OpenAI API key is already configured in Cloudflare Pages. No additional secrets needed.

### 5. Test the Voice Agent

**Test Call Flow:**
1. Call your Fido number from any phone
2. Call forwards to Twilio number
3. Hear greeting: "Welcome to CyberGuard N G Security..."
4. AI assistant connects and starts conversation
5. Ask questions about services (SOC 2, ISO 27001, etc.)
6. Agent provides info from knowledge base
7. Can take messages or connect to specialist

**Example Questions to Test:**
- "What is SOC 2 compliance?"
- "Do you offer penetration testing?"
- "I need help with a security incident"
- "What does your virtual CISO service include?"
- "I'd like to schedule a consultation"

## Cost Breakdown

### Per Call (5 minutes average)
- Twilio incoming: $0.0085/min × 5 = $0.0425
- OpenAI Realtime: $0.06/min × 5 = $0.30
- **Total per call: $0.3425**

### Monthly Costs
- **0 calls**: $1.00 (Twilio number only)
- **10 calls**: $4.43
- **50 calls**: $18.13
- **100 calls**: $35.25
- **Fido savings**: $15-50/month (cancel after porting)

## Features

### Current Capabilities
✅ Natural voice conversation with callers  
✅ Answers questions about CyberGuardNG services  
✅ Knowledge base lookup from D1 database (19 articles)  
✅ Takes messages for callback  
✅ Professional receptionist persona  
✅ Handles errors gracefully with fallback  

### Future Enhancements (Optional)
- Calendar integration for appointment booking
- CRM integration (HubSpot, Salesforce)
- Call recording and transcription
- SMS follow-ups after calls
- Voicemail transcription

## Monitoring

**Twilio Console:**
- View call logs: https://console.twilio.com/
- Monitor usage and costs
- Listen to call recordings (if enabled)

**Cloudflare Logs:**
```powershell
npx wrangler tail
```

**OpenAI Usage:**
- Dashboard: https://platform.openai.com/usage
- Track API costs per call

## Troubleshooting

### Issue: "Call cannot be completed"
**Solution:** Check Twilio webhook URL is correct and deployed

### Issue: "Technical difficulties" message
**Solution:** Check Cloudflare logs for errors
```powershell
npx wrangler tail
```

### Issue: No audio from AI
**Solution:** Verify OpenAI API key is valid and has credits

### Issue: Knowledge base not working
**Solution:** Check D1 database binding in Cloudflare dashboard

### Issue: Call forwarding not working
**Solution:** Disable (*#21#) and re-enable (*21*NUMBER#)

## Testing Before Go-Live

1. **Test forwarding**: Call Fido number, verify it rings Twilio
2. **Test webhook**: Check Cloudflare logs for incoming requests
3. **Test conversation**: Ask various questions, verify responses
4. **Test error handling**: Disconnect mid-call, verify graceful handling
5. **Test knowledge base**: Ask about specific services
6. **Monitor costs**: Check Twilio and OpenAI usage dashboards

## Porting Your Number (Optional)

Once satisfied with testing, port your Fido number to Twilio:

1. **Gather Info from Fido:**
   - Account number
   - Account holder name
   - Service address
   - PIN/password

2. **Submit Port Request:**
   - Twilio Console → Phone Numbers → Port
   - Upload LOA (Letter of Authorization)
   - Provide account details

3. **Timeline:**
   - Submission: 1 day processing
   - Port completion: 7-14 business days
   - During port: Keep paying Fido

4. **After Port:**
   - Cancel Fido service for that line
   - Save $15-50/month
   - Number now exclusively on Twilio

## Support

**Twilio Support:** https://support.twilio.com  
**OpenAI Support:** https://help.openai.com  
**Cloudflare Support:** https://support.cloudflare.com

## File Structure
```
functions/
├── voice-webhook.js      # Twilio webhook handler (TwiML response)
├── voice-stream.js       # WebSocket audio streaming (Twilio ↔ OpenAI)
├── knowledge-base.js     # D1 database queries
├── chat.js              # Existing chatbot (web)
├── contact.js           # Contact form handler
└── [[path]].js          # Security headers middleware
```

## Next Steps

1. ✅ Deploy voice agent to Cloudflare
2. ⏳ Configure Twilio webhook URL
3. ⏳ Test call flow end-to-end
4. ⏳ Monitor first 10 calls for quality
5. ⏳ Decide: Keep forwarding or port number
6. ⏳ Optional: Add calendar booking integration

---

**Ready to deploy?** Run the git commands above and test your first call in 2 minutes!
