<script setup lang="ts">
defineProps<{
  isOnline: boolean
  showBackOnline: boolean
}>()
</script>

<template>
  <!-- OFFLINE -->
  <div
    v-if="!isOnline"
    class="fixed top-0 left-0 right-0 z-[9999]
           bg-red-600 text-white text-xs md:text-sm
           flex items-center justify-center gap-2
           py-2 px-4"
  >
    <span class="animate-pulse">🔴</span>
    <span>No internet connection. Some actions may fail.</span>
  </div>

  <!-- BACK ONLINE -->
  <div
    v-else-if="showBackOnline"
    class="fixed top-0 left-0 right-0 z-[9999]
           bg-emerald-600 text-white text-xs md:text-sm
           flex items-center justify-center gap-2
           py-2 px-4 transition-all"
  >
    <span>🟢</span>
    <span>Back online. Connection restored.</span>
  </div>
</template>
