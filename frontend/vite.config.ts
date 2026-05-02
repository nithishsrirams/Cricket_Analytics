import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/batting_stats': 'http://127.0.0.1:5000',
      '/bowling_stats': 'http://127.0.0.1:5000',
      '/contracts': 'http://127.0.0.1:5000',
      '/players': 'http://127.0.0.1:5000',
      '/matches': 'http://127.0.0.1:5000',
      '/seasons': 'http://127.0.0.1:5000',
      '/teams': 'http://127.0.0.1:5000',
      '/venues': 'http://127.0.0.1:5000',
      '/analytics': 'http://127.0.0.1:5000',
    },
  },
})
