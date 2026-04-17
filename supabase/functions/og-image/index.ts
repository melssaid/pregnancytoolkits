// Dynamic Open Graph image generator (1200x630 SVG)
// URL: /functions/v1/og-image?lang=ar
// Returns SVG image with localized title + branding per language.

import { SEO_LOCALES_OG } from "./locales.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[lines.length - 1] = lines[lines.length - 1].slice(0, maxCharsPerLine - 1) + "…";
  }
  return lines;
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const lang = (url.searchParams.get("lang") || "en").toLowerCase();
  const data = SEO_LOCALES_OG[lang] || SEO_LOCALES_OG.en;
  const isRTL = !!data.rtl;

  const title = escapeXml(data.title);
  const subtitle = escapeXml(data.subtitle);
  const brand = escapeXml(data.brand);
  const tagline = escapeXml(data.tagline);

  const titleLines = wrapText(title, 28, 3);
  const subtitleLines = wrapText(subtitle, 50, 2);

  const textAnchor = isRTL ? "end" : "start";
  const textX = isRTL ? 1120 : 80;
  const direction = isRTL ? "rtl" : "ltr";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdf2f8"/>
      <stop offset="50%" stop-color="#fce7f3"/>
      <stop offset="100%" stop-color="#ede9fe"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
    <radialGradient id="glow" cx="85%" cy="20%" r="40%">
      <stop offset="0%" stop-color="#fbcfe8" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#fbcfe8" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Decorative circles -->
  <circle cx="1050" cy="120" r="80" fill="#fbcfe8" opacity="0.4"/>
  <circle cx="1100" cy="500" r="120" fill="#ddd6fe" opacity="0.5"/>
  <circle cx="100" cy="550" r="60" fill="#fce7f3" opacity="0.6"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="1200" height="6" fill="url(#accent)"/>

  <!-- Brand -->
  <text x="${textX}" y="90" text-anchor="${textAnchor}" direction="${direction}"
        font-family="system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif"
        font-size="28" font-weight="600" fill="#9333ea" letter-spacing="2">
    ${brand}
  </text>

  <!-- Title (multi-line) -->
  ${titleLines.map((line, i) => `
  <text x="${textX}" y="${200 + i * 80}" text-anchor="${textAnchor}" direction="${direction}"
        font-family="system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif"
        font-size="64" font-weight="800" fill="#1f2937">
    ${escapeXml(line)}
  </text>`).join("")}

  <!-- Subtitle (multi-line) -->
  ${subtitleLines.map((line, i) => `
  <text x="${textX}" y="${460 + i * 38}" text-anchor="${textAnchor}" direction="${direction}"
        font-family="system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif"
        font-size="28" font-weight="400" fill="#6b7280">
    ${escapeXml(line)}
  </text>`).join("")}

  <!-- Bottom tagline -->
  <rect x="${isRTL ? 920 : 80}" y="560" width="200" height="40" rx="20" fill="url(#accent)"/>
  <text x="${isRTL ? 1020 : 180}" y="586" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="18" font-weight="700" fill="#ffffff">
    ${tagline}
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
