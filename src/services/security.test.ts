import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { sanitizeAndCheckSql, getCookiePreferences, saveCookiePreferences } from './security';

describe('Security & SQL Injection Defense', () => {
  const store: Record<string, string> = {};

  beforeAll(() => {
    (global as any).localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    };
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('detects and neutralizes SQL Injection pattern', () => {
    const maliciousInput = "admin' OR '1'='1";
    const result = sanitizeAndCheckSql(maliciousInput);
    expect(result.isSafe).toBe(false);
    expect(result.detectedThreat).toBeDefined();
    expect(result.sanitizedValue).not.toContain("' OR '1'='1");
  });

  it('detects UNION SELECT attacks', () => {
    const malicious = "1; UNION SELECT * FROM users--";
    const result = sanitizeAndCheckSql(malicious);
    expect(result.isSafe).toBe(false);
  });

  it('allows clean input with HTML escaping', () => {
    const clean = 'Meeting with Dr. Jane & team <Engineering>';
    const result = sanitizeAndCheckSql(clean);
    expect(result.isSafe).toBe(true);
    expect(result.sanitizedValue).toContain('&amp;');
    expect(result.sanitizedValue).toContain('&lt;Engineering&gt;');
  });

  it('saves and retrieves cookie preferences', () => {
    const initial = getCookiePreferences();
    expect(initial.essential).toBe(true);

    const updated = saveCookiePreferences({ analytics: true, functional: false });
    expect(updated.analytics).toBe(true);
    expect(updated.consentGiven).toBe(true);

    const reloaded = getCookiePreferences();
    expect(reloaded.analytics).toBe(true);
  });
});
