'use client';

import React, { useState } from 'react';

interface NetworkNode {
  id: string;
  label: string;
  type: 'syndicate' | 'domain' | 'phone' | 'vpa' | 'apk' | 'report';
  status: 'active' | 'frozen' | 'flagged';
  riskScore: number;
  evidence: string;
  connections: string[];
}

interface ScamSyndicate {
  id: string;
  name: string;
  category: string;
  impactEstimate: string;
  firNumber: string;
  nodes: NetworkNode[];
}

export const FraudNetworkScreen: React.FC = () => {
  const syndicates: ScamSyndicate[] = [
    {
      id: 'syn-1',
      name: 'Electricity Disconnection Syndicate',
      category: 'Public Utility Extortion',
      impactEstimate: '₹42,80,000 / 380+ Citizen Complaints',
      firNumber: 'CYBER-BLR-2026/891',
      nodes: [
        {
          id: 'hub',
          label: 'Primary Call Hub (Jamtara Corridor)',
          type: 'syndicate',
          status: 'flagged',
          riskScore: 98,
          evidence: 'High-volume automated robocalls claiming 9:30 PM power disconnection.',
          connections: ['p1', 'p2', 'vpa1', 'apk1', 'rep1'],
        },
        {
          id: 'p1',
          label: '+91 98234 11209 (Mule VoIP SIP)',
          type: 'phone',
          status: 'flagged',
          riskScore: 94,
          evidence: 'Identified on 48 scam reports; VoIP routing via virtual proxy trunk.',
          connections: ['hub'],
        },
        {
          id: 'p2',
          label: '+91 93120 44812 (Caller Trunk)',
          type: 'phone',
          status: 'flagged',
          riskScore: 91,
          evidence: 'Sends bulk SMS with spoofed BESCOM sender tag.',
          connections: ['hub'],
        },
        {
          id: 'vpa1',
          label: 'bescom-bills@paytm (Mule VPA)',
          type: 'vpa',
          status: 'frozen',
          riskScore: 95,
          evidence: 'Account frozen by Cyber Police 1930 after ₹3.4L illegal deposits.',
          connections: ['hub'],
        },
        {
          id: 'apk1',
          label: 'QuickSupport_Update.apk',
          type: 'apk',
          status: 'flagged',
          riskScore: 99,
          evidence: 'Remote screen-mirroring trojan targeting banking OTPs.',
          connections: ['hub'],
        },
        {
          id: 'rep1',
          label: '142 Verified Citizen Reports',
          type: 'report',
          status: 'active',
          riskScore: 88,
          evidence: 'Crowdsourced reports confirmed across Karnataka, Maharashtra, and Delhi NCR.',
          connections: ['hub'],
        },
      ],
    },
    {
      id: 'syn-2',
      name: 'Banking KYC & PAN Phishing Ring',
      category: 'Credential Harvesting',
      impactEstimate: '₹78,50,000 / 520+ Citizen Complaints',
      firNumber: 'CYBER-MUM-2026/412',
      nodes: [
        {
          id: 'hub2',
          label: 'Phishing Infrastructure Core',
          type: 'syndicate',
          status: 'flagged',
          riskScore: 99,
          evidence: 'Rapid domain generation algorithm cycling .top and .xyz phishing pages.',
          connections: ['dom1', 'dom2', 'vpa2', 'rep2'],
        },
        {
          id: 'dom1',
          label: 'sbi-pan-kyc.top',
          type: 'domain',
          status: 'flagged',
          riskScore: 96,
          evidence: 'Mimics SBI NetBanking login; harvesting customer IDs and NetBanking credentials.',
          connections: ['hub2'],
        },
        {
          id: 'dom2',
          label: 'paytm-kyc-verify.xyz',
          type: 'domain',
          status: 'flagged',
          riskScore: 92,
          evidence: 'Deceptive KYC form stealing Aadhaar and debit card CVVs.',
          connections: ['hub2'],
        },
        {
          id: 'vpa2',
          label: 'refund-desk@okhdfcbank',
          type: 'vpa',
          status: 'frozen',
          riskScore: 97,
          evidence: 'Receives unauthorized funds from victims tricked by reverse collect requests.',
          connections: ['hub2'],
        },
        {
          id: 'rep2',
          label: '210 Bank Account Freezes',
          type: 'report',
          status: 'active',
          riskScore: 90,
          evidence: 'Reported through Indian Cybercrime Coordination Centre (I4C).',
          connections: ['hub2'],
        },
      ],
    },
  ];

  const [activeSyndicateId, setActiveSyndicateId] = useState(syndicates[0].id);
  const currentSyndicate = syndicates.find((s) => s.id === activeSyndicateId)!;
  const [selectedNode, setSelectedNode] = useState<NetworkNode>(currentSyndicate.nodes[0]);

  const handleSyndicateSwitch = (id: string) => {
    setActiveSyndicateId(id);
    const syn = syndicates.find((s) => s.id === id)!;
    setSelectedNode(syn.nodes[0]);
  };

  const getNodeIcon = (type: NetworkNode['type']) => {
    switch (type) {
      case 'syndicate':
        return 'hub';
      case 'domain':
        return 'public';
      case 'phone':
        return 'call';
      case 'vpa':
        return 'alternate_email';
      case 'apk':
        return 'android';
      case 'report':
        return 'flag';
    }
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 space-y-4 max-w-lg mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[#191C19] tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1DB954] text-[22px]">
            hub
          </span>
          Fraud Network Graph
        </h1>
        <p className="text-xs text-[#6B756D] leading-relaxed">
          Interactive visual intelligence mapping scammer call hubs, mule bank accounts, phishing domains, and citizen reports.
        </p>
      </div>

      {/* Syndicate Switcher Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {syndicates.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSyndicateSwitch(s.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all active:scale-95 text-left border ${
              activeSyndicateId === s.id
                ? 'bg-[#1DB954] text-white border-[#1DB954] shadow-xs'
                : 'bg-white text-[#6B756D] hover:text-[#191C19] border-[#E5EAE5]'
            }`}
          >
            <span className="block">{s.name}</span>
            <span
              className={`text-[10px] block opacity-85 ${
                activeSyndicateId === s.id ? 'text-white' : 'text-[#8E9990]'
              }`}
            >
              {s.category}
            </span>
          </button>
        ))}
      </div>

      {/* Syndicate Overview Banner */}
      <div className="p-3 bg-white rounded-2xl border border-[#E5EAE5] shadow-xs space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#191C19]">
            {currentSyndicate.name}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-red-50 text-[#D64545] font-bold text-[10px] border border-red-200">
            FIR: {currentSyndicate.firNumber}
          </span>
        </div>
        <div className="text-[11px] text-[#6B756D]">
          Estimated Intercepted Volume: <strong className="text-[#191C19]">{currentSyndicate.impactEstimate}</strong>
        </div>
      </div>

      {/* Interactive Network Graph Cards (Mobile Single-Column Grid) */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#191C19] uppercase tracking-wide">
          Linked Threat Infrastructure (Tap Node to Inspect)
        </span>

        <div className="grid grid-cols-1 gap-2">
          {currentSyndicate.nodes.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#EAF8EF] border-[#1DB954] shadow-xs'
                    : 'bg-white hover:bg-[#F7F9F7] border-[#E5EAE5]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#1DB954] text-white'
                        : 'bg-[#F7F9F7] text-[#6B756D] border border-[#E5EAE5]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {getNodeIcon(node.type)}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#191C19] truncate">
                      {node.label}
                    </span>
                    <span className="text-[10px] text-[#6B756D] capitalize truncate">
                      Type: {node.type} • Status: {node.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                      node.status === 'frozen'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-red-50 text-[#D64545] border border-red-200'
                    }`}
                  >
                    {node.status.toUpperCase()}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#8E9990]">
                    chevron_right
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Evidence Inspector Card */}
      {selectedNode && (
        <div className="p-4 bg-white rounded-2xl border border-[#1DB954]/30 shadow-xs space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#E5EAE5] pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#1DB954]">
                {getNodeIcon(selectedNode.type)}
              </span>
              <span className="text-xs font-bold text-[#191C19]">
                Node Telemetry & Evidence
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#D64545]">
              Threat Rating: {selectedNode.riskScore}%
            </span>
          </div>

          <div>
            <span className="text-sm font-bold text-[#191C19] block">
              {selectedNode.label}
            </span>
            <p className="text-xs text-[#6B756D] leading-relaxed mt-1">
              {selectedNode.evidence}
            </p>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-[#8E9990] border-t border-[#E5EAE5]">
            <span>Active Connections: {selectedNode.connections.length}</span>
            <span className="text-[#169C46] font-semibold">
              Verified by Threat Radar
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
