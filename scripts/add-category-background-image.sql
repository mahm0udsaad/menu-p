-- Add background_image_url column to menu_categories table
ALTER TABLE menu_categories 
ADD COLUMN IF NOT EXISTS background_image_url TEXT; 