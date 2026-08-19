import { useState } from 'react';
import FingerprintSandbox from './FingerprintSandbox';
import IngestionConsole from './IngestionConsole';
import { IngestionRunItem } from '../pages/Dashboard';

interface LandingSectionProps {
  onExploreDashboard: () => void;
  onViewArchitecture: () => void;
  onTriggerIngestion: () => void;
  isIngesting: boolean;
  totalJobs: number;
  dedupeRate: number;
  latestRun?: IngestionRunItem;
}

export default function LandingSection({
  onExploreDashboard,
  onViewArchitecture,
  onTriggerIngestion,
  isIngesting,
  totalJobs,
  dedupeRate,
  latestRun,
}: LandingSectionProps) {
  const [activeDemoTab, setActiveDemoTab] = useState<'console' | 'sandbox' | 'flow'>('console');
  const [activeStage, setActiveStage] = useState(2);

  const pipelineStages = [
    {
      id: 0,
      step: '01',
      title: 'Target Feeds & Adapters',
      tag: 'FETCHING',
      description: 'Connects to public RSS feeds or target portals via modular ISourceAdapter interface with TLS stealth impersonation.',
      code: `const adapter = new RSSAdapter('https://weworkremotely.com/remote-jobs.rss');\nconst rawFeed = await adapter.fetchAndParse();`,
      icon: '📡',
    },
    {
      id: 1,
      step: '02',
      title: 'Data Parsing & Normalization',
      tag: 'PARSING',
      description: 'Extracts job title, company, location, description, and original URL, normalizing whitespace and stripping query noise.',
      code: `const normalizedTitle = item.title[0].trim().toLowerCase();\nconst normalizedCompany = item.company[0].trim().toLowerCase();`,
      icon: '⚙️',
    },
    {
      id: 2,
      step: '03',
      title: 'SHA-256 Fingerprinting',
      tag: 'SECURITY & HASH',
      description: 'Generates a deterministic 64-character SHA-256 hash tuple over title, company, and location string attributes.',
      code: `const payload = \`\${title}|\${company}|\${location}\`;\nconst fingerprint = crypto.createHash('sha256').update(payload).digest('hex');`,
      icon: '🔐',
    },
    {
      id: 3,
      step: '04',
      title: 'Deduplication Check',
      tag: 'FILTERING',
      description: 'Queries MongoDB for existing fingerprint collision before saving. Increments duplicate metrics when detected.',
      code: `const exists = await Job.findOne({ fingerprint });\nif (exists) { metrics.duplicates++; continue; }`,
      icon: '🛡️',
    },
    {
      id: 4,
      step: '05',
      title: 'DB Persistence & Analytics',
      tag: 'STORAGE',
      description: 'Saves new job document and logs IngestionRun execution metrics (fetched, inserted, duplicates, execution time).',
      code: `await Job.create({ ...jobData, fingerprint });\nawait IngestionRun.create({ metrics, status: 'completed' });`,
      icon: '💾',
    },
  ];

  return (
    <div className="space-y-16 py-4 animate-fadeIn">
      
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
        
        {/* Golden Tracked Badge */}
        <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full acdyon-gold-badge shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
          </span>
          AcdyOn JobFlow • Enterprise Ingestion &amp; UI Engine
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.12]">
          Extract Platform Data at Scale.{' '}
          <span className="text-[#1E40FF] dark:text-blue-400 block sm:inline">
            Zero Duplicates.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Engineered with deterministic SHA-256 fingerprint hashing, pluggable source adapters, TLS stealth anti-bot protection, and real-time dashboard analytics.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onExploreDashboard}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold bg-[#1E40FF] hover:bg-[#1937DD] text-white shadow-acdyon-blue hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300"
          >
            <span>Explore Live Dashboard</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            onClick={onViewArchitecture}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 hover:text-[#1E40FF] dark:hover:text-blue-400 hover:border-[#1E40FF]/40 transition-all duration-300 shadow-xs"
          >
            <span>System Architecture</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          <button
            onClick={onTriggerIngestion}
            disabled={isIngesting}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all duration-300"
          >
            {isIngesting ? (
              <span>Ingesting Live Data...</span>
            ) : (
              <>
                <span>⚡ Trigger Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Live Real Data Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6">
          <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-center backdrop-blur-xl shadow-xs transition-transform hover:-translate-y-0.5">
            <div className="text-2xl font-black text-[#1E40FF] dark:text-blue-400">{totalJobs}</div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Processed Jobs</div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-center backdrop-blur-xl shadow-xs transition-transform hover:-translate-y-0.5">
            <div className="text-2xl font-black text-[#D4AF37]">{dedupeRate}%</div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Deduplication Rate</div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-center backdrop-blur-xl shadow-xs transition-transform hover:-translate-y-0.5">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Anti-Bot Uptime</div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-center backdrop-blur-xl shadow-xs transition-transform hover:-translate-y-0.5">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">&lt; 3.5s</div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Ingestion Time</div>
          </div>
        </div>
      </section>

      {/* Part 2 Core Showcase: Interactive Product Demo Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            ✨ Interactive Product Demo
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            See The Platform Engine In Action
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Interact with live developer tools, trigger real-time scraping, and inspect the SHA-256 deduplication hashing engine below.
          </p>
        </div>

        {/* Demo Section Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-300/50 dark:border-slate-700/50">
          <button
            onClick={() => setActiveDemoTab('console')}
            className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center gap-2 ${
              activeDemoTab === 'console'
                ? 'bg-white dark:bg-slate-900 text-[#1E40FF] dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>💻 Live Ingestion Terminal</span>
          </button>

          <button
            onClick={() => setActiveDemoTab('sandbox')}
            className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center gap-2 ${
              activeDemoTab === 'sandbox'
                ? 'bg-white dark:bg-slate-900 text-[#1E40FF] dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🔐 SHA-256 Hashing Lab</span>
          </button>

          <button
            onClick={() => setActiveDemoTab('flow')}
            className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center gap-2 ${
              activeDemoTab === 'flow'
                ? 'bg-white dark:bg-slate-900 text-[#1E40FF] dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>⚙️ Pipeline Architecture</span>
          </button>
        </div>

        {/* Demo Tab Content Rendering */}
        {activeDemoTab === 'console' && (
          <IngestionConsole
            onTriggerIngestion={onTriggerIngestion}
            isIngesting={isIngesting}
            latestRun={latestRun}
          />
        )}

        {activeDemoTab === 'sandbox' && (
          <FingerprintSandbox />
        )}

        {activeDemoTab === 'flow' && (
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-acdyon-card backdrop-blur-xl space-y-8 animate-fadeIn">
            
            {/* Step Nodes Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {pipelineStages.map((s) => {
                const isActive = activeStage === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveStage(s.id)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 relative ${
                      isActive
                        ? 'border-[#1E40FF] bg-blue-50/80 dark:bg-blue-950/40 shadow-md ring-2 ring-[#1E40FF]/20'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{s.icon}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-[#1E40FF] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {s.step}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{s.title}</h4>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-0.5">
                      {s.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Detail & Code Preview Box */}
            <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pipelineStages[activeStage].icon}</span>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Step {pipelineStages[activeStage].step}: {pipelineStages[activeStage].title}
                    </h3>
                    <p className="text-xs text-slate-400">{pipelineStages[activeStage].description}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#1E40FF]/30 border border-[#1E40FF]/50 text-blue-300 font-semibold">
                  Stage {activeStage + 1} of 5
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Execution Logic Snippet:</span>
                  <span className="text-[#D4AF37]">TypeScript / Node.js</span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed">
                  <code>{pipelineStages[activeStage].code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Core Technical Highlights Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            ✨ Technical Excellence
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Designed for Anti-Bot Stealth &amp; Resilience
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-[#1E40FF] dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Anti-Bot Mitigation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Utilizes stealth headers, TLS JA3 cipher matching, user-agent randomization, and Gaussian request timing jitter to prevent IP blocks on protected portals.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/40 text-[#D4AF37] flex items-center justify-center text-2xl font-bold">
              🔐
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">SHA-256 Hashing</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Normalizes job attributes to generate a 64-character hash index. Eliminates duplicate postings even when URLs or tracking query parameters change over time.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
              🔌
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Pluggable Adapters</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Modular <code className="text-[11px] font-mono text-[#1E40FF] dark:text-blue-400">ISourceAdapter</code> interface allows seamless integration of new sources (RSS, REST APIs, JSON-LD scrapers) without changing pipeline code.
            </p>
          </div>

        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#0F172A] rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#D4AF37]">
            ✨ Ready To Test The Dashboard?
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Launch the Live Control Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Explore live job listings, run real-time RSS ingestion triggers, and inspect deduplication metrics on the admin dashboard.
          </p>
          <div className="pt-2">
            <button
              onClick={onExploreDashboard}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold bg-[#1E40FF] hover:bg-[#1937DD] text-white shadow-acdyon-blue hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Go To Live Dashboard</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
