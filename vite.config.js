import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages, set base to '/help-taipo/' if repo name is help-taipo
  // For custom domain or root deployment, use '/'
  base: process.env.GITHUB_PAGES === 'true' ? '/help-taipo/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
