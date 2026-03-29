/**
 * Professional WhatsApp message formatter for Pregnancy Toolkits
 * Uses WhatsApp-supported formatting: *bold*, _italic_, ~strikethrough~, ```monospace```
 * Plus Unicode symbols for visual appeal
 */

const APP_SIGNATURE = `\n━━━━━━━━━━━━━━━━━━━━\n🤰 _Pregnancy Toolkits_`;

/** Create a visual progress bar using Unicode blocks */
function progressBar(percent: number, width = 10): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty) + ` ${percent}%`;
}

/** Format a section header with decorative line */
function sectionHeader(emoji: string, title: string): string {
  return `\n${emoji} *${title}*\n${'─'.repeat(20)}`;
}

interface ShareOptions {
  title: string;
  subtitle?: string;
  emoji: string;
}

interface ChecklistItem {
  name: string;
  done: boolean;
  category?: string;
}

interface StatItem {
  emoji: string;
  label: string;
  value: string;
}

/** 
 * Format a checklist share message (hospital bag, gear, vitamins, checkups)
 */
export function formatChecklistShare(
  options: ShareOptions,
  items: ChecklistItem[],
  stats?: StatItem[],
  categories?: { key: string; emoji: string; label: string }[]
): string {
  const doneCount = items.filter(i => i.done).length;
  const total = items.length;
  const percent = Math.round((doneCount / total) * 100);
  
  let msg = `${options.emoji} *${options.title}*`;
  if (options.subtitle) msg += `\n${options.subtitle}`;
  msg += `\n\n📊 ${progressBar(percent)}`;
  msg += `\n✅ ${doneCount} / ${total}`;
  
  // Stats row
  if (stats && stats.length > 0) {
    msg += '\n';
    stats.forEach(s => { msg += `\n${s.emoji} ${s.label}: *${s.value}*`; });
  }
  
  // Categorized items
  if (categories && categories.length > 0) {
    categories.forEach(cat => {
      const catItems = items.filter(i => i.category === cat.key);
      if (catItems.length === 0) return;
      const catDone = catItems.filter(i => i.done).length;
      msg += sectionHeader(cat.emoji, `${cat.label} (${catDone}/${catItems.length})`);
      catItems.forEach(item => {
        msg += `\n${item.done ? '  ✅' : '  ⬜'} ${item.name}`;
      });
      msg += '\n';
    });
  } else {
    // No categories — simple list
    const done = items.filter(i => i.done);
    const pending = items.filter(i => !i.done);
    if (done.length > 0) {
      msg += '\n';
      done.forEach(item => { msg += `\n  ✅ ${item.name}`; });
    }
    if (pending.length > 0) {
      msg += '\n';
      pending.forEach(item => { msg += `\n  ⬜ ${item.name}`; });
    }
  }
  
  msg += APP_SIGNATURE;
  return msg;
}

/**
 * Format a stats/tracking share message (contraction timer, etc.)
 */
export function formatStatsShare(
  options: ShareOptions,
  stats: StatItem[],
  alerts?: { emoji: string; text: string }[],
  footer?: string
): string {
  let msg = `${options.emoji} *${options.title}*`;
  if (options.subtitle) msg += `\n_${options.subtitle}_`;
  
  msg += '\n\n┌─────────────────────┐';
  stats.forEach(s => {
    msg += `\n│ ${s.emoji} ${s.label}: *${s.value}*`;
  });
  msg += '\n└─────────────────────┘';
  
  if (alerts && alerts.length > 0) {
    msg += '\n';
    alerts.forEach(a => { msg += `\n${a.emoji} ${a.text}`; });
  }
  
  if (footer) msg += `\n\n${footer}`;
  
  msg += APP_SIGNATURE;
  return msg;
}

/**
 * Format an AI-generated content share
 */
export function formatAIPlanShare(
  options: ShareOptions,
  content: string,
  maxLength = 1500
): string {
  const trimmed = content.length > maxLength 
    ? content.slice(0, maxLength) + '...' 
    : content;
  
  let msg = `${options.emoji} *${options.title}*`;
  msg += `\n🤖 _AI-Generated_`;
  msg += `\n${'━'.repeat(22)}`;
  msg += `\n\n${trimmed}`;
  msg += APP_SIGNATURE;
  return msg;
}

/** Open WhatsApp with formatted text */
export function openWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
