'use client';

import React, { useState } from 'react';
import { NavTab } from './BottomNav';
import { ScamCheckResult, CommunityReport, ScamCategory } from '@/lib/types';
import { ResultCard } from './ResultCard';
import {
  Shield,
  Search,
  Phone,
  Link2,
  MessageSquare,
  QrCode,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  PhoneCall,
  Sparkles,
  ThumbsUp
} from 'lucide-react';

interface HomeScreenProps {
  onNavigateTab: (tab: NavTab, prefillCategory?: ScamCategory, prefillTarget?: string) => void;
  onOpenReportModal: (target?: string, category?: ScamCategory) => void;
  onOpenSafetyTips: () => void;
  communityReports: CommunityReport[];
  onUpvoteReport: (id: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onOpenReportModal,
  communityReports,
  onUpvoteReport,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickResult, setQuickResult] = useState<ScamCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleScams = [
    { label: 'Electricity Bill Cutoff', target: '+91 98234 11209', type: 'phone' as ScamCategory },
    { label: 'Banking KYC Phishing', target: 'sbi-pan-update.top', type: 'url' as ScamCategory },
    { label: 'Reverse QR PIN Fraud', target: 'refund-desk@okhdfcbank', type: 'upi' as ScamCategory },
    { label: 'Part-Time Job SMS', target: 'Urgent: Earn ₹4,500/day by liking videos. Pay ₹1,999 to unlock portal.', type: 'message' as ScamCategory },
  ];

  const handleQuickCheck = async (targetToScan?: string, categoryHint?: ScamCategory) => {
    const val = (targetToScan || quickInput).trim();
    if (!val) {
      setErrorMsg('Please enter a phone number, link, message, or UPI ID to check.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    setQuickResult(null);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: val, category: categoryHint }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to analyze input. Please try again.');
      } else {
        setQuickResult(data);
      }
    } catch {
      setErrorMsg('Network error. Unable to reach verification engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof sampleScams[0]) => {
    setQuickInput(sample.target);
    handleQuickCheck(sample.target, sample.type);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-24 space-y-5 animate-in fade-in duration-150">
      {/* Hero Protection Status Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 p-5 text-white shadow-md">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Threat Radar Online
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              Spot the Scam.<br />Stay Safe.
            </h1>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-xs leading-relaxed">
              Verify unknown callers, phishing links, urgent SMS messages, and QR payment codes instantly.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <Shield className="w-7 h-7 text-emerald-300 stroke-[2.2]" />
          </div>
        </div>

        {/* Protection Stats Strip */}
        <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-base font-bold text-white">5-in-1</div>
            <div className="text-[10px] text-emerald-200 uppercase tracking-wide">Multi-Guard</div>
          </div>
          <div>
            <div className="text-base font-bold text-white">&lt;200ms</div>
            <div className="text-[10px] text-emerald-200 uppercase tracking-wide">Heuristic Engine</div>
          </div>
          <div>
            <div className="text-base font-bold text-white">100%</div>
            <div className="text-[10px] text-emerald-200 uppercase tracking-wide">Privacy Safe</div>
          </div>
        </div>
      </div>

      {/* Universal Search & Quick Checker Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="quick-check-input" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-emerald-600" />
            Universal Scam Checker
          </label>
          <span className="text-[11px] text-slate-400 font-medium">Auto-Detects Category</span>
        </div>

        <div className="relative">
          <input
            id="quick-check-input"
            type="text"
            value={quickInput}
            onChange={(e) => {
              setQuickInput(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQuickCheck();
            }}
            placeholder="Paste phone, URL, message, or UPI ID..."
            className="w-full pl-3.5 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
          <button
            onClick={() => handleQuickCheck()}
            disabled={loading}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Check</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <p className="text-xs font-medium text-red-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {errorMsg}
          </p>
        )}

        {/* Quick Sample Scam Pills */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Try a real-world scam example:
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {sampleScams.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-[11px] font-medium border border-slate-200/80 active:scale-95 transition-all shrink-0"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Check Result if available */}
      {quickResult && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <ResultCard
            result={quickResult}
            onReport={(target, cat) => onOpenReportModal(target, cat as ScamCategory)}
            onClear={() => setQuickResult(null)}
          />
        </div>
      )}

      {/* Feature Navigation Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Dedicated Checkers
          </h2>
          <span className="text-[11px] text-slate-400">Mobile Guard Tools</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Phone Checker Card */}
          <button
            onClick={() => onNavigateTab('check', 'phone')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm text-left transition-all group active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
              Phone Checker
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Extortion & robocalls
            </div>
          </button>

          {/* Website Link Checker */}
          <button
            onClick={() => onNavigateTab('check', 'url')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm text-left transition-all group active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Link2 className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
              Link Checker
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Phishing & fake portals
            </div>
          </button>

          {/* QR & UPI Guard */}
          <button
            onClick={() => onNavigateTab('qr-and-pay')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm text-left transition-all group active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
              QR & UPI Guard
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Reverse PIN scams
            </div>
          </button>

          {/* SMS / Message Analyzer */}
          <button
            onClick={() => onNavigateTab('messages')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm text-left transition-all group active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
              Message Analyzer
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Urgency & APK threats
            </div>
          </button>
        </div>
      </div>

      {/* Community Threat Radar Highlights */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Live Threat Radar
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('reports')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {communityReports.slice(0, 3).map((rep) => (
            <div
              key={rep.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px] uppercase">
                    {rep.category}
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {rep.scamType}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-mono mt-0.5 truncate">
                  {rep.target}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                  {rep.description}
                </p>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <button
                  onClick={() => onUpvoteReport(rep.id)}
                  className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs"
                  title="Upvote this scam report"
                >
                  <ThumbsUp className="w-3 h-3 text-slate-500" />
                  <span>{rep.upvotes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onOpenReportModal()}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          <span>Report a New Scam Attempt</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cybercrime Helpline Emergency Card */}
      <div className="rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            National Helpline (India)
          </div>
          <div className="text-lg font-extrabold tracking-tight">
            Dial 1930
          </div>
          <p className="text-[11px] text-red-100">
            Immediate financial freeze within golden hours.
          </p>
        </div>
        <a
          href="tel:1930"
          className="px-3.5 py-2 rounded-xl bg-white text-red-700 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5 fill-red-700" />
          <span>Call 1930</span>
        </a>
      </div>
    </div>
  );
};
