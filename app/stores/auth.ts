// stores/auth.ts - MINIMAL CHANGES (3 lines only!)

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any | null,
    token: null as string | null,
    role: '' as string,  // ✅ ADD THIS LINE
    menus: [] as any[],
    loading: false,
    error: '' as string,
  }),

  // ✅ UPDATE THIS GETTER (1 line change)
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.role || state.user?.roles?.[0]?.name || state.user?.role || 'user',  // FIXED
    firstName: (state) => {
      if (!state.user?.name) return 'User'
      return state.user.name.split(' ')[0]
    },
  },

  actions: {
    // Keep normalizeMenus EXACTLY the same
    normalizeMenus(rawMenus: any[]) {
      console.log('🔧 RAW API menus:', rawMenus);
      return (rawMenus || []).map((menu, index) => {
        const normalizedMenu = {
          label: menu.title || menu.label || menu.name || `Menu ${index + 1}`,
          key: menu.route || menu.key || menu.title?.toLowerCase().replace(/\s+/g, '-') || `menu-${index}`,
          icon: menu.icon || 'BoxPlotOutlined',
          children: undefined as any[]
        };

        if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
          normalizedMenu.children = menu.children.map((child: any, childIndex: number) => ({
            label: child.title || child.label || child.name || `Child ${childIndex + 1}`,
            key: child.route || child.key || child.title?.toLowerCase().replace(/\s+/g, '-') || `child-${childIndex}`,
            icon: child.icon || 'BoxPlotOutlined',
          }));
        }

        console.log(`✅ Normalized menu ${index}:`, normalizedMenu);
        return normalizedMenu;
      });
    },

    /* LOGIN - MINIMAL CHANGE (add 2 lines) */
    async login(credentials: { email: string; password: string; two_fa_code?: string }) {
      this.loading = true
      this.error = ''

      try {
        const { $api } = useNuxtApp()
        const res = await $api('/auth/login', {  // ✅ Fixed endpoint
          method: 'POST',
          body: credentials,
        })

        this.token = res.token
        this.user = res.user || res.me?.user || res.data?.user
        
        // ✅ ADD THESE 2 LINES ONLY
        this.role = res.role || res.user?.role || 'user'
        
        const rawMenus = res.menus || res.me?.menus || res.data?.menus || []
        this.menus = this.normalizeMenus(rawMenus)

        console.log('✅ Login success:', {
          hasUser: !!this.user,
          userRole: this.userRole,
          role: this.role,  // ✅ Debug new field
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

    // Keep fetchUser EXACTLY the same
    async fetchUser() {
      console.log('🔍 fetchUser called, token exists:', !!this.token)

      if (!this.token) return

      const { $api } = useNuxtApp()

      try {
        const res = await $api('/me')
        console.log('📡 /me raw response:', res)

        this.user = res.user || res.me?.user || res.data?.user || res
        
        // ✅ ADD THIS LINE
        this.role = res.role || res.user?.role || 'user'

        const rawMenus = res.menus || res.me?.menus || res.data?.menus || []
        this.menus = this.normalizeMenus(rawMenus)

        console.log('✅ fetchUser success:', {
          hasUser: !!this.user,
          userRole: this.userRole,
          role: this.role,
          menusCount: this.menus.length,
        })
      } catch (err: any) {
        console.error('❌ fetchUser failed:', err?.status, err?.data)
        this.logout()
      }
    },

    // Keep logout & ensureUserLoaded EXACTLY the same
    logout() {
      console.log('🔐 Logging out...')
      this.$reset()
    },

    async ensureUserLoaded() {
      if (this.token && !this.user) {
        await this.fetchUser()
      }
      return this.isAuthenticated
    },
  },
})
