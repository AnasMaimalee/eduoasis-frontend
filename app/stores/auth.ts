// stores/auth.ts - ✅ FIXED COMPLETE VERSION (No persistedState error)
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any | null,
    token: null as string | null,
    menus: [] as any[],
    loading: false,
    error: '' as string,
  }),

  // ✅ FIXED: Simple persist config (no persistedState reference)
  persist: {
    pick: ['token', 'user', 'menus'], // Works with pinia-plugin-persistedstate/nuxt module
  },

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.roles?.[0]?.name || 'user',
    firstName: (state) => {
      if (!state.user?.name) return 'User'
      return state.user.name.split(' ')[0]
    },
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      this.loading = true
      this.error = ''
      
      try {
        const { $api } = useNuxtApp()
        const res = await $api('/auth/login', {
          method: 'POST',
          body: credentials,
        })

        // ✅ NORMALIZED: Handle both nested & flat responses
        this.token = res.token
        this.user = res.user || res.me?.user || res.data?.user
        this.menus = res.menus || res.me?.menus || res.data?.menus || []
        
        console.log('✅ Login success:', {
          hasUser: !!this.user,
          userRole: this.userRole,
          menusCount: this.menus.length
        })

        return res
      } catch (err: any) {
        this.error = err?.data?.message || 'Login failed'
        console.error('❌ Login error:', this.error)
        throw err
      } finally {
        this.loading = false
      }
    },

    // ✅ FIXED: Match login response structure exactly
    async fetchUser() {
      console.log('🔍 fetchUser called, token exists:', !!this.token)
      
      if (!this.token) {
        console.log('❌ No token, skipping fetchUser')
        return
      }

      const { $api } = useNuxtApp()
      
      try {
        const res = await $api('/me')
        console.log('📡 /me raw response:', res)

        // ✅ NORMALIZED: Handle ALL possible API response structures
        this.user = res.user || res.me?.user || res.data?.user || res
        this.menus = res.menus || res.me?.menus || res.data?.menus || []
        
        console.log('✅ fetchUser success:', {
          hasUser: !!this.user,
          userRole: this.userRole,
          roles: this.user?.roles,
          menusCount: this.menus.length
        })
      } catch (err: any) {
        console.error('❌ fetchUser failed:', err?.status, err?.data)
        this.logout()
      }
    },

    logout() {
      console.log('🔐 Logging out...')
      this.$reset()  // Clears everything
    },

    // ✅ BONUS: Auto-refresh if token exists but user missing
    async ensureUserLoaded() {
      if (this.token && !this.user) {
        await this.fetchUser()
      }
      return this.isAuthenticated
    }
  },
})
