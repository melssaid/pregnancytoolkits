

# Medical Terminology & Translation Audit Plan

## Findings

### 1. Medical Terminology Status (Core Journey Terms)
All 6 languages use correct obstetric terminology for "My Pregnancy":
- AR: **حملي** (obstetric pregnancy) — correct
- DE: **Meine Schwangerschaft** — correct
- FR: **Ma Grossesse** — correct
- ES: **Mi Embarazo** — correct
- PT: **Minha Gravidez** — correct
- TR: **Hamileliğim** — correct

No ambiguity with "carrying things" in any language.

### 2. Critical Medical Error: German "Nachgeburt"
**de.json line 623**: `"postpartum": "Nachgeburt"` — "Nachgeburt" means **placenta/afterbirth** (the organ expelled after delivery), NOT the postpartum period. Must be **"Wochenbett"** (which is correctly used elsewhere in the same file).

Also line 5314: `"Nachgeburtliche Planung"` → should be `"Wochenbettplanung"`.

### 3. Untranslated Medical Content Blocks (~20 Fertility Academy Lessons)
The `fertilityAcademy` lessons section has **titles translated** but **content bodies left in English** in ALL 6 non-English locales. This is the biggest gap — approximately 20 long-form medical education articles about:
- Menstrual cycle phases, ovulation process, fertilization
- Hormones (FSH, LH, estrogen, progesterone, AMH)
- Age and fertility, PCOS management, endometriosis
- Male fertility, supplements, sleep, exercise balance
- Assisted reproduction, epigenetics, emotional wellbeing

### 4. Untranslated Exercise Strings
`backPainRelief` exercises in **ar.json** and **fr.json** have English strings:
- "Upper Back", "Wall Push-Up", "Strengthen upper back and shoulders"
- "Important Safety Notice", "Steps:", exercise descriptions

### 5. Untranslated Ovulation Tool Keys (ar.json)
Lines 7858-7863: `windowStart`, `windowEnd`, `estimatedOvulation`, `disclaimer` — all in English.

---

## Plan

### Step 1: Fix German medical error (2 lines)
- Line 623: `"Nachgeburt"` → `"Wochenbett"`
- Line 5314: `"Nachgeburtliche Planung"` → `"Wochenbettplanung"`

### Step 2: Translate Fertility Academy content (6 files × ~20 lessons)
Translate all `toolsInternal.fertilityAcademy.lessons.*` content bodies into proper medical Arabic, German, French, Spanish, Portuguese, and Turkish. All content must use obstetric/gynecological terminology appropriate for patient education.

Cultural note for Arabic: references to alcohol consumption will be replaced with culturally appropriate alternatives per existing policy.

### Step 3: Translate backPainRelief exercise strings
Fix untranslated exercise names, targets, and safety notices in ar.json and fr.json.

### Step 4: Translate ovulation tool keys in ar.json
Translate `windowStart`, `windowEnd`, `estimatedOvulation`, `disclaimer`.

---

## Files Changed

| File | Changes |
|------|---------|
| `src/locales/de.json` | Fix "Nachgeburt" → "Wochenbett" (2 spots) + translate ~20 fertility lessons |
| `src/locales/ar.json` | Translate ~20 fertility lessons + exercise strings + ovulation keys |
| `src/locales/fr.json` | Translate ~20 fertility lessons + exercise strings |
| `src/locales/es.json` | Translate ~20 fertility lessons |
| `src/locales/pt.json` | Translate ~20 fertility lessons |
| `src/locales/tr.json` | Translate ~20 fertility lessons |

## Scale
~120 content blocks total (20 lessons × 6 languages), each containing detailed medical text. This is the largest remaining translation gap before launch.

