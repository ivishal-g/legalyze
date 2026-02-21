# 📋 Product Requirements Document (PRD)
## Legalyze AI — AI Agent for Legal Document Red-Flagging
**Team:** Codelites  
**Version:** 1.0  
**Type:** Hackathon Project  
**Status:** In Planning  

---

## 1. Executive Summary

Legalyze AI is an intelligent contract analysis agent that accepts PDF or DOCX legal documents and instantly identifies risks, missing protections, and one-sided clauses. It returns a structured risk report with color-coded warnings, an interactive Q&A interface, and a one-click redline export — transforming hours of legal review into seconds.

**Core Value Proposition:**  
Upload any contract → AI spots risks + missing protections → Get a clear report + smart fixes in seconds.

---

## 2. Problem Statement

Reviewing contracts is slow, expensive, and error-prone. Non-lawyers often sign agreements without understanding dangerous clauses (e.g., unlimited liability, missing termination rights, no GDPR language). Even legal professionals spend hours on routine document review. There is no fast, affordable, and visually intuitive tool that gives everyday users and small teams the confidence to understand what they're signing.

---

## 3. Goals & Success Metrics

### Hackathon Goals
- Build a working end-to-end prototype within the hackathon timeframe
- Demo a full flow: upload → scan → dashboard → chat → export
- Impress judges with visual polish, interactivity, and practical utility

### Success Metrics
| Metric | Target |
|--------|--------|
| Contract analysis time | < 10 seconds |
| Risk categories identified | ≥ 5 per contract |
| Risk score accuracy (demo) | Clearly explainable to judges |
| Demo wow factor | Chat + Heatmap + Redline export visible in 3 min |

---

## 4. Target Users

| User Type | Description | Primary Need |
|-----------|-------------|--------------|
| Freelancers / Contractors | Sign client contracts regularly | Spot unfair clauses fast |
| Startup Founders | Review SaaS agreements, NDAs | Understand risk before signing |
| In-House Legal Teams | Review incoming contracts at volume | Speed up first-pass review |
| Small Business Owners | Vendor, service, employment contracts | Avoid costly legal mistakes |

---

## 5. Core Features (MVP)

### 5.1 Document Upload & Parsing
- Accept PDF and DOCX files via drag-and-drop or file picker
- Parse text using `pdf-parse` (PDF) and `mammoth.js` (DOCX)
- Display confirmation of successful upload + file metadata (name, pages, word count)

**Acceptance Criteria:**
- Supports files up to 10MB
- Parsed text passed cleanly to AI pipeline
- Error state shown for unsupported formats or corrupt files

---

### 5.2 AI Risk Analysis Engine
The core agent that analyzes the parsed contract text and returns a structured JSON risk report.

**Agent Behavior:**
- Identify contract type (NDA, SaaS, Freelance, Employment, etc.) automatically
- Scan for risky clauses: unlimited liability, one-sided indemnification, IP ownership grabs, non-compete overreach
- Flag missing protections: no termination rights, no dispute resolution, no GDPR/data protection clause, no auto-renewal warning
- Highlight unusual / one-sided language compared to standard contracts of that type
- Return structured JSON:

```json
{
  "contract_type": "Freelance Agreement",
  "risk_score": 72,
  "summary": "This contract has several high-risk clauses...",
  "flags": [
    {
      "id": "flag_001",
      "section": "Liability",
      "severity": "high",
      "title": "Unlimited Liability Exposure",
      "description": "You are liable for all damages with no cap.",
      "suggestion": "Add: 'Liability shall be limited to fees paid in the last 3 months.'"
    }
  ],
  "missing_clauses": ["GDPR / Data Protection", "Auto-renewal warning"],
  "top_5_risks": ["flag_001", "flag_003", ...]
}
```

**AI Model:** Google Gemini 1.5/2.0 Flash via Vercel AI SDK + `@ai-sdk/google`

**Acceptance Criteria:**
- Returns analysis in < 10 seconds for contracts under 5,000 words
- At minimum 5 flags identified on a typical risky freelance contract
- JSON output is valid and parseable by the frontend dashboard

---

### 5.3 Risk Dashboard (Heatmap Style)
The primary output screen judges and users will see.

**UI Components:**
- **Overall Risk Score** — Large numeric display (0–100) with color ring (green/yellow/red)
- **Risk Summary Card** — 2–3 sentence plain-English summary of the contract
- **Top 5 Critical Risks** — Prioritized flag list shown immediately, each with severity badge
- **Section Heatmap** — Contract sections listed with color-coded risk level (Red / Yellow / Green)
- **Missing Clauses Panel** — Checklist of expected clauses not found
- **Flag Detail Drawer** — Click any flag to expand: description + AI-suggested fix

**Color Coding:**
- 🔴 Red — High risk / critical issue
- 🟡 Yellow — Medium risk / worth reviewing
- 🟢 Green — Looks fine / standard language

**Acceptance Criteria:**
- Dashboard renders correctly on desktop and mobile
- All flags are clickable and show full detail
- Risk score is visually prominent and immediately comprehensible

---

### 5.4 Chat Q&A on the Contract
A side panel chat interface where the user can ask natural language questions about the specific contract they uploaded.

**Example Interactions:**
- "Is the liability cap mutual?"
- "How long is the notice period for termination?"
- "Suggest better wording for the IP ownership clause"
- "What happens if I miss a deadline?"

**Implementation:**
- Maintains document context in the system prompt for each query
- Streaming responses via Vercel AI SDK
- Suggested starter questions shown as quick-tap chips

**Acceptance Criteria:**
- Answers are contextually accurate to the uploaded document
- Response time < 5 seconds per query
- At least 3 suggested starter questions shown

---

### 5.5 One-Click Redline Export
Generate and download a `.docx` file with tracked changes and suggested safer language.

**Output Format:**
- Original risky clause shown as a strikethrough deletion (tracked change)
- AI-suggested replacement clause shown as an insertion
- Comments on each change explaining why the edit was made
- Ready to open in Microsoft Word or Google Docs and send immediately

**Libraries:** `docx` + `file-saver`

**Acceptance Criteria:**
- Exported file opens correctly in Word and Google Docs
- At minimum top 3 risky clauses are redlined
- Each change includes a comment with the rationale

---

## 6. Extra / Bonus Features (Hackathon Stand-Outs)

These features enhance the demo's impressiveness if time permits:

### 6.1 Personal Playbook
- User uploads 1–3 of their "standard" preferred contracts
- AI learns their preferred clause style and baseline expectations
- Future analyses flag deviations: "This clause is missing mutual NDA — your template requires it"
- Stored per user via Prisma + Neon Postgres

### 6.2 Missing Clause Gap Check (by Contract Type)
- Auto-detects contract type
- Checks against a predefined checklist per type:
  - **NDA:** mutual confidentiality, term length, return of information
  - **Freelance:** payment terms, IP assignment, kill fee, revision limits
  - **SaaS:** SLA, data ownership, GDPR, auto-renewal, termination for cause
  - **Employment:** notice period, non-compete scope, IP clause, benefits

### 6.3 Contract Comparison
- Upload 2–3 versions of the same contract
- Side-by-side diff view showing what changed
- Risk delta: did the new version get riskier or safer?

### 6.4 Easy Sharing
- Generate a shareable link to the risk report (optional expiry)
- Auto-send email summary using Resend

---

## 7. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) + TypeScript |
| UI Components | shadcn/ui + Tailwind CSS |
| Authentication | Clerk (free tier) |
| File Parsing | `pdf-parse` (PDF), `mammoth` (DOCX) |
| AI / LLM | Vercel AI SDK + `@ai-sdk/google` → Google Gemini 1.5/2.0 Flash |
| Database | Prisma ORM + Neon Postgres (free tier) |
| Dashboard Charts | Recharts |
| Redline Export | `docx` + `file-saver` |
| Security | Arcjet (rate limiting, bot protection) |
| Email | Resend |
| Deployment | Vercel |
| Monorepo | Next Forge (SaaS starter — skips boilerplate) |

---

## 8. System Architecture

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

## 9. Data Models

### Contract
```typescript
model Contract {
  id          String   @id @default(cuid())
  userId      String
  fileName    String
  fileType    String   // "pdf" | "docx"
  parsedText  String   @db.Text
  contractType String? // auto-detected
  createdAt   DateTime @default(now())
  report      Report?
}
```

### Report
```typescript
model Report {
  id             String   @id @default(cuid())
  contractId     String   @unique
  contract       Contract @relation(fields: [contractId], references: [id])
  riskScore      Int
  summary        String
  flagsJson      Json     // full flags array
  missingClauses Json     // array of strings
  createdAt      DateTime @default(now())
}
```

---

## 10. AI Prompt Strategy

### System Prompt (Risk Analysis)
```
You are a senior contract attorney. Analyze the provided contract text and return a structured JSON risk report.

Identify:
1. High-risk clauses (unlimited liability, one-sided IP, unfair termination, etc.)
2. Missing standard protections for this contract type
3. Unusual or one-sided language

For each flag include: section name, severity (high/medium/low), title, plain-English description, and a specific suggested fix.

Determine the contract type automatically. Calculate a risk score from 0–100 (100 = extremely risky).

Return ONLY valid JSON. No markdown, no preamble.
```

### Chat System Prompt
```
You are a contract analysis assistant. The user has uploaded the following contract:

[CONTRACT TEXT]

Answer their questions accurately based solely on the contract above. Be concise, plain-English, and helpful.
```

---

## 11. Build Plan / Milestones

| Phase | Task | Priority |
|-------|------|----------|
| 1 | Project setup with Next Forge monorepo | P0 |
| 1 | File upload UI + parsing API (pdf-parse + mammoth) | P0 |
| 2 | AI risk analysis API route + Gemini integration | P0 |
| 2 | Store report in Neon Postgres via Prisma | P0 |
| 3 | Risk dashboard UI (heatmap + score + flags) | P0 |
| 3 | Flag detail drawer with AI suggestions | P0 |
| 4 | Chat Q&A side panel (streaming) | P1 |
| 5 | Redline .docx export | P1 |
| 6 | Missing clause gap check | P1 |
| 6 | Polish UI, add demo data, prep demo script | P0 |
| Bonus | Personal Playbook | P2 |
| Bonus | Contract comparison | P2 |
| Bonus | Shareable report links | P2 |

---

## 12. Demo Flow (3-Minute Pitch)

1. **[0:00–0:30]** Show the landing page. Upload a sample freelance contract with known bad clauses.
2. **[0:30–1:00]** AI analysis completes. Risk score of **78/100** appears with red ring. Dashboard loads with heatmap.
3. **[1:00–1:45]** Walk through Top 5 risks. Click on "Unlimited Liability" — drawer shows the exact clause + AI's suggested fix.
4. **[1:45–2:15]** Switch to Chat panel. Ask: *"Is the IP clause mutual?"* — AI answers in plain English from the contract.
5. **[2:15–2:45]** Click "Export Redline" — download .docx with tracked changes. Show it opening in Word.
6. **[2:45–3:00]** Close with: *"This is what lawyers would actually use."*

---

## 13. Why This Wins

- **Real problem** — Everyone signs contracts they don't understand
- **Polished demo** — Dashboard + Chat + Export = three distinct wow moments
- **Fast to build** — Next Forge eliminates setup; Gemini Flash API is free and fast
- **Goes beyond summarization** — Actionable fixes, interactive chat, usable exports
- **Feels like a real product** — Not a student project, a SaaS you'd pay for

---

## 14. Out of Scope (for Hackathon)

- Full NLP model fine-tuning (using Gemini off-the-shelf)
- Legal advice / attorney-client relationship features
- Mobile native app
- Payment / subscription billing
- Multi-language contract support
- Real-time collaboration

---

*Let's build something lawyers would actually use. 🚀*