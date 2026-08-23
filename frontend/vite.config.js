import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/plants': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/notifications': 'http://localhost:3000',
      '/validate-email': 'http://localhost:3000'
    }
  }
})
