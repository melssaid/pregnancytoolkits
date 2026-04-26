import { forwardRef } from "react";

const LoadingScreen = forwardRef<HTMLDivElement>((_, ref) => (
  <div
    ref={ref}
    className="min-h-screen w-full flex flex-col items-center justify-center gap-5"
    role="status"
    aria-live="polite"
  >
    <img
      src="/splash-logo-v2.webp"
      alt="Loading"
      className="w-20 h-20 object-contain"
      loading="eager"
      decoding="async"
    />

    <div className="pt-skeleton-dots" aria-hidden>
      <span /><span /><span />
    </div>

    <style>{`
      .pt-skeleton-dots{display:flex;align-items:center;gap:8px}
      .pt-skeleton-dots span{
        width:10px;height:10px;border-radius:9999px;
        background:hsl(var(--primary, 340 65% 55%));
        opacity:.35;
        animation:pt-skel-bounce .8s infinite ease-in-out;
      }
      .pt-skeleton-dots span:nth-child(2){animation-delay:.15s}
      .pt-skeleton-dots span:nth-child(3){animation-delay:.3s}
      @keyframes pt-skel-bounce{
        0%,100%{transform:translateY(0);opacity:.35}
        50%{transform:translateY(-6px);opacity:1}
      }
    `}</style>
  </div>
));

LoadingScreen.displayName = "LoadingScreen";

export const PageSkeleton = LoadingScreen;
export const IndexSkeleton = LoadingScreen;
export default PageSkeleton;
