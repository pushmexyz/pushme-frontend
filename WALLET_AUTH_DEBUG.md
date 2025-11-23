# 🔍 Wallet Authentication Debug Guide

## Current Flow

1. **User clicks "Connect Wallet"** → Opens Phantom modal
2. **User selects Phantom** → Wallet connects
3. **Auto-login triggers** → Attempts to sign message
4. **If auto-login fails** → Shows "Sign In to Continue" button
5. **User clicks "Sign In"** → Manually triggers signature request

## What Should Happen

### Step 1: Connect Wallet
- Click "Connect Wallet" button
- Phantom modal should open
- Select Phantom wallet
- **Expected:** Wallet address appears, button changes to "Sign In to Continue"

### Step 2: Sign Message
- Click "Sign In to Continue" button (or auto-triggers)
- **Expected:** Phantom popup appears asking to sign message
- **Message will say:** "Sign this message to authenticate with PushMe..."
- Click "Approve" in Phantom
- **Expected:** Authentication completes, username modal appears

## Debugging Steps

### Check Browser Console

Look for these logs in order:

1. **Wallet Connection:**
```
[WALLET] Connect button clicked
[WALLET] Wallet connected, signMessage available, attempting auto-login
```

2. **Authentication Start:**
```
[AUTH] Starting login flow for wallet: <address>
[AUTH] signMessage function available: function
[AUTH] Requesting nonce from backend...
```

3. **Backend Response:**
```
[API] POST http://localhost:5001/auth/nonce
[API] Response from http://localhost:5001/auth/nonce: {nonce: "...", message: "..."}
[AUTH] Received nonce: <nonce>
[AUTH] Message to sign: Sign this message to authenticate...
```

4. **Signature Request:**
```
[AUTH] Requesting signature from wallet...
[AUTH] Encoded message length: <number>
```

5. **Phantom Popup Should Appear Here** ⚠️

6. **After Approval:**
```
[AUTH] Received signature: <Uint8Array>
[AUTH] Signature length: <number>
[AUTH] Signature hex: <hex>...
[AUTH] Verifying signature with backend...
```

7. **Success:**
```
[AUTH] Signature verified, received token and user data
[AUTH] Login successful! User: {id: "...", wallet: "...", username: null}
[WALLET] Sign-in successful
```

### Common Issues

#### Issue 1: Phantom Popup Doesn't Appear

**Symptoms:**
- Button shows "Signing In..." but nothing happens
- No Phantom popup
- Console shows: `[AUTH] Requesting signature from wallet...` but stops

**Possible Causes:**
1. Phantom extension not properly installed
2. Phantom is locked
3. Browser blocking popups
4. `signMessage` function not working

**Solutions:**
1. Check Phantom extension is enabled
2. Unlock Phantom wallet
3. Check browser popup settings
4. Try refreshing page
5. Check console for errors

#### Issue 2: "User Rejected" Error

**Symptoms:**
- Phantom popup appears
- User clicks "Reject" or closes popup
- Error toast: "Signature request was cancelled"

**Solution:**
- Click "Sign In to Continue" again
- Approve the signature this time

#### Issue 3: Backend Error

**Symptoms:**
- Console shows backend error
- Error toast appears

**Check:**
- Backend is running on port 5001
- Backend logs show the request
- Network tab shows API call

#### Issue 4: signMessage Not Available

**Symptoms:**
- Button disabled
- Console: `[WALLET] signMessage not available`
- Toast: "Wallet not ready. Please try again."

**Solutions:**
1. Wait a moment for wallet to fully connect
2. Refresh page
3. Disconnect and reconnect wallet

## Manual Testing

### Test 1: Full Flow
1. Open browser console (F12)
2. Click "Connect Wallet"
3. Select Phantom
4. Watch console logs
5. Click "Sign In to Continue" if needed
6. Approve signature in Phantom
7. Verify success logs

### Test 2: Check Backend
```bash
# Should return nonce
curl -X POST http://localhost:5001/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"wallet": "YOUR_WALLET_ADDRESS"}'
```

### Test 3: Check Wallet Connection
In browser console:
```javascript
// Check if wallet adapter is working
window.solana?.isPhantom
// Should return: true

// Check if connected
// Look for wallet adapter logs in console
```

## Expected Console Output

### Successful Authentication:
```
[WALLET] Connect button clicked
[WALLET] Wallet connected, signMessage available, attempting auto-login
[WALLET] Starting sign-in process
[AUTH] Starting login flow for wallet: 7R9eG7z3EZWhihZ7YHdZEnnjHKQSSYTojdQs6o3q9tC1
[AUTH] signMessage function available: function
[AUTH] Requesting nonce from backend...
[API] POST http://localhost:5001/auth/nonce
[API] Response from http://localhost:5001/auth/nonce: {nonce: "...", timestamp: ..., message: "..."}
[AUTH] Received nonce: abc123xyz789
[AUTH] Message to sign: Sign this message to authenticate with PushMe...
[AUTH] Requesting signature from wallet...
[AUTH] Encoded message length: 156
[AUTH] Received signature: Uint8Array(64) [...]
[AUTH] Signature length: 64
[AUTH] Signature hex: 1a2b3c4d...
[AUTH] Verifying signature with backend...
[API] POST http://localhost:5001/auth/verify
[API] Response from http://localhost:5001/auth/verify: {token: "...", user: {...}}
[AUTH] Signature verified, received token and user data
[AUTH] Login successful! User: {id: "...", wallet: "...", username: null}
[WALLET] Sign-in successful
```

## Next Steps After Authentication

1. **Username Modal Appears** (if no username set)
2. **Set Username** → Saves to database
3. **Can Now Donate** → Go to `/donate` page

---

**If you're still having issues, check:**
1. Browser console for errors
2. Backend logs for API errors
3. Phantom extension is working
4. Network tab for failed requests

