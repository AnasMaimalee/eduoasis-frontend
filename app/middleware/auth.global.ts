// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  const publicPages = ['/login', '/register', '/']
  if (publicPages.includes(to.path)) return

  // 🔹 Wait for Pinia persisted state to restore
  if (import.meta.client) {
    // Ensure persisted state is loaded
    await auth.$hydrate?.() // optional if using latest pinia plugin

    // Ensure user is loaded from API if token exists
    if (auth.token && !auth.user) {
      await auth.fetchUser()
    }

    // Not authenticated → redirect to login
    if (!auth.isAuthenticated) {
      return navigateTo('/login')
    }

    // Role-based protection
    const allowedRoles = to.meta.roles as string[]
    if (allowedRoles?.length && !allowedRoles.includes(auth.userRole)) {
      return navigateTo('/403')
    }
  }
})
