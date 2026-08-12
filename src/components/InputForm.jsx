import React, { useState } from 'react';
import { 
  User, Building2, Globe, Linkedin, FileText, Search, 
  Sparkles, UserCheck, ChevronDown, ChevronUp
} from 'lucide-react';

export default function InputForm({
  formData,
  setFormData,
  onRunEmailFinder,
  onGeneratePitches,
  isLoadingDiscovery,
  isLoadingPitch
}) {
  const [showSenderSettings, setShowSenderSettings] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDomainBlur = () => {
    if (formData.domain) {
      let dom = formData.domain.toLowerCase().trim();
      dom = dom.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      setFormData((prev) => ({ ...prev, domain: dom }));
    }
  };

  return (
    <div className="clean-card rounded-2xl p-5 md:p-6 space-y-5">
      {/* Section Title */}
      <div className="border-b border-slate-100 pb-3.5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">1</span>
            <span>Target CTO & Job Post Context</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in the target company and job details to find verified emails and generate pitches.
          </p>
        </div>
      </div>

      {/* Target Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CTO Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            CTO / VP Name *
          </label>
          <input
            type="text"
            name="ctoName"
            value={formData.ctoName}
            onChange={handleChange}
            placeholder="e.g. Alex Rivera"
            className="w-full px-3.5 py-2 rounded-xl clean-input text-xs"
            required
          />
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Company Name *
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. ScaleFlow"
            className="w-full px-3.5 py-2 rounded-xl clean-input text-xs"
            required
          />
        </div>

        {/* Company Domain */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            Company Domain *
          </label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            onBlur={handleDomainBlur}
            placeholder="e.g. scaleflow.io"
            className="w-full px-3.5 py-2 rounded-xl clean-input text-xs font-mono"
            required
          />
        </div>

        {/* LinkedIn URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Linkedin className="w-3.5 h-3.5 text-blue-600" />
            LinkedIn Profile URL (Optional)
          </label>
          <input
            type="url"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/cto-profile"
            className="w-full px-3.5 py-2 rounded-xl clean-input text-xs font-mono"
          />
        </div>
      </div>

      {/* Job Description Snippet */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Job Description Snippet / Pain Points *
        </label>
        <textarea
          name="jobSnippet"
          rows={4}
          value={formData.jobSnippet}
          onChange={handleChange}
          placeholder="Paste job posting snippet (e.g. 'Struggling with Celery queues backing up during peak traffic hours. Looking for Python/Django engineer to optimize PostgreSQL queries...')"
          className="w-full px-3.5 py-2.5 rounded-xl clean-input text-xs leading-relaxed"
          required
        />
      </div>

      {/* Sender Profile Customizer Toggle */}
      <div className="border-t border-slate-100 pt-3.5">
        <button
          type="button"
          onClick={() => setShowSenderSettings(!showSenderSettings)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-indigo-600 py-1 transition-colors"
        >
          <span className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Customize Your Name & Offer</span>
            <span className="text-[11px] text-slate-400 font-normal">({formData.senderName})</span>
          </span>
          {showSenderSettings ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showSenderSettings && (
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="e.g. Mahum"
                  className="w-full px-3 py-1.5 rounded-lg clean-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Title / Credentials
                </label>
                <input
                  type="text"
                  name="senderTitle"
                  value={formData.senderTitle}
                  onChange={handleChange}
                  placeholder="e.g. CS Gold Medalist & Senior Backend Engineer"
                  className="w-full px-3 py-1.5 rounded-lg clean-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Technical Specialty
              </label>
              <input
                type="text"
                name="senderSpecialty"
                value={formData.senderSpecialty}
                onChange={handleChange}
                placeholder="e.g. high-throughput Django/Celery architectures & PostgreSQL optimization"
                className="w-full px-3 py-1.5 rounded-lg clean-input text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Availability
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g. Available for up to 20 hours/week with zero onboarding lag"
                className="w-full px-3 py-1.5 rounded-lg clean-input text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={onRunEmailFinder}
          disabled={isLoadingDiscovery}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50"
        >
          {isLoadingDiscovery ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying Emails...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-indigo-300" />
              <span>1. Find & Verify Email</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onGeneratePitches}
          disabled={isLoadingPitch}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 active:scale-98 disabled:opacity-50"
        >
          {isLoadingPitch ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Pitches...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>2. Generate Pitch Variations</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
