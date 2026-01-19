<script setup lang="ts">
import NotificationItem from './NotificationItem.vue'

defineProps<{
  notifications: any[]
}>()

defineEmits(['read'])
</script>

<template>
  <div class="space-y-3">
    <NotificationItem
      v-for="n in notifications"
      :key="n.id"
      :notification="n"
      @read="$emit('read', n)"
    />
  </div>
</template>
