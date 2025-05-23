
-- Create a storage bucket for secure files
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'secure_files',
  'secure_files',
  false,  -- not public by default for security
  false,
  52428800, -- 50MB limit
  '{image/png,image/jpeg,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,text/plain}'
);

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'secure_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to read their own files
CREATE POLICY "Allow users to read their own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'secure_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to update their own files
CREATE POLICY "Allow users to update their own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'secure_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'secure_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow anyone to read shared files (needed for file sharing)
CREATE POLICY "Allow anyone to read shared files"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'secure_files' AND EXISTS (
    SELECT 1 FROM public.file_shares s
    JOIN public.files f ON s.file_id = f.id
    WHERE f.storage_path = name
      AND s.expires_at > now()
  ));
