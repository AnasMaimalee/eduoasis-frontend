export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  const api = $fetch.create({
    baseURL: 'http://localhost:8000/api',

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
