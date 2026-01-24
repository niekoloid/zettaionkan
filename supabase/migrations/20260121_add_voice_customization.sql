-- 1. Enable RLS for the Storage Bucket
-- (Make sure the bucket 'narration_custom' is already created in the UI)

-- Policy: Allow users to upload their own narration files
CREATE POLICY "Users can upload their own narration files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'narration_custom' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own voice files
-- Note: If getPublicUrl is used, the bucket should be set to "Public" in Supabase Dashboard.
-- If private, use this policy for authenticated users:
CREATE POLICY "Users can view their own narration files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'narration_custom' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own voice files
CREATE POLICY "Users can delete their own narration files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'narration_custom' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
