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
    // NOTE: do NOT add the @creatorai/* workspace packages here. They ship a dual
    // build (ESM via package.json "exports".import for the browser, CJS for the Node
    // API). Vite resolves their ESM directly, so it never pre-bundles them — which
    // means a new export can't get stuck in a stale optimize cache.
    include: ['react', 'react-dom', 'lucide-react', 'framer-motion'],
  },
})
