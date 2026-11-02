'use client';

import React, { useState } from 'react';
import { ScamCheckResult, RiskLevel } from '@/lib/types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Check,
  Copy,
  Flag,
  X,
  Shield
} from 'lucide-react';

export interface ResultCardProps {
  result: ScamCheckResult;
  onClose?: () => void;
  onClear?: () => void;
  onReport?: (target: string, category: string) => void;
  onReportClick?: (target: string, category: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onClose,
  onClear,
  onReport,
  onReportClick,
}) => {
  const [copied, setCopied] = useState(false);

  const handleDismiss = onClose || onClear;
  const handleReport = onReportClick || onReport;

  const getRiskConfig = (level: RiskLevel) => {
    switch (level) {
      case 'danger':
        return {
          icon: ShieldAlert,
          title: 'High Risk Scam Alert',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          badgeBg: 'bg-red-100 text-[#D64545] border-red-200',
          scoreBar: 'bg-[#D64545]',
          scoreText: 'text-[#D64545]',
          accent: '#D64545',
        };
      case 'suspicious':
        return {
          icon: AlertTriangle,
          title: 'Suspicious Indicators Found',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-900',
          badgeBg: 'bg-amber-100 text-[#B7791F] border-amber-200',
          scoreBar: 'bg-[#B7791F]',
          scoreText: 'text-[#B7791F]',
          accent: '#B7791F',
        };
      case 'safe':
        return {
          icon: ShieldCheck,
          title: 'No Obvious Threats',
          bgColor: 'bg-[#EAF8EF]',
          borderColor: 'border-[#1DB954]/25',
          textColor: 'text-[#191C19]',
          badgeBg: 'bg-[#EAF8EF] text-[#169C46] border-[#1DB954]/30',
          scoreBar: 'bg-[#1DB954]',
          scoreText: 'text-[#169C46]',
          accent: '#1DB954',
        };
      case 'unknown':
      default:
        return {
          icon: HelpCircle,
          title: 'Neutral / Inconclusive',
          bgColor: 'bg-zinc-50',
          borderColor: 'border-zinc-200',
          textColor: 'text-zinc-900',
          badgeBg: 'bg-zinc-100 text-[#6B756D] border-zinc-200',
          scoreBar: 'bg-zinc-400',
          scoreText: 'text-zinc-600',
          accent: '#6B756D',
        };
    }
  };

  const config = getRiskConfig(result.riskLevel);
  const StatusIcon = config.icon;

  const handleCopy = () => {
    const text = `[SCAM GUARD Check Result]\nTarget: ${result.target}\nCategory: ${result.category.toUpperCase()}\nStatus: ${config.title} (${result.riskScore}% Threat Index)\nGuidance: ${result.recommendedAction}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-[#E5EAE5] rounded-2xl p-4 shadow-sm space-y-4 transition-all animate-in fade-in zoom-in-95 duration-200">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E5EAE5] pb-3">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B756D] px-2 py-0.5 bg-[#F7F9F7] border border-[#E5EAE5] rounded-md">
              {result.category}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.badgeBg}`}
            >
              <StatusIcon className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{config.title}</span>
            </span>
          </div>
          <span className="text-sm font-semibold text-[#191C19] truncate max-w-full mt-1.5 font-mono">
            {result.target}
          </span>
        </div>

        {handleDismiss && (
          <button
            onClick={handleDismiss}
            aria-label="Close result"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#6B756D] hover:text-[#191C19] hover:bg-[#F0F4F0] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Threat Meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#6B756D]">Calculated Threat Index</span>
          <span className={`font-mono font-bold ${config.scoreText}`}>
            {result.riskScore}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#F0F4F0] overflow-hidden p-0.5 border border-[#E5EAE5]">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${config.scoreBar}`}
            style={{ width: `${Math.max(result.riskScore, 6)}%` }}
          />
        </div>
      </div>

      {/* Summary Box */}
      <div className="p-3 rounded-xl bg-[#F7F9F7] border border-[#E5EAE5] space-y-1">
        <div className="text-sm font-bold text-[#191C19]">
          {result.summary}
        </div>
        <p className="text-xs text-[#6B756D] leading-relaxed">
          {result.explanation}
        </p>
      </div>

      {/* Findings Breakdown */}
      {result.findings && result.findings.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#191C19] tracking-wide uppercase">
            Security Findings ({result.findings.length})
          </span>
          <div className="space-y-1.5">
            {result.findings.map((f, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-[#F7F9F7] border border-[#E5EAE5] flex items-start gap-2.5 text-xs"
              >
                <span
                  className={`mt-0.5 shrink-0 ${
                    f.severity === 'high'
                      ? 'text-[#D64545]'
                      : f.severity === 'medium'
                      ? 'text-[#B7791F]'
                      : 'text-[#1DB954]'
                  }`}
                >
                  {f.severity === 'high' ? (
                    <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
                  ) : f.severity === 'medium' ? (
                    <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                  )}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-[#191C19]">{f.title}</span>
                  <span className="text-[11px] text-[#6B756D] leading-snug mt-0.5">
                    {f.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Action */}
      <div className="p-3 rounded-xl bg-[#EAF8EF] border border-[#1DB954]/25 flex items-start gap-2.5 text-xs text-[#169C46]">
        <Shield className="w-4 h-4 shrink-0 mt-0.5 text-[#1DB954] stroke-[2.2]" />
        <div className="flex flex-col">
          <span className="font-bold text-[#191C19] uppercase text-[10px] tracking-wider">
            Recommended Action
          </span>
          <span className="text-xs text-[#191C19]/90 leading-relaxed mt-0.5">
            {result.recommendedAction}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F9F7] hover:bg-[#EDF1ED] text-xs font-semibold text-[#191C19] border border-[#E5EAE5] transition-all active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#169C46]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Share Result'}</span>
        </button>

        {handleReport && (
          <button
            onClick={() => handleReport(result.target, result.category)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-[#D64545] transition-all active:scale-95"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Flag to Community</span>
          </button>
        )}
      </div>
    </div>
  );
};
