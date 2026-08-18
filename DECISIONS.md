# DECISIONS.md

## 1. Why this ingestion strategy over the obvious alternative?

I chose a **synchronous, in-API ingestion pattern with a Source Adapter interface** over an asynchronous queue (RabbitMQ/BullMQ).

**Why this wins for this assessment:**
- **24-hour constraint:** Setting up RabbitMQ adds ~6 hours of config, debugging, and deployment complexity.
- **Direct signal:** The core logic (fetching, parsing, fingerprint dedupe) is the "hard" part. Keeping it synchronous forces me to write clean, testable service classes without hiding complexity behind a queue.
- **Extensibility:** The `ISourceAdapter` interface means adding Indeed/LinkedIn later is just implementing `fetchAndParse()` for that source. The ingestion pipeline remains unchanged.

The obvious alternative (async queue) is production-standard, but it would sacrifice a polished UI or a working deployment within the time limit. I prioritized an **end-to-end demo** over distributed architecture.

## 2. One trade-off you made under the time limit, and what you'd do with a real week.

**Trade-off:** I omitted a separate worker process and message broker.

**Why it was acceptable:** The RSS feed is lightweight (< 100 jobs per fetch). A synchronous process returns in under 5 seconds, which is fine for an admin trigger.

**With a real week, I would:**
- Introduce **RabbitMQ** to decouple the API from the ingestion workload.
- Implement **exponential backoff** and a Dead Letter Queue for robust retry logic.
- Add **3 more source adapters** (e.g., GitHub Jobs, a mock sandbox, and an XML API) to demonstrate the system's pluggability.
- Add **Prometheus metrics** to track ingestion latency and source health over time.

## 3. Where did you use AI tools, and what did you personally verify or change afterward?

**AI Usage:**
- I used AI (Copilot/ChatGPT) for **boilerplate code generation** (Express setup, Mongoose schema stubs, React component scaffolding).
- I used AI to generate the **SHA-256 fingerprint hashing utility**.

**Personal Verification (Every line reviewed):**
- I **manually re-wrote** the deduplication logic (`fingerprint.ts` and the `IngestionService` loop) to ensure the `findOne` check correctly skips duplicates before saving.
- I **tested the RSS parser** by logging the raw `xml2js` output and adjusted the path accessors (e.g., `item.guid[0]._`) to match the actual StackOverflow feed structure.
- I **verified the UI state** during the loading/error states to ensure the "Trigger" button doesn't double-submit.
- All environment variables and CORS configurations were manually configured in the Render/Vercel dashboards to ensure the live demo connects properly.