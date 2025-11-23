# 🔧 Database Fix - Missing `updated_at` Column

## Problem

Backend is trying to create/update users but fails with:
```
Could not find the 'updated_at' column of 'users' in the schema cache
Error code: PGRST204
```

## Solution

The `users` table is missing the `updated_at` column that the backend expects.

## Fix Options

### Option 1: Run Migration 003 (Recommended)

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Add updated_at column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a function to automatically update updated_at on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at when row is updated
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set initial updated_at value for existing rows
UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;
```

### Option 2: Recreate Table (If no data to preserve)

If you don't have important data, you can drop and recreate:

```sql
-- Drop existing table (WARNING: Deletes all data!)
DROP TABLE IF EXISTS users CASCADE;

-- Recreate with updated_at
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX idx_users_wallet ON users(wallet);

-- Recreate RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own record"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read users"
  ON users FOR SELECT
  USING (true);
```

## Steps to Apply Fix

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click **SQL Editor** in the left sidebar

2. **Run Migration 003**
   - Copy the SQL from `supabase/migrations/003_add_updated_at.sql`
   - Paste into SQL Editor
   - Click **Run**

3. **Verify**
   - Go to **Table Editor** → `users` table
   - Check that `updated_at` column exists
   - Should see both `created_at` and `updated_at` columns

4. **Test Authentication**
   - Try connecting wallet again
   - Should now successfully create user

## Expected Result

After applying the fix:
- ✅ `users` table has `updated_at` column
- ✅ Backend can create users successfully
- ✅ Authentication flow completes
- ✅ Username can be set and saved

## Verification Query

Run this to verify the column exists:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

Should show:
- `id` (uuid)
- `wallet` (text)
- `username` (text)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone) ← **This should exist now**

---

**After applying this fix, try connecting your wallet again!** 🚀

