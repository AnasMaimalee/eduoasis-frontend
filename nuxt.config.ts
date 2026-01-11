// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon',
    'pinia-plugin-persistedstate/nuxt'
  ],
  vite: {
  server: {
    host: true,
    strictPort: true,

    // ✅ allow ngrok domain
    allowedHosts: true,

    // ✅ disable filesystem restriction (required for Nuxt dev)
    fs: {
      strict: false
    },

    // ✅ disable origin check (THIS IS THE MISSING PART)
    cors: true,

    // ✅ HMR fix for ngrok
    hmr: {
      protocol: 'wss',
      clientPort: 443
    }
  }
},

  nitro: {
    host: '0.0.0.0',  // ✅ ALL interfaces
    port: 3000
  }, 

  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate', 'storeToRefs'],
  },

  // ✅ SINGLE runtimeConfig BLOCK
 runtimeConfig: {
  public: {
     apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
     appName: 'JAMB Portal',
     appDescription: 'Print JAMB Original Results, Admission Letters & Check Status',
  },
},


  imports: {
    dirs: ['./stores'],
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'JAMB Portal - Print Results & Admission Letters',
      meta: [
        {
          name: 'description',
          content: 'Official platform to print JAMB original results, admission letters, check admission status.',
        },
        { name: 'theme-color', content: '#1e3a8a' },
      ],
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },

  compatibilityDate: '2024-12-01',
})
