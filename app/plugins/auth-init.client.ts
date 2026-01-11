// plugins/auth-init.client.ts
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Load user ONCE on app start
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }
})
