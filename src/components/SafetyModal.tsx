'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  PhoneCall,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  const [expandedId, setExpandedId] = useState<string | null>('safe-1');

  if (!isOpen) return null;

  const safetyGuides = [
    {
      id: 'safe-1',
      title: 'Electricity Bill Cutoff Scam',
      badge: 'High Frequency',
      badgeColor: 'bg-red-100 text-red-800',
      summary: 'Scammers send SMS warning that power will be disconnected at 9:30 PM due to unpaid bill, urging victims to call an unknown number or install QuickSupport / AnyDesk.',
      dos: [
        'Pay electricity bills only through official board apps or verified utility portals (e.g. BESCOM, MSEB, Tata Power).',
        'Check your official bill status on the electricity board website before panicking.',
      ],
      donts: [
        'Never call phone numbers provided in unsolicited SMS warnings.',
        'Never install remote screen-sharing tools like AnyDesk, TeamViewer, or QuickSupport on caller request.',
      ],
    },
    {
      id: 'safe-2',
      title: 'Reverse QR & UPI "Receive Money" Scam',
      badge: 'Critical Rule',
      badgeColor: 'bg-amber-100 text-amber-800',
      summary: 'Buyers on OLX or Facebook Marketplace send a QR code claiming it will transfer money to your account, but scanning it actually requests payment.',
      dos: [
        'Remember that receiving money NEVER requires scanning a QR code or typing your UPI PIN.',
        'Always check the SMS notification directly from your bank to verify incoming funds.',
      ],
      donts: [
        'Never enter your 4 or 6 digit UPI PIN to receive money or refunds.',
        'Never scan a QR code sent by a stranger on WhatsApp or marketplace chats.',
      ],
    },
    {
      id: 'safe-3',
      title: 'Fake Work From Home / YouTube Tasks',
      badge: 'Telegram Trap',
      badgeColor: 'bg-purple-100 text-purple-800',
      summary: 'Victims are paid small amounts (₹150) for liking YouTube videos or Google reviews, then lured into depositing lakhs into fake "crypto trading" or "merchant prepaid" accounts.',
      dos: [
        'Verify legitimate corporate openings on the official corporate careers site directly.',
        'Cease communication immediately if asked to deposit money to "unlock" commissions.',
      ],
      donts: [
        'No legitimate company asks job applicants to pay registration fees or recharge crypto wallets.',
        'Never share bank account or Aadhaar details in anonymous Telegram recruitment groups.',
      ],
    },
    {
      id: 'safe-4',
      title: 'Digital Arrest & Customs Parcel Scam',
      badge: 'Extortion Warning',
      badgeColor: 'bg-red-100 text-red-800',
      summary: 'Imposters posing as Mumbai Police, CBI, or FedEx call claiming illegal narcotics or forged passports were found under your Aadhaar and demand money to avoid arrest.',
      dos: [
        'Understand that no Indian police agency or court conducts "Digital Arrest" via Skype or WhatsApp video.',
        'Demand a formal written notice delivered through official local police jurisdiction.',
      ],
      donts: [
        'Never transfer funds to "government secret verification accounts" or escrow wallets.',
        'Do not stay on uninterrupted video calls under threat of arrest. Hang up and dial 1930.',
      ],
    },
    {
      id: 'safe-5',
      title: 'Banking KYC & Fake APK Downloads',
      badge: 'Malware Risk',
      badgeColor: 'bg-blue-100 text-blue-800',
      summary: 'SMS claiming bank account will be blocked unless PAN/KYC is updated via a short link that downloads a trojan APK reading OTPs from your device.',
      dos: [
        'Update banking KYC only inside the official bank branch or verified official mobile banking app.',
        'Keep Google Play Protect enabled on Android devices.',
      ],
      donts: [
        'Never install .apk files received via WhatsApp, Telegram, or SMS links.',
        'Never click on shortened links like bit.ly, tinyurl, or suspicious .top / .xyz domains.',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-none">
                Safety Guides & Modus Operandi
              </h2>
              <span className="text-[11px] text-slate-500">
                Official Prevention Reference
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

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Emergency Helpline Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between gap-3 shadow-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-red-200">
                Immediate Cyber Financial Fraud Helpline
              </div>
              <div className="text-base font-extrabold tracking-tight mt-0.5">
                National Helpline: 1930
              </div>
              <div className="text-[11px] text-red-100">
                Report within golden hours to freeze unauthorized transactions.
              </div>
            </div>
            <a
              href="tel:1930"
              className="py-1.5 px-3 rounded-xl bg-white text-red-700 font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>

          {/* National Portal Link */}
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-xs text-slate-700 font-semibold flex items-center justify-between transition-all"
          >
            <span>Official National Cyber Crime Reporting Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>

          {/* Guide Accordions */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Common Scam Scenarios & How to Respond
            </h3>

            {safetyGuides.map((guide) => {
              const isExpanded = expandedId === guide.id;
              return (
                <div
                  key={guide.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : guide.id)}
                    className="w-full p-3.5 text-left flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${guide.badgeColor}`}>
                          {guide.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug pt-0.5">
                        {guide.title}
                      </h4>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isExpanded ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="p-3.5 pt-0 border-t border-slate-100 space-y-3 text-xs animate-in fade-in duration-150">
                      <p className="text-slate-600 leading-relaxed text-[11px] pt-2">
                        {guide.summary}
                      </p>

                      {/* DOs */}
                      <div className="space-y-1">
                        <span className="font-bold text-emerald-700 text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          What You Should Do
                        </span>
                        <ul className="space-y-1 text-[11px] text-slate-700">
                          {guide.dos.map((item, i) => (
                            <li key={i} className="pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-emerald-600">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* DONTs */}
                      <div className="space-y-1 pt-1">
                        <span className="font-bold text-red-700 text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" />
                          What You Must NEVER Do
                        </span>
                        <ul className="space-y-1 text-[11px] text-slate-700">
                          {guide.donts.map((item, i) => (
                            <li key={i} className="pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-red-600">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-black transition-all"
          >
            Close Guides
          </button>
        </div>
      </div>
    </div>
  );
};
