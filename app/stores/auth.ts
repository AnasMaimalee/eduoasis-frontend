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

  persist: {
    pick: ['token', 'user', 'menus'],
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
   
    normalizeMenus(rawMenus: any[]) {
      console.log('🔧 RAW API menus:', rawMenus); // DEBUG
      
      return (rawMenus || []).map((menu, index) => {
        const normalizedMenu = {
          label: menu.title || menu.label || menu.name || `Menu ${index + 1}`,
          key: menu.route || menu.key || menu.title?.toLowerCase().replace(/\s+/g, '-') || `menu-${index}`,
          icon: menu.icon || 'BoxPlotOutlined',
          children: undefined as any[]
        };

        // Handle children (CBT Management etc.)
        if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
          normalizedMenu.children = menu.children.map((child: any, childIndex: number) => ({
            label: child.title || child.label || child.name || `Child ${childIndex + 1}`,
            key: child.route || child.key || child.title?.toLowerCase().replace(/\s+/g, '-') || `child-${childIndex}`,
            icon: child.icon || 'BoxPlotOutlined',
          }));
        }

        console.log(`✅ Normalized menu ${index}:`, normalizedMenu); // DEBUG
        return normalizedMenu;
      });
    },
    /* =====================================================
     * 🔐 LOGIN
     * ===================================================== */
    async login(credentials: { email: string; password: string }) {
      this.loading = true
      this.error = ''

      try {
        const { $api } = useNuxtApp()
        const res = await $api('/auth/login', {
          method: 'POST',
          body: credentials,
        })

        this.token = res.token
        this.user = res.user || res.me?.user || res.data?.user

        const rawMenus = res.menus || res.me?.menus || res.data?.menus || []
        this.menus = this.normalizeMenus(rawMenus)

        console.log('✅ Login success:', {
          hasUser: !!this.user,
          userRole: this.userRole,
          menusCount: this.menus.length,
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

    /* =====================================================
     * 👤 FETCH USER (/me)
     * ===================================================== */
    async fetchUser() {
      console.log('🔍 fetchUser called, token exists:', !!this.token)

      if (!this.token) return

      const { $api } = useNuxtApp()

      try {
        const res = await $api('/me')
        console.log('📡 /me raw response:', res)

        this.user = res.user || res.me?.user || res.data?.user || res

        const rawMenus = res.menus || res.me?.menus || res.data?.menus || []
        this.menus = this.normalizeMenus(rawMenus)

        console.log('✅ fetchUser success:', {
          hasUser: !!this.user,
          userRole: this.userRole,
          roles: this.user?.roles,
          menusCount: this.menus.length,
        })
      } catch (err: any) {
        console.error('❌ fetchUser failed:', err?.status, err?.data)
        this.logout()
      }
    },

    /* =====================================================
     * 🔐 LOGOUT
     * ===================================================== */
    logout() {
      console.log('🔐 Logging out...')
      this.$reset()
    },

    /* =====================================================
     * 🔁 ENSURE USER
     * ===================================================== */
    async ensureUserLoaded() {
      if (this.token && !this.user) {
        await this.fetchUser()
      }
      return this.isAuthenticated
    },
  },
})
