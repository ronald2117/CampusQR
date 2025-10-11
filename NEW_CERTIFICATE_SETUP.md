# 🎯 CampusQR - New Certificate Setup Complete!

## ✅ What Was Done

1. **Generated new SSL certificate** for IP: `10.154.13.206`
2. **Updated all configuration files** to use the new IP and certificate
3. **Certificate files created:**
   - `client/10.154.13.206+2.pem` (certificate)
   - `client/10.154.13.206+2-key.pem` (private key)

## 🚀 How to Start the Servers

### Option 1: Use the Startup Script (Easiest)
```bash
./start-https.sh
```

### Option 2: Start Manually

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## 📱 Access URLs

### From Your Computer:
- **Frontend**: https://localhost:5173
- **Backend**: https://localhost:3001/api/health

### From Mobile Device:
- **Frontend**: https://10.154.13.206:5173
- **Backend**: https://10.154.13.206:3001/api/health

## ⚠️ IMPORTANT: First-Time Access Steps

### On Desktop Browser:

1. **Visit backend first**: https://localhost:3001/api/health
   - Click "Advanced" → "Proceed to localhost (unsafe)"
   - You should see: `{"status":"OK",...}`

2. **Then visit frontend**: https://localhost:5173
   - Click "Advanced" → "Proceed to localhost (unsafe)"
   - You should see the login page

### On Mobile Browser:

1. **Visit backend first**: https://10.154.13.206:3001/api/health
   - Accept the security warning
   - You should see: `{"status":"OK",...}`

2. **Then visit frontend**: https://10.154.13.206:5173
   - Accept the security warning
   - Login and use the app

**Why?** Self-signed certificates need to be accepted individually for each domain/port combination.

## 🔐 Login Credentials

Default admin account:
- **Email**: admin@campusqr.com
- **Password**: admin123

## 📸 Testing Camera on Mobile

1. Access: https://10.154.13.206:5173
2. Accept certificate warnings (both backend and frontend)
3. Login with credentials above
4. Go to "Scanner" page
5. Grant camera permission when prompted
6. Camera should work! 📱✨

## 🔧 Troubleshooting

### Can't login / Connection refused

**Problem**: You haven't accepted the backend certificate yet

**Solution**:
```bash
# Visit this URL in your browser first:
https://10.154.13.206:3001/api/health

# Accept the certificate warning
# You should see: {"status":"OK","timestamp":"...","version":"1.0.0"}
```

### Mixed Content Error

**Problem**: Something is still using HTTP instead of HTTPS

**Solution**: Make sure both servers are running with HTTPS:
```bash
# Check backend logs - should say "HTTPS Server running"
# Check frontend - URL should start with https://
```

### Certificate expired or invalid

**Problem**: Need to regenerate certificate

**Solution**:
```bash
cd client
mkcert 10.154.13.206 localhost 127.0.0.1
# Restart both servers
```

### Camera still not working

**Checklist**:
- ✅ Both servers running with HTTPS
- ✅ Accessed via https:// (not http://)
- ✅ Accepted certificate warnings on mobile
- ✅ Backend certificate accepted (visit /api/health first)
- ✅ Frontend certificate accepted
- ✅ Camera permission granted
- ✅ Using Chrome, Safari, or Firefox (latest version)

## 🌐 Network Info

**Current IP**: 10.154.13.206

**Certificate valid for**:
- 10.154.13.206
- localhost
- 127.0.0.1

**Expires**: January 12, 2028

## 📝 Configuration Files Updated

- ✅ `client/vite.config.js` - Certificate paths and proxy
- ✅ `client/.env` - API URL
- ✅ `server/index.js` - Certificate paths

## 🔄 If Your IP Changes

Run this command to generate a new certificate:
```bash
cd client
mkcert YOUR_NEW_IP localhost 127.0.0.1
```

Then update:
1. `client/.env` - VITE_API_URL
2. `client/vite.config.js` - Certificate filenames and proxy target
3. `server/index.js` - Certificate paths

## 🎉 Quick Test

```bash
# Test backend
curl -k https://10.154.13.206:3001/api/health

# Should return:
# {"status":"OK","timestamp":"...","version":"1.0.0"}
```

## 📞 Support

If you're still having issues:
1. Check both server logs for errors
2. Check browser console for error messages
3. Verify you can access the backend health endpoint
4. Make sure firewall isn't blocking ports 3001 or 5173
5. Try using Manual Mode on Scanner page as a fallback

---

**All set!** 🚀 You can now use the QR scanner on your mobile device!
