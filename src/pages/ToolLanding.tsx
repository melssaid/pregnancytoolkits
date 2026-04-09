import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { toolsData, getRelatedTools, getTotalToolsCount } from "@/lib/tools-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Baby, ArrowRight, CheckCircle2, Smartphone, Sparkles,
  Shield, Globe, Star, Download, ExternalLink,
} from "lucide-react";
import { getLocalizedToolSEO } from "@/data/toolSeoLocales";
import { StickyCTA } from "@/components/StickyCTA";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=app.pregnancytoolkits.android";

// SEO-optimized descriptions per tool (EN)
const toolSEO: Record<string, { h1: string; desc: string; longDesc: string; keywords: string; faqs: { q: string; a: string }[] }> = {
  "due-date-calculator": {
    h1: "Free Due Date Calculator — Estimate Your Baby's Arrival",
    desc: "Calculate your estimated due date based on your last menstrual period or IVF transfer date. Free, accurate, and used by millions of expecting parents.",
    longDesc: "Our due date calculator uses Naegele's rule — the same method used by healthcare providers worldwide. Enter your last menstrual period (LMP) date or IVF transfer date, and get an instant estimated delivery date along with trimester milestones, important checkup dates, and a week-by-week pregnancy timeline.",
    keywords: "due date calculator, pregnancy due date, estimated delivery date, EDD calculator, pregnancy calculator",
    faqs: [
      { q: "How accurate is a due date calculator?", a: "Due date calculators use Naegele's rule to estimate delivery within a 2-week window. Only about 5% of babies arrive on the exact due date. Your healthcare provider may adjust the date based on early scan measurements." },
      { q: "Can I calculate my due date from IVF transfer?", a: "Yes. Our calculator supports both LMP-based and IVF transfer date calculations. For IVF, we adjust the calculation based on whether you had a Day 3 or Day 5 transfer." },
    ],
  },
  "kick-counter": {
    h1: "Baby Kick Counter — Track Baby Movements Free",
    desc: "Follow your baby's kick patterns with our free kick counter. Track baby movements, get daily counts, and receive alerts if patterns change.",
    longDesc: "Tracking your baby's movements is one of the most important things you can do during pregnancy. Our kick counter helps you follow baby activity patterns, record daily kick counts, and identify any changes that may need medical attention. Most healthcare providers recommend counting kicks starting at week 28.",
    keywords: "baby kick counter, baby movement log, kick count, baby movement log, pregnancy kick tracker",
    faqs: [
      { q: "When should I start counting baby kicks?", a: "Most healthcare providers recommend starting kick counts around week 28 of pregnancy. Aim for 10 movements within 2 hours, ideally at the same time each day." },
      { q: "What if my baby's kicks decrease?", a: "If you notice a significant decrease in movement, contact your healthcare provider immediately. Our app can help you track patterns to share with your doctor." },
    ],
  },
  "cycle-tracker": {
    h1: "Period & Ovulation Tracker — Predict Your Fertile Window",
    desc: "Track your menstrual cycle, predict ovulation, and identify your fertile window. Free cycle tracker with AI-powered insights for TTC and general health.",
    longDesc: "Our cycle tracker helps you understand your menstrual health by predicting ovulation dates, identifying your fertile window, and analyzing cycle patterns over time. Whether you're trying to conceive or simply tracking your health, our AI-powered insights help you make informed decisions.",
    keywords: "period tracker, ovulation calculator, cycle tracker, fertile window, TTC app, menstrual cycle tracker",
    faqs: [
      { q: "How does the ovulation predictor work?", a: "Our algorithm analyzes your cycle history to predict ovulation based on the average luteal phase length. For most women, ovulation occurs 12-16 days before the next period." },
      { q: "Can this app help me get pregnant?", a: "Yes. Our fertility tracker identifies your most fertile days each cycle, helping you time intercourse for the best chances of conception. It also tracks symptoms like basal body temperature and cervical mucus." },
    ],
  },
  "contraction-timer": {
    h1: "Contraction Timer — Track Labor Contractions",
    desc: "Time your contractions accurately with our free contraction timer. Track frequency, duration, and intensity to know when it's time to go to the hospital.",
    longDesc: "When labor begins, timing contractions is essential. Our contraction timer helps you track the frequency, duration, and intensity of each contraction. The app automatically calculates intervals and alerts you when contractions follow the 5-1-1 pattern (5 minutes apart, lasting 1 minute, for 1 hour) — a common guideline for heading to the hospital.",
    keywords: "contraction timer, labor timer, contraction tracker, labor contractions, 5-1-1 rule",
    faqs: [
      { q: "When should I time contractions?", a: "Start timing when you feel regular, painful contractions. Time from the start of one contraction to the start of the next to measure frequency." },
      { q: "What is the 5-1-1 rule?", a: "The 5-1-1 rule suggests going to the hospital when contractions are 5 minutes apart, lasting 1 minute each, for at least 1 hour. However, always follow your healthcare provider's specific guidance." },
    ],
  },
  "pregnancy-assistant": {
    h1: "AI Pregnancy Assistant — Get Instant Answers",
    desc: "Ask any pregnancy question and get evidence-based answers from our AI assistant. Available 24/7 in 7 languages.",
    longDesc: "Our AI pregnancy assistant provides evidence-based answers to your pregnancy questions, drawing from trusted medical guidelines and research. Whether you're wondering about symptoms, nutrition, exercise, or preparing for labor, get instant, reliable information in your preferred language.",
    keywords: "pregnancy assistant, AI pregnancy help, pregnancy questions, pregnancy advice app",
    faqs: [
      { q: "Is the AI assistant a replacement for my doctor?", a: "No. Our AI assistant provides educational information based on medical guidelines, but it is not a substitute for professional medical advice. Always consult your healthcare provider for medical decisions." },
    ],
  },
  "fetal-growth": {
    h1: "Baby Development Guide — Week by Week Baby Growth",
    desc: "Follow your baby's week-by-week development with 3D visualizations, size comparisons, and developmental milestones.",
    longDesc: "Track your baby's growth from conception to birth with our detailed baby development guide. Each week includes accurate size comparisons, developmental milestones, and what to expect. Visualize your baby's growth with our 3D models and learn about the amazing changes happening inside you.",
    keywords: "baby development, baby growth tracker, pregnancy week by week, baby size by week, baby growth chart",
    faqs: [
      { q: "How big is my baby this week?", a: "Our tracker shows your baby's size compared to common fruits and objects each week. By week 20, your baby is about the size of a banana; by week 40, about the size of a watermelon." },
    ],
  },
  "weight-gain": {
    h1: "Pregnancy Weight Gain Tracker — BMI-Based Guidelines",
    desc: "Monitor healthy pregnancy weight gain with ACOG-based BMI guidelines. Track your progress and get personalized recommendations.",
    longDesc: "Our pregnancy weight gain tracker uses ACOG (American College of Obstetricians and Gynecologists) guidelines to help you monitor healthy weight gain throughout your pregnancy. Enter your pre-pregnancy BMI and current weight to see if you're on track, with personalized recommendations for each trimester.",
    keywords: "pregnancy weight gain, pregnancy BMI, healthy weight pregnancy, ACOG weight guidelines",
    faqs: [
      { q: "How much weight should I gain during pregnancy?", a: "Weight gain depends on your pre-pregnancy BMI. For normal weight (BMI 18.5-24.9), ACOG recommends 25-35 pounds. Underweight women may need more, while overweight women may need less." },
    ],
  },
  // ═══════════════════════════════════════════════════════════
  // SMART ASSISTANT
  // ═══════════════════════════════════════════════════════════
  "smart-pregnancy-plan": {
    h1: "AI Smart Pregnancy Plan — Personalized Week-by-Week Guide",
    desc: "Get a personalized pregnancy plan tailored to your health profile, trimester, and goals. AI-powered recommendations updated every week.",
    longDesc: "Our Smart Pregnancy Plan analyzes your health data — including BMI, blood pressure, gestational diabetes risk, and lifestyle factors — to create a personalized week-by-week pregnancy guide. The AI continuously adapts recommendations as your pregnancy progresses, covering nutrition, exercise, checkups, and mental wellness.",
    keywords: "pregnancy plan, personalized pregnancy guide, pregnancy health plan, AI pregnancy planner, week by week pregnancy plan",
    faqs: [
      { q: "How is the plan personalized?", a: "The plan considers your pre-pregnancy BMI, medical history, current trimester, dietary preferences, and fitness level to generate tailored recommendations that update as your pregnancy progresses." },
      { q: "Does the plan replace prenatal care?", a: "No. The Smart Pregnancy Plan is an educational companion that complements your prenatal care. Always follow your healthcare provider's advice for medical decisions." },
    ],
  },
  "weekly-summary": {
    h1: "Weekly Pregnancy Summary — Your Baby This Week",
    desc: "Get a comprehensive weekly summary of your baby's development, body changes, nutrition tips, and what to expect. AI-powered insights for every week.",
    longDesc: "Our Weekly Pregnancy Summary delivers a complete overview of your pregnancy progress each week. Learn about your baby's development milestones, understand the changes happening in your body, get trimester-specific nutrition advice, and prepare for upcoming checkups — all powered by AI and personalized to your journey.",
    keywords: "weekly pregnancy summary, pregnancy week by week, baby development this week, pregnancy progress, weekly pregnancy update",
    faqs: [
      { q: "When does the weekly summary update?", a: "The summary updates automatically each week based on your due date. You can also manually browse any week from 4 to 42 to see what to expect." },
    ],
  },
  // ═══════════════════════════════════════════════════════════
  // FERTILITY & PLANNING
  // ═══════════════════════════════════════════════════════════
  "fertility-academy": {
    h1: "Fertility Academy — Complete Guide to Getting Pregnant",
    desc: "Learn everything about fertility, ovulation, and conception. Expert-reviewed educational content covering hormones, tests, and lifestyle tips for TTC.",
    longDesc: "The Fertility Academy is your comprehensive educational resource for understanding fertility. Explore topics including ovulation science, hormone testing (AMH, FSH, LH), lifestyle factors affecting fertility, when to see a specialist, and evidence-based tips for improving your chances of conception. All content is reviewed for accuracy.",
    keywords: "fertility guide, how to get pregnant, fertility education, TTC tips, ovulation guide, fertility hormones, conception tips",
    faqs: [
      { q: "How long does it typically take to conceive?", a: "For healthy couples under 35, about 80% conceive within 6 months and 90% within 12 months of trying. If you've been trying for over a year (or 6 months if over 35), consult a fertility specialist." },
      { q: "What fertility tests should I consider?", a: "Common initial tests include AMH (ovarian reserve), FSH, LH, thyroid panel, and semen analysis for the male partner. Your doctor will recommend specific tests based on your situation." },
    ],
  },
  "nutrition-supplements": {
    h1: "Pregnancy Nutrition & Supplements Guide — What to Take & Avoid",
    desc: "Complete guide to prenatal vitamins, supplements, and nutrition during pregnancy. Know what's safe, what's essential, and what to avoid.",
    longDesc: "Navigate pregnancy nutrition with confidence using our comprehensive supplements guide. Learn about essential prenatal vitamins (folic acid, iron, DHA), safe dosages, food sources of key nutrients, and which supplements to avoid. Our guide is organized by trimester to give you the right information at the right time.",
    keywords: "prenatal vitamins, pregnancy supplements, folic acid pregnancy, iron pregnancy, pregnancy nutrition guide, DHA pregnancy",
    faqs: [
      { q: "When should I start taking prenatal vitamins?", a: "Ideally, start taking folic acid at least 1-3 months before conception. If you're already pregnant, start prenatal vitamins as soon as possible. Folic acid is crucial in the first 12 weeks for neural tube development." },
      { q: "Can I take too many vitamins during pregnancy?", a: "Yes. Excessive intake of certain vitamins (especially Vitamin A) can be harmful. Stick to recommended dosages and avoid taking multiple supplements that overlap. Always consult your healthcare provider." },
    ],
  },
  "preconception-checkup": {
    h1: "Preconception Checkup Guide — Prepare for a Healthy Pregnancy",
    desc: "Complete preconception health checklist and guide. Know which tests, vaccines, and lifestyle changes to make before getting pregnant.",
    longDesc: "Preparing for pregnancy starts before conception. Our Preconception Checkup Guide walks you through essential wellness checks, recommended vaccines, medications to review, lifestyle adjustments, and optional wellness checks. Get a personalized checklist to ensure you're in the best health before trying to conceive.",
    keywords: "preconception checkup, pre-pregnancy health, preconception checklist, getting ready for pregnancy, pre-pregnancy tests",
    faqs: [
      { q: "How far in advance should I prepare for pregnancy?", a: "Ideally, start preconception planning 3-6 months before trying to conceive. This gives you time to optimize nutrition, update vaccines, review medications, and address any health concerns." },
    ],
  },
  // ═══════════════════════════════════════════════════════════
  // PREGNANCY TRACKING
  // ═══════════════════════════════════════════════════════════
  "ai-birth-plan": {
    h1: "AI Birth Plan Generator — Create Your Personalized Birth Plan",
    desc: "Generate a detailed, customizable birth plan with AI. Cover labor preferences, pain management, delivery options, and postpartum wishes.",
    longDesc: "Creating a birth plan helps you communicate your preferences to your healthcare team. Our AI Birth Plan Generator asks about your preferences for labor environment, pain management, delivery positions, emergency scenarios, and postpartum care, then creates a professional, printable birth plan you can share with your provider.",
    keywords: "birth plan generator, birth plan template, labor preferences, delivery plan, birth plan checklist, birth plan PDF",
    faqs: [
      { q: "Do I need a birth plan?", a: "While birth plans aren't mandatory, they help you think through your preferences and communicate them to your care team. Remember that birth is unpredictable — a birth plan is a guide, not a guarantee." },
      { q: "When should I create my birth plan?", a: "Most experts recommend creating your birth plan during the third trimester (around weeks 28-32). This gives you time to discuss it with your healthcare provider and make any adjustments." },
    ],
  },
  "ai-bump-photos": {
    h1: "Bump Photo Tracker — Document Your Pregnancy Journey",
    desc: "Capture and organize weekly bump photos with AI analysis. Track your belly growth and create a beautiful pregnancy timeline.",
    longDesc: "Document your pregnancy journey week by week with our Bump Photo Tracker. Take consistent bump photos, add captions and milestones, and watch your belly grow over time. Our AI analyzes growth patterns and helps you create a beautiful photo timeline you can share with family and friends.",
    keywords: "bump photo tracker, pregnancy belly photos, pregnancy photo journal, bump progression, pregnancy timeline photos",
    faqs: [
      { q: "How often should I take bump photos?", a: "For the best timeline, take a photo once a week in the same position, lighting, and outfit. Most moms start between weeks 12-16 when the bump first becomes visible." },
    ],
  },
  // ═══════════════════════════════════════════════════════════
  // NUTRITION & DIET
  // ═══════════════════════════════════════════════════════════
  "ai-meal-suggestion": {
    h1: "AI Pregnancy Meal Planner — Safe & Nutritious Meals",
    desc: "Get personalized meal suggestions safe for pregnancy. AI-powered recommendations based on your trimester, dietary needs, and cravings.",
    longDesc: "Eating well during pregnancy doesn't have to be complicated. Our AI Meal Planner generates personalized meal suggestions based on your current trimester, dietary restrictions, nutritional needs, and even your cravings. Every suggestion is checked against pregnancy food safety guidelines to ensure it's safe for you and your baby.",
    keywords: "pregnancy meal plan, safe foods pregnancy, pregnancy diet, pregnancy nutrition, pregnancy meal ideas, pregnancy food guide",
    faqs: [
      { q: "What foods should I avoid during pregnancy?", a: "Key foods to avoid include raw or undercooked meat and fish, unpasteurized dairy, high-mercury fish (swordfish, king mackerel), raw eggs, and excessive caffeine. Our app flags these automatically in meal suggestions." },
      { q: "How many extra calories do I need?", a: "Generally, no extra calories in the first trimester, about 340 extra in the second trimester, and 450 extra in the third trimester. However, individual needs vary — consult your healthcare provider." },
    ],
  },
  "ai-craving-alternatives": {
    h1: "Pregnancy Craving Alternatives — Healthy Swaps for Cravings",
    desc: "Find healthy alternatives to your pregnancy cravings. AI suggests nutritious swaps that satisfy cravings while keeping you and baby healthy.",
    longDesc: "Pregnancy cravings are real, and sometimes they lead us toward less healthy choices. Our AI Craving Alternatives tool helps you find nutritious substitutes that satisfy the same craving — whether it's something sweet, salty, crunchy, or creamy — while providing essential nutrients for your pregnancy.",
    keywords: "pregnancy cravings, healthy pregnancy snacks, pregnancy food alternatives, craving substitutes, pregnancy nutrition swaps",
    faqs: [
      { q: "Why do I get cravings during pregnancy?", a: "Pregnancy cravings are thought to be caused by hormonal changes, nutritional needs, and heightened senses. While the exact cause isn't fully understood, they're very common and usually harmless." },
    ],
  },
  "smart-grocery-list": {
    h1: "Smart Pregnancy Grocery List — AI-Powered Shopping",
    desc: "Generate a pregnancy-safe grocery list tailored to your trimester and dietary needs. AI ensures every item is safe and nutritious.",
    longDesc: "Shopping for pregnancy-safe foods is easy with our Smart Grocery List. Enter your trimester, dietary preferences, and nutritional goals, and our AI generates a complete shopping list organized by store section. Every item is checked for pregnancy safety, and the list highlights nutrient-dense foods important for each stage of pregnancy.",
    keywords: "pregnancy grocery list, pregnancy shopping list, pregnancy safe foods list, prenatal nutrition shopping, pregnancy meal prep",
    faqs: [
      { q: "Does the list account for food allergies?", a: "Yes. You can specify allergies, intolerances, and dietary restrictions (vegetarian, vegan, gluten-free, etc.) and the AI will generate a list that avoids those items while ensuring adequate nutrition." },
    ],
  },
  "vitamin-tracker": {
    h1: "Pregnancy Vitamin Tracker — Never Miss a Supplement",
    desc: "Track your daily prenatal vitamins and supplements with reminders. Monitor iron, folic acid, DHA, and more throughout your pregnancy.",
    longDesc: "Staying consistent with prenatal vitamins is crucial for your baby's development. Our Vitamin Tracker helps you log daily supplement intake, set reminders, and monitor your adherence over time. Track individual nutrients like folic acid, iron, calcium, DHA, and vitamin D with dosage tracking and refill reminders.",
    keywords: "prenatal vitamin tracker, pregnancy supplement tracker, vitamin reminder, prenatal vitamin schedule, supplement log pregnancy",
    faqs: [
      { q: "Which vitamins are most important during pregnancy?", a: "The most critical prenatal supplements include folic acid (400-800mcg), iron (27mg), calcium (1000mg), DHA/omega-3 (200-300mg), and vitamin D (600 IU). Your healthcare provider may recommend additional supplements based on your needs." },
    ],
  },
  // ═══════════════════════════════════════════════════════════
  // WELLNESS & FITNESS
  // ═══════════════════════════════════════════════════════════
  "wellness-diary": {
    h1: "Pregnancy Wellness Diary — Track Mood, Symptoms & Energy",
    desc: "Log daily symptoms, mood, energy levels, and wellness during pregnancy. Identify patterns and share insights with your healthcare provider.",
    longDesc: "Your pregnancy wellness matters. Our Wellness Diary lets you track daily symptoms, mood changes, energy levels, sleep quality, and hydration. Over time, the app identifies patterns and trends, helping you understand your body's rhythms and giving you valuable data to share with your healthcare provider.",
    keywords: "pregnancy diary, pregnancy symptom tracker, mood tracker pregnancy, pregnancy journal, pregnancy wellness log",
    faqs: [
      { q: "What symptoms should I track?", a: "Track anything that feels notable: nausea, headaches, back pain, fatigue, mood changes, sleep quality, appetite, and any new symptoms. Consistent tracking helps identify patterns and gives your provider useful information." },
    ],
  },
  "ai-fitness-coach": {
    h1: "AI Pregnancy Fitness Coach — Safe Exercises by Trimester",
    desc: "Get personalized pregnancy-safe workout routines based on your trimester and fitness level. AI-guided exercises with proper modifications.",
    longDesc: "Staying active during pregnancy benefits both you and your baby. Our AI Fitness Coach creates personalized exercise routines based on your trimester, fitness level, and any medical considerations. Each workout includes proper modifications, breathing techniques, and safety guidelines. From prenatal yoga to strength training, find the right workout for every stage.",
    keywords: "pregnancy exercises, safe pregnancy workout, prenatal fitness, pregnancy yoga, pregnancy exercise app, trimester workouts",
    faqs: [
      { q: "Is it safe to exercise during pregnancy?", a: "For most healthy pregnancies, moderate exercise is not only safe but recommended. The ACOG suggests 150 minutes of moderate activity per week. However, always get clearance from your healthcare provider before starting any exercise program." },
      { q: "Which exercises should I avoid?", a: "Avoid contact sports, activities with fall risk, exercises lying flat on your back after the first trimester, hot yoga, and high-altitude activities. Our AI automatically excludes unsafe exercises based on your trimester." },
    ],
  },
  "pregnancy-comfort": {
    h1: "Pregnancy Comfort Guide — Relief for Common Discomforts",
    desc: "Find relief from common pregnancy discomforts including back pain, swelling, insomnia, and heartburn. AI-powered comfort tips and techniques.",
    longDesc: "Pregnancy brings amazing changes, but also common discomforts. Our Pregnancy Comfort Guide provides evidence-based relief strategies for back pain, leg cramps, heartburn, swelling, insomnia, and more. Get personalized tips based on your trimester and specific symptoms, including safe sleeping positions, stretching routines, and natural remedies.",
    keywords: "pregnancy comfort, pregnancy back pain relief, pregnancy insomnia, pregnancy heartburn, pregnancy leg cramps, pregnancy sleep positions",
    faqs: [
      { q: "How can I sleep better during pregnancy?", a: "Try sleeping on your left side with a pillow between your knees. Elevate your upper body to reduce heartburn. Avoid screens before bed, and establish a relaxing bedtime routine. Our app provides personalized sleep tips for each trimester." },
    ],
  },
  "ai-pregnancy-skincare": {
    h1: "Pregnancy Skincare Guide — Safe Products & Routines",
    desc: "Discover pregnancy-safe skincare routines and products. AI analyzes ingredients and creates personalized routines for stretch marks, acne, and more.",
    longDesc: "Your skin changes significantly during pregnancy. Our AI Skincare Guide helps you navigate pregnancy-safe ingredients, avoid harmful chemicals, and build effective routines for common concerns like stretch marks, melasma, acne, and dryness. Get personalized product recommendations and ingredient safety checks.",
    keywords: "pregnancy skincare, safe skincare pregnancy, pregnancy stretch marks, pregnancy acne, pregnancy safe ingredients, pregnancy beauty routine",
    faqs: [
      { q: "Which skincare ingredients should I avoid?", a: "Avoid retinoids (vitamin A derivatives), high-dose salicylic acid, hydroquinone, formaldehyde, and chemical sunscreens with oxybenzone. Our app checks product ingredients against the safety database automatically." },
    ],
  },
  "ai-back-pain-relief": {
    h1: "Pregnancy Back Pain Relief — Exercises & Tips",
    desc: "Get personalized back pain relief exercises and stretches for pregnancy. AI-guided routines safe for every trimester.",
    longDesc: "Back pain affects up to 70% of pregnant women. Our AI Back Pain Relief tool provides targeted stretching routines, strengthening exercises, posture tips, and ergonomic advice specific to your trimester and pain location. Each exercise comes with clear instructions, safety modifications, and visual guides.",
    keywords: "pregnancy back pain, back pain exercises pregnancy, prenatal stretches, pregnancy posture, lower back pain pregnant, sciatica pregnancy",
    faqs: [
      { q: "Is back pain normal during pregnancy?", a: "Yes, back pain is very common during pregnancy due to hormonal changes, weight gain, and shifting center of gravity. However, severe or sudden pain should be evaluated by your healthcare provider." },
    ],
  },
  // ═══════════════════════════════════════════════════════════
  // PREPARATION & BIRTH
  // ═══════════════════════════════════════════════════════════
  "maternal-health-awareness": {
    h1: "Maternal Health Awareness — Know the Warning Signs",
    desc: "Learn about important pregnancy warning signs and complications. Evidence-based information on preeclampsia, gestational diabetes, and more.",
    longDesc: "Knowledge is power during pregnancy. Our Maternal Health Awareness tool educates you about potential complications including preeclampsia, gestational diabetes, placenta previa, and preterm labor. Learn the warning signs, understand risk factors, and know when to seek immediate medical attention. This educational resource is designed to empower, not alarm.",
    keywords: "pregnancy warning signs, preeclampsia symptoms, gestational diabetes, pregnancy complications, maternal health, pregnancy emergency signs",
    faqs: [
      { q: "What are the warning signs I should never ignore?", a: "Seek immediate medical attention for: severe headache with vision changes, vaginal bleeding, severe abdominal pain, sudden swelling of face/hands, difficulty breathing, or decreased fetal movement. When in doubt, always call your provider." },
    ],
  },
  "ai-hospital-bag": {
    h1: "Hospital Bag Checklist — AI-Powered Packing List",
    desc: "Generate a personalized hospital bag checklist for labor and delivery. Covers mom, baby, and partner essentials based on your birth plan.",
    longDesc: "Don't forget anything for the big day. Our AI Hospital Bag Checklist generates a personalized packing list based on your birth plan, hospital or birthing center requirements, season, and personal preferences. Covering essentials for mom, baby, and birth partner, the list includes often-forgotten items and lets you check off items as you pack.",
    keywords: "hospital bag checklist, labor bag packing list, what to pack hospital delivery, birth bag essentials, hospital bag for delivery",
    faqs: [
      { q: "When should I pack my hospital bag?", a: "Pack your hospital bag by week 35-36 of pregnancy. Keep it by the door or in your car so you're ready anytime. Our checklist lets you start early and add items over time." },
      { q: "What are the most forgotten hospital bag items?", a: "Commonly forgotten items include phone charger (long cable), lip balm, going-home outfit for baby, snacks for your partner, nursing pillow, and copies of your birth plan." },
    ],
  },
  "baby-gear-recommender": {
    h1: "Baby Gear Recommender — Essential Products for Your Newborn",
    desc: "Get AI-powered recommendations for essential baby gear. Budget-friendly picks for car seats, strollers, cribs, and everything your newborn needs.",
    longDesc: "Preparing for baby doesn't have to break the bank. Our AI Baby Gear Recommender helps you identify the essential items you actually need, suggests budget-friendly options, and prioritizes safety-certified products. Get recommendations for car seats, cribs, strollers, feeding supplies, and more — organized by priority and budget.",
    keywords: "baby gear recommendations, newborn essentials, baby registry checklist, what to buy for newborn, baby shopping list, best baby products",
    faqs: [
      { q: "What baby gear do I actually need?", a: "Must-haves include a car seat, safe sleep space (crib/bassinet), diapers, feeding supplies, and basic clothing. Many popular items (wipe warmers, shoe organizers) are nice-to-haves, not essentials. Our tool separates needs from wants." },
    ],
  },
  "smart-appointment-reminder": {
    h1: "Pregnancy Appointment Reminder — Never Miss a Checkup",
    desc: "Track prenatal appointments and lab tests with smart reminders. AI schedules recommended checkups based on your pregnancy timeline.",
    longDesc: "Stay on top of your prenatal care with our Smart Appointment Reminder. The AI automatically suggests recommended checkups, glucose tests, and lab work based on standard prenatal care guidelines and your pregnancy timeline. Set reminders, add notes from visits, and track questions to ask your provider.",
    keywords: "prenatal appointment tracker, pregnancy checkup schedule, pregnancy photo timeline, pregnancy appointment reminder, prenatal care timeline",
    faqs: [
      { q: "How often should I see my doctor during pregnancy?", a: "Standard prenatal visit schedule: monthly until week 28, every 2 weeks from weeks 28-36, then weekly until delivery. High-risk pregnancies may require more frequent visits." },
    ],
  },
  "ai-partner-guide": {
    h1: "Partner's Pregnancy Guide — How to Support Your Pregnant Partner",
    desc: "AI-powered guide for partners during pregnancy. Learn how to support your partner through each trimester with practical tips and emotional guidance.",
    longDesc: "Pregnancy is a team journey. Our AI Partner Guide helps partners understand what's happening each trimester, provides practical support tips, addresses common concerns, and offers guidance on being present during labor and delivery. Learn about physical changes, emotional needs, and how to prepare together for parenthood.",
    keywords: "pregnancy partner guide, dad pregnancy guide, partner support pregnancy, husband pregnancy tips, pregnancy guide for dads, expecting father guide",
    faqs: [
      { q: "How can I support my partner during pregnancy?", a: "Key ways to support: attend prenatal appointments together, help with household tasks, learn about pregnancy changes, be emotionally available, help prepare for the baby, and educate yourself about labor and delivery." },
    ],
  },
  "ai-birth-position": {
    h1: "Birth Position Guide — Find Your Best Labor Positions",
    desc: "Explore evidence-based labor and delivery positions with AI guidance. Find comfortable positions for each stage of labor.",
    longDesc: "Movement and positioning during labor can help manage pain and facilitate delivery. Our AI Birth Position Guide presents evidence-based labor positions for each stage — early labor, active labor, pushing, and resting. Each position includes benefits, how-to instructions, and when it's most effective. Personalized to your birth plan and comfort level.",
    keywords: "labor positions, birth positions, best position for labor, delivery positions, active labor positions, pushing positions birth",
    faqs: [
      { q: "Does position really affect labor?", a: "Yes. Upright and forward-leaning positions can help use gravity to your advantage, potentially shortening labor and reducing pain. Different positions work better at different stages — our guide helps you find what works for you." },
    ],
  },
  // ═══════════════════════════════════════════════════════════
  // POSTPARTUM & BABY
  // ═══════════════════════════════════════════════════════════
  "postpartum-mental-health": {
    h1: "Postpartum Mood & Wellness Coach — Self-Check & Support",
    desc: "Follow your emotional wellbeing after birth with mood tracking, mood self-check tools, and AI-guided coping strategies. For educational purposes only.",
    longDesc: "The postpartum period brings significant emotional changes. Our Mental Health Coach helps you monitor mood patterns, screen for signs of postpartum depression using validated questionnaires (Edinburgh Scale), and access evidence-based coping strategies. Connect with support resources and track your emotional recovery journey. This is an educational tool, not a diagnostic or treatment service.",
    keywords: "postpartum depression, mood self-check, postpartum mood wellness, baby blues, postpartum anxiety, postpartum mood journal, postnatal mood changes",
    faqs: [
      { q: "What's the difference between baby blues and postpartum depression?", a: "Baby blues affect up to 80% of new mothers and typically resolve within 2 weeks. PPD is more severe, lasting longer than 2 weeks, and may include intense sadness, anxiety, difficulty bonding, or thoughts of self-harm. If symptoms persist, please reach out to your healthcare provider." },
      { q: "When should I seek help?", a: "Seek professional help if mood symptoms last longer than 2 weeks after birth, interfere with daily functioning or baby care, include thoughts of harming yourself or your baby, or if you feel persistently hopeless or disconnected." },
    ],
  },
  "ai-lactation-prep": {
    h1: "Breastfeeding Preparation Guide — Lactation Tips & Techniques",
    desc: "Prepare for breastfeeding with our AI-powered lactation guide. Learn proper latch, positions, supply building, and troubleshooting common issues.",
    longDesc: "Breastfeeding success often depends on preparation. Our AI Lactation Prep Guide covers everything from prenatal breast care to establishing a strong milk supply. Learn proper latch techniques, explore feeding positions, understand supply and demand, troubleshoot common challenges like engorgement and nipple pain, and get a pumping and back-to-work plan.",
    keywords: "breastfeeding guide, lactation preparation, breastfeeding positions, proper latch breastfeeding, milk supply tips, breastfeeding help, pumping guide",
    faqs: [
      { q: "How can I prepare for breastfeeding before birth?", a: "Take a breastfeeding class, buy nursing supplies (bras, pads, nipple cream), learn about proper latch and positions, and plan for the first hour of skin-to-skin contact after birth. Our guide covers all prenatal preparation steps." },
      { q: "What if I can't breastfeed?", a: "Fed is best. Many factors can affect breastfeeding. Our guide includes information about combination feeding, pumping exclusively, and formula feeding. There is no one 'right' way to feed your baby." },
    ],
  },
  "postpartum-recovery": {
    h1: "Postpartum Recovery Guide — Heal & Recover After Birth",
    desc: "Comprehensive postpartum recovery guide covering physical healing, pelvic floor exercises, C-section care, and return to activity timeline.",
    longDesc: "Recovery after birth is a journey that deserves attention and care. Our Postpartum Recovery Guide covers physical healing timelines for both vaginal and cesarean births, pelvic floor rehabilitation exercises, wound care, managing postpartum bleeding, when to resume activities, and warning signs to watch for. Personalized to your birth experience.",
    keywords: "postpartum recovery, after birth healing, pelvic floor exercises postpartum, C-section recovery, postpartum bleeding, postpartum body recovery",
    faqs: [
      { q: "How long does postpartum recovery take?", a: "Physical recovery varies: vaginal birth recovery is typically 6-8 weeks, while C-section recovery is usually 8-12 weeks. Full pelvic floor recovery may take 6-12 months. Everyone heals at their own pace." },
    ],
  },
  "baby-cry-translator": {
    h1: "Baby Cry Translator — Understand Why Your Baby Is Crying",
    desc: "AI-powered baby cry analysis to help identify if your baby is hungry, tired, uncomfortable, or needs a diaper change. Educational guide for new parents.",
    longDesc: "New to parenthood and wondering why your baby is crying? Our Baby Cry Translator uses AI to help you identify common cry patterns associated with hunger, tiredness, discomfort, overstimulation, and other needs. Combined with educational content about infant communication, it helps new parents build confidence in understanding their baby's cues.",
    keywords: "baby cry translator, why is my baby crying, baby cry guide, newborn crying, baby cues, infant cry meaning, baby cry app",
    faqs: [
      { q: "Can an app really translate baby cries?", a: "While no app can perfectly 'translate' baby cries, research shows that different needs produce distinct cry patterns. Our tool combines AI pattern recognition with educational content about common baby cues to help you respond effectively." },
    ],
  },
  "baby-sleep-tracker": {
    h1: "Baby Sleep Tracker — Monitor Newborn Sleep Patterns",
    desc: "Track your baby's sleep schedule, naps, and nighttime sleep. Get insights on sleep patterns and age-appropriate sleep guidelines.",
    longDesc: "Understanding your baby's sleep patterns is key to healthy development and parental sanity. Our Baby Sleep Tracker lets you log naps, nighttime sleep, wake windows, and feeding times. The app provides age-appropriate sleep guidelines, identifies patterns, and offers tips for establishing healthy sleep routines from the newborn stage onward.",
    keywords: "baby sleep tracker, newborn sleep schedule, baby nap tracker, infant sleep patterns, baby sleep log, baby sleep guidelines",
    faqs: [
      { q: "How much should my newborn sleep?", a: "Newborns (0-3 months) typically sleep 14-17 hours per day in short bursts. By 4-6 months, many babies consolidate to 12-15 hours with longer nighttime stretches. Every baby is different — our tracker helps you understand your baby's unique patterns." },
    ],
  },
  "baby-growth": {
    h1: "Baby Growth Tracker — Monitor Weight, Height & Milestones",
    desc: "Track your baby's growth with WHO-standard growth charts. Monitor weight, height, and head circumference percentiles from birth to 2 years.",
    longDesc: "Keep track of your baby's physical development with our Growth Tracker, based on WHO growth standards. Log weight, length/height, and head circumference measurements, and see how your baby compares to standard percentiles. Track developmental milestones, get growth alerts, and generate reports to share with your pediatrician.",
    keywords: "baby growth tracker, baby weight chart, baby height percentile, WHO growth chart baby, baby milestone tracker, infant growth chart",
    faqs: [
      { q: "What growth percentile is normal?", a: "Any percentile from 3rd to 97th is considered normal. What matters most is that your baby follows a consistent growth curve over time. Sudden changes in percentile may warrant discussion with your pediatrician." },
    ],
  },
  "diaper-tracker": {
    h1: "Diaper Tracker — Monitor Baby's Diaper Changes",
    desc: "Track wet and dirty diapers to ensure your newborn is feeding well and staying hydrated. Set daily goals and get pattern insights.",
    longDesc: "In the first weeks of life, diaper output is one of the best indicators that your baby is getting enough nutrition. Our Diaper Tracker helps you log wet and dirty diapers, set age-appropriate daily goals, track color and consistency, and identify any patterns that might indicate feeding issues or dehydration. Simple, fast logging with helpful insights.",
    keywords: "diaper tracker, baby diaper log, newborn diaper count, wet diaper tracker, baby poop tracker, diaper change app",
    faqs: [
      { q: "How many diapers should my newborn have per day?", a: "In the first few days, expect 1-2 wet diapers per day. By day 5+, healthy newborns typically have 6+ wet diapers and 3-4 dirty diapers per day. This is a key sign that your baby is feeding well." },
    ],
  },
};

// Fallback for tools without specific SEO data
function getToolSEO(toolId: string, toolTitle: string, lang: string = "en") {
  // Try localized version first (non-English)
  if (lang !== "en") {
    const localized = getLocalizedToolSEO(lang, toolId);
    if (localized) {
      // Merge with English longDesc and keywords
      const enData = toolSEO[toolId];
      return {
        ...localized,
        longDesc: enData?.longDesc || localized.desc,
        keywords: enData?.keywords || `${toolTitle.toLowerCase()}, pregnancy app`,
      };
    }
  }
  // English or fallback
  if (toolSEO[toolId]) return toolSEO[toolId];
  const count = getTotalToolsCount();
  return {
    h1: `${toolTitle} — Free Pregnancy Tool`,
    desc: `Use our free ${toolTitle.toLowerCase()} to support your pregnancy journey. Part of Pregnancy Toolkits' ${count}+ AI-powered tools.`,
    longDesc: `${toolTitle} is part of Pregnancy Toolkits, a comprehensive free pregnancy app with ${count}+ AI-powered tools. Track your pregnancy, monitor your baby's growth, and get personalized insights — all in one app.`,
    keywords: `${toolTitle.toLowerCase()}, pregnancy app, pregnancy tools`,
    faqs: [] as { q: string; a: string }[],
  };
}

export default function ToolLanding() {
  const { toolSlug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  // Map slug to tool
  const tool = toolsData.find((t) => {
    const slug = t.href.replace("/tools/", "");
    return slug === toolSlug;
  });

  if (!tool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Tool not found</h1>
          <Link to="/">
            <Button>Go to App</Button>
          </Link>
        </div>
      </div>
    );
  }

  const toolTitle = t(tool.titleKey);
  const seo = getToolSEO(tool.id, toolTitle, lang);
  const related = getRelatedTools(tool.id, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${seo.h1} | Pregnancy Toolkits`,
    "url": `https://pregnancytoolkits.lovable.app/tool/${toolSlug}`,
    "description": seo.desc,
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web, Android",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "isPartOf": {
      "@type": "SoftwareApplication",
      "name": "Pregnancy Toolkits",
      "url": "https://pregnancytoolkits.lovable.app",
    },
  };

  const faqJsonLd = seo.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": seo.faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  } : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pregnancy Toolkits", "item": "https://pregnancytoolkits.lovable.app" },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://pregnancytoolkits.lovable.app/en" },
      { "@type": "ListItem", "position": 3, "name": toolTitle, "item": `https://pregnancytoolkits.lovable.app/tool/${toolSlug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={seo.h1}
        description={seo.desc}
        keywords={seo.keywords}
      />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/en" className="flex items-center gap-2">
            <Baby className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Pregnancy Toolkits</span>
          </Link>
          <Link to={tool.href}>
            <Button size="sm" className="gap-1.5">
              Open Tool <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Free — No signup required
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
            {seo.h1}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {seo.desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 text-base w-full sm:w-auto bg-primary hover:bg-primary/90">
                <Download className="h-5 w-5" />
                Download on Google Play
              </Button>
            </a>
            <Link to={tool.href}>
              <Button variant="outline" size="lg" className="gap-2 text-base w-full sm:w-auto">
                <Smartphone className="h-5 w-5" />
                Use in Browser — Free
              </Button>
            </Link>
          </div>

          {/* Google Play Badge */}
          <div className="pt-4">
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
              <img
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Get it on Google Play"
                className="h-14 mx-auto"
                loading="lazy"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-muted/40 border-y border-border py-8">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">100% Private</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Globe className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">7 Languages</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">{getTotalToolsCount()}+ Free Tools</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">AI-Powered</span>
          </div>
        </div>
      </section>

      {/* Long description */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            About {toolTitle}
          </h2>
          <p className="text-foreground/80 leading-relaxed text-base">
            {seo.longDesc}
          </p>

          {/* Features */}
          <div className="mt-8 space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Key Features</h3>
            <ul className="space-y-2">
              {[
                "Completely free — no hidden fees or premium gates",
                "Available in 7 languages including English, Arabic, Spanish, French, German, Turkish, and Portuguese",
                tool.hasAI ? "AI-powered insights based on medical guidelines" : "Evidence-based health information",
                "Your data stays private on your device — GDPR & CCPA compliant",
                "Works on any device — web, Android, and iOS",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQs */}
      {seo.faqs.length > 0 && (
        <section className="bg-muted/40 border-y border-border py-12">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {seo.faqs.map((faq, i) => (
                <article key={i} className="bg-card rounded-xl p-5 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related tools */}
      {related.length > 0 && (
        <section className="container py-12">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">
            Related Pregnancy Tools
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((rt) => (
              <Link key={rt.id} to={`/tool/${rt.href.replace("/tools/", "")}`}>
                <Card className="h-full hover:shadow-md transition-shadow border-border hover:border-primary/30 group">
                  <CardContent className="p-4 space-y-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <rt.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{t(rt.titleKey)}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t(rt.descriptionKey)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-12 text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <h2 className="text-2xl font-bold text-foreground">
            Ready to Use {toolTitle}?
          </h2>
          <p className="text-muted-foreground text-sm">
            Join thousands of expecting parents who use Pregnancy Toolkits every day. Free forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Download className="h-5 w-5" />
                Get the App — Free
              </Button>
            </a>
            <Link to={tool.href}>
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                <ExternalLink className="h-4 w-4" />
                Open in Browser
              </Button>
            </Link>
          </div>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              className="h-14 mx-auto"
              loading="lazy"
            />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container text-center space-y-2">
          <p className="text-[10px] text-muted-foreground">
            Pregnancy Toolkits is an educational companion, not a medical device. Always consult your healthcare provider.
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
      <StickyCTA />
    </div>
  );
}
