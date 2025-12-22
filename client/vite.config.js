import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// HTTPS certificate configuration for camera access on mobile
// Using mkcert-generated certificates
const httpsConfig = {
  key: fs.existsSync('./192.168.1.16+2-key.pem') ? fs.readFileSync('./192.168.1.16+2-key.pem') : undefined,
  cert: fs.existsSync('./192.168.1.16+2.pem') ? fs.readFileSync('./192.168.1.16+2.pem') : undefined,
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
        target: 'https://192.168.1.16:3001',
        changeOrigin: true,
        secure: false // Allow self-signed certificates in development
      },
      '/uploads': {
        target: 'https://192.168.1.16:3001',
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
