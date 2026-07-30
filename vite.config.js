import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages ("Deploy from a branch") sirve el sitio bajo
  // https://jcbarbog.github.io/App-OCR/, no en la raíz del dominio. Este base
  // path debe coincidir EXACTO (mayúsculas incluidas) con el nombre del repo.
  base: '/EBO/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        lang: 'es',
        name: 'EBO — Extracción Bibliográfica y Organizacional',
        short_name: 'EBO',
        description: 'Extrae y organiza datos bibliográficos de portadas de libros directamente en tu navegador.',
        display: 'standalone',
        theme_color: '#0d2842',
        background_color: '#0d2842',
        start_url: '/EBO/',
        scope: '/EBO/',
        orientation: 'portrait',
        icons: [
          { src: 'icons/ebo-48.png',  sizes: '48x48',   type: 'image/png' },
          { src: 'icons/ebo-96.png',  sizes: '96x96',   type: 'image/png' },
          { src: 'icons/ebo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/ebo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/ebo-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache solo el app shell (HTML/JS/CSS/íconos). Los assets pesados
        // de Tesseract (worker, núcleo WASM, datos de idioma) no son
        // necesarios para que la app sea instalable y el OCR igual requiere
        // red, así que se excluyen del precache.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        globIgnores: ['**/tesseract/**', '**/tessdata/**'],
      },
    }),
  ],
  server: {
    host: true,
  },
})
