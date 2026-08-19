# DECISIONS.md

## 1. Why this ingestion strategy over the obvious alternative?

I chose a **synchronous in-API ingestion pipeline with a modular `ISourceAdapter` abstraction** over an asynchronous message queue (e.g., BullMQ + Redis or RabbitMQ).

**Why this wins for the assessment:**
- **Direct Signal & Testability:** The core engineering challenge is robust ingestion: stealth headers, error classification, data normalization, and SHA-256 fingerprint deduplication. A synchronous adapter pipeline allows immediate verification and deterministic unit testing without hiding complexity behind queue workers.
- **Pluggable Multi-Source Architecture:** The `ISourceAdapter` interface cleanly decouples ingestion logic. Adding new sources (e.g., `RSSAdapter`, `RemotiveAdapter`, or `CompositeAdapter`) requires implementing a single class without modifying pipeline orchestration or database persistence.
- **Resource Constraints:** Setting up external message brokers introduces setup and deployment overhead for lightweight RSS/REST payloads (< 100 items per run).

The rejected alternative (distributed async queues) is standard for high-throughput enterprise pipelines, but would have added unnecessary infrastructure complexity under time constraints.

---

## 2. One trade-off you made under the time limit, and what you'd do with a real week?

**Trade-off Made:**
I prioritized a single-process ingestion pipeline with in-database fingerprint indexing over an asynchronous worker pool and distributed rate-limiter.

**With a full week, I would:**
1. **Queue Decoupling:** Introduce **BullMQ + Redis** to separate API requests from long-running scraping tasks.
2. **Distributed Rate Limiting:** Implement token-bucket rate limiters per target domain in Redis to coordinate request pacing across multiple worker processes.
3. **Advanced Stealth Fallbacks:** Add a **Playwright stealth browser adapter** with residential proxy rotation as Tier 2 fallback when standard HTTP requests receive Cloudflare/Akamai challenges.
4. **Prometheus Metrics:** Expose Prometheus `/metrics` endpoints tracking HTTP status codes, scraper latency histograms, and deduplication rates over time.

---

## 3. Where did you use AI tools, and what did you personally verify or change afterward?

**AI Usage:**
- Scaffolding Express boilerplate, Mongoose schema definitions, and React Tailwind layout primitives.
- Generating initial unit test stubs for Jest.

**Personal Verification & Manual Engineering (Every line reviewed):**
- **Fingerprinting Logic:** Hand-crafted the SHA-256 string normalizer (`title|company|location`) in `fingerprint.ts` to ensure case insensitivity, whitespace trimming, and zero duplicate DB entries.
- **Error Taxonomy & Retries:** Custom-built `IngestionError` classes (`RateLimitError`, `TransientError`, `PermanentError`) and exponential backoff retry loops with Gaussian jitter in `RSSAdapter.ts`.
- **Data Validation & SSRF Safeguard:** Written custom validator (`validator.ts`) enforcing required fields (`title`, `company`, `url`), sanitizing HTML tags, and verifying HTTP/HTTPS URL protocols to prevent SSRF vulnerabilities.
- **Fallback Architecture:** Designed `CompositeAdapter.ts` to automatically attempt primary RSS feeds and fall back to secondary REST APIs if a source rate-limits or returns zero items.

---

## 4. Technical & Ethical Boundaries (Where We Stop)

- **Public Data Only:** Data is harvested exclusively from public RSS feeds and authorized REST APIs. No paywalls, private APIs, or credential stuffing.
- **Pacing & Concurrency:** Requests use stealth headers (`Sec-Ch-Ua`, `Sec-Fetch-Dest`) and exponential backoff to ensure zero infrastructure disruption to target hosts.
- **Scope Compliance:** The live demo targets low-risk public sources (WeWorkRemotely RSS, Remotive API) to demonstrate end-to-end resilience safely without violating platform ToS.