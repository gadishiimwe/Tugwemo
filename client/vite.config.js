import { defineConfig } from 'vite'

export default defineConfig({
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
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/admin/, '')
      },
      '/assets': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Only proxy assets if the referer is from admin
            if (req.headers.referer && req.headers.referer.includes('/admin')) {
              return;
            }
            // For other asset requests, don't proxy
            proxyReq.destroy();
          });
        }
      },
      '/socket.io': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
