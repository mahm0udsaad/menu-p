-- Create published_qr_cards table
CREATE TABLE IF NOT EXISTS published_qr_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  card_name VARCHAR(255) NOT NULL DEFAULT 'QR Card',
  pdf_url TEXT NOT NULL,
  qr_code_url TEXT NOT NULL, -- Store the URL that the QR code points to
  custom_text TEXT, -- Store custom text on the card
  card_options JSONB, -- Store card customization options (colors, sizes, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE published_qr_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for published_qr_cards
CREATE POLICY "Users can view their own published QR cards" ON published_qr_cards
  FOR SELECT USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own published QR cards" ON published_qr_cards
  FOR ALL USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- Add trigger to published_qr_cards table
CREATE TRIGGER set_published_qr_cards_timestamp
BEFORE UPDATE ON published_qr_cards
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 