<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'Super Admin Dashboard'
})

import { ref, onMounted, computed } from 'vue'
import {
  UserOutlined,
  DollarCircleOutlined,
  WalletOutlined,
  ProfileOutlined,
  BarChartOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js'

import { Line, Doughnut } from 'vue-chartjs'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
)

const { $api } = useNuxtApp()

const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>(null)

const fetchDashboard = async () => {
  try {
    loading.value = true
    const res = await $api('/dashboard/superadmin')
    dashboardData.value = res
  } catch (e: any) {
    error.value = 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboard)

/* =========================
   CHART DATA (REAL)
========================= */

const financeChart = computed(() => ({
  labels: ['Revenue', 'Admin Payouts', 'Platform Profit'],
  datasets: [
    {
      label: '₦ Amount',
      data: [
        dashboardData.value?.overview.total_revenue,
        dashboardData.value?.overview.admin_payouts,
        dashboardData.value?.overview.platform_profit
      ],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.15)',
      tension: 0.45,
      fill: true
    }
  ]
}))

const jobStatusChart = computed(() => ({
  labels: ['Pending', 'Processing', 'Completed', 'Approved', 'Rejected'],
  datasets: [
    {
      data: [
        dashboardData.value?.overview.pending_jobs,
        dashboardData.value?.overview.processing_jobs,
        dashboardData.value?.overview.completed_jobs,
        dashboardData.value?.overview.approved_jobs,
        dashboardData.value?.overview.rejected_jobs
      ],
      backgroundColor: [
        '#f59e0b',
        '#0ea5e9',
        '#6366f1',
        '#10b981',
        '#ef4444'
      ]
    }
  ]
}))
</script>

<template>
  <!-- ERROR -->
  <div v-if="error" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <ClockCircleOutlined class="text-4xl text-red-500 mb-4" />
      <p class="text-lg font-bold">{{ error }}</p>
    </div>
  </div>

  <!-- LOADING -->
  <div v-else-if="loading" class="min-h-screen flex items-center justify-center">
    <div class="animate-spin w-14 h-14 border-4 border-emerald-200 border-t-emerald-600 rounded-full"></div>
  </div>

  <!-- DASHBOARD -->
  <div v-else class="lg:space-y-10 lg:p-10 bg-emerald-100 border border-emerald-100 rounded-3xl">

    <!-- HEADER -->
    <div class="bg-emerald-500  rounded-3xl p-8 text-white shadow-xl">
      <h1 class="text-4xl font-black">EduOasis Command Center</h1>
      <p class="opacity-90 mt-2">Real-time platform intelligence</p>
    </div>

    <!-- KPI GRID -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

      <!-- USERS -->
      <div class="kpi-card">
        <UserOutlined class="kpi-icon" />
        <p class="kpi-title">Total Users</p>
        <p class="kpi-value">{{ dashboardData.overview.total_users }}</p>
        <p class="kpi-sub">Admins: {{ dashboardData.overview.total_admins }}</p>
      </div>

      <!-- JOBS -->
      <div class="kpi-card">
        <ProfileOutlined class="kpi-icon" />
        <p class="kpi-title">Total Jobs</p>
        <p class="kpi-value">{{ dashboardData.overview.total_jobs }}</p>
        <p class="kpi-sub">Approval: {{ dashboardData.overview.approval_rate }}%</p>
      </div>

      <!-- WALLET -->
      <div class="kpi-card">
        <WalletOutlined class="kpi-icon" />
        <p class="kpi-title">Wallet Balance</p>
        <p class="kpi-value">
          ₦{{ Number(dashboardData.overview.total_wallets_balance).toLocaleString() }}
        </p>
      </div>

      <!-- REVENUE -->
      <div class="kpi-card">
        <DollarCircleOutlined class="kpi-icon" />
        <p class="kpi-title">Total Revenue</p>
        <p class="kpi-value">
          ₦{{ Number(dashboardData.overview.total_revenue).toLocaleString() }}
        </p>
      </div>

    </div>

    <!-- CHARTS -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- FINANCE -->
      <div class="bg-white rounded-3xl p-6 shadow-lg lg:col-span-2">
        <h3 class="chart-title">Financial Overview</h3>
        <Line :data="financeChart" />
      </div>

      <!-- JOB STATUS -->
      <div class="bg-white rounded-3xl p-6 shadow-lg">
        <h3 class="chart-title">Job Status Distribution</h3>
        <Doughnut :data="jobStatusChart" />
      </div>

    </div>

    <!-- JOBS BY SERVICE -->
    <div class="bg-white rounded-3xl p-6 shadow-xl mt-8">
      <h3 class="chart-title mb-4 text-gray-700 font-bold text-xl">Jobs by Service</h3>
      <a-table
        :data-source="dashboardData.jobs_by_service"
        :pagination="{ pageSize: 10 }"
        row-key="service"
        :scroll="{ x: 900 }"
        class="rounded-2xl overflow-hidden jamb-table"
      >
        <!-- HEADER STYLING -->
        <template #header>
          <tr class="bg-emerald-500 text-white">
            <th class="px-4 py-2">Service</th>
            <th class="px-4 py-2">Total</th>
            <th class="px-4 py-2">Pending</th>
            <th class="px-4 py-2">Processing</th>
            <th class="px-4 py-2">Completed</th>
            <th class="px-4 py-2">Approved</th>
            <th class="px-4 py-2">Rejected</th>
            <th class="px-4 py-2">% Complete</th>
          </tr>
        </template>

        <!-- COLUMNS -->
        <a-table-column title="Service" dataIndex="service" />
        <a-table-column title="Total" dataIndex="total" />
        <a-table-column title="Pending" dataIndex="pending" />
        <a-table-column title="Processing" dataIndex="processing" />
        <a-table-column title="Completed" dataIndex="completed" />
        <a-table-column title="Approved" dataIndex="approved" />
        <a-table-column title="Rejected" dataIndex="rejected" />
        <a-table-column title="% Complete">
          <template #default="{ record }">
            <div class="w-full bg-gray-200 rounded-full h-4">
              <div
                class="bg-emerald-500 h-4 rounded-full transition-all"
                :style="{ width: `${Math.round(((record.approved + record.completed) / record.total) * 100)}%` }"
              ></div>
            </div>
            <span class="text-sm font-semibold text-gray-700 mt-1 block">
              {{ Math.round(((record.approved + record.completed) / record.total) * 100) }}%
            </span>
          </template>
        </a-table-column>
      </a-table>
    </div>

    <!-- ADMIN LEADERBOARD -->
    <div class="bg-white rounded-3xl p-6 shadow-xl">
      <h3 class="chart-title mb-4 text-gray-700 font-bold text-xl">Admin Performance</h3>
      <a-table
        :data-source="dashboardData.admin_leaderboard"
        :pagination="false"
        row-key="id"
        :scroll="{ x: 900 }"
        class="rounded-2xl overflow-hidden jamb-table"
      >
        <!-- HEADER STYLING -->
        <template #header>
          <tr class="bg-emerald-500 text-white">
            <th class="px-4 py-2">Admin</th>
            <th class="px-4 py-2">Jobs</th>
            <th class="px-4 py-2">Earnings</th>
            <th class="px-4 py-2">Wallet</th>
          </tr>
        </template>

        <!-- COLUMNS -->
        <a-table-column title="Admin" dataIndex="name"></a-table-column>
        <a-table-column title="Jobs" dataIndex="jobs"></a-table-column>
        <a-table-column title="Earnings">
          <template #default="{ record }">
            ₦{{ Number(record.earnings).toLocaleString() }}
          </template>
        </a-table-column>
        <a-table-column title="Wallet">
          <template #default="{ record }">
            ₦{{ Number(record.wallet_balance).toLocaleString() }}
          </template>
        </a-table-column>
      </a-table>
    </div>

    <!-- SYSTEM HEALTH -->
    <div class="bg-white rounded-3xl p-6 shadow-xl mt-8">
      <h3 class="chart-title mb-4 text-gray-700 font-bold text-xl">System Health</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-emerald-50 rounded-2xl p-6 flex flex-col items-center justify-center shadow-md">
          <span class="text-sm font-medium text-gray-600">Admins with Zero Jobs</span>
          <span class="text-3xl font-black text-emerald-600 mt-2">{{ dashboardData.system_health?.admins_with_zero_jobs || 0 }}</span>
        </div>
        <div class="bg-teal-50 rounded-2xl p-6 flex flex-col items-center justify-center shadow-md">
          <span class="text-sm font-medium text-gray-600">Average Completion Time</span>
          <span class="text-3xl font-black text-teal-600 mt-2">{{ dashboardData.system_health?.avg_completion_time || 'N/A' }}</span>
        </div>
      </div>
    </div>


  </div>
</template>

<style scoped>
.kpi-card {
  @apply bg-white rounded-3xl p-6 shadow-lg border border-slate-200;
}
.kpi-icon {
  @apply text-3xl text-emerald-600 mb-3;
}
.kpi-title {
  @apply text-xs uppercase tracking-wider text-slate-500 font-bold;
}
.kpi-value {
  @apply text-3xl font-black text-slate-900;
}
.kpi-sub {
  @apply text-sm text-emerald-600 font-medium;
}
.chart-title {
  @apply text-lg font-black text-slate-900 mb-4;
}
/* TABLE HEADER */
.jamb-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white text-xs md:text-sm;
}

/* TABLE BODY */
.jamb-table :deep(.ant-table-tbody td) {
  @apply !py-2 !px-2 md:!py-3 md:!px-4 text-xs md:text-sm;
}
</style>
