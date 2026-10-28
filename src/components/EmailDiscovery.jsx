import React, { useState } from 'react';

export default function EmailDiscovery({ discoveryData, selectedEmail, onSelectEmail }) {
  const [copiedEmail, setCopiedEmail] = useState(null);

  if (!discoveryData) {
    return (
      <div className="clean-card p-6 text-center space-y-2">
        <h3 className="text-base font-serif font-bold text-[#1c1917]">
          III. Address Matrix & Server Audit
        </h3>
        <p className="text-xs text-[#78716c] max-w-md mx-auto">
          Execute "1. Verify Email Permutations" to run domain MX verification, candidate permutations, and deliverability checks.
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

  return (
    <div className="clean-card p-5 space-y-4">
      {/* Section Header */}
      <div className="border-b border-[#e7e5e4] pb-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2 className="text-base font-serif font-bold text-[#1c1917]">
            III. Address Matrix & Server Audit
          </h2>
          {dns && dns.mx_found && (
            <span className="text-[11px] font-mono text-[#78716c]">
              MX: {dns.mx_records[0]} {is_catch_all ? '[Catch-All Server]' : '[Direct Verification]'}
            </span>
          )}
        </div>
        <p className="text-xs text-[#78716c] mt-1">
          Permutation testing, mail server DNS responses, and confidence scoring.
        </p>
      </div>

      {/* OSINT Footprint Evidence */}
      {osint_evidence && osint_evidence.length > 0 && (
        <div className="p-3 bg-[#f5f4ef] border border-[#e7e5e4] text-xs space-y-1 font-mono text-[#44403c]">
          <div className="font-bold text-[#1c1917]">
            Domain Footprint Records ({osint_evidence.length}):
          </div>
          <ul className="space-y-0.5 text-[11px] pl-2 list-disc list-inside">
            {osint_evidence.map((ev, idx) => (
              <li key={idx} className="truncate">
                {ev}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary Recommended Match */}
      {best_match && (
        <div className="p-3.5 bg-white border border-[#1c1917] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-[#1c1917] text-white">
                Primary Deliverable
              </span>
              <span className="text-xs font-mono font-bold text-[#1c1917]">
                {best_match.confidence_score}% Confidence
              </span>
            </div>
            <div className="text-sm font-mono font-bold text-[#1c1917]">
              {best_match.email}
            </div>
            <div className="text-[11px] text-[#78716c]">
              Formula: {best_match.pattern} ({best_match.description})
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCopy(best_match.email)}
              className="px-2.5 py-1 text-xs font-mono bg-white hover:bg-[#f5f4ef] text-[#1c1917] border border-[#d6d3d1]"
            >
              {copiedEmail === best_match.email ? 'Copied' : 'Copy'}
            </button>

            <button
              type="button"
              onClick={() => onSelectEmail(best_match.email)}
              className={`px-3 py-1 text-xs font-medium ${
                selectedEmail === best_match.email
                  ? 'bg-[#1c1917] text-white'
                  : 'bg-[#f5f4ef] hover:bg-[#e7e5e4] text-[#1c1917] border border-[#d6d3d1]'
              }`}
            >
              {selectedEmail === best_match.email ? 'Selected' : 'Use Address'}
            </button>
          </div>
        </div>
      )}

      {/* Full Permutations Table */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-xs font-mono text-[#78716c]">
          <span>Tested Address Matrix ({candidates ? candidates.length : 0} Candidates)</span>
          <span>Click to select for outreach</span>
        </div>

        <div className="border border-[#e7e5e4] divide-y divide-[#e7e5e4] text-xs">
          {candidates && candidates.map((cand, idx) => {
            const isSelected = selectedEmail === cand.email;

            return (
              <div
                key={idx}
                onClick={() => onSelectEmail(cand.email)}
                className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#f5f4ef] font-semibold' : 'bg-white hover:bg-[#fafaf8]'
                }`}
              >
                <div className="flex items-center gap-3 font-mono text-xs truncate">
                  <span className="text-[10px] text-[#78716c] w-6 shrink-0">
                    {idx + 1}.
                  </span>
                  <span className="truncate text-[#1c1917]">
                    {cand.email}
                  </span>
                  <span className="text-[10px] text-[#78716c] hidden sm:inline">
                    [{cand.pattern}]
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span className="text-[#78716c]">
                    {cand.confidence_score}%
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(cand.email);
                    }}
                    className="px-1.5 py-0.5 text-[10px] text-[#78716c] hover:text-[#1c1917] bg-white border border-[#e7e5e4]"
                  >
                    {copiedEmail === cand.email ? 'Copied' : 'Copy'}
                  </button>
                  <span className={`w-2 h-2 rounded-full inline-block ${
                    cand.deliverable ? 'bg-[#1c1917]' : 'bg-[#d6d3d1]'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
