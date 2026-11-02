'use client';

import React, { useState } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionGuide?: string[];
  timestamp: string;
}

let messageSeq = 0;
const createMsgId = (prefix: string) => `${prefix}-${++messageSeq}`;

export const SafetyAssistantScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Hello, I am your SCAM GUARD Safety Assistant. Ask me about suspicious calls, messages, UPI payment requests, or what steps to take if you suspect a scam.',
      actionGuide: [
        'Never disclose your 4 or 6-digit UPI PIN to receive money',
        'Utilities never cut electricity connections via WhatsApp/SMS callbacks',
        'Official banks never request NetBanking passwords or full PAN updates over calls',
      ],
      timestamp: 'Just now',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickScenarios = [
    'Can someone hack my phone if I answer a missed call?',
    'Someone on OLX asked me to enter UPI PIN to receive money',
    'I clicked a suspicious link. What should I do now?',
    'How do I report a scam to the Cyber Police 1930?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: createMsgId('usr'),
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let actions: string[] = [];

      const q = query.toLowerCase();

      if (q.includes('pin') || q.includes('olx') || q.includes('receive money') || q.includes('cashback')) {
        reply = 'CRITICAL WARNING: This is a classic Reverse UPI Collect Scam. You NEVER need to enter your UPI PIN to receive money or cashbacks. Entering your PIN authorises a DEBIT from your bank account.';
        actions = [
          'Decline or cancel the request immediately inside your UPI app',
          'Block the buyer/seller on OLX and WhatsApp',
          'Do not scan any QR code sent to "receive funds"',
        ];
      } else if (q.includes('missed call') || q.includes('answer') || q.includes('hack my phone')) {
        reply = 'No, simply answering a standard telephone call or receiving a missed call CANNOT hack your phone or drain your bank account. However, scammers use these calls to socially engineer you into sharing OTPs, downloading remote control apps (AnyDesk/QuickSupport), or calling expensive international premium rate numbers (+92, +234).';
        actions = [
          'Never call back unknown international numbers with strange country codes',
          'Never install APK files or remote assistance apps requested by callers',
          'Never dictate an SMS verification code (OTP) over the phone',
        ];
      } else if (q.includes('clicked') || q.includes('link') || q.includes('downloaded')) {
        reply = 'If you clicked a suspicious link or downloaded a file, act immediately to prevent credential theft or unauthorized device access:';
        actions = [
          'Immediately turn on Airplane Mode or disconnect Wi-Fi and mobile data',
          'Check your Downloads folder and delete any recent .apk or unknown files',
          'Change your NetBanking and email passwords from a different safe device',
          'Call your bank helpline to temporarily freeze UPI/NetBanking if passwords were typed',
        ];
      } else if (q.includes('1930') || q.includes('report') || q.includes('cyber police')) {
        reply = 'If money was debited from your account due to fraud, you have a 2 to 3 hour "Golden Window" to freeze the transfer before scammers withdraw it from ATMs:';
        actions = [
          'Dial 1930 immediately from your phone (National Cybercrime Reporting Portal)',
          'Provide transaction UTR reference number, debit timestamp, and scammer UPI/Account',
          'File a formal report on cybercrime.gov.in and obtain an acknowledgement copy',
        ];
      } else {
        reply = `I have analyzed your query regarding "${query}". For maximum safety, always verify caller credentials through official verified channels rather than phone numbers sent via SMS or unverified Google Maps listings.`;
        actions = [
          'Do not share OTPs, CVVs, or NetBanking passwords under any circumstances',
          'Check the number, email, or UPI handle in SCAM GUARD detectors',
          'If in doubt, consult your official bank branch or call 1930',
        ];
      }

      const botMsg: ChatMessage = {
        id: createMsgId('bot'),
        sender: 'assistant',
        text: reply,
        actionGuide: actions,
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 space-y-4 max-w-lg mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[#191C19] tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1DB954] text-[22px]">
            support_agent
          </span>
          Fraud Safety Assistant
        </h1>
        <p className="text-xs text-[#6B756D] leading-relaxed">
          Interactive conversational guide. Ask questions and get instant, honest security guidance.
        </p>
      </div>

      {/* Emergency Dial Banner */}
      <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#D64545] text-[18px]">
            phone_in_talk
          </span>
          <span className="text-[#191C19] font-bold">
            Emergency Cyber Helpline: 1930
          </span>
        </div>
        <a
          href="tel:1930"
          className="px-2.5 py-1 bg-[#D64545] text-white rounded-lg text-xs font-bold"
        >
          Call
        </a>
      </div>

      {/* Quick Scenario Question Pills */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-[#8E9990] uppercase tracking-wider font-bold">
          Common Questions (Tap to Ask)
        </span>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {quickScenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sc)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F0F4F0] border border-[#E5EAE5] text-[11px] text-[#6B756D] hover:text-[#191C19] shrink-0 transition-all active:scale-95 text-left"
            >
              {sc}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-3 min-h-[300px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col space-y-1.5 ${
              m.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`p-3.5 rounded-2xl max-w-[90%] text-xs leading-relaxed space-y-2 ${
                m.sender === 'user'
                  ? 'bg-[#1DB954] text-white rounded-tr-xs shadow-xs'
                  : 'bg-white text-[#191C19] rounded-tl-xs border border-[#E5EAE5] shadow-xs'
              }`}
            >
              <p>{m.text}</p>

              {m.actionGuide && m.actionGuide.length > 0 && (
                <div className="pt-2 border-t border-[#E5EAE5] space-y-1">
                  <span className="text-[10px] font-bold text-[#169C46] uppercase tracking-wide block">
                    Immediate Action Checklist:
                  </span>
                  <ul className="space-y-1">
                    {m.actionGuide.map((act, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-1.5 text-[11px] text-[#6B756D]"
                      >
                        <span className="text-[#1DB954] font-bold">✓</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <span className="text-[9px] text-[#8E9990] px-1">
              {m.sender === 'user' ? 'You' : 'SCAM GUARD Assistant'} • {m.timestamp}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-[#E5EAE5] w-24 text-xs text-[#6B756D]">
            <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      {/* Message Input Box */}
      <div className="sticky bottom-16 bg-[#F7F9F7] pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E5EAE5] shadow-sm focus-within:border-[#1DB954] transition-all"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your question or scenario..."
            className="flex-1 bg-transparent text-xs text-[#191C19] placeholder:text-[#8E9990] px-3 py-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="w-9 h-9 rounded-xl bg-[#1DB954] hover:bg-[#169C46] text-white flex items-center justify-center transition-all disabled:opacity-40 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
