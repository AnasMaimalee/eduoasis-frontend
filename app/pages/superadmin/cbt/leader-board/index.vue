<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LeaderboardHeader from '@/components/CBT/admin/leaderboard/LeaderboardHeader.vue'
import LeaderboardTable from '@/components/CBT/admin/leaderboard/LeaderboardTable.vue'
import LeaderboardEmpty from '@/components/CBT/admin/leaderboard/LeaderboardEmpty.vue'
import LeaderboardLoading from '@/components/CBT/admin/leaderboard/LeaderboardLoading.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'CBT Exam Leader Board'
})

const leaderboard = ref<any[]>([])
const pagination = ref({ current: 1, pageSize: 20, total: 0 })
const loading = ref(false)

const { $api } = useNuxtApp()

const fetchLeaderboard = async (page = 1) => {
  loading.value = true
  try {
    const res = await $api('/cbt/superadmin/leaderboard', { params: { page } })
    leaderboard.value = res.data.data || res.data || []
    pagination.value = {
      current: res.data.current_page || 1,
      pageSize: res.data.per_page || 20,
      total: res.data.total || 0
    }
  } catch (err) {
    console.error('Leaderboard error:', err)
    leaderboard.value = []
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => fetchLeaderboard(page)

const handleUserAction = async (action: string, record: any) => {
  const id = record.id || record.user_id
  console.log(`Action: ${action} for user:`, record.name, id)
  
  try {
    switch(action) {
      case 'view':
        navigateTo(`/admin/users/${id}`)
        break
      case 'exams':
        navigateTo(`/admin/users/${id}/exams`)
        break
      case 'stats':
        navigateTo(`/admin/users/${id}/stats`)
        break
      case 'edit':
        navigateTo(`/admin/users/${id}/edit`)
        break
    }
  } catch (error) {
    console.error('Navigation failed:', error)
    alert(`${action} page not available yet`)
  }
}

onMounted(() => fetchLeaderboard(1))
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6 w-full ml-0 bg-emerald-50">
    
    <div v-if="loading" class="text-center py-12">
      <LeaderboardLoading />
    </div>
    
    <div v-else-if="leaderboard.length === 0" class="text-center py-12">
      <LeaderboardEmpty @refresh="fetchLeaderboard(1)" />
    </div>
    
    <div v-else>
      <LeaderboardTable
        :data="leaderboard"
        :pagination="pagination"
        @page-change="handlePageChange"
        @action="handleUserAction"
      />
    </div>
  </div>
</template>
