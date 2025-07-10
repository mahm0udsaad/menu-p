-- Create menu translations table for storing AI translated versions
CREATE TABLE IF NOT EXISTS menu_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  source_language_code VARCHAR(10) DEFAULT 'ar',
  translated_data JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(restaurant_id, language_code)
);

-- Enable RLS for menu_translations
ALTER TABLE menu_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_translations
CREATE POLICY "Users can manage own translations" ON menu_translations
  FOR ALL USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_menu_translations_restaurant_language 
ON menu_translations(restaurant_id, language_code);

-- Create function to upsert translation
CREATE OR REPLACE FUNCTION upsert_menu_translation(
  p_restaurant_id UUID,
  p_language_code VARCHAR(10),
  p_source_language_code VARCHAR(10),
  p_translated_data JSONB
) RETURNS UUID AS $$
DECLARE
  translation_id UUID;
BEGIN
  INSERT INTO menu_translations (restaurant_id, language_code, source_language_code, translated_data)
  VALUES (p_restaurant_id, p_language_code, p_source_language_code, p_translated_data)
  ON CONFLICT (restaurant_id, language_code) 
  DO UPDATE SET 
    translated_data = p_translated_data,
    source_language_code = p_source_language_code,
    updated_at = NOW()
  RETURNING id INTO translation_id;
  
  RETURN translation_id;
END;
$$ LANGUAGE plpgsql; 