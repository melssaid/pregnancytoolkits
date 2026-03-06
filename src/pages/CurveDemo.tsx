import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const curves = [
  {
    label: "منحنى عميق كلاسيكي",
    id: "deep-classic",
    render: () => (
      <div className="relative">
        <div className="h-16 bg-card border-b border-border/30 flex items-center px-4">
          <span className="font-bold text-foreground">Header</span>
        </div>
        <div className="relative h-12 overflow-hidden">
          <svg viewBox="0 0 1440 80" fill="none" className="absolute top-0 left-0 w-full" preserveAspectRatio="none">
            <path d="M0,0 L0,40 Q720,80 1440,40 L1440,0 Z" fill="hsl(var(--card))" />
          </svg>
        </div>
        <div className="h-32 bg-background" />
      </div>
    ),
  },
  {
    label: "منحنى مقوس ناعم",
    id: "soft-arc",
    render: () => (
      <div className="relative">
        <div className="h-16 bg-card border-b-0 flex items-center px-4">
          <span className="font-bold text-foreground">Header</span>
        </div>
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 100" fill="none" className="absolute top-0 left-0 w-full" preserveAspectRatio="none">
            <path d="M0,0 L0,20 C360,100 1080,100 1440,20 L1440,0 Z" fill="hsl(var(--card))" />
          </svg>
        </div>
        <div className="h-32 bg-background" />
      </div>
    ),
  },
  {
    label: "منحنى عميق جداً (بطن)",
    id: "belly-deep",
    render: () => (
      <div className="relative">
        <div className="h-16 bg-card flex items-center px-4">
          <span className="font-bold text-foreground">Header</span>
        </div>
        <div className="relative h-20 overflow-hidden">
          <svg viewBox="0 0 1440 120" fill="none" className="absolute top-0 left-0 w-full" preserveAspectRatio="none">
            <path d="M0,0 L0,10 Q720,120 1440,10 L1440,0 Z" fill="hsl(var(--card))" />
          </svg>
        </div>
        <div className="h-32 bg-background" />
      </div>
    ),
  },
  {
    label: "منحنى موجة مزدوجة",
    id: "double-wave",
    render: () => (
      <div className="relative">
        <div className="h-16 bg-card flex items-center px-4">
          <span className="font-bold text-foreground">Header</span>
        </div>
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 100" fill="none" className="absolute top-0 left-0 w-full" preserveAspectRatio="none">
            <path d="M0,0 L0,30 C240,80 480,10 720,60 C960,110 1200,30 1440,50 L1440,0 Z" fill="hsl(var(--card))" />
          </svg>
        </div>
        <div className="h-32 bg-background" />
      </div>
    ),
  },
  {
    label: "منحنى مع ظل متدرج",
    id: "gradient-shadow",
    render: () => (
      <div className="relative">
        <div className="h-16 bg-card flex items-center px-4">
          <span className="font-bold text-foreground">Header</span>
        </div>
        <div className="relative h-14 overflow-hidden">
          <svg viewBox="0 0 1440 90" fill="none" className="absolute top-0 left-0 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--card))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--card))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path d="M0,0 L0,30 Q720,90 1440,30 L1440,0 Z" fill="url(#cardGrad)" />
          </svg>
        </div>
        <div className="h-32 bg-background" />
      </div>
    ),
  },
  {
    label: "منحنى حاد على الجوانب",
    id: "sharp-sides",
    render: () => (
      <div className="relative">
        <div className="h-16 bg-card flex items-center px-4">
          <span className="font-bold text-foreground">Header</span>
        </div>
        <div className="relative h-14 overflow-hidden">
          <svg viewBox="0 0 1440 90" fill="none" className="absolute top-0 left-0 w-full" preserveAspectRatio="none">
            <path d="M0,0 L0,5 C200,90 400,90 720,90 C1040,90 1240,90 1440,5 L1440,0 Z" fill="hsl(var(--card))" />
          </svg>
        </div>
        <div className="h-32 bg-background" />
      </div>
    ),
  },
  {
    label: "منحنى بسيط مسطح",
    id: "flat-simple",
    render: () => (
      <div className="relative">
        <div className="h-16 bg-card flex items-center px-4">
          <span className="font-bold text-foreground">Header</span>
        </div>
        <div className="relative h-8 overflow-hidden">
          <svg viewBox="0 0 1440 50" fill="none" className="absolute top-0 left-0 w-full" preserveAspectRatio="none">
            <path d="M0,0 L0,15 Q720,50 1440,15 L1440,0 Z" fill="hsl(var(--card))" />
          </svg>
        </div>
        <div className="h-32 bg-background" />
      </div>
    ),
  },
  {
    label: "منحنى مع لون أساسي خفيف",
    id: "primary-tint",
    render: () => (
      <div className="relative">
        <div className="h-16 bg-card flex items-center px-4">
          <span className="font-bold text-foreground">Header</span>
        </div>
        <div className="relative h-14 overflow-hidden">
          <svg viewBox="0 0 1440 90" fill="none" className="absolute top-0 left-0 w-full" preserveAspectRatio="none">
            <path d="M0,0 L0,25 Q720,90 1440,25 L1440,0 Z" fill="hsl(var(--card))" />
            <path d="M0,0 L0,25 Q720,90 1440,25 L1440,0 Z" fill="hsl(var(--primary))" fillOpacity="0.06" />
          </svg>
        </div>
        <div className="h-32 bg-background" />
      </div>
    ),
  },
];

export default function CurveDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-card border-b border-border/30 flex items-center gap-3 px-4 h-14">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">نماذج الانحناءات</h1>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-8">
        {curves.map((curve, i) => (
          <div key={curve.id} className="rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="px-4 py-2 bg-muted/50 border-b border-border/50">
              <span className="text-sm font-bold text-foreground">{i + 1}. {curve.label}</span>
            </div>
            {curve.render()}
          </div>
        ))}
      </div>
    </div>
  );
}
