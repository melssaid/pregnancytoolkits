import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
  isLoading?: boolean;
  accentColor?: string;
}

export function MarkdownRenderer({ content, isLoading, accentColor = "primary" }: MarkdownRendererProps) {
  const formattedContent = useMemo(() => {
    if (!content) return null;

    // Parse markdown-like content into structured elements
    const lines = content.split('\n');
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
              <li key={i} className="text-sm leading-relaxed text-foreground/90 pl-1">
                {parseInlineStyles(item)}
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
            className="my-3 pl-4 border-l-4 border-primary/30 bg-primary/5 py-2 pr-3 rounded-r-lg italic text-sm text-muted-foreground"
          >
            {blockquoteLines.map((line, i) => (
              <p key={i}>{parseInlineStyles(line)}</p>
            ))}
          </blockquote>
        );
        blockquoteLines = [];
      }
    };

    const parseInlineStyles = (text: string): (string | JSX.Element)[] => {
      const result: (string | JSX.Element)[] = [];
      let remaining = text;
      let keyIndex = 0;

      // Bold: **text** or __text__
      // Italic: *text* or _text_
      // Code: `code`
      const patterns = [
        { regex: /\*\*(.+?)\*\*/g, render: (m: string) => <strong key={keyIndex++} className="font-semibold text-foreground">{m}</strong> },
        { regex: /__(.+?)__/g, render: (m: string) => <strong key={keyIndex++} className="font-semibold text-foreground">{m}</strong> },
        { regex: /\*(.+?)\*/g, render: (m: string) => <em key={keyIndex++} className="italic">{m}</em> },
        { regex: /_(.+?)_/g, render: (m: string) => <em key={keyIndex++} className="italic">{m}</em> },
        { regex: /`(.+?)`/g, render: (m: string) => <code key={keyIndex++} className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">{m}</code> },
      ];

      // Simple approach: process text as-is for now, focusing on structure
      // For a full implementation, we'd need a proper parser
      return [text];
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Empty line
      if (!trimmedLine) {
        flushList();
        flushBlockquote();
        return;
      }

      // Blockquote
      if (trimmedLine.startsWith('>')) {
        flushList();
        blockquoteLines.push(trimmedLine.slice(1).trim());
        return;
      } else {
        flushBlockquote();
      }

      // Headers
      const h1Match = trimmedLine.match(/^#\s+(.+)$/);
      const h2Match = trimmedLine.match(/^##\s+(.+)$/);
      const h3Match = trimmedLine.match(/^###\s+(.+)$/);
      const h4Match = trimmedLine.match(/^####\s+(.+)$/);

      if (h4Match) {
        flushList();
        elements.push(
          <h4 key={`h4-${index}`} className="text-sm font-semibold text-foreground mt-4 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-primary/60 rounded-full" />
            {h4Match[1]}
          </h4>
        );
        return;
      }

      if (h3Match) {
        flushList();
        elements.push(
          <h3 key={`h3-${index}`} className="text-base font-semibold text-foreground mt-5 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary/70 rounded-full" />
            {h3Match[1]}
          </h3>
        );
        return;
      }

      if (h2Match) {
        flushList();
        elements.push(
          <h2 key={`h2-${index}`} className="text-lg font-bold text-foreground mt-6 mb-3 flex items-center gap-2 pb-2 border-b border-border/50">
            <span className="w-2 h-6 bg-primary rounded-full" />
            {h2Match[1]}
          </h2>
        );
        return;
      }

      if (h1Match) {
        flushList();
        elements.push(
          <h1 key={`h1-${index}`} className="text-xl font-bold text-foreground mt-6 mb-4 flex items-center gap-3">
            <span className="w-2 h-7 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
            {h1Match[1]}
          </h1>
        );
        return;
      }

      // Bullet list
      const bulletMatch = trimmedLine.match(/^[-•*]\s+(.+)$/);
      if (bulletMatch) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(bulletMatch[1]);
        return;
      }

      // Numbered list
      const numberedMatch = trimmedLine.match(/^\d+[.)]\s+(.+)$/);
      if (numberedMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(numberedMatch[1]);
        return;
      }

      // Emoji headers (like 🍼 Baby's size:)
      const emojiHeaderMatch = trimmedLine.match(/^([\p{Emoji}]+)\s*(.+?):\s*(.*)$/u);
      if (emojiHeaderMatch) {
        flushList();
        elements.push(
          <div key={`emoji-${index}`} className="my-3 p-3 bg-muted/50 rounded-lg border border-border/30">
            <div className="flex items-start gap-2">
              <span className="text-lg">{emojiHeaderMatch[1]}</span>
              <div>
                <span className="font-semibold text-foreground text-sm">{emojiHeaderMatch[2]}:</span>
                {emojiHeaderMatch[3] && (
                  <span className="text-sm text-muted-foreground ml-1">{emojiHeaderMatch[3]}</span>
                )}
              </div>
            </div>
          </div>
        );
        return;
      }

      // Horizontal rule
      if (/^[-*_]{3,}$/.test(trimmedLine)) {
        flushList();
        elements.push(<hr key={`hr-${index}`} className="my-4 border-border/50" />);
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${index}`} className="text-sm leading-relaxed text-foreground/90 my-2">
          {parseInlineStyles(trimmedLine)}
        </p>
      );
    });

    // Flush remaining items
    flushList();
    flushBlockquote();

    return elements;
  }, [content]);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert overflow-hidden">
      <div className="space-y-1 break-words overflow-wrap-anywhere">
        {formattedContent}
        {isLoading && (
          <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-1 rounded" />
        )}
      </div>
    </div>
  );
}
