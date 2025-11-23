# ✅ Testing Checklist - PressMe.xyz

## Pre-Testing Verification

### ✅ Database Setup
- [x] `users` table created (from 001_initial_schema.sql)
- [x] `events` table created (from 001_initial_schema.sql)
- [x] `donations` table created (from 002_donations_table.sql)
- [x] All indexes created
- [x] RLS policies enabled

### ✅ Storage Setup
- [x] `pushme-media` bucket created in Supabase Storage
- [x] Bucket is public
- [x] Storage policies applied (if needed)

### ✅ Backend Setup
- [x] Backend fixes applied
- [x] Redis running (`redis-cli ping` returns PONG)
- [x] Backend running on port 5001
- [x] Environment variables configured

### ✅ Frontend Setup
- [x] Frontend running on port 3000
- [x] `.env.local` configured with:
  - `NEXT_PUBLIC_API_URL=http://localhost:5001`
  - `NEXT_PUBLIC_STREAMER_WALLET=7R9eG7z3EZWhihZ7YHdZEnnjHKQSSYTojdQs6o3q9tC1`
  - `NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com`

---

## 🧪 Testing Sequence

### Phase 1: Backend Health Checks (2 minutes)

#### Test 1.1: Root Endpoint
```bash
curl http://localhost:5001/
```
**Expected:** `{"name":"PushMe Backend","version":"1.0.0","status":"running"}`

**Backend Logs Should Show:**
```
[INFO] GET /
```

#### Test 1.2: Overlay Health
```bash
curl http://localhost:5001/overlay/health
```
**Expected:** `{"status":"ok","timestamp":...}`

**Backend Logs Should Show:**
```
[OVERLAY] Health check requested
```

#### Test 1.3: Overlay Recent (Empty)
```bash
curl http://localhost:5001/overlay/recent?limit=5
```
**Expected:** `{"donations":[]}`

**Backend Logs Should Show:**
```
[OVERLAY] GET /overlay/recent - limit: 5
[OVERLAY] Returning 0 donations
```

---

### Phase 2: Authentication Flow (5 minutes)

#### Test 2.1: Get Nonce
```bash
curl -X POST http://localhost:5001/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"wallet": "YOUR_TEST_WALLET_ADDRESS"}'
```
**Expected:** JSON with `nonce`, `timestamp`, `message`

**Backend Logs Should Show:**
```
[AUTH] POST /auth/nonce - wallet: ...
[AUTH] Generated nonce: ...
```

#### Test 2.2: Frontend Wallet Connection
1. Open `http://localhost:3000`
2. Click **"Connect Wallet"** button
3. **Expected:** Phantom wallet modal opens ✅
4. Select Phantom wallet
5. Approve connection
6. **Expected:** 
   - Wallet connects
   - Auto-login triggers
   - Username modal appears (if no username set)

**Browser Console Should Show:**
```
[WALLET] Connect button clicked
[WALLET] Wallet connected, attempting login
[AUTH] Starting login flow for wallet: ...
[API] POST http://localhost:5001/auth/nonce
[AUTH] Verifying signature for wallet: ...
[API] POST http://localhost:5001/auth/verify
[AUTH] Login successful: {user: {...}}
```

**Backend Logs Should Show:**
```
[AUTH] POST /auth/nonce - wallet: ...
[AUTH] POST /auth/verify - wallet: ...
[AUTH] User authenticated: ...
```

#### Test 2.3: Set Username
1. If username modal appears, enter username (e.g., "testuser123")
2. Click "Set Username"
3. **Expected:** Modal closes, username saved

**Browser Console Should Show:**
```
[USERNAME] Setting username: testuser123
[AUTH] Setting username: testuser123
[API] POST http://localhost:5001/auth/me
[AUTH] Username updated: {user: {...}}
```

**Backend Logs Should Show:**
```
[AUTH] PATCH /auth/me - wallet: ..., username: testuser123
[AUTH] Username updated successfully
```

#### Test 2.4: Wallet Dropdown
1. Click wallet address/username in navbar
2. **Expected:** Dropdown menu appears with:
   - Wallet address (full)
   - Username (if set)
   - "Disconnect Wallet" button

#### Test 2.5: Disconnect Wallet
1. Click "Disconnect Wallet" in dropdown
2. **Expected:** 
   - Wallet disconnects
   - Authentication cleared
   - Button shows "Connect Wallet" again

**Browser Console Should Show:**
```
[WALLET] Disconnecting wallet
[AUTH] Logging out
```

---

### Phase 3: Button Press Testing (2 minutes)

#### Test 3.1: Press Button (Not Authenticated)
1. Make sure wallet is **disconnected**
2. Click the giant red **"PRESS ME"** button
3. **Expected:** Toast appears saying "Please connect your wallet to send donations"

**Browser Console Should Show:**
```
[Button] Pressed without authentication
```

#### Test 3.2: Press Button (Authenticated)
1. **Connect wallet** first
2. Click the giant red **"PRESS ME"** button
3. **Expected:** Navigates to `/donate` page

---

### Phase 4: Donation Flow (10 minutes)

#### Test 4.1: Text Donation
1. Go to `http://localhost:3000/donate`
2. Ensure wallet is connected
3. Select **"Text"** tab (default)
4. Enter message: "Hello PressMe! This is a test donation."
5. Click **"Send 0.01 SOL"**
6. Approve transaction in Phantom
7. **Expected:**
   - Transaction sent
   - Success toast appears
   - Donation saved to database

**Browser Console Should Show:**
```
[TEXT DONATION] Starting text donation
[TEXT DONATION] Sending transaction
[TEXT DONATION] Transaction sent: <signature>
[TEXT DONATION] Transaction confirmed
[DONATIONS] Submitting donation with txHash: <signature>
[API] POST http://localhost:5001/donate
[DONATIONS] Donation submitted successfully
```

**Backend Logs Should Show:**
```
[DONATE] POST /donate - type: text, wallet: ..., txHash: ...
[DONATE] Verifying payment for txHash: ...
[DONATE] Payment verified successfully
[DONATE] Text donation: Hello PressMe! This is a test donation...
[DONATE] Saving donation to database
[DONATE] Donation saved successfully with ID: ...
```

**Verify in Database:**
```sql
SELECT * FROM donations ORDER BY created_at DESC LIMIT 1;
```
Should show your donation with type='text', text='Hello PressMe!...', price=0.01

#### Test 4.2: Image Donation
1. Stay on `/donate` page
2. Select **"Image"** tab
3. Upload a test image (JPEG/PNG)
4. Click **"Send 0.03 SOL"**
5. Approve transaction
6. **Expected:** Image uploaded to Supabase Storage, donation saved

**Browser Console Should Show:**
```
[IMAGE DONATION] Starting image donation
[API] Uploading image: <filename> <size>
[API] Media converted to base64, length: ...
[IMAGE DONATION] Media uploaded
[IMAGE DONATION] Transaction sent: <signature>
[DONATIONS] Donation submitted successfully
```

**Backend Logs Should Show:**
```
[DONATE] POST /donate - type: image, wallet: ..., txHash: ...
[DONATE] Payment verified successfully
[MEDIA] Processing image for wallet: ...
[MEDIA] Uploading to Supabase Storage: images/...
[MEDIA] Upload successful, URL: https://...
[DONATE] Saving donation to database
[DONATE] Donation saved successfully with ID: ...
```

**Verify:**
- Check Supabase Storage → `pushme-media` bucket → `images/` folder
- Check database: `SELECT media_url FROM donations WHERE type='image' ORDER BY created_at DESC LIMIT 1;`
- Should return a Supabase Storage URL

#### Test 4.3: GIF Donation
1. Select **"GIF"** tab
2. Upload a GIF file
3. Send 0.02 SOL
4. **Expected:** GIF uploaded to `gifs/` folder in storage

#### Test 4.4: Audio Donation
1. Select **"Audio"** tab
2. Upload audio file (MP3/WAV)
3. Send 0.05 SOL
4. **Expected:** Audio uploaded to `audio/` folder in storage

---

### Phase 5: Dashboard Testing (3 minutes)

#### Test 5.1: View Donations
1. Go to `http://localhost:3000/dashboard`
2. **Expected:** 
   - List of your donations
   - Shows type, amount, timestamp
   - Media previews for images/GIFs

**Browser Console Should Show:**
```
[DASHBOARD] Loading donations for user: ...
[API] GET http://localhost:5001/overlay/recent?limit=50
[DASHBOARD] Loaded <count> donations
```

**Backend Logs Should Show:**
```
[OVERLAY] GET /overlay/recent - limit: 50
[OVERLAY] Returning <count> donations
```

---

### Phase 6: Overlay Testing (5 minutes)

#### Test 6.1: Overlay Display
1. Open `http://localhost:3000/overlay` in **new tab/window**
2. **Expected:**
   - White background
   - Giant red button centered
   - No wallet connection needed

**Browser Console Should Show:**
```
[OVERLAY] Starting overlay polling
[POLLING] Starting donation polling, interval: 1000
[POLLING] Polling donations...
```

**Backend Logs Should Show:**
```
[OVERLAY] GET /overlay/recent - limit: 1
[OVERLAY] Returning 0 donations
```
(Repeats every 1 second)

#### Test 6.2: Overlay Reacts to Donation
1. Keep overlay tab open
2. In **main tab**, send a new donation (text or image)
3. **Expected (within 1-2 seconds):**
   - Overlay detects new donation
   - Button animates (press effect)
   - Random animation plays (crack/flash/shockwave/shake)
   - Donation card appears at bottom
   - Card shows username, amount, content
   - Card fades out after 6 seconds

**Overlay Tab Console Should Show:**
```
[POLLING] New donation detected: <donation_id>
[OVERLAY] New donation received: {donation: {...}}
[OVERLAY] Button pressed
```

**Backend Logs Should Show:**
```
[OVERLAY] GET /overlay/recent - limit: 1
[OVERLAY] Returning 1 donations
```

#### Test 6.3: Overlay Media Display
1. Send an **image donation**
2. **Expected:** Image appears in donation card on overlay

1. Send a **GIF donation**
2. **Expected:** GIF autoplays in donation card

1. Send an **audio donation**
2. **Expected:** Audio player appears and autoplays

---

## 🎯 Success Criteria

### ✅ All Tests Pass If:

- [x] Backend endpoints respond correctly
- [x] Wallet connects and authenticates
- [x] Username can be set and saved
- [x] All donation types work (text, image, GIF, audio)
- [x] Transactions are verified on-chain
- [x] Donations save to database
- [x] Media uploads to Supabase Storage
- [x] Dashboard shows donations
- [x] Overlay polls and displays donations
- [x] Overlay animations trigger correctly
- [x] Media displays correctly in overlay
- [x] Console logs show all API calls
- [x] Backend logs show all operations
- [x] No errors in browser console
- [x] No errors in backend logs

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Wallet modal doesn't open | Check browser console, ensure Phantom extension installed |
| Donation fails to save | Check backend logs, verify donations table exists |
| Media doesn't upload | Check Supabase Storage bucket exists, verify storage policies |
| Overlay not polling | Check browser console, verify `/overlay/recent` endpoint works |
| Transaction fails | Verify SOL balance, check network (mainnet vs devnet) |
| Username not saving | Check backend logs for `PATCH /auth/me` errors |

---

## 📊 Expected Log Output

### Successful Donation Flow:

**Frontend Console:**
```
[TEXT DONATION] Starting text donation
[TEXT DONATION] Transaction sent: 5j7s8K9m2nP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8uV9wX
[TEXT DONATION] Transaction confirmed
[DONATIONS] Submitting donation with txHash: 5j7s8K9m2nP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8uV9wX
[API] POST http://localhost:5001/donate
[API] Response from http://localhost:5001/donate: {success: true, donation: {...}}
[DONATIONS] Donation submitted successfully
```

**Backend Logs:**
```
[DONATE] POST /donate - type: text, wallet: 7R9eG7z3EZWhihZ7YHdZEnnjHKQSSYTojdQs6o3q9tC1, txHash: 5j7s8K9m2nP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8uV9wX
[DONATE] Verifying payment for txHash: 5j7s8K9m2nP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8uV9wX
[DONATE] Payment verified successfully
[DONATE] Text donation: Hello PressMe! This is a test donation...
[DONATE] Saving donation to database
[DONATE] Donation saved successfully with ID: <uuid>
```

---

## 🚀 Ready to Test!

Start with **Phase 1** and work through each phase systematically. Check logs at each step to ensure everything is working correctly.

**Good luck!** 🎉

