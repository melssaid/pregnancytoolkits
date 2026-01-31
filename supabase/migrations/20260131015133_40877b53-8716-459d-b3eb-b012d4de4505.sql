-- Make bump-photos bucket private to prevent public access
UPDATE storage.buckets 
SET public = false 
WHERE id = 'bump-photos';

-- Remove the public read policy that exposes all photos
DROP POLICY IF EXISTS "Public read access for bump photos" ON storage.objects;