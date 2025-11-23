-- Create donations table for storing all donation transactions
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT NOT NULL,
  username TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'gif', 'image', 'audio', 'video')),
  media_url TEXT,
  text TEXT,
  price DECIMAL(10, 8) NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_donations_wallet ON donations(wallet);
CREATE INDEX IF NOT EXISTS idx_donations_type ON donations(type);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_tx_hash ON donations(tx_hash);

-- Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donations table
-- Allow public to insert donations (authenticated via JWT in backend)
CREATE POLICY "Public can insert donations"
  ON donations FOR INSERT
  WITH CHECK (true);

-- Allow public read access to donations (for overlay)
CREATE POLICY "Public can read donations"
  ON donations FOR SELECT
  USING (true);

-- Create storage bucket for media files (if using Supabase Storage)
-- Note: Run this in Supabase Dashboard > Storage or via Supabase CLI
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pushme-media', 'pushme-media', true);

-- Storage policies for media bucket (run after bucket creation)
-- CREATE POLICY "Public can upload media"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'pushme-media');

-- CREATE POLICY "Public can read media"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'pushme-media');

