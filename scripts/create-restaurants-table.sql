-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('cafe', 'restaurant', 'both')),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own restaurants
CREATE POLICY "Users can view own restaurants" ON restaurants
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own restaurants
CREATE POLICY "Users can insert own restaurants" ON restaurants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own restaurants
CREATE POLICY "Users can update own restaurants" ON restaurants
  FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for restaurant logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('restaurant-logos', 'restaurant-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can view restaurant logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'restaurant-logos');

CREATE POLICY "Authenticated users can upload restaurant logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'restaurant-logos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own restaurant logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'restaurant-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
