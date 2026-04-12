import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Brain, Shield, Zap, Heart, Crown, Loader2, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { requestPurchase, isDigitalGoodsAvailable, runBillingDiagnostics, clearBillingCache, type PlanType } from "@/lib/googlePlayBilling";
import { useNavigate, Link } from "react-router-dom";
import pricingLogo from "@/assets/pricing-logo.webp";
import { supabase } from "@/integrations/supabase/client";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { usePlayPrices } from "@/hooks/usePlayPrices";
import { CouponRedeemer } from "@/components/settings/CouponRedeemer";

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
  const [purchasing, setPurchasing] = useState(false);
  const [devTaps, setDevTaps] = useState(0);
  const devMode = devTaps >= 5;
  const isAr = i18n.language === "ar";
  const canPurchase = isDigitalGoodsAvailable();
  const { refresh: refreshAIUsage } = useAIUsage();
  const prices = usePlayPrices();

  const handleSubscribe = async () => {
    if (purchasing) return;

    if (!canPurchase) {
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

    setPurchasing(true);

    const sent = await requestPurchase(
      selected,
      async () => {
        // Instant celebratory toast
        toast.success(
          isAr ? '🎉 تم تفعيل اشتراككِ بنجاح!' : '🎉 Subscription activated!',
          {
            description: isAr ? 'تم منحكِ 60 نقطة — جميع الأدوات مفتوحة' : '60 credits granted — all tools unlocked',
            duration: 4000,
          }
        );
        // Success — quota already set to premium in activateOnServer
        refreshAIUsage();
        localStorage.removeItem("pricing_visit_ts");
        setPurchasing(false);
        // Dispatch event BEFORE navigate so App.tsx listener catches it
        window.dispatchEvent(new CustomEvent("subscription-activated", { detail: { plan: selected } }));
        // Small delay to let event propagate before unmounting
        setTimeout(() => navigate("/"), 300);
      },
      (msg) => {
        setPurchasing(false);
        if (msg) {
          toast.error(
            msg.includes("clientAppUnavailable")
              ? (isAr ? "أعد تشغيل التطبيق وحاول مرة أخرى" : "Restart the app and try again")
              : msg,
            { duration: 5000 }
          );
        }
      },
    );

    if (!sent) {
      setPurchasing(false);
    }
  };

  // Abandoned cart reminder
  useEffect(() => {
    localStorage.setItem("pricing_visit_ts", Date.now().toString());
  }, []);

  const priceDisplay = selected === "yearly" ? prices.yearly.display : prices.monthly.display;
  const period = selected === "yearly" ? t("pricing.yr") : t("pricing.mo");

  return (
    <div
      className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Simple purchasing overlay */}
      {purchasing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">
              {isAr ? "جارٍ إتمام الاشتراك..." : "Processing subscription..."}
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
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-primary/20"
                  initial={{ scale: 0.5, opacity: 0.6 }}
                  animate={{ scale: [0.5, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2.5, delay: i * 0.7, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
              <motion.div
                className="absolute w-20 h-20 rounded-full bg-primary/10 blur-xl"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative z-0 rounded-full overflow-hidden shadow-xl shadow-primary/20 ring-[3px] ring-primary/15 bg-white" style={{ width: 88, height: 88 }}>
                <img src={pricingLogo} alt="Pregnancy Toolkits" className="w-full h-full object-cover" loading="eager" width={88} height={88} />
              </div>
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
                  style={{ left: '50%', top: '50%', marginLeft: -f.size / 2, marginTop: -f.size / 2, fontSize: f.size }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    x: [0, 90, 180, 270, 360].map(a => Math.cos(((f.angle + a) * Math.PI) / 180) * (a % 180 === 0 ? f.radius : f.radius * 0.85)),
                    y: [0, 90, 180, 270, 360].map(a => Math.sin(((f.angle + a) * Math.PI) / 180) * (a % 180 === 0 ? f.radius : f.radius * 0.85)),
                    scale: [0, 1.2, 1, 1.15, 0],
                    opacity: [0, 1, 0.85, 1, 0],
                    rotate: [0, 15, -10, 8, 0],
                  }}
                  transition={{ duration: f.dur, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/30"
              >
                <Icon className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2} />
                <span className="text-[10px] font-medium text-muted-foreground leading-none whitespace-nowrap">
                  {t(`pricing.${key}`)}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Plan cards with real prices */}
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
              <div className="absolute -top-px -end-px">
                <div className="px-2 py-0.5 rounded-es-lg rounded-se-[12px] bg-gradient-to-r from-primary to-primary/80">
                  <span className="text-[8px] font-bold text-primary-foreground">{t("pricing.bestValue")}</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mb-2 transition-colors ${
                selected === "yearly" ? "border-primary bg-primary" : "border-muted-foreground/25"
              }`}>
                {selected === "yearly" && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
              </div>
              <span className="text-[11px] font-bold text-foreground mb-1">{t("pricing.yearly")}</span>
              <span className="text-[22px] font-extrabold text-foreground tabular-nums leading-none" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {prices.yearly.display}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">/{t("pricing.yr")}</span>
              <div className="mt-2 flex flex-col items-center gap-1">
                <span className="text-[9px] text-muted-foreground">{prices.monthlyEquivalent}/{t("pricing.mo")}</span>
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
                {prices.monthly.display}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">/{t("pricing.mo")}</span>
            </button>
          </motion.div>
        </div>

        {/* Bottom CTA — Direct purchase on click */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
          className="mt-5 space-y-2"
        >
          <Button
            onClick={handleSubscribe}
            disabled={purchasing}
            size="lg"
            className="w-full h-[46px] text-[13px] font-bold rounded-2xl shadow-lg shadow-primary/20 whitespace-normal leading-snug"
            style={{ fontFamily: isAr ? "'Almarai', sans-serif" : "'Montserrat', sans-serif" }}
          >
            {purchasing ? (
              <Loader2 className="w-4 h-4 animate-spin me-2" />
            ) : null}
            {t("pricing.cta")}
          </Button>

          <p
            className="text-center text-[10px] text-muted-foreground leading-snug"
            style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif" }}
          >
            {t("pricing.ctaSub", { price: priceDisplay, period })}
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

  useEffect(() => {
    if (!autoRefresh || !visible) return;
    const interval = setInterval(() => { runDiag(); }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, visible]);

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
    'ALMOST_READY': isAr ? '⏳ شبه جاهز' : '⏳ Almost Ready',
    'PARTIAL': isAr ? '⚠️ جزئي' : '⚠️ Partial',
    'NOT_READY': isAr ? '❌ غير جاهز' : '❌ Not Ready',
  }[diag.readinessSummary] || '—' : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-3 rounded-xl bg-card/80 border border-border/40 text-[10px]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-foreground text-[11px]">🔧 {isAr ? "تشخيص الدفع" : "Billing Diagnostics"}</span>
        <div className="flex items-center gap-2">
          {lastCheck && <span className="text-[8px] text-muted-foreground/60">{lastCheck}</span>}
          <button onClick={() => setVisible(false)} className="text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[9px] text-muted-foreground">{isAr ? "تحديث تلقائي كل 30 ثانية" : "Auto-refresh every 30s"}</span>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-colors ${autoRefresh ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}`}
        >
          {autoRefresh ? "🟢 ON" : "⚪ OFF"}
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-2">{isAr ? "جاري الفحص..." : "Checking..."}</p>
      ) : diag ? (
        <div className="space-y-1.5">
          <div className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg bg-muted/50 mb-2">
            <span className={`font-bold text-sm ${readinessColor}`}>{readinessLabel}</span>
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${diag.readinessScore === 100 ? 'bg-emerald-500' : diag.readinessScore >= 75 ? 'bg-amber-500' : diag.readinessScore >= 40 ? 'bg-orange-500' : 'bg-destructive'}`}
                style={{ width: `${diag.readinessScore}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground">{diag.readinessScore}%</span>
          </div>

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
                <div key={idx} className="text-muted-foreground mt-0.5">{p.id}: {p.price} ({p.type})</div>
              ))}
            </div>
          )}

          {diag.errors?.length > 0 && (
            <div className="mt-2 p-2 rounded-lg bg-destructive/10 text-destructive text-[9px] space-y-1">
              <span className="font-bold">⚠️ {isAr ? "مشاكل:" : "Issues:"}</span>
              {diag.errors.map((err: string, idx: number) => (
                <div key={idx} className="break-all">• {err}</div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button onClick={() => runDiag()} className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
              {isAr ? "إعادة الفحص" : "Re-check"}
            </button>
            <button onClick={() => runDiag(true)} className="flex-1 py-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
              🔄 Force Refresh
            </button>
            <button
              onClick={() => {
                const lines = items.map(i => `${i.label}: ${i.value}`);
                if (diag.productDetails?.length) diag.productDetails.forEach((p: any) => lines.push(`${p.id}: ${p.price}`));
                if (diag.errors?.length) diag.errors.forEach((e: string) => lines.push(`• ${e}`));
                navigator.clipboard.writeText(lines.join("\n")).then(() => toast.success(isAr ? "تم النسخ" : "Copied!"));
              }}
              className="flex-1 py-1.5 rounded-lg bg-muted text-foreground text-[10px] font-bold"
            >
              {isAr ? "نسخ" : "Copy"}
            </button>
            <button
              onClick={async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  await supabase.from('billing_diagnostics').insert({
                    user_id: user?.id || null,
                    device_info: { userAgent: diag.userAgent?.slice(0, 200), chromeVersion: diag.chromeVersion, androidVersion: diag.androidVersion, displayMode: diag.displayMode, referrer: diag.referrer, installSource: diag.installSource },
                    diagnostics_result: { apiAvailable: diag.apiAvailable, serviceConnected: diag.serviceConnected, connectedMethod: diag.connectedMethod, productsFound: diag.productsFound, existingPurchases: diag.existingPurchases, canMakePayment: diag.canMakePayment, isTWA: diag.isTWA, isStandalone: diag.isStandalone, playStoreInstall: diag.playStoreInstall, authStatus: diag.authStatus, productDetails: diag.productDetails },
                    readiness_score: diag.readinessScore || 0,
                    readiness_summary: diag.readinessSummary || 'NOT_READY',
                    catalog_ready: diag.catalogReady || false,
                    errors: diag.errors || [],
                  } as any);
                  toast.success(isAr ? "✅ تم الإرسال" : "✅ Sent");
                } catch { toast.error(isAr ? "فشل الإرسال" : "Failed"); }
              }}
              className="flex-1 py-1.5 rounded-lg bg-primary/20 text-primary text-[10px] font-bold"
            >
              📤
            </button>
          </div>

          {lastDbReport && (
            <div className="mt-3 p-2 rounded-lg bg-muted/30 border border-border/30 text-[9px]">
              <span className="font-bold text-muted-foreground block mb-1">📋 {isAr ? "آخر تقرير:" : "Last Report:"}</span>
              <div className="text-muted-foreground">
                <div>{new Date(lastDbReport.created_at).toLocaleString()} — {lastDbReport.readiness_score}%</div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
