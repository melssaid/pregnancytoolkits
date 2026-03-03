import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { compressImage } from '@/lib/imageCompression';

export interface BumpPhoto {
  id: string;
  week: number;
  caption: string;
  image_ref: string;
  storage_path: string;
  ai_analysis?: string;
  created_at: string;
  updated_at: string;
}

interface UseBumpPhotosStorageReturn {
  photos: BumpPhoto[];
  isLoading: boolean;
  isUploading: boolean;
  uploadPhoto: (file: File, week: number, caption: string) => Promise<BumpPhoto | null>;
  deletePhoto: (photo: BumpPhoto) => Promise<boolean>;
  updatePhotoCaption: (id: string, caption: string) => Promise<boolean>;
  updatePhotoAnalysis: (id: string, analysis: string) => Promise<boolean>;
  refreshPhotos: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useBumpPhotosStorage(): UseBumpPhotosStorageReturn {
  const [photos, setPhotos] = useState<BumpPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setUserId(user?.id || null);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session?.user);
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch photos from Supabase
  const refreshPhotos = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setPhotos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bump_photos')
        .select('*')
        .order('week', { ascending: true });

      if (error) throw error;
      
      // Regenerate signed URLs on-demand (stored URLs may have expired)
      const photosWithFreshUrls = await Promise.all(
        (data || []).map(async (photo) => {
          if (photo.storage_path && !photo.storage_path.startsWith('local')) {
            try {
              const { data: urlData, error: urlError } = await supabase.storage
                .from('bump-photos')
                .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry
              if (!urlError && urlData) {
                return { ...photo, image_ref: urlData.signedUrl };
              }
            } catch {
              // Fall back to stored URL
            }
          }
          return photo;
        })
      );
      
      setPhotos(photosWithFreshUrls);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshPhotos();
    } else {
      setPhotos([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshPhotos]);

  // Upload a new photo
  const uploadPhoto = async (
    file: File,
    week: number,
    caption: string
  ): Promise<BumpPhoto | null> => {
    if (!userId) {
      toast.error('Please sign in to save photos');
      return null;
    }

    setIsUploading(true);
    try {
      // Read and compress image
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const compressedDataUrl = await compressImage(dataUrl, 800, 1000, 0.7);
      
      // Convert base64 to blob
      const response = await fetch(compressedDataUrl);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = 'jpg';
      const fileName = `${userId}/${Date.now()}_week${week}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('bump-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get signed URL for immediate display (bucket is private)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('bump-photos')
        .createSignedUrl(fileName, 3600); // 1 hour expiry for display

      if (urlError) throw urlError;

      // Store only the storage path reference in DB - never store signed URLs permanently
      const { data: photoData, error: dbError } = await supabase
        .from('bump_photos')
        .insert({
          user_id: userId,
          week,
          caption: caption || `Week ${week} bump photo`,
          storage_path: fileName,
          image_ref: fileName // Store path reference, not a URL
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Use the fresh signed URL for immediate display
      const displayPhoto = { ...photoData, image_ref: urlData.signedUrl };

      if (dbError) throw dbError;

      setPhotos(prev => [...prev, displayPhoto].sort((a, b) => a.week - b.week));
      toast.success('Photo saved to cloud! ☁️');
      return displayPhoto;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Delete a photo
  const deletePhoto = async (photo: BumpPhoto): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('bump-photos')
        .remove([photo.storage_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      // Delete metadata from database
      const { error: dbError } = await supabase
        .from('bump_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      toast.success('Photo deleted');
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
      return false;
    }
  };

  // Update photo caption
  const updatePhotoCaption = async (id: string, caption: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('bump_photos')
        .update({ caption })
        .eq('id', id);

      if (error) throw error;

      setPhotos(prev => prev.map(p => 
        p.id === id ? { ...p, caption } : p
      ));
      return true;
    } catch (error) {
      console.error('Error updating caption:', error);
      toast.error('Failed to update caption');
      return false;
    }
  };

  // Update photo AI analysis
  const updatePhotoAnalysis = async (id: string, analysis: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('bump_photos')
        .update({ ai_analysis: analysis })
        .eq('id', id);

      if (error) throw error;

      setPhotos(prev => prev.map(p => 
        p.id === id ? { ...p, ai_analysis: analysis } : p
      ));
      return true;
    } catch (error) {
      console.error('Error updating analysis:', error);
      return false;
    }
  };

  return {
    photos,
    isLoading,
    isUploading,
    uploadPhoto,
    deletePhoto,
    updatePhotoCaption,
    updatePhotoAnalysis,
    refreshPhotos,
    isAuthenticated
  };
}
