import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { webdavProxy } from './vite-webdav-proxy'

export default defineConfig({
  plugins: [vue(), webdavProxy()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  server: {
    host: '0.0.0.0'
  }
})