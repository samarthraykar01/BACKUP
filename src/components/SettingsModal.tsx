'use client';

import React, { useState } from 'react';
import {
  X,
  Settings,
  Database,
  Trash2,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSupabaseConnected: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isSupabaseConnected,
}) => {
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleClearCache = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 2500);
    } catch (e) {
      console.warn('Local storage clear error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center">
              <Settings className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-none">
                Settings & Threat Engine
              </h2>
              <span className="text-[11px] text-slate-500">
                System Diagnostics & Privacy
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Backend Status Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Backend Infrastructure
            </h3>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    Supabase PostgreSQL Storage
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isSupabaseConnected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSupabaseConnected ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                  />
                  {isSupabaseConnected ? 'Connected' : 'Local Fallback Active'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {isSupabaseConnected
                  ? 'Real-time synchronization with Supabase threat radar database.'
                  : 'Operating in high-availability local fallback mode with pre-seeded threat indicators. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable live cloud database sync.'}
              </p>
            </div>
          </div>

          {/* Engine Parameters */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Heuristic Engine
            </h3>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Deterministic Rule Engine</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                  Enabled
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Heuristic Database Revision</span>
                <span className="font-mono font-medium text-slate-800 text-[11px]">
                  v2026.11-rc1
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">Camera QR Decoder</span>
                <span className="font-semibold text-slate-800 text-[11px]">
                  jsQR 1.4.0 (Client-side)
                </span>
              </div>
            </div>
          </div>

          {/* Data & Privacy Actions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Privacy & Local Data
            </h3>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  SCAM GUARD processes phone numbers, links, and messages without storing personal user identities. No authentication, logins, or payment linkages are required.
                </p>
              </div>

              <button
                onClick={handleClearCache}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 active:scale-98 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Clear Local Device Cache</span>
              </button>

              {clearedNotice && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-center flex items-center justify-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Local cache cleared successfully!</span>
                </div>
              )}
            </div>
          </div>

          {/* App Info */}
          <div className="pt-2 text-center space-y-1">
            <div className="font-bold text-xs text-slate-800">
              SCAM GUARD
            </div>
            <div className="text-[11px] text-slate-500">
              Spot the Scam. Stay Safe. • Mobile-First Security
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-black transition-all"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
