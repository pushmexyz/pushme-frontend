# 🔴 Redis Explanation for PressMe Backend

## What is Redis?

Redis (Remote Dictionary Server) is an **in-memory data store** that acts as a super-fast database/cache. Think of it as a super-fast key-value store that lives in RAM instead of on disk.

---

## Why Does PressMe Backend Need Redis?

Your backend uses **BullMQ** for job queues, and BullMQ **requires Redis** to function.

### What is BullMQ?

BullMQ is a job queue system that lets you:
- Process tasks **asynchronously** (in the background)
- Retry failed jobs automatically
- Schedule jobs for later
- Process jobs in parallel with multiple workers

### Why Use Job Queues?

Instead of processing everything immediately when a request comes in, you can:

1. **Accept the request immediately** (fast response to user)
2. **Queue the work** (add to Redis queue)
3. **Process it later** (worker picks it up)

This makes your API **much faster** because users don't have to wait for:
- Media processing/uploading
- Payment verification
- Database writes
- Sending notifications

---

## How Redis Works in PressMe

### 1. **Job Queue Storage**
When a donation comes in:
```
User sends donation → Backend accepts → Creates job → Stores in Redis → Returns success
                                                          ↓
                                                    Worker processes
```

### 2. **What Gets Queued?**

Based on your backend code, these jobs are queued:

- **Donation Processing** (`donationQueue`)
  - Verify payment
  - Process media
  - Save to database
  - Broadcast to overlay

- **Media Processing** (`mediaQueue`)
  - Upload images/GIFs/audio to Supabase Storage
  - Resize/optimize images
  - Generate thumbnails

- **Overlay Events** (`overlayQueue`)
  - Broadcast donation events to WebSocket clients
  - Send notifications

### 3. **Redis Data Structure**

Redis stores jobs like this:
```
Key: "bull:donationQueue:123"
Value: {
  id: "123",
  data: { donation: {...} },
  status: "waiting"
}
```

---

## How to Run Redis

### Option 1: Local Redis (Development)

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Windows:**
Download from: https://redis.io/download
Or use Docker (see below)

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

### Option 2: Docker (Easiest)

```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### Option 3: Cloud Redis (Production)

- **Redis Cloud** (free tier available): https://redis.com/try-free/
- **AWS ElastiCache**
- **DigitalOcean Managed Redis**

---

## Redis Configuration

Your backend `.env.local` should have:
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Leave empty for local, set for production
```

---

## What Happens Without Redis?

If Redis is not running:
- ❌ BullMQ queues won't work
- ❌ Background jobs won't process
- ❌ Donations might fail to save
- ❌ Media won't upload
- ❌ Backend might crash on startup

**Error you'll see:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

---

## Redis Commands (For Debugging)

```bash
# Connect to Redis CLI
redis-cli

# See all keys
KEYS *

# See queue jobs
KEYS bull:*

# Clear all data (CAREFUL!)
FLUSHALL

# Monitor commands in real-time
MONITOR
```

---

## Summary

**Redis is required because:**
1. ✅ BullMQ needs it for job queues
2. ✅ Enables async processing (faster API)
3. ✅ Handles retries and scheduling
4. ✅ Allows parallel processing

**Without Redis:**
- ❌ Backend won't work properly
- ❌ Jobs won't process
- ❌ Donations might fail

**Start Redis before starting backend:**
```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start Backend
npm run dev
```

---

**TL;DR:** Redis = Fast in-memory storage that BullMQ uses to manage background jobs. You need it running for the backend to work properly! 🚀

