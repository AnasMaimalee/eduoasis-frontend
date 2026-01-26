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
      hmr: {
        protocol: 'ws',
        overlay: false,
      },
    },
  },

  devServer: {
    https: false
  },
 
  nitro: {
    host: '0.0.0.0',
    port: 3000,
  },

  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate', 'storeToRefs'],
  },

  // ✅ FIXED: Added ALL your Pusher vars + kept your existing ones
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
      appName: 'JAMB Portal',
      appDescription: 'Print JAMB Original Results, Admission Letters & Check Status',
      
      // ✅ PUSHER VARS ADDED HERE 👇
      pusherAppKey: process.env.NUXT_PUBLIC_PUSHER_APP_KEY,
      pusherAppCluster: process.env.NUXT_PUBLIC_PUSHER_APP_CLUSTER,
      pusherAppId: process.env.NUXT_PUBLIC_PUSHER_APP_ID,
      pusherAppSecret: process.env.NUXT_PUBLIC_PUSHER_APP_SECRET,
    },
  },

  imports: {
    dirs: ['./stores'],
  },

  app: {
    head: {
      title: 'EduOasis Portal - Print Results & Admission Letters',
      meta: [
        {
          name: 'description',
          content: 'Official platform to print JAMB original results, admission letters, check admission status.',
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
