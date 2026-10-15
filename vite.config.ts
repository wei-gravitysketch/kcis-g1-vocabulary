import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the project under /<repo-name>/
export default defineConfig({
  base: '/kcis-g1-vocabulary/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // Two pages: the app, and the standalone "all words" table.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        words: fileURLToPath(new URL('./words.html', import.meta.url)),
      },
    },
  },
})
