# Contact Form Setup Guide

## Overview
The contact form uses **Cloudflare Pages Functions** with **MailChannels** (free, built into Cloudflare Workers) to send emails directly—no external API keys required!

## Setup Steps

### 1. Configure Email Destination (Optional)
By default, emails go to `sales@cyberguardng.ca`. To change:

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Navigate to **Settings** → **Environment variables**
3. Add variable:
   - Name: `CONTACT_EMAIL`
   - Value: Your preferred email address
   - Environment: Production (and Preview if needed)
4. Click **Save**

### 2. Deploy
```bash
git add .
git commit -m "Update contact form"
git push
```

Cloudflare will automatically redeploy.

### 3. Test
1. Go to your live site
2. Navigate to Contact page
3. Fill out and submit the form
4. Check your email (sales@cyberguardng.ca or your configured address)

**That's it!** No API keys, no external services, completely free.

## How It Works

- Uses **MailChannels** API (free partnership with Cloudflare)
- Sends directly from Cloudflare Workers
- Reply-to set to submitter's email
- Professional HTML email formatting
- Full submission details included

## Features

✅ **Zero configuration** - works out of the box  
✅ **Completely free** - no API keys or signups  
✅ Form validation  
✅ Loading states  
✅ Success/error messages  
✅ Beautiful HTML email notifications  
✅ Newsletter opt-in tracking  
✅ Reply-to set to submitter's email  
✅ Email validation  

## Improving Deliverability (Optional)

For best email deliverability, add **DKIM records** to your domain:

### Add DNS Records (Cloudflare DNS)
1. Go to Cloudflare Dashboard → DNS → Records
2. Add these TXT records:

**Record 1:**
- Type: `TXT`
- Name: `mailchannels._domainkey`
- Content: `v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY`

**Record 2:**
- Type: `TXT`  
- Name: `_dmarc`
- Content: `v=DMARC1; p=none; rua=mailto:sales@cyberguardng.ca`

**Record 3:**
- Type: `TXT`
- Name: `@`
- Content: `v=spf1 include:relay.mailchannels.net ~all`

> Note: DKIM setup is optional. Emails will work without it, but deliverability improves with proper DNS records.

## Troubleshooting

**Form submits but no email received:**
- Check spam/junk folder
- Check Cloudflare Pages logs for errors
- Verify CONTACT_EMAIL is correct
- Try submitting with a different email address

**"Failed to send email" error:**
- Check Cloudflare Pages function logs
- Verify your Pages deployment is active
- Ensure the function is properly deployed

**Emails going to spam:**
- Add DKIM records (see above)
- Use a custom domain instead of *.pages.dev
- Ensure sender domain matches your website domain

## No External Services Required!

Unlike the previous setup, this version:
- ❌ No Resend signup needed
- ❌ No API keys to manage
- ❌ No rate limits (beyond Cloudflare's generous free tier)
- ✅ Completely free forever
- ✅ Works immediately after deployment

## Need Help?

Contact: sales@cyberguardng.ca or +1 438 773 4590
