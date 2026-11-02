'use client';

import React, { useState, useEffect } from 'react';
import { CommunityReport, ScamCategory } from '@/lib/types';

interface ReportsScreenProps {
  prefillTarget?: string;
  prefillCategory?: string;
  onClearPrefill?: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  prefillTarget = '',
  prefillCategory = '',
  onClearPrefill,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'report'>('feed');
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ScamCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  // Form State
  const [formCategory, setFormCategory] = useState<ScamCategory>(
    (prefillCategory as ScamCategory) || 'phone'
  );
  const [formTarget, setFormTarget] = useState(prefillTarget);
  const [formScamType, setFormScamType] = useState('Electricity Bill Extortion');
  const [formDescription, setFormDescription] = useState('');
  const [formReporter, setFormReporter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    if (prefillTarget) {
      setFormTarget(prefillTarget);
      if (prefillCategory && ['phone', 'email', 'url', 'message', 'upi'].includes(prefillCategory)) {
        setFormCategory(prefillCategory as ScamCategory);
      }
      setActiveTab('report');
    }
  }, [prefillTarget, prefillCategory]);

  const loadReports = async () => {
    setIsLoadingFeed(true);
    try {
      const url = new URL('/api/reports', window.location.origin);
      if (selectedCategory !== 'all') {
        url.searchParams.set('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        url.searchParams.set('q', searchQuery.trim());
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.warn('Failed to load reports:', e);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedCategory, searchQuery]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTarget = formTarget.trim();
    const cleanDesc = formDescription.trim();

    if (!cleanTarget) {
      setFormError('Please provide the scammer telephone number, link, or UPI ID.');
      return;
    }
    if (cleanDesc.length < 10) {
      setFormError('Please describe the incident in at least 10 characters.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: cleanTarget,
          category: formCategory,
          scamType: formScamType,
          description: cleanDesc,
          reporterName: formReporter.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      setFormSuccess(true);
      setFormTarget('');
      setFormDescription('');
      if (onClearPrefill) onClearPrefill();
      loadReports();

      setTimeout(() => {
        setFormSuccess(false);
        setActiveTab('feed');
      }, 2000);
    } catch (err: any) {
      setFormError(err.message || 'Submission error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (reportId: string) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId }),
      });
      if (res.ok) {
        const data = await res.json();
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, upvotes: data.upvotes } : r))
        );
      }
    } catch (e) {
      console.warn('Upvote error:', e);
    }
  };

  const scamTypes = [
    'Electricity Bill Extortion',
    'Bank KYC / PAN Suspension',
    'Part-Time Task / Telegram Job',
    'FedEx / Customs Detention',
    'OLX QR Code / PIN Scam',
    'Lottery / KBC Cash Prize',
    'Loan Approval Processing Fee',
    'Police / CBI Video Call Extortion',
    'Other Financial Scam',
  ];

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 space-y-4 max-w-lg mx-auto">
      {/* Title */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[#53e076] text-[22px]">
            flag
          </span>
          Community Scam Radar
        </h1>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          Crowdsourced scam intelligence. Warn fellow citizens and verify emerging fraud patterns.
        </p>
      </div>

      {/* Screen Mode Tabs */}
      <div className="flex p-1 bg-[#1c1b1b] rounded-xl border border-white/[0.06] gap-1">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'feed'
              ? 'bg-[#131313] text-[#53e076] border border-[#1db954]/30 shadow-sm'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">radar</span>
          <span>Threat Radar Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'report'
              ? 'bg-[#131313] text-[#53e076] border border-[#1db954]/30 shadow-sm'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">
            add_circle
          </span>
          <span>Report a Scammer</span>
        </button>
      </div>

      {/* Mode 1: Community Radar Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#1c1b1b] rounded-xl border border-white/[0.06] focus-within:border-[#1db954] transition-all">
            <span className="material-symbols-outlined text-[18px] text-[#71717a]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone number, link, or keyword..."
              className="w-full bg-transparent text-xs text-white placeholder:text-[#71717a] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#a1a1aa] hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {(['all', 'phone', 'url', 'upi', 'email', 'message'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full capitalize shrink-0 font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1db954] text-black font-semibold'
                    : 'bg-[#1c1b1b] text-[#a1a1aa] hover:text-white border border-white/[0.06]'
                }`}
              >
                {cat === 'all' ? 'All Alerts' : cat}
              </button>
            ))}
          </div>

          {/* Feed List */}
          {isLoadingFeed ? (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-2 text-[#a1a1aa]">
              <span className="w-5 h-5 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Connecting to Community Radar...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 bg-[#1c1b1b] rounded-2xl border border-white/[0.06] flex flex-col items-center justify-center text-center space-y-2">
              <span className="material-symbols-outlined text-[32px] text-[#71717a]">
                shield_moon
              </span>
              <span className="text-sm font-semibold text-white">
                No Matching Reports
              </span>
              <span className="text-xs text-[#a1a1aa] max-w-xs">
                No recorded scam alerts match your filter. Be the first to report an incident.
              </span>
              <button
                onClick={() => setActiveTab('report')}
                className="mt-2 px-4 py-2 bg-[#1db954] text-black font-semibold rounded-xl text-xs"
              >
                Report Now
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 bg-[#1c1b1b] rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/[0.06] text-[#a1a1aa]">
                          {report.category}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">
                          {report.scamType}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-[#53e076] truncate mt-1">
                        {report.target}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 border border-red-500/30 text-[#ffb4ab] shrink-0">
                      Scam Flag
                    </span>
                  </div>

                  <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-3">
                    {report.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#71717a] pt-1 border-t border-white/[0.04]">
                    <span>By {report.reporterName || 'Citizen Report'}</span>
                    <button
                      onClick={() => handleUpvote(report.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#53e076] font-medium transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        thumb_up
                      </span>
                      <span>{report.upvotes} Confirmations</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Report a Scammer Form */}
      {activeTab === 'report' && (
        <div className="bg-[#1c1b1b] rounded-2xl border border-white/[0.08] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)] space-y-4">
          <form onSubmit={handleSubmitReport} className="space-y-3.5">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">
                Scam Channel / Category
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['phone', 'upi', 'url', 'email', 'message'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormCategory(c)}
                    className={`py-2 px-1 text-center rounded-xl text-[11px] font-medium capitalize transition-all ${
                      formCategory === c
                        ? 'bg-[#1db954] text-black font-bold'
                        : 'bg-[#131313] text-[#a1a1aa] hover:text-white border border-white/[0.05]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Identifier */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white flex justify-between">
                <span>Scammer Phone, Link, or UPI Address</span>
                <span className="text-[10px] text-[#71717a]">Required</span>
              </label>
              <input
                type="text"
                required
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                placeholder={
                  formCategory === 'phone'
                    ? '+91 98234 11209'
                    : formCategory === 'upi'
                    ? 'scammer@okaxis'
                    : formCategory === 'url'
                    ? 'https://sbi-pan-kyc.top'
                    : formCategory === 'email'
                    ? 'support@fake-bank.xyz'
                    : 'Phone or message subject'
                }
                className="w-full bg-[#131313] text-sm text-white placeholder:text-[#71717a] px-3 py-2.5 rounded-xl border border-white/[0.06] focus:border-[#1db954] focus:outline-none transition-all font-mono"
              />
            </div>

            {/* Scam Type / Classification */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">
                Scam Classification
              </label>
              <select
                value={formScamType}
                onChange={(e) => setFormScamType(e.target.value)}
                className="w-full bg-[#131313] text-sm text-white px-3 py-2.5 rounded-xl border border-white/[0.06] focus:border-[#1db954] focus:outline-none transition-all"
              >
                {scamTypes.map((st, i) => (
                  <option key={i} value={st} className="bg-[#131313] text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-white">
                <span>Incident Description & Modus Operandi</span>
                <span className="text-[10px] text-[#71717a]">
                  {formDescription.length} / 2000
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Explain what the scammer claimed, demanded, or which apps they asked you to download..."
                className="w-full bg-[#131313] text-xs text-white placeholder:text-[#71717a] p-3 rounded-xl border border-white/[0.06] focus:border-[#1db954] focus:outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Reporter Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white flex justify-between">
                <span>Your Name / City (Optional)</span>
                <span className="text-[10px] text-[#71717a]">
                  Never reveals personal contact info
                </span>
              </label>
              <input
                type="text"
                value={formReporter}
                onChange={(e) => setFormReporter(e.target.value)}
                placeholder="e.g. Ramesh, Hyderabad"
                className="w-full bg-[#131313] text-xs text-white placeholder:text-[#71717a] px-3 py-2 rounded-xl border border-white/[0.06] focus:border-[#1db954] focus:outline-none transition-all"
              />
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-[#ffb4ab] flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px]">
                  error
                </span>
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-lg bg-[#1db954]/15 border border-[#1db954]/30 text-xs text-[#53e076] flex items-center gap-2 font-medium">
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                <span>
                  Thank you! Your report has been broadcast to the community radar.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#1db954] hover:bg-[#1aa34a] disabled:opacity-50 text-black font-semibold rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Recording Scam Report...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    send
                  </span>
                  <span>Submit Scam Report</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
