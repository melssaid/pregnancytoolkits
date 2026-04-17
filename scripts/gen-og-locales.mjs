import { SEO_LOCALES } from '../src/data/seoLocales.ts';
const out = {};
for (const [k, v] of Object.entries(SEO_LOCALES)) {
  out[k] = {
    title: v.h1,
    subtitle: v.intro.slice(0, 140).replace(/\s+\S*$/, '') + '…',
    brand: (v.metaTitle.split('—')[0] || 'Pregnancy Toolkits').trim(),
    tagline: v.cta,
    rtl: !!v.rtl,
  };
}
const banner = '// Auto-generated from src/data/seoLocales.ts — do not edit manually.\n';
const body = 'export const SEO_LOCALES_OG: Record<string, { title: string; subtitle: string; brand: string; tagline: string; rtl?: boolean }> = ' + JSON.stringify(out, null, 2) + ';\n';
process.stdout.write(banner + body);
