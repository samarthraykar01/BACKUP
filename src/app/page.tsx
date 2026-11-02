'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav, NavTab } from '@/components/BottomNav';
import { HomeScreen } from '@/components/HomeScreen';
import { CheckScreen } from '@/components/CheckScreen';
import { QrPayScreen } from '@/components/QrPayScreen';
import { MessagesScreen } from '@/components/MessagesScreen';
import { ReportsScreen } from '@/components/ReportsScreen';
import { SafetyTipsModal } from '@/components/SafetyTipsModal';
import { NotificationsModal } from '@/components/NotificationsModal';
import { SettingsModal } from '@/components/SettingsModal';

export default function ScamGuardApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isSafetyTipsOpen, setIsSafetyTipsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Cross-screen prefill state
  const [reportPrefill, setReportPrefill] = useState<{ target: string; category: string } | null>(null);

  const handleOpenReportWithTarget = (target: string, category: string) => {
    setReportPrefill({ target, category });
    setActiveTab('reports');
  };

  return (
    <div className="relative min-h-screen bg-[#131313] text-white flex flex-col font-['Inter',sans-serif] selection:bg-[#1db954]/30 selection:text-white">
      {/* 1. Fixed Top Header */}
      <Header
        activeTab={activeTab}
        onOpenSafetyTips={() => setIsSafetyTipsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        unreadCount={2}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full pt-16 pb-16 flex flex-col">
        {activeTab === 'home' && (
          <HomeScreen
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenReportModalWithTarget={handleOpenReportWithTarget}
          />
        )}

        {activeTab === 'check' && (
          <CheckScreen
            onReportClick={handleOpenReportWithTarget}
          />
        )}

        {activeTab === 'qr-and-pay' && (
          <QrPayScreen
            onReportClick={handleOpenReportWithTarget}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesScreen
            onReportClick={handleOpenReportWithTarget}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsScreen
            prefillTarget={reportPrefill?.target || ''}
            prefillCategory={reportPrefill?.category || ''}
            onClearPrefill={() => setReportPrefill(null)}
          />
        )}
      </main>

      {/* 3. Fixed Bottom Mobile Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* 4. Modals and Drawers */}
      <SafetyTipsModal
        isOpen={isSafetyTipsOpen}
        onClose={() => setIsSafetyTipsOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
