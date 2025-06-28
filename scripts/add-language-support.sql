-- Add language support to published_menus table
-- This script adds language column and font settings for multi-language support

-- Add language column to published_menus table
ALTER TABLE published_menus 
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'ar';

-- Add font settings column for custom typography
ALTER TABLE published_menus 
ADD COLUMN IF NOT EXISTS font_settings JSONB DEFAULT '{
  "primaryFont": "cairo",
  "secondaryFont": "open-sans", 
  "fontSize": 16,
  "lineHeight": 1.6,
  "fontWeight": "400",
  "textAlign": "right",
  "letterSpacing": 0,
  "enableCustomFonts": true
}'::jsonb;

-- Add index on language column for better query performance
CREATE INDEX IF NOT EXISTS idx_published_menus_language ON published_menus(language);

-- Add index on restaurant_id and menu_name for language group queries
CREATE INDEX IF NOT EXISTS idx_published_menus_restaurant_menu_name ON published_menus(restaurant_id, menu_name);

-- Update existing menus to have default language if null
UPDATE published_menus 
SET language = 'ar' 
WHERE language IS NULL;

-- Create a view for easy access to menu language versions
CREATE OR REPLACE VIEW menu_language_versions AS
SELECT 
  pm.id,
  pm.menu_name,
  pm.language,
  pm.restaurant_id,
  pm.created_at,
  pm.font_settings,
  r.name as restaurant_name,
  COUNT(mc.id) as category_count,
  COUNT(mi.id) as item_count
FROM published_menus pm
LEFT JOIN restaurants r ON pm.restaurant_id = r.id
LEFT JOIN menu_categories mc ON pm.id = mc.menu_id
LEFT JOIN menu_items mi ON mc.id = mi.category_id
GROUP BY pm.id, pm.menu_name, pm.language, pm.restaurant_id, pm.created_at, pm.font_settings, r.name
ORDER BY pm.restaurant_id, pm.menu_name, pm.created_at DESC;

-- Add comment to document the language codes
COMMENT ON COLUMN published_menus.language IS 'Language code: ar (Arabic), en (English)';
COMMENT ON COLUMN published_menus.font_settings IS 'JSON object containing font configuration for the menu';

-- Create function to get menu language versions
CREATE OR REPLACE FUNCTION get_menu_language_versions(input_menu_id UUID)
RETURNS TABLE (
  id UUID,
  menu_name VARCHAR,
  language VARCHAR,
  restaurant_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  font_settings JSONB,
  item_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    pm.id,
    pm.menu_name,
    pm.language,
    pm.restaurant_id,
    pm.created_at,
    pm.font_settings,
    mlv.item_count
  FROM published_menus pm
  JOIN menu_language_versions mlv ON pm.id = mlv.id
  WHERE pm.restaurant_id = (
    SELECT restaurant_id FROM published_menus WHERE published_menus.id = input_menu_id
  )
  AND pm.menu_name = (
    SELECT menu_name FROM published_menus WHERE published_menus.id = input_menu_id
  )
  ORDER BY pm.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if menu has multiple language versions
CREATE OR REPLACE FUNCTION has_multiple_languages(input_menu_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  version_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO version_count
  FROM get_menu_language_versions(input_menu_id);
  
  RETURN version_count > 1;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for language-specific access
-- Allow users to see all language versions of their restaurant's menus
CREATE POLICY "Users can view all language versions of their menus" ON published_menus
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Example data for testing (uncomment to use)
-- INSERT INTO published_menus (restaurant_id, menu_name, language, font_settings)
-- SELECT 
--   id,
--   'Sample Menu',
--   'en',
--   '{"primaryFont": "open-sans", "secondaryFont": "roboto", "fontSize": 16, "textAlign": "left"}'::jsonb
-- FROM restaurants 
-- WHERE user_id = auth.uid()
-- LIMIT 1; 