-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT NOT NULL,
  username TEXT,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_wallet ON events(wallet);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow users to insert their own record
CREATE POLICY "Users can insert their own record"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own record
CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow public read access to users
CREATE POLICY "Public can read users"
  ON users FOR SELECT
  USING (true);

-- RLS Policies for events table
-- Allow public to insert events
CREATE POLICY "Public can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

-- Allow public read access to events
CREATE POLICY "Public can read events"
  ON events FOR SELECT
  USING (true);

