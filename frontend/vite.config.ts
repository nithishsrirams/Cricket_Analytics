import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = 'http://127.0.0.1:5000'

const apiProxy = (): ProxyOptions => ({
  target: apiTarget,
  bypass: (request) => {
    if (request.headers.accept?.includes('text/html')) {
      return '/index.html'
    }
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/batting_stats': apiProxy(),
      '/bowling_stats': apiProxy(),
      '/contracts': apiProxy(),
      '/players': apiProxy(),
      '/matches': apiProxy(),
      '/seasons': apiProxy(),
      '/teams': apiProxy(),
      '/venues': apiProxy(),
      '/analytics': apiProxy(),
    },
  },
})
