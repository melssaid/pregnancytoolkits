// Dynamic Pinterest-optimized image generator (1000x1500 SVG)
// URL: /functions/v1/pinterest-image?lang=ar&tool=due-date-calculator
// Returns vertical SVG image — clean & minimal design optimized for Pinterest pins.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Localized titles for the 7 supported languages
const TOOL_TITLES: Record<string, Record<string, string>> = {
  en: {
    "due-date-calculator": "Due Date Calculator",
    "kick-counter": "Baby Kick Counter",
    "contraction-timer": "Contraction Timer",
    "baby-growth": "Baby Growth Tracker",
    "cycle-tracker": "Cycle & Ovulation Tracker",
    "weekly-summary": "Weekly Pregnancy Summary",
    "ai-meal-suggestion": "AI Pregnancy Meal Planner",
    "ai-hospital-bag": "Hospital Bag Checklist",
    "ai-birth-plan": "Birth Plan Generator",
    "vitamin-tracker": "Pregnancy Vitamin Tracker",
    "smart-pregnancy-plan": "Smart Pregnancy Plan",
    "pregnancy-assistant": "AI Pregnancy Assistant",
    default: "Free Pregnancy Tools",
  },
  ar: {
    "due-date-calculator": "حاسبة موعد الولادة",
    "kick-counter": "عداد ركلات الجنين",
    "contraction-timer": "مؤقت الانقباضات",
    "baby-growth": "متابعة نمو الجنين",
    "cycle-tracker": "متابعة الدورة والإباضة",
    "weekly-summary": "ملخص الحمل الأسبوعي",
    "ai-meal-suggestion": "خطة وجبات الحامل بالذكاء الاصطناعي",
    "ai-hospital-bag": "قائمة حقيبة الولادة",
    "ai-birth-plan": "مولّد خطة الولادة",
    "vitamin-tracker": "متابعة فيتامينات الحمل",
    "smart-pregnancy-plan": "خطة الحمل الذكية",
    "pregnancy-assistant": "مساعد الحمل الذكي",
    default: "أدوات الحمل المجانية",
  },
  fr: {
    "due-date-calculator": "Calculateur de Date d'Accouchement",
    "kick-counter": "Compteur de Coups de Bébé",
    "contraction-timer": "Minuteur de Contractions",
    "baby-growth": "Suivi de Croissance du Bébé",
    "cycle-tracker": "Suivi du Cycle & Ovulation",
    default: "Outils de Grossesse Gratuits",
  },
  es: {
    "due-date-calculator": "Calculadora de Fecha de Parto",
    "kick-counter": "Contador de Patadas del Bebé",
    "contraction-timer": "Cronómetro de Contracciones",
    "baby-growth": "Seguimiento del Crecimiento del Bebé",
    default: "Herramientas Gratuitas de Embarazo",
  },
  de: {
    "due-date-calculator": "Geburtstermin-Rechner",
    "kick-counter": "Baby-Kick-Zähler",
    "contraction-timer": "Wehen-Timer",
    default: "Kostenlose Schwangerschafts-Tools",
  },
  pt: {
    "due-date-calculator": "Calculadora de Data de Parto",
    "kick-counter": "Contador de Chutes do Bebê",
    "contraction-timer": "Cronômetro de Contrações",
    default: "Ferramentas Gratuitas de Gravidez",
  },
  tr: {
    "due-date-calculator": "Doğum Tarihi Hesaplayıcı",
    "kick-counter": "Bebek Tekme Sayacı",
    "contraction-timer": "Kasılma Zamanlayıcı",
    default: "Ücretsiz Hamilelik Araçları",
  },
};

const TAGLINES: Record<string, string> = {
  en: "FREE • NO ACCOUNT • OFFLINE",
  ar: "مجاني • بدون حساب • يعمل بدون إنترنت",
  fr: "GRATUIT • SANS COMPTE • HORS LIGNE",
  es: "GRATIS • SIN CUENTA • SIN CONEXIÓN",
  de: "KOSTENLOS • OHNE KONTO • OFFLINE",
  pt: "GRÁTIS • SEM CONTA • OFFLINE",
  tr: "ÜCRETSİZ • HESAP YOK • ÇEVRİMDIŞI",
};

const BRAND_NAMES: Record<string, string> = {
  en: "Pregnancy Toolkits",
  ar: "أدوات الحمل",
  fr: "Pregnancy Toolkits",
  es: "Pregnancy Toolkits",
  de: "Pregnancy Toolkits",
  pt: "Pregnancy Toolkits",
  tr: "Pregnancy Toolkits",
};

const RTL_LANGS = new Set(["ar", "fa", "ur", "he"]);

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length <= maxCharsPerLine) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const lang = (url.searchParams.get("lang") || "en").toLowerCase();
  const toolId = url.searchParams.get("tool") || "default";
  const isRTL = RTL_LANGS.has(lang);

  const langTitles = TOOL_TITLES[lang] || TOOL_TITLES.en;
  const title = langTitles[toolId] || langTitles.default;
  const tagline = TAGLINES[lang] || TAGLINES.en;
  const brand = BRAND_NAMES[lang] || BRAND_NAMES.en;

  const titleEsc = escapeXml(title);
  const taglineEsc = escapeXml(tagline);
  const brandEsc = escapeXml(brand);

  const titleLines = wrapText(titleEsc, 18, 4);
  const direction = isRTL ? "rtl" : "ltr";
  const textAnchor = "middle";

  // 1000x1500 = Pinterest 2:3 ratio
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff5f7"/>
      <stop offset="50%" stop-color="#fce7f3"/>
      <stop offset="100%" stop-color="#ede9fe"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="0%" r="60%">
      <stop offset="0%" stop-color="#fbcfe8" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#fbcfe8" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1000" height="1500" fill="url(#bg)"/>
  <rect width="1000" height="1500" fill="url(#glow)"/>

  <!-- Decorative circles (subtle) -->
  <circle cx="100" cy="200" r="120" fill="#fbcfe8" opacity="0.3"/>
  <circle cx="900" cy="1300" r="160" fill="#ddd6fe" opacity="0.4"/>
  <circle cx="850" cy="100" r="50" fill="#fce7f3" opacity="0.5"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="1000" height="8" fill="url(#accent)"/>

  <!-- Brand (top) -->
  <text x="500" y="180" text-anchor="${textAnchor}" direction="${direction}"
        font-family="system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif"
        font-size="36" font-weight="600" fill="#9333ea" letter-spacing="3">
    ${brandEsc}
  </text>

  <!-- Decorative divider -->
  <rect x="450" y="220" width="100" height="4" rx="2" fill="url(#accent)"/>

  <!-- Title (centered, multi-line) -->
  ${titleLines.map((line, i) => {
    const totalLines = titleLines.length;
    const startY = 600 - (totalLines * 90) / 2;
    return `
  <text x="500" y="${startY + i * 110}" text-anchor="${textAnchor}" direction="${direction}"
        font-family="system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif"
        font-size="88" font-weight="800" fill="#1f2937">
    ${line}
  </text>`;
  }).join("")}

  <!-- Tagline pill (bottom) -->
  <rect x="200" y="1280" width="600" height="70" rx="35" fill="url(#accent)"/>
  <text x="500" y="1326" text-anchor="middle" direction="${direction}"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="26" font-weight="700" fill="#ffffff" letter-spacing="1.5">
    ${taglineEsc}
  </text>

  <!-- URL footer -->
  <text x="500" y="1430" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="22" font-weight="500" fill="#9333ea" letter-spacing="1">
    pregnancytoolkits.lovable.app
  </text>
</svg>`;

  return new Response(svg, {
    headers: {
      ...corsHeaders,
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
    },
  });
});
