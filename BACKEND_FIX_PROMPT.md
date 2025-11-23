# 🔧 Backend Fix Prompt for PressMe.xyz

## Current Issues to Fix

1. **Missing `donations` table** - Backend is trying to query `public.donations` but table doesn't exist
2. **Console logging** - Need proper logging for all API endpoints and overlay polling
3. **Overlay endpoint** - `/overlay/recent` should work with polling (not WebSockets)
4. **Media storage** - Need to integrate Supabase Storage for images, GIFs, and audio
5. **Database queries** - Fix all Supabase queries to use correct table names and handle errors

---

## Step 1: Create Donations Table in Supabase

Run this SQL migration in your Supabase Dashboard:

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Paste the SQL from `supabase/migrations/002_donations_table.sql`
4. Execute

**OR** if you have Supabase CLI:
```bash
supabase db push
```

---

## Step 2: Fix Backend Code

### 2.1 Fix Overlay Recent Endpoint

**File:** `src/routes/overlay.ts` (or wherever overlay routes are)

**Current Issue:** Querying `donations` table that doesn't exist, and error handling is poor.

**Fix:**
```typescript
import { Router } from 'express';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

const router = Router();

// GET /overlay/recent - Get recent donations for overlay polling
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    logger.info(`[OVERLAY] GET /overlay/recent - limit: ${limit}`);

    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(`[OVERLAY] Error fetching recent donations:`, error);
      return res.status(500).json({ 
        error: 'Failed to fetch donations',
        details: error.message 
      });
    }

    // Transform data to match frontend expectations
    const donations = (data || []).map((donation) => ({
      id: donation.id,
      wallet: donation.wallet,
      username: donation.username,
      type: donation.type,
      media_url: donation.media_url,
      text: donation.text,
      price: parseFloat(donation.price),
      tx_hash: donation.tx_hash,
      created_at: donation.created_at,
    }));

    logger.info(`[OVERLAY] Returning ${donations.length} donations`);

    res.json({ donations });
  } catch (error: any) {
    logger.error(`[OVERLAY] Unexpected error:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// GET /overlay/health - Health check
router.get('/health', async (req, res) => {
  logger.info('[OVERLAY] Health check requested');
  res.json({ 
    status: 'ok',
    timestamp: Date.now() 
  });
});

export default router;
```

### 2.2 Fix Donation Route

**File:** `src/routes/donate.ts` (or wherever donation routes are)

**Current Issue:** Need to properly save donations to database and handle media uploads.

**Fix:**
```typescript
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { verifyPayment } from '../services/paymentService';
import { processMedia } from '../services/mediaService';
import logger from '../utils/logger';

const router = Router();

// POST /donate - Submit a donation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, content, username, wallet, txHash, metadata } = req.body;
    
    logger.info(`[DONATE] POST /donate - type: ${type}, wallet: ${wallet}, txHash: ${txHash}`);

    // Validate required fields
    if (!type || !wallet || !txHash) {
      logger.warn('[DONATE] Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify wallet matches authenticated user
    if (req.user?.wallet !== wallet) {
      logger.warn(`[DONATE] Wallet mismatch - expected: ${req.user?.wallet}, got: ${wallet}`);
      return res.status(403).json({ error: 'Wallet mismatch' });
    }

    // Verify payment transaction
    logger.info(`[DONATE] Verifying payment for txHash: ${txHash}`);
    const paymentVerified = await verifyPayment(wallet, txHash, type);
    
    if (!paymentVerified) {
      logger.warn(`[DONATE] Payment verification failed for txHash: ${txHash}`);
      return res.status(402).json({ error: 'Payment verification failed' });
    }

    logger.info(`[DONATE] Payment verified successfully`);

    // Process media if needed
    let mediaUrl = null;
    let textContent = null;

    if (type === 'text') {
      textContent = content;
      logger.info(`[DONATE] Text donation: ${content.substring(0, 50)}...`);
    } else {
      // Process media (image, gif, audio, video)
      logger.info(`[DONATE] Processing ${type} media`);
      mediaUrl = await processMedia(content, type, wallet);
      logger.info(`[DONATE] Media processed, URL: ${mediaUrl}`);
    }

    // Get price based on type
    const prices: Record<string, number> = {
      text: 0.01,
      gif: 0.02,
      image: 0.03,
      audio: 0.05,
      video: 0.1,
    };
    const price = prices[type] || 0.01;

    // Save donation to database
    logger.info(`[DONATE] Saving donation to database`);
    const { data, error } = await supabase
      .from('donations')
      .insert({
        wallet,
        username: username || null,
        type,
        media_url: mediaUrl,
        text: textContent,
        price,
        tx_hash: txHash,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      logger.error(`[DONATE] Database error:`, error);
      return res.status(500).json({ 
        error: 'Failed to save donation',
        details: error.message 
      });
    }

    logger.info(`[DONATE] Donation saved successfully with ID: ${data.id}`);

    // Broadcast to overlay via WebSocket (if clients connected)
    // This is optional since frontend uses polling
    // overlayService.broadcastDonation(data);

    res.json({
      success: true,
      donation: {
        type: data.type,
        text: data.text,
        mediaUrl: data.media_url,
        username: data.username,
        price: parseFloat(data.price),
      },
    });
  } catch (error: any) {
    logger.error(`[DONATE] Unexpected error:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

export default router;
```

### 2.3 Fix Media Service

**File:** `src/services/mediaService.ts`

**Current Issue:** Need to upload media to Supabase Storage instead of just base64.

**Fix:**
```typescript
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

export async function processMedia(
  content: string,
  type: 'image' | 'gif' | 'audio' | 'video',
  wallet: string
): Promise<string> {
  try {
    logger.info(`[MEDIA] Processing ${type} for wallet: ${wallet}`);

    // If content is a URL, return it
    if (content.startsWith('http://') || content.startsWith('https://')) {
      logger.info(`[MEDIA] Content is already a URL: ${content}`);
      return content;
    }

    // If content is base64, upload to Supabase Storage
    if (content.startsWith('data:')) {
      const base64Data = content.split(',')[1];
      const mimeType = content.split(';')[0].split(':')[1];
      const extension = mimeType.split('/')[1];
      
      // Generate unique filename
      const filename = `${wallet}_${Date.now()}.${extension}`;
      const folder = type === 'gif' ? 'gifs' : type === 'image' ? 'images' : type === 'audio' ? 'audio' : 'video';
      const filePath = `${folder}/${filename}`;

      logger.info(`[MEDIA] Uploading to Supabase Storage: ${filePath}`);

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('pushme-media')
        .upload(filePath, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        logger.error(`[MEDIA] Upload error:`, error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('pushme-media')
        .getPublicUrl(filePath);

      logger.info(`[MEDIA] Upload successful, URL: ${urlData.publicUrl}`);
      return urlData.publicUrl;
    }

    // If content is already a string (shouldn't happen), return as-is
    logger.warn(`[MEDIA] Unexpected content format, returning as-is`);
    return content;
  } catch (error: any) {
    logger.error(`[MEDIA] Error processing media:`, error);
    throw error;
  }
}
```

### 2.4 Fix Auth Route - Username Update

**File:** `src/routes/auth.ts`

**Current Issue:** Need endpoint to update username.

**Fix:**
```typescript
// PATCH /auth/me - Update user profile (username)
router.patch('/me', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    const wallet = req.user?.wallet;

    if (!wallet) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    logger.info(`[AUTH] Updating username for wallet: ${wallet}, username: ${username}`);

    // Validate username
    if (username && (username.length < 3 || username.length > 20)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    // Update user in database
    const { data, error } = await supabase
      .from('users')
      .update({ username: username || null })
      .eq('wallet', wallet)
      .select()
      .single();

    if (error) {
      logger.error(`[AUTH] Database error:`, error);
      return res.status(500).json({ error: 'Failed to update username' });
    }

    logger.info(`[AUTH] Username updated successfully`);

    res.json({
      user: {
        id: data.id,
        wallet: data.wallet,
        username: data.username,
      },
    });
  } catch (error: any) {
    logger.error(`[AUTH] Unexpected error:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 2.5 Improve Logger

**File:** `src/utils/logger.ts`

**Current Issue:** Need consistent logging format.

**Fix:**
```typescript
import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console output with colors
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
      ),
    }),
    // File output
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
    }),
  ],
});

export default logger;
```

---

## Step 3: Create Supabase Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `pushme-media`
4. Public: **Yes** (so media URLs work)
5. Click "Create bucket"

**OR** via SQL:
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pushme-media', 'pushme-media', true);
```

Then create storage policies:
```sql
CREATE POLICY "Public can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pushme-media');

CREATE POLICY "Public can read media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pushme-media');
```

---

## Step 4: Update Environment Variables

Make sure your backend `.env.local` has:
```bash
SUPABASE_URL=https://nwisjtzjrddfoboccjgr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Step 5: Test Endpoints

After applying fixes, test:

```bash
# Health check
curl http://localhost:5001/

# Overlay recent (should return empty array if no donations)
curl http://localhost:5001/overlay/recent?limit=5

# Overlay health
curl http://localhost:5001/overlay/health
```

---

## Summary of Changes

1. ✅ Created `donations` table in Supabase
2. ✅ Fixed `/overlay/recent` endpoint with proper error handling
3. ✅ Fixed `/donate` endpoint to save to database
4. ✅ Added media upload to Supabase Storage
5. ✅ Added username update endpoint (`PATCH /auth/me`)
6. ✅ Improved logging throughout
7. ✅ Created storage bucket and policies

**All endpoints now properly log to console and save to database!**

