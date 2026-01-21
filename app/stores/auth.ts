// stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any | null,
    token: null as string | null,
    role: '' as string,
    menus: [] as any[],
    loading: false,
    loadingWithDevice: false,
    error: '' as string,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => {
      if (state.role) return state.role
      if (state.user?.roles && state.user.roles.length > 0) return state.user.roles[0].name
      if (state.user?.role) return state.user.role
      return 'user'
    },
    firstName: (state) => {
      if (!state.user?.name) return 'User'
      return state.user.name.split(' ')[0]
    },
  },

  actions: {
    // ---------------- Helper methods ----------------
    base64urlToUint8Array(base64url: string) {
      const padding = '='.repeat((4 - (base64url.length % 4)) % 4)
      const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/')
      const raw = atob(base64)
      return Uint8Array.from(raw, c => c.charCodeAt(0))
    },

    bufferToBase64url(buffer: ArrayBuffer) {
      const bytes = new Uint8Array(buffer)
      let binary = ''
      bytes.forEach(b => (binary += String.fromCharCode(b)))
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    },

    // ---------------- Menu normalization ----------------
    normalizeMenus(rawMenus: any[]) {
      return (rawMenus || []).map((menu, index) => {
        const normalizedMenu = {
          label: menu.title || menu.label || menu.name || `Menu ${index + 1}`,
          key:
            menu.route ||
            menu.key ||
            menu.title?.toLowerCase().replace(/\s+/g, '-') ||
            `menu-${index}`,
          icon: menu.icon || 'BoxPlotOutlined',
          children: undefined as any[],
        }

        if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
          normalizedMenu.children = menu.children.map((child: any, childIndex: number) => ({
            label: child.title || child.label || child.name || `Child ${childIndex + 1}`,
            key:
              child.route ||
              child.key ||
              child.title?.toLowerCase().replace(/\s+/g, '-') ||
              `child-${childIndex}`,
            icon: child.icon || 'BoxPlotOutlined',
          }))
        }

        return normalizedMenu
      })
    },

    // ---------------- Normal Login ----------------
    async login(credentials: { email: string; password: string; two_fa_code?: string }) {
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
        this.role = res.role || res.user?.role || 'user'

        const rawMenus = res.menus || res.me?.menus || res.data?.menus || []
        this.menus = this.normalizeMenus(rawMenus)

        return res
      } catch (err: any) {
        this.error = err?.data?.message || 'Login failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    // ---------------- Fetch Current User ----------------
    async fetchUser() {
      if (!this.token) return

      const { $api } = useNuxtApp()

      try {
        const res = await $api('/me')
        this.user = res.user || res.me?.user || res.data?.user || res
        this.role = res.role || res.user?.role || 'user'

        const rawMenus = res.menus || res.me?.menus || res.data?.menus || []
        this.menus = this.normalizeMenus(rawMenus)
      } catch (err: any) {
        this.logout()
      }
    },

    // ---------------- Device Login (WebAuthn) ----------------
    // In stores/auth.ts - Replace the entire loginWithDevice() method
    async loginWithDevice(optionsFromBackend?: any) {
      this.loadingWithDevice = true
      try {
        // ✅ Fix 1: Ensure Nuxt context OR use direct fetch
        const { $api } = process.client ? useNuxtApp() : { $api: null }
        
        if (!navigator.credentials || !window.PublicKeyCredential) {
          throw new Error('Device login not supported on this browser.')
        }

        // ✅ Fix 2: Robust options fetching with fallback
        let options = optionsFromBackend
        if (!options && $api) {
          options = await $api('/webauthn/login/options', { method: 'POST' })
        }
        
        if (!options?.publicKey) {
          throw new Error('Failed to get WebAuthn options from server')
        }

        const publicKey: PublicKeyCredentialRequestOptions = {
          challenge: this.base64urlToUint8Array(options.publicKey.challenge),
          rpId: options.publicKey.rpId,
          userVerification: options.publicKey.userVerification,
          allowCredentials: (options.publicKey.allowCredentials || []).map((cred: any) => ({
            id: this.base64urlToUint8Array(cred.id),
            type: cred.type,
          })),
        }

        const credential = await navigator.credentials.get({ publicKey }) as PublicKeyCredential
        if (!credential) throw new Error('Authentication cancelled')

        // ✅ Fix 3: Ensure API call works
        const res = $api ? await $api('/webauthn/login', {
          method: 'POST',
          body: {
            id: credential.id,
            rawId: this.bufferToBase64url(credential.rawId),
            type: credential.type,
            response: {
              authenticatorData: this.bufferToBase64url(
                (credential.response as AuthenticatorAssertionResponse).authenticatorData
              ),
              clientDataJSON: this.bufferToBase64url(
                (credential.response as AuthenticatorAssertionResponse).clientDataJSON
              ),
              signature: this.bufferToBase64url(
                (credential.response as AuthenticatorAssertionResponse).signature
              ),
              userHandle:
                (credential.response as AuthenticatorAssertionResponse).userHandle
                  ? this.bufferToBase64url(
                      (credential.response as AuthenticatorAssertionResponse).userHandle!
                    )
                  : null,
            },
          },
        }) : null

        if (!res?.token) {
          throw new Error('Device authentication failed - no token received')
        }

        // ✅ Rest stays EXACTLY the same - menus will now populate
        this.token = res.token
        this.user = res.user || res.me?.user || res.data?.user
        this.role = res.role || res.user?.role || 'user'

        const rawMenus = res.menus || res.me?.menus || res.data?.menus || []
        this.menus = this.normalizeMenus(rawMenus)

        return res
      } catch (err: any) {
        console.error('Device login error:', err)
        throw err
      } finally {
        this.loadingWithDevice = false
      }
    },


    // ---------------- Logout ----------------
    logout() {
      console.log('🔐 Logging out...')
      this.$reset()
    },

    // ---------------- Ensure User Loaded ----------------
    async ensureUserLoaded() {
      if (this.token && !this.user) {
        await this.fetchUser()
      }
      return this.isAuthenticated
    },
  },
})
