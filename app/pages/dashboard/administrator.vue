<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['administrator']
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

// Service-specific computed totals
const serviceTotals = computed(() => {
  const services = dashboardData.value?.jobs_by_service || []
  return {
    jamb: services.find((s: any) => s.service.includes('JAMB'))?.jobs || 0,
    admissionLetter: services.find((s: any) => s.service.includes('Letter'))?.jobs || 0,
    olevel: services.find((s: any) => s.service.includes("O'Level"))?.jobs || 0,
    admissionStatus: services.find((s: any) => s.service.includes('Status Check'))?.jobs || 0,
    resultNotification: services.find((s: any) => s.service.includes('Notification'))?.jobs || 0,
    pin: services.find((s: any) => s.service.includes('pin'))?.jobs || 0
  }
})

// Proper pending calculation
const getPendingCount = (service: any) => {
  return service.jobs - (service.completed || 0) - (service.rejected || 0)
}

// Service color mapping
const serviceColors = {
  'JAMB Original Result': { bg: 'from-orange-500 to-orange-600', text: 'text-orange-600', icon: FileTextOutlined },
  'Admission Letter': { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', icon: FileTextOutlined },
  "O'Level Upload Status": { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', icon: NotificationOutlined },
  'Admission Status Check': { bg: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', icon: CheckCircleOutlined },
  'Result Notification': { bg: 'from-pink-500 to-pink-600', text: 'text-pink-600', icon: BarChartOutlined }

}

const serviceColumns: TableColumnsType = [
  { 
    title: 'Service', 
    dataIndex: 'service', 
    key: 'service', 
    width: 220,
    slots: { customRender: 'serviceCell' }
  },
  { title: 'Total', dataIndex: 'jobs', key: 'jobs', align: 'right', width: 100, sorter: true },
  { 
    title: 'Completed', 
    dataIndex: 'completed', 
    key: 'completed', 
    align: 'right', 
    width: 130,
    sorter: true
  },
  { 
    title: 'Pending',     
    key: 'pending', 
    align: 'right', 
    width: 130,              
    slots: { customRender: 'pendingCell' },  
    sorter: true
  },
  { 
    title: 'Rejected', 
    dataIndex: 'rejected', 
    key: 'rejected', 
    align: 'right', 
    width: 130,              
    sorter: true
  },
  {
    title: 'Progress',
    key: 'progress',
    slots: { customRender: 'progress' },
    width: 160,
    align: 'center'
  }
]

const recentColumns: TableColumnsType = [
  { title: '#', key: 'index', width: 50, slots: { customRender: 'indexCell' } },
  { title: 'ID', dataIndex: 'id', key: 'id', ellipsis: true, width: 150 },
  { 
    title: 'Status', 
    dataIndex: 'status', 
    key: 'status',
    slots: { customRender: 'statusCell' },
    width: 100,
    align: 'center'
  },
  { title: 'Created', dataIndex: 'created_at', key: 'created_at', width: 140, slots: { customRender: 'dateCell' } },
  { title: 'Ago', dataIndex: 'ago', key: 'ago', width: 90 }
]

const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await $api('/dashboard/admin')
    dashboardData.value = response
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load dashboard data'
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
  <div class="p-2 lg:p-8 space-y-2 lg:space-y-2 bg-emerald-50 to-teal-50/50 min-h-screen border border-emerald-50 rounded-2xl">
    
    <!-- Error State -->
    <Card v-if="error" class="!shadow-2xl !border-2 border-red-200/50 bg-gradient-to-br from-red-50/80 to-red-100/50 backdrop-blur-sm">
      <div class="flex items-center gap-4 p-6">
        <CloseCircleOutlined class="text-3xl text-red-500 flex-shrink-0 animate-pulse" />
        <div class="flex-1">
          <Typography.Title level="4" class="!m-0 text-red-900 mb-2 font-black">Dashboard Error</Typography.Title>
          <Typography.Text class="text-red-800 font-medium">{{ error }}</Typography.Text>
        </div>
        <Button type="primary" @click="fetchDashboardData" :loading="loading" size="large" class="!bg-red-500 !border-red-500 hover:!bg-red-600">
          <ReloadOutlined /> Retry
        </Button>
      </div>
    </Card>

    <!-- Main Content -->
    <template v-else>
      <!-- Hero Header -->
      <Card class="!shadow-2xl !border-2 border-emerald-200/50 bg-white/70 backdrop-blur-xl">
        <div class="p-2 lg:p-2">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div class="flex-1 space-y-4">
              <Typography.Title level="2" class="text-2xl lg:text-2xl font-black !m-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent drop-shadow-lg">
                Administrator Dashboard
              </Typography.Title>
              <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div v-for="(total, key) in serviceTotals" :key="key" class="group">
                  <div class="px-4 py-3 bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100/50 hover:shadow-2xl transition-all duration-300 group-hover:scale-105 hover:-translate-y-1">
                    <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</div>
                    <div class="text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {{ total.toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-6 text-lg font-semibold text-gray-700">
                <span>{{ dashboardData?.stats?.performance || 'N/A' }} Performance</span>
                <div class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>{{ dashboardData?.stats?.processed_jobs?.toLocaleString() || 0 }} Total Jobs</span>
              </div>
            </div>
            <!-- <Button 
              type="primary" 
              @click="fetchDashboardData"
              :loading="loading"
              class="px-10 h-16 font-bold text-lg shadow-2xl flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              size="large"
            >
              <ReloadOutlined /> Refresh Data
            </Button> -->
          </div>
        </div>
      </Card>

      <!-- Services Stats Grid - Beautiful Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 ">
        <Card 
          v-for="(service, index) in dashboardData?.jobs_by_service" 
          :key="service.service"
          class="!shadow-2xl !border-2 border rounded-xl h-full transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.02] group"
          :class="`bg-gradient-to-br from-white/80 to-slate-50/50 backdrop-blur-xl border-[${serviceColors[service.service]?.bg || 'emerald-100/50'}]`"
        >
          <div class="p-6 h-full flex flex-col justify-between">
            <!-- Header with Icon -->
            <div class="flex items-center gap-3 mb-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform duration-300"
                   :class="`bg-gradient-to-br ${serviceColors[service.service]?.bg || 'from-emerald-500 to-teal-500'}`">
                <component :is="serviceColors[service.service]?.icon || FileTextOutlined" class="text-xl text-white" />
              </div>
              <div>
                <Typography.Text class="font-bold text-lg block leading-tight" :class="serviceColors[service.service]?.text || 'text-emerald-700'">
                  {{ service.service.split(' ')[0] }}
                </Typography.Text>
                <Typography.Text class="text-xs text-gray-500 font-medium">Service</Typography.Text>
              </div>
            </div>

            <!-- Stats - FIXED LARGER DISPLAY -->
            <div class="space-y-4 mb-6">
              <div class="text-3xl font-black" :class="serviceColors[service.service]?.text || 'text-emerald-600'">
                {{ service.jobs }}
              </div>
              <div class="grid grid-cols-3 gap-3 text-base">
                <div class="text-emerald-600 font-bold flex items-center gap-2 p-2 bg-emerald-50/50 rounded-xl shadow-sm">
                  <CheckCircleOutlined class="text-lg" /> {{ service.completed }}
                </div>
                <div class="text-amber-600 font-bold flex items-center gap-2 p-2 bg-amber-50/50 rounded-xl shadow-sm">
                  <HourglassOutlined class="text-lg" /> {{ getPendingCount(service) }}
                </div>
                <div class="text-red-500 font-bold flex items-center gap-2 p-2 bg-red-50/50 rounded-xl shadow-sm">
                  <CloseCircleOutlined class="text-lg" /> {{ service.rejected }}
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                class="h-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-full shadow-lg transition-all duration-1000 flex items-center justify-end pr-2"
                :style="{ width: `${(service.completed / service.jobs) * 100}%` }"
              >
                <span class="text-xs font-bold text-white drop-shadow-lg">
                  {{ Math.round((service.completed / service.jobs) * 100) }}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <!-- STATISTICS -->
      <!-- <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">

        <div class="stat-card bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <div class="stat-label">Processed</div>
          <div class="stat-value text-slate-800">
            {{ dashboardData?.stats?.processed_jobs || 0 }}
          </div>
        </div>

        <div class="stat-card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div class="stat-label text-emerald-700">Completed</div>
          <div class="stat-value text-emerald-700">
            {{ dashboardData?.stats?.completed_jobs || 0 }}
          </div>
        </div>

        <div class="stat-card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div class="stat-label text-amber-700">Pending</div>
          <div class="stat-value text-amber-700">
            {{ dashboardData?.stats?.pending_jobs || 0 }}
          </div>
        </div>

        <div class="stat-card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div class="stat-label text-red-700">Rejected</div>
          <div class="stat-value text-red-700">
            {{ dashboardData?.stats?.rejected_jobs || 0 }}
          </div>
        </div>

        <div class="stat-card bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <div class="stat-label text-teal-700">Performance</div>
          <div class="stat-value text-teal-700">
            {{ dashboardData?.stats?.performance || '0%' }}
          </div>
        </div>

        <div class="stat-card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div class="stat-label text-indigo-700">Earnings</div>
          <div class="stat-value text-indigo-700 text-xl">
            ₦{{ Number(dashboardData?.stats?.earnings || 0).toLocaleString() }}
          </div>
        </div>

        <div class="stat-card bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div class="stat-label">Avg Time</div>
          <div class="stat-value text-gray-800 text-lg">
            {{ dashboardData?.stats?.avg_processing_time || 'N/A' }}
          </div>
        </div>

      </div> -->

      <!-- Enhanced Tables Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Detailed Services Table -->
        <Card class="!shadow-2xl !border-2 border-emerald-200/50 bg-white/70 backdrop-blur-xl">
          <Typography.Title level="4" class="!m-0 mb-6 flex items-center gap-3 text-emerald-800 font-black">
            Services Performance
            <span class="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
              {{ dashboardData?.jobs_by_service?.length || 0 }} Services
            </span>
          </Typography.Title>
          <Table
            :columns="serviceColumns"
            :data-source="dashboardData?.jobs_by_service || []"
            :loading="loading"
            :pagination="false"
            row-key="service"
            size="middle"
            class="admin-table"
            :scroll="{ y: 500 }"
          >
            <template #serviceCell="{ record }">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                     :class="`bg-gradient-to-br ${serviceColors[record.service]?.bg || 'from-gray-400 to-gray-500'}`">
                  <component :is="serviceColors[record.service]?.icon || ProfileOutlined" class="text-base text-white" />
                </div>
                <span class="font-semibold text-gray-800">{{ record.service }}</span>
              </div>
            </template>
            
            <template #pendingCell="{ record }">
              <div class="font-mono font-bold text-amber-600 bg-amber-50/70 px-3 py-2 rounded-xl shadow-md text-base">
                {{ getPendingCount(record) }}
              </div>
            </template>
            
            <template #progress="{ record }">
              <div class="flex flex-col items-center gap-1">
                <div class="w-20 h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner">
                  <div 
                    class="h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-md"
                    :style="{ width: (record.completed / record.jobs * 100) + '%' }"
                  />
                </div>
                <span class="text-sm font-bold text-emerald-600">
                  {{ Math.round((record.completed / record.jobs) * 100) }}%
                </span>
              </div>
            </template>
          </Table>
        </Card>

        <!-- Recent Activity + System Status -->
        <div class="space-y-6">
          <Card class="!shadow-2xl !border-2 border-emerald-200/50 bg-white/70 backdrop-blur-xl">
            <Typography.Title level="4" class="!m-0 mb-6 flex items-center gap-3 text-emerald-800 font-black">
              Recent Activity
            </Typography.Title>
            <Table
              :columns="recentColumns"
              :data-source="dashboardData?.recent_jobs?.slice(0, 10) || []"
              :loading="loading"
              :pagination="false"
              row-key="id"
              size="middle"
              class="admin-table compact-table"
            />
          </Card>

          <!-- System Status Cards -->
          <Card class="!shadow-2xl !border-2 border-emerald-200/50 bg-white/70 backdrop-blur-xl">
            <Typography.Title level="4" class="!m-0 mb-8 flex items-center gap-3 text-emerald-800 font-black">
              System Health
            </Typography.Title>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                v-for="(flag, key) in dashboardData?.fraud_flags" 
                :key="key"
                class="group p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105"
                :class="flag ? 'bg-gradient-to-br from-red-50/80 to-red-100/50 border-red-200' : 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 border-emerald-200'"
              >
                <div class="flex items-start gap-4 mb-3">
                  <component :is="flag ? CloseCircleOutlined : CheckCircleOutlined" 
                            :class="flag ? 'text-red-500' : 'text-emerald-500'" 
                            class="text-2xl flex-shrink-0 mt-0.5" />
                  <div class="flex-1">
                    <div class="font-bold text-lg capitalize mb-1" :class="flag ? 'text-red-800' : 'text-emerald-800'">
                      {{ key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                    </div>
                    <div class="text-sm font-semibold" :class="flag ? 'text-red-600' : 'text-emerald-600'">
                      {{ flag ? 'Action Required' : 'All Systems Normal' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.admin-table :deep(.ant-table-thead) {
  @apply !bg-gradient-to-r !from-emerald-500 !to-teal-600 !border-none;
}

.admin-table :deep(.ant-table-thead th) {
  @apply !bg-transparent !text-white !font-black !py-4 !px-4 text-sm 
         !border-none !shadow-none backdrop-blur-sm;
}

.admin-table :deep(.ant-table-thead th:nth-child(1)) { @apply !bg-gradient-to-r !from-orange-500 !to-orange-600; }
.admin-table :deep(.ant-table-thead th:nth-child(2)) { @apply !bg-gradient-to-r !from-emerald-500 !to-emerald-600; }
.admin-table :deep(.ant-table-thead th:nth-child(3)) { @apply !bg-gradient-to-r !from-blue-500 !to-blue-600; }
.admin-table :deep(.ant-table-thead th:nth-child(4)) { @apply !bg-gradient-to-r !from-amber-500 !to-amber-600; }
.admin-table :deep(.ant-table-thead th:nth-child(5)) { @apply !bg-gradient-to-r !from-red-500 !to-red-600; }
.admin-table :deep(.ant-table-thead th:nth-child(6)) { @apply !bg-gradient-to-r !from-teal-500 !to-emerald-600; }

.admin-table :deep(.ant-table-tbody td) {
  @apply !py-4 !px-4 border-t border-emerald-100/30 hover:!bg-emerald-50/30 transition-colors;
}

.compact-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4;
}

.admin-table :deep(.ant-table-tbody tr:hover > td) {
  @apply bg-gradient-to-r from-emerald-50/70 to-teal-50/70 shadow-sm;
}
.stat-card {
  @apply p-4 rounded-2xl border shadow-lg backdrop-blur-sm
         flex flex-col justify-between
         transition-all duration-300
         hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02];
}

.stat-label {
  @apply text-xs font-semibold uppercase tracking-wide text-gray-500;
}

.stat-value {
  @apply mt-2 text-2xl font-black;
}

</style>
