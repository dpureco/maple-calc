import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Allow overriding the base path at build time by setting BASE_PATH
  // Example: BASE_PATH="/repo-name/" npm run build
  base: process.env.BASE_PATH || '/',
  plugins: [vue()],
})
