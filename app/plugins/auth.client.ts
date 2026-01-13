// plugins/auth.client.ts
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  
  // Hydrate on app load
  if (auth.token && !auth.user) {
    await auth.fetchUser()
  }
})
