<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { message, Spin, Button } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import LiveCbtTable from '@/components/CBT/admin/live/LiveCbtTable.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'CBT Exam Live Sessions'
})

const { $api } = useNuxtApp()

const liveSessions = ref<any[]>([])
const loading = ref(false)
let intervalId: NodeJS.Timeout | null = null

const fetchLiveSessions = async () => {
  console.log('🔄 Fetching live sessions...')
  loading.value = true

  try {
    const response = await $api('/cbt/superadmin/live')

    console.log('📡 Full response:', response)

    // ────────────────────────────────────────────────
    // FIXED: Access the actual array (response.data.data)
    // ────────────────────────────────────────────────
    const sessionsArray = response.data || []

    liveSessions.value = sessionsArray

    console.log('✅ Loaded sessions count:', liveSessions.value.length)
    console.log('✅ First session sample:', liveSessions.value[0] || 'No data')

    if (sessionsArray.length === 0) {
      message.info('No active live sessions right now')
    }
  } catch (error: any) {
    console.error('❌ Fetch error:', error)
    message.error('Could not load live sessions')
    liveSessions.value = []
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(fetchLiveSessions, 30000) // 30 seconds
}

onMounted(() => {
  fetchLiveSessions()
  startAutoRefresh()
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="p-6 space-y-6 bg-emerald-50">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-1">📡 Live CBT Sessions</h1>
        <p class="text-gray-600">Real-time monitoring (Auto-refresh every 30s)</p>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold text-emerald-600 mb-1">
          {{ liveSessions.length }}
        </div>
        <div class="text-sm text-gray-500">Active Sessions</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <Spin size="large" />
        <p class="mt-2 text-gray-600">Loading live sessions...</p>
      </div>
    </div>

    <!-- Sessions Table -->
    <LiveCbtTable 
      v-else-if="!loading && liveSessions.length > 0"
      :sessions="liveSessions" 
      @refresh="fetchLiveSessions" 
    />

    <!-- Empty State -->
    <div 
      v-else-if="!loading" 
      class="bg-white border border-gray-200 rounded-xl shadow-sm text-center py-16"
    >
      <div class="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <span class="text-4xl text-gray-300">📭</span>
      </div>
      <h3 class="text-2xl font-semibold text-gray-800 mb-3">No Active Sessions Right Now</h3>
      <p class="text-gray-500 mb-8 max-w-md mx-auto">
        There are currently no ongoing CBT exams
      </p>
      <Button type="primary" size="large" @click="fetchLiveSessions">
        <ReloadOutlined /> Refresh Now
      </Button>
    </div>
  </div>
</template>