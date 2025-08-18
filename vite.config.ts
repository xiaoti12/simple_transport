import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api/webdav-proxy': {
        target: 'https://app.koofr.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/webdav-proxy/, '/dav'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'WebDAV-Client/1.0')
          })
        }
      }
    }
  }
})