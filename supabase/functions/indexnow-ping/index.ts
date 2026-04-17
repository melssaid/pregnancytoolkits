const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = "https://pregnancytoolkits.lovable.app";

// IndexNow key — public, not a secret
const INDEXNOW_KEY = "b4e2f8a1c3d5e7f9a0b2c4d6e8f0a1b3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const SEO_LANGS = ["en","ar","de","fr","es","pt","tr","it","nl","pl","ru","ja","ko","zh-CN","zh-TW","hi","id","th","vi","ms","fa","ur","he","bn","sv","da","no","fi","cs","el","hu","ro","uk","bg","hr","sk","sr","ca","fil","sw","ta","te","mr","gu","kn","ml","pa","af"];
    const seoUrls = SEO_LANGS.map(l => `/seo/${l}`);
    const urls: string[] = body.urls || [
      "/",
      "/en", "/ar", "/de", "/fr", "/es", "/tr", "/pt",
      ...seoUrls,
      "/tools/due-date-calculator",
      "/tools/kick-counter",
      "/tools/baby-growth",
      "/tools/cycle-tracker",
      "/tools/pregnancy-assistant",
      "/tools/ai-meal-suggestion",
      "/tools/ai-birth-plan",
      "/tools/weight-gain",
      "/tools/contraction-timer",
      "/tools/fetal-growth",
    ];

    const fullUrls = urls.map(u => u.startsWith("http") ? u : `${SITE_URL}${u}`);

    // Ping IndexNow (Bing, Yandex, etc.)
    const indexNowPayload = {
      host: "pregnancytoolkits.lovable.app",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: fullUrls,
    };

    const indexNowRes = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(indexNowPayload),
    });

    // Ping Google sitemap
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`;
    const googleRes = await fetch(googlePingUrl);

    return new Response(
      JSON.stringify({
        success: true,
        indexnow_status: indexNowRes.status,
        google_ping_status: googleRes.status,
        urls_submitted: fullUrls.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
