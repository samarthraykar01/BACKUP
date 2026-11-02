'use client';

import React, { useState } from 'react';
import { ScamCheckResult, ScamCategory } from '@/lib/types';
import { ResultCard } from './ResultCard';
import {
  MessageSquare,
  Clipboard,
  X,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

interface MessageScreenProps {
  onOpenReportModal: (target?: string, category?: ScamCategory) => void;
}

export const MessageScreen: React.FC<MessageScreenProps> = ({ onOpenReportModal }) => {
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleMessages = [
    {
      title: 'Electricity Power Cutoff',
      text: 'Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM from the main sub-station because your previous month bill was not updated. Please immediately contact our electricity officer at 9823411209 to pay bill.',
    },
    {
      title: 'Work From Home Job Task',
      text: 'Congratulations! You have been selected for Amazon part-time remote review task. Earn ₹3,000 - ₹8,000 daily just by liking YouTube videos and rating hotels on Google Maps. Contact HR on WhatsApp at wa.me/919312044812 with code AMZ89.',
    },
    {
      title: 'FedEx Customs Parcel Seizure',
      text: 'FedEx Alert: Parcel #FDX-99482 addressed in your name containing suspicious passports, credit cards and illegal narcotics has been seized by Mumbai Customs. A police arrest warrant has been registered under your Aadhaar number. Call customs officer immediately.',
    },
    {
      title: 'SBI PAN YONO Deactivation',
      text: 'Dear Customer, Your State Bank of India YONO netbanking account has been suspended today due to pending PAN card verification. Update your PAN immediately to avoid permanent blocking: https://sbi-pan-update.top/login',
    },
  ];

  const handleAnalyze = async (textToScan?: string) => {
    const text = (textToScan || messageText).trim();
    if (!text) {
      setErrorMsg('Please enter or paste a suspicious message to analyze.');
      return;
    }
    if (text.length > 3000) {
      setErrorMsg('Message exceeds the maximum limit of 3,000 characters.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: text, category: 'message' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to inspect message.');
      } else {
        setResult(data);
      }
    } catch {
      setErrorMsg('Network error. Failed to reach verification engine.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setMessageText(text);
          setErrorMsg('');
        }
      }
    } catch {
      // clipboard access not available or denied
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-24 space-y-4 animate-in fade-in duration-150">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Suspicious Message Analyzer
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan SMS, WhatsApp, and Telegram text for psychological urgency, APK downloads, and extortion patterns.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="message-textarea" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            Message Text
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePaste}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Clipboard className="w-3 h-3" />
              <span>Paste</span>
            </button>
            {messageText && (
              <button
                onClick={() => {
                  setMessageText('');
                  setResult(null);
                  setErrorMsg('');
                }}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-0.5 active:scale-95 transition-all"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <textarea
            id="message-textarea"
            rows={5}
            maxLength={3000}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Paste suspicious SMS, WhatsApp message, email excerpt, or job offer here..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
            <span>Enforced max 3,000 characters</span>
            <span className={messageText.length > 2800 ? 'text-amber-600 font-bold' : ''}>
              {messageText.length} / 3000
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-snug">{errorMsg}</span>
          </div>
        )}

        <button
          onClick={() => handleAnalyze()}
          disabled={loading || !messageText.trim()}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Urgency & Phishing Signals...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4.5 h-4.5" />
              <span>Analyze Message for Scams</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Result */}
      {result && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <ResultCard
            result={result}
            onReport={(target, cat) => onOpenReportModal(target, cat as ScamCategory)}
            onClear={() => setResult(null)}
          />
        </div>
      )}

      {/* Common Scam Templates for Rapid Verification */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Test Known Scam Messages
        </div>

        <div className="grid grid-cols-1 gap-2">
          {sampleMessages.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMessageText(sample.text);
                handleAnalyze(sample.text);
              }}
              className="p-3 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 text-left transition-all active:scale-98 shadow-2xs group"
            >
              <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 flex items-center justify-between">
                <span>{sample.title}</span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Test
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug font-sans">
                {sample.text}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Educational Notice */}
      <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          Privacy Notice
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Message text is analyzed transiently to detect extortion keywords, APK download links, and spoofed domains. Messages are not stored permanently unless you explicitly report them to the community radar.
        </p>
      </div>
    </div>
  );
};
