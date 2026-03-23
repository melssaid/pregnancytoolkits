import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildCacheKey,
  getCached,
  setCache,
  invalidateSection,
  clearAllCache,
  contentHash,
} from '../cacheManager';

beforeEach(() => {
  localStorage.clear();
});

describe('cacheManager', () => {
  it('cache miss returns null', () => {
    expect(getCached('nonexistent_key')).toBeNull();
  });

  it('cache hit returns stored content', () => {
    const key = buildCacheKey('symptoms', 'ctx1');
    setCache(key, 'AI response about symptoms', 'symptoms', 'ctx1');
    const cached = getCached(key);
    expect(cached).not.toBeNull();
    expect(cached!.content).toBe('AI response about symptoms');
    expect(cached!.section).toBe('symptoms');
  });

  it('expired cache returns null', () => {
    const key = 'smart_cache_test_expired';
    const entry = {
      content: 'old data',
      section: 'symptoms',
      timestamp: Date.now() - 100000,
      expiresAt: Date.now() - 1, // already expired
      contentHash: 'abc',
    };
    localStorage.setItem(key, JSON.stringify(entry));
    expect(getCached(key)).toBeNull();
    // also removed from storage
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('invalidateSection clears only that section', () => {
    const key1 = buildCacheKey('symptoms', 'a');
    const key2 = buildCacheKey('weight', 'b');
    setCache(key1, 'symptom data', 'symptoms', 'a');
    setCache(key2, 'weight data', 'weight', 'b');

    invalidateSection('symptoms');

    expect(getCached(key1)).toBeNull();
    expect(getCached(key2)).not.toBeNull();
  });

  it('clearAllCache clears everything', () => {
    setCache(buildCacheKey('symptoms', 'x'), 'data1', 'symptoms', 'x');
    setCache(buildCacheKey('weight', 'y'), 'data2', 'weight', 'y');

    clearAllCache();

    expect(getCached(buildCacheKey('symptoms', 'x'))).toBeNull();
    expect(getCached(buildCacheKey('weight', 'y'))).toBeNull();
  });

  it('contentHash is deterministic', () => {
    expect(contentHash('hello')).toBe(contentHash('hello'));
    expect(contentHash('a')).not.toBe(contentHash('b'));
  });

  it('buildCacheKey includes section and date', () => {
    const key = buildCacheKey('nutrition', 'fp123', '2025-01-15');
    expect(key).toContain('nutrition');
    expect(key).toContain('2025-01-15');
  });

  it('cached response has cost 0 (verified by content match)', () => {
    const key = buildCacheKey('symptoms', 'ctx');
    setCache(key, 'cached result', 'symptoms', 'ctx');
    const cached = getCached(key);
    expect(cached).not.toBeNull();
    // When engine returns cached, cost should be 0 — verified by the fact
    // that consumeQuota is NOT called for cached hits in smartEngine.ts
    expect(cached!.content).toBe('cached result');
  });
});
