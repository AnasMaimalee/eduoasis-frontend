<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import NotificationList from '~/components/notifications/NotificationList.vue'
import NotificationSkeleton from '~/components/notifications/NotificationSkeleton.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { $api } = useNuxtApp()

const notifications = ref<any[]>([])
const loading = ref(false)

/* Fetch notifications */
const fetchNotifications = async () => {
  loading.value = true
  try {
    const res = await $api('/cbt/notifications')
    notifications.value = res.data
  } catch {
    message.error('Failed to load notifications')
  } finally {
    loading.value = false
  }
}

/* Mark as read */
const markAsRead = async (notification: any) => {
  if (notification.read_at) return

  try {
    await $api(`/cbt/notifications/${notification.id}/read`, {
      method: 'PATCH',
    })
    notification.read_at = new Date().toISOString()
  } catch {
    message.error('Failed to mark as read')
  }
}

onMounted(fetchNotifications)
</script>

<template>
  <div class="w-full p-6">
    <!-- HEADER -->
    <div
      class="flex items-center justify-between mb-6
             bg-gradient-to-r from-emerald-500 to-emerald-600
             text-white p-6 rounded-2xl"
    >
      <h1 class="text-2xl font-bold">Notifications</h1>
      <span class="text-sm opacity-90">
        {{ notifications.filter(n => !n.read_at).length }} unread
      </span>
    </div>

    <!-- SKELETON (while loading) -->
    <NotificationSkeleton v-if="loading" />

    <!-- LIST -->
    <Transition name="fade">
      <NotificationList
        v-if="!loading && notifications.length"
        :notifications="notifications"
        @read="markAsRead"
      />
    </Transition>

    <!-- EMPTY STATE -->
    <div
      v-if="!loading && notifications.length === 0"
      class="text-center text-gray-400 py-10"
    >
      No notifications yet 🎉
    </div>
  </div>
</template>

