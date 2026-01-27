<!-- layouts/default.vue -->
<template>
  <div>
    <NetworkStatusBanner
            :isOnline="isOnline"
            :showBackOnline="showBackOnline"
          />
    <slot /> <!-- Renders page content (e.g., index.vue) -->
  </div>
</template>

<script setup lang="ts">
import { useNetworkStatus } from '@/composables/useNetworkStatus'
const { isOnline, showBackOnline } = useNetworkStatus()

</script>