# Backend Donation System Fix

## Overview
The frontend is now properly set up to send donations with real Solana transactions. The backend needs to be updated to handle the complete donation flow.

## Current Frontend Flow

1. **User clicks donation button** → Opens modal (no page redirect)
2. **User selects donation type** → Text (0.01 SOL), GIF (0.02 SOL), Image (0.03 SOL), Audio (0.05 SOL), Video (0.10 SOL)
3. **User enters content** → Text message or uploads media file
4. **Frontend creates Solana transaction** → Sends SOL to treasury wallet
5. **Frontend waits for blockchain confirmation** → Uses `connection.confirmTransaction(signature, 'confirmed')`
6. **Frontend submits to backend** → POST `/donate` with transaction hash and donation data
7. **Backend stores donation** → Should save to database
8. **Overlay polls for new donations** → GET `/overlay/recent?limit=1` every 1 second
9. **Overlay displays donation** → Shows donation card with animations

## Required Backend Endpoints

### POST `/donate`
**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "type": "text" | "gif" | "image" | "audio" | "video",
  "content": "string (text message or base64 media)",
  "username": "string",
  "wallet": "string (Solana wallet address)",
  "txHash": "string (Solana transaction signature)",
  "metadata": {
    "width": 0,  // for images/videos
    "height": 0  // for images/videos
  }
}
```

**Response**:
```json
{
  "success": true,
  "donation": {
    "id": "uuid",
    "type": "text",
    "text": "string | null",
    "mediaUrl": "string | null",
    "username": "string",
    "wallet": "string",
    "price": 0.01,
    "tx_hash": "string",
    "created_at": "ISO timestamp"
  }
}
```

**Requirements**:
1. Verify JWT token from Authorization header
2. Validate transaction hash exists on Solana blockchain
3. Verify transaction amount matches donation type price
4. Verify transaction recipient is the treasury wallet
5. Store donation in database (donations table)
6. For media donations, store the base64 content (or upload to storage and return URL)
7. Return donation object with all fields

### GET `/overlay/recent?limit=1`
**Authentication**: Not required (public endpoint for overlay)

**Query Parameters**:
- `limit`: number (default: 1, max: 100)

**Response**:
```json
{
  "donations": [
    {
      "id": "uuid",
      "type": "text",
      "text": "string | null",
      "media_url": "string | null",
      "username": "string | null",
      "wallet": "string",
      "price": 0.01,
      "tx_hash": "string",
      "created_at": "ISO timestamp"
    }
  ]
}
```

**Requirements**:
1. Return most recent donations ordered by `created_at DESC`
2. Limit results to `limit` parameter
3. Include all donation fields
4. Handle errors gracefully (return empty array on error)

## Database Schema

The `donations` table should have:
- `id` (UUID, primary key)
- `type` (text, gif, image, audio, video)
- `text` (text, nullable - for text donations)
- `media_url` (text, nullable - for media donations, can be base64 data URL or storage URL)
- `username` (text, nullable)
- `wallet` (text, not null - Solana wallet address)
- `price` (numeric, not null - SOL amount)
- `tx_hash` (text, not null, unique - Solana transaction signature)
- `created_at` (timestamp, default now)

## Solana Transaction Verification

The backend must verify:
1. Transaction exists on blockchain (use Solana RPC)
2. Transaction amount matches expected price for donation type
3. Transaction recipient matches treasury wallet address
4. Transaction sender matches the wallet in the request

**Treasury Wallet**: Should be set via environment variable `TREASURY_WALLET` or `STREAMER_WALLET`

**Solana RPC**: Use `process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com'`

## Error Handling

### POST `/donate` Errors:
- `400`: Invalid request body, missing fields
- `401`: Invalid or missing authentication token
- `403`: Transaction verification failed
- `409`: Transaction hash already exists (duplicate donation)
- `500`: Server error

### GET `/overlay/recent` Errors:
- `400`: Invalid limit parameter
- `500`: Server error (should return empty array)

## Implementation Notes

1. **Transaction Verification**: Use `@solana/web3.js` to verify transactions
   ```typescript
   const connection = new Connection(SOLANA_RPC);
   const tx = await connection.getTransaction(txHash, { commitment: 'confirmed' });
   // Verify tx details match donation
   ```

2. **Media Storage**: For MVP, base64 data URLs are fine. For production, consider:
   - Uploading to Supabase Storage
   - Using IPFS
   - Using CDN

3. **Polling Optimization**: The overlay polls every 1 second. Consider:
   - Adding WebSocket support later
   - Caching recent donations
   - Using database indexes on `created_at`

4. **Rate Limiting**: Consider rate limiting `/donate` endpoint to prevent spam

## Testing Checklist

- [ ] POST `/donate` with valid text donation
- [ ] POST `/donate` with valid image donation
- [ ] POST `/donate` with invalid transaction hash (should fail)
- [ ] POST `/donate` with wrong transaction amount (should fail)
- [ ] POST `/donate` with duplicate transaction hash (should fail)
- [ ] GET `/overlay/recent` returns most recent donation
- [ ] GET `/overlay/recent?limit=5` returns 5 most recent donations
- [ ] Donations appear on overlay page after submission
- [ ] Overlay animations trigger correctly

## Environment Variables Needed

```env
TREASURY_WALLET=YOUR_TREASURY_WALLET_ADDRESS
SOLANA_RPC=https://api.mainnet-beta.solana.com
# Or use a custom RPC endpoint for better performance
```

## Current Issues to Fix

1. **Infinite polling loop**: Fixed on frontend - polling only happens on overlay page
2. **Wallet disconnection**: Fixed on frontend - enabled autoConnect
3. **Donation page redirect**: Fixed on frontend - now uses modal
4. **Backend donation endpoint**: Needs implementation/verification
5. **Transaction verification**: Needs implementation
6. **Database storage**: Needs verification/implementation

