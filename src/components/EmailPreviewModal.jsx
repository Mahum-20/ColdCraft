import React from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-2xl bg-white border border-[#1c1917] overflow-hidden flex flex-col max-h-[90vh] shadow-lg">
        {/* Topbar */}
        <div className="px-5 py-3 bg-[#f5f4ef] border-b border-[#e7e5e4] flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-[#78716c] font-bold">
            Memorandum Live Preview
          </span>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-[#78716c] hover:text-[#1c1917] px-1.5 py-0.5 bg-white border border-[#e7e5e4]"
          >
            [Close Esc]
          </button>
        </div>

        {/* Email Header */}
        <div className="p-5 border-b border-[#e7e5e4] bg-[#fcfbf9] space-y-2 text-xs">
          <div className="font-mono">
            <span className="text-[#78716c] uppercase text-[10px] mr-2">Subject:</span>
            <span className="font-bold text-[#1c1917]">{pitch.subject}</span>
          </div>

          <div className="font-mono text-[11px] text-[#78716c] space-y-0.5 pt-1 border-t border-[#e7e5e4]">
            <div>From: {senderName || 'Mahum'} &lt;sender@domain.com&gt;</div>
            <div>To: {targetEmail || 'alex.rivera@scaleflow.io'}</div>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6 overflow-y-auto font-serif text-sm text-[#1c1917] leading-relaxed whitespace-pre-wrap bg-white">
          {pitch.body}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#f5f4ef] border-t border-[#e7e5e4] flex items-center justify-between gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={handleCopyAll}
            className="px-3 py-1.5 bg-white hover:bg-[#e7e5e4] text-[#1c1917] border border-[#d6d3d1]"
          >
            {copied ? 'Memo Copied to Clipboard' : 'Copy Full Memo'}
          </button>

          <a
            href={mailtoUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-[#1c1917] hover:bg-[#000000] text-white"
          >
            Launch External Client
          </a>
        </div>
      </div>
    </div>
  );
}
