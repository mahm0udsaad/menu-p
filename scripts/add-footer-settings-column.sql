-- Add footer_settings column to menu_customizations table
-- This script adds the missing footer_settings column that the application expects

-- Add footer_settings column to menu_customizations table
ALTER TABLE menu_customizations 
ADD COLUMN IF NOT EXISTS footer_settings JSONB DEFAULT '{
  "borderTop": {"enabled": false, "color": "#e5e7eb", "width": 1},
  "borderBottom": {"enabled": false, "color": "#e5e7eb", "width": 1},
  "borderLeft": {"enabled": false, "color": "#e5e7eb", "width": 1},
  "borderRight": {"enabled": false, "color": "#e5e7eb", "width": 1}
}'::jsonb;

-- Update existing records to have the footer_settings if they don't have it
UPDATE menu_customizations 
SET footer_settings = '{
  "borderTop": {"enabled": false, "color": "#e5e7eb", "width": 1},
  "borderBottom": {"enabled": false, "color": "#e5e7eb", "width": 1},
  "borderLeft": {"enabled": false, "color": "#e5e7eb", "width": 1},
  "borderRight": {"enabled": false, "color": "#e5e7eb", "width": 1}
}'::jsonb
WHERE footer_settings IS NULL;

-- Add comment to document the footer_settings column
COMMENT ON COLUMN menu_customizations.footer_settings IS 'JSON object containing footer border settings for menu customization';

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'menu_customizations' AND column_name = 'footer_settings'; 