import { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  adSlot?: string;
  adClient?: string;
  format?: "auto" | "horizontal" | "rectangle" | "fluid";
  className?: string;
}

const DEFAULT_AD_CLIENT = "ca-pub-4171592110992607";
const DEFAULT_AD_SLOT = "6268499910";

export function AdBanner({
  adSlot = DEFAULT_AD_SLOT,
  adClient = DEFAULT_AD_CLIENT,
  format = "auto",
  className = "",
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const isConfigured = adClient && adSlot;

  useEffect(() => {
    if (!isConfigured || pushed.current) return;
    pushed.current = true;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet
    }

    // Observe the ad container for content changes (ad fill)
    const observer = new MutationObserver(() => {
      if (adRef.current) {
        const ins = adRef.current.querySelector("ins.adsbygoogle");
        if (ins && (ins as HTMLElement).offsetHeight > 0) {
          setAdLoaded(true);
          observer.disconnect();
        }
      }
    });

    if (adRef.current) {
      observer.observe(adRef.current, { childList: true, subtree: true, attributes: true });
    }

    // Fallback: check after a delay
    const timeout = setTimeout(() => {
      if (adRef.current) {
        const ins = adRef.current.querySelector("ins.adsbygoogle");
        if (ins && (ins as HTMLElement).offsetHeight > 0) {
          setAdLoaded(true);
        }
      }
      observer.disconnect();
    }, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [isConfigured]);

  // Don't render anything if not configured
  if (!isConfigured) return null;

  return (
    <div
      ref={adRef}
      className={`w-full transition-all duration-300 ${adLoaded ? `opacity-100 ${className}` : "h-0 overflow-hidden opacity-0"}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: adLoaded ? "50px" : "1px" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default AdBanner;
