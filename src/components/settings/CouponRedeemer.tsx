import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
      refresh();
    } else {
      const errors: Record<string, string> = {
        INVALID_CODE: isRTL ? 'رمز القسيمة غير صالح' : 'Invalid coupon code',
        COUPON_EXPIRED: isRTL ? 'انتهت صلاحية القسيمة' : 'Coupon has expired',
        COUPON_EXHAUSTED: isRTL ? 'تم استنفاد عدد الاستخدامات المتاحة' : 'Coupon usage limit reached',
        ALREADY_CLAIMED: isRTL ? 'تم استخدام هذه القسيمة على هذا الجهاز من قبل' : 'Already used on this device',
        MISSING_CODE: isRTL ? 'يرجى إدخال رمز القسيمة' : 'Enter coupon code',
      };
      toast.error(errors[result.error || ''] || (isRTL ? 'حدث خطأ، يرجى المحاولة لاحقًا' : 'An error occurred'));
    }
  };

  const formatRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days > 0) return isRTL ? `${days} يوم و ${remainingHours} ساعة` : `${days}d ${remainingHours}h`;
    return isRTL ? `${hours} ساعة` : `${hours}h`;
  };

  return (
    <div className="space-y-4">
      {/* Active coupon */}
      {isActive && activeCoupon && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 dark:from-emerald-950/30 dark:to-emerald-900/20 p-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
          <p className="text-[14px] font-bold text-emerald-700 dark:text-emerald-300">
            {isRTL ? '✓ القسيمة مفعّلة' : '✓ Coupon Active'}
          </p>
          <p className="text-[15px] font-extrabold text-emerald-800 dark:text-emerald-200 mt-1 tracking-wider">
            {activeCoupon.code}
          </p>
          <p className="text-[12px] text-emerald-600/80 dark:text-emerald-400/70 mt-2">
            {isRTL
              ? `تنتهي الصلاحية خلال ${formatRemaining(remainingTime)}`
              : `Expires in ${formatRemaining(remainingTime)}`}
          </p>
        </div>
      )}

      {/* Redeem form */}
      {!isActive && (
        <div className="space-y-3">
          <p className="text-[15px] font-bold text-foreground">
            {isRTL ? 'تفعيل قسيمة ترويجية' : 'Redeem a Coupon'}
          </p>
          <p className="text-[12px] text-muted-foreground leading-relaxed -mt-1">
            {isRTL
              ? 'أدخلي رمز القسيمة للحصول على مميزات إضافية مجانًا.'
              : 'Enter your coupon code to unlock extra features for free.'}
          </p>

          <div className="flex gap-2">
            <Input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder={isRTL ? 'رمز القسيمة' : 'Coupon code'}
              className={cn(
                "flex-1 text-[14px] font-semibold uppercase tracking-widest h-11 rounded-xl border-border/60 bg-muted/30 placeholder:text-muted-foreground/50 placeholder:normal-case placeholder:tracking-normal placeholder:font-normal",
                isRTL && "text-right"
              )}
              dir="ltr"
              maxLength={30}
              disabled={redeeming}
              onKeyDown={e => e.key === 'Enter' && handleRedeem()}
            />
            <button
              onClick={handleRedeem}
              disabled={redeeming || !code.trim()}
              className="px-5 h-11 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold disabled:opacity-40 hover:bg-primary/90 transition-all active:scale-[0.97] flex items-center gap-2 whitespace-nowrap"
            >
              {redeeming && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRTL ? 'تفعيل' : 'Activate'}
            </button>
          </div>

          {/* Terms */}
          <div className="pt-1 space-y-1">
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              {isRTL ? '• تُستخدم القسيمة مرة واحدة فقط لكل جهاز.' : '• Each coupon can only be used once per device.'}
            </p>
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              {isRTL ? '• لا يمكن استرداد القسيمة أو استبدالها بعد التفعيل.' : '• Coupons cannot be refunded or exchanged after activation.'}
            </p>
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              {isRTL ? '• تنتهي صلاحية القسيمة تلقائيًا بحسب نوعها.' : '• Coupons expire automatically based on their type.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
