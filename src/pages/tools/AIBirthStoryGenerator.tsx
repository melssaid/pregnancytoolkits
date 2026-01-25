import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Sparkles, Download, Heart, Baby } from 'lucide-react';

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

export default function AIBirthStoryGenerator() {
  const [storyData, setStoryData] = useState<BirthStoryData>({
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
  });
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('birthStoryData');
    if (saved) setStoryData(JSON.parse(saved));
    const savedStory = localStorage.getItem('generatedBirthStory');
    if (savedStory) setGeneratedStory(savedStory);
  }, []);

  useEffect(() => {
    localStorage.setItem('birthStoryData', JSON.stringify(storyData));
  }, [storyData]);

  const generateStory = () => {
    setIsGenerating(true);
    
    // Generate story locally (no AI call needed for this simple template)
    setTimeout(() => {
      const story = `
# The Day ${storyData.babyName || 'Our Baby'} Arrived

## A Story of Love and New Beginnings

On ${storyData.birthDate ? new Date(storyData.birthDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'a beautiful day'}, at ${storyData.birthTime || 'a moment we\'ll never forget'}, our world changed forever.

${storyData.location ? `At ${storyData.location}, surrounded by love and care, ` : ''}we welcomed our precious ${storyData.babyName || 'little one'} into the world.

### The First Moments

${storyData.deliveryType === 'natural' ? 'After hours of anticipation and strength,' : storyData.deliveryType === 'csection' ? 'Through careful medical care and preparation,' : 'With courage and hope,'} ${storyData.babyName || 'our baby'} made their grand entrance.

${storyData.weight || storyData.length ? `Weighing ${storyData.weight || '—'} and measuring ${storyData.length || '—'}, ${storyData.babyName || 'they'} was absolutely perfect.` : ''}

### A Heart Full of Emotion

${storyData.firstFeeling ? `The moment we saw ${storyData.babyName || 'our baby'}, ${storyData.firstFeeling}` : `The moment we held our baby for the first time, our hearts overflowed with a love we never knew existed.`}

### Precious Memories

${storyData.specialMoments || `Every tiny finger, every soft breath, every little sound became a treasure we hold dear. These first moments together marked the beginning of our greatest adventure.`}

---

${storyData.dedicatedTo ? `*Dedicated with love to ${storyData.dedicatedTo}*` : '*This is our story of love, hope, and new beginnings.*'}

💕 Welcome to the world, ${storyData.babyName || 'little one'}. You are loved beyond measure.
      `.trim();
      
      setGeneratedStory(story);
      localStorage.setItem('generatedBirthStory', story);
      setIsGenerating(false);
    }, 1500);
  };

  const downloadStory = () => {
    const blob = new Blob([generatedStory], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyData.babyName || 'birth'}-story.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deliveryTypes = [
    { id: 'natural', label: 'Natural Birth', icon: '🌸' },
    { id: 'csection', label: 'C-Section', icon: '💜' },
    { id: 'water', label: 'Water Birth', icon: '💧' },
    { id: 'home', label: 'Home Birth', icon: '🏠' },
  ];

  return (
    <ToolFrame
      title="AI Birth Story Generator"
      subtitle="Create a beautiful keepsake story of your baby's arrival"
      icon={FileText}
      mood="joyful"
      toolId="ai-birth-story"
    >
      <div className="space-y-6">
        {/* Baby Details */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Baby className="w-5 h-5 text-primary" />
              Baby's Details
            </h3>
            
            <Input
              placeholder="Baby's Name"
              value={storyData.babyName}
              onChange={(e) => setStoryData(prev => ({ ...prev, babyName: e.target.value }))}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Birth Date</label>
                <Input
                  type="date"
                  value={storyData.birthDate}
                  onChange={(e) => setStoryData(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Birth Time</label>
                <Input
                  type="time"
                  value={storyData.birthTime}
                  onChange={(e) => setStoryData(prev => ({ ...prev, birthTime: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Weight (e.g., 7 lbs 4 oz)"
                value={storyData.weight}
                onChange={(e) => setStoryData(prev => ({ ...prev, weight: e.target.value }))}
              />
              <Input
                placeholder="Length (e.g., 20 inches)"
                value={storyData.length}
                onChange={(e) => setStoryData(prev => ({ ...prev, length: e.target.value }))}
              />
            </div>
            
            <Input
              placeholder="Birth Location (Hospital, Birth Center, etc.)"
              value={storyData.location}
              onChange={(e) => setStoryData(prev => ({ ...prev, location: e.target.value }))}
            />
          </CardContent>
        </Card>

        {/* Delivery Type */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Delivery Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {deliveryTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setStoryData(prev => ({ ...prev, deliveryType: type.id }))}
                  className={`p-3 rounded-lg text-center transition-all ${
                    storyData.deliveryType === type.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <p className="text-sm mt-1">{type.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personal Touch */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Personal Touch
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">First feeling when you saw your baby</label>
              <Textarea
                placeholder="Describe that magical first moment..."
                value={storyData.firstFeeling}
                onChange={(e) => setStoryData(prev => ({ ...prev, firstFeeling: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Special moments to remember</label>
              <Textarea
                placeholder="Any special details, who was there, funny moments, etc..."
                value={storyData.specialMoments}
                onChange={(e) => setStoryData(prev => ({ ...prev, specialMoments: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            
            <Input
              placeholder="Dedicated to... (optional)"
              value={storyData.dedicatedTo}
              onChange={(e) => setStoryData(prev => ({ ...prev, dedicatedTo: e.target.value }))}
            />
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button 
          onClick={generateStory} 
          className="w-full gap-2"
          disabled={isGenerating}
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'Creating Your Story...' : 'Generate Birth Story'}
        </Button>

        {/* Generated Story */}
        {generatedStory && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Birth Story</h3>
                <Button variant="outline" size="sm" onClick={downloadStory} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg font-sans">
                  {generatedStory}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              💝 <strong>Create a keepsake:</strong> This story can be saved, printed, and included in a baby book or shared with family and friends.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
