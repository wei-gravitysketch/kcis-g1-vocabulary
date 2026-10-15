import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the project under /<repo-name>/
export default defineConfig({
  base: '/kcis-g1-vocabulary/',
  plugins: [react(), tailwindcss()],
})
