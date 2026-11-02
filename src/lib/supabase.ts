import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CommunityReport, ScamCategory } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Initial curated community threat radar seed data
const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'rep-001',
    target: '+91 98234 11209',
    category: 'phone',
    scamType: 'Electricity Bill Extortion',
    description: 'Robocall claiming electricity connection will be cut off by 9:30 PM tonight. Demands payment via QuickSupport APK.',
    riskLevel: 'danger',
    reporterName: 'Arun K., Bengaluru',
    upvotes: 48,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'verified_scam'
  },
  {
    id: 'rep-002',
    target: 'sbi-pan-update.top',
    category: 'url',
    scamType: 'Banking KYC Phishing',
    description: 'Phishing portal mimicking SBI YONO login page asking for username, password, and OTP to avoid card deactivation.',
    riskLevel: 'danger',
    reporterName: 'Priya M., Mumbai',
    upvotes: 72,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'verified_scam'
  },
  {
    id: 'rep-003',
    target: 'refund-desk@okhdfcbank',
    category: 'upi',
    scamType: 'OLX Marketplace QR PIN Scam',
    description: 'Buyer from OLX sent a QR code claiming it is to transfer ₹15,000 for sofa. Scanning it showed a PAY request instead of receive.',
    riskLevel: 'danger',
    reporterName: 'Rohan D., Delhi NCR',
    upvotes: 91,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'verified_scam'
  },
  {
    id: 'rep-004',
    target: 'careers@amazon-hiring-india.xyz',
    category: 'email',
    scamType: 'Fake Work From Home Job',
    description: 'Offers ₹4,500 daily for liking YouTube videos. Asked for ₹1,999 registration fee to unlock task portal.',
    riskLevel: 'danger',
    reporterName: 'Sneha T., Hyderabad',
    upvotes: 34,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'verified_scam'
  },
  {
    id: 'rep-005',
    target: '+91 93120 44812',
    category: 'phone',
    scamType: 'FedEx Customs Parcel Scam',
    description: 'IVR claiming a courier with illegal goods has been seized at Mumbai airport and asking to transfer penalty money.',
    riskLevel: 'danger',
    reporterName: 'Vikas N., Pune',
    upvotes: 29,
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    status: 'verified_scam'
  }
];

// Fallback in-memory store
let localReports: CommunityReport[] = [...INITIAL_COMMUNITY_REPORTS];

export async function fetchCommunityReports(category?: ScamCategory, searchQuery?: string): Promise<CommunityReport[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('community_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (category) {
        query = query.eq('category', category);
      }
      if (searchQuery) {
        query = query.ilike('target', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          target: item.target,
          category: item.category,
          scamType: item.scam_type || item.scamType,
          description: item.description,
          riskLevel: item.risk_level || item.riskLevel || 'danger',
          reporterName: item.reporter_name || item.reporterName || 'Anonymous Citizen',
          upvotes: item.upvotes || 0,
          createdAt: item.created_at || item.createdAt || new Date().toISOString(),
          status: item.status || 'active'
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local memory store', e);
    }
  }

  // Fallback filtering
  let results = [...localReports];
  if (category) {
    results = results.filter(r => r.category === category);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    results = results.filter(r => r.target.toLowerCase().includes(q) || r.scamType.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }
  return results;
}

export async function submitCommunityReport(report: Omit<CommunityReport, 'id' | 'createdAt' | 'upvotes' | 'status'>): Promise<{ success: boolean; data?: CommunityReport; error?: string }> {
  const newReport: CommunityReport = {
    ...report,
    id: `rep-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    upvotes: 1,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('community_reports')
        .insert({
          target: newReport.target,
          category: newReport.category,
          scam_type: newReport.scamType,
          description: newReport.description,
          risk_level: newReport.riskLevel,
          reporter_name: newReport.reporterName || 'Citizen Report',
          upvotes: 1,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert failed, storing in fallback storage', error);
      } else if (data) {
        newReport.id = data.id;
      }
    } catch (e) {
      console.warn('Supabase submission exception:', e);
    }
  }

  // Prepend to local storage so user sees instant update
  localReports = [newReport, ...localReports];
  return { success: true, data: newReport };
}

export async function upvoteReport(reportId: string): Promise<number> {
  const rep = localReports.find(r => r.id === reportId);
  if (rep) {
    rep.upvotes += 1;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.rpc('increment_upvote', { report_id: reportId });
    } catch (e) {
      console.warn('Supabase upvote rpc skipped', e);
    }
  }

  return rep?.upvotes || 1;
}

export async function checkCommunityBlacklist(target: string): Promise<CommunityReport[]> {
  const cleanTarget = target.trim().toLowerCase();
  const all = await fetchCommunityReports();
  return all.filter(r => {
    const reportTarget = r.target.trim().toLowerCase();
    return reportTarget === cleanTarget || cleanTarget.includes(reportTarget) || reportTarget.includes(cleanTarget);
  });
}
