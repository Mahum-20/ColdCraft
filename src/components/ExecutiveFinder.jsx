import React, { useState, useEffect } from 'react';
import { 
  Search, Linkedin, Check, ChevronRight, Users, ExternalLink, ShieldCheck, 
  Sparkles, AlertCircle, Building2, Globe, Crown, Zap, Award, Copy
} from 'lucide-react';
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

  // Sync with parent props if updated from load demo or external form
  useEffect(() => {
    if (companyName) setSearchComp(companyName);
    if (domain) setSearchDom(domain);
  }, [companyName, domain]);

  const runSearch = async (targetComp, targetDom) => {
    const comp = (targetComp || searchComp).trim();
    const dom = (targetDom || searchDom).trim();

    setErrorMsg(null);
    if (!comp) {
      setErrorMsg("Please enter a company name.");
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
      setErrorMsg(err.message || "Failed to search company people.");
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

  // Filter people based on selected category tab
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
    <div className="clean-card rounded-2xl p-5 md:p-6 space-y-4 shadow-sm border border-slate-200/80">
      {/* Title */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Company People & Leadership Finder</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Search any company name & link to discover its Founder, CTO, CEO, and other linked people with their LinkedIn profiles.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1 self-start sm:self-center">
          <Sparkles className="w-3 h-3 text-indigo-600" />
          Multi-Tier OSINT
        </span>
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleFormSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              Company Name *
            </label>
            <input
              type="text"
              value={searchComp}
              onChange={(e) => setSearchComp(e.target.value)}
              placeholder="e.g. Stripe or Linear"
              className="w-full px-3.5 py-2 rounded-xl clean-input text-xs"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              Company Link / Website
            </label>
            <input
              type="text"
              value={searchDom}
              onChange={(e) => setSearchDom(e.target.value)}
              placeholder="e.g. https://stripe.com"
              className="w-full px-3.5 py-2 rounded-xl clean-input text-xs font-mono"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Find People</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Quick Search:</span>
          {QUICK_COMPANIES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleQuickSelect(c.name, c.domain)}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition-all"
            >
              {c.name}
            </button>
          ))}
        </div>
      </form>

      {/* Error Alert */}
      {errorMsg && (
        <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
      )}

      {/* Empty State Notice */}
      {hasSearched && executives && executives.length === 0 && !isLoading && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>No Public Profiles Found for "{searchComp}"</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            We could not extract team members or leadership profiles from public web sources for this company. You can still manually enter the Founder/CTO name in the Target form below.
          </p>
        </div>
      )}

      {/* Discovered Executives List */}
      {executives && executives.length > 0 && (
        <div className="space-y-3 pt-2">
          {/* Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                All People ({executives.length})
              </button>

              {countFounder > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('founder')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    activeFilter === 'founder'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  <span>Founders ({countFounder})</span>
                </button>
              )}

              {countCTO > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('cto')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    activeFilter === 'cto'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>CTO & Tech ({countCTO})</span>
                </button>
              )}

              {countCEO > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('ceo')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    activeFilter === 'ceo'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  <span>CEO ({countCEO})</span>
                </button>
              )}

              {countOther > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('other')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === 'other'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Other ({countOther})
                </button>
              )}
            </div>

            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 self-start sm:self-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified LinkedIn Profiles
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-2.5">
            {filteredExecutives.map((exec, idx) => {
              const isSelected = selectedName === exec.name;
              const isFounder = exec.category === 'Founder' || exec.is_founder;
              const isCTO = exec.category === 'CTO' || exec.is_cto;
              const isCEO = exec.category === 'CEO' || exec.is_ceo;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400 shadow-sm'
                      : isFounder
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                      : isCTO
                      ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300'
                      : isCEO
                      ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Left: Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      
                      <h4 className="text-xs font-bold text-slate-900">
                        {exec.name}
                      </h4>

                      {/* Category Badge */}
                      {isFounder && (
                        <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-emerald-700 text-white flex items-center gap-1 shadow-2xs">
                          <Crown className="w-2.5 h-2.5 text-emerald-200" />
                          Founder / Co-Founder
                        </span>
                      )}

                      {isCTO && (
                        <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-indigo-600 text-white flex items-center gap-1 shadow-2xs">
                          <Zap className="w-2.5 h-2.5 text-indigo-200" />
                          CTO / Tech Lead
                        </span>
                      )}

                      {isCEO && !isFounder && (
                        <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-blue-600 text-white flex items-center gap-1 shadow-2xs">
                          <Award className="w-2.5 h-2.5 text-blue-200" />
                          CEO / President
                        </span>
                      )}

                      {!isFounder && !isCTO && !isCEO && (
                        <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-700">
                          {exec.category || 'Executive'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-800 pl-7">
                      {exec.role}
                    </p>

                    <div className="flex items-center gap-2 pl-7 text-[10px] text-slate-500 flex-wrap">
                      <span>Linked to {searchComp || exec.company || 'Company'}</span>
                      <span>•</span>
                      <span className="text-slate-600">{exec.source || 'Verified Source'}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        LinkedIn Ready
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* LinkedIn Profile Link */}
                    <a
                      href={exec.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
                      title={exec.linkedin_url}
                    >
                      <Linkedin className="w-3.5 h-3.5 fill-current text-white" />
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-3 h-3 text-blue-100" />
                    </a>

                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(exec.linkedin_url, exec.name)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-all"
                      title="Copy LinkedIn URL"
                    >
                      {copiedLink === exec.name ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Select Target Button */}
                    <button
                      type="button"
                      onClick={() => handleSelect(exec)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Target Selected</span>
                        </>
                      ) : (
                        <>
                          <span>Select Target</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </>
                      )}
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
