import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5180,
  },
  // In an npm-workspaces monorepo, react/react-dom can resolve as two module
  // instances (causing "Invalid hook call"). Force a single instance.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'framer-motion'],
  },
})
