import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface AdBannerProps {
  /** AdSense ad slot ID - leave empty for placeholder mode */
  adSlot?: string;
  /** AdSense publisher ID (ca-pub-XXXXX) */
  adClient?: string;
  /** Ad format */
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

// Set your AdSense publisher ID here when ready
const DEFAULT_AD_CLIENT = "ca-pub-4171592110992607";
const DEFAULT_AD_SLOT = "6268499910";

export function AdBanner({
  adSlot = DEFAULT_AD_SLOT,
  adClient = DEFAULT_AD_CLIENT,
  format = "horizontal",
  className = "",
}: AdBannerProps) {
  const { t } = useTranslation();
  const adRef = useRef<HTMLDivElement>(null);
  const isConfigured = adClient && adSlot;

  useEffect(() => {
    if (!isConfigured) return;

    try {
      // Push ad when AdSense script is loaded
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet
    }
  }, [isConfigured]);

  // Placeholder mode — shown when AdSense is not yet configured
  if (!isConfigured) {
    return (
      <div className={`w-full ${className}`}>
        <div className="mx-auto max-w-3xl px-4">
          <div className="relative overflow-hidden rounded-xl border border-dashed border-border/60 bg-muted/20 backdrop-blur-sm">
            <div className="flex items-center justify-center py-3 gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-pulse" />
              <span className="text-[10px] text-muted-foreground/50 font-medium tracking-wider uppercase">
                {t('ads.placeholder', 'Ad Space')}
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Live AdSense mode
  return (
    <div ref={adRef} className={`w-full ${className}`}>
      <div className="mx-auto max-w-3xl px-4">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

export default AdBanner;
