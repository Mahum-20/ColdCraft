import React, { useState } from 'react';

export default function PitchStudio({ 
  pitchData, 
  targetEmail, 
  onPreviewEmail 
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  if (!pitchData || !pitchData.pitches || pitchData.pitches.length === 0) {
    return (
      <div className="clean-card p-6 text-center space-y-2">
        <h3 className="text-base font-serif font-bold text-[#1c1917]">
          IV. Technical Outreach Drafts
        </h3>
        <p className="text-xs text-[#78716c] max-w-md mx-auto">
          Execute "2. Generate Technical Pitches" to draft engineering outreach memos matched to the candidate and problem context.
        </p>
      </div>
    );
  }

  const { extracted_info, pitches } = pitchData;
  const currentPitch = pitches[activeTab] || pitches[0];

  const handleCopySubject = () => {
    navigator.clipboard.writeText(currentPitch.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(currentPitch.body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const content = `# Technical Outreach: ${currentPitch.title}\n\nTo: ${targetEmail || 'cto@company.com'}\nSubject: ${currentPitch.subject}\n\n---\n\n${currentPitch.body}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outreach_memo_${currentPitch.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildMailtoUrl = () => {
    const to = targetEmail || '';
    const subject = encodeURIComponent(currentPitch.subject || '');
    const body = encodeURIComponent(currentPitch.body || '');
    return `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="clean-card p-5 space-y-4">
      {/* Section Header */}
      <div className="border-b border-[#e7e5e4] pb-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-serif font-bold text-[#1c1917]">
              IV. Technical Outreach Drafts
            </h2>
            <p className="text-xs text-[#78716c] mt-0.5">
              Personalized engineering memos addressing identified technical constraints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPreviewEmail(currentPitch)}
              className="px-2.5 py-1 text-xs font-mono text-[#1c1917] bg-white hover:bg-[#f5f4ef] border border-[#d6d3d1]"
            >
              [Reader View]
            </button>

            <a
              href={buildMailtoUrl()}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 text-xs font-mono text-white bg-[#1c1917] hover:bg-[#000000]"
            >
              [Launch Mail Client]
            </a>
          </div>
        </div>

        {/* Extracted Architecture Constraints */}
        {extracted_info && (
          <div className="flex items-baseline gap-2 flex-wrap pt-1 text-xs font-mono text-[#78716c]">
            <span className="uppercase text-[10px]">Identified Constraints:</span>
            {extracted_info.detected_technologies && extracted_info.detected_technologies.map((t, idx) => (
              <span key={idx} className="px-1.5 py-0.2 bg-[#f5f4ef] border border-[#e7e5e4] text-[#44403c] text-[11px]">
                {t}
              </span>
            ))}
            {extracted_info.extracted_pain_point && (
              <span className="text-[#44403c] text-[11px] truncate max-w-xs font-sans">
                | Focus: {extracted_info.extracted_pain_point}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Variation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e7e5e4] pb-2 font-mono text-xs overflow-x-auto">
        {pitches.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-2.5 py-1 transition-colors whitespace-nowrap ${
              activeTab === idx
                ? 'bg-[#1c1917] text-white'
                : 'bg-white hover:bg-[#f5f4ef] text-[#78716c] border border-[#e7e5e4]'
            }`}
          >
            Variant {idx + 1}: {p.title}
          </button>
        ))}
      </div>

      {/* Active Pitch Card */}
      <div className="space-y-3 bg-[#fcfbf9] border border-[#e7e5e4] p-4">
        {/* Subject Bar */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#e7e5e4] pb-2 text-xs">
          <div className="font-mono text-xs">
            <span className="text-[#78716c] uppercase text-[10px] mr-2">Subject:</span>
            <span className="font-bold text-[#1c1917]">{currentPitch.subject}</span>
          </div>
          <button
            type="button"
            onClick={handleCopySubject}
            className="text-[11px] font-mono text-[#78716c] hover:text-[#1c1917] self-end sm:self-auto underline"
          >
            {copiedSubject ? '[Subject Copied]' : '[Copy Subject]'}
          </button>
        </div>

        {/* Message Body */}
        <div className="font-serif text-sm text-[#1c1917] leading-relaxed whitespace-pre-wrap py-2">
          {currentPitch.body}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between border-t border-[#e7e5e4] pt-3 text-xs font-mono">
          <div className="text-[11px] text-[#78716c]">
            Target Address: {targetEmail || 'cto@company.com'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyBody}
              className="px-2.5 py-1 text-xs bg-white hover:bg-[#f5f4ef] text-[#1c1917] border border-[#d6d3d1]"
            >
              {copiedBody ? 'Copied' : 'Copy Text'}
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="px-2.5 py-1 text-xs bg-white hover:bg-[#f5f4ef] text-[#1c1917] border border-[#d6d3d1]"
            >
              Export .md
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
