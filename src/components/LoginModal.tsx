'use client';

import React, { useState } from 'react';
import { signInUser, signUpUser, AuthUser } from '@/lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await signUpUser(cleanEmail, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.user) {
          setSuccessMsg(res.message || 'Account successfully created! You are now logged in.');
          setTimeout(() => {
            onLoginSuccess(res.user!);
            onClose();
          }, 1200);
        }
      } else {
        const res = await signInUser(cleanEmail, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.user) {
          setSuccessMsg('Successfully signed in. Welcome back!');
          setTimeout(() => {
            onLoginSuccess(res.user!);
            onClose();
          }, 800);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-[#E5EAE5] p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-5 pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5EAE5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF8EF] border border-[#1DB954]/20 flex items-center justify-center text-[#1DB954]">
              <span className="material-symbols-outlined text-[20px] fill-icon">
                lock
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191C19]">
                {isSignUp ? 'Create Citizen Account' : 'Sign In to SCAM GUARD'}
              </h3>
              <p className="text-xs text-[#6B756D]">
                {isSignUp
                  ? 'Join verified citizen fraud reporting'
                  : 'Access your telemetry & security dashboard'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B756D] hover:text-[#191C19] hover:bg-[#F0F4F0] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[#F7F9F7] rounded-xl border border-[#E5EAE5] gap-1">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isSignUp
                ? 'bg-white text-[#191C19] shadow-sm border border-[#E5EAE5]'
                : 'text-[#6B756D] hover:text-[#191C19]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isSignUp
                ? 'bg-white text-[#191C19] shadow-sm border border-[#E5EAE5]'
                : 'text-[#6B756D] hover:text-[#191C19]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#191C19] flex justify-between">
              <span>Email Address</span>
              <span className="text-[10px] text-[#8E9990]">citizen@example.com</span>
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5EAE5] focus-within:border-[#1DB954] focus-within:bg-white transition-all">
              <span className="material-symbols-outlined text-[19px] text-[#6B756D]">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="w-full bg-transparent text-sm text-[#191C19] placeholder:text-[#8E9990] focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#191C19]">
              Password
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F7F9F7] rounded-xl border border-[#E5EAE5] focus-within:border-[#1DB954] focus-within:bg-white transition-all">
              <span className="material-symbols-outlined text-[19px] text-[#6B756D]">
                key
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters..."
                className="w-full bg-transparent text-sm text-[#191C19] placeholder:text-[#8E9990] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#6B756D] hover:text-[#191C19] p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-[#D64545]/20 text-xs text-[#D64545] flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] shrink-0">
                error
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-[#EAF8EF] border border-[#1DB954]/25 text-xs text-[#169C46] flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[17px] shrink-0 fill-icon">
                check_circle
              </span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1DB954] hover:bg-[#169C46] text-white font-semibold rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  login
                </span>
                <span>{isSignUp ? 'Create Citizen Account' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-[#8E9990] leading-relaxed">
          Zero-knowledge authentication. SCAM GUARD never links financial accounts, PAN, or Aadhaar.
        </p>
      </div>
    </div>
  );
};
