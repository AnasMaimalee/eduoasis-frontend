<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin']
})

import { ref, onMounted } from 'vue'
import {
  UserOutlined, TeamOutlined, DollarCircleOutlined,
  ProfileOutlined, CheckCircleOutlined, TimeCircleOutlined,
  ClockCircleOutlined, BarChartOutlined, WalletOutlined
} from '@ant-design/icons-vue'

const { $api } = useNuxtApp()
const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>(null)

const tableColumns = {
  leaderboard: [
    { title: 'Rank', key: 'rank', width: 80, customRender: ({ index }: any) => index + 1 },
    { title: 'Admin', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: 'Jobs', dataIndex: 'jobs', key: 'jobs', sorter: true, width: 120 },
    { title: 'Earnings', dataIndex: 'earnings', key: 'earnings', width: 140,
      customRender: ({ text }: any) => `₦${Number(text).toLocaleString()}` },
    { title: 'Wallet', dataIndex: 'wallet_balance', key: 'wallet', width: 140,
      customRender: ({ text }: any) => `₦${Number(text).toLocaleString()}` }
  ],
  services: [
    { title: 'Service', dataIndex: 'service', key: 'service' },
    { title: 'Total', dataIndex: 'total', key: 'total', width: 100 },
    { title: 'Pending', dataIndex: 'pending', key: 'pending', width: 100 },
    { title: 'Approved', dataIndex: 'approved', key: 'approved', width: 100 },
    { title: '% Complete', key: 'progress', width: 120,
      customRender: ({ record }: any) => {
        const complete = record.approved + record.completed
        return `${Math.round((complete / record.total) * 100)}%`
      }
    }
  ]
}

const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await $api('/dashboard/superadmin')
    dashboardData.value = response
  } catch (err: any) {
    error.value = err.message || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

const refreshData = () => fetchDashboardData()

onMounted(fetchDashboardData)
</script>

<template>
  <!-- ERROR STATE -->
  <div v-if="error" class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
    <div class="max-w-4xl mx-auto px-6">
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200/50 p-12 text-center">
        <div class="w-24 h-24 bg-emerald-100 rounded-2xl mx-auto mb-8 flex items-center justify-center border-4 border-emerald-200">
          <ClockCircleOutlined class="text-4xl text-emerald-600" />
        </div>
        <h1 class="text-4xl font-black text-gray-900 mb-4">Dashboard Unavailable</h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{{ error }}</p>
        <a-button
          type="primary"
          size="large"
          @click="refreshData"
          class="px-12 py-6 text-xl font-bold shadow-2xl bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
        >
          <BarChartOutlined /> Retry Loading
        </a-button>
      </div>
    </div>
  </div>

  <!-- LOADING STATE -->
  <div v-else-if="loading" class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-center h-96">
      <div class="text-center">
        <div class="w-24 h-24 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-8"></div>
        <h2 class="text-2xl font-bold text-gray-700 mb-2">Loading EduOasis Dashboard</h2>
        <p class="text-lg text-gray-500">Fetching platform stats from all JAMB services...</p>
      </div>
    </div>
  </div>

  <!-- MAIN DASHBOARD -->
  <div v-else class="w-full px-6 space-y-8 py-8">
    <!-- ✅ FIXED: Smaller, lighter header -->
    <div class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-8 rounded-2xl shadow-xl border border-emerald-400/50">
      <div class="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div>
          <h1 class="text-3xl lg:text-4xl font-black mb-4 leading-tight">EduOasis Command Center</h1>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-xl">
            <div>
              <div class="text-3xl font-black mb-1">{{ dashboardData.overview.total_jobs.toLocaleString() }}</div>
              <div class="opacity-90 text-sm">Total Jobs</div>
            </div>
            <div>
              <div class="text-3xl font-black mb-1">{{ dashboardData.overview.approval_rate }}%</div>
              <div class="opacity-90 text-sm">Approval Rate</div>
            </div>
            <div>
              <div class="text-3xl font-black mb-1">₦{{ Number(dashboardData.overview.total_revenue).toLocaleString() }}</div>
              <div class="opacity-90 text-sm">Total Revenue</div>
            </div>
            <div>
              <div class="text-3xl font-black mb-1">{{ dashboardData.overview.total_users }}</div>
              <div class="opacity-90 text-sm">Users</div>
            </div>
          </div>
        </div>
        <a-button
          type="primary"
          size="large"
          @click="refreshData"
          class="px-8 h-14 text-lg font-bold shadow-xl hover:shadow-2xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30"
        >
          <BarChartOutlined class="mr-2" /> Refresh Data
        </a-button>
      </div>
    </div>

    <!-- KEY METRICS GRID -->
    <a-row :gutter="[24, 24]">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="border-0 shadow-xl h-full hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-2">Total Users</p>
              <p class="text-4xl font-black text-gray-900">{{ dashboardData.overview.total_users.toLocaleString() }}</p>
              <p class="text-sm text-emerald-600 font-medium">+{{ dashboardData.overview.total_admins }} Admins</p>
            </div>
            <div class="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
              <UserOutlined class="text-4xl text-white" />
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="border-0 shadow-xl h-full hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-2">Platform Wallet</p>
              <p class="text-4xl font-black text-gray-900">₦{{ Number(dashboardData.overview.total_wallets_balance).toLocaleString() }}</p>
              <p class="text-sm text-emerald-600 font-medium">
                Revenue: ₦{{ Number(dashboardData.overview.total_revenue).toLocaleString() }}
              </p>
            </div>
            <div class="p-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg">
              <WalletOutlined class="text-4xl text-white" />
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="border-0 shadow-xl h-full hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-emerald-200/30">
          <div class="space-y-4">
            <p class="text-sm font-medium text-gray-600">Job Status</p>
            <div class="space-y-3 p-4 bg-white/50 rounded-2xl backdrop-blur-sm">
              <div class="flex justify-between text-sm py-1">
                <span>Pending</span>
                <span class="font-bold text-emerald-600">{{ dashboardData.overview.pending_jobs }}</span>
              </div>
              <div class="flex justify-between text-sm py-1">
                <span>Processing</span>
                <span class="font-bold text-teal-600">{{ dashboardData.overview.processing_jobs }}</span>
              </div>
              <div class="flex justify-between text-sm py-1">
                <span>Approved</span>
                <span class="font-bold text-emerald-500">{{ dashboardData.overview.approved_jobs }}</span>
              </div>
              <div class="flex justify-between text-sm py-1">
                <span>Rejected</span>
                <span class="font-bold text-emerald-700/80">{{ dashboardData.overview.rejected_jobs }}</span>
              </div>
            </div>
          </div>
          <div class="p-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mt-6 shadow-lg">
            <ProfileOutlined class="text-4xl text-white" />
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="border-0 shadow-xl h-full hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-teal-50/70 to-emerald-50/70 border-teal-200/30">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-2">Financials</p>
              <p class="text-3xl font-black text-gray-900 mb-4">
                ₦{{ Number(dashboardData.overview.total_revenue - dashboardData.overview.admin_payouts).toLocaleString() }}
              </p>
              <div class="space-y-1 text-sm bg-white/50 p-4 rounded-xl backdrop-blur-sm">
                <div class="flex justify-between">
                  <span>Revenue</span>
                  <span class="text-emerald-600 font-bold">₦{{ Number(dashboardData.overview.total_revenue).toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-emerald-700/80 font-bold">
                  <span>Admin Payouts</span>
                  <span>-₦{{ Number(dashboardData.overview.admin_payouts).toLocaleString() }}</span>
                </div>
              </div>
            </div>
            <div class="p-6 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg">
              <DollarCircleOutlined class="text-4xl text-white" />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- SERVICES BREAKDOWN -->
    <a-card title="Services Performance" class="border-0 shadow-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/50">
      <a-table
        :data-source="dashboardData.jobs_by_service"
        :columns="tableColumns.services"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        row-key="service"
        class="rounded-3xl overflow-hidden"
      />
    </a-card>

    <!-- ADMIN LEADERBOARD + SYSTEM HEALTH -->
    <a-row :gutter="[24, 24]">
      <a-col :lg="16" :xs="24">
        <a-card title="Admin Leaderboard" class="border-0 shadow-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-emerald-200/30">
          <a-table
            :data-source="dashboardData.admin_leaderboard"
            :columns="tableColumns.leaderboard"
            :loading="loading"
            :pagination="false"
            row-key="id"
            class="rounded-3xl overflow-hidden"
          />
        </a-card>
      </a-col>

      <a-col :lg="8" :xs="24">
        <a-card title="System Health" class="border-0 shadow-2xl h-full bg-gradient-to-b from-teal-50 to-emerald-50 border-teal-200/50">
          <a-descriptions :column="1" :bordered="true" class="mt-4 bg-white/60 backdrop-blur-sm rounded-2xl">
            <a-descriptions-item label="Inactive Admins">
              <span class="font-bold text-emerald-600">{{ dashboardData.system_health?.admins_with_zero_jobs || 0 }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="Avg Completion">
              <span class="font-bold text-teal-600">{{ dashboardData.system_health?.avg_completion_time || 'N/A' }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="Total Revenue">
              <span class="font-bold text-emerald-600">₦{{ Number(dashboardData.overview.total_revenue).toLocaleString() }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="Platform Wallet">
              <span class="font-bold text-teal-600">₦{{ Number(dashboardData.overview.total_wallets_balance).toLocaleString() }}</span>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
:deep(.ant-card) {
  border-radius: 24px !important;
  background: linear-gradient(145deg, #f8fafc, #f1f5f9) !important;
  border: 1px solid rgba(16, 185, 129, 0.1) !important;
}

:deep(.ant-card-title) {
  color: #065f46 !important;
  font-weight: 800 !important;
  font-size: 1.25rem !important;
}

/* ✅ FIXED: Plain green table headers, no middle radius */
:deep(.ant-table-thead > tr > th) {
  background: #10b981 !important;
  color: white !important;
  font-weight: 700 !important;
  border-radius: 0 !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

:deep(.ant-table-thead > tr:first-child th:first-child) {
  border-top-left-radius: 16px !important;
}

:deep(.ant-table-thead > tr:first-child th:last-child) {
  border-top-right-radius: 16px !important;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(16, 185, 129, 0.05) !important;
}

:deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  border-color: #10b981 !important;
}

:deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #059669, #047857) !important;
  border-color: #059669 !important;
  transform: translateY(-1px);
}
</style>