-- Create table for storing generated menu PDFs with template support
CREATE TABLE IF NOT EXISTS menu_pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL DEFAULT 'classic',
  pdf_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  language TEXT DEFAULT 'ar',
  customizations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_pdfs_menu_id ON menu_pdfs(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_pdfs_template_id ON menu_pdfs(template_id);
CREATE INDEX IF NOT EXISTS idx_menu_pdfs_created_at ON menu_pdfs(created_at);
CREATE INDEX IF NOT EXISTS idx_menu_pdfs_menu_template ON menu_pdfs(menu_id, template_id);

-- Enable RLS (Row Level Security)
ALTER TABLE menu_pdfs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for reading menu PDFs (anyone can read if they have the menu_id)
CREATE POLICY "Allow read access to menu PDFs" ON menu_pdfs
  FOR SELECT
  USING (true);

-- Policy for inserting menu PDFs (authenticated users only)
CREATE POLICY "Allow authenticated users to create menu PDFs" ON menu_pdfs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating menu PDFs (only owners)
CREATE POLICY "Allow owners to update their menu PDFs" ON menu_pdfs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menu_pdfs.menu_id 
      AND restaurants.user_id = auth.uid()
    )
  );

-- Policy for deleting menu PDFs (only owners)
CREATE POLICY "Allow owners to delete their menu PDFs" ON menu_pdfs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menu_pdfs.menu_id 
      AND restaurants.user_id = auth.uid()
    )
  );

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_menu_pdfs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_menu_pdfs_updated_at
  BEFORE UPDATE ON menu_pdfs
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_pdfs_updated_at();

-- Add some helpful comments
COMMENT ON TABLE menu_pdfs IS 'Stores generated PDF files for menus with template support';
COMMENT ON COLUMN menu_pdfs.template_id IS 'Template used for PDF generation (classic, modern, painting, vintage)';
COMMENT ON COLUMN menu_pdfs.customizations IS 'JSON object containing font, color, and layout customizations';
COMMENT ON COLUMN menu_pdfs.file_size IS 'Size of the PDF file in bytes';

-- Create a view for easy PDF retrieval with restaurant info
CREATE OR REPLACE VIEW menu_pdfs_with_restaurant AS
SELECT 
  mp.*,
  r.name as restaurant_name,
  r.category as restaurant_category,
  r.user_id as restaurant_owner_id
FROM menu_pdfs mp
JOIN restaurants r ON r.id = mp.menu_id;

COMMENT ON VIEW menu_pdfs_with_restaurant IS 'View combining menu PDF data with restaurant information'; 