# Security Testing Plan - CyberGuardNG Website

## Executive Summary
Last Updated: December 8, 2025
Status: ✅ No critical vulnerabilities found
React Version: 18.3.1 (Latest Stable)

---

## 1. Dependency Security Scanning

### Current Status
- ✅ **npm audit**: 0 vulnerabilities
- ✅ **React 18.3.1**: Not affected by recent CVEs
- ✅ **No Next.js**: Next.js vulnerabilities N/A

### Ongoing Actions
```bash
# Run weekly
cd react-site
npm audit
npm outdated

# Fix vulnerabilities automatically
npm audit fix

# Check for major updates
npm outdated --long
```

### Tools to Integrate
1. **Snyk** (Free for open source)
   ```bash
   npm install -g snyk
   snyk auth
   snyk test
   snyk monitor  # Continuous monitoring
   ```

2. **Dependabot** (GitHub native)
   - Already monitoring your repo
   - Auto-creates PRs for vulnerable dependencies
   - Configure in `.github/dependabot.yml`

3. **npm-check-updates**
   ```bash
   npm install -g npm-check-updates
   ncu  # Check for updates
   ncu -u  # Update package.json
   ```

---

## 2. Frontend Security Testing

### Input Validation & XSS Prevention
**Risk Areas:**
- Contact form (email, name, message)
- Chat widget (user messages)
- Cookie consent preferences

**Testing Steps:**
```javascript
// Test payloads
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
javascript:alert('XSS')
${7*7}
{{7*7}}
```

**Mitigations in Place:**
- ✅ React auto-escapes JSX content
- ✅ No `dangerouslySetInnerHTML` usage
- ⚠️ Need to validate: Contact form server-side validation

**Action Items:**
- [ ] Add input sanitization in contact form backend
- [ ] Implement rate limiting on chat endpoint
- [ ] Add CAPTCHA to contact form

### Content Security Policy (CSP)
**Current Status:** ⚠️ Not implemented

**Recommended CSP Headers:**
```javascript
// Add to Cloudflare Pages _headers file
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Action:** Create `react-site/public/_headers` file

---

## 3. Backend API Security (Cloudflare Functions)

### Authentication & Authorization
**Current Status:** ⚠️ No authentication on endpoints

**Endpoints to Secure:**
- `/consent-log` - Rate limiting needed
- `/chat` - OpenAI API key exposure risk
- `/contact` - Spam prevention needed

**Mitigations:**
```javascript
// Rate limiting with Cloudflare KV
async function rateLimit(ip, limit = 10, window = 60000) {
  const key = `ratelimit:${ip}`;
  const now = Date.now();
  const requests = await env.KV.get(key, 'json') || [];
  
  const recent = requests.filter(t => now - t < window);
  if (recent.length >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  recent.push(now);
  await env.KV.put(key, JSON.stringify(recent), { expirationTtl: 300 });
  return { allowed: true, remaining: limit - recent.length };
}
```

**Action Items:**
- [ ] Implement rate limiting (10 req/min per IP)
- [ ] Add honeypot field to contact form
- [ ] Validate all inputs server-side
- [ ] Add CORS restrictions
- [ ] Use environment variables for API keys (already done ✅)

### SQL Injection Prevention
**Status:** ✅ Safe (using D1 prepared statements)

**Verify all queries use parameterization:**
```javascript
// ✅ Good
await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();

// ❌ Bad
await env.DB.exec(`SELECT * FROM users WHERE id = ${userId}`);
```

---

## 4. Secrets Management

### Current Secrets
1. **OpenAI API Key** - ✅ Environment variable
2. **Web3Forms Access Key** - ⚠️ Currently in frontend code
3. **Cloudflare API Token** - ✅ Wrangler config

**Action Items:**
- [ ] Move Web3Forms key to backend function
- [ ] Rotate OpenAI API key quarterly
- [ ] Use Cloudflare secrets for sensitive vars:
  ```bash
  wrangler secret put OPENAI_API_KEY
  wrangler secret put WEB3FORMS_KEY
  ```

---

## 5. Third-Party Dependencies Audit

### Current Dependencies (18 total)
```bash
# Generate full dependency tree
npm ls --all > dependencies-tree.txt

# Check for known vulnerabilities
npm audit --audit-level=moderate
```

**Critical Dependencies:**
1. **react@18.3.1** - ✅ Safe
2. **react-dom@18.3.1** - ✅ Safe
3. **react-router-dom@6.30.2** - ✅ Safe
4. **vite@7.2.6** - ⚠️ Check for updates

**Monitoring:**
- Set up GitHub Dependabot alerts
- Weekly manual `npm audit` runs
- Subscribe to security advisories:
  - React: https://github.com/facebook/react/security
  - Vite: https://github.com/vitejs/vite/security

---

## 6. OWASP Top 10 Coverage

| Vulnerability | Risk Level | Status | Notes |
|--------------|-----------|--------|-------|
| **A01: Broken Access Control** | Medium | ⚠️ | No auth on APIs |
| **A02: Cryptographic Failures** | Low | ✅ | HTTPS enforced |
| **A03: Injection** | Low | ✅ | React escapes, D1 prepared statements |
| **A04: Insecure Design** | Low | ✅ | No sensitive data stored |
| **A05: Security Misconfiguration** | Medium | ⚠️ | Missing CSP headers |
| **A06: Vulnerable Components** | Low | ✅ | 0 known vulnerabilities |
| **A07: Auth Failures** | N/A | N/A | No user authentication |
| **A08: Data Integrity** | Low | ✅ | No file uploads |
| **A09: Logging Failures** | Medium | ⚠️ | Limited logging |
| **A10: SSRF** | Low | ✅ | No server-side requests |

---

## 7. Automated Testing Tools

### Static Analysis
```bash
# ESLint security plugin
npm install --save-dev eslint-plugin-security
# Add to .eslintrc: "plugins": ["security"]

# TypeScript for type safety (optional upgrade)
npm install --save-dev typescript @types/react @types/react-dom
```

### Dynamic Testing
```bash
# OWASP ZAP (Zed Attack Proxy)
docker pull zaproxy/zap-stable
docker run -t zaproxy/zap-stable zap-baseline.py -t https://cyberguardng.ca

# Lighthouse Security Audit
npm install -g lighthouse
lighthouse https://cyberguardng.ca --view
```

### Penetration Testing Tools
1. **Burp Suite Community** (Manual testing)
2. **Nuclei** (Automated vulnerability scanner)
   ```bash
   go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest
   nuclei -u https://cyberguardng.ca
   ```

---

## 8. Incident Response Plan

### Detection
- Monitor Cloudflare Analytics for anomalies
- Set up alerts for:
  - Spike in 4xx/5xx errors
  - High bandwidth usage
  - Unusual traffic patterns

### Response Checklist
1. **Identify** - What was compromised?
2. **Contain** - Disable affected endpoints
3. **Eradicate** - Patch vulnerability
4. **Recover** - Redeploy from clean state
5. **Lessons Learned** - Update this plan

### Emergency Contacts
- Cloudflare Support: https://dash.cloudflare.com/support
- GitHub Security: security@github.com
- OpenAI Support: https://help.openai.com

---

## 9. Compliance & Best Practices

### GDPR Compliance
- ✅ Cookie consent banner
- ✅ Privacy policy link
- ⚠️ Need to implement data deletion API

### Accessibility (Security Related)
- Screen reader support prevents social engineering
- Keyboard navigation reduces phishing risk
- Test with:
  ```bash
  npm install -g pa11y
  pa11y https://cyberguardng.ca
  ```

---

## 10. Testing Schedule

### Daily (Automated)
- GitHub Dependabot scans
- Cloudflare DDoS protection active

### Weekly
- `npm audit` manual review
- Check Cloudflare Analytics logs
- Review chat logs for abuse

### Monthly
- Full dependency update (`npm outdated`)
- Run OWASP ZAP scan
- Review and rotate API keys if needed

### Quarterly
- Penetration testing (manual)
- Security policy review
- Incident response drill

---

## Immediate Action Items (Priority)

### High Priority (This Week)
1. [ ] Create `_headers` file with CSP
2. [ ] Implement rate limiting on chat/contact endpoints
3. [ ] Move Web3Forms key to backend
4. [ ] Add CAPTCHA to contact form

### Medium Priority (This Month)
5. [ ] Set up Snyk monitoring
6. [ ] Run OWASP ZAP baseline scan
7. [ ] Implement request logging
8. [ ] Add input validation to all forms

### Low Priority (This Quarter)
9. [ ] Migrate to TypeScript for type safety
10. [ ] Set up automated penetration testing
11. [ ] Create security.txt file
12. [ ] Implement subresource integrity (SRI) for CDN assets

---

## Resources

### Security Advisories
- React: https://github.com/facebook/react/security/advisories
- npm: https://github.com/advisories
- Cloudflare: https://www.cloudflare.com/trust-hub/

### Testing Tools
- OWASP ZAP: https://www.zaproxy.org/
- Snyk: https://snyk.io/
- npm audit: Built-in
- Lighthouse: https://developers.google.com/web/tools/lighthouse

### Documentation
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- React Security: https://react.dev/learn/writing-markup-with-jsx#xss
- Cloudflare Security: https://developers.cloudflare.com/pages/platform/security/

---

**Next Review Date:** January 8, 2026
**Document Owner:** Security Team
**Last Tested:** December 8, 2025
