// stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any | null,
    token: null as string | null,
    menus: [] as any[],
    loading: false,
    error: '' as string,
  }),

  // This enables cookie persistence automatically
  persist: {
      pick: ['token', 'user', 'menus'], // Only persist these fields
    },

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.roles?.[0]?.name || 'user',
    firstName: (state) => {
      if (!state.user?.name) return 'Admin'
      return state.user.name.split(' ')[0]
    },
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      this.loading = true
      this.error = ''
      const { $api } = useNuxtApp()

      try {
        const res = await $api('/auth/login', {
          method: 'POST',
          body: credentials,
        })

        this.token = res.token
        this.user = res.me.user
        this.menus = res.me.menus

        return res
      } catch (err: any) {
        this.error = err?.data?.message || 'Login failed.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      if (!this.token) return

      const { $api } = useNuxtApp()
      try {
        const res = await $api('/me')
        this.user = res.user
        this.menus = res.menus
      } catch (err) {
        this.logout()
      }
    },

    logout() {
      this.$reset()  // Clears state + persisted cookies
      navigateTo('/login')
    },
  },
})