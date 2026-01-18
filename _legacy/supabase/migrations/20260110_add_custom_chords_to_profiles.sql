-- profiles デーブルにカスタム和音設定を保存するカラムを追加
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_chords JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS naming_convention TEXT DEFAULT 'italian',
ADD COLUMN IF NOT EXISTS preferred_instrument TEXT DEFAULT 'yamaha',
ADD COLUMN IF NOT EXISTS color_format TEXT DEFAULT 'standard';

-- 既存のRLSポリシーで profiles の更新が許可されているか確認（Auth UID に一致する場合）
-- 既に存在する場合はエラーになるが、念のため
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;
