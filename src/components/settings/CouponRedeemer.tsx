import React, { useState } from 'react';
import { Ticket, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useActiveCoupon } from '@/hooks/useActiveCoupon';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const CouponRedeemer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [code, setCode] = useState('');
  const { activeCoupon, isActive, redeeming, redeemCoupon, remainingTime } = useActiveCoupon();
  const { refresh } = useAIUsage();

  const handleRedeem = async () => {
    if (!code.trim()) return;
    const result = await redeemCoupon(code);
    if (result.success) {
      toast.success(isRTL ? '🎉 تم تفعيل القسيمة بنجاح!' : '🎉 Coupon activated!');
      setCode('');
      // Refresh quota so premium kicks in
      refresh();
    } else {
      const errors: Record<string, string> = {
        INVALID_CODE: isRTL ? 'القسيمة غير صالحة' : 'Invalid coupon code',
        COUPON_EXPIRED: isRTL ? 'القسيمة منتهية الصلاحية' : 'Coupon has expired',
        COUPON_EXHAUSTED: isRTL ? 'تم استنفاد عدد الاستخدامات' : 'Coupon usage limit reached',
        ALREADY_CLAIMED: isRTL ? 'تم استخدام هذه القسيمة على هذا الجهاز مسبقاً' : 'Already used on this device',
        MISSING_CODE: isRTL ? 'أدخل رمز القسيمة' : 'Enter coupon code',
      };
      toast.error(errors[result.error || ''] || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    }
  };

  const formatRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return isRTL ? `${days} يوم` : `${days}d`;
    return isRTL ? `${hours} ساعة` : `${hours}h`;
  };

  return (
    <div className="space-y-3">
      {/* Active coupon banner */}
      {isActive && activeCoupon && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">
              {isRTL ? 'قسيمة نشطة' : 'Active Coupon'}: {activeCoupon.code}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-emerald-600/60" />
              <span className="text-[10px] text-emerald-600/80">
                {isRTL ? `تنتهي خلال ${formatRemaining(remainingTime)}` : `Expires in ${formatRemaining(remainingTime)}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Redeem input */}
      {!isActive && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" />
            <span className="text-[13px] font-semibold text-foreground">
              {isRTL ? 'استخدام قسيمة ترويجية' : 'Redeem Coupon'}
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder={isRTL ? 'أدخل رمز القسيمة' : 'Enter code'}
              className={cn("flex-1 text-sm uppercase tracking-wider", isRTL && "text-right")}
              dir="ltr"
              maxLength={30}
              disabled={redeeming}
              onKeyDown={e => e.key === 'Enter' && handleRedeem()}
            />
            <button
              onClick={handleRedeem}
              disabled={redeeming || !code.trim()}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[12px] font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors active:scale-[0.97] flex items-center gap-1.5"
            >
              {redeeming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {isRTL ? 'تفعيل' : 'Activate'}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isRTL ? 'القسيمة تُستخدم مرة واحدة فقط لكل جهاز' : 'Each coupon can only be used once per device'}
          </p>
        </div>
      )}
    </div>
  );
};
