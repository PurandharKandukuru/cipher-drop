import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.svg', 'robots.txt'],
      manifest: {
        name: 'Cipher Drop - Secure File Sharing',
        short_name: 'Cipher Drop',
        description: 'Secure file sharing with zero-knowledge encryption. Files are encrypted in your browser.',
        theme_color: '#09090B',
        background_color: '#09090B',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.svg',
            sizes: '180x180',
            type: 'image/svg+xml',
            purpose: 'apple touch icon'
          }
        ],
        categories: ['productivity', 'utilities', 'security'],
        shortcuts: [
          {
            name: 'Upload File',
            short_name: 'Upload',
            description: 'Upload a new encrypted file',
            url: '/upload',
            icons: [{ src: 'icon.svg', sizes: '512x512' }]
          },
          {
            name: 'Dashboard',
            short_name: 'Files',
            description: 'View your files',
            url: '/dashboard',
            icons: [{ src: 'icon.svg', sizes: '512x512' }]
          }
        ]
      },
      workbox: {
        // Cache strategies
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache font files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache API responses (stale-while-revalidate)
            urlPattern: /^http:\/\/localhost:5000\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          }
        ],
        // Don't cache these
        navigateFallbackDenylist: [/^\/api/],
        // Clean old caches
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: true // Enable PWA in development for testing
      }
    })
  ],
})
