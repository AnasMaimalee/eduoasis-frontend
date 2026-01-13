import { navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  // Client-only auth checks
  if (import.meta.client) {
    if (!auth.token) {
      return navigateTo('/login')
    }
    if (!auth.user) {
      try {
        await auth.fetchUser()
      } catch (e) {
        auth.logout()
        return navigateTo('/login')
      }
    }
  } else {
    // Server: skip auth (use public layout or loading)
    return
  }

  // Role-based access (now safe post-hydration)
  const allowedRoles = to.meta.roles as string[] | undefined
  if (allowedRoles && !allowedRoles.includes(auth.userRole)) {
    return navigateTo('/login')
  }
})
