'use client';

import React, { useState } from 'react';
import { ScamCategory, ScamCheckResult } from '@/lib/types';
import { ResultCard } from './ResultCard';

interface HomeScreenProps {
  onNavigateTab: (tab: 'home' | 'check' | 'qr-and-pay' | 'messages' | 'reports') => void;
  onOpenReportModalWithTarget: (target: string, category: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onOpenReportModalWithTarget,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ScamCategory | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScamCheckResult | null>(null);
  const [recentChecks, setRecentChecks] = useState<ScamCheckResult[]>([
    {
      target: '+91 98234 49210',
      category: 'upi',
      riskLevel: 'safe',
      riskScore: 12,
      summary: 'Verified Merchant UPI QR',
      explanation: 'VPA belongs to a standard registered merchant handle. No blacklists or complaints recorded.',
      findings: [
        {
          title: 'Registered NPCI Bank PSP',
          description: 'Payment route processed via authorized Indian banking switch.',
          severity: 'info',
          category: 'Banking',
        },
      ],
      recommendedAction: 'Safe to proceed. Confirm merchant display name at point of sale.',
      communityReportsCount: 0,
      verifiedStatus: 'clean',
      timestamp: '10m ago',
    },
    {
      target: 'Electricity bill pending: Call 98231... tonight to stop disconnection',
      category: 'message',
      riskLevel: 'danger',
      riskScore: 92,
      summary: 'Urgent Electricity Bill Extortion',
      explanation: 'Classic extortion scam claiming power cutoff at 9:30 PM. Legitimate utilities never issue instant disconnection via SMS.',
      findings: [
        {
          title: 'High Pressure Disconnection Threat',
          description: 'Demands immediate contact to personal mobile number.',
          severity: 'high',
          category: 'Extortion',
        },
      ],
      recommendedAction: 'DO NOT CALL. Power companies do not disconnect power via personal mobile callbacks.',
      communityReportsCount: 48,
      verifiedStatus: 'known_malicious',
      timestamp: '2h ago',
    },
    {
      target: 'paytm-kyc-update.top',
      category: 'url',
      riskLevel: 'suspicious',
      riskScore: 68,
      summary: 'Deceptive Phishing Domain',
      explanation: 'Uses brand name "paytm" paired with low-cost disposable TLD (.top) for credential harvesting.',
      findings: [
        {
          title: 'Brand Impersonation',
          description: 'Domain does not belong to One97 Communications / Paytm.',
          severity: 'high',
          category: 'Phishing',
        },
      ],
      recommendedAction: 'Do not open. Never enter OTP or login credentials.',
      communityReportsCount: 19,
      verifiedStatus: 'community_flagged',
      timestamp: 'Yesterday',
    },
  ]);

  const handleRunCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: trimmed,
          category: selectedCategory,
        }),
      });

      if (!res.ok) {
        throw new Error('Verification failed. Please check network connection.');
      }

      const data: ScamCheckResult = await res.json();
      setScanResult(data);

      // Prepend to recent checks
      setRecentChecks((prev) => [data, ...prev.filter((c) => c.target !== data.target).slice(0, 4)]);
    } catch (err: any) {
      console.error('Check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectShortcut = (cat: ScamCategory, prefix = '') => {
    if (cat === 'upi') {
      onNavigateTab('qr-and-pay');
      return;
    }
    if (cat === 'message') {
      onNavigateTab('messages');
      return;
    }

    setSelectedCategory(cat);
    setQuery(prefix);
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 space-y-5 max-w-lg mx-auto">
      {/* 1. Header / Greeting Hero */}
      <div className="flex flex-col space-y-2 pt-1">
        <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-[#1db954]/15 border border-[#1db954]/30 text-[#53e076]">
          <span
            className="material-symbols-outlined text-[16px] text-[#1db954] fill-icon"
          >
            shield_with_heart
          </span>
          <span className="text-xs font-semibold tracking-wide">
            Consumer Protection Active
          </span>
        </div>

        <h1 className="text-[24px] sm:text-[26px] leading-[30px] sm:leading-[32px] font-bold text-white tracking-tight">
          Something look suspicious?
        </h1>

        <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
          Check a number, message, email, link, or QR code before you trust it.
        </p>
      </div>

      {/* 2. Prominent Universal Search Bar */}
      <div className="w-full bg-[#1c1b1b] rounded-2xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)] p-3">
        <form onSubmit={handleRunCheck} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#131313] rounded-xl border border-white/[0.06] focus-within:border-[#1db954] transition-all">
            <span className="material-symbols-outlined text-[22px] text-[#1db954] shrink-0">
              search
            </span>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter phone, email, link, or UPI..."
              className="w-full bg-transparent text-sm text-white placeholder:text-[#71717a] focus:outline-none"
            />

            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-[#a1a1aa] hover:text-white hover:bg-white/[0.08] transition-colors"
                aria-label="Clear input"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
            <div className="flex items-center gap-1.5 text-[#a1a1aa] text-[11px]">
              <span className="material-symbols-outlined text-[15px] text-[#1db954] fill-icon">
                verified
              </span>
              <span>100% private & encrypted scan</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 bg-[#1db954] hover:bg-[#1aa34a] disabled:opacity-50 disabled:pointer-events-none text-black font-semibold rounded-xl text-xs sm:text-sm shadow-sm active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Check Now</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Scan Result (when active) */}
      {scanResult && (
        <ResultCard
          result={scanResult}
          onClose={() => setScanResult(null)}
          onReportClick={(target, category) =>
            onOpenReportModalWithTarget(target, category)
          }
        />
      )}

      {/* 3. Five Compact Quick Shortcuts */}
      <div className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white tracking-wide uppercase">
            Scan by Category
          </span>
          <span className="text-[11px] text-[#a1a1aa]">Tap to start</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {/* 1: Phone */}
          <button
            onClick={() => handleSelectShortcut('phone', '+91 ')}
            className="group flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#1c1b1b] hover:bg-[#252525] border border-white/[0.06] transition-all text-center active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-white/[0.05] flex items-center justify-center group-hover:bg-[#1db954]/20 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-[#53e076] fill-icon">
                call
              </span>
            </div>
            <span className="text-[11px] text-white truncate w-full font-medium">
              Phone
            </span>
          </button>

          {/* 2: Email */}
          <button
            onClick={() => handleSelectShortcut('email', '')}
            className="group flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#1c1b1b] hover:bg-[#252525] border border-white/[0.06] transition-all text-center active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-white/[0.05] flex items-center justify-center group-hover:bg-[#1db954]/20 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-[#53e076] fill-icon">
                mail
              </span>
            </div>
            <span className="text-[11px] text-white truncate w-full font-medium">
              Email
            </span>
          </button>

          {/* 3: Message */}
          <button
            onClick={() => handleSelectShortcut('message', '')}
            className="group flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#1c1b1b] hover:bg-[#252525] border border-white/[0.06] transition-all text-center active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-white/[0.05] flex items-center justify-center group-hover:bg-[#1db954]/20 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-[#53e076] fill-icon">
                chat
              </span>
            </div>
            <span className="text-[11px] text-white truncate w-full font-medium">
              Message
            </span>
          </button>

          {/* 4: Website */}
          <button
            onClick={() => handleSelectShortcut('url', 'https://')}
            className="group flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#1c1b1b] hover:bg-[#252525] border border-white/[0.06] transition-all text-center active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-white/[0.05] flex items-center justify-center group-hover:bg-[#1db954]/20 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-[#53e076] fill-icon">
                link
              </span>
            </div>
            <span className="text-[11px] text-white truncate w-full font-medium">
              Website
            </span>
          </button>

          {/* 5: QR / UPI */}
          <button
            onClick={() => handleSelectShortcut('upi', '')}
            className="group flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#1c1b1b] hover:bg-[#252525] border border-white/[0.06] transition-all text-center active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-[#201f1f] border border-white/[0.05] flex items-center justify-center group-hover:bg-[#1db954]/20 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-[#53e076] fill-icon">
                qr_code_scanner
              </span>
            </div>
            <span className="text-[11px] text-white truncate w-full font-medium">
              QR / UPI
            </span>
          </button>
        </div>
      </div>

      {/* Safety Overview / Device Shield Card */}
      <div className="flex items-center justify-between p-3.5 bg-[#1c1b1b] rounded-2xl border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#131313] text-[#1db954]">
            <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/[0.08]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
              />
              <path
                className="text-[#1db954]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="92, 100"
                strokeLinecap="round"
                strokeWidth="3.2"
              />
            </svg>
            <span className="absolute text-xs font-bold text-white">92</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white leading-tight">
              Your Device Shield
            </span>
            <span className="text-xs text-[#a1a1aa] mt-0.5">
              Real-time payment & link guards on
            </span>
          </div>
        </div>

        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#1db954]/15 border border-[#1db954]/30 text-[#53e076] text-xs font-semibold">
          Optimal
        </span>
      </div>

      {/* 4. Recent Checks Section */}
      <div className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
              Recent Checks
            </h2>
            <span className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] font-semibold text-[#a1a1aa]">
              {recentChecks.length}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('check')}
            className="text-xs text-[#53e076] hover:text-[#1db954] font-semibold transition-colors"
          >
            Check History
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          {recentChecks.map((item, idx) => {
            const isDanger = item.riskLevel === 'danger';
            const isSuspicious = item.riskLevel === 'suspicious';
            const isSafe = item.riskLevel === 'safe';

            return (
              <div
                key={idx}
                onClick={() => setScanResult(item)}
                className="flex items-center justify-between p-3.5 bg-[#1c1b1b] rounded-xl border border-white/[0.06] hover:bg-[#222222] cursor-pointer transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                      isDanger
                        ? 'bg-red-500/15 border-red-500/20 text-[#ef4444]'
                        : isSuspicious
                        ? 'bg-amber-500/15 border-amber-500/20 text-[#f59e0b]'
                        : 'bg-[#1db954]/15 border-[#1db954]/20 text-[#53e076]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {item.category === 'upi'
                        ? 'qr_code_scanner'
                        : item.category === 'message'
                        ? 'chat'
                        : item.category === 'phone'
                        ? 'call'
                        : item.category === 'email'
                        ? 'mail'
                        : 'link'}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-white truncate">
                      {item.target}
                    </span>
                    <span className="text-xs text-[#a1a1aa] truncate">
                      {item.summary}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      isDanger
                        ? 'bg-red-500/15 border-red-500/30 text-[#ffb4ab]'
                        : isSuspicious
                        ? 'bg-amber-500/15 border-amber-500/30 text-[#f9bc45]'
                        : 'bg-[#1db954]/15 border-[#1db954]/30 text-[#53e076]'
                    }`}
                  >
                    {isDanger ? 'Scam' : isSuspicious ? 'Suspicious' : 'Safe'}
                  </span>
                  <span className="text-[10px] text-[#71717a]">
                    {item.timestamp || 'Recent'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Compact Safety Reminder Tip */}
      <div className="p-3.5 bg-[#1c1b1b] rounded-2xl border border-white/[0.06] flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1db954]/15 border border-[#1db954]/30 flex items-center justify-center shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[19px] text-[#53e076] fill-icon">
            lightbulb
          </span>
        </div>
        <div className="flex flex-col space-y-0.5 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Safety Tip</span>
            <span className="text-[10px] text-[#71717a]">Just now</span>
          </div>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Genuine banks and payment apps never ask for your UPI PIN to receive money or cashbacks.
          </p>
        </div>
      </div>

      {/* Ambient Community Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1c1b1b] to-[#222222] border border-white/[0.06] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Community Radar</span>
          <span className="text-xs text-[#a1a1aa]">14,289 scam alerts shared this week</span>
        </div>
        <button
          onClick={() => onNavigateTab('reports')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08] text-xs font-medium transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px] text-[#53e076]">
            add_alert
          </span>
          <span>Report Scam</span>
        </button>
      </div>
    </div>
  );
};
