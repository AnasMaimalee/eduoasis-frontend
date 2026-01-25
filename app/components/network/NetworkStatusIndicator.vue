<!-- components/network/NetworkStatusIndicator.vue -->
<template>
  <Transition name="fade">
    <div v-if="!online || showBackOnline" 
         class="network-status mb-4 p-3 rounded-xl border shadow-lg"
         :class="online ? 'bg-emerald-100/80 border-emerald-300 text-emerald-800 animate-pulse' : 'bg-orange-100/80 border-orange-300 text-orange-800'">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full" 
             :class="online ? 'bg-emerald-500 animate-ping' : 'bg-orange-500 animate-pulse'"></div>
        <span class="font-medium text-sm">
          {{ online ? '🟢 BACK ONLINE - Real-time restored!' : '🟡 OFFLINE - Pusher cached' }}
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const online = ref(true)
const showBackOnline = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined') {
    online.value = navigator.onLine ?? true
    
    const handleOnline = () => {
      online.value = true
      showBackOnline.value = true
      
      // ✅ Auto-hide after 3 seconds
      setTimeout(() => {
        showBackOnline.value = false
      }, 3000)
    }
    
    const handleOffline = () => {
      online.value = false
      showBackOnline.value = false
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Cleanup
    onBeforeUnmount(() => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    })
  }
})
</script>

<style scoped>
.network-status {
  transition: all 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
