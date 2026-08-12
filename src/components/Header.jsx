import React from 'react';
import { Mail, Settings, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Header({ onOpenSettings, onLoadDemo, isBackendLive }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/90 shadow-sm px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                ColdCraft <span className="text-indigo-600">AI</span>
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wide rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Free
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              CTO Email Permutations & Technical Outreach Pitch Generator
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
            <span className={`w-2 h-2 rounded-full ${isBackendLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="font-mono text-[11px] font-medium">
              {isBackendLive ? 'SMTP Engine Ready' : 'Connecting Engine...'}
            </span>
          </div>

          {/* Quick Demo Preset */}
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all active:scale-95"
            title="Load sample CTO & Job Post data"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Demo Data</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
