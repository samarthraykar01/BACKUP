'use client';

import React from 'react';

export type NavTab = 'home' | 'check' | 'qr-and-pay' | 'messages' | 'reports';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: NavTab; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'check', label: 'Check', icon: 'verified_user' },
    { id: 'qr-and-pay', label: 'QR & Pay', icon: 'qr_code_scanner' },
    { id: 'messages', label: 'Messages', icon: 'chat_bubble' },
    { id: 'reports', label: 'Reports', icon: 'flag' },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#0e0e0e]/95 backdrop-blur-xl border-t border-white/[0.06]"
      aria-label="Main Navigation"
    >
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] h-13 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-[#53e076] font-semibold scale-105'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className={`material-symbols-outlined text-[23px] transition-transform ${
                    isActive ? 'fill-icon' : ''
                  }`}
                >
                  {item.icon}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#53e076]" />
                )}
              </div>
              <span className="text-[10px] tracking-tight truncate">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
