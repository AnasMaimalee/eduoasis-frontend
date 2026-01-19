<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckCircleOutlined,
  WalletOutlined,
  PlayCircleOutlined
} from '@ant-design/icons-vue'

const props = defineProps<{
  notification: any
}>()

const emit = defineEmits(['read'])

const isUnread = computed(() => !props.notification.read_at)

const icon = computed(() => {
  if (props.notification.type.includes('Wallet')) return WalletOutlined
  if (props.notification.type.includes('Started')) return PlayCircleOutlined
  return CheckCircleOutlined
})

const timeAgo = computed(() => {
  const date = new Date(props.notification.created_at)
  return date.toLocaleString()
})
</script>

<template>
  <div
    class="flex gap-4 p-4 rounded-xl cursor-pointer transition
           hover:bg-emerald-50"
    :class="isUnread ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-white'"
    @click="emit('read', notification)"
  >
    <!-- ICON -->
    <div
      class="w-12 h-12 rounded-full flex items-center justify-center
             bg-emerald-100 text-emerald-600"
    >
      <component :is="icon" class="text-xl" />
    </div>

    <!-- CONTENT -->
    <div class="flex-1">
      <p class="text-gray-800 font-medium">
        {{ notification.data.message }}
      </p>

      <p class="text-xs text-gray-500 mt-1">
        {{ timeAgo }}
      </p>
    </div>

    <!-- UNREAD DOT -->
    <span
      v-if="isUnread"
      class="w-2 h-2 bg-emerald-500 rounded-full mt-2"
    />
  </div>
</template>
