import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Trash2, Image, Heart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useAnalytics } from "@/hooks/useAnalytics";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { compressImage, formatBytes, estimateDataUrlSize } from "@/lib/imageCompression";
import { toast } from "sonner";

interface BumpPhoto {
  id: string;
  week: number;
  date: string;
  imageData: string;
  note?: string;
}

const STORAGE_KEY = "bump-photos-data";

// Validator for bump photos
const isBumpPhotoArray = (data: unknown): data is BumpPhoto[] => {
  return Array.isArray(data) && data.every(item =>
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'week' in item &&
    'date' in item &&
    'imageData' in item
  );
};

const BumpPhotos = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics("bump-photos");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);
  
  const [photos, setPhotos] = useState<BumpPhoto[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(12);
  const [note, setNote] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<BumpPhoto | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    const saved = safeParseLocalStorage<BumpPhoto[]>(
      STORAGE_KEY,
      [],
      isBumpPhotoArray
    );
    setPhotos(saved);
    isInitialized.current = true;
  }, []);

  const savePhotos = (newPhotos: BumpPhoto[]) => {
    setPhotos(newPhotos);
    if (isInitialized.current) {
      const success = safeSaveToLocalStorage(STORAGE_KEY, newPhotos);
      if (!success) {
        toast.error('Failed to save photos. Storage may be full.');
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const originalData = reader.result as string;
          const originalSize = estimateDataUrlSize(originalData);
          
          // Compress the image
          const compressedData = await compressImage(originalData, 800, 1000, 0.7);
          const compressedSize = estimateDataUrlSize(compressedData);
          
          console.log(`Image compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)}`);
          
          const newPhoto: BumpPhoto = {
            id: Date.now().toString(),
            week: currentWeek,
            date: new Date().toISOString(),
            imageData: compressedData,
            note: note || undefined,
          };
          
          const newPhotos = [newPhoto, ...photos].sort((a, b) => b.week - a.week);
          savePhotos(newPhotos);
          setNote("");
          trackAction("photo_added", { week: currentWeek });
          toast.success('Photo added successfully!');
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
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deletePhoto = (id: string) => {
    const newPhotos = photos.filter(p => p.id !== id);
    savePhotos(newPhotos);
    setSelectedPhoto(null);
    trackAction("photo_deleted");
    toast.success('Photo deleted');
  };

  const weekOptions = Array.from({ length: 32 }, (_, i) => i + 8);

  return (
    <ToolFrame
      title={t('tools.bumpPhotos.title')}
      subtitle={t('tools.bumpPhotos.description')}
      icon={Camera}
      mood="joyful"
      toolId="bump-photos"
    >
      <div className="space-y-6">
        {/* Add Photo Section */}
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-pink-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  size="lg"
                  className="rounded-full px-8 py-6 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-400"
                >
                  {isCompressing ? (
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 mr-2" />
                  )}
                  {isCompressing ? 'Processing...' : 'Take New Photo'}
                </Button>
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Week:</span>
                  <select
                    value={currentWeek}
                    onChange={(e) => setCurrentWeek(Number(e.target.value))}
                    className="rounded-lg border border-input bg-background px-3 py-2"
                  >
                    {weekOptions.map(week => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                  </select>
                </div>
                <Input
                  placeholder="Add a note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                    <img
                      src={photo.imageData}
                      alt={`Week ${photo.week}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <p className="text-sm font-bold text-primary">Week {photo.week}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(photo.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="bg-muted/30">
            <CardContent className="py-12 text-center">
              <Image className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Start Your Bump Album</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Document your beautiful pregnancy journey by taking a photo each week to track your growing belly
              </p>
            </CardContent>
          </Card>
        )}

        {/* Photo Viewer Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedPhoto.imageData}
                  alt={`Week ${selectedPhoto.week}`}
                  className="w-full rounded-2xl"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-primary">Week {selectedPhoto.week}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedPhoto.date), "MMMM d, yyyy")}
                    </p>
                    {selectedPhoto.note && (
                      <p className="text-sm mt-1">{selectedPhoto.note}</p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePhoto(selectedPhoto.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Heart className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-pink-900">Tips for Better Photos</p>
                <p className="text-sm text-pink-700 mt-1">
                  Take photos in the same spot and pose each week for a beautiful comparison of your growing bump
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Info */}
        {photos.length > 0 && (
          <div className="text-center text-xs text-muted-foreground">
            📷 {photos.length} photos stored locally on your device
          </div>
        )}
      </div>
    </ToolFrame>
  );
};

export default BumpPhotos;
