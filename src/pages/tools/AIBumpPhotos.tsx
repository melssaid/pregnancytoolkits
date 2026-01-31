import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Trash2, Download, Sparkles, ChevronLeft, ChevronRight, Loader2, Image, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { BumpPhotoService, UserProfileService, AIService } from '@/services/localStorageServices';

interface BumpPhoto {
  id: string;
  user_id: string;
  week: number;
  public_url: string;
  storage_path: string;
  caption: string | null;
  ai_analysis: string | null;
  created_at: string;
  updated_at: string;
}

const AIBumpPhotos: React.FC = () => {
  const [photos, setPhotos] = useState<BumpPhoto[]>([]);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<BumpPhoto | null>(null);
  const [caption, setCaption] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const profile = await UserProfileService.get();
      if (profile?.pregnancy_week) {
        setCurrentWeek(profile.pregnancy_week);
      }
      
      const loadedPhotos = await BumpPhotoService.getAll();
      setPhotos(loadedPhotos);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: 'خطأ في التحميل',
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
        title: 'خطأ',
        description: 'يرجى اختيار ملف صورة',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'خطأ',
        description: 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const newPhoto = await BumpPhotoService.upload(file, currentWeek, caption);
      
      setPhotos(prev => [...prev, newPhoto]);
      setCaption('');
      
      toast({
        title: 'تم الرفع بنجاح! ✨',
        description: `تمت إضافة صورة الأسبوع ${currentWeek}`
      });

      analyzePhoto(newPhoto);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'فشل الرفع',
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

  const analyzePhoto = async (photo: BumpPhoto) => {
    try {
      setIsAnalyzing(true);
      setSelectedPhoto(photo);
      
      const previousPhoto = photos.find(p => p.week < photo.week);
      
      const response = await AIService.analyzeBumpProgress(
        photo.week,
        previousPhoto?.week
      );
      
      setAiAnalysis(response.content);
      
      await BumpPhotoService.updateAnalysis(photo.id, response.content);
      
      setPhotos(prev => prev.map(p => 
        p.id === photo.id ? { ...p, ai_analysis: response.content } : p
      ));
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: 'فشل التحليل',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (photo: BumpPhoto) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذه الصورة؟')) return;

    try {
      await BumpPhotoService.delete(photo.id, photo.storage_path);
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      
      if (selectedPhoto?.id === photo.id) {
        setSelectedPhoto(null);
        setAiAnalysis('');
      }
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الصورة بنجاح'
      });
    } catch (error: any) {
      toast({
        title: 'فشل الحذف',
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الصور...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          رجوع
        </Button>

        {/* Header */}
        <Card className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Camera className="w-8 h-8" />
              📸 ألبوم صور البطن
            </CardTitle>
            <p className="text-pink-100">
              وثّقي رحلة حملك أسبوعاً بأسبوع مع تحليل AI ذكي
            </p>
          </CardHeader>
        </Card>

        {/* Disclaimer */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-center">
          <p className="text-amber-800 font-medium">
            ⚠️ صورك محفوظة بأمان في السحابة. لا نشارك بياناتك مع أي طرف ثالث.
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  📅 الأسبوع الحالي
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentWeek(w => Math.max(1, w - 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <span className="text-3xl font-bold text-purple-600 min-w-[60px] text-center">
                    {currentWeek}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentWeek(w => Math.min(42, w + 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
                
                <Textarea
                  placeholder="أضيفي تعليقاً على الصورة (اختياري)..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-pink-300 rounded-xl p-6 bg-pink-50/50 hover:bg-pink-100/50 transition-colors cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
                {isUploading ? (
                  <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 text-pink-500" />
                )}
                <span className="text-pink-600 font-medium mt-3">
                  {isUploading ? 'جاري الرفع...' : 'اضغطي لرفع صورة'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  الحد الأقصى: 5 ميجابايت
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card
                key={photo.id}
                className={`overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                  selectedPhoto?.id === photo.id ? 'ring-4 ring-purple-500' : ''
                }`}
                onClick={() => {
                  setSelectedPhoto(photo);
                  setAiAnalysis(photo.ai_analysis || '');
                }}
              >
                <div className="relative aspect-square">
                  <img
                    src={photo.public_url}
                    alt={`Week ${photo.week}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    أسبوع {photo.week}
                  </div>
                  {photo.ai_analysis && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="p-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(photo.created_at).toLocaleDateString('ar-SA')}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(photo);
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">لم تضيفي أي صور بعد</p>
            <p className="text-sm">ابدئي بتوثيق رحلة حملك الآن!</p>
          </div>
        )}

        {/* AI Analysis Panel */}
        {selectedPhoto && (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  تحليل AI - الأسبوع {selectedPhoto.week}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => analyzePhoto(selectedPhoto)}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 ml-2" />
                  )}
                  {isAnalyzing ? 'جاري التحليل...' : 'تحليل جديد'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPhoto.caption && (
                <div className="mb-4 p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">💬 {selectedPhoto.caption}</p>
                </div>
              )}
              
              {aiAnalysis ? (
                <div className="prose prose-pink max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-white p-4 rounded-lg">
                    {aiAnalysis}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>اضغطي "تحليل جديد" للحصول على نصائح مخصصة</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress Timeline */}
        {photos.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                📊 تطور رحلتك
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex overflow-x-auto gap-4 pb-2">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex-shrink-0 text-center cursor-pointer"
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setAiAnalysis(photo.ai_analysis || '');
                    }}
                  >
                    <img
                      src={photo.public_url}
                      alt={`Week ${photo.week}`}
                      className={`w-16 h-16 rounded-full object-cover border-2 transition-all ${
                        selectedPhoto?.id === photo.id ? 'border-purple-500 scale-110' : 'border-purple-300'
                      }`}
                    />
                    <p className="text-xs mt-1 font-medium">أسبوع {photo.week}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIBumpPhotos;
