import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  // 1️⃣ Not logged in → login
  if (!auth.token) {
    return navigateTo('/login')
  }

  // 2️⃣ If user not loaded yet → fetch
  if (!auth.user) {
    try {
      await auth.fetchUser()
    } catch (e) {
      auth.logout()
      return navigateTo('/login')
    }
  }

  // 3️⃣ Role-based access check
  const allowedRoles = to.meta.roles as string[] | undefined

  if (allowedRoles && !allowedRoles.includes(auth.userRole)) {
    // Optional: redirect to forbidden page
    return navigateTo('/403')
  }
})