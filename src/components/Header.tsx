'use client';

import React from 'react';

interface HeaderProps {
  activeTab: string;
  onOpenSafetyTips: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenSafetyTips,
  onOpenNotifications,
  onOpenSettings,
  unreadCount = 2,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#0e0e0e]/95 backdrop-blur-xl border-b border-white/[0.06] pt-safe">
      <div className="h-16 max-w-lg mx-auto px-4 flex items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1db954] to-[#10b981] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(29,185,84,0.3)] shrink-0">
            <div className="w-full h-full bg-[#131313] rounded-[10px] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-[#53e076] fill-icon">
                shield
              </span>
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight truncate leading-none">
                SCAM GUARD
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#1db954]/20 border border-[#1db954]/30 text-[#53e076] text-[9px] font-semibold uppercase tracking-wider">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-[#a1a1aa] truncate leading-tight pt-0.5">
              Spot the Scam. Stay Safe.
            </span>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenSafetyTips}
            aria-label="Safety Guides"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#a1a1aa] hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all"
            title="Safety Guides & Helpline"
          >
            <span className="material-symbols-outlined text-[21px]">
              local_police
            </span>
          </button>

          <button
            onClick={onOpenNotifications}
            aria-label="Scam Alerts"
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#a1a1aa] hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all"
            title="Threat Radar Alerts"
          >
            <span className="material-symbols-outlined text-[21px]">
              notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#1db954] ring-2 ring-[#0e0e0e] animate-pulse" />
            )}
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Settings and Privacy"
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1db954] to-[#53e076] flex items-center justify-center ml-1 shrink-0 active:scale-95 transition-all shadow-sm"
            title="Privacy & Settings"
          >
            <span className="material-symbols-outlined text-[#002108] text-[18px] font-bold">
              settings
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
