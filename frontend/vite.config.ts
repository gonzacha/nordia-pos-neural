import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Nordia POS - Red Neural Comercial',
        short_name: 'Nordia POS',
        description: 'POS móvil con inteligencia colectiva para PyMEs',
        theme_color: '#10b981',
        background_color: '#0b0f10',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        categories: ['business', 'productivity'],
        shortcuts: [
          {
            name: 'Nueva Venta',
            short_name: 'Venta',
            description: 'Registrar nueva venta',
            url: '/pos?shortcut=new-sale',
            icons: [{ src: 'shortcut-sale.png', sizes: '96x96' }]
          },
          {
            name: 'Inventario',
            short_name: 'Stock',
            description: 'Ver inventario',
            url: '/inventory',
            icons: [{ src: 'shortcut-inventory.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.nordia\.app\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'nordia-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 300
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-apis-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          utils: ['axios', '@tanstack/react-query']
        }
      }
    }
  }
})
