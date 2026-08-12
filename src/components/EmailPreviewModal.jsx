import React from 'react';
import { X, Send, Copy, Check } from 'lucide-react';

export default function EmailPreviewModal({ isOpen, onClose, pitch, targetEmail, senderName }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !pitch) return null;

  const handleCopyAll = () => {
    const fullText = `To: ${targetEmail || 'cto@company.com'}\nSubject: ${pitch.subject}\n\n${pitch.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoUrl = `mailto:${targetEmail || ''}?subject=${encodeURIComponent(pitch.subject)}&body=${encodeURIComponent(pitch.body)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Client Topbar */}
        <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
            </div>
            <span className="text-xs font-mono text-slate-500 ml-2 font-medium">Inbox Live Preview</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 space-y-2">
          <div className="text-sm font-bold text-slate-900">
            Subject: <span className="font-mono text-indigo-700">{pitch.subject}</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {(senderName || 'M').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">
                From: <span>{senderName || 'Mahum'}</span> &lt;you@yourdomain.com&gt;
              </div>
              <div className="text-[11px] text-slate-500">
                To: <span className="font-mono font-bold text-slate-700">{targetEmail || 'alex.rivera@scaleflow.io'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6 overflow-y-auto font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-wrap bg-white">
          {pitch.body}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyAll}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Email Payload!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Entire Draft</span>
              </>
            )}
          </button>

          <a
            href={mailtoUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open Desktop Mail App</span>
          </a>
        </div>
      </div>
    </div>
  );
}
