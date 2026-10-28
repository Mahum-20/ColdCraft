import React, { useState } from 'react';
import { 
  CheckCircle2, AlertCircle, Copy, Check, ShieldCheck, Mail, Server, 
  HelpCircle, Sparkles, Layers, Cpu, Code
} from 'lucide-react';

export default function EmailDiscovery({ discoveryData, selectedEmail, onSelectEmail }) {
  const [copiedEmail, setCopiedEmail] = useState(null);

  if (!discoveryData) {
    return (
      <div className="clean-card rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
          <Mail className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">5-Tier OSINT Engine Ready</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Click <strong>"1. Find & Verify Email"</strong> to trigger Web OSINT, Search Footprinting, GitHub Commit inspection, PGP Key lookup, and MX verification.
        </p>
      </div>
    );
  }

  const { dns, is_catch_all, osint_evidence, candidates, best_match } = discoveryData;

  const handleCopy = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const getTierBadgeStyle = (tierBadge) => {
    if (!tierBadge) return "bg-slate-100 text-slate-600 border-slate-200";
    if (tierBadge.includes("Tier 1")) return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
    if (tierBadge.includes("Tier 2")) return "bg-indigo-100 text-indigo-800 border-indigo-300 font-bold";
    if (tierBadge.includes("Tier 3")) return "bg-purple-100 text-purple-800 border-purple-300 font-bold";
    if (tierBadge.includes("Tier 4")) return "bg-blue-100 text-blue-800 border-blue-300 font-bold";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getConfidenceBadge = (confidence, isCatchAll) => {
    if (confidence >= 85) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{confidence}% High Confidence</span>
        </span>
      );
    } else if (isCatchAll || confidence >= 65) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          <span>{confidence}% {isCatchAll ? 'Catch-All Server' : 'Plausible'}</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>{confidence}% Low</span>
        </span>
      );
    }
  };

  return (
    <div className="clean-card rounded-2xl p-5 md:p-6 space-y-4">
      {/* Header & DNS Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">5-Tier OSINT Email Discovery Results</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential Web Scraping, Search Footprint, GitHub Commits, PGP Keys & MX Verification
          </p>
        </div>

        {/* DNS Badge */}
        {dns && dns.mx_found && (
          <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 text-slate-700">
            <Server className="w-3.5 h-3.5 text-indigo-600" />
            <span className="truncate max-w-[180px]">MX: {dns.mx_records[0]}</span>
            {is_catch_all && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-sans font-semibold">
                Catch-All
              </span>
            )}
          </div>
        )}
      </div>

      {/* OSINT Evidence Box */}
      {osint_evidence && osint_evidence.length > 0 && (
        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1.5 text-xs text-indigo-950">
          <div className="flex items-center gap-1.5 font-bold text-indigo-900">
            <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>5-Tier OSINT Evidence Collected ({osint_evidence.length}):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 font-sans text-[11px]">
            {osint_evidence.map((ev, idx) => (
              <li key={idx}>{ev}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Best Match Highlight Box */}
      {best_match && (
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Top Verified Match</span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 flex items-center gap-2">
              <span>{best_match.email}</span>
            </div>
            <p className="text-xs text-slate-600">{best_match.message}</p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {best_match.tier_badge && (
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase font-mono border ${getTierBadgeStyle(best_match.tier_badge)}`}>
                {best_match.tier_badge}
              </span>
            )}

            {getConfidenceBadge(best_match.confidence, is_catch_all)}
            
            <button
              onClick={() => handleCopy(best_match.email)}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm active:scale-95"
              title="Copy verified email"
            >
              {copiedEmail === best_match.email ? (
                <Check className="w-4 h-4 text-emerald-200" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Candidates List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          All Evaluated Candidates ({candidates?.length || 0})
        </h4>

        <div className="divide-y divide-slate-100 rounded-xl bg-white border border-slate-200 overflow-hidden">
          {candidates && candidates.map((cand, idx) => {
            const isSelected = selectedEmail === cand.email;

            return (
              <div
                key={idx}
                onClick={() => onSelectEmail(cand.email)}
                className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-mono text-slate-600">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {cand.email}
                      </span>

                      {cand.tier_badge && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getTierBadgeStyle(cand.tier_badge)}`}>
                          {cand.tier_badge}
                        </span>
                      )}

                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-600 text-white font-semibold">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Pattern: <strong>{cand.pattern}</strong> • {cand.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {getConfidenceBadge(cand.confidence, cand.is_catch_all)}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(cand.email);
                    }}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Copy email candidate"
                  >
                    {copiedEmail === cand.email ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
