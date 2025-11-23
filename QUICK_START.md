# 🚀 Quick Start Guide - PressMe.xyz Full Stack

## ✅ Frontend Fixes Applied

1. **Wallet Connect Button** - Now properly opens Phantom wallet modal
2. **Button Press** - Shows toast if not authenticated, navigates to `/donate` if authenticated
3. **Wallet Dropdown** - Click wallet address/username to see dropdown with disconnect option
4. **Authentication State** - Properly clears on disconnect

---

## 🔧 Backend Setup Required

### Step 1: Create Donations Table

Run the SQL migration in Supabase:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `supabase/migrations/002_donations_table.sql`
3. Copy and paste the SQL
4. Click **Run**

**OR** use Supabase CLI:
```bash
supabase db push
```

### Step 2: Create Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **New bucket**
3. Name: `pushme-media`
4. Public: **Yes** ✅
5. Click **Create**

Then run the storage policies SQL (included in migration file).

### Step 3: Apply Backend Fixes

Follow the instructions in `BACKEND_FIX_PROMPT.md` to:
- Fix `/overlay/recent` endpoint
- Fix `/donate` endpoint
- Add media upload to Supabase Storage
- Add `PATCH /auth/me` for username updates
- Improve logging

### Step 4: Start Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

**Verify:**
```bash
redis-cli ping
# Should return: PONG
```

See `REDIS_EXPLANATION.md` for why Redis is needed.

---

## 🧪 Testing

### 1. Start Backend
```bash
cd pushmebackend
npm run dev
```

### 2. Start Frontend
```bash
cd /Users/aleks/Documents/PushMe
npm run dev
```

### 3. Test Flow

1. **Connect Wallet**
   - Click "Connect Wallet" → Should open Phantom modal ✅
   - Approve connection → Should auto-login ✅

2. **Set Username**
   - Modal should appear automatically ✅
   - Set username → Should save ✅

3. **Press Button (Not Authenticated)**
   - Click red button → Should show toast "Please connect your wallet" ✅

4. **Press Button (Authenticated)**
   - Click red button → Should navigate to `/donate` ✅

5. **Send Donation**
   - Go to `/donate`
   - Select type, enter content
   - Send → Should work ✅

6. **Disconnect Wallet**
   - Click wallet address in navbar → Dropdown appears ✅
   - Click "Disconnect Wallet" → Should disconnect and clear auth ✅

7. **Overlay**
   - Open `/overlay` → Should poll every 1 second ✅
   - Send donation from another tab → Should appear on overlay ✅

---

## 📋 Checklist

- [ ] Donations table created in Supabase
- [ ] Storage bucket `pushme-media` created
- [ ] Storage policies applied
- [ ] Backend fixes applied (see BACKEND_FIX_PROMPT.md)
- [ ] Redis running (`redis-cli ping` returns PONG)
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] `.env.local` configured in frontend
- [ ] `.env.local` configured in backend

---

## 🐛 Troubleshooting

### Wallet Modal Not Opening
- Check browser console for errors
- Ensure Phantom extension is installed
- Try refreshing page

### Donations Not Saving
- Check backend logs for errors
- Verify donations table exists
- Check Supabase connection in backend

### Overlay Not Polling
- Check browser console
- Verify `/overlay/recent` endpoint works: `curl http://localhost:5001/overlay/recent`
- Check backend logs

### Redis Connection Error
- Verify Redis is running: `redis-cli ping`
- Check `REDIS_HOST` and `REDIS_PORT` in backend `.env.local`

---

## 📚 Documentation

- **Backend Fixes**: `BACKEND_FIX_PROMPT.md`
- **Redis Explanation**: `REDIS_EXPLANATION.md`
- **Testing Guide**: `TESTING_GUIDE.md`

---

**Ready to go!** 🎉

