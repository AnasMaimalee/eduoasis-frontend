import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  // Prevent HMR double init
  if ((window as any).__echo) {
    nuxtApp.provide('echo', (window as any).__echo)
    return
  }

  // @ts-ignore
  window.Pusher = Pusher

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const pusherKey = config.public.pusherAppKey
  const cluster = config.public.pusherAppCluster

  if (!apiBase || !pusherKey) {
    console.warn('Echo disabled: missing config')
    nuxtApp.provide('echo', null)
    return
  }

  const echo = new Echo({
    broadcaster: 'pusher',
    key: pusherKey,
    cluster,
    forceTLS: true,
    authEndpoint: `${apiBase}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        Accept: 'application/json',
      },
    },
  })

  // Optional debug
  echo.connector.pusher.connection.bind('connected', () => {
    console.log('Pusher connected')
  })

  echo.connector.pusher.connection.bind('error', (e: any) => {
    console.error('Pusher error', e)
  })

  ;(window as any).__echo = echo
  nuxtApp.provide('echo', echo)
})
