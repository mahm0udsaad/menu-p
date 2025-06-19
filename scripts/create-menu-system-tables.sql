-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('cafe', 'restaurant', 'both')),
  layout_config JSONB NOT NULL DEFAULT '{}',
  preview_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create menu categories table
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  dietary_info JSONB DEFAULT '[]', -- ['vegetarian', 'vegan', 'gluten-free', etc.]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create menu drafts table for real-time saving
CREATE TABLE IF NOT EXISTS menu_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  draft_data JSONB NOT NULL DEFAULT '{}',
  page_number INTEGER DEFAULT 1,
  last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(restaurant_id, page_number)
);

-- Insert default templates
INSERT INTO templates (name, description, category, layout_config, preview_image_url) VALUES
('Modern Café', 'Clean and minimalist design perfect for cafés', 'cafe', 
 '{"pages": 1, "sections": ["beverages", "pastries", "light_meals"], "style": "modern"}', 
 '/templates/modern-cafe.jpg'),
('Classic Restaurant', 'Traditional restaurant layout with multiple sections', 'restaurant', 
 '{"pages": 2, "sections": ["appetizers", "mains", "desserts", "beverages"], "style": "classic"}', 
 '/templates/classic-restaurant.jpg'),
('Bistro Combo', 'Versatile template for café-restaurant combinations', 'both', 
 '{"pages": 2, "sections": ["coffee", "breakfast", "lunch", "dinner", "desserts"], "style": "bistro"}', 
 '/templates/bistro-combo.jpg');

-- Insert default categories based on restaurant type
INSERT INTO menu_categories (restaurant_id, name, description, display_order) 
SELECT r.id, 'Beverages', 'Hot and cold drinks', 1
FROM restaurants r WHERE r.category IN ('cafe', 'both');

INSERT INTO menu_categories (restaurant_id, name, description, display_order) 
SELECT r.id, 'Pastries', 'Fresh baked goods', 2
FROM restaurants r WHERE r.category IN ('cafe', 'both');

INSERT INTO menu_categories (restaurant_id, name, description, display_order) 
SELECT r.id, 'Appetizers', 'Starters and small plates', 1
FROM restaurants r WHERE r.category IN ('restaurant', 'both');

INSERT INTO menu_categories (restaurant_id, name, description, display_order) 
SELECT r.id, 'Main Courses', 'Full meals and entrees', 2
FROM restaurants r WHERE r.category IN ('restaurant', 'both');

INSERT INTO menu_categories (restaurant_id, name, description, display_order) 
SELECT r.id, 'Desserts', 'Sweet treats and desserts', 3
FROM restaurants r WHERE r.category IN ('cafe', 'restaurant', 'both');

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates (public read)
CREATE POLICY "Anyone can view templates" ON templates FOR SELECT USING (is_active = true);

-- RLS Policies for menu_categories
CREATE POLICY "Users can view own categories" ON menu_categories
  FOR SELECT USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own categories" ON menu_categories
  FOR ALL USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- RLS Policies for menu_items
CREATE POLICY "Users can view own menu items" ON menu_items
  FOR SELECT USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own menu items" ON menu_items
  FOR ALL USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- RLS Policies for menu_drafts
CREATE POLICY "Users can manage own drafts" ON menu_drafts
  FOR ALL USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));
