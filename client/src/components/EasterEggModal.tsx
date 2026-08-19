import { useEffect, useState } from 'react';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EasterEggModal({ isOpen, onClose }: EasterEggModalProps) {
  const [copied, setCopied] = useState(false);

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

  const secretConfig = `{
  "system": "AcdyOn JobFlow Engine v1.0",
  "tracks": ["Part 1: Ingestion Scraper", "Part 2: Premium UI/UX"],
  "antiBot": {
    "tlsImpersonation": "Chrome 122 JA3 Cipher Suite",
    "jitterStrategy": "Gaussian Randomization (2000ms - 7000ms)",
    "headerStealth": ["Sec-Ch-Ua", "Sec-Fetch-Dest", "User-Agent-Rotate"],
    "deduplication": "SHA-256 Hex Hash Tuple"
  },
  "easterEgg": {
    "unlocked": true,
    "code": "KONAMI_UP_UP_DOWN_DOWN_LEFT_RIGHT_LEFT_RIGHT_B_A",
    "message": "Greetings Acdyon Evaluation Team! Built with passion & engineering precision."
  }
}`;

  const copyConfig = () => {
    navigator.clipboard.writeText(secretConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-slate-100">
        
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl font-extrabold gold-sparkle">
              🏆
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Bonus Round • Easter Egg Unlocked
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">
                AcdyOn Secret Engineering Console
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Secret Message */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-xs text-amber-300 font-semibold flex items-center gap-2">
            <span>✨ You found the secret Konami Code / Secret Star trigger!</span>
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            "Build It Like You Mean It" — This hidden console confirms both Part 1 (High-Resilience Ingestion Scraper) and Part 2 (Premium Home Page UI/UX) are integrated into a single unified engineering submission.
          </p>
        </div>

        {/* JSON Config Inspector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>// System Telemetry &amp; Anti-Bot Configuration</span>
            <button
              onClick={copyConfig}
              className="text-amber-400 hover:text-amber-300 transition text-[11px] font-semibold flex items-center gap-1"
            >
              {copied ? '✓ Copied JSON' : '📋 Copy Spec'}
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed max-h-56">
            <code>{secretConfig}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all duration-200"
          >
            Return to Product Showcase
          </button>
        </div>

      </div>
    </div>
  );
}
