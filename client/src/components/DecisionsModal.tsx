import { useEffect } from 'react';

interface DecisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DecisionsModal({ isOpen, onClose }: DecisionsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-[#1E40FF] dark:text-blue-400 flex items-center justify-center text-xl font-bold">
              📄
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full acdyon-gold-badge">
                Submission Artifact
              </span>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                DECISIONS.md — Written Technical Explanation
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          
          {/* Question 1 */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1E40FF] dark:text-blue-400 uppercase tracking-wider">
              <span>Question 1</span>
            </div>
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              Why this ingestion strategy over the obvious alternative?
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              I chose a <strong>synchronous, in-API ingestion pattern with a Source Adapter interface</strong> over an asynchronous queue (RabbitMQ/BullMQ).
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400 text-xs">
              <li><strong>Execution constraint:</strong> Setting up external queues adds infrastructure complexity while hiding core ingestion logic behind message brokers.</li>
              <li><strong>Direct signal:</strong> The core challenge (fetching, stealth headers, SHA-256 fingerprint deduplication) is the core engineering task. Synchronous execution allows immediate verification.</li>
              <li><strong>Extensibility:</strong> The <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">ISourceAdapter</code> interface means adding Indeed, LinkedIn, or custom scrapers later is as simple as implementing <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">fetchAndParse()</code>.</li>
            </ul>
          </div>

          {/* Question 2 */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1E40FF] dark:text-blue-400 uppercase tracking-wider">
              <span>Question 2</span>
            </div>
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              One trade-off made under the time limit, and what you'd do with a real week?
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Trade-off:</strong> Omitted a background worker process and distributed message queue for lightweight feeds.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>With a full week, I would:</strong>
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400 text-xs">
              <li>Introduce <strong>BullMQ + Redis</strong> to decouple API endpoints from heavy scraping tasks.</li>
              <li>Implement <strong>exponential backoff retry policies</strong> with Dead Letter Queues (DLQ) for failed scrapers.</li>
              <li>Add <strong>3 additional modular source adapters</strong> (LinkedIn JSON-LD parser, GitHub Jobs API, Playwright stealth browser crawler).</li>
              <li>Add <strong>Prometheus &amp; Grafana metric exporters</strong> to monitor source health and scraper response latencies over time.</li>
            </ul>
          </div>

          {/* Question 3 */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1E40FF] dark:text-blue-400 uppercase tracking-wider">
              <span>Question 3</span>
            </div>
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              Where did you use AI tools, and what did you personally verify or change afterward?
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>AI Usage:</strong> Scaffolding Express boilerplate, Mongoose schemas, and React UI layout primitives.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Personal Verification &amp; Refinements:</strong>
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400 text-xs">
              <li><strong>Fingerprint Logic:</strong> Manually verified and debugged the SHA-256 deduplication pipeline (<code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">fingerprint.ts</code>) to ensure whitespace and title variations produce identical hashes.</li>
              <li><strong>RSS Parsing:</strong> Hand-crafted RSS accessor paths (<code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">item.guid[0]._</code> and WWR title splitting <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">Company: Title</code>) after inspecting raw XML feeds.</li>
              <li><strong>UX State Safety:</strong> Added safe array fallbacks across React Query state hooks to prevent runtime TypeErrors during backend polling.</li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-extrabold bg-[#1E40FF] hover:bg-[#1937DD] text-white shadow-acdyon-blue transition"
          >
            Close Explanation
          </button>
        </div>

      </div>
    </div>
  );
}
