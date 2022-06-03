import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
  },
  base: process.env.NODE_ENV === 'production' ? '/vue3-lazyload/' : '/',
  build: {
    outDir: 'example/dist',
  },
})
