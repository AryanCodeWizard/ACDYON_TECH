import { useEffect, useState } from 'react';

export default function FingerprintSandbox() {
  const [title, setTitle] = useState('Senior Full Stack Engineer');
  const [company, setCompany] = useState('Stripe');
  const [location, setLocation] = useState('Remote (US/EU)');
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);

  // Compute Web Crypto SHA-256 Hash
  useEffect(() => {
    async function computeHash() {
      const normalizedTitle = title.trim().toLowerCase();
      const normalizedCompany = company.trim().toLowerCase();
      const normalizedLocation = location.trim().toLowerCase();

      const payload = `${normalizedTitle}|${normalizedCompany}|${normalizedLocation}`;
      
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setHash(hashHex);
    }
    computeHash();
  }, [title, company, location]);

  const copyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl relative overflow-hidden">
      
      {/* Decorative Top Accent */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xl font-bold">
            🔐
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
              Interactive Sandbox • Part 1 Core Algorithm
            </div>
            <h3 className="text-base font-extrabold text-white">
              SHA-256 Fingerprint Generator
            </h3>
          </div>
        </div>
        <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
          WebCrypto Live Hashing
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Test the deduplication hashing engine in real-time. Notice how extra spaces, capital letters, or minor formatting changes get normalized into a single <strong>deterministic 64-character SHA-256 hash</strong> to prevent duplicate database entries.
      </p>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Job Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Developer"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E40FF]/50 focus:border-[#1E40FF] transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Company Name
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Stripe"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E40FF]/50 focus:border-[#1E40FF] transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E40FF]/50 focus:border-[#1E40FF] transition"
          />
        </div>
      </div>

      {/* Output Fingerprint Hash Box */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>// Normalized Payload Digest: <strong className="text-slate-300 font-normal">"{title.trim().toLowerCase()}|{company.trim().toLowerCase()}|{location.trim().toLowerCase()}"</strong></span>
          <button
            onClick={copyHash}
            className="text-[#1E40FF] dark:text-blue-400 hover:underline font-semibold text-[11px]"
          >
            {copied ? '✓ Hash Copied' : 'Copy Hash'}
          </button>
        </div>

        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 break-all flex items-center justify-between gap-3">
          <span>{hash || 'Computing hash...'}</span>
          <span className="text-[10px] text-slate-500 shrink-0 font-sans">64 hex chars</span>
        </div>
      </div>

    </div>
  );
}
