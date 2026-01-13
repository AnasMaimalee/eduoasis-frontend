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
    <Card v-if="error" class="!shadow-2xl !border-2 border-red-200/50 bg-gradient-to-br from-red-50/80 to-red-100/50 backdrop-blur-sm rounded-3xl">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-6">
        <CloseCircleOutlined class="text-3xl text-red-500 flex-shrink-0 animate-pulse" />
        <div class="flex-1">
          <Typography.Title level="4" class="!m-0 text-red-900 mb-2 font-black">{{ error }}</Typography.Title>
        </div>
        <Button type="primary" @click="fetchDashboardData" :loading="loading" size="large" class="!bg-red-500 !border-red-500 hover:!bg-red-600 px-8 h-14">
          <ReloadOutlined /> Retry
        </Button>
      </div>
    </Card>

    <!-- Main Content -->
    <template v-else>
      <!-- Hero Header - REAL WORLD APP STYLE -->
      <Card class="!shadow-2xl !border-2 border-emerald-200/60 bg-white/90 backdrop-blur-xl rounded-3xl">
        <div class="p-2 lg:p-2">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div class="flex-1 space-y-6">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <ProfileOutlined class="text-3xl text-white" />
                </div>
                <div>
                  <Typography.Title level="1" class="!m-0 text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 bg-clip-text text-transparent">
                    Welcome Back!
                  </Typography.Title>
                  <Typography.Text class="text-xl text-gray-700 font-semibold mt-1 block">Your JAMB services overview</Typography.Text>
                </div>
              </div>

              <!-- ✅ REAL WORLD STATS - Green Approved, Orange Pending -->
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div class="group">
                  <div class="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Total Jobs</div>
                    <div class="text-3xl lg:text-4xl font-black text-gray-900 mb-1">
                      {{ dashboardData?.stats?.total_jobs?.toLocaleString() || 0 }}
                    </div>
                    <div class="text-sm text-gray-600 font-medium">All services</div>
                  </div>
                </div>
                <div class="group">
                  <div class="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                    <div class="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <CheckCircleOutlined class="text-emerald-500" /> Approved
                    </div>
                    <div class="text-3xl lg:text-4xl font-black text-emerald-800 mb-1">
                      {{ dashboardData?.stats?.approved?.toLocaleString() || 0 }}
                    </div>
                    <div class="text-sm text-emerald-700 font-semibold">✅ Completed</div>
                  </div>
                </div>
                <div class="group">
                  <div class="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                    <div class="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <ClockCircleOutlined class="text-orange-500" /> Pending
                    </div>
                    <div class="text-3xl lg:text-4xl font-black text-orange-800 mb-1">
                      {{ dashboardData?.stats?.pending?.toLocaleString() || 0 }}
                    </div>
                    <div class="text-sm text-orange-700 font-semibold">⏳ Processing</div>
                  </div>
                </div>
                <div class="group">
                  <div class="p-6 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                    <div class="text-xs font-semibold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <CloseCircleOutlined class="text-red-500" /> Rejected
                    </div>
                    <div class="text-3xl lg:text-4xl font-black text-red-800 mb-1">
                      {{ dashboardData?.stats?.rejected?.toLocaleString() || 0 }}
                    </div>
                    <div class="text-sm text-red-700 font-semibold">❌ Failed</div>
                  </div>
                </div>
                <div class="group">
                  <div class="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                    <div class="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-3">Total Spent</div>
                    <div class="text-3xl lg:text-4xl font-black text-teal-800 mb-1">
                      ₦{{ dashboardData?.stats?.total_spent?.toLocaleString() || 0 }}
                    </div>
                    <div class="text-sm text-teal-700 font-semibold">Lifetime</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              type="primary" 
              @click="fetchDashboardData"
              :loading="loading"
              class="px-12 h-16 font-black text-xl shadow-2xl flex items-center gap-3 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-none w-full lg:w-auto"
              size="large"
            >
              <ReloadOutlined /> Refresh Data
            </Button>
          </div>
        </div>
      </Card>

      <!-- ✅ SPECIFIC SERVICE CARDS - EXACT NAMES -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card 
          v-for="service in serviceData" 
          :key="service.name"
          class="!shadow-xl !border-2 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] rounded-3xl bg-white/90 backdrop-blur-xl border-emerald-200/50 group"
        >
          <div class="p-6 h-full flex flex-col items-center justify-center text-center space-y-4">
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-500 flex-shrink-0"
                 :class="`bg-gradient-to-br ${service.color}`">
              <component :is="service.icon" class="text-2xl text-white" />
            </div>
            <div class="space-y-2">
              <Typography.Text class="font-black text-xl lg:text-2xl leading-tight block truncate" :class="service.textColor">
                {{ service.name }}
              </Typography.Text>
              <div class="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {{ service.jobs.toLocaleString() }}
              </div>
              <div class="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                <span class="text-sm font-bold text-emerald-700">Your Requests</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Real World Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Services Table -->
        <Card class="!shadow-2xl !border-2 border-emerald-200/50 bg-white/90 backdrop-blur-xl rounded-3xl">
          <Typography.Title level="3" class="!m-0 mb-8 text-2xl p-3 font-black text-gray-900 flex items-center gap-3">
            📋 Service History
            <span class="text-sm bg-emerald-100 text-emerald-800 px-4 py-1 rounded-2xl font-semibold">
              {{ serviceData.length }} Services
            </span>
          </Typography.Title>
          
          <Table
            :data-source="serviceData"
            :loading="loading"
            :pagination="false"
            row-key="name"
            size="large"
            class="service-table"
            :scroll="{ x: 768 }"
          >
            <template #columns>
              <TableColumn title="Service" data-index="name" :width="300">
                <template #default="{ record }">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" :class="`bg-gradient-to-br ${record.color}`">
                      <component :is="record.icon" class="text-xl text-white" />
                    </div>
                    <span class="font-bold text-lg text-gray-900">{{ record.name }}</span>
                  </div>
                </template>
              </TableColumn>
              <TableColumn title="Jobs" data-index="jobs" align="center" :width="150">
                <template #default="{ record }">
                  <div class="text-2xl font-black text-gray-900">{{ record.jobs.toLocaleString() }}</div>
                </template>
              </TableColumn>
              <TableColumn title="Status" align="center" :width="200">
                <template #default="{ record }">
                  <div class="flex gap-2 justify-center">
                    <Tag color="green">Active</Tag>
                    <Tag color="blue">Available</Tag>
                  </div>
                </template>
              </TableColumn>
            </template>
          </Table>
        </Card>

        <!-- Recent Jobs -->
        <div class="space-y-6">
          <Card class="!shadow-2xl !border-2 border-emerald-200/50 bg-white/90 backdrop-blur-xl rounded-3xl">
            <Typography.Title level="3" class="!m-0 mb-8 text-2xl font-black text-gray-900 flex items-center gap-3">
              ⏰ Recent Activity
              <span class="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-xl font-semibold animate-pulse">Live</span>
            </Typography.Title>
            
            <Table
              :data-source="dashboardData?.recent_jobs?.slice(0, 8) || []"
              :loading="loading"
              :pagination="false"
              row-key="id"
              size="large"
              class="activity-table"
              :scroll="{ x: 768 }"
            >
              <template #columns>
                <TableColumn title="#" :width="60" align="center">
                  <template #default="{ index }">
                    <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">
                      {{ index + 1 }}
                    </div>
                  </template>
                </TableColumn>
                <TableColumn title="Job ID" data-index="id" :width="200" />
                <TableColumn title="Service" data-index="service" :width="220">
                  <template #default="{ text }">
                    <Tag :color="text.includes('Result') ? 'orange' : text.includes('Letter') ? 'purple' : 'blue'">{{ text }}</Tag>
                  </template>
                </TableColumn>
                <TableColumn title="Status" :width="140" align="center">
                  <template #default="{ text }">
                    <Tag 
                      :color="text === 'approved' ? 'green' : text === 'pending' ? 'orange' : 'red'" 
                      class="font-bold px-3 py-1 text-base"
                    >
                      {{ text.toUpperCase() }}
                    </Tag>
                  </template>
                </TableColumn>
                <TableColumn title="Time" data-index="submitted_at" :width="160" />
              </template>
            </Table>
          </Card>

          <!-- Quick Actions -->
          <Card class="!shadow-2xl !border-2 border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
            <Typography.Title level="4" class="!m-0 mb-6 text-xl font-black text-emerald-900">⚡ Quick Actions</Typography.Title>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button block size="large" class="h-16 text-lg font-bold shadow-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                <DollarCircleOutlined class="text-2xl mr-2" /> New JAMB Request
              </Button>
              <Button block size="large" class="h-16 text-lg font-bold shadow-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <NotificationOutlined class="text-2xl mr-2" /> Check Status
              </Button>
            </div>
          </Card>
        </div>
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
