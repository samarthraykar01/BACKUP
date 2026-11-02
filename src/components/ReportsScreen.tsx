'use client';

import React, { useState } from 'react';
import { CommunityReport, ScamCategory } from '@/lib/types';
import {
  Search,
  Plus,
  ThumbsUp,
  Phone,
  Link2,
  Mail,
  MessageSquare,
  QrCode,
  ShieldAlert,
  User,
  Clock
} from 'lucide-react';

interface ReportsScreenProps {
  reports: CommunityReport[];
  onUpvote: (id: string) => void;
  onOpenReportModal: (target?: string, category?: ScamCategory) => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  reports,
  onUpvote,
  onOpenReportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ScamCategory | 'all'>('all');

  const filterTabs: { id: ScamCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Reports' },
    { id: 'phone', label: 'Phones' },
    { id: 'url', label: 'Links' },
    { id: 'upi', label: 'UPI / QR' },
    { id: 'message', label: 'Messages' },
    { id: 'email', label: 'Emails' },
  ];

  const getCategoryIcon = (category: ScamCategory) => {
    switch (category) {
      case 'phone':
        return Phone;
      case 'url':
        return Link2;
      case 'email':
        return Mail;
      case 'message':
        return MessageSquare;
      case 'upi':
        return QrCode;
    }
  };

  const filteredReports = reports.filter((rep) => {
    const matchesCategory = selectedFilter === 'all' || rep.category === selectedFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      rep.target.toLowerCase().includes(q) ||
      rep.scamType.toLowerCase().includes(q) ||
      rep.description.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-24 space-y-4 animate-in fade-in duration-150">
      {/* Screen Title & Action */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            Community Threat Radar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Crowdsourced scam intelligence. Verified by citizens, protected by SCAM GUARD.
          </p>
        </div>
        <button
          onClick={() => onOpenReportModal()}
          className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Report Scam</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by phone, URL, or keyword..."
          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => {
          const isSelected = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Reports Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
        <span>Showing {filteredReports.length} Active Threat Reports</span>
        <span className="text-[11px] text-emerald-700 font-medium">Auto-Synced</span>
      </div>

      {/* Reports Feed */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700">No matching threat reports</div>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              No community reports found for this query. If you encountered a scam attempt, help protect others by reporting it.
            </p>
            <button
              onClick={() => onOpenReportModal()}
              className="mt-2 py-2 px-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit First Report</span>
            </button>
          </div>
        ) : (
          filteredReports.map((report) => {
            const Icon = getCategoryIcon(report.category);
            return (
              <div
                key={report.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
              >
                {/* Card Top: Category, Status & Upvote */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      {report.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {report.status === 'verified_scam' ? 'Community Flagged' : 'Active Report'}
                    </span>
                  </div>

                  <button
                    onClick={() => onUpvote(report.id)}
                    className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 active:scale-95 border border-slate-200 text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 shadow-2xs transition-all shrink-0"
                    title="Confirm this scam report"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{report.upvotes}</span>
                  </button>
                </div>

                {/* Target & Scam Type */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {report.scamType}
                  </h3>
                  <div className="text-xs font-mono text-red-700 font-semibold break-all mt-0.5 bg-red-50/60 p-1 rounded inline-block">
                    {report.target}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {report.description}
                </p>

                {/* Card Footer: Metadata & Privacy-Safe Reporter */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{report.reporterName || 'Citizen Report'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
