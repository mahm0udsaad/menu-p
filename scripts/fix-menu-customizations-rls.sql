-- Fix RLS policies for menu_customizations table
-- This script allows admin access for sample restaurants and adds missing policies

-- First, check if menu_customizations table exists and has RLS enabled
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_customizations') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE menu_customizations ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own menu customizations" ON menu_customizations;
    DROP POLICY IF EXISTS "Users can manage their own menu customizations" ON menu_customizations;
    DROP POLICY IF EXISTS "Admin can manage sample customizations" ON menu_customizations;
    
    -- Create comprehensive RLS policies
    
    -- Policy for viewing customizations (users can view their own)
    CREATE POLICY "Users can view their own menu customizations" ON menu_customizations
      FOR SELECT USING (
        restaurant_id IN (
          SELECT id FROM restaurants WHERE user_id = auth.uid()
        )
      );
    
    -- Policy for managing customizations (users can manage their own)
    CREATE POLICY "Users can manage their own menu customizations" ON menu_customizations
      FOR ALL USING (
        restaurant_id IN (
          SELECT id FROM restaurants WHERE user_id = auth.uid()
        )
      );
    
    -- Policy for admin access to sample restaurants (for template generation)
    -- This allows authenticated users to create customizations for sample restaurants
    CREATE POLICY "Admin can manage sample customizations" ON menu_customizations
      FOR ALL USING (
        auth.role() = 'authenticated' 
        AND restaurant_id IN (
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000003'
        )
      );
    
    RAISE NOTICE 'Successfully updated RLS policies for menu_customizations table';
  ELSE
    RAISE NOTICE 'menu_customizations table does not exist';
  END IF;
END $$;

-- Also ensure the sample restaurants exist in the restaurants table
-- (This is for admin template generation purposes)
INSERT INTO restaurants (id, user_id, name, category, logo_url, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', NULL, 'مقهى الحبة الذهبية (Sample)', 'cafe', NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', NULL, 'مطعم الأصالة (Sample)', 'restaurant', NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', NULL, 'بيسترو المدينة (Sample)', 'both', NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  updated_at = NOW();

-- Add RLS policy for sample restaurants to allow admin access
DROP POLICY IF EXISTS "Admin can manage sample restaurants" ON restaurants;
CREATE POLICY "Admin can manage sample restaurants" ON restaurants
  FOR ALL USING (
    (auth.role() = 'authenticated' AND id IN (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000003'
    )) OR user_id = auth.uid()
  );

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'menu_customizations'
ORDER BY policyname; 