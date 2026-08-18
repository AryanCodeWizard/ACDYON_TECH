# JobFlow — System Design Document & Ingestion Architecture

> **Part 1 Track Deliverable**: Comprehensive technical design covering Bot Detection Surface, Ingestion Strategy, Pipeline Resilience, and Ethical Boundaries.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                  JOBFLOW SYSTEM                                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +------------------+     +------------------------+     +---------------------+  |
|  |   Client (Vite)  | <-> | Express API (Port 5005)| <-> | MongoDB Database    |  |
|  +------------------+     +------------------------+     +---------------------+  |
|                                       |                                           |
|                                       v                                           |
|                         +----------------------------+                            |
|                         |    Ingestion Service       |                            |
|                         +----------------------------+                            |
|                                       |                                           |
|                 +---------------------+---------------------+                     |
|                 |                     |                     |                     |
|                 v                     v                     v                     |
|        +-----------------+   +-----------------+   +------------------+           |
|        |   RSS Adapter   |   | Playwright/     |   | Custom API       |           |
|        |   (Low-Risk)    |   | Stealth Adapter |   | Sandbox Adapter  |           |
|        +-----------------+   +-----------------+   +------------------+           |
|                 |                     |                     |                     |
|                 +---------------------+---------------------+                     |
|                                       |                                           |
|                                       v                                           |
|                         +----------------------------+                            |
|                         |  SHA-256 Fingerprint Hash  |                            |
|                         |       Deduplication        |                            |
|                         +----------------------------+                            |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 1. Detection Surface & Anti-Bot Mitigations

Automated clients attempting to ingest data from protected job portals (LinkedIn, Indeed, Wellfound) trigger anti-bot defenses through several distinct vectors:

| Detection Vector | Mechanism Used by Defenses (Cloudflare, PerimeterX, Kasada) | JobFlow Mitigation Architecture |
| :--- | :--- | :--- |
| **Browser Fingerprinting** | Checking `navigator.webdriver === true`, missing Chrome plugins, WebGL rendering anomalies, canvas fingerprints, and automation flags. | Use stealth wrappers (`puppeteer-extra-plugin-stealth` or `playwright-stealth`) to strip automation properties, spoof GPU vendor strings, and simulate real browser contexts. |
| **TLS / JA3 Fingerprinting** | Inspecting TLS client hello ciphers and extension signatures (e.g. Node `axios` vs real Chrome browser TLS signatures). | Employ HTTP clients supporting TLS fingerprint impersonation (`curl_cffi` / custom TLS headers) when making raw HTTP requests. |
| **HTTP Request Headers** | Missing standard Chrome browser headers (`Sec-Ch-Ua`, `Sec-Fetch-Dest`, `Accept-Language`, `User-Agent` matching OS). | Implement header rotation & matching. Dynamic generation of realistic user-agent strings synchronized with matching Client-Hints headers. |
| **IP Address & Rate Limits** | High volume of HTTP requests from datacenter IPs (AWS, DigitalOcean, GCP). | Rotate requests across a residential/mobile proxy pool with sticky session management per ingestion batch. |
| **Behavioral & Timing** | Fixed polling intervals (e.g. exactly every 60.0 seconds), linear mouse movements, instant page clicks. | Introduce Gaussian jitter delay patterns (`2s - 7s` random delay), randomized scroll behavior, and non-deterministic request intervals. |

---

## 2. Ingestion Strategy & Pacing

To pull data continuously while remaining under anti-bot radar, the ingestion engine uses a multi-tiered strategy:

### A. Pacing & Rate Limiting
- **Token Bucket Rate Limiting**: Per-domain request throttling (e.g., maximum 5 requests/minute per target domain).
- **Randomized Jitter**: Requests are padded with variable delays generated via a normal distribution rather than fixed timeouts.

### B. Session & Proxy Management
- **Proxy Rotation**: Datacenter proxies for low-risk RSS feeds; residential proxies with session stickiness for protected HTML pages.
- **Cookie & Session Preservation**: Reusing session cookies across pagination pages to mimic single-user browsing sessions.

### C. Fallback Strategy & Plan B
When a primary ingestion source introduces CAPTCHA walls or blocks IPs:
1. **Tier 1 (Primary)**: Direct public API / RSS Feed ingestion (fastest, lowest risk).
2. **Tier 2 (Fallback)**: Headless browser rendering with stealth patches and residential proxy rotation.
3. **Tier 3 (Plan B)**: Fallback to structured data extraction (JSON-LD scripts embedded in HTML) or 3rd-party SERP data providers (SerpAPI, Apify) if direct scraping is fully blocked.

---

## 3. Pipeline Resilience & Fault Tolerance

```
[ Ingestion Run ] ---> [ Fetch Source ] ---> [ Parse Data ] ---> [ Compute Fingerprint ] ---> [ Upsert DB ]
                             |                     |                     |                        |
                      (Network Error)       (Schema Drift)        (Duplicate Check)        (Metrics Logged)
                             |                     |                     |                        |
                             v                     v                     v                        v
                      [ Retry Backoff ]    [ JSON-LD Fallback ]   [ Increment Dupe Count ]  [ IngestionRun Record ]
```

- **Schema Drift Protection**: Primary parsing targets semantic HTML selectors, but falls back to JSON-LD microdata (`<script type="application/ld+json">`). If a single field (e.g., salary or location) fails to parse, default fallbacks (e.g. `"Not Specified"`) prevent the entire ingestion batch from crashing.
- **SHA-256 Fingerprint Deduplication**: Each job listing generates a unique hash based on normalized text:
  $$\text{fingerprint} = \text{SHA256}(\text{normalized}(title) + \text{normalized}(company) + \text{normalized}(location))$$
  This ensures that markup changes or varying URL query parameters do not cause duplicate re-insertions.
- **Non-Silent Failure Reporting**: Each execution records an `IngestionRun` document containing metrics (`inserted`, `duplicates`, `errors`, `status`, `durationMs`). Failures are logged and surfaced via the UI dashboard.

---

## 4. Ethical Boundaries & Scope Compliance

- **Respecting Target Infrastructure**: The pipeline enforces strict rate limiting and concurrency caps to prevent load spikes on target servers.
- **Public Data Focus**: Only publicly accessible job postings are collected; authenticated user data, personal profiles, or paywalled content are strictly out of scope.
- **Scope Guardrail Adherence**: In accordance with the challenge guidelines, the live demo operates against public RSS/API endpoints to demonstrate end-to-end ingestion without violating ToS or risking IP bans on live platforms.
