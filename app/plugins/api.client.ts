export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const api = $fetch.create({
    baseURL: config.public.apiBase,  // Uses NUXT_PUBLIC_API_BASE

    onRequest({ options }) {
      if (authStore.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authStore.token}`,
          Accept: 'application/json',
        }
      }
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        authStore.logout()
        navigateTo('/login')
      }
    },
  })

  return {
    provide: { api },
  }
})
