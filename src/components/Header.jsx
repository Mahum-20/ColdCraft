import React from 'react';

export default function Header({ onOpenSettings, onLoadDemo, isBackendLive }) {
  return (
    <header className="w-full bg-white border-b border-[#e7e5e4] px-4 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand masthead */}
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#1c1917] tracking-tight">
              ColdCraft
            </h1>
            <span className="text-[11px] font-mono text-[#78716c] uppercase tracking-wider">
              [Open Research Edition]
            </span>
          </div>
          <p className="text-xs text-[#78716c]">
            Corporate leadership intelligence, permutation verification, and engineering outreach.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Status Badge */}
          <div className="text-[11px] font-mono text-[#44403c] px-2.5 py-1 bg-[#f5f4ef] border border-[#e7e5e4]">
            {isBackendLive ? 'System: Online' : 'System: Connecting'}
          </div>

          {/* Quick Demo Preset */}
          <button
            type="button"
            onClick={onLoadDemo}
            className="px-3 py-1 text-xs font-medium text-[#1c1917] bg-white hover:bg-[#f5f4ef] border border-[#d6d3d1] transition-colors"
          >
            Load Sample Record
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-3 py-1 text-xs font-medium text-[#1c1917] bg-white hover:bg-[#f5f4ef] border border-[#d6d3d1] transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
    </header>
  );
}
