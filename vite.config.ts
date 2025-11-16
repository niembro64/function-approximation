import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/function-approximation/',
  server: {
    host: true, // Expose on network
    port: 3000, // Completely different port
  },
})
