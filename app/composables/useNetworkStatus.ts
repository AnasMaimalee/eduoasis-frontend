import { ref, onMounted, onUnmounted } from 'vue'

export function useNetworkStatus() {
  const isOnline = ref(true)
  const showBackOnline = ref(false)
  let timer: any = null

  const handleOnline = () => {
    isOnline.value = true
    showBackOnline.value = true

    clearTimeout(timer)
    timer = setTimeout(() => {
      showBackOnline.value = false
    }, 5000)
  }

  const handleOffline = () => {
    isOnline.value = false
    showBackOnline.value = false
    clearTimeout(timer)
  }

  onMounted(() => {
    isOnline.value = navigator.onLine
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    clearTimeout(timer)
  })

  return {
    isOnline,
    showBackOnline,
  }
}
