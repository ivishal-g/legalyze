# 🚀 Legalyze AI

**AI Agent for Legal Document Red-Flagging**  
_Built by Team Codelites_

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **Transform hours of legal review into seconds.** Upload any contract → AI spots risks + missing protections → Get a clear report + smart fixes instantly.

---

## 📋 Overview

**Legalyze AI** is an intelligent contract analysis agent that accepts PDF or DOCX legal documents and instantly identifies risks, missing protections, and one-sided clauses. It returns a structured risk report with color-coded warnings, an interactive Q&A interface, and a one-click redline export.

### The Problem

Reviewing contracts is slow, expensive, and error-prone. Non-lawyers often sign agreements without understanding dangerous clauses (e.g., unlimited liability, missing termination rights, no GDPR language). Even legal professionals spend hours on routine document review.

### Our Solution

Legalyze AI provides:
- ⚡ **Instant Analysis** — Contract risk assessment in < 10 seconds
- 🎯 **Risk Identification** — Automatically flags high-risk clauses and missing protections
- 💬 **Interactive Q&A** — Natural language chat about your specific contract
- 📄 **One-Click Export** — Download redlined .docx with tracked changes and suggestions
- 🎨 **Visual Risk Dashboard** — Color-coded heatmap showing document risk levels

---

## ✨ Key Features

### 🔍 AI Risk Analysis Engine
- **Automatic contract type detection** (NDA, SaaS, Freelance, Employment, etc.)
- **Risk scanning** for unlimited liability, one-sided indemnification, IP ownership grabs, non-compete overreach
- **Missing clause detection** (termination rights, dispute resolution, GDPR, auto-renewal warnings)
- **Smart suggestions** with AI-powered fixes for problematic clauses
- **Structured JSON output** with 0-100 risk scoring

### 📊 Interactive Risk Dashboard
- **Overall Risk Score** — Large visual display with color-coded ring (🟢 Green / 🟡 Yellow / 🔴 Red)
- **Top 5 Critical Risks** — Prioritized flag list with severity badges
- **Section Heatmap** — Contract sections with color-coded risk levels
- **Missing Clauses Panel** — Checklist of expected protections not found
- **Expandable Flag Details** — Click any flag to see description + AI-suggested fix

### 💬 Contract Q&A Chat
Ask questions about your contract in plain English:
- "Is the liability cap mutual?"
- "How long is the notice period for termination?"
- "Suggest better wording for the IP ownership clause"
- "What happens if I miss a deadline?"

Streaming responses with document context maintained throughout the conversation.

### 📤 One-Click Redline Export
- Generate downloadable `.docx` file with tracked changes
- Original risky clauses shown as strikethrough deletions
- AI-suggested replacements shown as insertions
- Comments explaining why each change was made
- Ready to open in Microsoft Word or Google Docs

### 🎯 Bonus Features
- **Personal Playbook** — Upload your preferred contract templates; AI learns your standards
- **Gap Check by Contract Type** — Auto-checks against predefined checklists per contract type
- **Contract Comparison** — Side-by-side diff view showing risk deltas between versions
- **Easy Sharing** — Generate shareable links to risk reports

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) + TypeScript |
| **UI Components** | shadcn/ui + Tailwind CSS |
| **Authentication** | Clerk |
| **File Parsing** | `pdf-parse` (PDF), `mammoth` (DOCX) |
| **AI / LLM** | Vercel AI SDK + `@ai-sdk/google` → Google Gemini 2.0 Flash |
| **Database** | Prisma ORM + Neon Postgres |
| **Dashboard Charts** | Recharts |
| **Redline Export** | `docx` + `file-saver` |
| **Security** | Arcjet (rate limiting, bot protection) |
| **Email** | Resend |
| **Deployment** | Vercel |
| **Monorepo** | Turborepo (Next Forge) |

---

## 🏗️ Architecture

```
User Browser
    │
    ▼
Next.js Frontend (shadcn/ui + Tailwind)
    │
    ├── /upload         → File upload page
    ├── /dashboard/[id] → Risk dashboard + heatmap
    ├── /chat/[id]      → Contract Q&A panel
    └── /export/[id]    → Redline download
    │
    ▼
Next.js API Routes
    │
    ├── POST /api/analyze
    │       ├── Parse file (pdf-parse / mammoth)
    │       ├── Send text to Gemini via Vercel AI SDK
    │       ├── Receive structured JSON risk report
    │       └── Save to Neon Postgres via Prisma
    │
    ├── POST /api/chat
    │       ├── Accept user question + document context
    │       └── Stream Gemini response back to client
    │
    └── POST /api/export
            ├── Generate .docx with tracked changes
            └── Return file download
    │
    ▼
Neon Postgres (via Prisma)
    ├── users (Clerk user IDs)
    ├── contracts (file metadata, parsed text)
    ├── reports (JSON risk report per contract)
    └── playbooks (user's personal contract templates)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 10+ (package manager)
- **PostgreSQL database** (we recommend [Neon](https://neon.tech/))
- **Google AI API key** (for Gemini)
- **Clerk account** (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/codelites/legalyze-ai.git
   cd legalyze-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/legalyze?sslmode=require"
   
   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
   
   # AI (Google Gemini)
   GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key"
   
   # Security (Arcjet)
   ARCJET_KEY="ajkey_..."
   
   # Email (Resend)
   RESEND_TOKEN="re_..."
   RESEND_FROM="noreply@yourdomain.com"
   
   # App URLs
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_WEB_URL="http://localhost:3001"
   NEXT_PUBLIC_API_URL="http://localhost:3002"
   ```

4. **Set up the database**
   ```bash
   cd packages/database
   pnpm run migrate
   ```

5. **Start the development servers**
   ```bash
   pnpm dev
   ```

   This will start:
   - **App** at `http://localhost:3000` (main application)
   - **Web** at `http://localhost:3001` (marketing site)
   - **API** at `http://localhost:3002` (API routes)
   - **Storybook** at `http://localhost:6006` (design system)

---

## 📖 Usage

### Basic Workflow

1. **Upload a Contract**
   - Navigate to the upload page
   - Drag & drop or select a PDF/DOCX contract file (up to 10MB)
   
2. **View Risk Analysis**
   - AI analyzes the document in < 10 seconds
   - Risk dashboard displays with overall risk score (0-100)
   - Browse top 5 critical risks and section heatmap
   - Click any flag to see detailed explanation and AI suggestion

3. **Ask Questions**
   - Open the chat panel
   - Ask natural language questions about your contract
   - Get context-aware answers based on the actual document

4. **Export Redline**
   - Click "Export Redline" button
   - Download .docx file with tracked changes
   - Open in Word/Google Docs and review suggested improvements

### Example Contracts Analyzed

- ✅ Freelance Service Agreements
- ✅ Non-Disclosure Agreements (NDAs)
- ✅ SaaS Terms of Service
- ✅ Employment Contracts
- ✅ Vendor Agreements
- ✅ Partnership Agreements

---

## 🎯 Target Users

| User Type | Use Case |
|-----------|----------|
| **Freelancers / Contractors** | Review client contracts before signing |
| **Startup Founders** | Analyze SaaS agreements, NDAs, and vendor contracts |
| **In-House Legal Teams** | Speed up first-pass review of incoming contracts |
| **Small Business Owners** | Understand vendor, service, and employment contracts |

---

## 📊 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Contract analysis time | < 10 seconds | ✅ |
| Risk categories identified | ≥ 5 per contract | ✅ |
| Response time (chat) | < 5 seconds | ✅ |
| Supported file formats | PDF + DOCX | ✅ |
| Maximum file size | 10MB | ✅ |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Biome for code formatting
- Write tests for new features
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🏆 Team Codelites

Built for hackathon with ❤️ by Team Codelites

**"This is what lawyers would actually use."** 🚀

---

## 📞 Support

- 📧 Email: support@legalyze.ai
- 💬 [GitHub Discussions](https://github.com/codelites/legalyze-ai/discussions)
- 🐛 [Report Issues](https://github.com/codelites/legalyze-ai/issues)

---

## 🗺️ Roadmap

- [ ] Multi-language contract support
- [ ] Mobile native app (iOS/Android)
- [ ] Real-time collaboration features
- [ ] Fine-tuned legal NLP models
- [ ] API for third-party integrations
- [ ] Bulk contract processing
- [ ] Advanced analytics dashboard

---

**⚡ Transform your contract review workflow today with Legalyze AI!**
