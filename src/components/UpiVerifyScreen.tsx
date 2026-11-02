'use client';

import React, { useState } from 'react';
import { ScamCheckResult } from '@/lib/types';
import { ResultCard } from './ResultCard';

interface UpiVerifyScreenProps {
  onReportClick: (target: string, category: string) => void;
}

export const UpiVerifyScreen: React.FC<UpiVerifyScreenProps> = ({ onReportClick }) => {
  const [upiInput, setUpiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ScamCheckResult | null>(null);

  const sampleVpas = [
    { label: 'Fake Refund Desk', vpa: 'refund-desk@okhdfcbank' },
    { label: 'OLX Buyer Verification', vpa: 'buyer-verification@ybl' },
    { label: 'Electricity Disconnection Desk', vpa: 'bescom-bills@paytm' },
    { label: 'Standard Verified VPA', vpa: 'merchant@okaxis' },
  ];

  const handleVerifyUpi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = upiInput.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a UPI ID or VPA to verify.');
      return;
    }

    if (!trimmed.includes('@')) {
      setErrorMsg('Invalid UPI ID format. A valid UPI ID contains "@" (e.g., username@bank).');
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
          category: 'upi',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify UPI recipient.');
      }
      setResult(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Verification failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 space-y-4 max-w-lg mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[#191C19] tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1DB954] text-[22px]">
            alternate_email
          </span>
          UPI Recipient Verification
        </h1>
        <p className="text-xs text-[#6B756D] leading-relaxed">
          Verify Virtual Payment Addresses (VPA) before transferring funds. Screen for reported mule handles and reverse collect scams.
        </p>
      </div>

      {/* Critical PIN Education Banner */}
      <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-[#D64545]">
        <span className="material-symbols-outlined text-[20px] text-[#D64545] shrink-0 mt-0.5 fill-icon">
          report
        </span>
        <div className="flex flex-col">
          <span className="font-bold text-[#191C19] text-[11px] uppercase tracking-wide">
            Golden Rule of UPI
          </span>
          <span className="text-[11px] leading-relaxed mt-0.5 text-[#6B756D]">
            Entering your UPI PIN <strong className="text-[#D64545] font-bold">SENDS</strong> money. You never need to enter your PIN to receive money, cashbacks, or OLX payments!
          </span>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-[#E5EAE5] p-4 shadow-xs space-y-3">
        <form onSubmit={handleVerifyUpi} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#191C19] flex justify-between">
              <span>UPI ID / Virtual Payment Address</span>
              <span className="text-[10px] text-[#8E9990]">e.g. name@bank</span>
            </label>

            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5EAE5] focus-within:border-[#1DB954] focus-within:bg-white transition-all">
              <span className="material-symbols-outlined text-[19px] text-[#6B756D]">
                alternate_email
              </span>
              <input
                type="text"
                value={upiInput}
                onChange={(e) => {
                  setUpiInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="refund-desk@okhdfcbank"
                className="w-full bg-transparent text-sm text-[#191C19] placeholder:text-[#8E9990] focus:outline-none font-mono"
              />
              {upiInput && (
                <button
                  type="button"
                  onClick={() => setUpiInput('')}
                  className="text-[#6B756D] hover:text-[#191C19] p-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#D64545] flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !upiInput.trim()}
            className="w-full py-3 bg-[#1DB954] hover:bg-[#169C46] text-white font-semibold rounded-xl text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking Bank PSP & Blacklists...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  verified_user
                </span>
                <span>Verify UPI Handle</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Samples */}
        <div className="pt-2 border-t border-[#E5EAE5] space-y-1.5">
          <span className="text-[10px] text-[#8E9990] uppercase tracking-wider font-bold">
            Test Common Profiles
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleVpas.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUpiInput(s.vpa);
                  setErrorMsg(null);
                }}
                className="px-2.5 py-1 rounded-full bg-[#F7F9F7] hover:bg-[#EDF1ED] text-[11px] text-[#6B756D] hover:text-[#191C19] border border-[#E5EAE5] transition-all active:scale-95"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <ResultCard
          result={result}
          onClose={() => setResult(null)}
          onReportClick={(target: string, category: string) => onReportClick(target, category)}
        />
      )}
    </div>
  );
};
