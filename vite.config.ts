import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { defineConfig } from 'vite'
import packageJson from './package.json'


import { cloudflare } from "@cloudflare/vite-plugin";


// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version),
  },
  build: {
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
  },
  plugins: [
    react(),
    tailwindcss(),
    cloudflare(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['gm-toolkit-logo-black.svg', 'gm-toolkit-logo-white.svg'],
      manifest: {
        name: "GM's Toolkit",
        short_name: 'GMToolkit',
        description: 'Toolkit for D&D 5.5E Players & GMs',
        theme_color: '#181818',
        background_color: '#181818',
        icons: [
          {
            src: 'icons/PWA-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/PWA-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/maskable_icon_x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})