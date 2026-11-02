'use client';

import React from 'react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const alerts = [
    {
      id: 1,
      badge: 'Critical Advisory',
      badgeColor: 'text-[#ffb4ab] bg-red-500/15 border-red-500/30',
      title: 'Surge in Malicious Electricity Disconnection SMS',
      desc: 'Over 1,200 reports in the last 48 hours. Scammers send fake SMS claiming power will be cut tonight at 9:30 PM. Power boards do not issue cutoff alerts via WhatsApp.',
      time: '35m ago',
    },
    {
      id: 2,
      badge: 'UPI Alert',
      badgeColor: 'text-[#f9bc45] bg-amber-500/15 border-amber-500/30',
      title: 'OLX Reverse QR Collect Attack Active',
      desc: 'Fraudsters impersonating buyers send QR codes claiming it credits advance money. Remember: Scanning QR never receives money.',
      time: '3h ago',
    },
    {
      id: 3,
      badge: 'Database Sync',
      badgeColor: 'text-[#53e076] bg-[#1db954]/15 border-[#1db954]/30',
      title: 'Community Radar Blacklist Updated',
      desc: '4,520 newly verified fraudulent phone numbers and mule UPI VPAs synced into your local heuristic shield.',
      time: 'Today',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1c1b1b] rounded-t-3xl sm:rounded-3xl border border-white/[0.08] p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 pb-safe">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#1db954]">
              notifications_active
            </span>
            <h3 className="text-sm font-bold text-white">
              Scam Radar & Advisories
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#a1a1aa] hover:text-white hover:bg-white/[0.08]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 bg-[#131313] rounded-xl border border-white/[0.05] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${alert.badgeColor}`}
                >
                  {alert.badge}
                </span>
                <span className="text-[10px] text-[#71717a]">{alert.time}</span>
              </div>
              <h4 className="text-xs font-semibold text-white leading-snug">
                {alert.title}
              </h4>
              <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                {alert.desc}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium rounded-xl text-xs transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
