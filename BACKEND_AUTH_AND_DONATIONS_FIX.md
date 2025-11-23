# Backend Authentication & Donations Integration Guide

## Overview
The frontend has been completely rebuilt to work with simplified authentication (Phantom + Supabase directly) and donations that save to Supabase first, then notify the backend for overlay updates.

## Changes Made to Frontend

### 1. Authentication System - SIMPLIFIED
- **Removed complex nonce/signature backend dependency**
- **Direct Phantom wallet authentication**
- **Automatic user creation/retrieval from Supabase**
- **No JWT tokens needed for basic auth** - users are authenticated via wallet connection
- **Username stored in Supabase, cached locally**

#### New Auth Flow:
1. User clicks "Connect Wallet"
2. Phantom opens with connection prompt (CONNECT button - this is correct for first-time connection)
3. Once connected, user is auto-created/retrieved from Supabase `users` table
4. If first time, username modal shows (forced, cannot be closed until username is set)
5. Username is saved to Supabase
6. Top right shows username with dropdown (disconnect option)

### 2. Donations System - SUPABASE FIRST
- **All donations save directly to Supabase `donations` table**
- **Backend is notified AFTER Supabase save (for overlay broadcast)**
- **Works with all media types: text, image, gif, audio, video**

#### New Donation Flow:
1. User selects donation type and content
2. Phantom transaction is created and signed
3. Once transaction is confirmed (tx hash received), donation is:
   - **SAVED TO SUPABASE FIRST** with all data (wallet, username, type, content, tx_hash, price, etc.)
   - **THEN backend is notified** via POST to `/donate` endpoint
4. Backend broadcasts to overlay WebSocket
5. Overlay polls Supabase every 1 second for new donations
6. Overlay shows button press animation, then random page effect, then donation card

## Backend Requirements

### Required Endpoints

#### 1. POST `/donate` (Optional - for overlay notifications)
**Purpose:** Receive donation notifications to broadcast to overlay WebSocket clients

**Request Body:**
```json
{
  "type": "text" | "image" | "gif" | "audio" | "video",
  "content": "string (base64 for media, text for text donations)",
  "username": "string",
  "wallet": "string (Solana public key)",
  "txHash": "string (Solana transaction signature)",
  "price": 0.01,
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation received and broadcasted"
}
```

**What Backend Should Do:**
1. Receive the donation notification
2. Broadcast to all connected overlay WebSocket clients at `/overlay` 
3. Return success (don't save to database - frontend already did that)

**Example Implementation:**
```typescript
app.post('/donate', (req, res) => {
  const { type, content, username, wallet, txHash, price, metadata } = req.body;
  
  console.log(`[DONATE] Received ${type} donation from ${username} (${wallet})`);
  console.log(`[DONATE] TX: ${txHash}, Amount: ${price} SOL`);
  
  // Broadcast to all overlay WebSocket clients
  io.to('overlay').emit('donation', {
    type,
    content,
    username,
    wallet,
    txHash,
    price,
    metadata,
    timestamp: Date.now()
  });
  
  res.json({ 
    success: true, 
    message: 'Donation received and broadcasted to overlay' 
  });
});
```

### Database Schema (Already in Supabase)

The following tables already exist in Supabase:

#### `users` table
- `id` (UUID, primary key)
- `wallet` (TEXT, unique, not null)
- `username` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `donations` table
- `id` (UUID, primary key)
- `wallet` (TEXT, not null)
- `username` (TEXT, nullable)
- `type` (TEXT, must be one of: 'text', 'gif', 'image', 'audio', 'video')
- `media_url` (TEXT, nullable - base64 or URL)
- `text` (TEXT, nullable - for text donations)
- `price` (DECIMAL, not null)
- `tx_hash` (TEXT, unique, not null - Solana transaction signature)
- `metadata` (JSONB, default '{}')
- `created_at` (TIMESTAMP)

**Backend does NOT need to manage these tables directly** - the frontend handles all database operations.

### What Backend MUST Support

1. **WebSocket Server at `/overlay`**
   - Clients connect to receive real-time donation notifications
   - When POST `/donate` is called, broadcast donation to all connected clients
   
2. **POST `/donate` endpoint**
   - Receives donation notifications from frontend
   - Broadcasts to overlay WebSocket clients
   - Returns success response

### What Backend NO LONGER NEEDS

1. ❌ `/auth/nonce` endpoint - removed, not used
2. ❌ `/auth/verify` endpoint - removed, not used
3. ❌ `/auth/me` GET endpoint - removed, frontend uses Supabase directly
4. ❌ `/auth/me` PATCH endpoint - removed, frontend uses Supabase directly
5. ❌ Database operations for users table - frontend handles this
6. ❌ Database operations for donations table - frontend handles this
7. ❌ JWT token generation/validation for user auth - not needed anymore

### Overlay Integration

The overlay page (`/overlay`) now:
1. Polls Supabase every 1 second for the most recent donation
2. When a new donation is detected:
   - Shows button being pressed and lighting up (300ms animation)
   - Shows random page effect: crack, flash, shockwave, or shake (2s)
   - Shows donation card with username, amount, and content (6s total display)
3. Is completely non-interactive (users cannot click or interact)

The backend WebSocket broadcast is **optional** but recommended for instant updates without polling.

## Frontend Environment Variables

The frontend expects:
```env
# Backend API (for /donate notifications only)
NEXT_PUBLIC_API_URL=http://localhost:5001

# Solana RPC
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com

# Streamer wallet (where donations are sent)
NEXT_PUBLIC_STREAMER_WALLET=7R9eG7z3EZWhihZ7YHdZEnnjHKQSSYTojdQs6o3q9tC1

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://nwisjtzjrddfoboccjgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing Checklist

### Authentication Flow
- [ ] Click "Connect Wallet" opens Phantom with "Connect" prompt (correct behavior)
- [ ] Approving connection creates/fetches user from Supabase
- [ ] First-time users see username modal (forced, cannot close)
- [ ] Username is saved to Supabase `users` table
- [ ] Returning users auto-login without username prompt
- [ ] Top right shows username with clickable dropdown
- [ ] Disconnect button works and clears user session

### Donations Flow
- [ ] Text donations: transaction sends SOL, saves to Supabase with text
- [ ] Image donations: uploads base64, transaction sends SOL, saves to Supabase
- [ ] GIF donations: uploads base64, transaction sends SOL, saves to Supabase
- [ ] Audio donations: uploads base64, transaction sends SOL, saves to Supabase
- [ ] Video donations: uploads base64, transaction sends SOL, saves to Supabase
- [ ] All donations include: wallet, username, tx_hash, price, type
- [ ] Backend `/donate` endpoint is called (check backend logs)
- [ ] Overlay updates to show new donation (polls Supabase every 1s)

### Overlay Display
- [ ] Button press animation shows when donation arrives
- [ ] Random page effect plays (crack/flash/shockwave/shake)
- [ ] Donation card displays with username, amount, and content
- [ ] Display lasts 6 seconds then clears
- [ ] Page is non-interactive (cannot click anything)

## Error Handling

### Frontend
- All errors are logged with `[AUTH]`, `[DONATIONS]`, or `[OVERLAY]` prefixes
- User-friendly error messages shown via Toast notifications
- Supabase errors are caught and displayed appropriately

### Backend
- If backend `/donate` fails, donation is still saved to Supabase
- Overlay continues to work via polling even if WebSocket fails
- All errors should be logged with timestamps

## Summary

**Frontend is now completely self-sufficient** for authentication and donations. The backend only needs to:
1. Provide WebSocket server at `/overlay` for real-time notifications
2. Handle POST `/donate` to broadcast to overlay clients
3. That's it!

The frontend handles all user management, donation storage, and overlay data retrieval via Supabase.

