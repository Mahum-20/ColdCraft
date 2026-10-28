import React from 'react';
import { X, Key, Cpu, ExternalLink, Info, Check } from 'lucide-react';

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
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Google Gemini API Key Settings</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 space-y-1 text-xs text-indigo-900">
            <div className="flex items-center gap-2 font-bold text-indigo-950">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Where to Get a FREE Google Gemini API Key:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 pt-1 text-indigo-900">
              <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="font-bold underline text-indigo-700">Google AI Studio (aistudio.google.com)</a></li>
              <li>Log in with your Google account.</li>
              <li>Click <strong>"Create API key"</strong> and copy your key (starts with <code className="font-mono font-bold bg-indigo-100 px-1 py-0.5 rounded">AIzaSy...</code>).</li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Your Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
              >
                Get Key on Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="Paste your key here (e.g. AIzaSy...)"
              className="w-full px-3.5 py-2.5 rounded-xl clean-input text-xs font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Keys are kept safely in your local browser session and used for team member discovery & pitch generation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Free Architecture Guarantee</span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
              <li><strong>Team Discovery:</strong> Direct Gemini AI Knowledge Search</li>
              <li><strong>Email Verification:</strong> Python <code className="text-slate-800 font-bold">dnspython</code> & <code className="text-slate-800 font-bold">smtplib</code> (100% Free)</li>
              <li><strong>Link Health:</strong> Real-time HTTP 404 validation</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Key</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
