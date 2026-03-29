
-- ══════════════════════════════════════════
-- SEO Categories Table
-- ══════════════════════════════════════════
CREATE TABLE public.seo_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  description_ar text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for seo_categories"
  ON public.seo_categories FOR SELECT
  TO public
  USING (true);

-- ══════════════════════════════════════════
-- SEO Keywords Table
-- ══════════════════════════════════════════
CREATE TABLE public.seo_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_ar text NOT NULL,
  keyword_en text,
  category_id uuid REFERENCES public.seo_categories(id) ON DELETE CASCADE NOT NULL,
  intent text NOT NULL DEFAULT 'informational',
  volume_tier text NOT NULL DEFAULT 'Medium',
  competition_tier text NOT NULL DEFAULT 'Medium',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for seo_keywords"
  ON public.seo_keywords FOR SELECT
  TO public
  USING (true);

CREATE INDEX idx_seo_keywords_category ON public.seo_keywords(category_id);
CREATE INDEX idx_seo_keywords_intent ON public.seo_keywords(intent);
CREATE INDEX idx_seo_keywords_volume ON public.seo_keywords(volume_tier);

-- ══════════════════════════════════════════
-- Seed Categories
-- ══════════════════════════════════════════
INSERT INTO public.seo_categories (id, name_ar, name_en, icon, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'الحمل المبكر واختبار الحمل', 'Early Pregnancy & Tests', '🧪', 1),
  ('a1000000-0000-0000-0000-000000000002', 'أعراض الحمل الشائعة', 'Common Pregnancy Symptoms', '🤰', 2),
  ('a1000000-0000-0000-0000-000000000003', 'أسابيع الحمل وتطوّر الجنين', 'Pregnancy Weeks & Fetal Dev', '📅', 3),
  ('a1000000-0000-0000-0000-000000000004', 'التغذية والمكملات للحامل', 'Nutrition & Supplements', '🥗', 4),
  ('a1000000-0000-0000-0000-000000000005', 'حمل آمن ومضاعفات وتحذيرات', 'Safe Pregnancy & Complications', '⚠️', 5),
  ('a1000000-0000-0000-0000-000000000006', 'التمارين والنوم ونمط الحياة', 'Exercise, Sleep & Lifestyle', '🏃‍♀️', 6),
  ('a1000000-0000-0000-0000-000000000007', 'الولادة والمخاض', 'Labor & Birth', '👶', 7),
  ('a1000000-0000-0000-0000-000000000008', 'ما بعد الولادة والنفاس', 'Postpartum & Recovery', '💜', 8),
  ('a1000000-0000-0000-0000-000000000009', 'الرضاعة الطبيعية وتغذية الأم', 'Breastfeeding & Maternal Nutrition', '🍼', 9),
  ('a1000000-0000-0000-0000-00000000000a', 'رعاية المولود', 'Newborn Care', '👣', 10),
  ('a1000000-0000-0000-0000-00000000000b', 'الخصوبة والتبويض والتخطيط للحمل', 'Fertility & Ovulation', '🌸', 11),
  ('a1000000-0000-0000-0000-00000000000c', 'تحاليل وفحوصات الخصوبة', 'Fertility Tests', '🔬', 12),
  ('a1000000-0000-0000-0000-00000000000d', 'علاجات وتقنيات مساعدة على الإنجاب', 'Assisted Reproduction', '🏥', 13);

-- ══════════════════════════════════════════
-- Seed Keywords (130 keywords)
-- ══════════════════════════════════════════

-- [1] الحمل المبكر واختبار الحمل
INSERT INTO public.seo_keywords (keyword_ar, keyword_en, category_id, intent, volume_tier, competition_tier) VALUES
('أعراض الحمل المبكر', 'early pregnancy symptoms', 'a1000000-0000-0000-0000-000000000001', 'informational', 'High', 'High'),
('علامات الحمل قبل الدورة', 'pregnancy signs before period', 'a1000000-0000-0000-0000-000000000001', 'informational', 'High', 'High'),
('أعراض الحمل في الأسبوع الأول', 'week 1 pregnancy symptoms', 'a1000000-0000-0000-0000-000000000001', 'informational', 'Medium', 'Medium'),
('متى يظهر الحمل في التحليل', 'when pregnancy shows in test', 'a1000000-0000-0000-0000-000000000001', 'informational', 'High', 'High'),
('تحليل الحمل المنزلي', 'home pregnancy test', 'a1000000-0000-0000-0000-000000000001', 'informational', 'High', 'High'),
('تحليل الحمل الرقمي', 'digital pregnancy test', 'a1000000-0000-0000-0000-000000000001', 'informational', 'Medium', 'Medium'),
('تحليل الدم للحمل', 'beta hCG blood test', 'a1000000-0000-0000-0000-000000000001', 'informational', 'Medium', 'Medium'),
('هرمون الحمل hCG', 'hCG hormone', 'a1000000-0000-0000-0000-000000000001', 'informational', 'Medium', 'Medium'),
('خط خفيف في اختبار الحمل', 'faint line pregnancy test', 'a1000000-0000-0000-0000-000000000001', 'informational', 'Medium', 'Medium'),
('حمل كيميائي', 'chemical pregnancy', 'a1000000-0000-0000-0000-000000000001', 'informational', 'Medium', 'Medium'),
('نزيف انغراس', 'implantation bleeding', 'a1000000-0000-0000-0000-000000000001', 'informational', 'Medium', 'Medium'),
('ألم أسفل البطن بداية الحمل', 'lower abdominal pain early pregnancy', 'a1000000-0000-0000-0000-000000000001', 'informational', 'Medium', 'High'),

-- [2] أعراض الحمل الشائعة
('غثيان الحمل', 'morning sickness', 'a1000000-0000-0000-0000-000000000002', 'informational', 'High', 'High'),
('وحام', 'pregnancy cravings', 'a1000000-0000-0000-0000-000000000002', 'informational', 'Medium', 'Medium'),
('دوخة الحمل', 'dizziness in pregnancy', 'a1000000-0000-0000-0000-000000000002', 'informational', 'Medium', 'Medium'),
('صداع الحمل', 'pregnancy headache', 'a1000000-0000-0000-0000-000000000002', 'informational', 'Medium', 'Medium'),
('تعب الحمل', 'pregnancy fatigue', 'a1000000-0000-0000-0000-000000000002', 'informational', 'Medium', 'Medium'),
('ألم الظهر للحامل', 'back pain pregnancy', 'a1000000-0000-0000-0000-000000000002', 'informational', 'Medium', 'Medium'),
('حرقة المعدة للحامل', 'heartburn pregnancy', 'a1000000-0000-0000-0000-000000000002', 'informational', 'Medium', 'Medium'),
('إمساك الحمل', 'constipation pregnancy', 'a1000000-0000-0000-0000-000000000002', 'informational', 'Medium', 'Medium'),
('انتفاخ الحمل', 'bloating pregnancy', 'a1000000-0000-0000-0000-000000000002', 'informational', 'Medium', 'Medium'),
('إفرازات الحمل', 'pregnancy discharge', 'a1000000-0000-0000-0000-000000000002', 'informational', 'Medium', 'High'),
('تقلصات الحمل', 'pregnancy cramps', 'a1000000-0000-0000-0000-000000000002', 'informational', 'Medium', 'Medium'),
('حركة الجنين', 'fetal movement', 'a1000000-0000-0000-0000-000000000002', 'informational', 'High', 'High'),

-- [3] أسابيع الحمل وتطوّر الجنين
('اسابيع الحمل', 'pregnancy weeks', 'a1000000-0000-0000-0000-000000000003', 'informational', 'High', 'High'),
('جدول الحمل', 'pregnancy calendar', 'a1000000-0000-0000-0000-000000000003', 'informational', 'High', 'High'),
('تطور الجنين أسبوع بأسبوع', 'fetal development week by week', 'a1000000-0000-0000-0000-000000000003', 'informational', 'High', 'High'),
('الثلث الأول من الحمل', 'first trimester', 'a1000000-0000-0000-0000-000000000003', 'informational', 'High', 'High'),
('الثلث الثاني من الحمل', 'second trimester', 'a1000000-0000-0000-0000-000000000003', 'informational', 'Medium', 'Medium'),
('الثلث الثالث من الحمل', 'third trimester', 'a1000000-0000-0000-0000-000000000003', 'informational', 'Medium', 'Medium'),
('سونار الحمل', 'pregnancy ultrasound', 'a1000000-0000-0000-0000-000000000003', 'informational', 'High', 'High'),
('نبض الجنين', 'fetal heartbeat', 'a1000000-0000-0000-0000-000000000003', 'informational', 'Medium', 'High'),
('وزن الجنين الطبيعي', 'fetal weight normal', 'a1000000-0000-0000-0000-000000000003', 'informational', 'Medium', 'Medium'),
('قياس كيس الحمل', 'gestational sac size', 'a1000000-0000-0000-0000-000000000003', 'informational', 'Low', 'Medium'),

-- [4] التغذية والمكملات للحامل
('تغذية الحامل', 'pregnancy nutrition', 'a1000000-0000-0000-0000-000000000004', 'informational', 'High', 'High'),
('فيتامينات الحمل', 'prenatal vitamins', 'a1000000-0000-0000-0000-000000000004', 'commercial', 'High', 'High'),
('حمض الفوليك للحامل', 'folic acid pregnancy', 'a1000000-0000-0000-0000-000000000004', 'informational', 'High', 'High'),
('الحديد للحامل', 'iron pregnancy', 'a1000000-0000-0000-0000-000000000004', 'informational', 'High', 'High'),
('كالسيوم للحامل', 'calcium pregnancy', 'a1000000-0000-0000-0000-000000000004', 'informational', 'Medium', 'Medium'),
('أوميغا 3 للحامل', 'omega 3 pregnancy', 'a1000000-0000-0000-0000-000000000004', 'informational', 'Medium', 'Medium'),
('سكر الحمل والأكل', 'gestational diabetes diet', 'a1000000-0000-0000-0000-000000000004', 'informational', 'Medium', 'High'),
('فواكه ممنوعة للحامل', 'fruits to avoid pregnancy', 'a1000000-0000-0000-0000-000000000004', 'informational', 'Medium', 'High'),
('أطعمة ممنوعة للحامل', 'foods to avoid pregnancy', 'a1000000-0000-0000-0000-000000000004', 'informational', 'High', 'High'),
('قهوة للحامل', 'coffee caffeine pregnancy', 'a1000000-0000-0000-0000-000000000004', 'informational', 'Medium', 'High'),
('شاي أعشاب للحامل', 'herbal tea pregnancy', 'a1000000-0000-0000-0000-000000000004', 'informational', 'Medium', 'High'),
('ماء كثير للحامل', 'hydration pregnancy', 'a1000000-0000-0000-0000-000000000004', 'informational', 'Low', 'Medium'),

-- [5] حمل آمن ومضاعفات وتحذيرات
('اجهاض مبكر', 'early miscarriage', 'a1000000-0000-0000-0000-000000000005', 'informational', 'High', 'High'),
('أعراض الإجهاض', 'miscarriage symptoms', 'a1000000-0000-0000-0000-000000000005', 'informational', 'High', 'High'),
('نزيف الحمل', 'bleeding in pregnancy', 'a1000000-0000-0000-0000-000000000005', 'informational', 'High', 'High'),
('تسمم الحمل', 'preeclampsia', 'a1000000-0000-0000-0000-000000000005', 'informational', 'Medium', 'High'),
('ارتفاع ضغط الدم للحامل', 'high blood pressure pregnancy', 'a1000000-0000-0000-0000-000000000005', 'informational', 'Medium', 'High'),
('سكري الحمل', 'gestational diabetes', 'a1000000-0000-0000-0000-000000000005', 'informational', 'High', 'High'),
('فقر الدم للحامل', 'anemia pregnancy', 'a1000000-0000-0000-0000-000000000005', 'informational', 'Medium', 'Medium'),
('التهابات البول للحامل', 'UTI pregnancy', 'a1000000-0000-0000-0000-000000000005', 'informational', 'Medium', 'Medium'),
('عدوى المهبل للحامل', 'vaginal infection pregnancy', 'a1000000-0000-0000-0000-000000000005', 'informational', 'Medium', 'High'),
('نقص السائل الأمنيوسي', 'low amniotic fluid', 'a1000000-0000-0000-0000-000000000005', 'informational', 'Low', 'High'),
('زيادة السائل الأمنيوسي', 'polyhydramnios', 'a1000000-0000-0000-0000-000000000005', 'informational', 'Low', 'High'),
('المشيمة المنزاحة', 'placenta previa', 'a1000000-0000-0000-0000-000000000005', 'informational', 'Low', 'High'),
('انفصال المشيمة', 'placental abruption', 'a1000000-0000-0000-0000-000000000005', 'informational', 'Low', 'High'),
('ولادة مبكرة', 'preterm labor', 'a1000000-0000-0000-0000-000000000005', 'informational', 'Medium', 'High'),

-- [6] التمارين والنوم ونمط الحياة
('تمارين للحامل', 'pregnancy exercises', 'a1000000-0000-0000-0000-000000000006', 'informational', 'Medium', 'Medium'),
('مشي للحامل', 'walking pregnancy', 'a1000000-0000-0000-0000-000000000006', 'informational', 'Medium', 'Medium'),
('يوغا للحامل', 'prenatal yoga', 'a1000000-0000-0000-0000-000000000006', 'informational', 'Medium', 'Medium'),
('تمارين كيجل', 'kegel exercises', 'a1000000-0000-0000-0000-000000000006', 'informational', 'Medium', 'Medium'),
('نوم الحامل', 'pregnancy sleep', 'a1000000-0000-0000-0000-000000000006', 'informational', 'Medium', 'Medium'),
('وضعيات النوم للحامل', 'pregnancy sleep positions', 'a1000000-0000-0000-0000-000000000006', 'informational', 'Medium', 'Medium'),
('العلاقة الزوجية أثناء الحمل', 'sex during pregnancy', 'a1000000-0000-0000-0000-000000000006', 'informational', 'Medium', 'High'),
('سفر الحامل', 'travel during pregnancy', 'a1000000-0000-0000-0000-000000000006', 'informational', 'Low', 'Medium'),

-- [7] الولادة والمخاض
('علامات قرب الولادة', 'signs of labor', 'a1000000-0000-0000-0000-000000000007', 'informational', 'High', 'High'),
('طلق الولادة', 'labor contractions', 'a1000000-0000-0000-0000-000000000007', 'informational', 'High', 'High'),
('تمارين تسهيل الولادة', 'labor prep exercises', 'a1000000-0000-0000-0000-000000000007', 'informational', 'Medium', 'Medium'),
('فتح الرحم', 'cervical dilation', 'a1000000-0000-0000-0000-000000000007', 'informational', 'Medium', 'High'),
('نزول ماء الجنين', 'water breaking', 'a1000000-0000-0000-0000-000000000007', 'informational', 'High', 'High'),
('ولادة طبيعية', 'vaginal birth', 'a1000000-0000-0000-0000-000000000007', 'informational', 'High', 'High'),
('ولادة قيصرية', 'cesarean section', 'a1000000-0000-0000-0000-000000000007', 'informational', 'High', 'High'),
('الفرق بين الولادة الطبيعية والقيصرية', 'vaginal vs c-section', 'a1000000-0000-0000-0000-000000000007', 'informational', 'Medium', 'Medium'),
('ألم المخاض', 'labor pain', 'a1000000-0000-0000-0000-000000000007', 'informational', 'Medium', 'Medium'),
('إبرة الظهر', 'epidural', 'a1000000-0000-0000-0000-000000000007', 'informational', 'Medium', 'High'),
('تمزق العجان', 'perineal tear', 'a1000000-0000-0000-0000-000000000007', 'informational', 'Low', 'Medium'),
('خياطة بعد الولادة', 'stitches after birth', 'a1000000-0000-0000-0000-000000000007', 'informational', 'Medium', 'Medium'),

-- [8] ما بعد الولادة والنفاس
('النفاس', 'postpartum period', 'a1000000-0000-0000-0000-000000000008', 'informational', 'High', 'High'),
('اكتئاب ما بعد الولادة', 'postpartum depression', 'a1000000-0000-0000-0000-000000000008', 'informational', 'High', 'High'),
('نزيف بعد الولادة', 'postpartum bleeding', 'a1000000-0000-0000-0000-000000000008', 'informational', 'Medium', 'High'),
('ألم الظهر بعد الولادة', 'back pain postpartum', 'a1000000-0000-0000-0000-000000000008', 'informational', 'Low', 'Medium'),
('العناية بالجرح القيصري', 'c-section wound care', 'a1000000-0000-0000-0000-000000000008', 'informational', 'Medium', 'High'),
('التئام جرح القيصرية', 'c-section healing', 'a1000000-0000-0000-0000-000000000008', 'informational', 'Medium', 'High'),
('العناية بالعجان بعد الولادة', 'perineal care postpartum', 'a1000000-0000-0000-0000-000000000008', 'informational', 'Low', 'Medium'),
('متى ترجع الدورة بعد الولادة', 'period after birth', 'a1000000-0000-0000-0000-000000000008', 'informational', 'High', 'High'),
('تنظيم الأسرة بعد الولادة', 'postpartum contraception', 'a1000000-0000-0000-0000-000000000008', 'informational', 'Medium', 'Medium'),

-- [9] الرضاعة الطبيعية وتغذية الأم
('الرضاعة الطبيعية', 'breastfeeding', 'a1000000-0000-0000-0000-000000000009', 'informational', 'High', 'High'),
('فوائد الرضاعة الطبيعية', 'breastfeeding benefits', 'a1000000-0000-0000-0000-000000000009', 'informational', 'Medium', 'Medium'),
('زيادة الحليب', 'increase milk supply', 'a1000000-0000-0000-0000-000000000009', 'informational', 'High', 'High'),
('قلة الحليب', 'low milk supply', 'a1000000-0000-0000-0000-000000000009', 'informational', 'High', 'High'),
('احتقان الثدي', 'breast engorgement', 'a1000000-0000-0000-0000-000000000009', 'informational', 'Medium', 'Medium'),
('التهاب الثدي', 'mastitis', 'a1000000-0000-0000-0000-000000000009', 'informational', 'Medium', 'High'),
('تشققات الحلمة', 'nipple cracks breastfeeding', 'a1000000-0000-0000-0000-000000000009', 'informational', 'Medium', 'Medium'),
('شفط الحليب', 'breast pump', 'a1000000-0000-0000-0000-000000000009', 'commercial', 'Medium', 'Medium'),
('جدول رضاعة المولود', 'newborn feeding schedule', 'a1000000-0000-0000-0000-000000000009', 'informational', 'Medium', 'Medium'),

-- [10] رعاية المولود
('العناية بالمولود', 'newborn care', 'a1000000-0000-0000-0000-00000000000a', 'informational', 'High', 'High'),
('نوم المولود', 'newborn sleep', 'a1000000-0000-0000-0000-00000000000a', 'informational', 'Medium', 'Medium'),
('بكاء المولود', 'baby crying reasons', 'a1000000-0000-0000-0000-00000000000a', 'informational', 'Medium', 'Medium'),
('مغص الرضع', 'infant colic', 'a1000000-0000-0000-0000-00000000000a', 'informational', 'Medium', 'Medium'),
('رضاعة صناعية', 'formula feeding', 'a1000000-0000-0000-0000-00000000000a', 'informational', 'Medium', 'Medium'),
('وزن المولود الطبيعي', 'newborn weight', 'a1000000-0000-0000-0000-00000000000a', 'informational', 'Medium', 'Medium'),

-- [11] الخصوبة والتبويض والتخطيط للحمل
('الخصوبة', 'fertility', 'a1000000-0000-0000-0000-00000000000b', 'informational', 'High', 'High'),
('تأخر الحمل', 'delayed pregnancy', 'a1000000-0000-0000-0000-00000000000b', 'informational', 'High', 'High'),
('أسباب تأخر الحمل', 'causes of infertility', 'a1000000-0000-0000-0000-00000000000b', 'informational', 'High', 'High'),
('حساب أيام التبويض', 'ovulation calculator', 'a1000000-0000-0000-0000-00000000000b', 'transactional', 'High', 'High'),
('أيام التبويض بعد الدورة', 'ovulation after period', 'a1000000-0000-0000-0000-00000000000b', 'informational', 'Medium', 'Medium'),
('أعراض التبويض', 'ovulation symptoms', 'a1000000-0000-0000-0000-00000000000b', 'informational', 'Medium', 'Medium'),
('إفرازات التبويض', 'ovulation discharge', 'a1000000-0000-0000-0000-00000000000b', 'informational', 'Medium', 'Medium'),
('اختبار التبويض', 'ovulation test', 'a1000000-0000-0000-0000-00000000000b', 'commercial', 'High', 'High'),
('جدول الخصوبة', 'fertility calendar', 'a1000000-0000-0000-0000-00000000000b', 'informational', 'Medium', 'Medium'),
('أفضل وقت للحمل', 'best time to conceive', 'a1000000-0000-0000-0000-00000000000b', 'informational', 'Medium', 'Medium'),

-- [12] تحاليل وفحوصات الخصوبة
('تحليل هرمونات الخصوبة', 'fertility hormones test', 'a1000000-0000-0000-0000-00000000000c', 'informational', 'Medium', 'High'),
('تحليل AMH', 'AMH test', 'a1000000-0000-0000-0000-00000000000c', 'informational', 'Medium', 'High'),
('تحليل FSH', 'FSH test', 'a1000000-0000-0000-0000-00000000000c', 'informational', 'Low', 'Medium'),
('تحليل LH', 'LH test', 'a1000000-0000-0000-0000-00000000000c', 'informational', 'Low', 'Medium'),
('تحليل السائل المنوي', 'semen analysis', 'a1000000-0000-0000-0000-00000000000c', 'informational', 'Medium', 'High'),
('تكيس المبايض', 'PCOS', 'a1000000-0000-0000-0000-00000000000c', 'informational', 'High', 'High'),
('أعراض تكيس المبايض', 'PCOS symptoms', 'a1000000-0000-0000-0000-00000000000c', 'informational', 'Medium', 'High'),
('علاج تكيس المبايض', 'PCOS treatment', 'a1000000-0000-0000-0000-00000000000c', 'informational', 'Medium', 'High'),
('بطانة الرحم المهاجرة', 'endometriosis', 'a1000000-0000-0000-0000-00000000000c', 'informational', 'Medium', 'High'),

-- [13] علاجات وتقنيات مساعدة على الإنجاب
('أطفال الأنابيب IVF', 'IVF in vitro fertilization', 'a1000000-0000-0000-0000-00000000000d', 'commercial', 'High', 'High'),
('حقن مجهري', 'ICSI', 'a1000000-0000-0000-0000-00000000000d', 'commercial', 'High', 'High'),
('تلقيح صناعي IUI', 'IUI', 'a1000000-0000-0000-0000-00000000000d', 'commercial', 'Medium', 'High'),
('تنشيط المبايض', 'ovulation induction', 'a1000000-0000-0000-0000-00000000000d', 'informational', 'Medium', 'High'),
('منشطات حمل', 'fertility drugs', 'a1000000-0000-0000-0000-00000000000d', 'informational', 'Medium', 'High'),
('تكلفة أطفال الأنابيب', 'IVF cost', 'a1000000-0000-0000-0000-00000000000d', 'commercial', 'Medium', 'High'),
('مركز علاج العقم', 'fertility clinic', 'a1000000-0000-0000-0000-00000000000d', 'navigational', 'Medium', 'High');
