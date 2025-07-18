-- Create the storage bucket for menu PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('menu-pdfs', 'menu-pdfs', true, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies for the new bucket

-- 1. Allow public read access to all files in the 'menu-pdfs' bucket
CREATE POLICY "Public read access for menu-pdfs"
ON storage.objects FOR SELECT
USING ( bucket_id = 'menu-pdfs' );

-- 2. Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to menu-pdfs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'menu-pdfs' );

-- 3. Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates to menu-pdfs"
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = owner );

-- 4. Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes from menu-pdfs"
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = owner );

-- Add a comment to confirm script execution
COMMENT ON BUCKET "menu-pdfs" IS 'Bucket for storing generated menu PDFs. Created and configured by AI assistant script.';

SELECT 'Successfully created menu-pdfs bucket and policies.' as result; 