import { NextRequest, NextResponse } from 'next/server';
import { universalAnalyze } from '@/lib/scamDetector';
import { checkCommunityBlacklist } from '@/lib/supabase';
import { ScamCategory } from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid or malformed JSON payload in request body.' },
      { status: 400 }
    );
  }

  try {
    const { target, category } = body;

    if (!target || typeof target !== 'string' || target.trim().length === 0) {
      return NextResponse.json(
        { error: 'A valid target string is required for scam analysis.' },
        { status: 400 }
      );
    }

    if (target.length > 3000) {
      return NextResponse.json(
        { error: 'Input exceeds maximum supported character limit (3000 characters).' },
        { status: 400 }
      );
    }

    const validCategories: ScamCategory[] = ['phone', 'email', 'url', 'message', 'upi'];
    const selectedCategory = validCategories.includes(category) ? (category as ScamCategory) : undefined;

    // Perform deterministic heuristic analysis
    const result = universalAnalyze(target, selectedCategory);

    // Cross-check community reports from Supabase/local store
    const matchedReports = await checkCommunityBlacklist(target);
    if (matchedReports.length > 0) {
      result.communityReportsCount = Math.max(result.communityReportsCount, matchedReports.length);
      result.verifiedStatus = 'community_flagged';
      if (result.riskLevel === 'safe' || result.riskLevel === 'unknown') {
        result.riskLevel = 'suspicious';
        result.riskScore = Math.max(result.riskScore, 65);
        result.summary = 'Community Scam Reports Matched';
        result.explanation = `This identifier matches ${matchedReports.length} user-submitted report(s) in the SCAM GUARD community radar.`;
      }
      result.findings.unshift({
        title: `Matched ${matchedReports.length} Active Community Report(s)`,
        description: `Latest report: "${matchedReports[0].scamType}" - ${matchedReports[0].description}`,
        severity: 'high',
        category: 'Community Intelligence'
      });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API /api/check error:', err);
    return NextResponse.json(
      { error: 'Internal server error while analyzing input. Please retry.' },
      { status: 500 }
    );
  }
}
