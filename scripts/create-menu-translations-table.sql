-- Create menu_translations table for storing AI translated menu content
CREATE TABLE IF NOT EXISTS menu_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  source_language_code VARCHAR(10) DEFAULT 'ar' NOT NULL,
  translated_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure only one translation per restaurant per language
  UNIQUE(restaurant_id, language_code)
);

-- Enable RLS
ALTER TABLE menu_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_translations
CREATE POLICY "Users can view their own menu translations" ON menu_translations
  FOR SELECT USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own menu translations" ON menu_translations
  FOR ALL USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER set_menu_translations_timestamp
BEFORE UPDATE ON menu_translations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_translations_restaurant_id ON menu_translations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_translations_language ON menu_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_menu_translations_restaurant_language ON menu_translations(restaurant_id, language_code);

-- Add comments
COMMENT ON TABLE menu_translations IS 'Stores AI-generated translations of menu content for different languages';
COMMENT ON COLUMN menu_translations.language_code IS 'Target language code (e.g., en, fr, es)';
COMMENT ON COLUMN menu_translations.source_language_code IS 'Source language code (usually ar for Arabic)';
COMMENT ON COLUMN menu_translations.translated_data IS 'JSON containing translated categories and menu items'; 