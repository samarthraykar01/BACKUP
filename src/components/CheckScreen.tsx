'use client';

import React, { useState } from 'react';
import { ScamCategory, ScamCheckResult } from '@/lib/types';
import { ResultCard } from './ResultCard';

interface CheckScreenProps {
  onReportClick: (target: string, category: string) => void;
}

export const CheckScreen: React.FC<CheckScreenProps> = ({ onReportClick }) => {
  const [activeCategory, setActiveCategory] = useState<'phone' | 'email' | 'url'>('phone');
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ScamCheckResult | null>(null);

  const categories: { id: 'phone' | 'email' | 'url'; label: string; icon: string; placeholder: string; helper: string }[] = [
    {
      id: 'phone',
      label: 'Phone Number',
      icon: 'call',
      placeholder: '+91 98765 43210',
      helper: 'Analyzes telephone syntax, VoIP spoofing patterns, and crowdsourced spam flags.',
    },
    {
      id: 'email',
      label: 'Email Address',
      icon: 'mail',
      placeholder: 'support@bank-security-verify.com',
      helper: 'Detects disposable mail, lookalike phishing domains, and spoofed bank sender headers.',
    },
    {
      id: 'url',
      label: 'Website Link',
      icon: 'link',
      placeholder: 'https://sbi-pan-update.top/login',
      helper: 'Screens for malicious TLDs, SSRF internal IPs, typosquatting, and credential lures.',
    },
  ];

  const currentConfig = categories.find((c) => c.id === activeCategory)!;

  const handleTabChange = (cat: 'phone' | 'email' | 'url') => {
    setActiveCategory(cat);
    setInputVal('');
    setErrorMsg(null);
    setResult(null);
  };

  const handleRunVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setErrorMsg('Please enter an input to check.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: trimmed,
          category: activeCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete scan.');
      }
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleTargets: Record<'phone' | 'email' | 'url', { label: string; val: string }[]> = {
    phone: [
      { label: 'Electricity Scam Caller', val: '+91 98234 11209' },
      { label: 'Toll-Free Bank Impersonator', val: '1800 234 9999' },
      { label: 'Standard Mobile', val: '+91 98765 43210' },
    ],
    email: [
      { label: 'Disposable Burner Mail', val: 'attacker@10minutemail.com' },
      { label: 'SBI Impersonation on Gmail', val: 'sbi.support.team.alert@gmail.com' },
      { label: 'Official Domain', val: 'contact@hdfcbank.com' },
    ],
    url: [
      { label: 'PAN Phishing (.top TLD)', val: 'https://sbi-pan-kyc.top/verify' },
      { label: 'Blocked Internal Host', val: 'http://169.254.169.254/latest' },
      { label: 'Official Portal', val: 'https://onlinesbi.sbi' },
    ],
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 space-y-4 max-w-lg mx-auto">
      {/* Title & Description */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[#53e076] text-[22px]">
            verified_user
          </span>
          Check Anything
        </h1>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          Deep telemetry inspection for numbers, emails, and links before you engage.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex p-1 bg-[#1c1b1b] rounded-xl border border-white/[0.06] gap-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleTabChange(cat.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#131313] text-[#53e076] border border-[#1db954]/30 shadow-sm'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">
                {cat.icon}
              </span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Input Card */}
      <div className="bg-[#1c1b1b] rounded-2xl border border-white/[0.08] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)] space-y-3">
        <form onSubmit={handleRunVerification} className="space-y-3">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-white flex items-center justify-between">
              <span>{currentConfig.label}</span>
              <span className="text-[10px] text-[#71717a]">Private Scan</span>
            </label>

            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#131313] rounded-xl border border-white/[0.06] focus-within:border-[#1db954] transition-all">
              <span className="material-symbols-outlined text-[20px] text-[#53e076] shrink-0">
                {currentConfig.icon}
              </span>
              <input
                type={activeCategory === 'email' ? 'email' : activeCategory === 'url' ? 'url' : 'text'}
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={currentConfig.placeholder}
                className="w-full bg-transparent text-sm text-white placeholder:text-[#71717a] focus:outline-none"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  className="p-1 text-[#a1a1aa] hover:text-white"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-[#71717a] px-1">
              {currentConfig.helper}
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-[#ffb4ab] flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="w-full py-3 bg-[#1db954] hover:bg-[#1aa34a] disabled:opacity-50 disabled:pointer-events-none text-black font-semibold rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Running Algorithmic Security Scan...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  security
                </span>
                <span>Inspect {currentConfig.label}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Chips */}
        <div className="pt-2 border-t border-white/[0.05] space-y-1.5">
          <span className="text-[10px] text-[#71717a] uppercase tracking-wider font-semibold">
            Quick Test Examples
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleTargets[activeCategory].map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputVal(sample.val);
                  setErrorMsg(null);
                }}
                className="px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[11px] text-[#a1a1aa] hover:text-white border border-white/[0.04] transition-all active:scale-95"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <ResultCard
          result={result}
          onClose={() => setResult(null)}
          onReportClick={(target, category) => onReportClick(target, category)}
        />
      )}
    </div>
  );
};
