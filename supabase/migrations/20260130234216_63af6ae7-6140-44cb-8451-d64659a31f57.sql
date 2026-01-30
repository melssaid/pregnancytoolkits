-- Create function to update timestamps if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create storage bucket for bump photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('bump-photos', 'bump-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own bump photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'bump-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view their own photos
CREATE POLICY "Users can view their own bump photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'bump-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own bump photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'bump-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access for sharing
CREATE POLICY "Public read access for bump photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'bump-photos');

-- Create table to store photo metadata
CREATE TABLE public.bump_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week INTEGER NOT NULL CHECK (week >= 1 AND week <= 42),
  caption TEXT,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bump_photos ENABLE ROW LEVEL SECURITY;

-- Users can view only their own photos
CREATE POLICY "Users can view their own bump photos metadata"
ON public.bump_photos
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own photos
CREATE POLICY "Users can insert their own bump photos metadata"
ON public.bump_photos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own photos
CREATE POLICY "Users can update their own bump photos metadata"
ON public.bump_photos
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete their own bump photos metadata"
ON public.bump_photos
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_bump_photos_updated_at
BEFORE UPDATE ON public.bump_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_bump_photos_user_week ON public.bump_photos(user_id, week);