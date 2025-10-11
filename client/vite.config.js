import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// HTTPS certificate configuration for camera access on mobile
// Using mkcert-generated certificates
const httpsConfig = {
  key: fs.existsSync('./10.154.13.206+2-key.pem') ? fs.readFileSync('./10.154.13.206+2-key.pem') : undefined,
  cert: fs.existsSync('./10.154.13.206+2.pem') ? fs.readFileSync('./10.154.13.206+2.pem') : undefined,
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external connections
    port: 5173,
    // Enable HTTPS for camera access on mobile devices
    // If cert files don't exist, Vite will generate them automatically
    https: httpsConfig.key && httpsConfig.cert ? httpsConfig : true,
    proxy: {
      '/api': {
        target: 'https://10.154.13.206:3001',
        changeOrigin: true,
        secure: false // Allow self-signed certificates in development
      },
      '/uploads': {
        target: 'https://10.154.13.206:3001',
        changeOrigin: true,
        secure: false // Allow self-signed certificates in development
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
