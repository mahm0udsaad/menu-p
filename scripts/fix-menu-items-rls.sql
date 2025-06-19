-- Fix RLS policy for menu_items table to allow users to insert items in their own restaurants
-- This allows the dummy data loading to work properly

-- First, check current policies (for reference)
-- SELECT * FROM pg_policies WHERE tablename = 'menu_items';

-- Enable RLS if not already enabled
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view menu items for their restaurants" ON menu_items;
DROP POLICY IF EXISTS "Users can insert menu items for their restaurants" ON menu_items;
DROP POLICY IF EXISTS "Users can update menu items for their restaurants" ON menu_items;
DROP POLICY IF EXISTS "Users can delete menu items for their restaurants" ON menu_items;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view menu items for their restaurants" ON menu_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM menu_categories mc
      JOIN restaurants r ON mc.restaurant_id = r.id
      WHERE mc.id = menu_items.category_id
      AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert menu items for their restaurants" ON menu_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM menu_categories mc
      JOIN restaurants r ON mc.restaurant_id = r.id
      WHERE mc.id = menu_items.category_id
      AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update menu items for their restaurants" ON menu_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM menu_categories mc
      JOIN restaurants r ON mc.restaurant_id = r.id
      WHERE mc.id = menu_items.category_id
      AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete menu items for their restaurants" ON menu_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM menu_categories mc
      JOIN restaurants r ON mc.restaurant_id = r.id
      WHERE mc.id = menu_items.category_id
      AND r.owner_id = auth.uid()
    )
  );

-- Also ensure menu_categories has proper RLS policies
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

-- Check if menu_categories policies exist, if not create them
DROP POLICY IF EXISTS "Users can view categories for their restaurants" ON menu_categories;
DROP POLICY IF EXISTS "Users can insert categories for their restaurants" ON menu_categories;
DROP POLICY IF EXISTS "Users can update categories for their restaurants" ON menu_categories;
DROP POLICY IF EXISTS "Users can delete categories for their restaurants" ON menu_categories;

CREATE POLICY "Users can view categories for their restaurants" ON menu_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = menu_categories.restaurant_id
      AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert categories for their restaurants" ON menu_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = menu_categories.restaurant_id
      AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update categories for their restaurants" ON menu_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = menu_categories.restaurant_id
      AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete categories for their restaurants" ON menu_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM restaurants r
      WHERE r.id = menu_categories.restaurant_id
      AND r.owner_id = auth.uid()
    )
  ); 