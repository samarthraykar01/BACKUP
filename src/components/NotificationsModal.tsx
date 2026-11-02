'use client';

import React from 'react';
import {
  X,
  Bell,
  Clock,
  ArrowRight
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScam: (target: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectScam,
}) => {
  if (!isOpen) return null;

  const alerts = [
    {
      id: 'alt-1',
      title: 'Electricity Bill Cutoff Robocalls Surge',
      severity: 'high',
      time: '35 mins ago',
      description: 'Mass SMS and IVR calls targeting citizens warning that power will be cut off by 9:30 PM tonight. Never call the number or install QuickSupport.',
      sampleTarget: '+91 98234 11209',
    },
    {
      id: 'alt-2',
      title: 'Active Banking Phishing Domain: sbi-pan-update.top',
      severity: 'high',
      time: '2 hours ago',
      description: 'Phishing campaign impersonating State Bank of India YONO portal attempting to harvest internet banking usernames, passwords, and OTPs.',
      sampleTarget: 'sbi-pan-update.top',
    },
    {
      id: 'alt-3',
      title: 'Reverse QR PIN Fraud on Marketplace Sellers',
      severity: 'medium',
      time: '5 hours ago',
      description: 'Scammers posing as buyers on second-hand marketplaces sending QR codes saying "Scan to receive payment". Remember: PIN is never required to receive money.',
      sampleTarget: 'refund-desk@okhdfcbank',
    },
    {
      id: 'alt-4',
      title: 'Part-Time YouTube Like Task Fraud Active',
      severity: 'medium',
      time: '1 day ago',
      description: 'WhatsApp invitations promising ₹4,500/day for liking videos. Victims are subsequently coerced into depositing prepaid funds.',
      sampleTarget: 'careers@amazon-hiring-india.xyz',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-none">
                Active Threat Radar Bulletins
              </h2>
              <span className="text-[11px] text-slate-500">
                Real-Time Scam Pattern Alerts
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    alert.severity === 'high'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {alert.severity === 'high' ? 'High Threat' : 'Advisory'}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{alert.time}</span>
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  {alert.title}
                </h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {alert.description}
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                  Indicator: {alert.sampleTarget}
                </span>
                <button
                  onClick={() => {
                    onSelectScam(alert.sampleTarget);
                    onClose();
                  }}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 active:scale-95 transition-all"
                >
                  <span>Verify Indicator</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-black transition-all"
          >
            Dismiss Bulletins
          </button>
        </div>
      </div>
    </div>
  );
};
