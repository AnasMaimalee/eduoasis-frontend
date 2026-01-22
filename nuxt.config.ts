// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon',
    'pinia-plugin-persistedstate/nuxt',
  ],

  // ✅ SINGLE Tailwind config (VERY IMPORTANT)
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
    viewer: false,
  },

  css: ['~/assets/css/main.css'],

  vite: {
    server: {
      host: true,
      strictPort: true,
      allowedHosts: true,

      fs: {
        strict: false,
      },

      cors: true,

      // ✅ CRITICAL FIX
      hmr: {
        protocol: 'wss',
        clientPort: 443,
        overlay: false, // ⬅️ THIS PREVENTS STUCK CSS
      },
    },
  },

  nitro: {
    host: '0.0.0.0',
    port: 3000,
  },

  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate', 'storeToRefs'],
  },
  runtimeConfig: {
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
      appName: 'JAMB Portal',
      appDescription:
        'Print JAMB Original Results, Admission Letters & Check Status',
    },
  },

  imports: {
    dirs: ['./stores'],
  },

  app: {
    head: {
      title: 'JAMB Portal - Print Results & Admission Letters',
      meta: [
        {
          name: 'description',
          content:
            'Official platform to print JAMB original results, admission letters, check admission status.',
        },
        { name: 'theme-color', content: '#1e3a8a' },
      ],
    },
  },

  generate: {
    fallback: true,
  },

  compatibilityDate: '2024-12-01',
})
