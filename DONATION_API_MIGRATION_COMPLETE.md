# ✅ Donation API Migration Complete

## Summary

All donation endpoints have been migrated from the old `/transaction/*` endpoints to the new `/donation/*` endpoints.

## Changes Made

### 1. ✅ `lib/sendDonation.ts` - Complete Rewrite

**Old Endpoints:**
- `POST /transaction/create` → Get unsigned transaction
- `POST /transaction/send` → Send signed transaction

**New Endpoints:**
- `POST /donation/start` → Get unsigned transaction
- `POST /donation/confirm` → Send signed transaction

**New Flow:**
1. Call `POST /donation/start` with:
   ```json
   {
     "wallet": "<publicKey>",
     "amount": <SOL>,
     "message": "<string>" | null,
     "mediaUrl": "<string>" | null
   }
   ```
2. Receive `{ success: true, unsignedTx: "<base64>" }`
3. Deserialize and sign with Phantom
4. Call `POST /donation/confirm` with:
   ```json
   {
     "wallet": "<publicKey>",
     "signedTx": "<base64>",
     "amount": <SOL>,
     "message": "<string>" | null,
     "mediaUrl": "<string>" | null
   }
   ```
5. Receive `{ success: true, txSignature: "..." }`

**Key Changes:**
- Uses `message` for text donations (not `content`)
- Uses `mediaUrl` for media donations (not `content`)
- Response uses `txSignature` instead of `signature`
- Auto-connects Phantom if not connected
- Verifies wallet matches authenticated wallet

### 2. ✅ `components/TextDonation.tsx`

**Changes:**
- Updated to use `message` parameter instead of `content`
- Uses session wallet if available
- Updated response handling to use `txSignature`

### 3. ✅ `components/ImageDonation.tsx`

**Changes:**
- Updated to use `mediaUrl` parameter instead of `content`
- Uses session wallet if available
- Updated response handling to use `txSignature`
- Checks `isAuthenticated` instead of requiring `publicKey`

### 4. ✅ `components/GifDonation.tsx`

**Changes:**
- Updated to use `mediaUrl` parameter instead of `content`
- Uses session wallet if available
- Updated response handling to use `txSignature`
- Checks `isAuthenticated` instead of requiring `publicKey`

### 5. ✅ `components/AudioDonation.tsx`

**Changes:**
- Updated to use `mediaUrl` parameter instead of `content`
- Uses session wallet if available
- Updated response handling to use `txSignature`
- Checks `isAuthenticated` instead of requiring `publicKey`

### 6. ✅ `components/VideoDonation.tsx`

**Changes:**
- Updated to use `mediaUrl` parameter instead of `content`
- Uses session wallet if available
- Updated response handling to use `txSignature`
- Checks `isAuthenticated` instead of requiring `publicKey`

## Removed References

✅ All references to `/transaction/create` removed
✅ All references to `/transaction/send` removed
✅ All references to `/transaction/confirm` removed
✅ All references to `/api/transaction/*` removed

## New Donation Flow

### Text Donation:
1. User enters message → Clicks "Send 0.01 SOL"
2. `sendDonation({ wallet, type: 'text', amount: 0.01, message: "..." })`
3. `POST /donation/start` → Get unsigned transaction
4. Phantom opens → User signs
5. `POST /donation/confirm` → Backend confirms
6. Overlay receives broadcast → Animation plays

### Media Donation (Image/GIF/Audio/Video):
1. User uploads file → Clicks "Send X SOL"
2. File uploaded to backend → Get `mediaUrl`
3. `sendDonation({ wallet, type: 'image', amount: 0.03, mediaUrl: "..." })`
4. `POST /donation/start` → Get unsigned transaction
5. Phantom opens → User signs
6. `POST /donation/confirm` → Backend confirms
7. Overlay receives broadcast → Animation plays

## Error Handling

- Connection errors: "Failed to connect wallet"
- Rejection errors: "Transaction was cancelled by user"
- Backend errors: Error message from backend response
- Wallet mismatch: "Connected wallet does not match authenticated wallet"

## Testing Checklist

✅ Text donation calls `/donation/start` with `message`
✅ Media donations call `/donation/start` with `mediaUrl`
✅ Phantom opens immediately after `/donation/start`
✅ Signed transaction sent to `/donation/confirm`
✅ Response uses `txSignature` field
✅ Overlay receives broadcast after confirmation
✅ All old endpoint references removed
✅ Session wallet used when wallet not connected

---

**All donation endpoints migrated! Frontend now uses `/donation/start` and `/donation/confirm` exclusively! 🎉**

