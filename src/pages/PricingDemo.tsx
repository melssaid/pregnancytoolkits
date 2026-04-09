import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Brain, Shield, Zap, Heart, Crown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { requestPurchase, isDigitalGoodsAvailable, runBillingDiagnostics, clearBillingCache, type PlanType } from "@/lib/googlePlayBilling";
import { useNavigate, Link } from "react-router-dom";
import pricingLogo from "@/assets/pricing-logo.webp";
import { supabase } from "@/integrations/supabase/client";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { setTier as qmSetTier } from "@/services/smartEngine/quotaManager";

const features = [
  { icon: Brain, key: "feature1" },
  { icon: Zap, key: "feature2" },
  { icon: Heart, key: "feature3" },
  { icon: Shield, key: "feature4" },
  { icon: Sparkles, key: "feature5" },
];

export default function PricingDemo() {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PlanType>("yearly");
  const [syncing, setSyncing] = useState(false);
  const [devTaps, setDevTaps] = useState(0);
  const devMode = devTaps >= 5;
  const isAr = i18n.language === "ar";
  const canPurchase = isDigitalGoodsAvailable();
  const { refresh: refreshAIUsage } = useAIUsage();

  const normalizeBillingError = (message?: string) => {
    if (!message) {
      return isAr ? "تعذر إكمال عملية الشراء حالياً. حاول مرة أخرى." : "Unable to complete the purchase right now. Please try again.";
    }

    if (message.includes("clientAppUnavailable")) {
      return isAr
        ? "خدمة Google Play على الجهاز غير جاهزة حالياً. امسح كاش Google Play Store وGoogle Play Services ثم افتح التطبيق المثبت من Google Play مرة أخرى."
        : "Google Play services are not ready on this device. Clear Google Play Store and Google Play Services cache, then reopen the installed app from Google Play.";
    }

    if (message.includes("Digital Goods API") || message.includes("Payment service unavailable")) {
      return isAr
        ? "خدمة الدفع غير متاحة حالياً داخل التطبيق. تأكد أنك فتحت النسخة المثبتة من Google Play وأن خدمات Google Play محدثة."
        : "Billing is currently unavailable inside the app. Make sure you opened the installed Google Play version and that Google Play services are up to date.";
    }

    return message;
  };

  const handleSubscribe = async () => {
    console.log('[PricingDemo] canPurchase:', canPurchase, 'getDigitalGoodsService:', typeof window.getDigitalGoodsService);
    
    // Run diagnostics first
    const diag = await runBillingDiagnostics();
    console.log('[PricingDemo] Diagnostics result:', diag);

    if (!canPurchase) {
      // On web: redirect user to download the app from Google Play
      const playStoreUrl = "https://play.google.com/store/apps/details?id=app.pregnancytoolkits.android";
      window.open(playStoreUrl, "_blank");
      toast.info(
        isAr
          ? "الدفع متاح فقط داخل التطبيق. حمّلي التطبيق من Google Play للاشتراك."
          : "Payment is only available in the app. Download from Google Play to subscribe.",
        { duration: 6000 }
      );
      return;
    }

    if (!diag.serviceConnected) {
      toast.error(normalizeBillingError(diag.error || 'لا يمكن الاتصال بخدمة الدفع'));
      return;
    }

    let purchaseErrorShown = false;

    const sent = await requestPurchase(
      selected,
      async () => {
        // Force premium tier immediately so crown & UI update instantly
        qmSetTier('premium');
        refreshAIUsage();
        // Dispatch custom event so App.tsx can show SubscriptionSuccessSheet
        window.dispatchEvent(new CustomEvent('subscription-activated', { detail: { plan: selected } }));
        navigate("/");

        // Show syncing spinner overlay
        setSyncing(true);

        // Poll server to confirm subscription sync (max 3 attempts, 2s apart)
        const poll = async (attempt = 0) => {
          if (attempt >= 3) {
            setSyncing(false);
            toast.success(isAr ? '✅ تم تفعيل الاشتراك' : '✅ Subscription activated');
            return;
          }
          try {
            const { data } = await supabase.functions.invoke('pregnancy-ai-perplexity', {
              body: { action: 'check-quota' },
            });
            if (data?.tier === 'premium') {
              setSyncing(false);
              toast.success(isAr ? '✅ تمت المزامنة بنجاح' : '✅ Synced successfully');
              refreshAIUsage();
              return;
            }
          } catch { /* ignore */ }
          setTimeout(() => poll(attempt + 1), 2000);
        };
        setTimeout(() => poll(), 2000);
      },
      (msg) => {
        purchaseErrorShown = true;
        toast.error(normalizeBillingError(msg));
      },
    );

    if (!sent && !purchaseErrorShown) {
      toast.info(t("pricing.purchaseCancelled") || "Purchase was cancelled");
    }
  };

  const price = selected === "yearly" ? "$19.99" : "$2.99";
  const period = selected === "yearly" ? t("pricing.yr") : t("pricing.mo");

  return (
    <div
      className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Sync Spinner Overlay */}
      {syncing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">
              {isAr ? 'جارٍ مزامنة الاشتراك...' : 'Syncing subscription...'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-[45vh] bg-gradient-to-b from-primary/[0.04] to-transparent" />
        <div className="absolute -top-20 -end-20 w-60 h-60 rounded-full bg-primary/[0.06] blur-[80px]" />
        <div className="absolute bottom-0 -start-20 w-40 h-40 rounded-full bg-primary/[0.04] blur-[60px]" />
      </div>

      {/* Close */}
      <div className="sticky top-0 z-30 px-4 py-3 flex justify-end">
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-md border border-border/40 shadow-sm flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>

      <div className="flex-1 px-5 pb-6 max-w-md mx-auto w-full flex flex-col justify-between relative z-10">
        <div>
          {/* Hero — Logo + Title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center mb-4"
          >
            <motion.div
              className="relative w-28 h-28 mx-auto mb-3 flex items-center justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
            >
              {/* Ripple rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-primary/20"
                  initial={{ scale: 0.5, opacity: 0.6 }}
                  animate={{ scale: [0.5, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2.5, delay: i * 0.7, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
              {/* Breathing aura */}
              <motion.div
                className="absolute w-20 h-20 rounded-full bg-primary/10 blur-xl"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Orbiting hearts */}
              {/* Logo */}
              <div className="relative z-0 rounded-full overflow-hidden shadow-xl shadow-primary/20 ring-[3px] ring-primary/15 bg-white" style={{ width: 88, height: 88 }}>
                <img src={pricingLogo} alt="Pregnancy Toolkits" className="w-full h-full object-cover" loading="eager" width={88} height={88} />
              </div>
              {/* Blooming flowers */}
              {[
                { angle: 0, radius: 52, size: 17, emoji: '🌸', dur: 7, delay: 0 },
                { angle: 72, radius: 48, size: 14, emoji: '🌸', dur: 9, delay: 0.6 },
                { angle: 144, radius: 54, size: 16, emoji: '🌸', dur: 8, delay: 1.2 },
                { angle: 216, radius: 50, size: 13, emoji: '🌸', dur: 10, delay: 0.3 },
                { angle: 288, radius: 53, size: 15, emoji: '🌸', dur: 8.5, delay: 0.9 },
              ].map((f, i) => (
                <motion.span
                  key={`flower-${i}`}
                  className="absolute z-10 pointer-events-none select-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: -f.size / 2,
                    marginTop: -f.size / 2,
                    fontSize: f.size,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    x: [
                      Math.cos((f.angle * Math.PI) / 180) * f.radius,
                      Math.cos(((f.angle + 90) * Math.PI) / 180) * (f.radius * 0.85),
                      Math.cos(((f.angle + 180) * Math.PI) / 180) * f.radius,
                      Math.cos(((f.angle + 270) * Math.PI) / 180) * (f.radius * 0.85),
                      Math.cos(((f.angle + 360) * Math.PI) / 180) * f.radius,
                    ],
                    y: [
                      Math.sin((f.angle * Math.PI) / 180) * f.radius,
                      Math.sin(((f.angle + 90) * Math.PI) / 180) * (f.radius * 0.85),
                      Math.sin(((f.angle + 180) * Math.PI) / 180) * f.radius,
                      Math.sin(((f.angle + 270) * Math.PI) / 180) * (f.radius * 0.85),
                      Math.sin(((f.angle + 360) * Math.PI) / 180) * f.radius,
                    ],
                    scale: [0, 1.2, 1, 1.15, 0],
                    opacity: [0, 1, 0.85, 1, 0],
                    rotate: [0, 15, -10, 8, 0],
                  }}
                  transition={{
                    duration: f.dur,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: f.delay,
                  }}
                >
                  {f.emoji}
                </motion.span>
              ))}
            </motion.div>

            <h1
              className="text-lg font-extrabold text-foreground tracking-tight mb-1 leading-tight select-none"
              style={{ fontFamily: isAr ? "'Almarai', 'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
              onClick={() => setDevTaps(p => p + 1)}
            >
              {t("pricing.title")}
            </h1>
            <p
              className="text-[11px] text-muted-foreground leading-relaxed max-w-[220px] mx-auto"
              style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
            >
              {t("pricing.subtitle")}
            </p>
          </motion.div>

          {/* Features chips */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="flex flex-wrap justify-center gap-1.5 mb-4"
          >
            {features.map(({ icon: Icon, key }, idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.12 + idx * 0.04 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/60 border border-border/30"
              >
                <Icon className="w-2 h-2 text-muted-foreground" strokeWidth={2} />
                <span className="text-[8px] font-medium text-muted-foreground leading-none whitespace-nowrap">
                  {t(`pricing.${key}`)}
                </span>
              </motion.div>
            ))}
          </motion.div>



          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="grid grid-cols-2 gap-2.5"
          >
            {/* Yearly */}
            <button
              onClick={() => setSelected("yearly")}
              className={`relative flex flex-col items-center text-center px-2 py-3.5 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                selected === "yearly"
                  ? "border-primary bg-primary/[0.04] shadow-[0_0_20px_-6px_hsl(var(--primary)/0.2)]"
                  : "border-border/30 bg-card/60 hover:border-border/50"
              }`}
            >
              {/* Best value badge */}
              <div className="absolute -top-px -end-px">
                <div className="px-2 py-0.5 rounded-es-lg rounded-se-[12px] bg-gradient-to-r from-primary to-primary/80">
                  <span className="text-[8px] font-bold text-primary-foreground">{t("pricing.bestValue")}</span>
                </div>
              </div>

              {/* Radio */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mb-2 transition-colors ${
                selected === "yearly" ? "border-primary bg-primary" : "border-muted-foreground/25"
              }`}>
                {selected === "yearly" && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
              </div>

              <span className="text-[11px] font-bold text-foreground mb-1">{t("pricing.yearly")}</span>

              <span className="text-[22px] font-extrabold text-foreground tabular-nums leading-none" style={{ fontFamily: "'Cairo', sans-serif" }}>
                $19.99
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">/{t("pricing.yr")}</span>

              <div className="mt-2 flex flex-col items-center gap-1">
                <span className="text-[9px] text-muted-foreground">$1.67/{t("pricing.mo")}</span>
                <motion.span 
                  className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {t("pricing.save")}
                </motion.span>
                <span className="text-[7px] text-muted-foreground/70 text-center leading-tight mt-0.5">
                  {t("pricing.savingsBanner", "Save $15.89/year vs monthly")}
                </span>
              </div>
            </button>

            {/* Monthly */}
            <button
              onClick={() => setSelected("monthly")}
              className={`relative flex flex-col items-center text-center px-2 py-3.5 rounded-2xl border-2 transition-all duration-300 ${
                selected === "monthly"
                  ? "border-primary bg-primary/[0.04] shadow-[0_0_20px_-6px_hsl(var(--primary)/0.2)]"
                  : "border-border/30 bg-card/60 hover:border-border/50"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mb-2 transition-colors ${
                selected === "monthly" ? "border-primary bg-primary" : "border-muted-foreground/25"
              }`}>
                {selected === "monthly" && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
              </div>

              <span className="text-[11px] font-bold text-foreground mb-1">{t("pricing.monthly")}</span>

              <span className="text-[22px] font-extrabold text-foreground tabular-nums leading-none" style={{ fontFamily: "'Cairo', sans-serif" }}>
                $2.99
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">/{t("pricing.mo")}</span>
            </button>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
          className="mt-5 space-y-2"
        >
          <Button
            onClick={handleSubscribe}
            size="lg"
            className="w-full h-[46px] text-[13px] font-bold rounded-2xl shadow-lg shadow-primary/20 whitespace-normal leading-snug"
            style={{ fontFamily: isAr ? "'Almarai', sans-serif" : "'Montserrat', sans-serif" }}
          >
            {t("pricing.cta")}
          </Button>

          <p
            className="text-center text-[10px] text-muted-foreground leading-snug"
            style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
          >
            {t("pricing.ctaSub", { price, period })}
          </p>

          <p className="text-center text-[9px] text-muted-foreground/50 leading-relaxed">
            {t("pricing.autoRenew")}
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
            <span className="text-[9px] text-muted-foreground/50 text-center">
              {t("pricing.termsPrefix")}{" "}
              <Link to="/terms" className="underline hover:text-foreground transition-colors">
                {t("layout.footer.terms")}
              </Link>{" "}
              {t("pricing.and")}{" "}
              <Link to="/privacy" className="underline hover:text-foreground transition-colors">
                {t("layout.footer.privacy")}
              </Link>
            </span>
          </div>
        </motion.div>

        {/* Billing Diagnostics Panel — hidden until 5 taps on title */}
        {devMode && <BillingDiagnosticsPanel isAr={isAr} />}
      </div>
    </div>
  );
}

function BillingDiagnosticsPanel({ isAr }: { isAr: boolean }) {
  const [visible, setVisible] = useState(false);
  const [diag, setDiag] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [lastDbReport, setLastDbReport] = useState<any>(null);

  const runDiag = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const result = await runBillingDiagnostics(forceRefresh);
      setDiag(result);
      setLastCheck(new Date().toLocaleTimeString());
    } catch (e: any) {
      setDiag({ error: e?.message || 'Unknown error' });
      setLastCheck(new Date().toLocaleTimeString());
    }
    setLoading(false);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !visible) return;
    const interval = setInterval(() => { runDiag(); }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, visible]);

  // Fetch last saved report from database
  useEffect(() => {
    if (!visible) return;
    const fetchLastReport = async () => {
      try {
        const { data } = await supabase
          .from('billing_diagnostics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) setLastDbReport(data);
      } catch {}
    };
    fetchLastReport();
  }, [visible, diag]);

  if (!visible) {
    return (
      <div className="flex flex-col items-center gap-1 mt-4">
        <button
          onClick={() => { setVisible(true); runDiag(); }}
          onContextMenu={(e) => { e.preventDefault(); setVisible(true); runDiag(true); }}
          className="text-[10px] text-muted-foreground/40 underline"
        >
          {isAr ? "تشخيص حالة الدفع" : "Payment Diagnostics"}
        </button>
      </div>
    );
  }

  const items = diag ? [
    { label: "Digital Goods API", value: diag.apiAvailable ? "✅" : "❌", ok: diag.apiAvailable },
    { label: isAr ? "اتصال الخدمة" : "Service Connected", value: diag.serviceConnected ? "✅" : "❌", ok: diag.serviceConnected },
    { label: isAr ? "طريقة الاتصال" : "Method", value: diag.connectedMethod || "—", ok: diag.serviceConnected },
    { label: isAr ? "المنتجات" : "Products Found", value: diag.productsFound?.length ? diag.productsFound.join(", ") : "❌", ok: diag.productsFound?.length > 0 },
    { label: isAr ? "مشتريات حالية" : "Existing Purchases", value: diag.existingPurchases?.length ? diag.existingPurchases.join(", ") : (isAr ? "لا يوجد" : "None"), ok: null },
    { label: "canMakePayment", value: diag.canMakePayment === true ? "✅" : diag.canMakePayment === false ? "❌" : "—", ok: diag.canMakePayment },
    { label: "TWA", value: diag.isTWA ? "✅" : "❌", ok: diag.isTWA },
    { label: "Standalone", value: diag.isStandalone ? "✅" : "❌", ok: diag.isStandalone },
    { label: isAr ? "وضع العرض" : "Display Mode", value: diag.displayMode || "—", ok: null },
    { label: "Chrome", value: diag.chromeVersion || "—", ok: diag.chromeVersion ? parseInt(diag.chromeVersion) >= 101 : null },
    { label: "Android", value: diag.androidVersion || "—", ok: diag.androidVersion ? true : null },
    { label: isAr ? "مصدر التشغيل" : "Referrer", value: diag.referrer || "—", ok: diag.isTWA },
    { label: isAr ? "المصادقة" : "Auth", value: diag.authStatus || "—", ok: diag.authStatus?.startsWith('authenticated') },
    { label: "Service Worker", value: diag.serviceWorkerActive ? "✅" : "❌", ok: diag.serviceWorkerActive },
    { label: isAr ? "تثبيت Play" : "Play Install", value: diag.playStoreInstall ? "✅" : "❌", ok: diag.playStoreInstall },
  ] : [];

  const readinessColor = diag?.readinessSummary === 'READY' ? 'text-emerald-500' :
    diag?.readinessSummary === 'ALMOST_READY' ? 'text-amber-500' :
    diag?.readinessSummary === 'PARTIAL' ? 'text-orange-500' : 'text-destructive';

  const readinessLabel = diag ? {
    'READY': isAr ? '✅ جاهز للشراء' : '✅ Ready to Purchase',
    'ALMOST_READY': isAr ? '⏳ شبه جاهز — انتظر انتشار الكتالوج' : '⏳ Almost Ready — Catalog Propagating',
    'PARTIAL': isAr ? '⚠️ جزئي — تحقق من الإعدادات' : '⚠️ Partial — Check Settings',
    'NOT_READY': isAr ? '❌ غير جاهز' : '❌ Not Ready',
  }[diag.readinessSummary] || '—' : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-3 rounded-xl bg-card/80 border border-border/40 text-[10px]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-foreground text-[11px]">
          {isAr ? "🔧 تشخيص الدفع" : "🔧 Billing Diagnostics"}
        </span>
        <div className="flex items-center gap-2">
          {lastCheck && (
            <span className="text-[8px] text-muted-foreground/60">{lastCheck}</span>
          )}
          <button onClick={() => setVisible(false)} className="text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auto-refresh toggle */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[9px] text-muted-foreground">
          {isAr ? "تحديث تلقائي كل 30 ثانية" : "Auto-refresh every 30s"}
        </span>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-colors ${autoRefresh ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}`}
        >
          {autoRefresh ? (isAr ? "🟢 مفعّل" : "🟢 ON") : (isAr ? "⚪ معطّل" : "⚪ OFF")}
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-2">{isAr ? "جاري الفحص..." : "Checking..."}</p>
      ) : diag ? (
        <div className="space-y-1.5">
          {/* Readiness Status Hero */}
          <div className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg bg-muted/50 mb-2`}>
            <span className={`font-bold text-sm ${readinessColor}`}>{readinessLabel}</span>
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${diag.readinessScore === 100 ? 'bg-emerald-500' : diag.readinessScore >= 75 ? 'bg-amber-500' : diag.readinessScore >= 40 ? 'bg-orange-500' : 'bg-destructive'}`}
                style={{ width: `${diag.readinessScore}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground">{diag.readinessScore}% {isAr ? 'جاهزية' : 'readiness'}</span>
          </div>

          {/* App Info Section */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{isAr ? "إصدار التطبيق" : "App Version"}</span>
            <span className="font-mono font-bold text-muted-foreground">{diag.appVersionName || '—'}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{isAr ? "مصدر التثبيت" : "Install Source"}</span>
            <span className={`font-mono font-bold ${diag.installSource?.includes('Play') ? 'text-emerald-500' : 'text-muted-foreground'}`}>{diag.installSource || '—'}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{isAr ? "كتالوج المنتجات" : "Catalog Status"}</span>
            <span className={`font-mono font-bold ${diag.catalogReady ? 'text-emerald-500' : 'text-destructive'}`}>{diag.catalogReady ? '✅' : (isAr ? '❌ لم ينتشر بعد' : '❌ Not propagated')}</span>
          </div>
          {diag.basePlanType && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{isAr ? "نوع الخطة الأساسية" : "Base Plan Type"}</span>
              <span className={`font-mono font-bold ${diag.basePlanType?.includes('auto') ? 'text-emerald-500' : 'text-amber-500'}`}>{diag.basePlanType}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{isAr ? "الشبكة" : "Network"}</span>
            <span className={`font-mono font-bold ${diag.networkReachable ? 'text-emerald-500' : 'text-destructive'}`}>{diag.networkReachable ? '✅' : '❌'}</span>
          </div>
          {diag.connectionLatencyMs != null && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{isAr ? "زمن الاتصال" : "Connect Latency"}</span>
              <span className="font-mono font-bold text-muted-foreground">{diag.connectionLatencyMs}ms</span>
            </div>
          )}

          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={`font-mono font-bold ${item.ok === true ? 'text-emerald-500' : item.ok === false ? 'text-destructive' : 'text-muted-foreground'}`}>
                {item.value}
              </span>
            </div>
          ))}
          {diag.productDetails?.length > 0 && (
            <div className="mt-2 p-2 rounded-lg bg-primary/5 text-[9px]">
              <span className="font-bold text-foreground">{isAr ? "تفاصيل المنتجات:" : "Product Details:"}</span>
              {diag.productDetails.map((p: any, idx: number) => (
                <div key={idx} className="text-muted-foreground mt-0.5">
                  {p.id}: {p.price} ({p.type})
                </div>
              ))}
            </div>
          )}
          {diag.errors?.length > 0 && (
            <div className="mt-2 p-2 rounded-lg bg-destructive/10 text-destructive text-[9px] space-y-1">
              <span className="font-bold">{isAr ? "⚠️ مشاكل مكتشفة:" : "⚠️ Issues Found:"}</span>
              {diag.errors.map((err: string, idx: number) => (
                <div key={idx} className="break-all">• {err}</div>
              ))}
            </div>
          )}
          {diag.error && !diag.errors?.length && (
            <div className="mt-2 p-2 rounded-lg bg-destructive/10 text-destructive text-[9px] break-all">
              {diag.error}
            </div>
          )}
          {/* Timings section */}
          {diag.timings && Object.keys(diag.timings).length > 0 && (
            <div className="mt-2 p-2 rounded-lg bg-muted/30 text-[9px]">
              <span className="font-bold text-muted-foreground">{isAr ? "⏱ أزمنة التشخيص:" : "⏱ Timings:"}</span>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-muted-foreground">
                {Object.entries(diag.timings).map(([k, v]) => (
                  <span key={k}>{k}: <strong>{v as number}ms</strong></span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => runDiag()}
              className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold"
            >
              {isAr ? "إعادة الفحص" : "Re-check"}
            </button>
            <button
              onClick={() => runDiag(true)}
              className="flex-1 py-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold"
            >
              {isAr ? "🔄 Force Refresh" : "🔄 Force Refresh"}
            </button>
            <button
              onClick={() => {
                const lines = items.map(i => `${i.label}: ${i.value}`);
                lines.push(`${isAr ? "إصدار التطبيق" : "App Version"}: ${diag.appVersionName || '—'}`);
                lines.push(`${isAr ? "مصدر التثبيت" : "Install Source"}: ${diag.installSource || '—'}`);
                lines.push(`${isAr ? "كتالوج المنتجات" : "Catalog Status"}: ${diag.catalogReady ? '✅' : '❌'}`);
                lines.push(`${isAr ? "نوع الخطة" : "Base Plan Type"}: ${diag.basePlanType || '—'}`);
                lines.push(`${isAr ? "الشبكة" : "Network"}: ${diag.networkReachable ? '✅' : '❌'}`);
                lines.push(`${isAr ? "زمن الاتصال" : "Connect Latency"}: ${diag.connectionLatencyMs ?? '—'}ms`);
                lines.push(`${isAr ? "نسبة الجاهزية" : "Readiness"}: ${diag.readinessScore}%`);
                if (diag.timings) {
                  lines.push("--- Timings ---");
                  Object.entries(diag.timings).forEach(([k, v]) => lines.push(`  ${k}: ${v}ms`));
                }
                if (diag.productDetails?.length) {
                  lines.push("--- Products ---");
                  diag.productDetails.forEach((p: any) => lines.push(`  ${p.id}: ${p.price} (${p.type}${p.subscriptionPeriod ? ', ' + p.subscriptionPeriod : ''})`));
                }
                if (diag.errors?.length) {
                  lines.push("--- Issues ---");
                  diag.errors.forEach((e: string) => lines.push(`  • ${e}`));
                }
                lines.push(`UserAgent: ${diag.userAgent?.slice(0, 80)}`);
                const text = lines.join("\n");
                navigator.clipboard.writeText(text).then(() => toast.success(isAr ? "تم النسخ" : "Copied!"));
              }}
              className="flex-1 py-1.5 rounded-lg bg-muted text-foreground text-[10px] font-bold"
            >
              {isAr ? "نسخ النتائج" : "Copy Results"}
            </button>
            <button
              onClick={async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  const { error } = await supabase.from('billing_diagnostics').insert({
                    user_id: user?.id || null,
                    device_info: {
                      userAgent: diag.userAgent?.slice(0, 200),
                      chromeVersion: diag.chromeVersion,
                      androidVersion: diag.androidVersion,
                      displayMode: diag.displayMode,
                      referrer: diag.referrer,
                      installSource: diag.installSource,
                      appVersionName: diag.appVersionName,
                    },
                    diagnostics_result: {
                      apiAvailable: diag.apiAvailable,
                      serviceConnected: diag.serviceConnected,
                      connectedMethod: diag.connectedMethod,
                      productsFound: diag.productsFound,
                      existingPurchases: diag.existingPurchases,
                      canMakePayment: diag.canMakePayment,
                      isTWA: diag.isTWA,
                      isStandalone: diag.isStandalone,
                      playStoreInstall: diag.playStoreInstall,
                      authStatus: diag.authStatus,
                      productDetails: diag.productDetails,
                    },
                    readiness_score: diag.readinessScore || 0,
                    readiness_summary: diag.readinessSummary || 'NOT_READY',
                    catalog_ready: diag.catalogReady || false,
                    errors: diag.errors || [],
                  } as any);
                  if (error) throw error;
                  toast.success(isAr ? "✅ تم إرسال التقرير" : "✅ Report sent");
                } catch (e: any) {
                  console.error('[Diagnostics] Send failed:', e);
                  toast.error(isAr ? "فشل إرسال التقرير" : "Failed to send report");
                }
              }}
              className="flex-1 py-1.5 rounded-lg bg-primary/20 text-primary text-[10px] font-bold"
            >
              {isAr ? "📤 إرسال للمتابعة" : "📤 Send Report"}
            </button>
          </div>

          {/* Last saved DB report */}
          {lastDbReport && (
            <div className="mt-3 p-2 rounded-lg bg-muted/30 border border-border/30 text-[9px]">
              <span className="font-bold text-muted-foreground block mb-1">
                {isAr ? "📋 آخر تقرير محفوظ:" : "📋 Last Saved Report:"}
              </span>
              <div className="space-y-0.5 text-muted-foreground">
                <div>{isAr ? "التاريخ" : "Date"}: {new Date(lastDbReport.created_at).toLocaleString()}</div>
                <div>{isAr ? "الجاهزية" : "Readiness"}: {lastDbReport.readiness_score}% — {lastDbReport.readiness_summary}</div>
                <div>{isAr ? "الكتالوج" : "Catalog"}: {lastDbReport.catalog_ready ? '✅' : '❌'}</div>
                {lastDbReport.errors?.length > 0 && (
                  <div className="text-destructive">
                    {lastDbReport.errors.map((e: string, i: number) => <div key={i}>• {e}</div>)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
