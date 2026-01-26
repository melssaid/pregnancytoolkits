import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Save, Calendar, Volume2 } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const AIBirthStoryGenerator = () => {
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('Baby');
  const [date, setDate] = useState('');
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const generateStory = async () => {
    setLoading(true);
    // AI API call (OpenAI/Grok)
    const response = await fetch('/api/ai-birth-story', {
      method: 'POST',
      body: JSON.stringify({ name, date }),
    });
    const data = await response.json();
    setStory(data.story);
    setLoading(false);
  };

  const saveStory = async () => {
    const { data, error } = await supabase
      .from('user_stories')
      .insert([{ story, name, date, user_id: 'current_user' }]);
    if (!error) toast({ title: 'Story saved!' });
  };

  const shareStory = () => {
    if (navigator.share) {
      navigator.share({ title: 'My AI Birth Story', text: story.slice(0, 100) });
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI Birth Story Generator
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create a beautiful, personalized birth story in English for your little one.
          </p>
        </motion.div>

        {/* Form */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50">
          <div className="space-y-4">
            <Input
              placeholder="Baby's name (e.g., Emma)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 text-lg"
            />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-14 text-lg"
            />
            <Button onClick={generateStory} className="w-full h-14 text-lg rounded-2xl shadow-lg" disabled={loading}>
              {loading ? 'Generating...' : '✨ Generate Story'}
            </Button>
          </div>
        </div>

        {/* Story Output */}
        {story && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-gradient-to-r from-white to-purple-50 rounded-3xl p-8 shadow-xl border border-purple-100"
          >
            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
              <h2 className="text-2xl font-bold mb-4 text-purple-800">Your Baby's Birth Story ✨</h2>
              <p>{story}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8 pt-8 border-t border-purple-100">
              <Button onClick={saveStory} className="flex-1 rounded-2xl">
                <Save className="w-5 h-5 mr-2" /> Save to Profile
              </Button>
              <Button onClick={shareStory} variant="outline" className="rounded-2xl">
                <Share2 className="w-5 h-5 mr-2" /> Share
              </Button>
              <Button onClick={playNotificationSound} variant="ghost">
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-yellow-900 mb-2">⚠️ Important Notice</h3>
          <p className="text-sm text-yellow-800">
            This is an AI-generated story for fun and memory. Not medical advice.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AIBirthStoryGenerator;