/**
 * Security, SQL Injection Defense & Privacy Management Service
 * Provides rigorous validation against SQLi, XSS, and manages cookie preferences.
 */

// Common SQL Injection signatures and patterns
const SQLI_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b/i,
  /\b(OR|AND)\b\s+["'\d\w]+\s*=\s*["'\d\w]+/i,
  /\b(BENCHMARK|SLEEP|PG_SLEEP|WAITFOR +DELAY)\b/i,
  /\b(CONCAT|CHAR|SCHEMA|INFORMATION_SCHEMA)\b/i,
];

export interface SecurityCheckResult {
  isSafe: boolean;
  detectedThreat?: string;
  sanitizedValue: string;
}

/**
 * Validates input strings against SQL Injection & script injection attacks.
 */
export function sanitizeAndCheckSql(input: string): SecurityCheckResult {
  if (!input || typeof input !== 'string') {
    return { isSafe: true, sanitizedValue: '' };
  }

  for (const pattern of SQLI_PATTERNS) {
    if (pattern.test(input)) {
      // Remove dangerous characters and neutralize
      const neutralized = input
        .replace(/['";\-\-]/g, '')
        .replace(/\b(OR|AND|UNION|SELECT|DROP|INSERT|DELETE|EXEC)\b/gi, '[BLOCKED]');

      return {
        isSafe: false,
        detectedThreat: `SQL Injection pattern matched: ${pattern.toString()}`,
        sanitizedValue: neutralized,
      };
    }
  }

  // HTML entity encode for XSS safety
  const safe = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return { isSafe: true, sanitizedValue: safe };
}

export interface CookiePreferences {
  essential: boolean;     // Local encrypted vault storage
  analytics: boolean;     // Anonymous performance metrics
  functional: boolean;    // Audio filter & theme presets
  consentGiven: boolean;
  consentTimestamp?: number;
}

const COOKIE_PREFS_KEY = 'ghost_cookie_preferences';

export function getCookiePreferences(): CookiePreferences {
  if (typeof localStorage === 'undefined') {
    return { essential: true, analytics: false, functional: true, consentGiven: false };
  }
  const raw = localStorage.getItem(COOKIE_PREFS_KEY);
  if (!raw) {
    return { essential: true, analytics: false, functional: true, consentGiven: false };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { essential: true, analytics: false, functional: true, consentGiven: false };
  }
}

export function saveCookiePreferences(prefs: Partial<CookiePreferences>): CookiePreferences {
  const updated: CookiePreferences = {
    ...getCookiePreferences(),
    ...prefs,
    essential: true, // Essential is strictly required for IndexedDB vault
    consentGiven: true,
    consentTimestamp: Date.now(),
  };
  localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(updated));
  return updated;
}
