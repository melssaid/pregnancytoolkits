'use client';
import { notFound } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { getSortedTools } from '@/lib/tools-data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { t } = useTranslation();
  const { slug } = await params;
  
  const tools = getSortedTools();
  const tool = tools.find((t) => t.href === `/tools/${slug}`);
  
  if (!tool) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent mb-6 shadow-2xl">
            <tool.icon className="h-12 w-12 text-background" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4">
            {t(tool.titleKey, tool.id.replace(/-/g, ' ').toUpperCase())}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t(tool.descriptionKey, 'Advanced pregnancy tool with mathematical models and AI insights. Educational only - consult your doctor.')}
          </p>
        </div>
        
        {/* Disclaimer Banner */}
        <div className="bg-warning/20 border border-warning/30 rounded-2xl p-6 mb-12 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-8 w-8 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-warning mb-2">⚠️ Important Disclaimer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This tool is for educational purposes only. Not medical advice, diagnosis, or treatment. Always consult your healthcare provider.
              </p>
            </div>
          </div>
        </div>
        
        {/* Tool Content - Stub with math example */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold mb-6">How it works</h2>
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-xl p-6">
                <h4 className="font-semibold mb-2">Mathematical Model</h4>
                <p className="text-sm mb-3 text-muted-foreground">Uses {tool.id.includes('fetal') ? 'Hadlock Formula' : 'Naegele\'s Rule'} for accurate predictions.</p>
                <pre className="bg-background rounded-lg p-4 text-xs font-mono text-primary">
{tool.id.includes('due-date') ? 'EDD = LMP + 280 days' : 'Weight = f(AC, FL, HC)'}
                </pre>
              </div>
              <Button className="w-full">Start Tracking</Button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-muted/30 to-transparent rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">Full AI-powered features with personalized insights.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 3600;