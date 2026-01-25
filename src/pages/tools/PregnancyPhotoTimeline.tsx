import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Plus, Trash2, Calendar, Download, Image } from 'lucide-react';

interface PhotoEntry {
  id: string;
  week: number;
  date: string;
  caption: string;
  imageData: string;
}

export default function PregnancyPhotoTimeline() {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [caption, setCaption] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pregnancyPhotoTimeline');
    if (saved) {
      try {
        setPhotos(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load photos');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pregnancyPhotoTimeline', JSON.stringify(photos));
  }, [photos]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB for optimal storage');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addPhoto = () => {
    if (!previewImage) return;

    const newPhoto: PhotoEntry = {
      id: Date.now().toString(),
      week: currentWeek,
      date: new Date().toISOString(),
      caption: caption || `Week ${currentWeek} bump photo`,
      imageData: previewImage,
    };

    setPhotos([...photos, newPhoto].sort((a, b) => a.week - b.week));
    setPreviewImage(null);
    setCaption('');
  };

  const deletePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const generateCaptions = (week: number): string[] => {
    const captions: Record<number, string[]> = {
      8: ['First bump photo! 🌱', 'The journey begins'],
      12: ['End of first trimester! 🎉', 'Baby is the size of a lime'],
      16: ['Growing every day 💕', 'Starting to show!'],
      20: ['Halfway there! 🎊', 'Feeling those kicks'],
      24: ['Getting bigger! 🤰', 'Baby is very active'],
      28: ['Third trimester starts! ⭐', 'Almost there'],
      32: ['8 months pregnant! 💖', 'Counting down the days'],
      36: ['Almost ready to meet you 👶', 'Final stretch!'],
      40: ['Due date week! 🎀', 'Any day now'],
    };

    const nearestWeek = Object.keys(captions)
      .map(Number)
      .reduce((prev, curr) => 
        Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
      );
    
    return captions[nearestWeek] || [`Week ${week} 💕`, 'Another week of growth'];
  };

  return (
    <ToolFrame
      title="Pregnancy Photo Timeline"
      subtitle="Document your bump journey with beautiful photo memories"
      icon={Camera}
      mood="joyful"
      toolId="pregnancy-photo-timeline"
    >
      <div className="space-y-6">
        {/* Week Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Photo Week</span>
              <span className="text-2xl font-bold text-primary">Week {currentWeek}</span>
            </div>
            <input
              type="range"
              min="1"
              max="42"
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer"
            />
          </CardContent>
        </Card>

        {/* Add Photo */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add Bump Photo
            </h3>

            {!previewImage ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                <Camera className="w-12 h-12 text-primary/50 mb-2" />
                <span className="text-sm text-muted-foreground">Tap to add photo</span>
                <span className="text-xs text-muted-foreground mt-1">Max 2MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Caption</label>
              <Input
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {generateCaptions(currentWeek).map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setCaption(c)}
                    className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-primary/10"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={addPhoto} className="w-full" disabled={!previewImage}>
              Save Photo
            </Button>
          </CardContent>
        </Card>

        {/* Photo Timeline */}
        {photos.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Your Timeline ({photos.length} photos)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.imageData}
                      alt={`Week ${photo.week}`}
                      className="w-full aspect-[3/4] object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                      <p className="text-white text-sm font-medium">Week {photo.week}</p>
                      <p className="text-white/80 text-xs truncate">{photo.caption}</p>
                    </div>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {photos.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Start Your Photo Journey</h3>
              <p className="text-sm text-muted-foreground">
                Document your bump week by week to create beautiful memories.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              📸 <strong>Tip:</strong> For the best timeline, try to take photos from the same angle and position each week. All photos are stored locally on your device.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
