'use client';

import React from 'react';
import { Shield, Phone, LogIn, LogOut, User } from 'lucide-react';
import { AuthUser } from '@/lib/supabase';

interface HeaderProps {
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onSignOut: () => void;
  onOpenHelpline: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenLogin,
  onSignOut,
  onOpenHelpline,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5EAE5] pt-safe shadow-xs">
      <div className="h-16 max-w-lg mx-auto px-4 flex items-center justify-between gap-3">
        {/* Brand & Tagline — NO PRO BADGE */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#EAF8EF] border border-[#1DB954]/25 flex items-center justify-center text-[#1DB954] shadow-xs shrink-0">
            <Shield className="w-5 h-5 fill-[#1DB954]/20 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-[#191C19] tracking-tight leading-none">
                SCAM GUARD
              </span>
            </div>
            <span className="text-[11px] text-[#6B756D] truncate leading-tight pt-0.5 font-medium">
              Spot the Scam. Stay Safe.
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Emergency 1930 Dial Action */}
          <button
            onClick={onOpenHelpline}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#D64545] border border-red-200 text-xs font-bold active:scale-95 transition-all shadow-xs"
            title="Emergency Cybercrime Helpline: Dial 1930"
          >
            <Phone className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>1930</span>
          </button>

          {/* User Authentication Status */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-[#F7F9F7] p-1 pr-2 rounded-xl border border-[#E5EAE5]">
              <div
                className="w-7 h-7 rounded-lg bg-[#EAF8EF] border border-[#1DB954]/30 text-[#1DB954] flex items-center justify-center font-bold text-xs"
                title={`Signed in as ${currentUser.email}`}
              >
                {currentUser.name ? currentUser.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <button
                onClick={onSignOut}
                aria-label="Sign out"
                className="p-1 text-[#6B756D] hover:text-[#D64545] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1DB954] hover:bg-[#169C46] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
