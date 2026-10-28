import React, { useState, useEffect } from 'react';
import { findLeadership } from '../utils/api';

const QUICK_COMPANIES = [
  { name: 'Stripe', domain: 'stripe.com' },
  { name: 'OpenAI', domain: 'openai.com' },
  { name: 'Vercel', domain: 'vercel.com' },
  { name: 'Linear', domain: 'linear.app' },
  { name: 'Supabase', domain: 'supabase.com' },
  { name: 'ScaleFlow', domain: 'scaleflow.io' }
];

export default function ExecutiveFinder({ companyName, domain, geminiApiKey, onSelectExecutive }) {
  const [searchComp, setSearchComp] = useState(companyName || '');
  const [searchDom, setSearchDom] = useState(domain || '');
  const [executives, setExecutives] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [copiedLink, setCopiedLink] = useState(null);

  useEffect(() => {
    if (companyName) setSearchComp(companyName);
    if (domain) setSearchDom(domain);
  }, [companyName, domain]);

  const runSearch = async (targetComp, targetDom) => {
    const comp = (targetComp || searchComp).trim();
    const dom = (targetDom || searchDom).trim();

    setErrorMsg(null);
    if (!comp) {
      setErrorMsg("Please enter an organization name.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await findLeadership(comp, dom, geminiApiKey);
      const list = res.executives || res.people || [];
      if (res.success && Array.isArray(list)) {
        setExecutives(list);
      } else {
        setExecutives([]);
      }
    } catch (err) {
      setErrorMsg(err.message || "Unable to retrieve records for this query.");
      setExecutives([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    runSearch();
  };

  const handleQuickSelect = (qComp, qDom) => {
    setSearchComp(qComp);
    setSearchDom(qDom);
    runSearch(qComp, qDom);
  };

  const handleSelect = (exec) => {
    setSelectedName(exec.name);
    onSelectExecutive({
      ctoName: exec.name,
      companyName: searchComp || exec.company,
      domain: searchDom,
      linkedinUrl: exec.linkedin_url || ''
    });
  };

  const handleCopyLink = (url, name) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(name);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const filteredExecutives = (executives || []).filter((exec) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'founder') return exec.category === 'Founder' || exec.is_founder;
    if (activeFilter === 'cto') return exec.category === 'CTO' || exec.is_cto;
    if (activeFilter === 'ceo') return exec.category === 'CEO' || exec.is_ceo;
    if (activeFilter === 'other') return exec.category === 'Executive' || (!exec.is_founder && !exec.is_cto && !exec.is_ceo);
    return true;
  });

  const countFounder = (executives || []).filter(e => e.category === 'Founder' || e.is_founder).length;
  const countCTO = (executives || []).filter(e => e.category === 'CTO' || e.is_cto).length;
  const countCEO = (executives || []).filter(e => e.category === 'CEO' || e.is_ceo).length;
  const countOther = (executives || []).filter(e => e.category === 'Executive' || (!e.is_founder && !e.is_cto && !e.is_ceo)).length;

  return (
    <div className="clean-card p-5 space-y-4">
      {/* Section Header */}
      <div className="border-b border-[#e7e5e4] pb-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-serif font-bold text-[#1c1917]">
            I. Organization Personnel Directory
          </h2>
          <span className="text-[11px] font-mono text-[#78716c]">
            [Public Source Lookup]
          </span>
        </div>
        <p className="text-xs text-[#78716c] mt-1">
          Index founders, technical officers, executives, and verified profile references.
        </p>
      </div>

      {/* Query Form */}
      <form onSubmit={handleFormSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-mono uppercase text-[#78716c] mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={searchComp}
              onChange={(e) => setSearchComp(e.target.value)}
              placeholder="e.g. Stripe"
              className="w-full px-3 py-1.5 text-xs clean-input"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-mono uppercase text-[#78716c] mb-1">
              Website / Link
            </label>
            <input
              type="text"
              value={searchDom}
              onChange={(e) => setSearchDom(e.target.value)}
              placeholder="e.g. stripe.com"
              className="w-full px-3 py-1.5 text-xs clean-input font-mono"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-1.5 px-3 bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Querying...' : 'Search Records'}
            </button>
          </div>
        </div>

        {/* Index Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-[#78716c]">
          <span className="font-mono uppercase text-[10px]">Reference Indexes:</span>
          {QUICK_COMPANIES.map((c, i) => (
            <React.Fragment key={c.name}>
              {i > 0 && <span className="text-[#d6d3d1]">/</span>}
              <button
                type="button"
                onClick={() => handleQuickSelect(c.name, c.domain)}
                className="hover:text-[#1c1917] hover:underline transition-colors"
              >
                {c.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-[#f5f4ef] border border-[#d6d3d1] text-xs text-[#1c1917]">
          {errorMsg}
        </div>
      )}

      {/* Empty State */}
      {hasSearched && executives && executives.length === 0 && !isLoading && (
        <div className="p-4 bg-[#f5f4ef] border border-[#e7e5e4] text-xs text-[#44403c] space-y-1">
          <div className="font-semibold text-[#1c1917]">
            No public records indexed for "{searchComp}".
          </div>
          <p className="text-[#78716c]">
            The directory could not extract public biographical entries for this domain. Enter the target name manually in Section II below.
          </p>
        </div>
      )}

      {/* Results Ledger */}
      {executives && executives.length > 0 && (
        <div className="space-y-3 pt-2">
          {/* Filter Bar */}
          <div className="flex items-center justify-between text-xs border-b border-[#e7e5e4] pb-2">
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={activeFilter === 'all' ? 'font-bold text-[#1c1917] underline' : 'text-[#78716c] hover:text-[#1c1917]'}
              >
                All ({executives.length})
              </button>

              {countFounder > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('founder')}
                  className={activeFilter === 'founder' ? 'font-bold text-[#1c1917] underline' : 'text-[#78716c] hover:text-[#1c1917]'}
                >
                  Founders ({countFounder})
                </button>
              )}

              {countCTO > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('cto')}
                  className={activeFilter === 'cto' ? 'font-bold text-[#1c1917] underline' : 'text-[#78716c] hover:text-[#1c1917]'}
                >
                  Technical ({countCTO})
                </button>
              )}

              {countCEO > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('ceo')}
                  className={activeFilter === 'ceo' ? 'font-bold text-[#1c1917] underline' : 'text-[#78716c] hover:text-[#1c1917]'}
                >
                  Executive ({countCEO})
                </button>
              )}

              {countOther > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('other')}
                  className={activeFilter === 'other' ? 'font-bold text-[#1c1917] underline' : 'text-[#78716c] hover:text-[#1c1917]'}
                >
                  Other ({countOther})
                </button>
              )}
            </div>

            <span className="text-[11px] font-mono text-[#78716c]">
              Indexed: {filteredExecutives.length} entries
            </span>
          </div>

          {/* Records Table / List */}
          <div className="divide-y divide-[#e7e5e4] border border-[#e7e5e4]">
            {filteredExecutives.map((exec, idx) => {
              const isSelected = selectedName === exec.name;

              return (
                <div
                  key={idx}
                  className={`p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isSelected ? 'bg-[#f5f4ef]' : 'bg-white hover:bg-[#fafaf8]'
                  }`}
                >
                  {/* Left Metadata */}
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-mono text-[#78716c]">
                        #{idx + 1}
                      </span>
                      <span className="font-serif font-bold text-sm text-[#1c1917]">
                        {exec.name}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-[#f5f4ef] border border-[#e7e5e4] text-[#44403c]">
                        {exec.category || 'Executive'}
                      </span>
                    </div>

                    <div className="text-xs text-[#44403c]">
                      {exec.role}
                    </div>

                    <div className="text-[11px] font-mono text-[#78716c]">
                      Affiliation: {searchComp || exec.company || 'Corporate'} | Source: {exec.source || 'Public Index'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pt-1 sm:pt-0">
                    {/* Direct LinkedIn Profile */}
                    <a
                      href={exec.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-mono text-[#1c1917] hover:text-[#000000] bg-white border border-[#d6d3d1] hover:border-[#1c1917] transition-colors"
                    >
                      [LinkedIn Profile]
                    </a>

                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(exec.linkedin_url, exec.name)}
                      className="px-2 py-1 text-[11px] font-mono text-[#78716c] hover:text-[#1c1917] bg-white border border-[#e7e5e4]"
                    >
                      {copiedLink === exec.name ? 'Copied' : 'Copy'}
                    </button>

                    {/* Select Target */}
                    <button
                      type="button"
                      onClick={() => handleSelect(exec)}
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#1c1917] text-white'
                          : 'bg-[#f5f4ef] hover:bg-[#e7e5e4] text-[#1c1917] border border-[#d6d3d1]'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select Target'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
