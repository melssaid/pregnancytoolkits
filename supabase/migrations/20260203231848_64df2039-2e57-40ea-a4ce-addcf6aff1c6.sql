-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their own bump photos metadata" ON public.bump_photos;

-- Recreate with WITH CHECK condition to prevent user_id tampering
CREATE POLICY "Users can update their own bump photos metadata" 
ON public.bump_photos 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);