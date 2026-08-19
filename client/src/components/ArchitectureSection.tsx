import { useState } from 'react';

export default function ArchitectureSection() {
  const [activeTab, setActiveTab] = useState<'detection' | 'ingestion' | 'resilience' | 'ethics'>('detection');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto py-4">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#D4AF37] px-3.5 py-1 rounded-full acdyon-gold-badge">
          ✨ Part 1 System Design &amp; Anti-Bot Blueprint
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          JobFlow Systems Architecture &amp; Detection Surface
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Comprehensive engineering analysis covering Detection Surface, Ingestion Pacing, Pipeline Resilience, and Ethical Boundaries.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-white/80 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-xs">
        <button
          onClick={() => setActiveTab('detection')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'detection'
              ? 'bg-[#1E40FF] text-white shadow-acdyon-blue'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>🛡️ 1. Detection Surface</span>
        </button>

        <button
          onClick={() => setActiveTab('ingestion')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'ingestion'
              ? 'bg-[#1E40FF] text-white shadow-acdyon-blue'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>📡 2. Ingestion Strategy</span>
        </button>

        <button
          onClick={() => setActiveTab('resilience')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'resilience'
              ? 'bg-[#1E40FF] text-white shadow-acdyon-blue'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>⚙️ 3. Pipeline Resilience</span>
        </button>

        <button
          onClick={() => setActiveTab('ethics')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'ethics'
              ? 'bg-[#1E40FF] text-white shadow-acdyon-blue'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>📜 4. Where We'd Stop</span>
        </button>
      </div>

      {/* Tab Content Cards */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-acdyon-card backdrop-blur-xl space-y-6">
        
        {/* Tab 1: Detection Surface */}
        {activeTab === 'detection' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <span>🛡️ 1. Detection Surface &amp; Anti-Bot Countermeasures</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Protected platforms (LinkedIn, Indeed, Naukri, Wellfound) deploy multi-layer bot detection surfaces to flag automated scrapers:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="text-xs font-extrabold text-[#1E40FF] dark:text-blue-400 uppercase tracking-wider">A. Headless Browser Fingerprinting</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Defenses check for <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">navigator.webdriver === true</code>, missing Chrome plugins, WebGL rendering anomalies, and headless canvas hashes.
                </p>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                  ✓ Countermeasure: Playwright stealth evasions, spoofed GPU vendor string, and patched Chrome CDP runtime.
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="text-xs font-extrabold text-[#1E40FF] dark:text-blue-400 uppercase tracking-wider">B. TLS &amp; JA3 Fingerprinting</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Firewalls inspect TLS Client Hello cipher order and extensions. Standard Node <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">axios</code> request ciphers immediately differ from Chrome TLS signatures.
                </p>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                  ✓ Countermeasure: TLS impersonation headers (<code className="font-mono text-[11px]">curl_cffi</code> / TLS fingerprints matching Chrome 122).
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="text-xs font-extrabold text-[#1E40FF] dark:text-blue-400 uppercase tracking-wider">C. Header Consistency &amp; Client Hints</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Checking for missing browser headers like <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">Sec-Ch-Ua</code>, <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">Sec-Fetch-Dest</code>, and User-Agent matching platform OS.
                </p>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                  ✓ Countermeasure: Dynamic User-Agent &amp; Sec-CH-UA Client Hints header generation.
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="text-xs font-extrabold text-[#1E40FF] dark:text-blue-400 uppercase tracking-wider">D. Behavioral &amp; Timing Patterns</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Detecting fixed polling intervals (e.g. exactly 60.0s requests), zero mouse cursor movement, and instantaneous page navigation.
                </p>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                  ✓ Countermeasure: Gaussian request jitter (2s - 7s random delays) and token-bucket pacing.
                </div>
              </div>
            </div>

            {/* Code Snippet */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-slate-100">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>// Stealth Header Generator Snippet</span>
                <button
                  onClick={() => copyCode(`const getStealthHeaders = () => ({\n  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',\n  'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24"',\n  'Sec-Fetch-Dest': 'document',\n  'Sec-Fetch-Mode': 'navigate',\n});`, 'stealth')}
                  className="text-blue-400 hover:underline"
                >
                  {copiedSnippet === 'stealth' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
                <code>{`const getStealthHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-[#1E40FF]Mode': 'navigate',
});`}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: Ingestion Strategy */}
        {activeTab === 'ingestion' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <span>📡 2. Ingestion Strategy, Pacing &amp; Plan B</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                How JobFlow pulls data continuously while staying under anti-bot radar:
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">A. Token Bucket Pacing</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Enforces per-domain request rate limits (max 5 requests/minute per target host). Requests are padded with normal distribution jitter delays rather than fixed linear timers.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">B. Proxy Pool &amp; Session Management</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Rotates residential IPs per ingestion run with sticky session cookie preservation to mimic authentic multi-page user browsing sessions.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">C. Three-Tier Fallback Plan B Architecture</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-[#1E40FF] block mb-1">Tier 1 (Primary)</span>
                    Direct public RSS / REST API feeds (fastest, lowest risk).
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-[#D4AF37] block mb-1">Tier 2 (Fallback)</span>
                    Stealth headless browser rendering with residential proxies.
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Tier 3 (Plan B)</span>
                    Structured JSON-LD microdata extraction or partner SERP APIs.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Resilience */}
        {activeTab === 'resilience' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <span>⚙️ 3. Pipeline Resilience &amp; Fault Tolerance</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Preventing silent failures when web markup changes or endpoints rate-limit:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">JSON-LD Microdata Fallback</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  When visual CSS selectors drift overnight, the parser extracts raw structured JSON-LD scripts (<code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">&lt;script type="application/ld+json"&gt;</code>) directly.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">SHA-256 Fingerprinting</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Hashes normalized <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">title + company + location</code>. URL parameter changes will never trigger duplicate database entries.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Non-Silent Run Metrics</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every run logs an <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">IngestionRun</code> object recording fetched, inserted, duplicate, and error metrics surfaced in real-time on the UI.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Ethics */}
        {activeTab === 'ethics' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <span>📜 4. Legal, ToS &amp; Ethical Guardrails</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Where we draw the technical and ethical line:
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                <span className="text-lg shrink-0">✅</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Strict Infrastructure Respect:</strong> We enforce concurrency caps and pacing delays to ensure we never hammer target servers or degrade service for legitimate users.
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                <span className="text-lg shrink-0">✅</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Public Listings Only:</strong> Only publicly accessible job postings are collected. We never bypass paywalls, attempt credential stuffing, or harvest private personal data (PII).
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                <span className="text-lg shrink-0">✅</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Challenge Scope Guardrail Compliance:</strong> The live demo targets low-risk public RSS/API sources to demonstrate the ingestion architecture end-to-end safely without violating platform ToS.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
