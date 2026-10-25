import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.ico', 'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'BodePOS',
        short_name: 'BodePOS',
        description: 'Punto de venta para bodegas',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  resolve: {
    alias: { '@': '/src' },
    // Evita que .js transpilados en src ganen sobre .tsx/.ts (Vite prioriza .js por defecto).
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  server: { host: true, port: 5350, strictPort: true },
});
