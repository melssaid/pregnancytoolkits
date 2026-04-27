## Goal
Make `tools.kickCounter.description` distinct from `tools.kickCounter.title` in every locale, using short (5–9 words), wellness-toned, non-diagnostic copy aligned with the CEO persona (formal female-address in Arabic).

## Proposed new descriptions
| Lang | title (unchanged) | new description |
|------|-------------------|-----------------|
| ar | عداد ركلات الجنين | سجّلي حركات طفلكِ يوميًا وتابعي نشاطه بثقة |
| en | Fetal Kick Counter | Log your baby's daily movements and track activity patterns |
| de | Fetaler Tritt-Zähler | Tägliche Bewegungen Ihres Babys erfassen und Muster erkennen |
| es | Contador de patadas fetales | Registra los movimientos diarios de tu bebé y observa patrones |
| fr | Compteur de coups fœtaux | Enregistrez les mouvements quotidiens de bébé et suivez les tendances |
| pt | Contador de chutes fetais | Registe os movimentos diários do bebé e acompanhe os padrões |
| tr | Fetal Tekme Sayacı | Bebeğinizin günlük hareketlerini kaydedin ve aktivitesini izleyin |

## Files to edit
- `src/locales/ar.json`
- `src/locales/en.json`
- `src/locales/de.json`
- `src/locales/es.json`
- `src/locales/fr.json`
- `src/locales/pt.json`
- `src/locales/tr.json`

Only the `tools.kickCounter.description` value changes in each. No component changes needed — `getToolDescription()` in `src/lib/toolCopy.ts` already consumes this key.

## Verification
After edits, run a quick inline node check across all 7 files to confirm `title !== description`.