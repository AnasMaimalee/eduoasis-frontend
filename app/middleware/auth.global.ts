// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  // ✅ 1. Skip auth checks on public pages
  const publicPages = ['/login', '/register', '/']
  const isPublicPage = publicPages.includes(to.path)
  
  if (isPublicPage) return // Skip entirely

  // ✅ 2. Client-only token/user validation
  if (import.meta.client) {
    // Ensure user loaded
    if (auth.token && !auth.user) {
      await auth.fetchUser()
    }
    
    // Not authenticated → login
    if (!auth.isAuthenticated) {
      return navigateTo('/login')
    }
  }

  // ✅ 3. Role-based protection (only for protected pages)
  const allowedRoles = to.meta.roles as string[]
  if (allowedRoles?.length && !allowedRoles.includes(auth.userRole)) {
    return navigateTo('/403')
  }

})
