<![CDATA[<div align="center">

# 🧠 InsightAI

### AI-Powered Data Intelligence Platform

Transform natural-language business requirements into clean, structured, source-backed datasets with managed end-to-end workflows.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## 🌟 Overview

**InsightAI** is a full-stack, production-grade data intelligence platform that empowers businesses to collect and structure web data using nothing more than a natural-language prompt. Simply describe what data you need, and InsightAI will:

1. **Parse** your requirements using Google Gemini AI
2. **Generate** a multi-step data collection workflow
3. **Execute** the workflow with intelligent web scraping
4. **Process** the data (clean, validate, deduplicate)
5. **Present** the results through an interactive dashboard

## ✨ Features

### Core Capabilities
- 🗣️ **Natural Language Prompts** — Describe data needs in plain English
- 🤖 **AI Workflow Generation** — Automated multi-step collection plans
- 🔄 **Data Processing Pipeline** — Clean, validate, and deduplicate
- 📊 **Interactive Dashboard** — Real-time charts, KPIs, and tables
- 📋 **Task Management** — Create, monitor, and manage collection tasks
- 📁 **Dataset Explorer** — Search, filter, sort, and paginate results
- 📤 **Multi-format Export** — CSV, JSON, and PDF downloads
- 🔗 **Source Traceability** — Every data point linked to its source

### Premium Features
- 🎨 **Dark/Light Theme** — System-aware with manual toggle
- 📱 **Responsive Design** — Mobile-first, works everywhere
- 📈 **Data Visualization** — Dynamic charts from collected data
- 🏷️ **Workflow Templates** — Pre-built templates for common use cases
- ✅ **Data Quality Scoring** — AI-powered anomaly detection
- 🔄 **Real-time Progress** — Live updates during collection
- ⚡ **Rate Limiting** — Built-in protection for external sources
- 🔁 **Error Recovery** — Automatic retry with exponential backoff

## 🏗️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Vanilla CSS with Custom Properties |
| Database | SQLite via Prisma ORM |
| AI Engine | Google Gemini API |
| Web Scraping | Cheerio + node-fetch |
| Charts | Recharts |
| Validation | Zod |
| Icons | Lucide React |
| Export | PapaParse (CSV) + jsPDF (PDF) |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **Google Gemini API Key** (optional, for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/A-P-S-Bhaidav/InsightAI.git
cd InsightAI
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your-api-key-here
```

4. **Initialize the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Deployment

```bash
docker-compose up -d
```

## 📁 Project Structure

```
insightai/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── tasks/         # Task CRUD + execution
│   │   │   ├── workflows/     # Workflow management
│   │   │   ├── datasets/      # Dataset browsing + export
│   │   │   └── stats/         # Dashboard statistics
│   │   ├── tasks/             # Task pages
│   │   ├── datasets/          # Dataset pages
│   │   ├── workflows/         # Workflow pages
│   │   ├── settings/          # Settings page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Dashboard
│   │   └── globals.css        # Design system
│   ├── components/
│   │   ├── layout/            # Sidebar, Header, ThemeProvider
│   │   ├── prompt/            # PromptEditor, TemplateGallery
│   │   ├── dashboard/         # StatsCard, Charts, RecentTasks
│   │   ├── tasks/             # TaskCard, TaskTimeline
│   │   ├── datasets/          # DataTable, DataChart, ExportMenu
│   │   └── common/            # Badge, Modal, Toast, Skeleton
│   └── lib/
│       ├── ai/                # Gemini AI integration
│       ├── scraper/           # Web scraping engine
│       ├── db.ts              # Prisma client
│       ├── utils.ts           # Utility functions
│       └── constants.ts       # App constants
├── .env.example               # Environment template
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose
└── README.md                  # This file
```

## 🔌 API Reference

### Tasks
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/tasks` | List tasks (paginated, filterable) |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks/:id` | Get task details |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/execute` | Execute task workflow |

### Datasets
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/datasets` | List datasets |
| GET | `/api/datasets/:id` | Get dataset with data points |
| DELETE | `/api/datasets/:id` | Delete dataset |
| GET | `/api/datasets/:id/export?format=csv` | Export dataset |

### Workflows
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/workflows` | List workflows |
| GET | `/api/workflows/:id` | Get workflow details |

### Dashboard
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/stats` | Dashboard statistics |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — The React framework for production
- [Prisma](https://www.prisma.io/) — Next-generation ORM
- [Google Gemini](https://ai.google.dev/) — Advanced AI capabilities
- [Recharts](https://recharts.org/) — React charting library
- [Lucide](https://lucide.dev/) — Beautiful icons

---

<div align="center">
  <strong>Built with ❤️ for the Data Intelligence community</strong>
</div>
]]>
