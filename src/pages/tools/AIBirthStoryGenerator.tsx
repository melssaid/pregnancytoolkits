import React, { useState, useEffect, useRef } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Sparkles, Download, Heart, Baby, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { useTranslation } from 'react-i18next';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';

interface BirthStoryData {
  babyName: string;
  birthDate: string;
  birthTime: string;
  weight: string;
  length: string;
  location: string;
  deliveryType: string;
  specialMoments: string;
  firstFeeling: string;
  dedicatedTo: string;
}

const DEFAULT_DATA: BirthStoryData = {
  babyName: '',
  birthDate: '',
  birthTime: '',
  weight: '',
  length: '',
  location: '',
  deliveryType: 'natural',
  specialMoments: '',
  firstFeeling: '',
  dedicatedTo: '',
};

const isValidData = (data: unknown): data is BirthStoryData => {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d.babyName === 'string' && typeof d.birthDate === 'string';
};

export default function AIBirthStoryGenerator() {
  const { t } = useTranslation();
  const [storyData, setStoryData] = useState<BirthStoryData>(DEFAULT_DATA);
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const isInitialized = useRef(false);
  const { toast } = useToast();

  useResetOnLanguageChange(() => {
    setGeneratedStory('');
  });

  useEffect(() => {
    const saved = safeParseLocalStorage<BirthStoryData>('birthStoryData', DEFAULT_DATA, isValidData);
    setStoryData(saved);
    const savedStory = localStorage.getItem('generatedBirthStory');
    if (savedStory) setGeneratedStory(savedStory);
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage('birthStoryData', storyData);
  }, [storyData]);

  const generateStory = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const formattedDate = storyData.birthDate 
        ? new Date(storyData.birthDate).toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          }) 
        : 'a beautiful day';

      const story = `
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║               ✨ THE DAY ${(storyData.babyName || 'OUR BABY').toUpperCase()} ARRIVED ✨              ║
║                                                                  ║
║                   A Story of Love & New Beginnings               ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════
                         📅 THE MOMENT
═══════════════════════════════════════════════════════════════════

On ${formattedDate}${storyData.birthTime ? ` at ${storyData.birthTime}` : ''}, our world changed forever.

${storyData.location ? `📍 Location: ${storyData.location}\n` : ''}${storyData.weight ? `⚖️  Weight: ${storyData.weight}\n` : ''}${storyData.length ? `📏 Length: ${storyData.length}\n` : ''}
${storyData.deliveryType === 'natural' ? '🌸 Delivery: Natural Birth' : storyData.deliveryType === 'csection' ? '💜 Delivery: C-Section' : storyData.deliveryType === 'water' ? '💧 Delivery: Water Birth' : '🏠 Delivery: Home Birth'}

═══════════════════════════════════════════════════════════════════
                      💕 FIRST MOMENTS
═══════════════════════════════════════════════════════════════════

${storyData.firstFeeling 
  ? storyData.firstFeeling 
  : `The moment we held ${storyData.babyName || 'our baby'} for the first time, our hearts overflowed with a love we never knew existed. Every tiny finger, every soft breath became a treasure.`}

═══════════════════════════════════════════════════════════════════
                    🌟 SPECIAL MEMORIES
═══════════════════════════════════════════════════════════════════

${storyData.specialMoments 
  ? storyData.specialMoments 
  : `These first moments together marked the beginning of our greatest adventure. A story we will cherish forever.`}

═══════════════════════════════════════════════════════════════════

${storyData.dedicatedTo ? `\n💝 Dedicated with love to ${storyData.dedicatedTo}\n` : ''}
                 Welcome to the world, ${storyData.babyName || 'little one'}!
                      You are loved beyond measure.

═══════════════════════════════════════════════════════════════════
                    Pregnancy Toolkits © 2026
═══════════════════════════════════════════════════════════════════
      `.trim();
      
      setGeneratedStory(story);
      localStorage.setItem('generatedBirthStory', story);
      setIsGenerating(false);
      toast({ title: t('toolsInternal.birthStory.storyGenerated', 'Story generated!'), description: t('toolsInternal.birthStory.storyReady', 'Your beautiful birth story is ready.') });
    }, 1500);
  };

  const downloadStory = () => {
    const content = `BIRTH STORY - ${storyData.babyName || 'Baby'}\n${'═'.repeat(50)}\n\n${generatedStory}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyData.babyName || 'birth'}-story.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t('toolsInternal.birthStory.downloaded', 'Downloaded!'), description: t('toolsInternal.birthStory.storySaved', 'Your birth story has been saved.') });
  };

  const shareStory = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${storyData.babyName || 'Baby'}'s Birth Story`,
          text: generatedStory.slice(0, 500) + '...',
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(generatedStory);
      toast({ title: t('toolsInternal.birthStory.copied', 'Copied!'), description: t('toolsInternal.birthStory.copiedToClipboard', 'Story copied to clipboard.') });
    }
  };

  const deliveryTypes = [
    { id: 'natural', label: t('toolsInternal.birthStory.naturalBirth', 'Natural Birth'), icon: '🌸' },
    { id: 'csection', label: t('toolsInternal.birthStory.csection', 'C-Section'), icon: '💜' },
    { id: 'water', label: t('toolsInternal.birthStory.waterBirth', 'Water Birth'), icon: '💧' },
    { id: 'home', label: t('toolsInternal.birthStory.homeBirth', 'Home Birth'), icon: '🏠' },
  ];

  return (
    <ToolFrame
      title={t('toolsInternal.birthStory.title', 'AI Birth Story Generator')}
      subtitle={t('toolsInternal.birthStory.subtitle', "Create a beautiful keepsake story of your baby's arrival")}
      icon={FileText}
      mood="joyful"
      toolId="ai-birth-story"
    >
      <div className="space-y-4">
        {/* Baby Details */}
        <Card>
          <CardContent className="p-3 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Baby className="w-4 h-4 text-primary" />
              {t('toolsInternal.birthStory.babyDetails', "Baby's Details")}
            </h3>
            
            <Input
              placeholder={t('toolsInternal.birthStory.babyName', "Baby's Name")}
              value={storyData.babyName}
              onChange={(e) => setStoryData(prev => ({ ...prev, babyName: e.target.value }))}
            />
            
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] sm:text-xs text-muted-foreground mb-1">{t('toolsInternal.birthStory.birthDate', 'Birth Date')}</label>
                <Input
                  type="date"
                  value={storyData.birthDate}
                  onChange={(e) => setStoryData(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs text-muted-foreground mb-1">{t('toolsInternal.birthStory.birthTime', 'Birth Time')}</label>
                <Input
                  type="time"
                  value={storyData.birthTime}
                  onChange={(e) => setStoryData(prev => ({ ...prev, birthTime: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Input
                placeholder={t('toolsInternal.birthStory.weight', 'Weight (e.g., 7 lbs 4 oz)')}
                value={storyData.weight}
                onChange={(e) => setStoryData(prev => ({ ...prev, weight: e.target.value }))}
              />
              <Input
                placeholder={t('toolsInternal.birthStory.length', 'Length (e.g., 20 inches)')}
                value={storyData.length}
                onChange={(e) => setStoryData(prev => ({ ...prev, length: e.target.value }))}
              />
            </div>
            
            <Input
              placeholder={t('toolsInternal.birthStory.location', 'Birth Location (Hospital, Birth Center, etc.)')}
              value={storyData.location}
              onChange={(e) => setStoryData(prev => ({ ...prev, location: e.target.value }))}
            />
          </CardContent>
        </Card>

        {/* Delivery Type */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">{t('toolsInternal.birthStory.deliveryType', 'Delivery Type')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {deliveryTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setStoryData(prev => ({ ...prev, deliveryType: type.id }))}
                  className={`p-2.5 rounded-lg text-center transition-all border-2 overflow-hidden ${
                    storyData.deliveryType === type.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted hover:bg-muted/80 border-transparent'
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <p className="text-xs mt-0.5 truncate">{type.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personal Touch */}
        <Card>
          <CardContent className="p-3 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              {t('toolsInternal.birthStory.personalTouch', 'Personal Touch')}
            </h3>
            
            <div>
              <label className="block text-xs font-medium mb-1.5">{t('toolsInternal.birthStory.firstFeeling', 'First feeling when you saw your baby')}</label>
              <Textarea
                placeholder={t('toolsInternal.birthStory.firstFeelingPlaceholder', 'Describe that magical first moment...')}
                value={storyData.firstFeeling}
                onChange={(e) => setStoryData(prev => ({ ...prev, firstFeeling: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1.5">{t('toolsInternal.birthStory.specialMoments', 'Special moments to remember')}</label>
              <Textarea
                placeholder={t('toolsInternal.birthStory.specialMomentsPlaceholder', 'Any special details, who was there, funny moments, etc...')}
                value={storyData.specialMoments}
                onChange={(e) => setStoryData(prev => ({ ...prev, specialMoments: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            
            <Input
              placeholder={t('toolsInternal.birthStory.dedicatedTo', 'Dedicated to... (optional)')}
              value={storyData.dedicatedTo}
              onChange={(e) => setStoryData(prev => ({ ...prev, dedicatedTo: e.target.value }))}
            />
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button 
          onClick={generateStory} 
          className="w-full gap-1.5 text-xs h-9"
          disabled={isGenerating}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isGenerating ? t('toolsInternal.birthStory.creating', 'Creating Your Story...') : t('toolsInternal.birthStory.generate', 'Generate Birth Story')}
        </Button>

        {/* Generated Story */}
        {generatedStory && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3 gap-2">
                <h3 className="text-sm font-semibold truncate">{t('toolsInternal.birthStory.yourStory', 'Your Birth Story')}</h3>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" onClick={shareStory} className="gap-1 h-7 px-2 text-[10px]">
                    <Share2 className="w-3 h-3" />
                    {t('common.share', 'Share')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadStory} className="gap-1 h-7 px-2 text-[10px]">
                    <Download className="w-3 h-3" />
                    {t('common.download', 'Download')}
                  </Button>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-gradient-to-br from-primary/5 to-secondary/10 p-4 rounded-xl font-mono border border-primary/10 leading-relaxed">
                  {generatedStory}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              💝 <strong>{t('toolsInternal.birthStory.keepsakeTitle', 'Create a keepsake')}:</strong> {t('toolsInternal.birthStory.keepsakeDesc', 'This story can be saved, printed, and included in a baby book or shared with family and friends.')}
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
