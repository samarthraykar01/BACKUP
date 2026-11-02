'use client';

import React from 'react';

interface SafetyTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyTipsModal: React.FC<SafetyTipsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const tips = [
    {
      title: 'UPI Payment Safety',
      icon: 'qr_code_scanner',
      rule: 'Entering UPI PIN SENDS money. Never enter your PIN to receive money or cashbacks.',
      detail: 'Scammers on OLX or Facebook Marketplace send collect requests claiming it is a verification fee. If asked for a PIN, cancel immediately.',
    },
    {
      title: 'Electricity & Utility Scams',
      icon: 'bolt',
      rule: 'Electricity boards never issue same-day disconnection notices via personal mobile numbers.',
      detail: 'Power utilities only communicate via official bill statements and SMS sender IDs (e.g., BESCOM, MSEBDL). Never call numbers in SMS alerts.',
    },
    {
      title: 'Bank KYC & PAN Expiration',
      icon: 'account_balance',
      rule: 'Banks never block accounts without prior registered post or branch visits.',
      detail: 'Do not click links ending in .top, .xyz, or .click. Banks do not ask for NetBanking passwords or OTPs to update KYC.',
    },
    {
      title: 'Remote Access Tool Trap (AnyDesk, TeamViewer)',
      icon: 'phonelink_erase',
      rule: 'Never install apps requested by unknown callers.',
      detail: 'Fraudsters instruct victims to install QuickSupport or AnyDesk to steal screens and mirror OTPs.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1c1b1b] rounded-t-3xl sm:rounded-3xl border border-white/[0.08] p-5 shadow-2xl max-h-[88vh] overflow-y-auto space-y-4 pb-safe">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1db954]/15 border border-[#1db954]/30 flex items-center justify-center text-[#53e076]">
              <span className="material-symbols-outlined text-[18px]">
                local_police
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Safety Guides & Cyber Helpline
              </h3>
              <p className="text-[11px] text-[#a1a1aa]">
                Official Fraud Prevention Protocols
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#a1a1aa] hover:text-white hover:bg-white/[0.08]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Cyber Emergency Helpline Banner */}
        <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#ffb4ab] tracking-wider">
              Emergency Indian Cybercrime Portal
            </span>
            <span className="text-sm font-bold text-white">
              National Helpline 1930
            </span>
            <span className="text-[11px] text-[#a1a1aa] mt-0.5">
              Report financial fraud within 2 hours to freeze funds
            </span>
          </div>

          <a
            href="tel:1930"
            className="px-3.5 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
            <span>Dial 1930</span>
          </a>
        </div>

        {/* Tips list */}
        <div className="space-y-2.5">
          {tips.map((t, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#131313] rounded-xl border border-white/[0.05] space-y-1 text-xs"
            >
              <div className="flex items-center gap-2 text-white font-semibold">
                <span className="material-symbols-outlined text-[17px] text-[#53e076]">
                  {t.icon}
                </span>
                <span>{t.title}</span>
              </div>
              <p className="text-[#53e076] font-medium leading-snug">
                {t.rule}
              </p>
              <p className="text-[#a1a1aa] text-[11px] leading-relaxed">
                {t.detail}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium rounded-xl text-xs transition-colors"
        >
          Got It, Stay Protected
        </button>
      </div>
    </div>
  );
};
