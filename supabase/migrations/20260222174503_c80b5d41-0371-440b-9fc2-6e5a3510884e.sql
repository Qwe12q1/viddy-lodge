
-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT DEFAULT 'video/mp4',
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view videos (public video hosting)
CREATE POLICY "Anyone can view videos"
  ON public.videos FOR SELECT
  USING (true);

-- Only authenticated users can upload
CREATE POLICY "Authenticated users can insert videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only owner can delete
CREATE POLICY "Owner can delete videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

-- Only owner can update
CREATE POLICY "Owner can update videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('videos', 'videos', true, 524288000, ARRAY['video/mp4', 'video/webm']);

-- Storage policies
CREATE POLICY "Anyone can view video files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Owner can delete video files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
