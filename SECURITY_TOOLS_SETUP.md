# Security Testing Tools - Setup Guide

## Currently Installed ✅

1. **npm audit** (Built-in)
   - ✅ Already working
   - 0 vulnerabilities found
   - Run: `npm audit`

2. **Lighthouse** (Just installed)
   - ✅ Installed globally
   - Run: `lighthouse https://cyberguardng.ca --view`
   - Or use: `.\lighthouse-audit.ps1`

3. **Snyk** (Just installed)
   - ⚠️ Needs authentication
   - Run: `snyk auth` (opens browser to login)
   - Free for open source projects

4. **OWASP ZAP**
   - ❌ Not installed (requires Docker or manual install)
   - Optional: Most thorough penetration testing

---

## Quick Start Commands

### Daily/After Deployments
```powershell
# Quick audit with Lighthouse
.\lighthouse-audit.ps1

# Or manual
lighthouse https://cyberguardng.ca --view
```

### Weekly Security Scan
```powershell
# Automated scan
.\security-scan.ps1

# Or manual steps
cd react-site
npm audit
npm outdated
snyk test  # After running: snyk auth
```

### Monthly Deep Scan
```powershell
# 1. Update dependencies
cd react-site
npm outdated
npm update

# 2. Run all security tools
npm audit
snyk test
lighthouse https://cyberguardng.ca --view

# 3. Check GitHub Dependabot alerts
# Visit: https://github.com/osayande-infosec/cyberguardng/security
```

---

## Setup Instructions

### 1. Authenticate Snyk (One-time)
```powershell
snyk auth
```
This opens your browser to login with GitHub/Google. Free for open source.

After authentication:
```powershell
cd react-site
snyk test              # Scan for vulnerabilities
snyk monitor           # Enable continuous monitoring
```

### 2. Enable GitHub Dependabot (Recommended)
Already enabled on your repo! Checks:
- Security vulnerabilities in dependencies
- Auto-creates PRs to update vulnerable packages
- Monitor at: https://github.com/osayande-infosec/cyberguardng/security/dependabot

### 3. Optional: Install OWASP ZAP
**Option A: Docker (Recommended)**
```powershell
# Pull image
docker pull zaproxy/zap-stable

# Run baseline scan
docker run -t zaproxy/zap-stable zap-baseline.py -t https://cyberguardng.ca
```

**Option B: Desktop App**
- Download from: https://www.zaproxy.org/download/
- Install and run manual scans
- Most thorough but requires setup

---

## Current Security Status

| Tool | Status | Last Run | Issues Found |
|------|--------|----------|--------------|
| npm audit | ✅ Active | Just now | 0 vulnerabilities |
| Lighthouse | ✅ Installed | Not run yet | - |
| Snyk | ⚠️ Not authenticated | - | - |
| OWASP ZAP | ❌ Not installed | - | - |
| GitHub Dependabot | ✅ Active | Auto | 0 alerts |

---

## Recommended Schedule

- **After each deployment**: Run Lighthouse
- **Weekly (Mondays)**: Run `security-scan.ps1`
- **Monthly**: Deep scan + dependency updates
- **Quarterly**: Full penetration test with OWASP ZAP

---

## What Each Tool Does

### npm audit
- Scans package.json and package-lock.json
- Checks against npm advisory database
- Finds known vulnerabilities in dependencies
- **Pros**: Built-in, fast, free
- **Cons**: Only checks npm packages

### Lighthouse
- Tests performance, accessibility, best practices, SEO
- Checks security headers (CSP, HSTS, etc.)
- Validates HTTPS configuration
- **Pros**: Comprehensive, easy to run, visual reports
- **Cons**: Doesn't find code vulnerabilities

### Snyk
- Deep dependency scanning (including transitive)
- Checks code for security issues
- Continuous monitoring with alerts
- License compliance checking
- **Pros**: Most thorough, free for open source
- **Cons**: Requires authentication

### OWASP ZAP
- Full penetration testing suite
- Active scanning (tests for exploits)
- Spider crawls entire site
- Tests for OWASP Top 10 vulnerabilities
- **Pros**: Most complete security testing
- **Cons**: Complex setup, can be slow

### GitHub Dependabot
- Automatic vulnerability scanning
- Auto-creates PRs for security updates
- Monitors 24/7
- **Pros**: Fully automated, integrated with GitHub
- **Cons**: Only checks dependencies

---

## Next Steps

1. ✅ **Done**: Installed Lighthouse and Snyk
2. **TODO**: Run `snyk auth` to authenticate
3. **TODO**: Run `.\lighthouse-audit.ps1` to test your site
4. **TODO**: Set calendar reminder for weekly scans
5. **Optional**: Install OWASP ZAP for quarterly deep scans

---

## Troubleshooting

**Snyk says "Use snyk auth"**
```powershell
snyk auth
# Follow browser prompts to login
```

**Lighthouse fails with EPERM error**
```powershell
# Try with simpler output
lighthouse https://cyberguardng.ca --view

# Or check specific category
lighthouse https://cyberguardng.ca --only-categories=best-practices --view
```

**npm audit shows vulnerabilities**
```powershell
# Try auto-fix
npm audit fix

# For breaking changes
npm audit fix --force

# Manual review
npm audit --json > audit-results.json
```

---

## Additional Resources

- **SECURITY_TESTING_PLAN.md**: Full security strategy
- **npm audit**: https://docs.npmjs.com/cli/v8/commands/npm-audit
- **Snyk**: https://docs.snyk.io/
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
- **OWASP ZAP**: https://www.zaproxy.org/docs/

---

**Created**: December 8, 2025  
**Last Updated**: December 8, 2025  
**Maintained by**: CyberGuardNG Security Team
