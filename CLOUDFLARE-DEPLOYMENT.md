# Cloudflare Pages Deployment Guide

## Prerequisites
- Cloudflare account (free tier available)
- GitHub repository with your code
- OpenAI API key for chatbot functionality

## Step-by-Step Deployment

### 1. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Authorize Cloudflare to access your GitHub account
4. Select repository: `osayande-infosec/cyberguardng`

### 2. Configure Build Settings

**Framework preset:** None (or Vite)

**Build configuration:**
- **Build command:** `npm ci && npm run build`
- **Build output directory:** `dist`
- **Root directory (advanced):** `cyberguardng/react-site`

### 3. Environment Variables

Add these environment variables in **Settings** → **Environment variables**:

- **Variable name:** `OPENAI_API_KEY`
- **Value:** Your OpenAI API key (starts with `sk-...`)
- **Environment:** Production (and Preview if needed)

### 4. Deploy

Click **Save and Deploy**. Cloudflare will:
- Clone your repository
- Install dependencies
- Build your React app
- Deploy to their global CDN

### 5. Custom Domain (Optional)

1. Go to **Custom domains** in your Pages project
2. Click **Set up a custom domain**
3. Add your domain (e.g., `cyberguardng.ca`)
4. Follow DNS configuration instructions
5. Cloudflare will automatically provision SSL certificate

## Key Differences from Netlify

### File Structure
- **Netlify:** Functions in `netlify/functions/`
- **Cloudflare:** Functions in `react-site/functions/`

### Function Format
- **Netlify:** Uses `exports.handler` (Node.js style)
- **Cloudflare:** Uses `export async function onRequest*()` (modern ES modules)

### Routing
- **Netlify:** Uses `netlify.toml` with `[[redirects]]`
- **Cloudflare:** Uses `_redirects` file in `public/` folder

### Environment Variables
- Both platforms store them securely in dashboard
- Access via `process.env` (Netlify) or `context.env` (Cloudflare)

## Configuration Files Created

### 1. `_redirects` (in `public/` folder)
```
/*    /index.html   200
```
Handles SPA routing - redirects all routes to index.html

### 2. `_routes.json` (in `public/` folder)
```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
```
Controls which routes are served by Cloudflare Pages vs Functions

## Functions

### Chat Function (`functions/chat.js`)
- Endpoint: `/functions/chat`
- Method: POST
- Proxies requests to OpenAI API
- Requires `OPENAI_API_KEY` environment variable

### Consent Logging (`functions/consent-log.js`)
- Endpoint: `/functions/consent-log`
- Method: POST
- Logs cookie consent preferences

## Testing Locally

### Using Wrangler CLI (Cloudflare's local dev tool)

1. Install Wrangler:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Run local development server:
```bash
cd cyberguardng/react-site
wrangler pages dev dist --binding OPENAI_API_KEY=your-key-here
```

## Advantages of Cloudflare Pages

✅ **Free tier benefits:**
- Unlimited bandwidth
- Unlimited requests
- 500 builds per month
- Automatic HTTPS
- Global CDN (275+ cities)

✅ **Performance:**
- Edge computing (Functions run closer to users)
- Built-in DDoS protection
- HTTP/3 and QUIC support

✅ **Developer experience:**
- Instant rollbacks
- Preview deployments for branches
- Built-in analytics

## Monitoring

After deployment:
1. Check **Analytics** tab for traffic metrics
2. View **Function logs** in real-time
3. Monitor build history in **Deployments** tab

## Troubleshooting

**Build fails:**
- Verify Root directory is set to `cyberguardng/react-site`
- Check build command is `npm ci && npm run build`
- Verify Node.js version compatibility (Node 18 recommended)

**Functions not working:**
- Ensure `OPENAI_API_KEY` is set in environment variables
- Check function logs for errors
- Verify function paths are `/functions/*` not `/.netlify/functions/*`

**404 errors:**
- Ensure `_redirects` file is in the `public/` folder
- Verify it's being copied to `dist/` during build

## Next Steps

1. Commit and push all changes to GitHub
2. Follow deployment steps above
3. Test your deployed site
4. Configure custom domain if needed
5. Set up monitoring and alerts

## Support

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Cloudflare Workers/Functions: https://developers.cloudflare.com/workers/
- Community Discord: https://discord.gg/cloudflaredev
