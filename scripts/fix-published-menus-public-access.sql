-- Fix published_menus table to allow public access
-- This allows published menus to be viewed by anyone without authentication

-- Add public read policy for published_menus
-- This policy allows anyone to view published menus (no authentication required)
CREATE POLICY "Anyone can view published menus" ON published_menus
  FOR SELECT USING (true);

-- Note: The existing policies for authenticated users remain intact:
-- - "Users can view their own published menus" (for authenticated users)
-- - "Users can manage their own published menus" (for CRUD operations by owners)

-- The new policy has the highest precedence for SELECT operations,
-- allowing public access while preserving owner management rights 