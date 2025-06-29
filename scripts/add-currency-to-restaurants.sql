-- Add currency column to restaurants table
-- This migration adds currency support to the restaurants table

-- Add currency column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EGP' CHECK (currency IN ('EGP', 'SAR', 'AED', 'USD', 'EUR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP'));

-- Add address and phone columns if they don't exist (for completeness)
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add index for better query performance on currency
CREATE INDEX IF NOT EXISTS idx_restaurants_currency ON restaurants(currency);

-- Update existing restaurants to have default currency if null
UPDATE restaurants 
SET currency = 'EGP' 
WHERE currency IS NULL;

-- Add comments to document the fields
COMMENT ON COLUMN restaurants.currency IS 'Three-letter currency code: EGP, SAR, AED, USD, EUR, QAR, KWD, BHD, OMR, JOD, LBP';
COMMENT ON COLUMN restaurants.address IS 'Restaurant physical address';
COMMENT ON COLUMN restaurants.phone IS 'Restaurant contact phone number';
COMMENT ON COLUMN restaurants.email IS 'Restaurant contact email';

-- Optional: Add color_palette column for storing theme colors (JSONB for flexibility)
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS color_palette JSONB DEFAULT NULL;

COMMENT ON COLUMN restaurants.color_palette IS 'JSON object containing restaurant theme colors and branding preferences'; 