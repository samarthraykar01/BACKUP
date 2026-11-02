'use client';

import React, { useState } from 'react';
import { ScamCheckResult } from '@/lib/types';
import { ResultCard } from './ResultCard';

interface MessagesScreenProps {
  onReportClick: (target: string, category: string) => void;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ onReportClick }) => {
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ScamCheckResult | null>(null);

  const MAX_CHARS = 2000;

  const sampleMessages = [
    {
      title: '⚡ Electricity Bill Disconnection',
      text: 'Dear consumer, your electricity power will be disconnected tonight at 9:30 PM from the power station because your previous month bill was not updated. Please immediately contact our electricity officer at 9823411209. Thank you.',
    },
    {
      title: '🏦 SBI KYC Blocked Alert',
      text: 'Dear SBI User, your NetBanking account will be blocked today due to expired KYC and missing PAN card linking. Please click here immediately to update your PAN and prevent suspension: http://sbi-pan-kyc.top/verify',
    },
    {
      title: '💼 Part-Time YouTube Job',
      text: 'Hello! Amazon / YouTube global hiring team is recruiting part-time remote reviewers. Earn ₹3,000 to ₹8,000 daily by simply subscribing and liking 5 YouTube videos. No experience needed. Join Telegram: t.me/amazon_task_india',
    },
    {
      title: '📦 FedEx Customs Detention',
      text: 'FedEx Alert: Parcel #FDX-99214 consigned to you has been held by Mumbai Customs due to unpaid clearance duty of ₹1,499. Pay immediately via UPI or legal action will be initiated. Call Customs agent at 022-491288.',
    },
    {
      title: '💰 Pre-Approved Loan Scam',
      text: 'Congratulations! Your pre-approved loan of ₹5,00,000 has been sanctioned with 0% interest for 12 months. To disburse funds to your bank account, please transfer the processing fee of ₹1,999 to loan-desk@okhdfcbank.',
    },
  ];

  const handleRunAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed) {
      setErrorMsg('Please paste or type a message to analyze.');
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setErrorMsg(`Message exceeds character limit of ${MAX_CHARS} characters.`);
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
          category: 'message',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze message.');
      }
      setResult(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Analysis error. Please retry.');
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
            chat_bubble
          </span>
          Fake Message Detector
        </h1>
        <p className="text-xs text-[#6B756D] leading-relaxed">
          Inspect suspicious SMS, WhatsApp, Telegram, or email messages for psychological manipulation, extortion, and phishing patterns.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl border border-[#E5EAE5] p-4 shadow-xs space-y-3">
        <form onSubmit={handleRunAnalysis} className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#191C19]">
              <span>Message Text</span>
              <span
                className={`text-[11px] font-mono ${
                  messageText.length > MAX_CHARS ? 'text-red-500 font-bold' : 'text-[#8E9990]'
                }`}
              >
                {messageText.length} / {MAX_CHARS}
              </span>
            </div>

            <div className="relative">
              <textarea
                rows={5}
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Paste the suspicious SMS, WhatsApp text, or email body here..."
                className="w-full bg-[#F7F9F7] text-sm text-[#191C19] placeholder:text-[#8E9990] p-3 rounded-xl border border-[#E5EAE5] focus:border-[#1DB954] focus:bg-white focus:outline-none transition-all resize-none leading-relaxed"
              />

              {messageText && (
                <button
                  type="button"
                  onClick={() => setMessageText('')}
                  className="absolute top-2.5 right-2.5 p-1 rounded-full bg-white text-[#6B756D] hover:text-[#191C19] border border-[#E5EAE5] transition-colors"
                  title="Clear text"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#D64545] flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !messageText.trim()}
            className="w-full py-3 bg-[#1DB954] hover:bg-[#169C46] disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating Fraud Markers...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  manage_search
                </span>
                <span>Analyze Message</span>
              </>
            )}
          </button>
        </form>

        {/* Realistic Sample Templates */}
        <div className="pt-2 border-t border-[#E5EAE5] space-y-1.5">
          <span className="text-[10px] text-[#8E9990] uppercase tracking-wider font-bold">
            Common Indian Scam Lures (Tap to Test)
          </span>

          <div className="flex flex-col space-y-1.5">
            {sampleMessages.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMessageText(sample.text);
                  setErrorMsg(null);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-[#F7F9F7] hover:bg-[#EDF1ED] border border-[#E5EAE5] transition-all flex items-center justify-between group active:scale-[0.99]"
              >
                <span className="text-xs font-semibold text-[#191C19] group-hover:text-[#169C46] truncate">
                  {sample.title}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#1DB954] shrink-0">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Result */}
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
