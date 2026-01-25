// composables/useEcho.ts
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

export function useEcho() {
  const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    wsHost: window.location.hostname,
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: true,
    encrypted: true,
    authEndpoint: '/api/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`, // your token
      },
    },
  })

  return { echo }
}
