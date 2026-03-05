import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface MarkdownRendererProps {
  content: string;
  isLoading?: boolean;
  accentColor?: string;
}

export function MarkdownRenderer({ content, isLoading, accentColor = "primary" }: MarkdownRendererProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  // Common emoji shortcode to emoji map for AI model outputs
  const EMOJI_MAP: Record<string, string> = {
    'swollen_face': '😮', 'nauseated_face': '🤢', 'face_with_thermometer': '🤒',
    'pregnant_woman': '🤰', 'baby': '👶', 'woman_health_worker': '👩‍⚕️',
    'pill': '💊', 'syringe': '💉', 'stethoscope': '🩺', 'hospital': '🏥',
    'heart': '❤️', 'broken_heart': '💔', 'sparkling_heart': '💖',
    'warning': '⚠️', 'check': '✅', 'x': '❌', 'star': '⭐',
    'droplet': '💧', 'fire': '🔥', 'muscle': '💪', 'brain': '🧠',
    'eyes': '👀', 'ear': '👂', 'nose': '👃', 'tongue': '👅',
    'bone': '🦴', 'tooth': '🦷', 'leg': '🦵', 'foot': '🦶',
    'hand': '✋', 'thumbsup': '👍', 'thumbs_up': '👍', 'thumbsdown': '👎',
    'clap': '👏', 'pray': '🙏', 'thinking': '🤔', 'sleeping': '😴',
    'cry': '😢', 'sob': '😭', 'angry': '😠', 'smile': '😊',
    'grin': '😁', 'wink': '😉', 'kiss': '😘', 'hug': '🤗',
    'shrug': '🤷', 'facepalm': '🤦', 'raised_hands': '🙌',
    'apple': '🍎', 'green_apple': '🍏', 'banana': '🍌', 'grapes': '🍇',
    'watermelon': '🍉', 'avocado': '🥑', 'broccoli': '🥦', 'carrot': '🥕',
    'milk': '🥛', 'egg': '🥚', 'bread': '🍞', 'meat': '🥩', 'fish': '🐟',
    'salad': '🥗', 'rice': '🍚', 'soup': '🍲', 'pizza': '🍕',
    'sun': '☀️', 'moon': '🌙', 'cloud': '☁️', 'rain': '🌧️',
    'thermometer': '🌡️', 'clock': '⏰', 'calendar': '📅',
    'notebook': '📓', 'book': '📖', 'pen': '🖊️', 'phone': '📞',
    'bulb': '💡', 'light_bulb': '💡', 'key': '🔑', 'lock': '🔒',
    'shield': '🛡️', 'bell': '🔔', 'megaphone': '📣',
    'running': '🏃', 'walking': '🚶', 'yoga': '🧘', 'swimming': '🏊',
    'bath': '🛁', 'bed': '🛏️', 'house': '🏠',
    'point_right': '👉', 'point_left': '👈', 'point_up': '👆', 'point_down': '👇',
    'heavy_check_mark': '✔️', 'heavy_exclamation_mark': '❗',
    'red_circle': '🔴', 'green_circle': '🟢', 'yellow_circle': '🟡',
    'white_check_mark': '✅', 'negative_squared_cross_mark': '❎',
    'face_vomiting': '🤮', 'dizzy_face': '😵', 'hot_face': '🥵',
    'cold_face': '🥶', 'exploding_head': '🤯', 'partying_face': '🥳',
    'relieved': '😌', 'pensive': '😔', 'worried': '😟', 'confused': '😕',
    'slightly_smiling_face': '🙂', 'upside_down_face': '🙃',
    'face_with_rolling_eyes': '🙄', 'grimacing': '😬',
    'no_entry': '⛔', 'stop_sign': '🛑', 'construction': '🚧',
    'pushpin': '📌', 'round_pushpin': '📍', 'paperclip': '📎',
    'scissors': '✂️', 'triangular_ruler': '📐',
  };

  const replaceEmojiShortcodes = (text: string): string => {
    // Match :emoji_name: patterns and standalone emoji names like "swollen_face"
    return text.replace(/(?::(\w+):|\b(swollen_face|nauseated_face|face_with_thermometer|face_vomiting|dizzy_face|hot_face|cold_face|exploding_head)\b)/g, (match, colonName, standaloneName) => {
      const name = colonName || standaloneName;
      return EMOJI_MAP[name] || match;
    });
  };

  const { mainContent, disclaimerContent } = useMemo(() => {
    if (!content) return { mainContent: null, disclaimerContent: null };

    // Split content at the last horizontal rule to extract disclaimer
    const lastHrIndex = content.lastIndexOf('\n---');
    let mainText = content;
    let disclaimerText: string | null = null;

    if (lastHrIndex > 0) {
      const afterHr = content.slice(lastHrIndex + 4).trim();
      const disclaimerPatterns = [
        'استشار', 'طبيب', 'معلومات عامة', 'consult', 'doctor', 'healthcare',
        'disclaimer', 'medical', 'Arzt', 'consulter', 'médecin', 'consulta',
        'doktor', 'Haftungsausschluss', 'professionnel', 'profesional',
        'informational', 'bilgilendirme', 'hekim'
      ];
      const isDisclaimer = disclaimerPatterns.some(p => afterHr.toLowerCase().includes(p.toLowerCase()));
      if (isDisclaimer && afterHr.length < 500) {
        mainText = content.slice(0, lastHrIndex).trim();
        disclaimerText = afterHr;
      }
    }

    const parseSection = (text: string) => {
      const lines = text.split('\n');
      const elements: JSX.Element[] = [];
      let listItems: string[] = [];
      let listType: 'ul' | 'ol' | null = null;
      let blockquoteLines: string[] = [];

      const flushList = () => {
        if (listItems.length > 0 && listType) {
          const ListTag = listType === 'ol' ? 'ol' : 'ul';
          elements.push(
            <ListTag 
              key={`list-${elements.length}`} 
              className={`my-3 space-y-2 ${listType === 'ol' ? 'list-decimal' : 'list-disc'} list-inside`}
            >
              {listItems.map((item, i) => (
                <li key={i} className="text-xs leading-relaxed text-foreground/90 ps-1">
                  {formatInline(item)}
                </li>
              ))}
            </ListTag>
          );
          listItems = [];
          listType = null;
        }
      };

      const flushBlockquote = () => {
        if (blockquoteLines.length > 0) {
          elements.push(
            <blockquote 
              key={`quote-${elements.length}`} 
              className="my-2 ps-3 border-s-[3px] border-primary/30 bg-primary/5 py-1.5 pe-2 rounded-e-lg italic text-xs text-muted-foreground"
            >
              {blockquoteLines.map((line, i) => (
                <p key={i}>{formatInline(line)}</p>
              ))}
            </blockquote>
          );
          blockquoteLines = [];
        }
      };

      const formatInline = (text: string): (string | JSX.Element)[] => {
        text = text.replace(/\[\d+\]/g, '');
        text = replaceEmojiShortcodes(text);
        const parts: (string | JSX.Element)[] = [];
        const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
        let lastIndex = 0;
        let match;
        let keyIdx = 0;
        while ((match = regex.exec(text)) !== null) {
          if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
          if (match[1]) parts.push(<strong key={`b-${keyIdx++}`} className="font-semibold text-foreground">{match[1]}</strong>);
          else if (match[2]) parts.push(<em key={`i-${keyIdx++}`}>{match[2]}</em>);
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) parts.push(text.slice(lastIndex));
        return parts;
      };

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) { flushList(); flushBlockquote(); return; }

        if (trimmedLine.startsWith('>')) { flushList(); blockquoteLines.push(trimmedLine.slice(1).trim()); return; }
        else { flushBlockquote(); }

        const h4Match = trimmedLine.match(/^####\s+(.+)$/);
        const h3Match = trimmedLine.match(/^###\s+(.+)$/);
        const h2Match = trimmedLine.match(/^##\s+(.+)$/);
        const h1Match = trimmedLine.match(/^#\s+(.+)$/);

        if (h4Match) { flushList(); elements.push(<h4 key={`h4-${index}`} className="text-xs font-semibold text-foreground mt-3 mb-1.5 flex items-center gap-2"><span className="w-1 h-3.5 bg-primary/60 rounded-full" />{formatInline(h4Match[1])}</h4>); return; }
        if (h3Match) { flushList(); elements.push(<h3 key={`h3-${index}`} className="text-sm font-semibold text-foreground mt-4 mb-1.5 flex items-center gap-2"><span className="w-1 h-4 bg-primary/70 rounded-full" />{formatInline(h3Match[1])}</h3>); return; }
        if (h2Match) { flushList(); elements.push(<h2 key={`h2-${index}`} className="text-sm font-bold text-foreground mt-5 mb-2 flex items-center gap-2 pb-1.5 border-b border-border/50"><span className="w-1.5 h-5 bg-primary rounded-full" />{formatInline(h2Match[1])}</h2>); return; }
        if (h1Match) { flushList(); elements.push(<h1 key={`h1-${index}`} className="text-base font-bold text-foreground mt-5 mb-3 flex items-center gap-2"><span className="w-1.5 h-5 bg-gradient-to-b from-primary to-primary/50 rounded-full" />{formatInline(h1Match[1])}</h1>); return; }

        const bulletMatch = trimmedLine.match(/^[-•*]\s+(.+)$/);
        if (bulletMatch) { if (listType !== 'ul') { flushList(); listType = 'ul'; } listItems.push(bulletMatch[1]); return; }

        const numberedMatch = trimmedLine.match(/^\d+[.)]\s+(.+)$/);
        if (numberedMatch) { if (listType !== 'ol') { flushList(); listType = 'ol'; } listItems.push(numberedMatch[1]); return; }

        const emojiHeaderMatch = trimmedLine.match(/^([\p{Emoji}]+)\s*(.+?):\s*(.*)$/u);
        if (emojiHeaderMatch) {
          flushList();
          elements.push(
            <div key={`emoji-${index}`} className="my-3 p-3 bg-muted/50 rounded-lg border border-border/30">
              <div className="flex items-start gap-2">
                <span className="text-lg">{emojiHeaderMatch[1]}</span>
                <div>
                  <span className="font-semibold text-foreground text-sm">{emojiHeaderMatch[2]}:</span>
                  {emojiHeaderMatch[3] && <span className="text-sm text-muted-foreground ms-1">{formatInline(emojiHeaderMatch[3])}</span>}
                </div>
              </div>
            </div>
          );
          return;
        }

        if (/^[-*_]{3,}$/.test(trimmedLine)) { flushList(); elements.push(<hr key={`hr-${index}`} className="my-4 border-border/50" />); return; }

        flushList();
        elements.push(<p key={`p-${index}`} className="text-xs leading-relaxed text-foreground/90 my-1.5">{formatInline(trimmedLine)}</p>);
      });

      flushList();
      flushBlockquote();
      return elements;
    };

    return {
      mainContent: parseSection(mainText),
      disclaimerContent: disclaimerText ? parseSection(disclaimerText) : null,
    };
  }, [content]);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'} style={isRTL ? { textAlign: 'right' } : undefined}>
      <div className="space-y-1 break-words overflow-wrap-anywhere">
        {mainContent}
        {isLoading && (
          <span className={`inline-block w-2 h-4 bg-primary/50 animate-pulse ${isRTL ? 'me-1' : 'ms-1'} rounded`} />
        )}
      </div>
    </div>
  );
}
