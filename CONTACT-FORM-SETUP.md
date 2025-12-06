# Contact Form Setup Guide

## Overview
The contact form uses Cloudflare Pages Functions to handle submissions and send emails via Resend API.

## Setup Steps

### 1. Get Resend API Key
1. Sign up at [resend.com](https://resend.com) (free tier: 100 emails/day)
2. Verify your domain or use their test domain
3. Go to API Keys → Create API Key
4. Copy your API key

### 2. Configure Cloudflare Environment Variables
1. Go to Cloudflare Dashboard → Pages → Your Project
2. Navigate to **Settings** → **Environment variables**
3. Add these variables:

   **Variable 1:**
   - Name: `EMAIL_API_KEY`
   - Value: Your Resend API key
   - Environment: Production (and Preview if needed)

   **Variable 2:**
   - Name: `CONTACT_EMAIL`
   - Value: `sales@cyberguardng.ca` (or your preferred email)
   - Environment: Production (and Preview if needed)

4. Click **Save**

### 3. Deploy
```bash
git add .
git commit -m "Add contact form functionality"
git push
```

Cloudflare will automatically redeploy with the new function.

### 4. Test
1. Go to your live site
2. Navigate to Contact page
3. Fill out and submit the form
4. Check your email (sales@cyberguardng.ca)

## Features

✅ Form validation  
✅ Loading states  
✅ Success/error messages  
✅ Email notifications with all submission details  
✅ Newsletter opt-in tracking  
✅ Reply-to set to submitter's email  
✅ Fallback logging if email not configured  

## Alternative Email Services

### SendGrid
Replace Resend API call with:
```javascript
await fetch("https://api.sendgrid.com/v3/mail/send", {
  headers: {
    "Authorization": `Bearer ${EMAIL_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: TO_EMAIL }] }],
    from: { email: "noreply@cyberguardng.ca" },
    subject: `New Contact: ${name}`,
    content: [{ type: "text/html", value: htmlContent }]
  })
});
```

### Mailgun
```javascript
const formData = new FormData();
formData.append("from", "noreply@cyberguardng.ca");
formData.append("to", TO_EMAIL);
formData.append("subject", `New Contact: ${name}`);
formData.append("html", htmlContent);

await fetch(`https://api.mailgun.net/v3/${DOMAIN}/messages`, {
  method: "POST",
  headers: { "Authorization": `Basic ${btoa("api:" + EMAIL_API_KEY)}` },
  body: formData
});
```

## Troubleshooting

**Form submits but no email received:**
- Check Cloudflare Pages logs for errors
- Verify EMAIL_API_KEY is set correctly
- Check Resend dashboard for delivery status
- Verify sender email domain is configured in Resend

**"Email service not configured" message:**
- EMAIL_API_KEY environment variable is missing
- Submissions are logged to console but not emailed
- Add the API key in Cloudflare settings

**Need help?**
Contact: sales@cyberguardng.ca or +1 438 773 4590
