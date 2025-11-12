import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/assets': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true
      }
    },
    configureServer(server) {
      // Handle admin routes by not serving index.html for them
      server.middlewares.use('/admin', (req, res, next) => {
        // Let the proxy handle admin routes
        next();
      });
      // Handle assets for admin
      server.middlewares.use('/assets', (req, res, next) => {
        // Let the proxy handle assets
        next();
      });
    }
  },
  build: {
    outDir: 'dist'
  }
})
