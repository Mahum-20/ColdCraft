import React from 'react';

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey }) {
  const [localKey, setLocalKey] = React.useState(apiKey || '');
  const [saved, setSaved] = React.useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(localKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-lg bg-white border border-[#1c1917] overflow-hidden flex flex-col shadow-lg">
        {/* Header */}
        <div className="px-5 py-3 bg-[#f5f4ef] border-b border-[#e7e5e4] flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase font-bold text-[#1c1917]">
            System Configuration: Intelligence API Key
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-[#78716c] hover:text-[#1c1917] px-1.5 py-0.5 bg-white border border-[#e7e5e4]"
          >
            [Close Esc]
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-[#f5f4ef] border border-[#e7e5e4] space-y-1.5 text-[#44403c]">
            <div className="font-bold text-[#1c1917] font-mono text-[11px] uppercase">
              Key Provisioning Note:
            </div>
            <p className="leading-relaxed">
              An optional Google Gemini key enhances live executive research and pitch customization. A free key may be obtained at{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold text-[#1c1917]"
              >
                aistudio.google.com
              </a>.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase text-[#78716c]">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="Paste key here (e.g. AIzaSy...)"
              className="w-full px-3 py-2 text-xs clean-input font-mono"
            />
            <p className="text-[11px] text-[#78716c]">
              Keys remain stored in your local browser runtime memory only.
            </p>
          </div>

          <div className="p-3 bg-[#fcfbf9] border border-[#e7e5e4] space-y-1 text-[11px] text-[#78716c] font-mono">
            <div className="font-bold text-[#1c1917] uppercase text-[10px]">Architecture Details:</div>
            <div>- Permutations: Standard RFC mail permutations</div>
            <div>- Deliverability: Socket MX checks via dnspython & smtplib</div>
            <div>- Execution: Local environment without external telemetry</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f5f4ef] border-t border-[#e7e5e4] flex items-center justify-end gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-white text-[#78716c] hover:text-[#1c1917] border border-[#e7e5e4]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#1c1917] hover:bg-[#000000] text-white font-medium"
          >
            {saved ? 'Saved' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
