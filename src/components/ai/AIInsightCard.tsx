import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface AIInsightCardProps {
  title?: string;
  prompt: string;
  context?: {
    week?: number;
    trimester?: number;
  };
  buttonText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact' | 'banner';
  autoExpand?: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title = 'AI Insights',
  prompt,
  context,
  buttonText = 'Get AI Insights',
  icon,
  variant = 'default',
  autoExpand = false,
}) => {
  const { streamChat, isLoading, error } = usePregnancyAI();
  const [insight, setInsight] = useState('');
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateInsight = async () => {
    if (isLoading) return;
    
    setInsight('');
    setIsExpanded(true);
    setHasGenerated(true);

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: prompt }],
      context,
      onDelta: (text) => setInsight(prev => prev + text),
      onDone: () => {},
    });
  };

  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {!hasGenerated && (
          <Button
            onClick={generateInsight}
            disabled={isLoading}
            variant="outline"
            className="w-full gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-200/50 hover:border-violet-300"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              icon || <Sparkles className="h-4 w-4 text-violet-500" />
            )}
            {buttonText}
          </Button>
        )}

        <AnimatePresence>
          {(insight || isLoading) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
                <CardContent className="pt-4">
                  {isLoading && !insight && (
                    <div className="flex items-center gap-2 text-violet-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analyzing...</span>
                    </div>
                  )}
                  {insight && <MarkdownRenderer content={insight} />}
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-0 text-white overflow-hidden">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ 
                  boxShadow: ['0 0 0 0 rgba(255,255,255,0.4)', '0 0 0 15px rgba(255,255,255,0)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm"
              >
                {icon || <Brain className="w-6 h-6" />}
              </motion.div>
              <div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-white/80 text-sm">Personalized recommendations</p>
              </div>
            </div>
            <Button
              onClick={generateInsight}
              disabled={isLoading}
              variant="secondary"
              className="bg-white text-violet-600 hover:bg-white/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Analyze'
              )}
            </Button>
          </div>

          <AnimatePresence>
            {insight && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-white/20"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_p]:text-white/90 [&_li]:text-white/90 [&_strong]:text-white">
                  <MarkdownRenderer content={insight} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
      <CardContent className="pt-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => hasGenerated && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
              {icon || <Sparkles className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              {hasGenerated && (
                <p className="text-xs text-muted-foreground">
                  Click to {isExpanded ? 'collapse' : 'expand'}
                </p>
              )}
            </div>
          </div>
          
          {!hasGenerated ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                generateInsight();
              }}
              disabled={isLoading}
              size="sm"
              className="gap-1 bg-gradient-to-r from-violet-500 to-purple-500"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  Analyze
                </>
              )}
            </Button>
          ) : (
            <Button variant="ghost" size="sm">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (insight || isLoading) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-violet-200/50"
            >
              {isLoading && !insight && (
                <div className="flex items-center gap-2 text-violet-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Generating personalized insights...</span>
                </div>
              )}
              {insight && <MarkdownRenderer content={insight} />}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              
              {hasGenerated && !isLoading && (
                <Button
                  onClick={generateInsight}
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-violet-600"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AIInsightCard;
