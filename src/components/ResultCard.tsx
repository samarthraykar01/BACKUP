'use client';

import React, { useState } from 'react';
import { ScamCheckResult, RiskLevel } from '@/lib/types';

interface ResultCardProps {
  result: ScamCheckResult;
  onClose?: () => void;
  onReportClick?: (target: string, category: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onClose,
  onReportClick,
}) => {
  const [copied, setCopied] = useState(false);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'danger':
        return {
          label: 'Critical Scam Risk',
          icon: 'gpp_maybe',
          bg: 'bg-red-500/15',
          border: 'border-red-500/30',
          text: 'text-[#ffb4ab]',
          accent: '#ef4444',
        };
      case 'suspicious':
        return {
          label: 'Suspicious / Caution',
          icon: 'warning',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/30',
          text: 'text-[#f9bc45]',
          accent: '#f59e0b',
        };
      case 'safe':
        return {
          label: 'No Obvious Threats',
          icon: 'verified_user',
          bg: 'bg-[#1db954]/15',
          border: 'border-[#1db954]/30',
          text: 'text-[#53e076]',
          accent: '#1db954',
        };
      case 'unknown':
      default:
        return {
          label: 'Inconclusive / Neutral',
          icon: 'help_outline',
          bg: 'bg-zinc-500/15',
          border: 'border-zinc-500/30',
          text: 'text-zinc-300',
          accent: '#71717a',
        };
    }
  };

  const badge = getRiskBadge(result.riskLevel);

  const handleCopy = () => {
    const text = `[SCAM GUARD Check Result]\nTarget: ${result.target}\nCategory: ${result.category.toUpperCase()}\nStatus: ${badge.label} (Risk Score: ${result.riskScore}/100)\nAdvice: ${result.recommendedAction}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#1c1b1b] border border-white/[0.08] rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)] space-y-4 transition-all animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a1a1aa] px-2 py-0.5 bg-white/[0.06] rounded-md">
              {result.category}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.border} ${badge.text} border`}
            >
              <span className="material-symbols-outlined text-[14px] fill-icon">
                {badge.icon}
              </span>
              {badge.label}
            </span>
          </div>
          <span className="text-sm font-semibold text-white truncate max-w-full mt-1.5 font-mono">
            {result.target}
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close result"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#a1a1aa] hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* Risk Meter Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#a1a1aa]">Calculated Threat Index</span>
          <span
            className="font-mono font-bold"
            style={{ color: badge.accent }}
          >
            {result.riskScore}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#131313] overflow-hidden p-0.5 border border-white/[0.04]">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(result.riskScore, 6)}%`,
              backgroundColor: badge.accent,
            }}
          />
        </div>
      </div>

      {/* Core Summary & Explanation */}
      <div className="p-3 rounded-xl bg-[#131313] border border-white/[0.05] space-y-1">
        <div className="text-sm font-semibold text-white">
          {result.summary}
        </div>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          {result.explanation}
        </p>
      </div>

      {/* Findings Breakdown */}
      {result.findings && result.findings.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-white tracking-wide uppercase">
            Telemetry & Anomaly Findings ({result.findings.length})
          </span>
          <div className="space-y-1.5">
            {result.findings.map((f, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-[#201f1f] border border-white/[0.04] flex items-start gap-2.5 text-xs"
              >
                <span
                  className={`material-symbols-outlined text-[17px] shrink-0 mt-0.5 ${
                    f.severity === 'high'
                      ? 'text-[#ef4444]'
                      : f.severity === 'medium'
                      ? 'text-[#f59e0b]'
                      : 'text-[#1db954]'
                  }`}
                >
                  {f.severity === 'high'
                    ? 'error'
                    : f.severity === 'medium'
                    ? 'warning'
                    : 'info'}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-white">{f.title}</span>
                  <span className="text-[11px] text-[#a1a1aa] leading-snug mt-0.5">
                    {f.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Action Box */}
      <div className="p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/25 flex items-start gap-2.5 text-xs text-[#53e076]">
        <span className="material-symbols-outlined text-[19px] shrink-0 mt-0.5 fill-icon">
          security
        </span>
        <div className="flex flex-col">
          <span className="font-bold text-white uppercase text-[10px] tracking-wider">
            Recommended Safe Action
          </span>
          <span className="text-xs text-white/90 leading-relaxed mt-0.5">
            {result.recommendedAction}
          </span>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-white transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied' : 'Share Result'}</span>
        </button>

        {onReportClick && (
          <button
            onClick={() => onReportClick(result.target, result.category)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-medium text-[#ffb4ab] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">flag</span>
            <span>Report to Community</span>
          </button>
        )}
      </div>
    </div>
  );
};
