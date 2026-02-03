<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user']
})

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { 
  ProfileOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  DollarCircleOutlined, NotificationOutlined, ReloadOutlined, 
  ClockCircleOutlined, FileTextOutlined, BarChartOutlined, HourglassOutlined
} from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue/es/table/interface'

const { $api } = useNuxtApp()

const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>(null)

// ✅ SPECIFIC SERVICE TOTALS - EXACT NAMES
const serviceData = computed(() => {
  const services = dashboardData.value?.services_usage || []
  return [
    {
      name: 'Jamb Original Result',
      jobs: services.find((s: any) => s.service === 'Jamb Original Result')?.total_jobs || 0,
      icon: FileTextOutlined,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600'
    },
    {
      name: 'Jamb Admission Letter',
      jobs: services.find((s: any) => s.service === 'Jamb Admission Letter')?.total_jobs || 0,
      icon: FileTextOutlined,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    },
    {
      name: 'JAMB Upload Status',
      jobs: services.find((s: any) => s.service === 'JAMB Upload Status')?.total_jobs || 0,
      icon: NotificationOutlined,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    {
      name: 'Checking Admission Status',
      jobs: services.find((s: any) => s.service === 'Checking Admission Status')?.total_jobs || 0,
      icon: CheckCircleOutlined,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600'
    },
    {
      name: 'JAMB Results Notifications',
      jobs: services.find((s: any) => s.service === 'JAMB Results Notifications')?.total_jobs || 0,
      icon: BarChartOutlined,
      color: 'from-pink-500 to-pink-600',
      textColor: 'text-pink-600'
    },
    {
      name: 'JAMB PIN Binding',
      jobs: services.find((s: any) => s.service === 'JAMB PIN Binding')?.total_jobs || 0,
      icon: BarChartOutlined,
      color: 'from-pink-500 to-pink-600',
      textColor: 'text-pink-600'
    }
  ]
})

const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await $api('/dashboard/user')
    dashboardData.value = response
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

let refreshInterval: NodeJS.Timeout
onMounted(() => {
  fetchDashboardData()
  refreshInterval = setInterval(fetchDashboardData, 30000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <div class="p-2 sm:p-2 lg:p-8 space-y-4 sm:space-y-6 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50/80 min-h-screen">

    <!-- Error State -->
    <Card
      v-if="error"
      class="!shadow-2xl !border-2 border-red-200/50 bg-gradient-to-br from-red-50/80 to-red-100/50 backdrop-blur-sm rounded-3xl"
    >
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-6">
        <CloseCircleOutlined class="text-3xl text-red-500 flex-shrink-0 animate-pulse" />

        <div class="flex-1 min-w-0">
          <div class="text-xl font-black text-red-900 mb-2 break-words">
            {{ error }}
          </div>
        </div>

        <Button
          type="primary"
          @click="fetchDashboardData"
          :loading="loading"
          size="large"
          class="!bg-red-500 !border-red-500 hover:!bg-red-600 px-8 h-14"
        >
          <ReloadOutlined /> Retry
        </Button>
      </div>
    </Card>

    <!-- Main Content -->
    <template v-else>

      <!-- Hero Header -->
      <Card class="!shadow-2xl !border-2 border-emerald-200/60 bg-white/90 backdrop-blur-xl rounded-3xl rounded-2xl">
        <div class="p-2 lg:p-2">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8">

            <div class="flex-1 space-y-6 min-w-0">
              <div class="flex items-center gap-4 min-w-0">
                <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0">
                  <ProfileOutlined class="text-3xl text-white" />
                </div>

                <div class="min-w-0">
                  <div class="text-xl lg:text-4xl font-black bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 bg-clip-text text-transparent break-words">
                    Welcome Back!
                  </div>
                  <div class="text-xl text-gray-700 font-semibold mt-1 break-words">
                    Your JAMB services overview
                  </div>
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div class="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-2xl shadow-lg">
                  <div class="text-xs font-semibold text-gray-500 uppercase mb-3">Total Jobs</div>
                  <div class="text-3xl font-black text-gray-900">
                    {{ dashboardData?.stats?.total_jobs?.toLocaleString() || 0 }}
                  </div>
                </div>

                <div class="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl shadow-xl">
                  <div class="text-xs font-semibold text-emerald-700 uppercase mb-3 flex gap-1">
                    <CheckCircleOutlined /> Approved
                  </div>
                  <div class="text-3xl font-black text-emerald-800">
                    {{ dashboardData?.stats?.approved?.toLocaleString() || 0 }}
                  </div>
                </div>

                <div class="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl shadow-xl">
                  <div class="text-xs font-semibold text-orange-700 uppercase mb-3 flex gap-1">
                    <ClockCircleOutlined /> Pending
                  </div>
                  <div class="text-3xl font-black text-orange-800">
                    {{ dashboardData?.stats?.pending?.toLocaleString() || 0 }}
                  </div>
                </div>

                <div class="p-6 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-xl">
                  <div class="text-xs font-semibold text-red-700 uppercase mb-3 flex gap-1">
                    <CloseCircleOutlined /> Rejected
                  </div>
                  <div class="text-3xl font-black text-red-800">
                    {{ dashboardData?.stats?.rejected?.toLocaleString() || 0 }}
                  </div>
                </div>

                <div class="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-2xl shadow-xl">
                  <div class="text-xs font-semibold text-teal-700 uppercase mb-3">Total Spent</div>
                  <div class="text-3xl font-black text-teal-800">
                    ₦{{ dashboardData?.stats?.total_spent?.toLocaleString() || 0 }}
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="primary"
              @click="fetchDashboardData"
              :loading="loading"
              class="px-12 h-16 font-black text-xl shadow-2xl rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none"
            >
              <ReloadOutlined /> Refresh Data
            </Button>
          </div>
        </div>
      </Card>

      <!-- Service Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card
          v-for="service in serviceData"
          :key="service.name"
          class="!shadow-xl !border-2 rounded-3xl bg-white/90 backdrop-blur-xl border-emerald-200/50"
        >
          <div class="p-6 flex flex-col items-center text-center space-y-4 min-w-0">

            <div
              class="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
              :class="`bg-gradient-to-br ${service.color}`"
            >
              <component :is="service.icon" class="text-2xl text-white" />
            </div>

            <div class="w-full min-w-0 space-y-2">
              <div
                class="font-black text-xl lg:text-2xl break-words overflow-hidden line-clamp-2"
                :class="service.textColor"
              >
                {{ service.name }}
              </div>

              <div class="text-4xl font-black text-gray-900">
                {{ service.jobs.toLocaleString() }}
              </div>

              <div class="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full inline-block">
                <span class="text-sm font-bold text-emerald-700">Your Requests</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </template>
  </div>
</template>

<style scoped>
.service-table :deep(.ant-table) {
  @apply bg-white/80 backdrop-blur-sm;
}

.service-table :deep(.ant-table-thead) {
  @apply !bg-gradient-to-r !from-emerald-500 !to-teal-600 !border-none;
}

.service-table :deep(.ant-table-thead th) {
  @apply !bg-transparent !text-white !font-black !border-none;
}

.activity-table :deep(.ant-table-thead) {
  @apply !bg-gradient-to-r !from-orange-400 !to-orange-500 !border-none;
}

.activity-table :deep(.ant-table-thead th) {
  @apply !bg-transparent !text-white !font-black !border-none;
}

:deep(.ant-table-tbody tr:hover > td) {
  @apply bg-emerald-50/50 transition-colors;
}
</style>
