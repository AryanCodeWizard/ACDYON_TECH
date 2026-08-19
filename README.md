# JobFlow — Resilient Data Ingestion Pipeline

> **Acdyon Technologies Engineering Challenge — Part 1 Submission**  
> *A fault-tolerant, anti-bot resilient data extraction & SHA-256 deduplication engine for job listings.*

---

## 📌 Problem Statement

Target job platforms (LinkedIn, Indeed, Naukri, Wellfound) do not provide free, unrestricted APIs and employ aggressive anti-bot countermeasures:
- **Headless Browser Fingerprinting**: Detecting canvas rendering, WebGL context, and navigator flag anomalies.
- **Request Profiling & Rate Limiting**: Tracking request velocity, IP origin, missing headers (`Sec-Fetch-*`), and deterministic request timing.
- **CAPTCHA & IP Bans**: Blacklisting IP ranges and walling requests that exhibit automated patterns.

**Core Challenge**: Extract job listings repeatedly, reliably, and resiliently without burning IP addresses or user accounts—while handling source schema changes, rate limits, and network failures.

---

## 💡 Approach & High-Level Strategy

JobFlow approaches data extraction with a **multi-tiered, anti-bot resilient architecture**:

1. **Modular Source Abstraction**: Pluggable `ISourceAdapter` design pattern isolating ingestion logic from pipeline orchestration.
2. **Deterministic SHA-256 Deduplication**: Generates a 64-character hash tuple over normalized `title | company | location` attributes to eliminate duplicate listings across runs and source variations.
3. **Stealth Request Profiling**: Emulates browser network signatures using dynamic User-Agent rotation, chrome fetch metadata headers (`Sec-Ch-Ua`, `Sec-Fetch-Dest`), and Gaussian timing jitter.
4. **Resilience & Fallback Strategy**: Employs a `CompositeAdapter` pattern that automatically falls back to secondary sources (e.g., Remotive REST API) when primary feeds (e.g., WeWorkRemotely RSS) experience downtime or rate limiting.
5. **Strict Input Sanitization**: Validates payloads, sanitizes HTML descriptions, and enforces URL protocol safeguards against Server-Side Request Forgery (SSRF).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Runtime & Language** | Node.js (v18+), TypeScript (Strict Mode) |
| **Backend Framework** | Express.js, Mongoose (MongoDB ORM) |
| **Ingestion & Cryptography** | Node Crypto (`SHA-256`), Axios, Fast-XML-Parser |
| **Testing** | Jest, Supertest |
| **Control Dashboard** | React 18, Vite, Tailwind CSS, TanStack React Query |

---

## 🏗️ System Architecture

```
                               ┌─────────────────────────┐
                               │  External Job Sources   │
                               │ (WeWorkRemotely, etc.)  │
                               └───────────┬─────────────┘
                                           │ (Stealth Requests)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                         JobFlow Ingestion Engine                              │
│                                                                                │
│   ┌───────────────────────┐    ┌────────────────────────┐    ┌─────────────┐   │
│   │   ISourceAdapter      ├───►│  Validation & Hash     ├───►│ MongoDB     │   │
│   │ (RSS / Remotive /     │    │  (SHA-256 Fingerprint) │    │ Storage     │   │
│   │  Composite Fallback)  │    └────────────────────────┘    └─────────────┘   │
│   └───────────────────────┘                                                    │
└──────────────────────────────────────────┬─────────────────────────────────────┘
                                           │
                                           ▼
                               ┌─────────────────────────┐
                               │  REST API & Live        │
                               │  Developer Console      │
                               └─────────────────────────┘
```

### Component Breakdown
- **[BaseAdapter.ts](file:///Users/aryanraj/Desktop/ACdyon/jobflow/server/src/adapters/BaseAdapter.ts)**: Defines the standardized `ISourceAdapter` interface and raw job schemas.
- **[RSSAdapter.ts](file:///Users/aryanraj/Desktop/ACdyon/jobflow/server/src/adapters/RSSAdapter.ts)**: Implements RSS feed parsing with exponential backoff retries and stealth headers.
- **[RemotiveAdapter.ts](file:///Users/aryanraj/Desktop/ACdyon/jobflow/server/src/adapters/RemotiveAdapter.ts)**: Implements REST API ingestion from secondary job boards.
- **[CompositeAdapter.ts](file:///Users/aryanraj/Desktop/ACdyon/jobflow/server/src/adapters/CompositeAdapter.ts)**: Manages source rotation and automated fallback policies.
- **[IngestionService.ts](file:///Users/aryanraj/Desktop/ACdyon/jobflow/server/src/services/IngestionService.ts)**: Orchestrates fetching, validation, deduplication checks, database persistence, and run logging.
- **[fingerprint.ts](file:///Users/aryanraj/Desktop/ACdyon/jobflow/server/src/utils/fingerprint.ts)**: Computes deterministic SHA-256 fingerprint hashes over normalized job metadata.
- **[validator.ts](file:///Users/aryanraj/Desktop/ACdyon/jobflow/server/src/utils/validator.ts)**: Enforces payload completeness and SSRF protection.
- **[logger.ts](file:///Users/aryanraj/Desktop/ACdyon/jobflow/server/src/utils/logger.ts)**: Provides structured logging for pipeline execution and metrics.

---

## ✨ Key Features & Capabilities

- 🔄 **Pluggable Adapter System**: Easily extendable to add new RSS, REST, or scrapers by implementing `ISourceAdapter`.
- ⚡ **SHA-256 Fingerprint Deduplication**: Prevents duplicate DB writes even when tracking links or query parameters differ.
- 🛡️ **Anti-Bot Countermeasures**: Includes real user-agent pools, request jitter pacing, and header fingerprint matching.
- 🚦 **Fault Classification & Recovery**: Differentiates `RateLimitError`, `TransientError`, and `PermanentError` to execute appropriate retry/backoff policies.
- 🩺 **Health & Metrics Monitoring**: Endpoint exposing source availability, uptime, and database connection status.
- 💻 **Interactive Developer Console**: React-based control panel to trigger live ingestion runs, view real-time logs, and test fingerprint hashes in a sandbox environment.

---

## ⚡ Setup & Run Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/AryanCodeWizard/ACDYON_TECH.git
cd ACDYON_TECH

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Setup

Create a `.env` file in the `server` directory (or copy from `server/.env.example`):

```env
PORT=5005
MONGODB_URI=mongodb://localhost:27017/jobflow
NODE_ENV=development
```

### 3. Run Backend & Frontend

```bash
# Start backend server (from server/ directory)
npm run dev
# Server runs at http://localhost:5005

# Start frontend console (from client/ directory in another terminal)
npm run dev
# Frontend runs at http://localhost:5173
```

### 4. Run Test Suite

```bash
# Run backend Jest unit tests (from server/ directory)
npx jest
```

---

## 📡 API Reference

### 1. Trigger Ingestion Run
`POST /api/ingestion/run`

Triggers an ingestion pipeline run using a specified source or the default composite fallback adapter.

#### Request Body:
```json
{
  "source": "weworkremotely"
}
```
*Supported sources:* `"weworkremotely"`, `"remotive"`, `"rss"`, or omit for `"composite"` fallback.

#### Response (`202 Accepted`):
```json
{
  "runId": "66c34f1e9b2a1a2b3c4d5e6f",
  "status": "completed",
  "metrics": {
    "totalFetched": 25,
    "inserted": 18,
    "duplicates": 7,
    "errors": 0
  }
}
```

---

### 2. Health & Source Status Check
`GET /api/health`

Returns server health, uptime, database status, and individual source availability.

#### Response (`200 OK`):
```json
{
  "status": "ok",
  "uptime": 142.85,
  "environment": "development",
  "mongo": "connected",
  "sources": {
    "weworkremotely": {
      "status": "healthy",
      "latencyMs": 320
    },
    "remotive": {
      "status": "healthy",
      "latencyMs": 185
    }
  },
  "timestamp": "2026-08-19T13:10:00.000Z"
}
```

---

## 🧠 Important Implementation Decisions ([DECISIONS.md](file:///Users/aryanraj/Desktop/ACdyon/jobflow/DECISIONS.md))

### 1. Strategy Rationale: Direct Adapter Pipeline vs. Message Queues
- **Choice**: Synchronous adapter pipeline over async brokers (BullMQ/Redis).
- **Rationale**: Keeps execution transparent, testable, and deterministic within scope boundaries without introducing infrastructure complexity for moderate payload sizes.

### 2. Detection Surface & Mitigation
- **Mitigation**: Header stealth (`Sec-Fetch-*`), real user-agent pools, and request pacing protect against automated detection on public endpoints.

### 3. Production Roadmap (Given a Full Week)
1. **Queue Decoupling**: Integrate BullMQ + Redis for asynchronous background ingestion workers.
2. **Distributed Rate Limiting**: Implement domain-level token buckets in Redis.
3. **Headless Stealth Fallback**: Add Playwright with residential proxy rotation for challenging anti-bot walls.
4. **Metrics Export**: Prometheus `/metrics` endpoint for scraper latency and error rates.

### 4. Technical & Ethical Line ("Where We Stop")
- **Public Data Focus**: Harvests exclusively from public RSS feeds and open REST endpoints.
- **No Abuse**: Respects target server resources via request pacing and backoff strategies.
- **ToS Guardrail**: Adheres to scope guidelines by demonstrating resilience on public feeds without violating login-protected platform ToS.
