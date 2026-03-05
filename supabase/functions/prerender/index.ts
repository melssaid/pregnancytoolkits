import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = "https://pregnancytoolkits.lovable.app";
const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/jo6UX4DMdye2RhsGMYck0XjWOvR2/social-images/social-1770674585393-1000140907.jpg";
const BRAND = "Pregnancy Toolkits";

// HTML escape to prevent injection
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Validate path is a known route or a safe pattern
const VALID_PATH_PATTERN = /^\/[a-z0-9\-\/]*$/;

// SEO metadata for each route
const routeMeta: Record<string, { title: string; description: string }> = {
  "/": { title: "Free Pregnancy Tracker & AI Companion | 42+ Tools", description: "Free pregnancy tracker app with 42+ AI-powered tools: due date calculator, kick counter, contraction timer, baby growth tracker, safe foods guide & more." },
  "/dashboard": { title: "Pregnancy Dashboard", description: "Your personalized pregnancy dashboard with AI assistant, health tracking, nutrition & exercise tools." },
  "/tools/due-date-calculator": { title: "Due Date Calculator", description: "Calculate your estimated due date based on your last menstrual period or conception date. Free and accurate pregnancy due date calculator." },
  "/tools/kick-counter": { title: "Baby Kick Counter", description: "Track your baby's movements with our smart kick counter. Monitor fetal activity patterns and get AI insights." },
  "/tools/baby-growth": { title: "Baby Growth Tracker", description: "Track your baby's growth week by week with percentile charts and developmental milestones." },
  "/tools/pregnancy-assistant": { title: "AI Pregnancy Assistant", description: "Get instant answers to your pregnancy questions from our AI-powered pregnancy companion. Safe, educational information." },
  "/tools/wellness-diary": { title: "Pregnancy Wellness Diary", description: "Track your pregnancy symptoms, mood, and wellness daily. Get AI-powered insights and pattern analysis." },
  "/tools/ai-meal-suggestion": { title: "Pregnancy Meal Planner", description: "Get AI-powered meal suggestions tailored to your pregnancy week, dietary preferences, and nutritional needs." },
  "/tools/weekly-summary": { title: "Weekly Pregnancy Summary", description: "Get a personalized weekly summary of your pregnancy progress, baby's development, and health tips." },
  "/tools/smart-appointment-reminder": { title: "Prenatal Appointment Reminder", description: "Never miss a prenatal checkup. Smart appointment scheduling with AI-generated question lists for your doctor." },
  "/tools/ai-craving-alternatives": { title: "Pregnancy Craving Alternatives", description: "Find healthy alternatives to your pregnancy cravings. AI-powered suggestions for safe and nutritious swaps." },
  "/tools/smart-grocery-list": { title: "Pregnancy Grocery List", description: "Smart grocery list generator for pregnancy nutrition. AI-curated shopping lists by trimester." },
  "/tools/smart-plan": { title: "Smart Pregnancy Plan", description: "Create a comprehensive pregnancy plan covering nutrition, exercise, appointments, and preparation milestones." },
  "/tools/cycle-tracker": { title: "Cycle & Ovulation Tracker", description: "Track your menstrual cycle, predict ovulation, and understand your fertility window with AI analysis." },
  "/tools/fertility-academy": { title: "Fertility Academy", description: "Comprehensive fertility education hub with 29 topics covering reproductive health, tracking, and conception planning." },
  "/tools/preconception-checkup": { title: "Preconception Checkup Guide", description: "Prepare for pregnancy with our comprehensive preconception health checklist and planning guide." },
  "/tools/nutrition-supplements": { title: "Prenatal Nutrition & Supplements Guide", description: "Complete guide to prenatal vitamins, supplements, and nutrition for a healthy pregnancy." },
  "/tools/ai-sleep-optimizer": { title: "Pregnancy Sleep Optimizer", description: "Get AI-powered sleep tips for better rest during pregnancy. Position suggestions and relaxation techniques." },
  "/tools/ai-hospital-bag": { title: "Hospital Bag Checklist", description: "AI-generated hospital bag checklist customized for your birth plan, season, and hospital type." },
  "/tools/ai-partner-guide": { title: "Partner Support Guide", description: "Help your partner understand and support you through pregnancy with AI-personalized guidance." },
  "/tools/ai-birth-position": { title: "Birth Position Guide", description: "Explore optimal birth positions with AI guidance based on your preferences and birth plan." },
  "/tools/ai-skincare": { title: "Pregnancy Skincare Guide", description: "Safe skincare during pregnancy. AI recommendations for pregnancy-safe products and routines." },
  "/tools/ai-nausea-relief": { title: "Morning Sickness Relief", description: "AI-powered nausea relief tips and remedies for pregnancy morning sickness. Safe and effective solutions." },
  "/tools/ai-bump-photos": { title: "Bump Photo Journal", description: "Document your pregnancy journey with weekly bump photos and AI-powered progress tracking." },
  "/tools/ai-fitness-coach": { title: "Pregnancy Fitness Coach", description: "Safe pregnancy exercises with AI coaching. Trimester-specific workouts for strength, flexibility, and stamina." },
  "/tools/ai-back-pain-relief": { title: "Pregnancy Back Pain Relief", description: "AI-guided exercises and stretches for pregnancy back pain relief. Safe techniques for every trimester." },
  "/tools/vitamin-tracker": { title: "Vitamin & Supplement Tracker", description: "Track your daily prenatal vitamins and supplements. Get reminders and AI-powered nutritional insights." },
  "/tools/fetal-growth": { title: "Fetal Development Tracker", description: "Week-by-week fetal development guide with size comparisons, milestones, and 3D visualizations." },
  "/tools/weight-gain": { title: "Pregnancy Weight Gain Tracker", description: "Track your pregnancy weight gain with healthy range charts and AI analysis based on BMI guidelines." },
  "/tools/labor-progress": { title: "Labor Progress Tracker", description: "Track your labor progress with contraction timing, dilation estimates, and AI guidance for each stage." },
  "/tools/ai-birth-plan": { title: "AI Birth Plan Generator", description: "Create a personalized birth plan with AI assistance. Cover pain management, preferences, and contingency plans." },
  "/tools/gestational-diabetes": { title: "Gestational Diabetes Guide", description: "Gestational diabetes risk assessment, blood sugar tracking tips, and dietary guidance for a healthy pregnancy." },
  "/tools/preeclampsia-risk": { title: "Preeclampsia Risk Assessment", description: "Assess your preeclampsia risk factors and learn about warning signs during pregnancy." },
  "/tools/mental-health-coach": { title: "Postpartum Mental Health Coach", description: "AI-powered mental health support for pregnancy and postpartum. Mood tracking and coping strategies." },
  "/tools/baby-gear-recommender": { title: "Baby Gear Recommender", description: "Get personalized baby gear recommendations based on your budget, lifestyle, and nursery needs." },
  "/tools/ai-lactation-prep": { title: "Lactation Preparation Guide", description: "Prepare for breastfeeding with AI-powered lactation guidance, tips, and common challenges solutions." },
  "/tools/postpartum-recovery": { title: "Postpartum Recovery Guide", description: "Comprehensive postpartum recovery guide with AI-personalized healing timelines and self-care tips." },
  "/tools/baby-cry-translator": { title: "Baby Cry Translator", description: "Understand your baby's cries with AI-powered analysis. Identify hunger, discomfort, tiredness, and more." },
  "/tools/baby-sleep-tracker": { title: "Baby Sleep Tracker", description: "Track your baby's sleep patterns and get AI-powered insights for better sleep routines." },
  "/tools/diaper-tracker": { title: "Diaper Tracker", description: "Track diaper changes with pattern analysis. Monitor your baby's health through diaper data." },
  "/videos": { title: "Pregnancy Education Videos", description: "Free pregnancy education videos: exercises, nutrition, labor preparation, and baby care guides." },
  "/privacy": { title: "Privacy Policy", description: "Privacy policy for Pregnancy Toolkits. Your data stays on your device. GDPR & CCPA compliant." },
  "/terms": { title: "Terms of Service", description: "Terms of service for Pregnancy Toolkits. Educational & lifestyle companion, not a medical device." },
  "/contact": { title: "Contact Us", description: "Contact the Pregnancy Toolkits team for support, feedback, or questions." },
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const rawPath = url.searchParams.get("path") || "/";
    
    // Validate path: must match safe pattern and be a known route (fallback to /)
    const path = (VALID_PATH_PATTERN.test(rawPath) && routeMeta[rawPath]) ? rawPath : "/";
    const meta = routeMeta[path] || routeMeta["/"];
    const fullTitle = escapeHtml(path === "/" ? `${BRAND} – ${meta.title}` : `${meta.title} | ${BRAND}`);
    const escapedDescription = escapeHtml(meta.description);
    const canonical = escapeHtml(`${BASE_URL}${path}`);
    const escapedOgImage = escapeHtml(OG_IMAGE);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullTitle}</title>
  <meta name="description" content="${escapedDescription}" />
  <link rel="canonical" href="${canonical}" />

  <!-- Open Graph -->
  <meta property="og:title" content="${fullTitle}" />
  <meta property="og:description" content="${escapedDescription}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${escapedOgImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="${escapeHtml(BRAND)}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${fullTitle}" />
  <meta name="twitter:description" content="${escapedDescription}" />
  <meta name="twitter:image" content="${escapedOgImage}" />

  <!-- Redirect to actual app -->
  <meta http-equiv="refresh" content="0;url=${canonical}" />
</head>
<body>
  <h1>${fullTitle}</h1>
  <p>${escapedDescription}</p>
  <p>Not a medical device. For educational and informational purposes only.</p>
  <a href="${canonical}">Open ${escapeHtml(BRAND)}</a>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
