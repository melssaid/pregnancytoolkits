import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQ { q: string; a: string }

const faqsByTrimester: Record<1 | 2 | 3, { en: FAQ[]; ar: FAQ[] }> = {
  1: {
    en: [
      { q: 'Is morning sickness normal?', a: 'Yes, it affects up to 80% of pregnant women in the first trimester and usually improves by week 14.' },
      { q: 'What foods should I avoid?', a: 'Avoid raw fish, unpasteurized dairy, and high-mercury fish. Focus on folate-rich foods.' },
      { q: 'When is my first ultrasound?', a: 'Typically between weeks 8-12. This confirms the pregnancy and estimates your due date.' },
    ],
    ar: [
      { q: 'هل الغثيان الصباحي طبيعي؟', a: 'نعم، يصيب حتى 80% من الحوامل في الثلث الأول ويتحسن عادة بحلول الأسبوع 14.' },
      { q: 'ما الأطعمة التي يجب تجنبها؟', a: 'تجنبي السمك النيء ومنتجات الألبان غير المبسترة. ركزي على الأطعمة الغنية بحمض الفوليك.' },
      { q: 'متى أول فحص بالموجات فوق الصوتية؟', a: 'عادة بين الأسبوعين 8-12. يؤكد الحمل ويقدر موعد ولادتك.' },
    ],
  },
  2: {
    en: [
      { q: 'When will I feel the baby move?', a: 'Most women feel first movements (quickening) between weeks 16-22.' },
      { q: 'Is exercise safe during pregnancy?', a: 'Yes! Moderate exercise like walking and prenatal yoga is recommended for most pregnancies.' },
      { q: 'What is the anatomy scan?', a: 'A detailed ultrasound at weeks 18-22 that checks your baby\'s development and can reveal the gender.' },
    ],
    ar: [
      { q: 'متى سأشعر بحركة الطفل؟', a: 'معظم النساء يشعرن بالحركات الأولى بين الأسبوعين 16-22.' },
      { q: 'هل التمارين آمنة أثناء الحمل؟', a: 'نعم! التمارين المعتدلة مثل المشي واليوغا مناسبة لمعظم حالات الحمل.' },
      { q: 'ما هو الفحص التشريحي؟', a: 'فحص بالموجات فوق الصوتية في الأسبوع 18-22 يتحقق من نمو طفلك ويمكن أن يكشف الجنس.' },
    ],
  },
  3: {
    en: [
      { q: 'What are signs of labor?', a: 'Regular contractions, water breaking, and bloody show are common signs. Contact your doctor if contractions are 5 minutes apart.' },
      { q: 'How do I count kicks?', a: 'Count 10 movements within 2 hours. If fewer, drink water and try again. Contact your doctor if concerned.' },
      { q: 'What should I pack in my hospital bag?', a: 'Essentials: ID, insurance, comfortable clothes, baby outfit, toiletries, and phone charger.' },
    ],
    ar: [
      { q: 'ما هي علامات المخاض؟', a: 'الانقباضات المنتظمة ونزول الماء والإفرازات الدموية من العلامات الشائعة. اتصلي بطبيبتك إذا كانت الانقباضات كل 5 دقائق.' },
      { q: 'كيف أعد حركات الطفل؟', a: 'عدي 10 حركات خلال ساعتين. إذا أقل، اشربي ماء وحاولي مرة أخرى. استشيري طبيبتك إذا قلقتِ.' },
      { q: 'ماذا أضع في حقيبة المستشفى؟', a: 'الأساسيات: الهوية، التأمين، ملابس مريحة، ملابس للمولود، أدوات النظافة، وشاحن الهاتف.' },
    ],
  },
};

export const DynamicFAQ = memo(function DynamicFAQ() {
  const { t, i18n } = useTranslation();
  const { profile } = useUserProfile();
  const week = profile.pregnancyWeek;
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  const trimester: 1 | 2 | 3 = week <= 13 ? 1 : week <= 26 ? 2 : 3;
  const faqs = useMemo(() => faqsByTrimester[trimester][lang], [trimester, lang]);

  if (week <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border/20 overflow-hidden"
    >
      <div className="px-4 py-3 flex items-center gap-2 border-b border-border/10">
        <HelpCircle className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-foreground">
          {t('faq.title', { defaultValue: 'أسئلة شائعة لأسبوعك' })}
        </span>
      </div>
      <Accordion type="single" collapsible className="px-3 pb-2">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-border/10">
            <AccordionTrigger className="text-xs font-semibold text-foreground py-3 hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed pb-3">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* FAQPage Schema for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }),
      }} />
    </motion.div>
  );
});
