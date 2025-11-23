# 🧪 PressMe.xyz Full Stack Testing Guide

## Prerequisites

1. **Backend running** on `http://localhost:5001`
2. **Frontend running** on `http://localhost:3000`
3. **Redis running** (required for backend queues)
4. **Phantom wallet** installed in browser
5. **Test SOL** in your wallet (for donations)

---

## 🚀 Quick Start

### 1. Start Backend

```bash
cd pushmebackend  # or your backend directory
npm install
npm run dev  # or npm start
```

**Verify backend is running:**
```bash
curl http://localhost:5001/
# Should return: {"name":"PushMe Backend","version":"1.0.0","status":"running"}
```

### 2. Start Frontend

```bash
cd /Users/aleks/Documents/PushMe
npm install
npm run dev
```

**Verify frontend is running:**
- Open `http://localhost:3000`
- Should see the landing page with giant red button

---

## 📋 Testing Checklist

### ✅ Phase 1: Authentication Flow

#### Test 1.1: Connect Wallet
1. Go to `http://localhost:3000`
2. Click "Connect Wallet" button
3. Select Phantom wallet
4. Approve connection
5. **Expected:** Wallet address appears in navbar

**Console logs to check:**
```
[WALLET] Wallet connected, attempting login
[AUTH] Starting login flow for wallet: <address>
[API] POST http://localhost:5001/auth/nonce
[AUTH] Verifying signature for wallet: <address>
[API] POST http://localhost:5001/auth/verify
[AUTH] Login successful: {user: {...}}
```

#### Test 1.2: Username Setup
1. After connecting wallet, username modal should appear
2. Enter a username (3-20 chars, alphanumeric + underscore)
3. Click "Set Username"
4. **Expected:** Modal closes, username saved

**Console logs to check:**
```
[USERNAME] Setting username: <username>
[AUTH] Setting username: <username>
[API] POST http://localhost:5001/auth/me
[AUTH] Username updated: {user: {...}}
```

#### Test 1.3: Auto-Login on Refresh
1. Refresh the page
2. **Expected:** Wallet stays connected, user data loads automatically

**Console logs to check:**
```
[AUTH] Auto-loaded user: {user: {...}}
```

---

### ✅ Phase 2: Donation Flow

#### Test 2.1: Text Donation
1. Go to `http://localhost:3000/donate`
2. Ensure wallet is connected
3. Select "Text" tab (default)
4. Enter a message (max 500 chars)
5. Click "Send 0.01 SOL"
6. Approve transaction in Phantom
7. **Expected:** 
   - Transaction sent
   - Success toast appears
   - Donation appears in dashboard

**Console logs to check:**
```
[TEXT DONATION] Starting text donation
[TEXT DONATION] Sending transaction
[TEXT DONATION] Transaction sent: <signature>
[TEXT DONATION] Transaction confirmed
[DONATIONS] Submitting donation with txHash: <signature>
[API] POST http://localhost:5001/donate
[DONATIONS] Donation submitted successfully
```

#### Test 2.2: Image Donation
1. Go to `/donate`
2. Select "Image" tab
3. Upload an image file (JPEG, PNG, WebP)
4. Click "Send 0.03 SOL"
5. Approve transaction
6. **Expected:** Image donation sent successfully

**Console logs to check:**
```
[IMAGE DONATION] Starting image donation
[API] Uploading image: <filename> <size>
[API] Media converted to base64, length: <length>
[IMAGE DONATION] Media uploaded
[IMAGE DONATION] Transaction sent: <signature>
```

#### Test 2.3: GIF Donation
1. Select "GIF" tab
2. Upload a GIF file
3. Send 0.02 SOL
4. **Expected:** GIF donation sent

#### Test 2.4: Audio Donation
1. Select "Audio" tab
2. Upload audio file (MP3, WAV, OGG)
3. Send 0.05 SOL
4. **Expected:** Audio donation sent

#### Test 2.5: Video Donation
1. Select "Video" tab
2. Upload video file (MP4, WebM)
3. Send 0.10 SOL
4. **Expected:** Video donation sent

---

### ✅ Phase 3: Overlay Page

#### Test 3.1: Overlay Display
1. Go to `http://localhost:3000/overlay`
2. **Expected:** 
   - White background
   - Giant red button centered
   - No wallet connection needed

**Console logs to check:**
```
[OVERLAY] Starting overlay polling
[POLLING] Starting donation polling, interval: 1000
```

#### Test 3.2: Overlay Polling
1. Keep overlay page open
2. Send a donation from another browser/tab
3. **Expected:**
   - Overlay detects new donation (within 1-2 seconds)
   - Button animates (press effect)
   - Random animation plays (crack/flash/shockwave/shake)
   - Donation card appears at bottom
   - Card fades out after 6 seconds

**Console logs to check:**
```
[POLLING] New donation detected: <donation_id>
[OVERLAY] New donation received: {donation: {...}}
```

#### Test 3.3: Overlay Media Display
1. Send an image donation
2. **Expected:** Image appears in donation card on overlay

1. Send a GIF donation
2. **Expected:** GIF autoplays in donation card

1. Send a video donation
2. **Expected:** Video autoplays (muted, looped)

1. Send an audio donation
2. **Expected:** Audio player appears and autoplays

---

### ✅ Phase 4: Dashboard

#### Test 4.1: View Donation History
1. Go to `http://localhost:3000/dashboard`
2. **Expected:** 
   - List of your donations
   - Shows type, amount, timestamp
   - Media previews for images/videos

**Console logs to check:**
```
[DASHBOARD] Loading donations for user: <wallet>
[API] GET http://localhost:5001/overlay/recent?limit=50
[DASHBOARD] Loaded <count> donations
```

---

## 🔍 Debugging Tips

### Backend Not Responding
- Check backend logs for errors
- Verify PORT=5001 in backend .env.local
- Check if Redis is running: `redis-cli ping`

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_API_URL=http://localhost:5001` in frontend .env.local
- Check browser console for CORS errors
- Ensure backend CORS allows `http://localhost:3000`

### Wallet Connection Issues
- Check browser console for wallet adapter errors
- Ensure Phantom wallet extension is installed
- Try disconnecting and reconnecting wallet

### Donation Transaction Fails
- Verify you have enough SOL (need amount + transaction fee)
- Check Solana network (mainnet vs devnet)
- Verify `NEXT_PUBLIC_STREAMER_WALLET` matches backend `TREASURY_WALLET`

### Overlay Not Showing Donations
- Check browser console for polling errors
- Verify backend `/overlay/recent` endpoint works:
  ```bash
  curl http://localhost:5001/overlay/recent?limit=1
  ```
- Check overlay page console logs for polling activity

---

## 🎯 End-to-End Test Scenario

### Complete User Journey

1. **Landing Page**
   - Visit `http://localhost:3000`
   - See giant red button
   - Click "Connect Wallet"

2. **Authentication**
   - Connect Phantom wallet
   - Set username: "testuser123"
   - Verify username appears in navbar

3. **Send Text Donation**
   - Click red button → redirects to `/donate`
   - Type message: "Hello PressMe!"
   - Send 0.01 SOL
   - See success toast

4. **Send Image Donation**
   - Switch to "Image" tab
   - Upload test image
   - Send 0.03 SOL
   - See success toast

5. **View Dashboard**
   - Go to `/dashboard`
   - See both donations listed
   - Verify amounts and timestamps

6. **Test Overlay**
   - Open `/overlay` in new tab/window
   - Send another donation from main tab
   - Watch overlay react:
     - Button animation
     - Screen effect (crack/flash/shockwave/shake)
     - Donation card appears
     - Card fades after 6 seconds

7. **Verify Backend**
   - Check backend logs for all API calls
   - Verify donations in database
   - Check transaction verification logs

---

## 📊 Expected Console Output

### Successful Donation Flow:
```
[API] POST http://localhost:5001/donate
[API] Response from http://localhost:5001/donate: {success: true, donation: {...}}
[DONATIONS] Donation submitted successfully
```

### Overlay Polling:
```
[POLLING] Starting donation polling, interval: 1000
[POLLING] New donation detected: <id>
[OVERLAY] New donation received: {donation: {...}}
[OVERLAY] Button pressed
```

---

## ✅ Success Criteria

- ✅ Wallet connects and authenticates
- ✅ Username can be set and saved
- ✅ All donation types work (text, image, GIF, audio, video)
- ✅ Transactions are verified on-chain
- ✅ Donations appear in dashboard
- ✅ Overlay polls and displays donations
- ✅ Overlay animations trigger correctly
- ✅ Media displays correctly in overlay
- ✅ Console logs show all API calls
- ✅ No errors in browser console
- ✅ No errors in backend logs

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS errors | Add `http://localhost:3000` to backend CORS whitelist |
| Wallet won't connect | Check Phantom extension is enabled |
| Transaction fails | Verify sufficient SOL balance |
| Overlay not polling | Check backend `/overlay/recent` endpoint |
| Media not uploading | Check file size limits (max 20MB) |
| Username not saving | Verify backend `/auth/me` endpoint accepts username |

---

**Ready to test! Start with Phase 1 and work through each phase systematically.**

