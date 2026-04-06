import { describe, it, expect, beforeEach } from 'vitest';
import { getQuotaState, canAfford, consumeQuota, setTier, clearAdminBypass } from '../quotaManager';
import { resolveWeight, TOOL_WEIGHT_REGISTRY } from '../types';

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

  it('premium tier has 60 limit', () => {
    setTier('premium');
    const state = getQuotaState();
    expect(state.tier).toBe('premium');
    expect(state.limit).toBe(60);
    expect(state.remaining).toBe(60);
  });

  it('exhausts premium quota at 60', () => {
    setTier('premium');
    for (let i = 0; i < 60; i++) consumeQuota(1);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      monthKey: '2020-01',
      used: 99,
      tier: 'free',
    }));
    const state = getQuotaState();
    expect(state.used).toBe(0);
    expect(state.remaining).toBe(5);
  });

  it('does not double-deduct on sequential calls', () => {
    consumeQuota(1);
    consumeQuota(1);
    const state = getQuotaState();
    expect(state.used).toBe(2); // exactly 2, not more
  });

  it('weight-2 tool exhausts free quota faster', () => {
    consumeQuota(2); // 2 used
    consumeQuota(2); // 4 used
    expect(canAfford(2)).toBe(false); // only 1 remaining
    expect(canAfford(1)).toBe(true);
    consumeQuota(1); // 5 used
    expect(getQuotaState().isExhausted).toBe(true);
  });
});

describe('TOOL_WEIGHT_REGISTRY', () => {
  it('bump-photos has weight 2', () => {
    expect(TOOL_WEIGHT_REGISTRY['bump-photos']).toBe(2);
  });

  it('all standard tools have weight 1', () => {
    const standardTools = [
      'symptom-analysis', 'pregnancy-assistant',
      'kick-analysis', 'mental-health', 'weight-analysis',
      'hospital-bag', 'birth-plan', 'contraction-analysis',
    ] as const;
    for (const tool of standardTools) {
      expect(TOOL_WEIGHT_REGISTRY[tool]).toBe(1);
    }
  });

  it('light tools have weight 0.5', () => {
    const lightTools = [
      'meal-suggestion', 'vitamin-advice', 'baby-cry-analysis',
      'skincare-advice', 'partner-guide', 'birth-position',
      'grocery-list', 'craving-alternatives', 'nausea-relief',
      'sleep-analysis', 'sleep-meditation', 'sleep-routine',
    ] as const;
    for (const tool of lightTools) {
      expect(TOOL_WEIGHT_REGISTRY[tool]).toBe(0.5);
    }
  });

  it('registry covers every AIToolType', () => {
    const keys = Object.keys(TOOL_WEIGHT_REGISTRY);
    expect(keys.length).toBeGreaterThanOrEqual(30);
    for (const key of keys) {
      expect([0, 0.5, 1, 2]).toContain(TOOL_WEIGHT_REGISTRY[key as keyof typeof TOOL_WEIGHT_REGISTRY]);
    }
  });
});

describe('resolveWeight', () => {
  it('resolves bump-photos to weight 2 from toolType', () => {
    expect(resolveWeight('bump-photos')).toBe(2);
  });

  it('resolves standard tool to weight 1 from toolType', () => {
    expect(resolveWeight('symptom-analysis')).toBe(1);
  });

  it('resolves weight from section when no toolType', () => {
    expect(resolveWeight(undefined, 'ultrasound')).toBe(2); // maps to bump-photos
  });

  it('resolves weight from section for standard sections', () => {
    expect(resolveWeight(undefined, 'symptoms')).toBe(1);
  });

  it('defaults to 1 for unknown inputs', () => {
    expect(resolveWeight(undefined, undefined)).toBe(1);
  });
});
