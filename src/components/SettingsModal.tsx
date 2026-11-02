'use client';

import React, { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [offlineScanning, setOfflineScanning] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  if (!isOpen) return null;

  const handleClearCache = () => {
    localStorage.clear();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1c1b1b] rounded-t-3xl sm:rounded-3xl border border-white/[0.08] p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#1db954]">
              tune
            </span>
            <h3 className="text-sm font-bold text-white">
              Shield Settings & Privacy
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#a1a1aa] hover:text-white hover:bg-white/[0.08]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Backend & Shield Status */}
        <div className="p-3 bg-[#131313] rounded-xl border border-white/[0.05] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Supabase Cloud Sync</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                isSupabaseConfigured
                  ? 'bg-[#1db954]/15 text-[#53e076] border border-[#1db954]/30'
                  : 'bg-amber-500/15 text-[#f9bc45] border border-amber-500/30'
              }`}
            >
              {isSupabaseConfigured ? 'Connected' : 'Local Fallback Active'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Heuristic Threat Engine</span>
            <span className="text-[#53e076] text-[11px] font-semibold">
              Active v2.4
            </span>
          </div>
        </div>

        {/* Privacy Pledge */}
        <div className="p-3.5 bg-[#1db954]/10 border border-[#1db954]/25 rounded-2xl space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-[#53e076] font-bold text-[11px] uppercase tracking-wide">
            <span className="material-symbols-outlined text-[16px] fill-icon">
              verified_user
            </span>
            <span>Zero-Knowledge Privacy Pledge</span>
          </div>
          <p className="text-[#a1a1aa] text-[11px] leading-relaxed">
            SCAM GUARD never accesses your personal contacts, SMS inbox, banking credentials, PAN, or Aadhaar. All scans are analyzed using privacy-safe local heuristics and anonymous crowdsourced threat radars.
          </p>
        </div>

        {/* Local Storage Clear */}
        <div className="pt-2">
          <button
            onClick={handleClearCache}
            className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs text-[#a1a1aa] hover:text-white font-medium transition-colors"
          >
            {cacheCleared ? 'Local Cache Reset!' : 'Clear Local Scan History & Cache'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium rounded-xl text-xs transition-colors"
        >
          Save & Exit
        </button>
      </div>
    </div>
  );
};
