import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BodePOS',
        short_name: 'BodePOS',
        description: 'Punto de venta para bodegas',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
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
