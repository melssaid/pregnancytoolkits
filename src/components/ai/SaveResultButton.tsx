import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useSavedResults } from '@/hooks/useSavedResults';

interface SaveResultButtonProps {
  toolId: string;
  title: string;
  content: string;
  meta?: Record<string, any>;
  className?: string;
}

export function SaveResultButton({ toolId, title, content, meta, className = '' }: SaveResultButtonProps) {
  const { save, isSaved, unsaveByContent } = useSavedResults();
  const saved = isSaved(content);

  const handleToggle = () => {
    if (saved) {
      unsaveByContent(content);
    } else {
      save({ toolId, title, content, meta });
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleToggle}
      className={`p-2 rounded-xl transition-colors ${saved ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'} ${className}`}
      aria-label={saved ? 'Remove from saved' : 'Save result'}
    >
      {saved ? <BookmarkCheck className="w-4.5 h-4.5" /> : <Bookmark className="w-4.5 h-4.5" />}
    </motion.button>
  );
}
