export type ScamCategory = 'phone' | 'email' | 'url' | 'message' | 'upi';

export type AppModule =
  | 'dashboard'
  | 'qr-scanner'
  | 'fake-message'
  | 'fraud-link'
  | 'upi-verify'
  | 'fraud-network'
  | 'safety-assistant';

export type NavTab = AppModule | 'home' | 'check' | 'qr-and-pay' | 'messages' | 'reports';

export type RiskLevel = 'safe' | 'suspicious' | 'danger' | 'unknown';

export interface AnalysisFinding {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'info';
  category: string;
}

export interface ScamCheckResult {
  target: string;
  category: ScamCategory;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  summary: string;
  explanation: string;
  findings: AnalysisFinding[];
  recommendedAction: string;
  communityReportsCount: number;
  verifiedStatus: 'unverified' | 'community_flagged' | 'known_malicious' | 'clean';
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface CommunityReport {
  id: string;
  target: string;
  category: ScamCategory;
  scamType: string; // e.g., "Electricity Bill Scam", "Lottery/KYC", "Job Offer", "Courier Fee"
  description: string;
  riskLevel: RiskLevel;
  reporterName?: string;
  upvotes: number;
  createdAt: string;
  status: 'active' | 'under_review' | 'verified_scam';
}

export interface SafetyTip {
  id: string;
  title: string;
  category: ScamCategory | 'general';
  summary: string;
  dos: string[];
  donts: string[];
  helpline?: string;
}
