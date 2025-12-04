# CyberGuardNG Security Inc.

Modern cybersecurity and continuous compliance solutions for growing businesses.

## 🚀 Live Site

Visit [cyberguardng.ca](https://cyberguardng.ca) (or your Cloudflare Pages URL)

## 📋 Overview

CyberGuardNG delivers AI-supported cybersecurity and continuous compliance for modern businesses. We help organizations stay secure and audit-ready across AWS, Azure, and Google Cloud.

### Key Services
- **Managed Security Operations** - 24/7 monitoring and threat detection
- **Continuous Compliance** - SOC 2, ISO 27001, HIPAA, PCI DSS
- **Cloud Security** - AWS, Azure, and GCP protection
- **AI-Supported Detection** - Advanced threat awareness training

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite 7.2.6
- **Routing**: React Router v6
- **Styling**: Custom CSS with modern design system
- **Deployment**: Cloudflare Pages
- **Functions**: Cloudflare Pages Functions (ES modules)
- **AI Integration**: OpenAI GPT-4o-mini for chatbot

## 📁 Project Structure

```
cyberguardng/
├── react-site/                # Main React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Header.jsx    # Navigation header
│   │   │   ├── Footer.jsx    # Site footer
│   │   │   ├── BlogCard.jsx  # Blog post cards
│   │   │   ├── ChatLauncher.jsx  # AI chatbot widget
│   │   │   └── CookieBanner.jsx  # Cookie consent
│   │   ├── pages/            # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Resources.jsx
│   │   │   ├── CaseStudies.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── BlogArticle.jsx
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── styles.css        # Global styles
│   ├── public/
│   │   ├── assets/           # Images and static files
│   │   ├── _redirects        # SPA routing config
│   │   ├── _routes.json      # Cloudflare routing
│   │   ├── sitemap.xml       # SEO sitemap
│   │   └── robots.txt        # Search engine config
│   ├── functions/            # Cloudflare Pages Functions
│   │   ├── chat.js           # OpenAI chat proxy
│   │   └── consent-log.js    # Cookie consent logging
│   ├── package.json
│   └── vite.config.mjs
├── static-site/              # Legacy static HTML (reference)
└── CLOUDFLARE-DEPLOYMENT.md  # Deployment guide
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/osayande-infosec/cyberguardng.git
cd cyberguardng
```

2. Install dependencies:
```bash
cd react-site
npm install
```

3. Create environment variables:
```bash
# Create a .env file in react-site directory
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

4. Start development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to view the site.

## 🔨 Build

```bash
cd react-site
npm run build
```

Built files will be in the `dist/` directory.

## 🌐 Deployment

This project is configured for **Cloudflare Pages**. See [CLOUDFLARE-DEPLOYMENT.md](./CLOUDFLARE-DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Steps:

1. Push code to GitHub
2. Connect repository to Cloudflare Pages
3. Configure build settings:
   - **Build command**: `npm ci && npm run build`
   - **Build output**: `dist`
   - **Root directory**: `react-site`
4. Add environment variable: `OPENAI_API_KEY`
5. Deploy!

## ✨ Features

### SEO Optimized
- Comprehensive meta tags
- Open Graph and Twitter Cards
- JSON-LD structured data
- XML sitemap
- Optimized robots.txt

### Mobile Responsive
- Touch-friendly navigation (44px minimum targets)
- Auto-closing mobile menu
- Optimized layouts for all screen sizes
- Responsive typography and spacing

### Performance
- Vite build optimization
- Code splitting with React Router
- Cloudflare CDN global distribution
- Edge functions for low latency

### AI Chatbot
- OpenAI GPT-4o-mini integration
- Context-aware security assistance
- Real-time chat interface
- Privacy-focused design

## 🔐 Security Features

- HTTPS everywhere (Cloudflare SSL)
- Content Security Policy headers
- Cookie consent management
- Secure API proxy functions
- DDoS protection via Cloudflare

## 📊 Analytics & Monitoring

- Cloudflare Analytics built-in
- Function logs for debugging
- Build history tracking
- Real-time performance metrics

## 🤝 Contributing

This is a private business website. For internal contributions:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

Copyright © 2025 CyberGuardNG Security Inc. All rights reserved.

## 📧 Contact

- **Website**: [cyberguardng.ca](https://cyberguardng.ca)
- **Email**: info@cyberguardng.ca
- **GitHub**: [@osayande-infosec](https://github.com/osayande-infosec)

## 🔄 Version History

- **v1.0** (Dec 2025) - Initial Cloudflare Pages deployment
  - React + Vite migration
  - Mobile optimization
  - SEO enhancements
  - AI chatbot integration

---

**Built with ❤️ by CyberGuardNG Security Inc.**
