import { useEffect, useState } from 'react';
import { IngestionRunItem } from '../pages/Dashboard';

interface IngestionConsoleProps {
  onTriggerIngestion: () => void;
  isIngesting: boolean;
  latestRun?: IngestionRunItem;
}

export default function IngestionConsole({
  onTriggerIngestion,
  isIngesting,
  latestRun,
}: IngestionConsoleProps) {
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM_INIT] AcdyOn Ingestion Pipeline Ready.',
    '[ADAPTER_LOAD] Active Source: weworkremotely (RSS Stealth Feed)',
    '[SECURITY] TLS Cipher Impersonation & Gaussian Pacing Active',
  ]);

  useEffect(() => {
    if (isIngesting) {
      setLogs([
        `[${new Date().toLocaleTimeString()}] 🚀 Initiating Ingestion Pipeline for weworkremotely...`,
        `[${new Date().toLocaleTimeString()}] 📡 Establishing HTTP/2 connection to RSS endpoint...`,
        `[${new Date().toLocaleTimeString()}] 🛡️ Applying stealth headers: User-Agent, Accept-Language, Sec-Fetch-Dest`,
        `[${new Date().toLocaleTimeString()}] ⚙️ Parsing RSS feed XML items & extracting raw job data...`,
        `[${new Date().toLocaleTimeString()}] 🔐 Computing 64-character SHA-256 fingerprints for each item...`,
        `[${new Date().toLocaleTimeString()}] 🛡️ Performing MongoDB duplicate checks against existing fingerprint hashes...`,
      ]);
    } else if (latestRun && latestRun.status === 'completed') {
      setLogs((prev) => [
        ...prev.slice(-4),
        `[${new Date().toLocaleTimeString()}] ✅ Ingestion Run Completed! Fetched: ${latestRun.metrics?.fetched || 0}, Inserted: ${latestRun.metrics?.inserted || 0}, Duplicates Filtered: ${latestRun.metrics?.duplicates || 0}`,
        `[${new Date().toLocaleTimeString()}] 💾 IngestionRun execution record persisted to MongoDB. Pipeline idle.`,
      ]);
    }
  }, [isIngesting, latestRun]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      
      {/* Console Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white font-mono">
                jobflow-ingestion-cli ~ live-execution
              </h3>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isIngesting ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {isIngesting ? 'RUNNING PIPELINE' : 'PIPELINE IDLE'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onTriggerIngestion}
          disabled={isIngesting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold bg-[#1E40FF] hover:bg-[#1937DD] text-white shadow-acdyon-blue disabled:opacity-50 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isIngesting ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Ingesting Live Data...</span>
            </>
          ) : (
            <>
              <span>⚡ Trigger Ingestion Run</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Log Streamer Screen */}
      <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 font-mono text-xs text-emerald-400 border border-slate-800 space-y-2 h-44 overflow-y-auto leading-relaxed terminal-glow">
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-slate-600 select-none">&gt;</span>
            <span className={log.includes('✅') ? 'text-emerald-300 font-bold' : log.includes('🚀') ? 'text-blue-300 font-bold' : 'text-emerald-400/90'}>
              {log}
            </span>
          </div>
        ))}
        {isIngesting && (
          <div className="flex items-center gap-2 text-amber-400 animate-pulse pt-1">
            <span className="text-slate-600">&gt;</span>
            <span>[PROCESSING] Querying database for SHA-256 fingerprint collisions...</span>
          </div>
        )}
      </div>

      {/* Live Ingestion Metrics Stats Grid */}
      {latestRun && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center">
            <div className="text-xs font-mono text-slate-400 uppercase">Fetched</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{latestRun.metrics?.fetched || 0}</div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center">
            <div className="text-xs font-mono text-slate-400 uppercase">Inserted</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">+{latestRun.metrics?.inserted || 0}</div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center">
            <div className="text-xs font-mono text-slate-400 uppercase">Duplicates</div>
            <div className="text-xl font-extrabold text-[#D4AF37] mt-0.5">{latestRun.metrics?.duplicates || 0}</div>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center">
            <div className="text-xs font-mono text-slate-400 uppercase">Status</div>
            <div className="text-xs font-extrabold text-emerald-400 mt-2 uppercase">{latestRun.status}</div>
          </div>
        </div>
      )}

    </div>
  );
}
