/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode, command, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // V dev režime bežíme na "/", pri builde a náhľade berieme cestu z VITE_BASE_URL.
  let base = '/';
  if ((command === 'build' || isPreview) && env.VITE_BASE_URL) {
    base = new URL(env.VITE_BASE_URL).pathname;
  }
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Abeceda',
          short_name: 'Abeceda',
          description: 'Učíme sa písmenká A–E',
          lang: 'sk',
          start_url: '.',
          scope: '.',
          display: 'standalone',
          orientation: 'any',
          background_color: '#ffffff',
          theme_color: '#68B448',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,mp3,webmanifest}'],
          navigateFallback: 'index.html',
        },
      }),
    ],
    test: { include: ['tests/**/*.test.ts'] },
  };
});
