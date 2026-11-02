'use client';

import React, { useState } from 'react';
import { ScamCheckResult } from '@/lib/types';
import { ResultCard } from './ResultCard';

interface FraudLinkScreenProps {
  onReportClick: (target: string, category: string) => void;
}

export const FraudLinkScreen: React.FC<FraudLinkScreenProps> = ({ onReportClick }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ScamCheckResult | null>(null);

  const sampleLinks = [
    { label: 'SBI KYC Phishing (.top TLD)', url: 'https://sbi-pan-kyc.top/verify' },
    { label: 'Paytm KYC Harvest Domain', url: 'https://paytm-kyc-update.xyz/login' },
    { label: 'Blocked Cloud Metadata (SSRF)', url: 'http://169.254.169.254/latest' },
    { label: 'Official Legitimate Portal', url: 'https://onlinesbi.sbi' },
  ];

  const handleCheckUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a website link to analyze.');
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
          category: 'url',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to inspect link.');
      }
      setResult(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Inspection failed. Please retry.');
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
            link
          </span>
          Fraud Link Detector
        </h1>
        <p className="text-xs text-[#6B756D] leading-relaxed">
          Inspect suspicious URLs for brand typosquatting, credential harvesters, and malicious domain extensions.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-[#E5EAE5] p-4 shadow-xs space-y-3">
        <form onSubmit={handleCheckUrl} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#191C19] flex justify-between">
              <span>Website URL</span>
              <span className="text-[10px] text-[#8E9990]">HTTP / HTTPS only</span>
            </label>

            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5EAE5] focus-within:border-[#1DB954] focus-within:bg-white transition-all">
              <span className="material-symbols-outlined text-[19px] text-[#6B756D]">
                public
              </span>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="https://sbi-pan-kyc.top/login"
                className="w-full bg-transparent text-sm text-[#191C19] placeholder:text-[#8E9990] focus:outline-none font-mono"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput('')}
                  className="text-[#6B756D] hover:text-[#191C19] p-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-[#6B756D]">
              Safely screens domain heuristics without executing malicious client-side JavaScript or blind downloads.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#D64545] flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !urlInput.trim()}
            className="w-full py-3 bg-[#1DB954] hover:bg-[#169C46] text-white font-semibold rounded-xl text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Screening Domain Infrastructure...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  security
                </span>
                <span>Inspect Web Link</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Samples */}
        <div className="pt-2 border-t border-[#E5EAE5] space-y-1.5">
          <span className="text-[10px] text-[#8E9990] uppercase tracking-wider font-bold">
            Test Known Patterns
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleLinks.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrlInput(s.url);
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
