-- 1. Enable RLS for the Storage Bucket
-- (Make sure the bucket 'narration_custom' is already created in the UI)

-- Policy: Allow users to upload their own voice files
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

-- 2. Persistent Settings Table (Optional but recommended)
CREATE TABLE IF NOT EXISTS public.user_audio_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    custom_voice_enabled BOOLEAN DEFAULT false,
    narration_volume NUMERIC DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on settings table
ALTER TABLE public.user_audio_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own settings
CREATE POLICY "Users can view their own audio settings"
ON public.user_audio_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update their own audio settings"
ON public.user_audio_settings FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
