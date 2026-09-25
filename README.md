<div align="center">

<img src="public/icon-192.png" alt="InsightAI" width="80" height="80" style="border-radius: 16px;" />

# InsightAI

### The AI-Native Data Intelligence Platform

**Turn plain English into production-ready datasets — in seconds, not days.**

[![Built with Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Groq](https://img.shields.io/badge/Groq-Fallback-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

[Live Demo](https://insightai.vercel.app) · [Report Bug](https://github.com/A-P-S-Bhaidav/InsightAI/issues) · [Request Feature](https://github.com/A-P-S-Bhaidav/InsightAI/issues)

</div>

---

## The Problem

Data teams spend **60–70% of their time** on data collection, cleaning, and structuring — not analysis. Traditional scraping tools require technical setup. APIs require integration work. Manual collection doesn't scale.

**InsightAI eliminates this entire bottleneck.**

## The Solution

InsightAI is a full-stack, AI-native data intelligence platform that converts natural-language prompts into structured, validated, source-attributed datasets through an automated multi-step pipeline.

```
"Find SaaS companies in San Francisco with Series A funding, 
 including founder names, employee count, and funding amount"
```

↓ **InsightAI handles everything** ↓

```
✅ Parsed 6 extraction targets  →  📋 Generated 5-step workflow  →  
🔍 Collected 47 records          →  🧹 Cleaned & deduplicated     →  
✅ Validated (94% quality score) →  📊 Ready to explore & export
```

---

## Why InsightAI

<table>
<tr>
<td width="33%" align="center">

### ⚡ 10x Faster

What takes a data team **days** takes InsightAI **seconds**. Describe → Execute → Export.

</td>
<td width="33%" align="center">

### 🧠 AI-First Architecture

Dual-LLM system (Gemini + Groq) with automatic failover. No single point of failure.

</td>
<td width="33%" align="center">

### 🛡️ Production-Grade

Auth, rate limiting, input sanitization, security headers, encrypted passwords. Enterprise-ready.

</td>
</tr>
<tr>
<td width="33%" align="center">

### 📊 Built-in Analytics

Interactive charts, quality scoring, and source attribution — no BI tool needed.

</td>
<td width="33%" align="center">

### 🔄 End-to-End Pipeline

Scrape → Transform → Validate → Deduplicate → Export. Fully automated.

</td>
<td width="33%" align="center">

### 🎨 Premium UI/UX

Dark/light themes, glassmorphism, scroll animations, onboarding tutorial. SaaS-grade polish.

</td>
</tr>
</table>

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 15)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Landing  │  │  Auth    │  │Dashboard │  │  Task/Data   │   │
│  │  Page    │  │Login/Sign│  │  Stats   │  │  Explorer    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     MIDDLEWARE LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │   NextAuth   │  │ Rate Limiter │  │  Security Headers  │   │
│  │   v5 (JWT)   │  │  30 req/min  │  │ CSP, HSTS, XSS    │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                        API LAYER (13 endpoints)                 │
│  /api/auth/*  /api/tasks/*  /api/datasets/*  /api/workflows/*  │
│  /api/stats   /api/user/onboarding                              │
├─────────────────────────────────────────────────────────────────┤
│                      AI ORCHESTRATION                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Unified AI Client (client.ts)               │   │
│  │  ┌─────────────────┐      ┌─────────────────────────┐  │   │
│  │  │  Gemini 2.0     │─FAIL─▶│  Groq Llama 3.3 70B    │  │   │
│  │  │  Flash (Primary)│      │  Versatile (Fallback)   │  │   │
│  │  └─────────────────┘      └─────────────────────────┘  │   │
│  │  • Exponential backoff  • 3 retries per provider       │   │
│  │  • Rate limit detection • Seamless failover            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │Prompt Parser │  │Workflow Gen  │  │ Data Validator   │    │
│  │NLP → Schema  │  │Plan → Steps  │  │ Quality Scoring  │    │
│  └──────────────┘  └──────────────┘  └──────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                     DATA PIPELINE                               │
│  ┌────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐   │
│  │ Scrape │─▶│ Transform │─▶│ Validate │─▶│ Deduplicate │   │
│  └────────┘  └───────────┘  └──────────┘  └─────────────┘   │
│       │                                          │              │
│       ▼                                          ▼              │
│  Source Tracking                           Quality Report       │
│  (URL, status, response time)             (completeness,        │
│                                            consistency,          │
│                                            accuracy score)       │
├─────────────────────────────────────────────────────────────────┤
│                      DATA LAYER                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Prisma ORM  →  SQLite (dev) / PostgreSQL (prod)        │   │
│  │  7 Models: User, Account, Session, Task, Workflow,      │   │
│  │            WorkflowStep, Dataset, DataPoint, Source      │   │
│  │  8 Indexes for query optimization                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|:------|:-----------|:----|
| **Framework** | Next.js 15 (App Router, Turbopack) | Fastest React framework, RSC, edge-ready |
| **Language** | TypeScript (strict mode) | Type safety across the entire stack |
| **Auth** | NextAuth v5 | Industry-standard, OAuth + Credentials |
| **AI (Primary)** | Google Gemini 2.0 Flash | Top-tier reasoning, fast inference |
| **AI (Fallback)** | Groq Llama 3.3 70B | Ultra-low latency, automatic failover |
| **ORM** | Prisma | Type-safe queries, migration support |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Zero-config dev, scalable prod |
| **Scraping** | Cheerio + fetch | Lightweight, server-side DOM parsing |
| **Charts** | Recharts | Composable, responsive React charts |
| **Styling** | Vanilla CSS (1200+ lines) | Zero-dependency, full design system |
| **Icons** | Lucide React | 1000+ consistent, tree-shakeable icons |
| **Security** | bcryptjs, rate-limiter-flexible | Password hashing, API protection |
| **Deployment** | Docker + Vercel | Containerized dev, serverless prod |

---

## Features

### 🧠 AI-Powered Data Collection
Describe what you need in plain English. InsightAI uses dual-LLM architecture to parse your requirements, generate intelligent workflows, and execute multi-step data pipelines automatically.

### 🔐 Enterprise Authentication
Full authentication system with **Google OAuth** and **email/password** login. Passwords hashed with bcrypt, sessions managed with JWT, and all routes protected by middleware.

### 📊 Interactive Dashboard
Real-time statistics, activity charts, task status tracking, and source analytics — all in a symmetrical, responsive grid layout with glassmorphism cards.

### 📘 Guided Onboarding
First-time users receive a beautiful, multi-step tutorial overlay that walks through every feature. Skippable, with "don't show again" persistence.

### 🛡️ Security-First Design
- **Rate limiting** — 30 requests/minute per IP on critical endpoints
- **Input sanitization** — XSS and injection prevention
- **Security headers** — CSP, HSTS, X-Frame-Options, X-XSS-Protection
- **Password security** — bcrypt with 10 salt rounds
- **Route protection** — Middleware-enforced authentication

### 📤 Multi-Format Export
Export any dataset as **CSV** or **JSON** with a single click. Source attribution preserved across formats.

### 🎨 Premium Design System
1200+ lines of handcrafted vanilla CSS with custom properties, supporting:
- Dark mode (default) and light mode
- Glassmorphism effects with `backdrop-filter`
- Micro-animations (fade, slide, shimmer, scale)
- Responsive breakpoints (mobile → tablet → desktop)
- Custom scrollbars and focus states

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Clone
git clone https://github.com/A-P-S-Bhaidav/InsightAI.git
cd InsightAI

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your API keys

# Database
npx prisma generate
npx prisma db push

# Launch
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the homepage. Sign up to access the dashboard.

### Docker

```bash
docker-compose up -d
```

---

## Environment Variables

| Variable | Required | Description |
|:---------|:---------|:------------|
| `DATABASE_URL` | ✅ | Database connection string |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key ([get one](https://aistudio.google.com/apikey)) |
| `GROQ_API_KEY` | ✅ | Groq API key ([get one](https://console.groq.com/keys)) |
| `AUTH_SECRET` | ✅ | Random secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | App URL (e.g., `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | ➖ | Google OAuth client ID (for social login) |
| `GOOGLE_CLIENT_SECRET` | ➖ | Google OAuth client secret |

---

## Project Structure

```
insightai/
├── prisma/
│   └── schema.prisma              # 9 models, 8 indexes
├── src/
│   ├── app/
│   │   ├── page.tsx               # Public landing page (scroll animations)
│   │   ├── login/page.tsx         # OAuth + email login
│   │   ├── signup/page.tsx        # Registration with password validation
│   │   ├── dashboard/page.tsx     # Authenticated dashboard
│   │   ├── tasks/                 # Task list, detail, create
│   │   ├── datasets/              # Dataset list, detail with charts
│   │   ├── workflows/             # Workflow monitoring
│   │   ├── settings/              # Tabbed settings (5 sections)
│   │   ├── api/
│   │   │   ├── auth/              # NextAuth + registration endpoints
│   │   │   ├── tasks/             # CRUD + AI execution pipeline
│   │   │   ├── datasets/          # Browsing + CSV/JSON export
│   │   │   ├── workflows/         # Workflow management
│   │   │   ├── stats/             # Dashboard statistics
│   │   │   └── user/              # Onboarding status
│   │   ├── layout.tsx             # Conditional sidebar layout
│   │   ├── globals.css            # Design system (1200+ lines)
│   │   └── landing.css            # Scroll animation styles
│   ├── components/
│   │   ├── layout/                # Sidebar, Header, ThemeProvider, AppLayoutWrapper
│   │   ├── dashboard/             # StatsCard, ActivityChart, RecentTasks, TopSources
│   │   ├── prompt/                # PromptEditor, TemplateGallery
│   │   ├── tasks/                 # TaskCard, TaskTimeline
│   │   ├── datasets/              # DataTable, DataChart, ExportMenu
│   │   └── common/                # Badge, Modal, Toast, Skeleton, OnboardingTutorial
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts          # Unified AI client (Gemini + Groq)
│   │   │   ├── prompt-parser.ts   # NLP prompt → structured schema
│   │   │   ├── workflow-generator.ts  # Schema → pipeline plan
│   │   │   └── data-validator.ts  # Quality scoring engine
│   │   ├── scraper/
│   │   │   ├── engine.ts          # Web scraping with Cheerio
│   │   │   ├── pipeline.ts        # Transform, validate, deduplicate
│   │   │   └── sources.ts         # Permitted source registry
│   │   ├── auth.ts                # NextAuth v5 configuration
│   │   ├── security.ts            # Rate limiting, sanitization
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── utils.ts               # Utility functions
│   │   └── constants.ts           # App constants & templates
│   └── middleware.ts              # Route protection
├── public/                        # Favicon, icons, static assets
├── Dockerfile                     # Multi-stage Docker build
├── docker-compose.yml             # One-command deployment
└── .env.example                   # Environment template
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/auth/register` | Create account (email + password) |
| `*` | `/api/auth/[...nextauth]` | NextAuth handlers (login, OAuth, session) |
| `GET/PATCH` | `/api/user/onboarding` | Onboarding completion status |

### Tasks
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/tasks` | List tasks (paginated, filterable by status) |
| `POST` | `/api/tasks` | Create task from natural-language prompt |
| `GET` | `/api/tasks/:id` | Task detail with workflows |
| `PATCH` | `/api/tasks/:id` | Update task metadata |
| `DELETE` | `/api/tasks/:id` | Delete task and cascade |
| `POST` | `/api/tasks/:id/execute` | **Execute AI pipeline** (rate-limited) |

### Datasets
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/datasets` | List datasets with workflow context |
| `GET` | `/api/datasets/:id` | Dataset with paginated data points + stats |
| `DELETE` | `/api/datasets/:id` | Delete dataset |
| `GET` | `/api/datasets/:id/export?format=csv` | Export as CSV or JSON |

### Dashboard
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/stats` | Aggregated statistics, task trends, source rankings |

---

## Database Schema

```
User ──┬── Account (OAuth providers)
       ├── Session (active sessions)
       └── Task ── Workflow ──┬── WorkflowStep
                              └── Dataset ── DataPoint ── Source
```

**9 models** | **8 optimized indexes** | **Cascading deletes** | **SQLite (dev) / PostgreSQL (prod)**

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add environment variables
4. Deploy

> **Database:** Use [Neon](https://neon.tech) (free PostgreSQL) — change `provider` in `schema.prisma` to `"postgresql"`

### Docker

```bash
docker-compose up -d
```

---

## Security

| Measure | Implementation |
|:--------|:---------------|
| Authentication | NextAuth v5 with JWT sessions |
| Password Storage | bcrypt (10 salt rounds) |
| API Protection | Rate limiting (30 req/min per IP) |
| Input Validation | Server-side sanitization on all endpoints |
| HTTP Headers | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy |
| Route Protection | Middleware-enforced auth on all dashboard routes |
| OAuth | Google OAuth 2.0 with PKCE |

---

## Contributing

We welcome contributions. Please read our guidelines before submitting.

```bash
# Fork → Clone → Branch
git checkout -b feature/your-feature

# Develop
npm run dev

# Build check
npx next build

# Commit → Push → PR
git commit -m "feat: description"
git push origin feature/your-feature
```

---

## License

MIT © [InsightAI](https://github.com/A-P-S-Bhaidav/InsightAI)

---

<div align="center">

**InsightAI** — Because data collection should be a prompt, not a project.

[Get Started](https://github.com/A-P-S-Bhaidav/InsightAI) · [Report Issue](https://github.com/A-P-S-Bhaidav/InsightAI/issues) · [Star ⭐](https://github.com/A-P-S-Bhaidav/InsightAI)

</div>
