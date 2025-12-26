# AuthForge Demo Script - Silent Screen Recording

## 🎥 Best Tool for Silent Screen Recording: Windows Built-in!

**You DON'T need Loom!** Use Windows built-in tools:

### Option 1: Xbox Game Bar (Easiest - Already Installed!)
1. Press `Win + G` to open Game Bar
2. Click the **Record** button (or press `Win + Alt + R`)
3. Record your screen
4. Stop with `Win + Alt + R`
5. Video saved to `Videos\Captures` folder

### Option 2: PowerPoint Screen Recording
1. Open PowerPoint → Insert → Screen Recording
2. Select area → Record
3. Export as MP4

### Option 3: Free Tools
- **ShareX** - Free, adds text overlays: https://getsharex.com
- **OBS Studio** - Free, professional: https://obsproject.com
- **ScreenToGif** - For GIFs: https://www.screentogif.com

---

## 📝 TEXT OVERLAYS TO ADD (Post-Recording)

Use **Clipchamp** (free, built into Windows 11) or **CapCut** (free) to add text:

### Scene 1: Landing Page
```
TEXT: "AuthForge - Self-hosted Auth0 Alternative"
TEXT: "Passkeys | OAuth | Magic Links | 2FA | Encrypted Vault"
```

### Scene 2: Registration
```
TEXT: "Creating a new account..."
TEXT: "Password hashed with PBKDF2 (100k iterations)"
```

### Scene 3: Passkeys (Star Feature!)
```
TEXT: "Adding a Passkey - Passwordless Login"
TEXT: "Uses WebAuthn - same as Google, Apple, Microsoft"
TEXT: "Login with fingerprint, Face ID, or security key"
```

### Scene 4: 2FA Setup
```
TEXT: "Enabling Two-Factor Authentication"
TEXT: "Works with any TOTP app (Google Authenticator, etc.)"
```

### Scene 5: Vault
```
TEXT: "Encrypted Vault - Zero Knowledge"
TEXT: "All data encrypted client-side with AES-256"
```

### Scene 6: Closing
```
TEXT: "Built with: Cloudflare Workers + Hono.js + D1 + React"
TEXT: "github.com/osayande-infosec/authforge"
```

---

## 🎬 RECORDING STEPS

### Before Recording:
- [ ] Backend running: http://127.0.0.1:8787
- [ ] Frontend running: http://localhost:3002
- [ ] Browser zoomed in (Ctrl + +) for visibility
- [ ] Dark mode enabled
- [ ] Clear any personal data from browser

### Recording Sequence:

**1. LANDING PAGE (5 sec)**
- Show the AuthForge landing page
- Slowly scroll down to show features

**2. REGISTER (10 sec)**
- Click "Sign Up" / "Get Started"
- Type: demo@example.com
- Type: SecurePass123!
- Click Register
- Show success/dashboard

**3. PASSKEYS (15 sec)**
- Navigate to Settings → Security → Passkeys
- Click "Add Passkey"
- Complete Windows Hello (fingerprint/PIN)
- Show passkey added
- Log out
- Click "Sign in with Passkey"
- Complete biometric
- Show logged in

**4. 2FA SETUP (10 sec)**
- Go to Settings → Security → 2FA
- Click "Enable"
- Show QR code
- (Don't need to actually scan)

**5. VAULT (10 sec)**
- Go to Vault section
- Click "Add Item"
- Fill in example data
- Save
- Show encrypted item in list

**6. API/CODE (5 sec)**
- Show http://127.0.0.1:8787/docs briefly
- Or show VS Code with the code

**Total: ~55 seconds**

---

## 📱 LINKEDIN POST (No Video Link Version)

```
🔐 I built AuthForge - a self-hosted Auth0 alternative.

Features:
✅ Passkeys (WebAuthn) - Passwordless biometric login
✅ OAuth 2.0 - Google & GitHub
✅ Magic Links - Email authentication
✅ TOTP 2FA - With backup codes
✅ Encrypted Vault - Zero-knowledge storage

Why?
→ Auth0 costs $23,000+/year for enterprise
→ AuthForge runs FREE on Cloudflare Workers

Tech Stack:
• Cloudflare Workers (edge)
• Hono.js
• D1 (SQLite)
• React + Tailwind

Full source code: github.com/osayande-infosec/authforge

#cybersecurity #authentication #cloudflare #passkeys #opensource
```

---

## 🎬 LINKEDIN POST (With Video)

```
🔐 Built an Auth0 alternative that runs on Cloudflare's edge.

Watch the 1-minute demo 👇

AuthForge features:
✅ Passkeys - Login with fingerprint
✅ OAuth - Google & GitHub
✅ Magic Links
✅ 2FA with backup codes
✅ Encrypted Vault

Runs FREE on Cloudflare Workers.
Full source: github.com/osayande-infosec/authforge

#cybersecurity #cloudflare #webauthn #opensource
```

---

## 📤 HOW TO POST VIDEO ON LINKEDIN

1. Record screen with Xbox Game Bar (`Win + G`)
2. Edit in Clipchamp (add text overlays)
3. Export as MP4
4. Go to LinkedIn → Create Post
5. Click video icon → Upload MP4
6. Add your post text
7. Post!

---

## 🔗 URLS FOR DEMO

- Frontend UI: http://localhost:3002
- Backend API: http://127.0.0.1:8787
- API Docs: http://127.0.0.1:8787/docs
- GitHub: https://github.com/osayande-infosec/authforge
