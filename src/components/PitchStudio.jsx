import React, { useState } from 'react';
import { 
  Sparkles, Copy, Check, Download, Eye, Send, 
  ShieldCheck, Tag
} from 'lucide-react';

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
      <div className="clean-card rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No Pitch Variations Generated Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Click <strong>"2. Generate Pitch Variations"</strong> to create outreach emails tailored to the target pain points.
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
    const content = `# Pitch Variation: ${currentPitch.title}\n\n**To:** ${targetEmail || 'cto@company.com'}\n**Subject:** ${currentPitch.subject}\n\n---\n\n${currentPitch.body}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cold_pitch_${currentPitch.id}.md`;
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
    <div className="clean-card rounded-2xl p-5 md:p-6 space-y-4">
      {/* Header & Extracted Pain Points */}
      <div className="space-y-3 border-b border-slate-100 pb-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Outreach Email Pitch Generator</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              4 Personalized outreach variations targeting extracted technical bottlenecks.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPreviewEmail(currentPitch)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Inbox Preview</span>
            </button>

            <a
              href={buildMailtoUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open Mail App</span>
            </a>
          </div>
        </div>

        {/* Extracted Tech Tags */}
        {extracted_info && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" /> Extracted Context:
            </span>
            {extracted_info.tech_stack?.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                {tag}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
              ⚡ {extracted_info.primary_pain_point}
            </span>
          </div>
        )}
      </div>

      {/* Variation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
        {pitches.map((p, idx) => (
          <button
            key={p.id || idx}
            onClick={() => setActiveTab(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === idx
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Active Pitch Cards */}
      <div className="space-y-3">
        {/* Subject Line Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Subject Line
            </label>
            <div className="flex items-center gap-2">
              {currentPitch.spam_analysis && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Deliverability Score: {currentPitch.spam_analysis.deliverability_score}/100
                </span>
              )}
              <button
                onClick={handleCopySubject}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                title="Copy subject line"
              >
                {copiedSubject ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200 select-all">
            {currentPitch.subject}
          </div>
        </div>

        {/* Email Body Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Email Pitch Text
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadMarkdown}
                className="text-xs text-slate-500 hover:text-slate-800 p-1 hover:bg-slate-200 rounded transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .md</span>
              </button>

              <button
                onClick={handleCopyBody}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold transition-all"
              >
                {copiedBody ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied Body!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Body</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <textarea
            rows={9}
            readOnly
            value={currentPitch.body}
            className="w-full p-3 rounded-lg clean-input text-xs leading-relaxed text-slate-800 font-sans resize-none"
          />
        </div>
      </div>
    </div>
  );
}
