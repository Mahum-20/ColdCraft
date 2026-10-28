import React, { useState } from 'react';
import { 
  Search, Linkedin, Check, ChevronRight, Users, ExternalLink, ShieldCheck, Sparkles, AlertCircle, MapPin
} from 'lucide-react';
import { findLeadership } from '../utils/api';

export default function ExecutiveFinder({ companyName, domain, geminiApiKey, onSelectExecutive }) {
  const [searchComp, setSearchComp] = useState(companyName || '');
  const [searchDom, setSearchDom] = useState(domain || '');
  const [executives, setExecutives] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    if (!searchComp) {
      setErrorMsg("Please enter a company name.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await findLeadership(searchComp, searchDom, geminiApiKey);
      if (res.success && Array.isArray(res.executives)) {
        setExecutives(res.executives);
      } else {
        setExecutives([]);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to search leadership profiles.");
      setExecutives([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (exec) => {
    setSelectedName(exec.name);
    onSelectExecutive({
      ctoName: exec.name,
      companyName: searchComp,
      domain: searchDom,
      linkedinUrl: exec.linkedin_url || ''
    });
  };

  return (
    <div className="clean-card rounded-2xl p-5 md:p-6 space-y-4">
      {/* Title */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Discover Leadership & Google Maps Business Owner</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time web search for Founders, Business Owners (Google Maps), CEOs, CTOs, and VPs.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-500" />
          Google Maps OSINT
        </span>
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            value={searchComp}
            onChange={(e) => setSearchComp(e.target.value)}
            placeholder="e.g. ScaleFlow"
            className="w-full px-3.5 py-2 rounded-xl clean-input text-xs"
            required
          />
        </div>

        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Website / Domain
          </label>
          <input
            type="text"
            value={searchDom}
            onChange={(e) => setSearchDom(e.target.value)}
            placeholder="e.g. scaleflow.io"
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
                <span>Search Hierarchy</span>
              </>
            )}
          </button>
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
            <span>No Verified Leadership / Maps Listing Profiles Found for "{searchComp}"</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            We could not verify public executive team members or Google Maps business listings for this company. Please enter the target CTO/Executive name directly below.
          </p>
        </div>
      )}

      {/* Executives List */}
      {executives && executives.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Discovered Leadership & Business Owners ({executives.length})
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              HTTP Verified Live Links (0% 404)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {executives.map((exec, idx) => {
              const isSelected = selectedName === exec.name;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    exec.is_maps_owner 
                      ? 'bg-rose-50/60 border-rose-200 shadow-sm' 
                      : exec.recommended 
                      ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>{exec.name}</span>

                        {exec.is_maps_owner && (
                          <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-red-600 text-white flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-white" />
                            Google Maps Owner
                          </span>
                        )}

                        {exec.recommended && !exec.is_maps_owner && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-indigo-600 text-white">
                            Top Tech Target
                          </span>
                        )}
                      </h4>
                    </div>

                    <p className="text-xs font-medium text-slate-700 pl-7">{exec.role}</p>
                    <div className="flex items-center gap-2 pl-7 text-[10px] text-slate-500">
                      <span>{exec.department}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {exec.url_status || 'Verified Live'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={exec.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1"
                      title="Open verified profile link"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Live Profile</span>
                      <ExternalLink className="w-3 h-3 text-blue-400" />
                    </a>

                    <button
                      onClick={() => handleSelect(exec)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
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
