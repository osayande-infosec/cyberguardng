# SAML 2.0 Implementation Plan for CyberGuardNG

## Portfolio Project: Enterprise SSO Integration

### Project Overview

Implement SAML 2.0 Single Sign-On (SSO) for CyberGuardNG's client portal, demonstrating enterprise-grade authentication for a cybersecurity consulting platform.

### Why This is a Strong Portfolio Project

1. **Enterprise Relevance**: 90%+ of enterprise applications require SSO
2. **Compliance Alignment**: SOC 2, ISO 27001, HIPAA require strong authentication
3. **Practical Skills**: Real-world implementation, not theoretical
4. **Industry Demand**: SAML/SSO expertise is highly sought after
5. **Security Focus**: Directly relevant to cybersecurity career

---

## Architecture

```
┌─────────────────┐    SAML Request    ┌─────────────────┐
│                 │ ────────────────►  │                 │
│  CyberGuardNG   │                    │   Identity      │
│  (Service       │                    │   Provider      │
│   Provider)     │ ◄────────────────  │   (IdP)         │
│                 │   SAML Response    │                 │
└─────────────────┘                    └─────────────────┘
        │                                      │
        │                                      │
        ▼                                      ▼
  React Frontend                         Okta/Azure AD/
  + Cloudflare                           OneLogin
```

---

## Implementation Phases

### Phase 1: Setup & Configuration (Week 1)

#### 1.1 Choose Identity Provider (IdP)
- **Recommended**: Okta Developer (Free tier)
- **Alternatives**: 
  - Azure AD B2C (Free tier available)
  - Auth0 (Free tier)
  - OneLogin (Developer sandbox)

#### 1.2 Create SAML Application in IdP

```yaml
# Okta SAML Configuration
Application Name: CyberGuardNG Client Portal
SSO URL: https://cyberguardng.ca/api/auth/saml/callback
Audience URI: https://cyberguardng.ca
Name ID Format: EmailAddress
Attribute Statements:
  - email: user.email
  - firstName: user.firstName
  - lastName: user.lastName
  - role: user.role
```

### Phase 2: Backend Implementation (Week 2)

#### 2.1 Create SAML Handler (Cloudflare Pages Function)

```javascript
// functions/auth/saml/callback.js
import { createSAMLResponse } from '../lib/saml';

export async function onRequestPost(context) {
  const { SAMLResponse } = await context.request.formData();
  
  // Validate SAML Response
  const decoded = Buffer.from(SAMLResponse, 'base64').toString();
  const user = await validateSAMLAssertion(decoded, context.env);
  
  if (!user) {
    return Response.redirect('/login?error=saml_invalid');
  }
  
  // Create session
  const session = await createSession(user, context.env);
  
  // Set secure cookie and redirect
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/portal',
      'Set-Cookie': `session=${session}; HttpOnly; Secure; SameSite=Strict; Path=/`
    }
  });
}
```

#### 2.2 SAML Metadata Endpoint

```javascript
// functions/auth/saml/metadata.js
export async function onRequestGet(context) {
  const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="https://cyberguardng.ca">
  <md:SPSSODescriptor AuthnRequestsSigned="true"
                      WantAssertionsSigned="true"
                      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="https://cyberguardng.ca/api/auth/saml/callback"
      index="0"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;

  return new Response(metadata, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
```

### Phase 3: Frontend Integration (Week 3)

#### 3.1 Create Protected Portal Route

```jsx
// src/pages/Portal.jsx
import { useEffect, useState } from 'react';

export default function Portal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          // Redirect to SAML login
          window.location.href = '/api/auth/saml/login';
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="portal">
      <h1>Welcome, {user.firstName}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      {/* Portal content */}
    </div>
  );
}
```

#### 3.2 SSO Login Button Component

```jsx
// src/components/SSOLoginButton.jsx
export default function SSOLoginButton() {
  return (
    <a href="/api/auth/saml/login" className="btn btn-sso">
      <svg className="icon-lock" viewBox="0 0 24 24">
        <path d="M12 17a2 2 0 002-2 2 2 0 00-2-2 2 2 0 00-2 2 2 2 0 002 2m6-9a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1V6a5 5 0 0110 0v2h1m-6-5a3 3 0 00-3 3v2h6V6a3 3 0 00-3-3z"/>
      </svg>
      Sign in with SSO
    </a>
  );
}
```

### Phase 4: Security Hardening (Week 4)

#### 4.1 SAML Security Checklist

- [ ] Validate SAML Response signature
- [ ] Verify Issuer matches expected IdP
- [ ] Check NotBefore and NotOnOrAfter timestamps
- [ ] Validate Audience restriction
- [ ] Implement replay protection (InResponseTo)
- [ ] Use HTTPS-only
- [ ] Sign authentication requests
- [ ] Encrypt assertions (optional but recommended)

#### 4.2 Session Security

```javascript
// Session configuration
const SESSION_CONFIG = {
  maxAge: 8 * 60 * 60,        // 8 hours
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
  domain: '.cyberguardng.ca'
};
```

---

## Environment Variables

```bash
# .env (Cloudflare Pages)
SAML_IDP_METADATA_URL=https://your-idp.okta.com/app/xxxx/sso/saml/metadata
SAML_IDP_SSO_URL=https://your-idp.okta.com/app/xxxx/sso/saml
SAML_IDP_ISSUER=http://www.okta.com/xxxx
SAML_IDP_CERT=-----BEGIN CERTIFICATE-----...
SAML_SP_ENTITY_ID=https://cyberguardng.ca
SAML_SP_ACS_URL=https://cyberguardng.ca/api/auth/saml/callback
SESSION_SECRET=your-secure-random-secret
```

---

## Testing Plan

### Manual Tests
1. SP-initiated login flow
2. IdP-initiated login flow
3. Session timeout handling
4. Invalid SAML response handling
5. Replay attack prevention

### Automated Tests
```javascript
// tests/saml.test.js
describe('SAML Authentication', () => {
  test('validates SAML response signature', async () => {
    // Test implementation
  });
  
  test('rejects expired assertions', async () => {
    // Test implementation
  });
  
  test('prevents replay attacks', async () => {
    // Test implementation
  });
});
```

---

## Portfolio Documentation

### README Section

```markdown
## 🔐 Enterprise SSO (SAML 2.0)

CyberGuardNG implements SAML 2.0 Single Sign-On for the client portal:

- **Standards Compliant**: SAML 2.0 / OASIS
- **Security**: Signed assertions, encrypted responses
- **IdP Support**: Okta, Azure AD, OneLogin, PingFederate
- **Compliance**: Supports SOC 2, ISO 27001 SSO requirements
```

### LinkedIn Project Description

```
🔒 CyberGuardNG - Enterprise Cybersecurity Platform with SAML 2.0 SSO

Implemented enterprise-grade Single Sign-On using SAML 2.0:
• Built Service Provider (SP) on Cloudflare Pages
• Integrated with Okta as Identity Provider
• Implemented security controls: signed assertions, replay protection
• Achieved compliance with SOC 2 authentication requirements

Tech: React, Cloudflare Workers, SAML 2.0, Okta

LinkedIn: https://www.linkedin.com/in/osayande-agbonkpolor
```

---

## Recommended Libraries

### For Production
- `@node-saml/node-saml` - Full SAML implementation
- `passport-saml` - If using Express/Node backend

### For Cloudflare Workers (Edge)
- Custom implementation (lightweight)
- `xml2js` for XML parsing
- `crypto` for signature verification

---

## Timeline (8-12 Hours Total)

| Hours | Task | Deliverable |
|-------|------|-------------|
| 1-2 | IdP Setup (Okta/Azure AD) | Working IdP app configured |
| 2-3 | Backend SAML Handler | Auth endpoints on Cloudflare |
| 2-3 | Frontend Portal | Protected React pages |
| 1-2 | Security Hardening | Signature validation, replay protection |
| 1-2 | Documentation & Demo | README, screenshots, live demo |

**Total: 8-12 hours** (1-2 focused days)

---

## Resources

- [SAML 2.0 Technical Overview](https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html)
- [Okta Developer Documentation](https://developer.okta.com/docs/concepts/saml/)
- [OWASP SAML Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html)
