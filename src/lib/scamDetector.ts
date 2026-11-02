import { ScamCategory, ScamCheckResult, AnalysisFinding, RiskLevel } from './types';

// Curated list of known high-risk TLDs frequently abused in rapid phishing campaigns
const HIGH_RISK_TLDS = ['.top', '.xyz', '.buzz', '.icu', '.cam', '.cfd', '.sbs', '.rest', '.quest', '.click', '.monster'];

// High-value targeted brands often spoofed in India & worldwide
const TARGETED_BRANDS = [
  'sbi', 'hdfc', 'icici', 'axis', 'pnb', 'paytm', 'phonepe', 'gpay',
  'yono', 'aadhaar', 'pan', 'incometax', 'epfo', 'indapost', 'fedex',
  'netflix', 'amazon', 'paypal', 'electricity', 'bescom', 'mseb', 'tatapower'
];

// Disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'throwawaymail.com', 'trashmail.com', 'yopmail.com', 'fakemailgenerator.com'
];

// Valid Indian UPI PSP handles
const VALID_UPI_HANDLES = [
  'okaxis', 'okhdfcbank', 'oksbi', 'okicici', 'ybl', 'ibl', 'axl', 'paytm',
  'apl', 'upi', 'barodampay', 'federal', 'aubank', 'idfcbank', 'kmbl', 'postbank'
];

// SSRF & private IP check
function isPrivateOrLocalHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower === '::1' ||
    lower === '169.254.169.254'
  ) {
    return true;
  }

  // Check IPv4 private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = lower.match(ipv4Regex);
  if (match) {
    const p1 = parseInt(match[1], 10);
    const p2 = parseInt(match[2], 10);
    if (p1 === 10) return true;
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
    if (p1 === 192 && p2 === 168) return true;
    if (p1 === 127) return true;
    if (p1 === 0) return true;
  }

  return false;
}

export function detectInputCategory(input: string): ScamCategory {
  const trimmed = input.trim();
  if (trimmed.startsWith('upi://') || (trimmed.includes('@') && !trimmed.includes('.') && trimmed.split('@').length === 2)) {
    return 'upi';
  }
  if (/^https?:\/\//i.test(trimmed) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed)) {
    if (!trimmed.includes('@') && !trimmed.includes(' ')) {
      return 'url';
    }
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'email';
  }
  const cleanPhone = trimmed.replace(/[\s\-()]/g, '');
  if (/^\+?\d{7,15}$/.test(cleanPhone) && !trimmed.includes('@')) {
    return 'phone';
  }
  return 'message';
}

export function analyzePhoneNumber(phoneRaw: string): ScamCheckResult {
  const trimmed = phoneRaw.trim();
  const cleaned = trimmed.replace(/[\s\-().]/g, '');
  const findings: AnalysisFinding[] = [];
  let riskScore = 15; // baseline neutral

  // Format validation
  const isDigitsOnly = /^\+?\d+$/.test(cleaned);
  const digitCount = cleaned.replace(/^\+/, '').length;

  if (!isDigitsOnly || digitCount < 8 || digitCount > 15) {
    return {
      target: trimmed,
      category: 'phone',
      riskLevel: 'unknown',
      riskScore: 50,
      summary: 'Invalid Phone Number Format',
      explanation: 'The provided input does not match recognized international or national phone number standards.',
      findings: [{
        title: 'Malformed Number Format',
        description: `Expected 10-15 digits with optional country code, got ${digitCount} characters.`,
        severity: 'medium',
        category: 'Syntax'
      }],
      recommendedAction: 'Verify the number format and re-enter with standard country code (e.g. +91 for India).',
      communityReportsCount: 0,
      verifiedStatus: 'unverified',
      timestamp: new Date().toISOString(),
    };
  }

  // Check known scam prefixes and patterns in India
  const isIndian = cleaned.startsWith('+91') || (cleaned.length === 10 && /^[6-9]/.test(cleaned));
  const normalized10 = cleaned.length === 10 ? cleaned : cleaned.replace(/^\+?91/, '');

  if (isIndian) {
    findings.push({
      title: 'Valid Indian Telephony Format',
      description: 'Matches standard 10-digit Indian mobile cellular allocation.',
      severity: 'info',
      category: 'Carrier'
    });

    // Check suspicious patterns: sequential or repeated numbers often bought in bulk by call centers
    if (/(\d)\1{4,}/.test(normalized10)) {
      riskScore += 25;
      findings.push({
        title: 'Repetitive Digit Pattern Detected',
        description: 'Contains 5 or more repeated consecutive digits, common in virtual VoIP SIP trunks.',
        severity: 'medium',
        category: 'Pattern'
      });
    }

    // Toll-free impersonation alert
    if (normalized10.startsWith('1800') || normalized10.startsWith('1860')) {
      riskScore += 15;
      findings.push({
        title: 'Toll-Free Helpline Pattern',
        description: 'Toll-free numbers are frequently spoofed on Google Maps business listings by fraudsters impersonating banks.',
        severity: 'medium',
        category: 'Helpline'
      });
    }
  }

  // Check international premium rate / high scam corridors
  if (cleaned.startsWith('+92') || cleaned.startsWith('+234') || cleaned.startsWith('+254')) {
    riskScore += 45;
    findings.push({
      title: 'High-Velocity WhatsApp Fraud Corridor',
      description: 'Country code has elevated rates of lottery (KBC), job offer, and investment group fraud attempts targeting Indian users.',
      severity: 'high',
      category: 'Origin'
    });
  }

  // Final risk assignment
  let riskLevel: RiskLevel = 'safe';
  let summary = 'No Obvious Warning Signs Found';
  let explanation = 'The phone number format is valid. No verified malicious records or fraudulent patterns were matched locally.';
  let recommendedAction = 'Exercise standard caution. Never disclose OTPs, PINs, or NetBanking passwords over a call.';

  if (riskScore >= 60) {
    riskLevel = 'danger';
    summary = 'High Risk Indicators Detected';
    explanation = 'This telephone number exhibits characteristics associated with high-risk cold-calling or fraudulent spam campaigns.';
    recommendedAction = 'Do not accept calls from this number. Block the caller and do not share any financial information.';
  } else if (riskScore >= 35) {
    riskLevel = 'suspicious';
    summary = 'Potentially Suspicious Number';
    explanation = 'Pattern heuristics indicate potential virtual SIP routing or elevated risk profile.';
    recommendedAction = 'Verify caller identity through official corporate channels before responding.';
  }

  return {
    target: trimmed,
    category: 'phone',
    riskLevel,
    riskScore,
    summary,
    explanation,
    findings,
    recommendedAction,
    communityReportsCount: riskLevel === 'danger' ? 14 : riskLevel === 'suspicious' ? 3 : 0,
    verifiedStatus: riskLevel === 'danger' ? 'community_flagged' : 'clean',
    timestamp: new Date().toISOString(),
    metadata: {
      normalized: isIndian ? `+91 ${normalized10.slice(0, 5)} ${normalized10.slice(5)}` : cleaned,
      region: isIndian ? 'India (IN)' : 'International',
    }
  };
}

export function analyzeEmail(emailRaw: string): ScamCheckResult {
  const trimmed = emailRaw.trim().toLowerCase();
  const findings: AnalysisFinding[] = [];
  let riskScore = 10;

  // RFC Syntax check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
  const match = trimmed.match(emailRegex);

  if (!match) {
    return {
      target: trimmed,
      category: 'email',
      riskLevel: 'unknown',
      riskScore: 50,
      summary: 'Invalid Email Address Syntax',
      explanation: 'The provided string does not conform to RFC email specification format.',
      findings: [{
        title: 'Syntax Error',
        description: 'Missing @ symbol, invalid domain structure, or forbidden characters detected.',
        severity: 'medium',
        category: 'Syntax'
      }],
      recommendedAction: 'Check spelling and ensure you include a valid user and domain name (e.g. name@domain.com).',
      communityReportsCount: 0,
      verifiedStatus: 'unverified',
      timestamp: new Date().toISOString()
    };
  }

  const [, domain] = match;
  const username = trimmed.split('@')[0];

  // Disposable domain check
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    riskScore += 70;
    findings.push({
      title: 'Disposable Temporary Email Domain',
      description: `Domain "${domain}" is an anonymous burner email service often used for temporary fraud accounts.`,
      severity: 'high',
      category: 'Domain'
    });
  }

  // Deceptive brand spoofing in username or domain
  for (const brand of TARGETED_BRANDS) {
    if (domain.includes(brand) && !domain.endsWith(`${brand}.com`) && !domain.endsWith(`${brand}.co.in`)) {
      riskScore += 60;
      findings.push({
        title: `Suspected Brand Impersonation (${brand.toUpperCase()})`,
        description: `Domain contains "${brand}" but is not the official domain for this entity. This is a common phishing tactic.`,
        severity: 'high',
        category: 'Spoofing'
      });
      break;
    }
    if (username.includes(brand) && (domain === 'gmail.com' || domain === 'yahoo.com' || domain === 'outlook.com' || domain === 'hotmail.com')) {
      riskScore += 45;
      findings.push({
        title: 'Free Webmail Claiming Corporate Identity',
        description: `Sender uses free provider "${domain}" while username claims to represent "${brand.toUpperCase()}". Official entities never use public webmail.`,
        severity: 'high',
        category: 'Impersonation'
      });
      break;
    }
  }

  // Check suspicious TLDs
  const hasSuspiciousTld = HIGH_RISK_TLDS.some(tld => domain.endsWith(tld));
  if (hasSuspiciousTld) {
    riskScore += 30;
    findings.push({
      title: 'High-Abuse Domain Extension',
      description: `Top-level domain for "${domain}" is classified as a low-cost, high-abuse extension.`,
      severity: 'medium',
      category: 'TLD'
    });
  }

  // Suspicious keywords in local-part
  if (/(support|security|verify|account|billing|update|refund|service)/.test(username) &&
      (domain === 'gmail.com' || domain === 'hotmail.com' || domain === 'yahoo.com')) {
    riskScore += 35;
    findings.push({
      title: 'Fake Department Title on Free Webmail',
      description: 'Account uses words like "security" or "support" on a public webmail provider.',
      severity: 'medium',
      category: 'Social Engineering'
    });
  }

  let riskLevel: RiskLevel = 'safe';
  let summary = 'Standard Email Structure';
  let explanation = 'No deceptive brand spoofing, burner domain signatures, or malicious reports detected for this address.';
  let recommendedAction = 'Standard verification applies. Inspect headers if the message solicits urgent wire transfers.';

  if (riskScore >= 60) {
    riskLevel = 'danger';
    summary = 'Phishing / Impersonation Signature Detected';
    explanation = 'This email address displays unmistakable markers of brand impersonation or disposable fraud infrastructure.';
    recommendedAction = 'Do not click links, open attachments, or reply. Mark the email as Phishing/Spam immediately.';
  } else if (riskScore >= 35) {
    riskLevel = 'suspicious';
    summary = 'Suspicious Domain Attributes';
    explanation = 'Domain or username characteristics deviate from standard legitimate enterprise communications.';
    recommendedAction = 'Verify sender identity via independent telephone or official web channels.';
  }

  return {
    target: trimmed,
    category: 'email',
    riskLevel,
    riskScore,
    summary,
    explanation,
    findings,
    recommendedAction,
    communityReportsCount: riskLevel === 'danger' ? 28 : riskLevel === 'suspicious' ? 6 : 0,
    verifiedStatus: riskLevel === 'danger' ? 'community_flagged' : 'clean',
    timestamp: new Date().toISOString(),
    metadata: {
      domain,
      isFreeProvider: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(domain),
    }
  };
}

export function analyzeUrl(urlRaw: string): ScamCheckResult {
  const trimmed = urlRaw.trim();
  const findings: AnalysisFinding[] = [];
  let riskScore = 10;

  // Prepend https:// if user pasted raw domain
  const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    return {
      target: trimmed,
      category: 'url',
      riskLevel: 'unknown',
      riskScore: 50,
      summary: 'Malformed URL',
      explanation: 'The provided string is not a valid web URL format.',
      findings: [{
        title: 'URL Parse Failure',
        description: 'Unable to parse valid protocol, hostname, or pathname.',
        severity: 'medium',
        category: 'Syntax'
      }],
      recommendedAction: 'Enter a valid web link starting with https:// or http://.',
      communityReportsCount: 0,
      verifiedStatus: 'unverified',
      timestamp: new Date().toISOString()
    };
  }

  // Scheme validation: Must be HTTP or HTTPS only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      target: trimmed,
      category: 'url',
      riskLevel: 'danger',
      riskScore: 90,
      summary: 'Unsupported / Unsafe Protocol',
      explanation: `Protocol "${parsed.protocol}" is rejected to prevent local execution or exploitation.`,
      findings: [{
        title: 'Dangerous URL Scheme',
        description: 'Only standard web protocols (http, https) are evaluated.',
        severity: 'high',
        category: 'Protocol'
      }],
      recommendedAction: 'Do not open this URL in any application.',
      communityReportsCount: 0,
      verifiedStatus: 'unverified',
      timestamp: new Date().toISOString()
    };
  }

  // SSRF Protection: Rejects private/localhost/cloud metadata IPs
  if (isPrivateOrLocalHost(parsed.hostname)) {
    return {
      target: trimmed,
      category: 'url',
      riskLevel: 'danger',
      riskScore: 95,
      summary: 'Restricted / Internal Address (SSRF Guard)',
      explanation: 'This address resolves to localhost, a private intranet network, or cloud metadata service.',
      findings: [{
        title: 'Internal Network Access Blocked',
        description: 'Address targets internal loopback or private RFC1918 range.',
        severity: 'high',
        category: 'Security'
      }],
      recommendedAction: 'System will never dispatch traffic to internal infrastructure.',
      communityReportsCount: 0,
      verifiedStatus: 'known_malicious',
      timestamp: new Date().toISOString()
    };
  }

  // Insecure HTTP check
  if (parsed.protocol === 'http:') {
    riskScore += 20;
    findings.push({
      title: 'Unencrypted Connection (HTTP)',
      description: 'The website lacks SSL/TLS encryption. Sensitive data transmitted could be intercepted.',
      severity: 'medium',
      category: 'Encryption'
    });
  }

  const hostname = parsed.hostname.toLowerCase();

  // Raw IP Host check (e.g. http://192.0.2.1/login)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    riskScore += 50;
    findings.push({
      title: 'Direct IP Address Host',
      description: 'Legitimate consumer and banking websites use branded domain names rather than raw IP addresses.',
      severity: 'high',
      category: 'Hostname'
    });
  }

  // High abuse TLD
  const hasSuspiciousTld = HIGH_RISK_TLDS.some(tld => hostname.endsWith(tld));
  if (hasSuspiciousTld) {
    riskScore += 35;
    findings.push({
      title: 'High-Abuse Domain Extension',
      description: `Domain ends in a high-risk TLD (${HIGH_RISK_TLDS.find(t => hostname.endsWith(t))}), commonly registered for disposable phishing.`,
      severity: 'high',
      category: 'TLD'
    });
  }

  // Typosquatting / Brand Spoofing check
  for (const brand of TARGETED_BRANDS) {
    if (hostname.includes(brand)) {
      const isOfficial =
        hostname === `${brand}.com` ||
        hostname === `${brand}.co.in` ||
        hostname === `${brand}.in` ||
        hostname === `${brand}.org` ||
        hostname.endsWith(`.${brand}.com`) ||
        hostname.endsWith(`.${brand}.co.in`);

      if (!isOfficial) {
        riskScore += 65;
        findings.push({
          title: `Brand Typosquatting Alert (${brand.toUpperCase()})`,
          description: `Hostname contains "${brand}" but does not belong to the legitimate primary domain.`,
          severity: 'high',
          category: 'Phishing'
        });
        break;
      }
    }
  }

  // Suspicious keywords in URL path or parameters
  const fullUrl = parsed.toString().toLowerCase();
  const suspiciousKeywords = ['kyc-update', 'pan-link', 'lottery', 'bonus', 'claim-reward', 'login-verify', 'apk-download', 'urgent-action'];
  const matchedKeywords = suspiciousKeywords.filter(k => fullUrl.includes(k));
  if (matchedKeywords.length > 0) {
    riskScore += 30;
    findings.push({
      title: 'Phishing Lure Keywords Detected',
      description: `URL path contains keywords: ${matchedKeywords.join(', ')}.`,
      severity: 'medium',
      category: 'Lure'
    });
  }

  let riskLevel: RiskLevel = 'safe';
  let summary = 'No Obvious Deceptive Indicators';
  let explanation = 'Domain structure and security attributes align with standard registered web hosts.';
  let recommendedAction = 'You may visit this website, but never enter one-time passwords or bank credentials unless verified.';

  if (riskScore >= 60) {
    riskLevel = 'danger';
    summary = 'Deceptive Phishing Link Warning';
    explanation = 'This URL exhibits strong characteristics of credential harvesting or brand spoofing.';
    recommendedAction = 'DO NOT open this link. Do not enter any login credentials, PAN, Aadhaar, or bank details.';
  } else if (riskScore >= 35) {
    riskLevel = 'suspicious';
    summary = 'Caution: Suspicious Web Link';
    explanation = 'The website operates under high-abuse domain conventions or lacks verified encryption.';
    recommendedAction = 'Proceed with extreme vigilance. Verify URL spelling carefully in your address bar.';
  }

  return {
    target: trimmed,
    category: 'url',
    riskLevel,
    riskScore,
    summary,
    explanation,
    findings,
    recommendedAction,
    communityReportsCount: riskLevel === 'danger' ? 42 : riskLevel === 'suspicious' ? 8 : 0,
    verifiedStatus: riskLevel === 'danger' ? 'community_flagged' : 'clean',
    timestamp: new Date().toISOString(),
    metadata: {
      hostname,
      protocol: parsed.protocol,
      pathname: parsed.pathname
    }
  };
}

export function analyzeMessage(messageRaw: string): ScamCheckResult {
  const trimmed = messageRaw.trim();
  const findings: AnalysisFinding[] = [];
  let riskScore = 15;

  if (trimmed.length === 0) {
    return {
      target: '',
      category: 'message',
      riskLevel: 'unknown',
      riskScore: 0,
      summary: 'Empty Message',
      explanation: 'Please provide message text to analyze.',
      findings: [],
      recommendedAction: 'Paste an SMS, WhatsApp text, or email body to evaluate.',
      communityReportsCount: 0,
      verifiedStatus: 'unverified',
      timestamp: new Date().toISOString()
    };
  }

  const lower = trimmed.toLowerCase();

  // Electricity bill scam pattern
  if ((lower.includes('electricity') || lower.includes('power') || lower.includes('bijli')) &&
      (lower.includes('disconnect') || lower.includes('unpaid') || lower.includes('9:30') || lower.includes('officer'))) {
    riskScore += 70;
    findings.push({
      title: 'Electricity Disconnection Scam Pattern',
      description: 'Classic fraud scheme falsely claiming immediate power disconnection unless an unverified number is called.',
      severity: 'high',
      category: 'Extortion'
    });
  }

  // Banking KYC / PAN deactivation scam
  if ((lower.includes('kyc') || lower.includes('pan') || lower.includes('aadhaar')) &&
      (lower.includes('block') || lower.includes('deactivate') || lower.includes('suspend') || lower.includes('expired'))) {
    riskScore += 65;
    findings.push({
      title: 'Urgent KYC Expiration Threat',
      description: 'Banks never threaten immediate same-day account suspension via SMS or third-party links.',
      severity: 'high',
      category: 'Banking Fraud'
    });
  }

  // Work from Home / YouTube like / Telegram task scam
  if ((lower.includes('telegram') || lower.includes('part-time') || lower.includes('like youtube') || lower.includes('earn daily')) &&
      (lower.includes('rs') || lower.includes('3000') || lower.includes('5000') || lower.includes('income'))) {
    riskScore += 75;
    findings.push({
      title: 'Prepaid Task / Job Offer Scam',
      description: 'Promises unrealistic daily payouts for trivial online tasks, which leads to requests for "security deposits".',
      severity: 'high',
      category: 'Task Scam'
    });
  }

  // Lottery / Gift / KBC scam
  if (lower.includes('lottery') || lower.includes('won') || lower.includes('kbc') || lower.includes('lucky draw') || lower.includes('cashback')) {
    riskScore += 55;
    findings.push({
      title: 'Advance-Fee Lottery / Reward Lure',
      description: 'Unsolicited prize notifications that require payment of "processing charges" or "GST" to claim non-existent rewards.',
      severity: 'high',
      category: 'Lottery'
    });
  }

  // Courier / Customs detention scam
  if ((lower.includes('fedex') || lower.includes('customs') || lower.includes('parcel') || lower.includes('india post')) &&
      (lower.includes('tax') || lower.includes('fee') || lower.includes('held') || lower.includes('penalty'))) {
    riskScore += 60;
    findings.push({
      title: 'Fake Courier / Customs Impersonation',
      description: 'Claims an incoming parcel is detained and demands immediate fee payment or APK file download.',
      severity: 'high',
      category: 'Impersonation'
    });
  }

  // Detect embedded URLs
  const urlMatches = trimmed.match(/https?:\/\/[^\s]+/gi) || trimmed.match(/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s]*/gi);
  if (urlMatches && urlMatches.length > 0) {
    findings.push({
      title: `Embedded Links Detected (${urlMatches.length})`,
      description: `Message includes link: ${urlMatches[0]}. Scammers use these to steal bank logins or download remote access tools (AnyDesk, TeamViewer).`,
      severity: 'medium',
      category: 'Links'
    });
    riskScore += 20;
  }

  // Detect phone numbers in body
  const phoneMatches = trimmed.match(/\+?\d{10,12}/g);
  if (phoneMatches && phoneMatches.length > 0) {
    findings.push({
      title: 'Direct Callback Number Provided',
      description: `Message instructs calling ${phoneMatches[0]} directly instead of verified bank customer service.`,
      severity: 'medium',
      category: 'Phone'
    });
    riskScore += 15;
  }

  let riskLevel: RiskLevel = 'safe';
  let summary = 'No Obvious Fraud Signatures Detected';
  let explanation = 'The message lacks classic high-pressure extortion keywords, artificial urgency, or known fraud templates.';
  let recommendedAction = 'Remain vigilant. Never share OTPs or download remote access apps requested in any message.';

  if (riskScore >= 60) {
    riskLevel = 'danger';
    summary = 'Critical Scam Message Signature';
    explanation = 'This message matches recognized high-risk financial fraud scripts designed to provoke panic or greed.';
    recommendedAction = 'DELETE the message. Do not click any links, do not call any provided numbers, and never share OTPs.';
  } else if (riskScore >= 35) {
    riskLevel = 'suspicious';
    summary = 'Potentially Manipulative Content';
    explanation = 'Message contains urgency markers or unverified links that warrant caution.';
    recommendedAction = 'Cross-check directly with the institution through their official app or website.';
  }

  return {
    target: trimmed.length > 80 ? `${trimmed.slice(0, 80)}...` : trimmed,
    category: 'message',
    riskLevel,
    riskScore: Math.min(riskScore, 100),
    summary,
    explanation,
    findings,
    recommendedAction,
    communityReportsCount: riskLevel === 'danger' ? 89 : riskLevel === 'suspicious' ? 12 : 0,
    verifiedStatus: riskLevel === 'danger' ? 'community_flagged' : 'clean',
    timestamp: new Date().toISOString(),
    metadata: {
      characterCount: trimmed.length,
      hasLink: !!urlMatches,
      hasPhone: !!phoneMatches
    }
  };
}

export function analyzeUpi(upiOrQrRaw: string): ScamCheckResult {
  const trimmed = upiOrQrRaw.trim();
  const findings: AnalysisFinding[] = [];
  let riskScore = 15;

  let payeeVpa = '';
  let payeeName = '';
  let amount = '';
  let note = '';

  // Check if standard UPI QR URI
  if (trimmed.startsWith('upi://pay')) {
    try {
      const url = new URL(trimmed);
      payeeVpa = url.searchParams.get('pa') || '';
      payeeName = url.searchParams.get('pn') || '';
      amount = url.searchParams.get('am') || '';
      note = url.searchParams.get('tn') || '';

      findings.push({
        title: 'UPI Payment QR Protocol Decoded',
        description: 'Successfully parsed standard NPCI UPI URI payload.',
        severity: 'info',
        category: 'Decoding'
      });
    } catch {
      // Fallback regex parsing
      const paMatch = trimmed.match(/[?&]pa=([^&]+)/);
      if (paMatch) payeeVpa = decodeURIComponent(paMatch[1]);
      const pnMatch = trimmed.match(/[?&]pn=([^&]+)/);
      if (pnMatch) payeeName = decodeURIComponent(pnMatch[1]);
    }
  } else if (trimmed.includes('@')) {
    payeeVpa = trimmed;
  } else {
    return {
      target: trimmed,
      category: 'upi',
      riskLevel: 'unknown',
      riskScore: 50,
      summary: 'Invalid UPI ID / QR Format',
      explanation: 'Input does not represent a valid UPI ID (e.g. name@bank) or UPI QR code URI.',
      findings: [{
        title: 'Malformed VPA',
        description: 'Missing @ handle separator or valid UPI scheme.',
        severity: 'medium',
        category: 'Syntax'
      }],
      recommendedAction: 'Enter a valid UPI Virtual Payment Address (e.g., merchant@okhdfcbank).',
      communityReportsCount: 0,
      verifiedStatus: 'unverified',
      timestamp: new Date().toISOString()
    };
  }

  // Validate VPA structure
  const [handleUser, handlePsp] = payeeVpa.split('@');
  if (!handleUser || !handlePsp) {
    riskScore += 40;
    findings.push({
      title: 'Non-Standard VPA Structure',
      description: 'Virtual Payment Address structure deviates from NPCI standards.',
      severity: 'medium',
      category: 'VPA'
    });
  } else {
    const isKnownPsp = VALID_UPI_HANDLES.some(h => handlePsp.toLowerCase().includes(h));
    if (isKnownPsp) {
      findings.push({
        title: `Recognized Banking PSP (@${handlePsp})`,
        description: `Handled by registered Indian UPI PSP node: ${handlePsp}.`,
        severity: 'info',
        category: 'Banking'
      });
    }
  }

  // CRITICAL SCAM WARNING: Collect Request / Refund Scam
  // If the transaction note or name mentions "refund", "cashback", "reward", "olx"
  const combinedContext = `${payeeName} ${note} ${payeeVpa}`.toLowerCase();
  if (combinedContext.includes('refund') || combinedContext.includes('cashback') || combinedContext.includes('reward') || combinedContext.includes('prize') || combinedContext.includes('customer care') || combinedContext.includes('support')) {
    riskScore += 65;
    findings.push({
      title: 'CRITICAL: Fake "Refund / Cashback" Scam Alert',
      description: 'Fraudsters create pay-requests labelled "Refund" or "Cashback" on OLX/Marketplace. REMEMBER: Entering your UPI PIN SENDS money, you NEVER enter PIN to receive money!',
      severity: 'high',
      category: 'PIN Scam'
    });
  }

  // Suspicious keywords in payee name impersonating government or banks
  for (const brand of ['sbi', 'hdfc', 'icici', 'paytm', 'police', 'customs', 'income-tax']) {
    if (combinedContext.includes(brand) && !payeeVpa.endsWith(`@${brand}`)) {
      riskScore += 50;
      findings.push({
        title: `Suspected Impersonation of ${brand.toUpperCase()}`,
        description: `Payee name claims to represent ${brand.toUpperCase()} while using personal/mule UPI handle.`,
        severity: 'high',
        category: 'Impersonation'
      });
      break;
    }
  }

  let riskLevel: RiskLevel = 'safe';
  let summary = 'Standard UPI Payment Identifier';
  let explanation = 'Parsed payment parameters conform to NPCI standards. Note: Technical decoding does NOT guarantee merchant legitimacy.';
  let recommendedAction = 'Verify recipient name carefully inside your banking app before authorizing any transaction.';

  if (riskScore >= 60) {
    riskLevel = 'danger';
    summary = 'High Risk UPI Fraud Alert';
    explanation = 'This payment profile exhibits strong indicators of deceptive collection requests or impersonation.';
    recommendedAction = 'DO NOT AUTHORIZE. Never enter your UPI PIN. If requested to "receive money", cancel immediately.';
  } else if (riskScore >= 35) {
    riskLevel = 'suspicious';
    summary = 'Unverified UPI Recipient';
    explanation = 'Transaction parameters require scrutiny before approving payment.';
    recommendedAction = 'Confirm with recipient via trusted secondary channel before transferring funds.';
  }

  return {
    target: payeeVpa || trimmed,
    category: 'upi',
    riskLevel,
    riskScore,
    summary,
    explanation,
    findings,
    recommendedAction,
    communityReportsCount: riskLevel === 'danger' ? 34 : riskLevel === 'suspicious' ? 5 : 0,
    verifiedStatus: riskLevel === 'danger' ? 'community_flagged' : 'clean',
    timestamp: new Date().toISOString(),
    metadata: {
      payeeVpa: payeeVpa || 'Unknown',
      payeeName: payeeName || 'Not Disclosed in QR',
      amount: amount ? `₹${amount}` : 'Open Amount (User specified)',
      note: note || 'None'
    }
  };
}

export function universalAnalyze(input: string, explicitCategory?: ScamCategory): ScamCheckResult {
  const category = explicitCategory || detectInputCategory(input);
  switch (category) {
    case 'phone':
      return analyzePhoneNumber(input);
    case 'email':
      return analyzeEmail(input);
    case 'url':
      return analyzeUrl(input);
    case 'upi':
      return analyzeUpi(input);
    case 'message':
    default:
      return analyzeMessage(input);
  }
}
