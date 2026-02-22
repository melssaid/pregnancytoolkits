CREATE POLICY "Users can update their own bump photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'bump-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'bump-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);