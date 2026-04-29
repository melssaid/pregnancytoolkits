import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Crown, Zap, Cloud, HardDrive, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { useActiveCoupon } from '@/hooks/useActiveCoupon';
import { resolveWeight, type AIToolType, type SmartSection } from '@/services/smartEngine/types';
import { getQuotaSourceInfo, type QuotaSourceInfo } from '@/services/smartEngine/quotaManager';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const labels: Record<string, {
  consumed: string; remaining: string; of: string; thisAction: string;
  point: string; points: string; freeAction: string;
  upgradeCta: string; resetsMonthly: string; resetsMonthlyPremium: string; nearLimit: string; couponOneTime: string;
  sourceSnapshot: string; sourceLocal: string;
  sourceTitle: string;
  sourceSnapshotDesc: string; sourceLocalDesc: string;
  syncedAgo: (s: string) => string; refreshIn: (s: string) => string;
  pendingDelta: (n: number) => string;
  delayNote: string;
  justNow: string; secondsAgo: (n: number) => string; minutesAgo: (n: number) => string;
}> = {
  ar: { consumed: 'استهلكتِ', remaining: 'المتبقي', of: 'من', thisAction: 'هذا التحليل',
        point: 'نقطة', points: 'نقاط', freeAction: 'تحليل مجاني ✨',
        upgradeCta: 'احصلي على 75 نقطة شهرياً', resetsMonthly: 'الرصيد المجاني يتجدد شهرياً',
        resetsMonthlyPremium: 'يتجدد مع تجديد اشتراكك', nearLimit: 'اقتربتِ من نهاية الرصيد',
        couponOneTime: 'نقاط الكوبون لمرة واحدة',
        sourceSnapshot: 'متزامن', sourceLocal: 'محلي',
        sourceTitle: 'مصدر الأرقام',
        sourceSnapshotDesc: 'الأرقام مأخوذة من السيرفر (السنابشوت الرسمي) ومُحدَّثة فوراً عند كل استخدام محلي.',
        sourceLocalDesc: 'لا يوجد سنابشوت حديث من السيرفر — الأرقام محسوبة من جهازك مؤقتاً وستتم المزامنة عند الاتصال.',
        syncedAgo: (s) => `آخر مزامنة: ${s}`, refreshIn: (s) => `يُعاد التحقق خلال ${s}`,
        pendingDelta: (n) => `+${n} استخدام محلي بعد آخر مزامنة`,
        delayNote: 'قد يتأخر التحديث حتى ٥ دقائق ريثما تتم المزامنة مع السيرفر.',
        justNow: 'الآن', secondsAgo: (n) => `قبل ${n} ث`, minutesAgo: (n) => `قبل ${n} د` },
  en: { consumed: 'Used', remaining: 'Remaining', of: 'of', thisAction: 'this analysis',
        point: 'point', points: 'points', freeAction: 'Free analysis ✨',
        upgradeCta: 'Get 75 points monthly', resetsMonthly: 'Free credits reset monthly',
        resetsMonthlyPremium: 'Renews with your subscription', nearLimit: 'Almost out of credits',
        couponOneTime: 'Coupon points · one-time',
        sourceSnapshot: 'Synced', sourceLocal: 'Local',
        sourceTitle: 'Where these numbers come from',
        sourceSnapshotDesc: 'Numbers come from the server snapshot, with your latest local usage applied instantly on top.',
        sourceLocalDesc: 'No fresh server snapshot — counts are computed locally and will sync next time you reconnect.',
        syncedAgo: (s) => `Last sync: ${s}`, refreshIn: (s) => `Re-checks in ${s}`,
        pendingDelta: (n) => `+${n} local use since last sync`,
        delayNote: 'Updates may lag up to 5 min until the next server sync.',
        justNow: 'just now', secondsAgo: (n) => `${n}s ago`, minutesAgo: (n) => `${n}m ago` },
  de: { consumed: 'Verbraucht', remaining: 'Übrig', of: 'von', thisAction: 'diese Analyse',
        point: 'Punkt', points: 'Punkte', freeAction: 'Kostenlos ✨',
        upgradeCta: '75 Punkte monatlich', resetsMonthly: 'Gratis monatlich',
        resetsMonthlyPremium: 'Erneuert mit Abo', nearLimit: 'Limit fast erreicht',
        couponOneTime: 'Gutschein · einmalig',
        sourceSnapshot: 'Synchron.', sourceLocal: 'Lokal',
        sourceTitle: 'Quelle der Werte',
        sourceSnapshotDesc: 'Werte stammen aus dem Server-Snapshot, lokale Nutzung wird sofort ergänzt.',
        sourceLocalDesc: 'Kein frischer Server-Snapshot — Werte lokal berechnet, Sync bei Verbindung.',
        syncedAgo: (s) => `Letzter Sync: ${s}`, refreshIn: (s) => `Neu in ${s}`,
        pendingDelta: (n) => `+${n} lokal seit Sync`,
        delayNote: 'Aktualisierung kann bis zu 5 Min dauern.',
        justNow: 'gerade', secondsAgo: (n) => `vor ${n}s`, minutesAgo: (n) => `vor ${n}m` },
  fr: { consumed: 'Utilisé', remaining: 'Restant', of: 'sur', thisAction: 'cette analyse',
        point: 'point', points: 'points', freeAction: 'Gratuit ✨',
        upgradeCta: '75 points par mois', resetsMonthly: 'Crédits gratuits mensuels',
        resetsMonthlyPremium: 'Renouvelé avec l\'abonnement', nearLimit: 'Presque épuisé',
        couponOneTime: 'Points coupon · unique',
        sourceSnapshot: 'Synchro.', sourceLocal: 'Local',
        sourceTitle: 'Source des chiffres',
        sourceSnapshotDesc: 'Chiffres issus du snapshot serveur, votre usage local est ajouté instantanément.',
        sourceLocalDesc: 'Aucun snapshot serveur récent — calculs locaux, sync à la reconnexion.',
        syncedAgo: (s) => `Dernier sync : ${s}`, refreshIn: (s) => `Vérif. dans ${s}`,
        pendingDelta: (n) => `+${n} usage local depuis sync`,
        delayNote: 'Mise à jour jusqu\'à 5 min.',
        justNow: 'à l\'instant', secondsAgo: (n) => `il y a ${n}s`, minutesAgo: (n) => `il y a ${n}m` },
  es: { consumed: 'Usado', remaining: 'Restante', of: 'de', thisAction: 'este análisis',
        point: 'punto', points: 'puntos', freeAction: 'Gratis ✨',
        upgradeCta: '75 puntos al mes', resetsMonthly: 'Créditos gratis mensuales',
        resetsMonthlyPremium: 'Se renueva con tu suscripción', nearLimit: 'Casi sin créditos',
        couponOneTime: 'Cupón · un solo uso',
        sourceSnapshot: 'Sincron.', sourceLocal: 'Local',
        sourceTitle: 'Origen de los datos',
        sourceSnapshotDesc: 'Datos del snapshot del servidor, con tu uso local aplicado al instante.',
        sourceLocalDesc: 'Sin snapshot reciente — cálculo local, se sincroniza al reconectar.',
        syncedAgo: (s) => `Último sync: ${s}`, refreshIn: (s) => `Revisa en ${s}`,
        pendingDelta: (n) => `+${n} uso local desde sync`,
        delayNote: 'Puede tardar hasta 5 min.',
        justNow: 'ahora', secondsAgo: (n) => `hace ${n}s`, minutesAgo: (n) => `hace ${n}m` },
  pt: { consumed: 'Usado', remaining: 'Restante', of: 'de', thisAction: 'esta análise',
        point: 'ponto', points: 'pontos', freeAction: 'Grátis ✨',
        upgradeCta: '75 pontos por mês', resetsMonthly: 'Créditos grátis mensais',
        resetsMonthlyPremium: 'Renova com sua assinatura', nearLimit: 'Quase sem créditos',
        couponOneTime: 'Cupom · uso único',
        sourceSnapshot: 'Sincron.', sourceLocal: 'Local',
        sourceTitle: 'Origem dos números',
        sourceSnapshotDesc: 'Dados do snapshot do servidor, com seu uso local aplicado na hora.',
        sourceLocalDesc: 'Sem snapshot recente — cálculo local, sincroniza ao reconectar.',
        syncedAgo: (s) => `Último sync: ${s}`, refreshIn: (s) => `Verifica em ${s}`,
        pendingDelta: (n) => `+${n} uso local desde sync`,
        delayNote: 'Pode demorar até 5 min.',
        justNow: 'agora', secondsAgo: (n) => `há ${n}s`, minutesAgo: (n) => `há ${n}m` },
  tr: { consumed: 'Kullanıldı', remaining: 'Kalan', of: '/', thisAction: 'bu analiz',
        point: 'puan', points: 'puan', freeAction: 'Ücretsiz ✨',
        upgradeCta: 'Aylık 75 puan al', resetsMonthly: 'Ücretsiz aylık yenilenir',
        resetsMonthlyPremium: 'Aboneliğinizle yenilenir', nearLimit: 'Limit dolmak üzere',
        couponOneTime: 'Kupon · tek seferlik',
        sourceSnapshot: 'Senkron', sourceLocal: 'Yerel',
        sourceTitle: 'Sayıların kaynağı',
        sourceSnapshotDesc: 'Sayılar sunucu anlık görüntüsünden alınır; yerel kullanım anında eklenir.',
        sourceLocalDesc: 'Yeni sunucu anlık görüntüsü yok — yerel hesaplanır, bağlanınca senkronlanır.',
        syncedAgo: (s) => `Son senk: ${s}`, refreshIn: (s) => `${s} sonra yenilenir`,
        pendingDelta: (n) => `Senk\'den beri +${n} yerel kullanım`,
        delayNote: 'Güncelleme 5 dk\'ya kadar gecikebilir.',
        justNow: 'şimdi', secondsAgo: (n) => `${n}sn önce`, minutesAgo: (n) => `${n}dk önce` },
};

interface UsagePulseFooterProps {
  toolType?: AIToolType;
  section?: SmartSection;
  /** When true, plays a one-time consumption pulse animation */
  justConsumed?: boolean;
  className?: string;
}

/**
 * UsagePulseFooter — explicit post-analysis usage display.
 * Shows: "Used X point · Remaining Y/Z" with a thick gradient bar and consumption pulse.
 * Replaces ambiguous tiny counters with a clear, final, transparent statement.
 */
export const UsagePulseFooter: React.FC<UsagePulseFooterProps> = ({
  toolType,
  section,
  justConsumed = false,
  className = '',
}) => {
  const { remaining, used, limit, isLimitReached, tier } = useAIUsage();
  const { activeCoupon } = useActiveCoupon();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language?.split('-')[0] || 'en';
  const L = labels[lang] || labels.en;

  const weight = resolveWeight(toolType, section);
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const remainPct = limit > 0 ? (remaining / limit) * 100 : 0;
  const isFree = tier === 'free';
  const isNearLimit = remainPct <= 20 && !isLimitReached;
  // Coupon bonus is one-time only (not auto-renewed). Show clear hint when free user has an active coupon.
  const hasOneTimeCoupon = isFree && !!activeCoupon;
  const premiumRenewHint = L.resetsMonthlyPremium;
  const resetHint = isLimitReached
    ? L.nearLimit
    : hasOneTimeCoupon
      ? L.couponOneTime
      : isFree
        ? L.resetsMonthly
        : premiumRenewHint;

  // Cost label
  const costLabel = weight === 0
    ? L.freeAction
    : weight === 2
      ? `2 ${L.points}`
      : weight >= 5
        ? `${weight} ${L.points}`
        : `1 ${L.point}`;

  // Bar gradient by remaining
  const barGradient = isLimitReached
    ? 'linear-gradient(90deg, hsl(0 72% 51%), hsl(0 72% 40%))'
    : remainPct <= 15
      ? 'linear-gradient(90deg, hsl(0 72% 51%), hsl(25 95% 53%))'
      : remainPct <= 40
        ? 'linear-gradient(90deg, hsl(38 92% 50%), hsl(25 95% 53%))'
        : 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 65% 50%))';

  // Trigger pulse animation when justConsumed flips to true
  const [showPulse, setShowPulse] = useState(false);
  useEffect(() => {
    if (justConsumed && weight > 0) {
      setShowPulse(true);
      const t = setTimeout(() => setShowPulse(false), 1800);
      return () => clearTimeout(t);
    }
  }, [justConsumed, weight]);

  // Track quota source (snapshot vs local) for the transparency badge.
  // Refresh on consumption events and every 30s so countdown stays accurate.
  const [sourceInfo, setSourceInfo] = useState<QuotaSourceInfo>(() => getQuotaSourceInfo());
  useEffect(() => {
    setSourceInfo(getQuotaSourceInfo());
    const id = window.setInterval(() => setSourceInfo(getQuotaSourceInfo()), 30_000);
    return () => window.clearInterval(id);
  }, [used, remaining, justConsumed]);

  const formatRelative = (ms: number | null): string => {
    if (!ms) return L.justNow;
    const diff = Math.max(0, Math.floor((Date.now() - ms) / 1000));
    if (diff < 5) return L.justNow;
    if (diff < 60) return L.secondsAgo(diff);
    return L.minutesAgo(Math.floor(diff / 60));
  };
  const formatCountdown = (sec: number | null): string => {
    if (sec === null) return '—';
    if (sec < 60) return L.secondsAgo(sec).replace(/^.*?(\d+).*$/, (_, n) => `${n}s`);
    return `${Math.floor(sec / 60)}m`;
  };
  const isSnapshot = sourceInfo.source === 'snapshot';

  return (
    <div className={`mt-4 pt-3 border-t border-primary/10 ${className}`}>
      {/* Headline: Used + Remaining */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <motion.div
            animate={showPulse ? { scale: [1, 1.4, 1], rotate: [0, -10, 0] } : {}}
            transition={{ duration: 0.6 }}
          >
            <Zap className={`w-3.5 h-3.5 shrink-0 ${weight === 0 ? 'text-emerald-500' : 'text-primary'}`} fill="currentColor" />
          </motion.div>
          <span className="text-[11.5px] font-semibold text-foreground truncate">
            {weight === 0 ? L.freeAction : `${L.consumed} ${costLabel}`}
          </span>
          <AnimatePresence>
            {showPulse && weight > 0 && (
              <motion.span
                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                animate={{ opacity: [0, 1, 1, 0], y: -14, scale: 1.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="text-[10px] font-bold text-destructive tabular-nums shrink-0"
              >
                −{weight}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <span className="text-[11.5px] font-bold tabular-nums shrink-0 text-foreground/85">
          <span className="text-muted-foreground font-medium">{L.remaining}: </span>
          <span className={isLimitReached ? 'text-destructive' : isNearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}>
            {remaining}
          </span>
          <span className="text-foreground/40 font-semibold">/{limit}</span>
        </span>
      </div>

      {/* Thick usage bar */}
      <div className="relative h-3.5 rounded-full bg-muted/40 overflow-hidden" style={{ boxShadow: 'inset 0 1px 3px hsl(0 0% 0% / 0.12)' }}>
        <motion.div
          className="h-full rounded-full relative"
          style={{ background: barGradient }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          {/* Shimmer near limit */}
          {isNearLimit && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}
            />
          )}
          {/* Consumption pulse: bright tip dot */}
          <AnimatePresence>
            {showPulse && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 2.2, 0.5] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4 }}
                className="absolute top-1/2 -translate-y-1/2 right-0 rtl:right-auto rtl:left-0 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_2px_hsl(0_0%_100%_/_0.8)]"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Sub-line: source badge + reset hint + upgrade nudge */}
      <div className="flex items-center justify-between gap-2 mt-2 px-1 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Transparency badge: Local vs Snapshot */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={L.sourceTitle}
                dir={isRTL ? 'rtl' : 'ltr'}
                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold border transition-colors shrink-0 whitespace-nowrap ${
                  isSnapshot
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15'
                }`}
              >
                {isSnapshot
                  ? <Cloud className="w-2.5 h-2.5 shrink-0" />
                  : <HardDrive className="w-2.5 h-2.5 shrink-0" />}
                <span>{isSnapshot ? L.sourceSnapshot : L.sourceLocal}</span>
                <Info className="w-2.5 h-2.5 opacity-70 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align={isRTL ? 'end' : 'start'}
              side="top"
              sideOffset={8}
              collisionPadding={12}
              avoidCollisions
              dir={isRTL ? 'rtl' : 'ltr'}
              className="w-[min(18rem,calc(100vw-1.5rem))] p-3 text-[11px] leading-relaxed break-words"
            >
              <div className="flex items-center gap-1.5 mb-1.5 font-bold text-foreground">
                {isSnapshot
                  ? <Cloud className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  : <HardDrive className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                <span className="break-words">{L.sourceTitle}</span>
              </div>
              <p className="text-muted-foreground mb-2 break-words">
                {isSnapshot ? L.sourceSnapshotDesc : L.sourceLocalDesc}
              </p>
              <div className="space-y-1 text-[10.5px] text-foreground/80 border-t border-border/30 pt-2 break-words">
                {isSnapshot ? (
                  <>
                    <div>{L.syncedAgo(formatRelative(sourceInfo.snapshotAt))}</div>
                    <div>{L.refreshIn(formatCountdown(sourceInfo.expiresInSec))}</div>
                    {sourceInfo.pendingLocalDelta > 0 && (
                      <div className="text-primary font-semibold">
                        {L.pendingDelta(sourceInfo.pendingLocalDelta)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-amber-600 dark:text-amber-400 font-medium">{L.delayNote}</div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <span className="text-[10px] text-muted-foreground/80 font-medium truncate min-w-0">
            {resetHint}
          </span>
        </div>
        {isFree && (isNearLimit || isLimitReached) && (
          <button
            onClick={() => navigate('/pricing-demo')}
            className="flex items-center gap-1 text-[10.5px] font-bold text-primary hover:text-primary/80 transition-colors shrink-0 whitespace-nowrap"
          >
            <Crown className="w-3 h-3 shrink-0" fill="currentColor" />
            <span>{L.upgradeCta}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UsagePulseFooter;
