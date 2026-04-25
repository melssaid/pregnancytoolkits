import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useActiveCoupon } from '@/hooks/useActiveCoupon';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { applyCouponTier } from '@/services/smartEngine';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const CouponRedeemer: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [code, setCode] = useState('');
  const [justActivated, setJustActivated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { activeCoupon, isActive, redeeming, redeemCoupon, remainingTime } = useActiveCoupon();
  const { refresh } = useAIUsage();

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setErrorMsg('');
    const result = await redeemCoupon(code);
    if (result.success) {
      if (result.coupon) {
        applyCouponTier(result.coupon.expiresAt, result.coupon.bonusPoints, result.coupon.couponId);
      }
      try {
        localStorage.setItem('pt_coupon_used', Date.now().toString());
      } catch {}
      setJustActivated(true);
      setCode('');
      refresh();
      toast.success(isRTL ? '🎉 تم تفعيل القسيمة بنجاح!' : '🎉 Coupon activated!');
      setTimeout(() => setJustActivated(false), 3000);
    } else {
      const errors: Record<string, string> = {
        INVALID_CODE: isRTL ? '❌ رمز القسيمة غير صالح. تأكدي من كتابته بشكل صحيح.' : '❌ Invalid coupon code. Please check and try again.',
        COUPON_EXPIRED: isRTL ? '⏰ انتهت صلاحية هذه القسيمة ولم تعد متاحة للاستخدام.' : '⏰ This coupon has expired and is no longer available.',
        ALREADY_CLAIMED: isRTL
          ? '⚠️ لقد استُخدمت هذه القسيمة مسبقًا على هذا الجهاز. القسيمة تبقى متاحة للجميع، لكن مرة واحدة فقط لكل جهاز.'
          : '⚠️ This coupon was already used on this device. It remains available for everyone, but only once per device.',
        MISSING_CODE: isRTL ? '📝 يرجى إدخال رمز القسيمة.' : '📝 Please enter a coupon code.',
        CLAIM_FAILED: isRTL ? '❌ حدث خطأ أثناء تفعيل القسيمة. يرجى المحاولة مرة أخرى.' : '❌ Failed to activate coupon. Please try again.',
        INTERNAL_ERROR: isRTL ? '❌ حدث خطأ في الخادم. يرجى المحاولة لاحقًا.' : '❌ Server error. Please try again later.',
      };
      const msg = errors[result.error || ''] || (isRTL ? '❌ حدث خطأ، يرجى المحاولة لاحقًا.' : '❌ An error occurred. Please try again.');
      setErrorMsg(msg);
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
      {/* Success animation */}
      <AnimatePresence>
        {justActivated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.1 }}
              className="text-3xl mb-2"
            >
              🎉
            </motion.div>
            <p className="text-[15px] font-bold text-foreground">
              {isRTL ? 'تم التفعيل بنجاح!' : 'Successfully Activated!'}
            </p>
            <p className="text-[12px] text-muted-foreground mt-1">
              {isRTL ? 'استمتعي بالمميزات الإضافية الآن.' : 'Enjoy your extra features now.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active coupon */}
      {isActive && activeCoupon && !justActivated && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-accent/10 p-4"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <p className="text-[14px] font-bold text-foreground">
            {isRTL ? '✓ القسيمة مفعّلة' : '✓ Coupon Active'}
          </p>
          <p className="text-[15px] font-extrabold text-foreground mt-1 tracking-wider">
            {activeCoupon.code}
          </p>
          <p className="text-[12px] text-muted-foreground mt-2">
            {isRTL
              ? `تنتهي الصلاحية خلال ${formatRemaining(remainingTime)}`
              : `Expires in ${formatRemaining(remainingTime)}`}
          </p>
        </motion.div>
      )}

      {/* Redeem form */}
      {!isActive && !justActivated && (
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
              onChange={e => { setCode(e.target.value.toUpperCase()); setErrorMsg(''); }}
              placeholder={isRTL ? 'رمز القسيمة' : 'Coupon code'}
              className={cn(
                "flex-1 text-[14px] font-semibold uppercase tracking-widest h-11 rounded-xl border-border/60 bg-muted/30 placeholder:text-muted-foreground/50 placeholder:normal-case placeholder:tracking-normal placeholder:font-normal",
                isRTL && "text-right",
                errorMsg && "border-destructive/50"
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

          {/* Error message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[12px] font-medium text-destructive leading-relaxed"
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Terms */}
          <div className="pt-1 space-y-1">
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              {isRTL ? '• يمكن لجميع المستخدمين استخدام نفس القسيمة، لكن مرة واحدة فقط لكل جهاز.' : '• The same coupon can be used by everyone, but only once per device.'}
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
