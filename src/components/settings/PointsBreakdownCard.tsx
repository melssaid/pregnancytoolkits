import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Gift, Sparkles, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QUOTA_TIERS } from '@/services/smartEngine';
import { useAIUsage } from '@/contexts/AIUsageContext';

const STORAGE_KEY = 'smart_quota_v2';

interface StoredQuota {
  monthKey: string;
  used: number;
  tier: 'free' | 'premium';
  bonusCredits?: number;
  promoBonusCredits?: number;
}

function readStored(): StoredQuota {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { monthKey: '', used: 0, tier: 'free' };
}

export const PointsBreakdownCard: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { used, limit, remaining } = useAIUsage();
  const [stored, setStored] = useState<StoredQuota>(() => readStored());

  // Re-read whenever AI usage context changes (e.g. after coupon redemption)
  useEffect(() => {
    setStored(readStored());
  }, [used, limit, remaining]);

  const tierConfig = QUOTA_TIERS[stored.tier] || QUOTA_TIERS.free;
  const basePoints = tierConfig.monthly;
  const couponPoints = stored.bonusCredits || 0;
  const promoPoints = stored.promoBonusCredits || 0;
  const total = basePoints + couponPoints + promoPoints;

  const t = {
    title: isRTL ? 'تفصيل نقاط الذكاء الاصطناعي' : 'AI Points Breakdown',
    subtitle: isRTL ? 'كيف تم احتساب رصيدك الحالي' : 'How your balance is calculated',
    base: isRTL
      ? `نقاط الباقة (${stored.tier === 'premium' ? 'بريميوم' : 'مجاني'})`
      : `Plan points (${tierConfig.label})`,
    coupons: isRTL ? 'نقاط القسائم المُفعّلة' : 'Activated coupon points',
    promo: isRTL ? 'نقاط ترويجية مجانية' : 'Free promo points',
    total: isRTL ? 'الإجمالي الشهري' : 'Monthly total',
    used: isRTL ? 'المُستهلك' : 'Used',
    remaining: isRTL ? 'المتبقي' : 'Remaining',
    points: isRTL ? 'نقطة' : 'pts',
  };

  const rows: { icon: typeof Coins; label: string; value: number; color: string; show: boolean }[] = [
    {
      icon: stored.tier === 'premium' ? Crown : Coins,
      label: t.base,
      value: basePoints,
      color: stored.tier === 'premium' ? 'text-amber-600' : 'text-primary',
      show: true,
    },
    {
      icon: Gift,
      label: t.coupons,
      value: couponPoints,
      color: 'text-emerald-600',
      show: couponPoints > 0,
    },
    {
      icon: Sparkles,
      label: t.promo,
      value: promoPoints,
      color: 'text-violet-600',
      show: promoPoints > 0,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
            <Coins className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-foreground leading-tight">{t.title}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Breakdown rows */}
      <div className="px-4 py-3 space-y-2">
        {rows.filter(r => r.show).map((row, idx) => {
          const Icon = row.icon;
          return (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${row.color}`} />
                <span className="text-[12.5px] text-foreground/85 truncate">{row.label}</span>
              </div>
              <span className={`text-[13px] font-bold tabular-nums ${row.color}`}>
                +{row.value}
              </span>
            </div>
          );
        })}

        {/* Divider */}
        <div className="border-t border-dashed border-border/60 my-2" />

        {/* Total */}
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <span className="text-[13px] font-bold text-foreground">{t.total}</span>
          <span className="text-[16px] font-extrabold text-primary tabular-nums">
            {total} <span className="text-[10px] font-medium text-muted-foreground">{t.points}</span>
          </span>
        </div>
      </div>

      {/* Usage footer */}
      <div className="px-4 py-3 bg-muted/30 border-t border-border/50 grid grid-cols-2 gap-2">
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.used}</div>
          <div className="text-[14px] font-bold text-foreground tabular-nums mt-0.5">{used}</div>
        </div>
        <div className="text-center border-s border-border/50">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.remaining}</div>
          <div className="text-[14px] font-bold text-emerald-600 tabular-nums mt-0.5">{remaining}</div>
        </div>
      </div>
    </motion.div>
  );
};
