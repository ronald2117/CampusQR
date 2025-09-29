import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external connections
    port: 5173,
    https: {
      key: fs.readFileSync('./192.168.1.16+2-key.pem'),
      cert: fs.readFileSync('./192.168.1.16+2.pem'),
    },
    proxy: {
      '/api': {
        target: 'http://192.168.1.16:3001',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://192.168.1.16:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
