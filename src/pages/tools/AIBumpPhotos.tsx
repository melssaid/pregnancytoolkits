import React, { useState, useEffect, useRef } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Plus, Trash2, Image, Loader2, Sparkles, TrendingUp, Calendar, ArrowLeftRight, Cloud, CloudOff } from 'lucide-react';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { compressImage, estimateDataUrlSize, formatBytes } from '@/lib/imageCompression';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useBumpPhotosStorage, BumpPhoto } from '@/hooks/useBumpPhotosStorage';

// Local storage interface for offline/guest mode
interface LocalPhotoEntry {
  id: string;
  week: number;
  date: string;
  caption: string;
  imageData: string;
  aiAnalysis?: string;
}

const STORAGE_KEY = 'aiBumpPhotosTimeline';

const isPhotoEntryArray = (data: unknown): data is LocalPhotoEntry[] => {
  return Array.isArray(data) && data.every(item =>
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'week' in item &&
    'date' in item &&
    'imageData' in item
  );
};

// Unified photo type for UI
interface UnifiedPhoto {
  id: string;
  week: number;
  caption: string;
  imageUrl: string;
  date: string;
  aiAnalysis?: string;
  isCloud: boolean;
  originalData?: BumpPhoto | LocalPhotoEntry;
}

export default function AIBumpPhotos() {
  // Cloud storage
  const {
    photos: cloudPhotos,
    isLoading: isCloudLoading,
    isUploading,
    uploadPhoto: uploadToCloud,
    deletePhoto: deleteFromCloud,
    isAuthenticated
  } = useBumpPhotosStorage();

  // Local storage for guests
  const [localPhotos, setLocalPhotos] = useState<LocalPhotoEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [caption, setCaption] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('add');
  const [viewingPhoto, setViewingPhoto] = useState<UnifiedPhoto | null>(null);
  const [growthAnalysis, setGrowthAnalysis] = useState<string | null>(null);
  const isInitialized = useRef(false);
  
  const { generateContent, isLoading: isAILoading } = usePregnancyAI();

  // Load local photos for guest mode
  useEffect(() => {
    const saved = safeParseLocalStorage<LocalPhotoEntry[]>(STORAGE_KEY, [], isPhotoEntryArray);
    setLocalPhotos(saved);
    isInitialized.current = true;
  }, []);

  // Combine photos from both sources
  const unifiedPhotos: UnifiedPhoto[] = React.useMemo(() => {
    const cloud = cloudPhotos.map(p => ({
      id: p.id,
      week: p.week,
      caption: p.caption || '',
      imageUrl: p.public_url,
      date: p.created_at,
      aiAnalysis: p.ai_analysis,
      isCloud: true,
      originalData: p
    }));

    const local = localPhotos.map(p => ({
      id: p.id,
      week: p.week,
      caption: p.caption,
      imageUrl: p.imageData,
      date: p.date,
      aiAnalysis: p.aiAnalysis,
      isCloud: false,
      originalData: p
    }));

    // If authenticated, show only cloud photos
    // If not authenticated, show only local photos
    return (isAuthenticated ? cloud : local).sort((a, b) => a.week - b.week);
  }, [cloudPhotos, localPhotos, isAuthenticated]);

  const saveLocalPhotos = (newPhotos: LocalPhotoEntry[]) => {
    setLocalPhotos(newPhotos);
    if (isInitialized.current) {
      const success = safeSaveToLocalStorage(STORAGE_KEY, newPhotos);
      if (!success) {
        toast.error('Failed to save photos. Storage may be full.');
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setPreviewFile(file);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const originalData = reader.result as string;
          const originalSize = estimateDataUrlSize(originalData);
          const compressedData = await compressImage(originalData, 800, 1000, 0.7);
          const compressedSize = estimateDataUrlSize(compressedData);
          console.log(`Image compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)}`);
          setPreviewImage(compressedData);
        } catch (error) {
          console.error('Compression error:', error);
          toast.error('Failed to process image');
        } finally {
          setIsCompressing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsCompressing(false);
      toast.error('Failed to read image file');
    }
  };

  const generateAICaption = async () => {
    if (!previewImage) return;
    
    const prompt = `Generate a short, sweet, and encouraging caption for a week ${currentWeek} bump photo. 
    Include an emoji. Keep it under 15 words. Make it personal and celebratory.
    Examples: "Week 20: Halfway there! 🎉", "Growing stronger every day 💕"`;
    
    const response = await generateContent(prompt);
    if (response) {
      const cleanCaption = response.replace(/^["']|["']$/g, '').trim();
      setCaption(cleanCaption);
    }
  };

  const addPhoto = async () => {
    if (!previewImage) return;

    if (isAuthenticated && previewFile) {
      // Upload to Supabase
      await uploadToCloud(previewFile, currentWeek, caption || `Week ${currentWeek} bump photo`);
    } else {
      // Save locally
      const newPhoto: LocalPhotoEntry = {
        id: Date.now().toString(),
        week: currentWeek,
        date: new Date().toISOString(),
        caption: caption || `Week ${currentWeek} bump photo`,
        imageData: previewImage,
      };

      const newPhotos = [...localPhotos, newPhoto].sort((a, b) => a.week - b.week);
      saveLocalPhotos(newPhotos);
      toast.success('Photo added to timeline! ✨');
    }

    setPreviewImage(null);
    setPreviewFile(null);
    setCaption('');
  };

  const deletePhoto = async (photo: UnifiedPhoto) => {
    if (photo.isCloud && photo.originalData) {
      await deleteFromCloud(photo.originalData as BumpPhoto);
    } else {
      const newPhotos = localPhotos.filter(p => p.id !== photo.id);
      saveLocalPhotos(newPhotos);
      toast.success('Photo deleted');
    }
    setViewingPhoto(null);
  };

  const generateGrowthAnalysis = async () => {
    if (unifiedPhotos.length < 2) {
      toast.error('Need at least 2 photos for growth analysis');
      return;
    }

    const weeksData = unifiedPhotos.map(p => `Week ${p.week}`).join(', ');
    const prompt = `As a pregnancy wellness coach, provide a brief, encouraging growth journey summary for a mother who has documented her bump at weeks: ${weeksData}. 
    
    Include:
    - A warm acknowledgment of her journey
    - General information about typical bump growth during these weeks
    - An encouraging message about the remaining journey
    - Tips for taking the best bump photos
    
    Keep it warm, supportive, and under 150 words.`;

    const analysis = await generateContent(prompt);
    if (analysis) {
      setGrowthAnalysis(analysis);
      toast.success('Growth analysis generated!');
    }
  };

  const suggestedCaptions = [
    `Week ${currentWeek} magic ✨`,
    `Growing stronger 💪`,
    `Hello little one! 👶`,
    `Bump update 📸`,
    `${currentWeek} weeks of love 💕`,
  ];

  const getWeekMilestone = (week: number): string => {
    if (week <= 12) return 'First Trimester';
    if (week <= 27) return 'Second Trimester';
    return 'Third Trimester';
  };

  const isLoading = isCloudLoading || isUploading;

  return (
    <ToolFrame
      title="AI Bump Photos"
      subtitle="Smart pregnancy photo timeline with AI insights"
      icon={Camera}
      mood="joyful"
      toolId="ai-bump-photos"
    >
      <div className="space-y-6">
        {/* Cloud Status Banner */}
        <Card className={`p-3 ${isAuthenticated ? 'bg-primary/10 border-primary/30' : 'bg-muted/50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Cloud className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Cloud Sync Active</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Local Storage Mode</span>
                </>
              )}
            </div>
            {!isAuthenticated && (
              <span className="text-xs text-muted-foreground">
                Sign in to sync photos to cloud
              </span>
            )}
          </div>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Photo
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              Compare
            </TabsTrigger>
          </TabsList>

          {/* ADD PHOTO TAB */}
          <TabsContent value="add" className="space-y-4 mt-4">
            {/* Week Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Photo Week</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">Week {currentWeek}</span>
                    <p className="text-xs text-muted-foreground">{getWeekMilestone(currentWeek)}</p>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="42"
                  value={currentWeek}
                  onChange={(e) => setCurrentWeek(Number(e.target.value))}
                  className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Add Bump Photo
                </h3>

                {!previewImage ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                    {isCompressing ? (
                      <>
                        <Loader2 className="w-12 h-12 text-primary/50 mb-2 animate-spin" />
                        <span className="text-sm text-muted-foreground">Processing image...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-12 h-12 text-primary/50 mb-2" />
                        <span className="text-sm text-muted-foreground">Tap to add photo</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {isAuthenticated ? 'Saved to cloud ☁️' : 'Auto-compressed for storage'}
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isCompressing}
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
                      onClick={() => {
                        setPreviewImage(null);
                        setPreviewFile(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Caption with AI */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Caption</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={generateAICaption}
                      disabled={!previewImage || isAILoading}
                      className="text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Suggest
                    </Button>
                  </div>
                  <Input
                    placeholder="Add a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedCaptions.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setCaption(c)}
                        className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-primary/10 transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={addPhoto} className="w-full" disabled={!previewImage || isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {isAuthenticated ? 'Save to Cloud' : 'Save to Timeline'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TIMELINE TAB */}
          <TabsContent value="timeline" className="space-y-4 mt-4">
            {unifiedPhotos.length > 0 ? (
              <>
                {/* AI Growth Analysis */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        AI Growth Journey
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateGrowthAnalysis}
                        disabled={isAILoading || unifiedPhotos.length < 2}
                      >
                        {isAILoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    {growthAnalysis ? (
                      <div className="text-sm">
                        <MarkdownRenderer content={growthAnalysis} />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {unifiedPhotos.length < 2 
                          ? 'Add at least 2 photos to see your growth analysis'
                          : 'Tap the sparkle button to generate your personalized growth journey analysis'
                        }
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Timeline Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{unifiedPhotos.length}</p>
                      <p className="text-xs text-muted-foreground">Photos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {unifiedPhotos.length > 0 ? Math.min(...unifiedPhotos.map(p => p.week)) : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">First Week</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {unifiedPhotos.length > 0 ? Math.max(...unifiedPhotos.map(p => p.week)) : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Latest Week</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Photo Grid */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Your Timeline ({unifiedPhotos.length} photos)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <AnimatePresence>
                        {unifiedPhotos.map((photo, index) => (
                          <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative group cursor-pointer"
                            onClick={() => setViewingPhoto(photo)}
                          >
                            <img
                              src={photo.imageUrl}
                              alt={`Week ${photo.week}`}
                              className="w-full aspect-[3/4] object-cover rounded-lg"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                              <div className="flex items-center gap-1">
                                <p className="text-white text-sm font-medium">Week {photo.week}</p>
                                {photo.isCloud && <Cloud className="w-3 h-3 text-white/80" />}
                              </div>
                              <p className="text-white/80 text-xs truncate">{photo.caption}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePhoto(photo);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Start Your Photo Journey</h3>
                  <p className="text-sm text-muted-foreground">
                    Document your bump week by week to create beautiful memories.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSelectedTab('add')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Photo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* COMPARE TAB */}
          <TabsContent value="compare" className="space-y-4 mt-4">
            <ComparePhotos photos={unifiedPhotos} />
          </TabsContent>
        </Tabs>

        {/* Photo Tips */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              📸 <strong>Pro Tips:</strong> Take photos from the same angle each week for the best comparison. 
              Natural lighting works best, and wearing fitted clothing helps show your beautiful bump progress!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Photo Viewer Modal */}
      <AnimatePresence>
        {viewingPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setViewingPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={viewingPhoto.imageUrl}
                alt={`Week ${viewingPhoto.week}`}
                className="w-full rounded-lg"
              />
              <div className="mt-4 text-center text-white">
                <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                  Week {viewingPhoto.week}
                  {viewingPhoto.isCloud && <Cloud className="w-4 h-4" />}
                </h3>
                <p className="text-white/80">{viewingPhoto.caption}</p>
                <p className="text-white/60 text-sm mt-1">
                  {new Date(viewingPhoto.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3 mt-4 justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletePhoto(viewingPhoto)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewingPhoto(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolFrame>
  );
}

// Compare Photos Component
function ComparePhotos({ photos }: { photos: UnifiedPhoto[] }) {
  const [comparePhotos, setComparePhotos] = useState<[UnifiedPhoto | null, UnifiedPhoto | null]>([null, null]);

  if (photos.length < 2) {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            Compare Photos
          </h3>
          <div className="text-center py-8">
            <ArrowLeftRight className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Add at least 2 photos to compare your bump growth
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          Compare Photos
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Left Photo Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Before</label>
              <select
                className="w-full p-2 rounded-lg border bg-background text-sm"
                value={comparePhotos[0]?.id || ''}
                onChange={(e) => {
                  const photo = photos.find(p => p.id === e.target.value);
                  setComparePhotos([photo || null, comparePhotos[1]]);
                }}
              >
                <option value="">Select week...</option>
                {photos.map(p => (
                  <option key={p.id} value={p.id}>Week {p.week}</option>
                ))}
              </select>
              {comparePhotos[0] && (
                <img
                  src={comparePhotos[0].imageUrl}
                  alt={`Week ${comparePhotos[0].week}`}
                  className="w-full aspect-[3/4] object-cover rounded-lg mt-2"
                />
              )}
            </div>

            {/* Right Photo Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">After</label>
              <select
                className="w-full p-2 rounded-lg border bg-background text-sm"
                value={comparePhotos[1]?.id || ''}
                onChange={(e) => {
                  const photo = photos.find(p => p.id === e.target.value);
                  setComparePhotos([comparePhotos[0], photo || null]);
                }}
              >
                <option value="">Select week...</option>
                {photos.map(p => (
                  <option key={p.id} value={p.id}>Week {p.week}</option>
                ))}
              </select>
              {comparePhotos[1] && (
                <img
                  src={comparePhotos[1].imageUrl}
                  alt={`Week ${comparePhotos[1].week}`}
                  className="w-full aspect-[3/4] object-cover rounded-lg mt-2"
                />
              )}
            </div>
          </div>

          {comparePhotos[0] && comparePhotos[1] && (
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <p className="text-sm text-center">
                  <span className="font-medium">
                    {Math.abs(comparePhotos[1].week - comparePhotos[0].week)} weeks
                  </span>
                  <span className="text-muted-foreground"> of growth between these photos</span>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
