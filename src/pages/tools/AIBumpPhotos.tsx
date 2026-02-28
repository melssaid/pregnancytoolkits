import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, Upload, Trash2, Download, Sparkles, ChevronLeft, ChevronRight, 
  Loader2, Image as ImageIcon, HardDrive, AlertTriangle, Shield, 
  Calendar, X, RefreshCw, Info, Columns, Clock, Edit3, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BumpPhotoService } from '@/services/localStorageServices';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ToolFrame } from '@/components/ToolFrame';
import { compressImage, estimateDataUrlSize, formatBytes } from '@/lib/imageCompression';

interface BumpPhoto {
  id: string;
  week: number;
  caption: string | null;
  public_url: string;
  storage_path: string;
  ai_analysis: string | null;
  created_at: string;
  updated_at: string;
}

const AIBumpPhotos: React.FC = () => {
  const { t } = useTranslation();
  const { profile: userProfile } = useUserProfile();
  const [photos, setPhotos] = useState<BumpPhoto[]>([]);
  const [currentWeek, setCurrentWeek] = useState(userProfile.pregnancyWeek || 0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<BumpPhoto | null>(null);
  const [comparePhoto, setComparePhoto] = useState<BumpPhoto | null>(null);
  const [caption, setCaption] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);
  const { toast } = useToast();
  const { streamChat } = usePregnancyAI();

  useResetOnLanguageChange(() => { setAiAnalysis(''); });

  // Sync week from central profile
  useEffect(() => {
    if (userProfile.pregnancyWeek) setCurrentWeek(userProfile.pregnancyWeek);
  }, [userProfile.pregnancyWeek]);

  // Calculate storage usage
  const storageInfo = useMemo(() => {
    const totalBytes = photos.reduce((sum, p) => sum + estimateDataUrlSize(p.public_url), 0);
    const maxStorage = 5 * 1024 * 1024;
    const percentage = Math.min(100, (totalBytes / maxStorage) * 100);
    return { used: formatBytes(totalBytes), percentage, isWarning: percentage > 70, isCritical: percentage > 90 };
  }, [photos]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const loadedPhotos = await BumpPhotoService.getAll();
      setPhotos(loadedPhotos);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: t('toolsInternal.bumpPhotos.loadingError'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: t('toolsInternal.kickCounter.error'),
        description: t('toolsInternal.bumpPhotos.errorSelectImage'),
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: t('toolsInternal.kickCounter.error'),
        description: t('toolsInternal.bumpPhotos.errorTooLarge'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Read and compress image
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Compress image for local storage
      const compressedDataUrl = await compressImage(dataUrl, 800, 1000, 0.7);
      
      // Create photo object with compressed image directly
      const photo: BumpPhoto = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        week: currentWeek,
        caption: caption || null,
        public_url: compressedDataUrl,
        storage_path: `local/${currentWeek}_${Date.now()}`,
        ai_analysis: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to local storage directly (avoid double processing)
      const existingPhotos = await BumpPhotoService.getAll();
      const updatedPhotos = [...existingPhotos, photo].sort((a, b) => a.week - b.week);
      localStorage.setItem(`bump_photos_${localStorage.getItem('pregnancy_user_id')}`, JSON.stringify(updatedPhotos));
      
      setPhotos(updatedPhotos);
      setCaption('');
      
      toast({
        title: t('toolsInternal.bumpPhotos.photoSaved'),
        description: t('toolsInternal.bumpPhotos.photoSavedDesc', { week: currentWeek })
      });

      // Auto analyze
      analyzePhoto(photo);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: t('toolsInternal.bumpPhotos.uploadFailed'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEditCaption = async (photoId: string) => {
    try {
      await BumpPhotoService.updateCaption(photoId, editCaption);
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, caption: editCaption } : p
      ));
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto({ ...selectedPhoto, caption: editCaption });
      }
      setEditingPhotoId(null);
      setEditCaption('');
      toast({
        title: t('toolsInternal.bumpPhotos.captionUpdated'),
        description: t('toolsInternal.bumpPhotos.captionUpdatedDesc')
      });
    } catch (error: any) {
      toast({
        title: t('toolsInternal.bumpPhotos.updateFailed'),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const analyzePhoto = async (photo: BumpPhoto) => {
    try {
      setIsAnalyzing(true);
      setSelectedPhoto(photo);
      setAiAnalysis('');
      abortRef.current = false;
      
      const previousPhoto = photos.find(p => p.week < photo.week);
      
      const textPrompt = previousPhoto 
        ? `I am in week ${photo.week} of pregnancy (previous ultrasound was at week ${previousPhoto.week}). Please analyze this ultrasound (sonogram) image and provide educational observations about what is visible, baby's development at this stage, and any notable features.`
        : `I am in week ${photo.week} of pregnancy. Please analyze this ultrasound (sonogram) image and provide educational observations about what is visible, baby's development at this stage, and any notable features.`;

      // Build multimodal message with ultrasound image
      const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: "text", text: textPrompt },
        { type: "image_url", image_url: { url: photo.public_url } },
      ];

      let fullResponse = '';
      
      await streamChat({
        type: 'bump-photos',
        messages: [{ role: 'user', content: messageContent }],
        context: { week: photo.week },
        onDelta: (text) => {
          if (abortRef.current) return;
          fullResponse += text;
          setAiAnalysis(fullResponse);
        },
        onDone: async () => {
          if (!abortRef.current && fullResponse) {
            await BumpPhotoService.updateAnalysis(photo.id, fullResponse);
            setPhotos(prev => prev.map(p => 
              p.id === photo.id ? { ...p, ai_analysis: fullResponse } : p
            ));
          }
          setIsAnalyzing(false);
        }
      });
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: t('toolsInternal.bumpPhotos.analysisFailedTitle'),
        description: error.message,
        variant: 'destructive'
      });
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (photo: BumpPhoto) => {
    if (!confirm(t('toolsInternal.bumpPhotos.deleteConfirm'))) return;

    try {
      await BumpPhotoService.delete(photo.id, photo.storage_path);
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      
      if (selectedPhoto?.id === photo.id) {
        setSelectedPhoto(null);
        setAiAnalysis('');
      }
      
      toast({
        title: t('toolsInternal.bumpPhotos.photoDeleted'),
        description: t('toolsInternal.bumpPhotos.deletedDesc')
      });
    } catch (error: any) {
      toast({
        title: t('toolsInternal.bumpPhotos.deleteFailed'),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDownload = (photo: BumpPhoto) => {
    const link = document.createElement('a');
    link.href = photo.public_url;
    link.download = `bump-week-${photo.week}.jpg`;
    link.click();
  };

  const handleShare = async (photo: BumpPhoto) => {
    try {
      // Convert base64 to blob
      const response = await fetch(photo.public_url);
      const blob = await response.blob();
      const file = new File([blob], `bump-week-${photo.week}.jpg`, { type: 'image/jpeg' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${t('toolsInternal.bumpPhotos.week')} ${photo.week}`,
          text: photo.caption || `${t('toolsInternal.bumpPhotos.subtitle')} - ${t('toolsInternal.bumpPhotos.week')} ${photo.week}`,
          files: [file]
        });
      } else {
        // Fallback to download
        handleDownload(photo);
        toast({ title: t('toolsInternal.bumpPhotos.photoDownloaded'), description: t('toolsInternal.bumpPhotos.photoDownloadedDesc') });
      }
    } catch (error) {
      console.error('Share error:', error);
      handleDownload(photo);
    }
  };

  if (isLoading) {
    return (
      <ToolFrame
        title={t('toolsInternal.bumpPhotos.title')}
        subtitle={t('toolsInternal.bumpPhotos.subtitle')}
        mood="nurturing"
        toolId="ai-bump-photos"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ToolFrame>
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.bumpPhotos.title')}
      subtitle={`${t('toolsInternal.common.week')} ${currentWeek} - ${t('toolsInternal.bumpPhotos.subtitle')}`}
      mood="nurturing"
      toolId="ai-bump-photos"
    >
      <div className="space-y-6">
        {/* Local Storage Notice */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/50 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <HardDrive className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">{t('toolsInternal.bumpPhotos.localStorageTitle')}</h4>
                <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700">
                  <Shield className="w-3 h-3 mr-1" />
                  {t('toolsInternal.bumpPhotos.privateLabel')}
                </Badge>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-3">
                {t('toolsInternal.bumpPhotos.localStorageDesc')}
              </p>
              
              {/* Storage Usage Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('toolsInternal.bumpPhotos.storageUsed')}</span>
                  <span className={`font-medium ${
                    storageInfo.isCritical ? 'text-destructive' : 
                    storageInfo.isWarning ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {storageInfo.used} / 5 MB
                  </span>
                </div>
                <Progress 
                  value={storageInfo.percentage} 
                  className={`h-2 ${
                    storageInfo.isCritical ? '[&>div]:bg-destructive' : 
                    storageInfo.isWarning ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'
                  }`}
                />
                {storageInfo.isWarning && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    {storageInfo.isCritical 
                      ? t('toolsInternal.bumpPhotos.storageCritical')
                      : t('toolsInternal.bumpPhotos.storageWarning')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Week Selector & Upload */}
        <Card className="border-primary/20">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium">{t('toolsInternal.bumpPhotos.selectWeek')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentWeek(w => Math.max(1, w - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-base font-bold text-primary min-w-[60px] text-center">
                  {currentWeek}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentWeek(w => Math.min(42, w + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Textarea
              placeholder={t('toolsInternal.bumpPhotos.captionPlaceholder')}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none"
              rows={2}
            />
            
            {/* Upload Zone */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-xl p-6 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleUpload}
                className="hidden"
              />
              <AnimatePresence mode="wait">
                {isUploading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <span className="text-primary font-medium mt-2 block">{t('toolsInternal.bumpPhotos.compressing')}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className="p-3 rounded-full bg-primary/10 mx-auto w-fit mb-2">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-primary font-medium">{t('toolsInternal.bumpPhotos.takeOrUpload')}</span>
                    <span className="text-xs text-muted-foreground block mt-1">
                      {t('toolsInternal.bumpPhotos.autoCompressed')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {photos.length > 1 && (
          <div className="flex gap-2">
            <Button
              variant={showCompare ? "default" : "outline"}
              className="flex-1"
              onClick={() => setShowCompare(!showCompare)}
            >
              <Columns className="w-4 h-4 mr-2" />
              {t('toolsInternal.bumpPhotos.comparePhotos')}
            </Button>
          </div>
        )}

        {/* Photo Comparison Mode */}
        <AnimatePresence>
          {showCompare && photos.length > 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Columns className="w-5 h-5 text-primary" />
                    {t('toolsInternal.bumpPhotos.sideBySide')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('toolsInternal.bumpPhotos.earlierPhoto')}</p>
                      <select
                        className="w-full p-2 rounded-lg border border-border bg-background mb-2"
                        value={comparePhoto?.id || ''}
                        onChange={(e) => {
                          const photo = photos.find(p => p.id === e.target.value);
                          setComparePhoto(photo || null);
                        }}
                      >
                        <option value="">{t('toolsInternal.bumpPhotos.selectWeekOption')}</option>
                        {photos.map(p => (
                          <option key={p.id} value={p.id}>{t('toolsInternal.bumpPhotos.week')} {p.week}</option>
                        ))}
                      </select>
                      {comparePhoto && (
                        <img
                          src={comparePhoto.public_url}
                          alt={`Week ${comparePhoto.week}`}
                          className="w-full aspect-[3/4] object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('toolsInternal.bumpPhotos.laterPhoto')}</p>
                      <select
                        className="w-full p-2 rounded-lg border border-border bg-background mb-2"
                        value={selectedPhoto?.id || ''}
                        onChange={(e) => {
                          const photo = photos.find(p => p.id === e.target.value);
                          setSelectedPhoto(photo || null);
                        }}
                      >
                        <option value="">{t('toolsInternal.bumpPhotos.selectWeekOption')}</option>
                        {photos.map(p => (
                          <option key={p.id} value={p.id}>{t('toolsInternal.bumpPhotos.week')} {p.week}</option>
                        ))}
                      </select>
                      {selectedPhoto && (
                        <img
                          src={selectedPhoto.public_url}
                          alt={`Week ${selectedPhoto.week}`}
                          className="w-full aspect-[3/4] object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                  {comparePhoto && selectedPhoto && (
                    <p className="text-center text-sm text-muted-foreground mt-3">
                      {t('toolsInternal.bumpPhotos.weeksProgress', { weeks: Math.abs(selectedPhoto.week - comparePhoto.week) })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photos Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    selectedPhoto?.id === photo.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setAiAnalysis(photo.ai_analysis || '');
                  }}
                >
                  <div className="relative aspect-[3/4]">
                    <img
                      src={photo.public_url}
                      alt={`Week ${photo.week}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold shadow">
                      {t('toolsInternal.bumpPhotos.week')} {photo.week}
                    </div>
                    {photo.ai_analysis && (
                      <div className="absolute top-2 left-2 bg-emerald-500 text-white p-1 rounded-full shadow">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(photo);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(photo);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(photo.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        <HardDrive className="w-2 h-2 mr-1" />
                        {t('toolsInternal.bumpPhotos.localLabel')}
                      </Badge>
                    </div>
                    
                    {/* Editable Caption */}
                    {editingPhotoId === photo.id ? (
                      <div className="mt-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          placeholder={t('toolsInternal.bumpPhotos.addCaption')}
                          className="flex-1 text-xs p-1.5 border border-border rounded bg-background"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditCaption(photo.id);
                            } else if (e.key === 'Escape') {
                              setEditingPhotoId(null);
                              setEditCaption('');
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCaption(photo.id);
                          }}
                        >
                          <Check className="w-3 h-3 text-primary" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="mt-1 flex items-start gap-1 group cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPhotoId(photo.id);
                          setEditCaption(photo.caption || '');
                        }}
                      >
                        {photo.caption ? (
                          <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                            {photo.caption}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground/50 italic flex-1">
                            {t('toolsInternal.bumpPhotos.addCaption')}
                          </p>
                        )}
                        <Edit3 className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary flex-shrink-0 mt-0.5" />
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-medium text-foreground mb-1">{t('toolsInternal.bumpPhotos.noPhotos')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('toolsInternal.bumpPhotos.startDocumenting', { week: currentWeek })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* AI Analysis Panel */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/10 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      {t('toolsInternal.bumpPhotos.aiAnalysisWeek', { week: selectedPhoto.week })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => analyzePhoto(selectedPhoto)}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      {isAnalyzing ? t('toolsInternal.bumpPhotos.analyzing') : t('toolsInternal.bumpPhotos.refresh')}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPhoto.caption && (
                    <div className="mb-4 p-3 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">💬 {selectedPhoto.caption}</p>
                    </div>
                  )}
                  
                  {aiAnalysis ? (
                    <div className="bg-background/50 rounded-xl p-4">
                      <MarkdownRenderer content={aiAnalysis} />
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p>{t('toolsInternal.bumpPhotos.clickRefresh')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Timeline */}
        {photos.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {t('toolsInternal.bumpPhotos.journeyTimeline')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex overflow-x-auto gap-4 pb-2 -mx-2 px-2">
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex-shrink-0 text-center cursor-pointer transition-all ${
                      selectedPhoto?.id === photo.id ? 'scale-110' : 'hover:scale-105'
                    }`}
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setAiAnalysis(photo.ai_analysis || '');
                    }}
                  >
                    <div className={`relative ${
                      selectedPhoto?.id === photo.id ? 'ring-2 ring-primary ring-offset-2' : ''
                    } rounded-full`}>
                      <img
                        src={photo.public_url}
                        alt={`Week ${photo.week}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {photo.ai_analysis && (
                        <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                          <Sparkles className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs mt-1 font-medium">{t('toolsInternal.bumpPhotos.week')} {photo.week}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">{t('toolsInternal.bumpPhotos.photoTipsTitle')}</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                  <li>• {t('toolsInternal.bumpPhotos.photoTip1')}</li>
                  <li>• {t('toolsInternal.bumpPhotos.photoTip2')}</li>
                  <li>• {t('toolsInternal.bumpPhotos.photoTip3')}</li>
                  <li>• {t('toolsInternal.bumpPhotos.photoTip4')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {showFullscreen && selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setShowFullscreen(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setShowFullscreen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="absolute top-4 left-4 text-white">
              <Badge className="bg-white/20">{t('common.week')} {selectedPhoto.week}</Badge>
            </div>
            <img
              src={selectedPhoto.public_url}
              alt={`${t('common.week')} ${selectedPhoto.week}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ToolFrame>
  );
};

export default AIBumpPhotos;
