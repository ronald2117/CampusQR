# Mobile Camera Setup Guide

## Why Camera Doesn't Work on Mobile

Modern browsers require **HTTPS** to access the camera API on mobile devices for security reasons. HTTP connections will NOT work (except on localhost).

## Quick Fix: Enable HTTPS

### Option 1: Using Vite's Auto-Generated Certificate (Easiest)

The `vite.config.js` has been updated to automatically enable HTTPS. Just restart your dev server:

```bash
cd client
npm run dev
```

Vite will automatically generate a self-signed certificate and start the server with HTTPS on port 5173.

### Option 2: Generate Your Own Self-Signed Certificate

1. Create a `cert` directory in the client folder:
```bash
cd client
mkdir cert
```

2. Generate a self-signed certificate (valid for 365 days):
```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subjectALT=DNS:localhost,IP:YOUR_IP_ADDRESS -keyout cert/key.pem -out cert/cert.pem -days 365
```

Replace `YOUR_IP_ADDRESS` with your actual IP (e.g., 10.86.120.206).

3. When prompted, fill in the certificate details (you can press Enter to skip most fields).

4. Restart the Vite dev server.

## Accessing on Mobile

### Step 1: Find Your Computer's IP Address

**On Linux:**
```bash
ip addr show | grep inet
# Or simply:
hostname -I
```

**On Windows:**
```bash
ipconfig
```

**On Mac:**
```bash
ifconfig | grep inet
```

### Step 2: Access via HTTPS

Instead of accessing via HTTP:
- ❌ `http://10.86.120.206:5173` (Won't work for camera)

Access via HTTPS:
- ✅ `https://10.86.120.206:5173` (Will work for camera)

### Step 3: Accept the Security Warning

Since we're using a self-signed certificate, your mobile browser will show a security warning:

**On Chrome (Android):**
1. You'll see "Your connection is not private"
2. Click "Advanced"
3. Click "Proceed to [IP address] (unsafe)"

**On Safari (iOS):**
1. You'll see "This Connection Is Not Private"
2. Click "Show Details"
3. Click "visit this website"
4. Enter your device passcode if prompted

**On Firefox (Android):**
1. You'll see "Warning: Potential Security Risk Ahead"
2. Click "Advanced"
3. Click "Accept the Risk and Continue"

### Step 4: Grant Camera Permission

When you access the Scanner page:
1. Your browser will ask for camera permission
2. Click "Allow" or "Grant Permission"
3. The camera should now work!

## Troubleshooting

### Camera Still Not Working?

1. **Check HTTPS**: Make sure you're accessing via `https://` not `http://`
   - The Scanner page will show your current protocol

2. **Check Browser Console**: 
   - Open Developer Tools on mobile
   - Look for error messages about camera permissions

3. **Verify Camera Permission**:
   - Go to browser settings
   - Find site permissions
   - Make sure camera is allowed for your site

4. **Try Different Browser**:
   - Chrome (recommended)
   - Safari (iOS)
   - Firefox
   - Avoid older browsers

5. **Check Camera Hardware**:
   - Make sure your phone's camera works in other apps
   - Close other apps that might be using the camera

6. **Use Manual Mode**:
   - If camera still doesn't work, use the "Manual Mode" button
   - Enter student ID manually

## Production Deployment

For production, you should use a **proper SSL certificate** from a trusted Certificate Authority (CA):

### Free Options:
- **Let's Encrypt**: Free SSL certificates
  ```bash
  # Using certbot
  sudo apt install certbot
  sudo certbot certonly --standalone -d yourdomain.com
  ```

- **Cloudflare**: Free SSL with their CDN service

- **AWS Certificate Manager**: Free if using AWS

### Update vite.config.js for production:

```javascript
https: {
  key: fs.readFileSync('/path/to/ssl/privkey.pem'),
  cert: fs.readFileSync('/path/to/ssl/fullchain.pem'),
}
```

## Network Configuration

Make sure your firewall allows HTTPS traffic on port 5173:

```bash
# Ubuntu/Debian
sudo ufw allow 5173/tcp

# Or for development, allow from specific IP range
sudo ufw allow from 10.86.120.0/24 to any port 5173
```

## Testing Camera on Desktop

You can test the camera on your desktop computer:
1. Go to `https://localhost:5173`
2. Accept the self-signed certificate warning
3. Grant camera permission
4. The QR scanner should work

## Common Error Messages

| Error Message | Solution |
|--------------|----------|
| "Camera permission denied" | Allow camera access in browser settings |
| "No camera found" | Check if camera hardware is available |
| "Camera not supported" | Use a modern browser (Chrome, Safari, Firefox) |
| "NotAllowedError" | Grant camera permission when prompted |
| "NotFoundError" | Camera hardware not detected |
| "NotSupportedError" | Browser doesn't support camera API (upgrade browser) |

## Security Notes

⚠️ **Important**: Self-signed certificates are ONLY for development. For production:
- Use a proper SSL certificate from a trusted CA
- Never ignore security warnings in production
- Keep your SSL certificates up to date
- Use HTTPS everywhere, not just for camera access

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Look at the "Debug Info" section on the Scanner page
3. Verify HTTPS is enabled (check the URL bar)
4. Try accessing from a different device
5. Use Manual Mode as a fallback
