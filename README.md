# JobFlow — Automated Data Ingestion & Deduplication Pipeline

> **Acdyon Technologies Frontend & Engineering Challenge (Part 1 Track)**  
> *End-to-End Ingestion System with Pluggable Source Adapters, SHA-256 Deduplication, and React Admin Dashboard.*

---

## 🚀 Overview

JobFlow is an automated job listing ingestion engine designed to pull listings from external sources safely, parse unstructured data, compute SHA-256 fingerprints to eliminate duplicate job posts, and present them in a responsive dashboard.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB)
- **Frontend**: React 18, Vite, Tailwind CSS, TanStack React Query, Axios
- **Ingestion**: Modular `ISourceAdapter` pattern, `RSSAdapter` (StackOverflow/Job RSS), SHA-256 Fingerprint Generator
- **Storage**: MongoDB (`Job` collection with unique fingerprint indexes, `IngestionRun` execution history)

---

## 📂 Project Structure

```
jobflow/
├── client/                 # React 18 + Vite + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── api/            # Axios API Client & endpoints
│   │   ├── pages/          # Dashboard & Job Detail Modal components
│   │   └── main.tsx
│   ├── public/             # Static Assets (vite.svg)
│   └── package.json
├── server/                 # Express + TypeScript Ingestion Engine
│   ├── src/
│   │   ├── adapters/       # ISourceAdapter interface & RSSAdapter implementation
│   │   ├── models/         # Mongoose Schemas (Job, IngestionRun)
│   │   ├── routes/         # REST API Endpoints (/api/jobs, /api/ingestion, /api/health)
│   │   ├── services/       # IngestionService orchestration & dedupe loop
│   │   ├── utils/          # SHA-256 fingerprint generator
│   │   └── server.ts       # Express app & CORS middleware
│   └── package.json
├── DECISIONS.md            # Required 1-page design & trade-off rationale
└── SYSTEM_DESIGN.md        # Technical breakdown (Detection Surface, Ingestion, Resilience, Ethics)
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js >= v18
- MongoDB instance (local or MongoDB Atlas cluster)

### 2. Backend Setup
```bash
cd server
npm install
npm run build
npm run dev
# Server will start on http://localhost:5005
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
# Dashboard will run on http://127.0.0.1:5173
```

---

## 📝 Part 1 Deliverables Checklist

- [x] **Working Ingestion Demo**: Live feed ingestion via `RSSAdapter` with SHA-256 fingerprint deduplication.
- [x] **Dashboard UI**: Filterable, searchable, paginated dashboard with live execution triggers and run metrics.
- [x] **DECISIONS.md**: Complete 1-page explanation covering architectural trade-offs, AI tool usage, and manual verification.
- [x] **SYSTEM_DESIGN.md**: Comprehensive document covering Bot Detection Surfaces, Pacing/Proxy Ingestion Strategies, Pipeline Resilience, and Legal/Ethical Lines.
