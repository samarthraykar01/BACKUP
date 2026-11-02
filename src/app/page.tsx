'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav, AppModule } from '@/components/BottomNav';
import { ModuleTabBar } from '@/components/ModuleTabBar';
import { DashboardScreen } from '@/components/DashboardScreen';
import { QrPayScreen } from '@/components/QrPayScreen';
import { MessagesScreen } from '@/components/MessagesScreen';
import { FraudLinkScreen } from '@/components/FraudLinkScreen';
import { UpiVerifyScreen } from '@/components/UpiVerifyScreen';
import { FraudNetworkScreen } from '@/components/FraudNetworkScreen';
import { SafetyAssistantScreen } from '@/components/SafetyAssistantScreen';
import { SafetyTipsModal } from '@/components/SafetyTipsModal';
import { LoginModal } from '@/components/LoginModal';
import { AuthUser, getSavedSession, signOutUser } from '@/lib/supabase';

export default function ScamGuardApp() {
  const [activeModule, setActiveModule] = useState<AppModule>('dashboard');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSafetyTipsOpen, setIsSafetyTipsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      return getSavedSession();
    }
    return null;
  });

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  const handleOpenReportWithTarget = (target: string, category: string) => {
    // Navigate to appropriate detector or launchpad
    if (category === 'upi') {
      setActiveModule('upi-verify');
    } else if (category === 'url') {
      setActiveModule('fraud-link');
    } else if (category === 'message') {
      setActiveModule('fake-message');
    } else {
      setActiveModule('dashboard');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F9F7] text-[#191C19] flex flex-col font-['Inter',sans-serif] selection:bg-[#1DB954]/20 selection:text-[#191C19]">
      {/* 1. Fixed Top Header (PRO badge removed) */}
      <Header
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onSignOut={handleSignOut}
        onOpenHelpline={() => setIsSafetyTipsOpen(true)}
      />

      {/* 2. Top Module Navigation Pills (7 Core Modules) */}
      <div className="pt-16">
        <ModuleTabBar
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
        />
      </div>

      {/* 3. Main Content Area */}
      <main className="flex-1 w-full pt-2 pb-16 flex flex-col">
        {activeModule === 'dashboard' && (
          <DashboardScreen
            onSelectModule={(mod) => setActiveModule(mod)}
            onOpenReportWithTarget={handleOpenReportWithTarget}
          />
        )}

        {activeModule === 'qr-scanner' && (
          <QrPayScreen
            onReportClick={handleOpenReportWithTarget}
            onNavigateToUpi={() => setActiveModule('upi-verify')}
          />
        )}

        {activeModule === 'fake-message' && (
          <MessagesScreen
            onReportClick={handleOpenReportWithTarget}
          />
        )}

        {activeModule === 'fraud-link' && (
          <FraudLinkScreen
            onReportClick={handleOpenReportWithTarget}
          />
        )}

        {activeModule === 'upi-verify' && (
          <UpiVerifyScreen
            onReportClick={handleOpenReportWithTarget}
          />
        )}

        {activeModule === 'fraud-network' && (
          <FraudNetworkScreen />
        )}

        {activeModule === 'safety-assistant' && (
          <SafetyAssistantScreen />
        )}
      </main>

      {/* 4. Fixed Bottom Mobile Navigation */}
      <BottomNav
        activeModule={activeModule}
        onSelectModule={(mod: AppModule) => setActiveModule(mod)}
      />

      {/* 5. Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      <SafetyTipsModal
        isOpen={isSafetyTipsOpen}
        onClose={() => setIsSafetyTipsOpen(false)}
      />
    </div>
  );
}
