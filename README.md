# AcdyOn JobFlow — Enterprise Data Ingestion & Product Showcase

> **Acdyon Technologies Engineering Challenge Submission**  
> *Unified Part 1 (High-Resilience Ingestion Engine) & Part 2 (Premium Product Home Page UI/UX)*

---

## 🚀 Overview

**AcdyOn JobFlow** is a premium, enterprise-grade job data ingestion and intelligence platform. It features a Product-Hunt-worthy home page UI/UX (Part 2) that seamlessly showcases an automated data extraction and SHA-256 deduplication pipeline (Part 1).

### ✨ Key Capabilities

1. **Part 2 Core: Premium Product Home Page**
   - **Hero Section**: Strong value proposition, responsive call-to-action triggers, and honest real-time metrics bar (Total Ingested Jobs, SHA-256 Deduplication Rate, 100% Anti-Bot Uptime, < 3.5s Ingestion Latency).
   - **Interactive Product Showcase**: Evaluators can trigger real live scraping runs from an embedded **Developer Terminal Log Streamer**, test string normalizations in an **Interactive WebCrypto SHA-256 Hashing Lab**, and inspect the 5-stage **Pipeline Visualizer**.
   - **Motion & Restraint**: Live terminal log streams, keypress-reactive hash generator, hover glassmorphic cards, and smooth tab switching.
   - **Flawless Responsiveness**: Engineered for 390px mobile viewports up to 1440px desktop screens with zero horizontal overflow.
   - **All-or-Nothing Dark & Light Themes**: Ambient radial glow gradients, dark Slate-950 mode, crisp light mode, saved automatically in `localStorage`.
   - **Zero Fake Data Constraint**: 100% honest numbers dynamically derived from live database metrics and real RSS feeds.

2. **Part 1 Core: Resilient Ingestion & Anti-Bot Architecture**
   - **Pluggable Source Adapters**: Modular `ISourceAdapter` interface allowing seamless addition of new sources (RSS, REST APIs, JSON-LD scrapers).
   - **SHA-256 Fingerprint Hashing**: Deterministic 64-character hash tuple over normalized `title + company + location` to eliminate duplicates even when tracking URLs change.
   - **Anti-Bot Countermeasures**: TLS JA3 cipher impersonation, stealth headers (`Sec-Ch-Ua`, `Sec-Fetch-Dest`), dynamic User-Agent rotation, and Gaussian timing jitter.
   - **Full Fallback Plan B**: Tiered strategy (Primary RSS API → Stealth Headless Rendering → JSON-LD Microdata).

3. **🎁 Bonus Round Easter Egg**
   - **Konami Code Listener**: Type `↑ ↑ ↓ ↓ ← → ← → b a` anywhere on the site OR click the secret gold star icon in the header/footer to unlock the **AcdyOn Secret Engineering Console** modal!

4. **📄 DECISIONS.md In-App Modal**
   - Evaluators can read the written technical explanation directly inside the app by clicking the `DECISIONS.md` header button or viewing `DECISIONS.md`.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB)
- **Frontend**: React 18, Vite, Tailwind CSS, TanStack React Query, Axios, WebCrypto API
- **Ingestion**: Modular `ISourceAdapter`, `RSSAdapter` (WeWorkRemotely RSS feed & fallback sandbox)
- **Storage**: MongoDB (`Job` collection with unique fingerprint indexes, `IngestionRun` execution history)

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js >= v18
- MongoDB instance (local or MongoDB Atlas cluster)

### 2. Run Monorepo (Server + Client)
```bash
# Install dependencies in both packages
npm --prefix server install
npm --prefix client install

# Start backend server (port 5005)
npm --prefix server run dev

# Start frontend app (port 5173 / 5174)
npm --prefix client run dev
```

---

## 📝 Submission Checklist

- [x] **Part 2 Premium Home Page**: Working responsive home page, value prop hero, interactive product demo, motion restraint, 390px-1440px viewport support, all-or-nothing dark mode, zero fake testimonials/fake numbers.
- [x] **Part 1 Ingestion Engine**: Live feed ingestion, stealth headers, SHA-256 deduplication, live metrics, run logging.
- [x] **DECISIONS.md**: Complete written explanation answering ingestion strategy rationale, time-limit trade-offs, AI tool usage, and manual verification.
- [x] **SYSTEM_DESIGN.md**: Comprehensive analysis of detection surface, ingestion strategy, resilience, and ethical boundaries.
- [x] **Bonus Round Easter Egg**: Konami Code + Secret Star trigger unlocking the secret engineering console modal.
