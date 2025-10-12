# 🚨 CRITICAL: QR Code Still Not Working? Follow These Steps

## ❗ Important Information

The QR code you're scanning was probably generated **BEFORE** the ENCRYPTION_KEY was added. This means:

❌ **Old QR Code** (generated before adding ENCRYPTION_KEY) → Won't work  
✅ **New QR Code** (generated after server restart with ENCRYPTION_KEY) → Will work

## 🔧 Step-by-Step Fix

### Step 1: Verify ENCRYPTION_KEY is Set

Check your `server/.env` file:
```bash
cat server/.env | grep ENCRYPTION_KEY
```

You should see:
```
ENCRYPTION_KEY=campusqr_secure_encryption_key_2025_do_not_share
```

If not, add it now.

### Step 2: Restart Backend Server (CRITICAL!)

**Stop the current server:**
- Press `Ctrl+C` in the terminal running the server

**Start it again:**
```bash
cd server
npm start
```

You should see:
```
✅ Database connected successfully
🚀 HTTPS Server running on port 3001
🔒 HTTPS Enabled (for camera access on mobile)
```

### Step 3: Generate a BRAND NEW QR Code

**On Desktop:**
1. Go to `https://10.154.13.206:5173` (or localhost:5173)
2. Login with: admin@campusqr.com / admin123
3. Click **Students** in the sidebar
4. Click on any student (e.g., the first one in the list)
5. Click **"Generate QR Code"** button
6. A QR code will appear

**IMPORTANT**: This QR code is freshly generated with the new encryption key!

### Step 4: Test on Mobile

**Option A: Display on Screen**
1. Keep the QR code displayed on your desktop monitor
2. On mobile, go to Scanner page
3. Point mobile camera at the desktop screen
4. Should scan successfully!

**Option B: Download and Display**
1. Right-click the QR code → Save image
2. Send to your phone (email, WhatsApp, etc.)
3. Open image on phone
4. Use another phone/tablet to scan it

### Step 5: Check Server Logs

While scanning, watch the backend server terminal. You should see:
```
=== Scan Verification Request ===
Location: [your location]
QR Data received: [encrypted data]...
User: [user id]
=== QR Code Validation Debug ===
Received encrypted data: ...
Decrypted data: {"id":...}
Parsed QR data: { id: ..., studentId: ..., name: ... }
✅ QR code validation successful
```

If you see errors, they will appear here.

## 🐛 Common Issues

### Issue 1: "Invalid QR code" Error

**Cause**: QR code was generated before ENCRYPTION_KEY was added

**Solution**: Generate a NEW QR code (Step 3 above)

### Issue 2: "Student not found" Error

**Cause**: Student might not exist or is inactive

**Solution**:
```sql
-- Check in database
SELECT id, student_id, name, active, enrollment_status FROM students;
```

Make sure the student exists and:
- `active = 1`
- `enrollment_status = 'active'`

### Issue 3: "Access denied - Inactive enrollment status"

**Cause**: Student enrollment_status is not "active"

**Solution**:
1. Go to Students page
2. Click Edit on the student
3. Change "Enrollment Status" to "Active"
4. Save
5. Try scanning again (same QR code will work)

### Issue 4: Network/Connection Error

**Cause**: Mobile can't reach backend API

**Solution**:
1. On mobile browser, first visit: `https://10.154.13.206:3001/api/health`
2. Accept certificate warning
3. Should see: `{"status":"OK",...}`
4. Then go back to Scanner page and try again

## 🔍 Debug Mode

To see exactly what's happening, check the backend terminal while scanning. You'll see detailed logs like:

```
=== Scan Verification Request ===
Location: Main Gate
QR Data received: a3f2b1c4d5e6f7...
=== QR Code Validation Debug ===
Received encrypted data: a3f2b1c4d5e6f7... (length: 256)
Decrypted data: {"id":18,"studentId":"2024-0001","name":"John Doe","timestamp":1728724186000,"version":"1.0"}
Parsed QR data: { id: 18, studentId: '2024-0001', name: 'John Doe', timestamp: 1728724186000, version: '1.0' }
✅ QR code validation successful
```

If you see an error, it will tell you exactly what went wrong.

## ✅ Verification Checklist

Before scanning, verify ALL of these:

- [ ] ENCRYPTION_KEY added to server/.env
- [ ] Backend server RESTARTED after adding ENCRYPTION_KEY
- [ ] NEW QR code generated AFTER server restart
- [ ] Backend server showing "HTTPS Server running on port 3001"
- [ ] Mobile can access https://10.154.13.206:3001/api/health
- [ ] Mobile can access https://10.154.13.206:5173
- [ ] Logged into Scanner page on mobile
- [ ] Location field filled in on Scanner page
- [ ] Student exists in database
- [ ] Student is active (active=1)
- [ ] Student enrollment_status = 'active'

## 📞 Still Not Working?

If you've done ALL the above and it still doesn't work:

1. **Check the backend terminal logs** - Copy the exact error message
2. **Check the mobile browser console** - Open developer tools on mobile
3. **Verify the student data**:
   ```bash
   # In MySQL
   SELECT * FROM students WHERE id = 18;
   ```
4. **Test with a different student** - Try generating QR for another student

## 🎯 Quick Test Command

Run this to verify everything:

```bash
# Test 1: Check env var
grep ENCRYPTION_KEY server/.env

# Test 2: Test backend
curl -k https://10.154.13.206:3001/api/health

# Test 3: Check students (after logging in on browser)
# Go to: https://10.154.13.206:5173
# Login and generate QR code
```

## 💡 Pro Tip

The most common issue is scanning an OLD QR code that was generated before the encryption key was added. Always generate a fresh QR code after any configuration changes!

---

**Remember**: QR codes are now permanent, but they must be generated with the correct encryption key!
