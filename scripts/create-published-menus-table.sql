-- Create published_menus table
CREATE TABLE IF NOT EXISTS published_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  menu_name VARCHAR(255) NOT NULL DEFAULT 'My Menu',
  pdf_url TEXT NOT NULL,
  -- qr_code_data TEXT, -- Store data for QR, or generate on the fly
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE published_menus ENABLE ROW LEVEL SECURITY;

-- RLS Policies for published_menus
CREATE POLICY "Users can view their own published menus" ON published_menus
  FOR SELECT USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own published menus" ON published_menus
  FOR ALL USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- Add a function to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to published_menus table
CREATE TRIGGER set_published_menus_timestamp
BEFORE UPDATE ON published_menus
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add trigger to restaurants table (if not already existing from other scripts)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_restaurants_timestamp') THEN
    CREATE TRIGGER set_restaurants_timestamp
    BEFORE UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END
$$;

-- Add trigger to menu_categories table (if not already existing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_menu_categories_timestamp') THEN
    CREATE TRIGGER set_menu_categories_timestamp
    BEFORE UPDATE ON menu_categories
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END
$$;

-- Add trigger to menu_items table (if not already existing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_menu_items_timestamp') THEN
    CREATE TRIGGER set_menu_items_timestamp
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END
$$;
