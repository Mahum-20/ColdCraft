import React, { useState } from 'react';

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
    <div className="clean-card p-5 space-y-5">
      {/* Section Header */}
      <div className="border-b border-[#e7e5e4] pb-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-serif font-bold text-[#1c1917]">
            II. Target Officer & Job Context
          </h2>
          <span className="text-[11px] font-mono text-[#78716c]">
            [Input Parameters]
          </span>
        </div>
        <p className="text-xs text-[#78716c] mt-1">
          Specify target parameters and technical bottleneck context to derive deliverable addresses and tailored outreach.
        </p>
      </div>

      {/* Target Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CTO Name */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-[#78716c] mb-1">
            CTO / Executive Name *
          </label>
          <input
            type="text"
            name="ctoName"
            value={formData.ctoName}
            onChange={handleChange}
            placeholder="e.g. Alex Rivera"
            className="w-full px-3 py-1.5 text-xs clean-input"
            required
          />
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-[#78716c] mb-1">
            Company Name *
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. ScaleFlow"
            className="w-full px-3 py-1.5 text-xs clean-input"
            required
          />
        </div>

        {/* Company Domain */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-[#78716c] mb-1">
            Company Domain *
          </label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            onBlur={handleDomainBlur}
            placeholder="e.g. scaleflow.io"
            className="w-full px-3 py-1.5 text-xs clean-input font-mono"
            required
          />
        </div>

        {/* LinkedIn URL */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-[#78716c] mb-1">
            LinkedIn Profile URL (Optional)
          </label>
          <input
            type="url"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/target-profile"
            className="w-full px-3 py-1.5 text-xs clean-input font-mono"
          />
        </div>
      </div>

      {/* Job Description Snippet */}
      <div>
        <label className="block text-[11px] font-mono uppercase text-[#78716c] mb-1">
          Technical Problem Statement / Job Description Snippet *
        </label>
        <textarea
          name="jobSnippet"
          rows={4}
          value={formData.jobSnippet}
          onChange={handleChange}
          placeholder="Paste hiring snippet or architecture context (e.g. 'Struggling with Celery queues backing up during peak traffic hours. Looking for Python/Django engineer to optimize PostgreSQL queries...')"
          className="w-full px-3 py-2 text-xs clean-input font-mono leading-relaxed"
          required
        />
      </div>

      {/* Sender Profile Customizer Toggle */}
      <div className="border-t border-[#e7e5e4] pt-3">
        <button
          type="button"
          onClick={() => setShowSenderSettings(!showSenderSettings)}
          className="text-xs font-mono text-[#44403c] hover:text-[#1c1917] hover:underline"
        >
          {showSenderSettings ? '[-] Hide Sender Details' : `[+] Customize Sender Details (${formData.senderName})`}
        </button>

        {showSenderSettings && (
          <div className="mt-3 p-3 bg-[#f5f4ef] border border-[#e7e5e4] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#78716c] mb-1">
                  Sender Name
                </label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="e.g. Mahum"
                  className="w-full px-2.5 py-1 text-xs clean-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#78716c] mb-1">
                  Credentials / Title
                </label>
                <input
                  type="text"
                  name="senderTitle"
                  value={formData.senderTitle}
                  onChange={handleChange}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-2.5 py-1 text-xs clean-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#78716c] mb-1">
                Technical Focus & Proven Architectures
              </label>
              <input
                type="text"
                name="senderSpecialty"
                value={formData.senderSpecialty}
                onChange={handleChange}
                placeholder="e.g. high-throughput Django/Celery architectures & PostgreSQL optimization"
                className="w-full px-2.5 py-1 text-xs clean-input"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#78716c] mb-1">
                Availability Terms
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g. Available for up to 20 hours/week with zero onboarding lag"
                className="w-full px-2.5 py-1 text-xs clean-input"
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
          className="w-full py-2 px-3 bg-[#292524] hover:bg-[#1c1917] text-white text-xs font-medium transition-colors disabled:opacity-50"
        >
          {isLoadingDiscovery ? 'Computing Permutations...' : '1. Verify Email Permutations'}
        </button>

        <button
          type="button"
          onClick={onGeneratePitches}
          disabled={isLoadingPitch}
          className="w-full py-2 px-3 bg-[#1c1917] hover:bg-[#000000] text-white text-xs font-medium transition-colors disabled:opacity-50"
        >
          {isLoadingPitch ? 'Drafting Variations...' : '2. Generate Technical Pitches'}
        </button>
      </div>
    </div>
  );
}
