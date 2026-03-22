import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getQuotaState, canAfford, consumeQuota, setTier, clearAdminBypass } from '../quotaManager';

const STORAGE_KEY = 'smart_quota_v2';
const ADMIN_KEY = 'smart_admin_bypass';

beforeEach(() => {
  localStorage.clear();
});

describe('quotaManager', () => {
  it('defaults to free tier with 5 limit', () => {
    const state = getQuotaState();
    expect(state.tier).toBe('free');
    expect(state.limit).toBe(5);
    expect(state.remaining).toBe(5);
    expect(state.used).toBe(0);
    expect(state.isExhausted).toBe(false);
  });

  it('consumes quota with weight 1', () => {
    consumeQuota(1);
    const state = getQuotaState();
    expect(state.used).toBe(1);
    expect(state.remaining).toBe(4);
  });

  it('consumes quota with weight 2 (ultrasound)', () => {
    consumeQuota(2);
    const state = getQuotaState();
    expect(state.used).toBe(2);
    expect(state.remaining).toBe(3);
  });

  it('exhausts free quota at 5', () => {
    for (let i = 0; i < 5; i++) consumeQuota(1);
    const state = getQuotaState();
    expect(state.isExhausted).toBe(true);
    expect(state.remaining).toBe(0);
    expect(canAfford(1)).toBe(false);
  });

  it('free user cannot afford weight-2 when only 1 remaining', () => {
    for (let i = 0; i < 4; i++) consumeQuota(1);
    expect(canAfford(1)).toBe(true);
    expect(canAfford(2)).toBe(false);
  });

  it('premium tier has 40 limit', () => {
    setTier('premium');
    const state = getQuotaState();
    expect(state.tier).toBe('premium');
    expect(state.limit).toBe(40);
    expect(state.remaining).toBe(40);
  });

  it('exhausts premium quota at 40', () => {
    setTier('premium');
    for (let i = 0; i < 40; i++) consumeQuota(1);
    const state = getQuotaState();
    expect(state.isExhausted).toBe(true);
    expect(state.remaining).toBe(0);
  });

  it('isNearLimit triggers when remaining <= 2', () => {
    for (let i = 0; i < 3; i++) consumeQuota(1);
    const state = getQuotaState();
    expect(state.isNearLimit).toBe(true);
    expect(state.remaining).toBe(2);
  });

  it('admin bypass grants 999 limit', () => {
    localStorage.setItem(ADMIN_KEY, 'true');
    const state = getQuotaState();
    expect(state.adminBypass).toBe(true);
    expect(state.limit).toBe(999);
    expect(canAfford(1)).toBe(true);
    clearAdminBypass();
    expect(getQuotaState().adminBypass).toBe(false);
  });

  it('resets when month changes', () => {
    // Simulate old month data
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      monthKey: '2020-01',
      used: 99,
      tier: 'free',
    }));
    const state = getQuotaState();
    expect(state.used).toBe(0); // reset because month changed
    expect(state.remaining).toBe(5);
  });
});
