<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'Wallet'
})

import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  Table, Card, Button, Input, Select, Typography, Dropdown, message, Tag, Pagination
} from 'ant-design-vue'
import { 
  EyeOutlined, EyeInvisibleOutlined, FilterOutlined, FilePdfOutlined, ReloadOutlined,
  WalletOutlined, CheckCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const { $api } = useNuxtApp()

/* ================= STATE ================= */
const loading = ref(false)
const walletLoading = ref(false)
const hideBalance = ref(true)

const walletBalance = ref(0)
const currency = ref('NGN')

/* ✅ FIXED PAGINATION */
const transactions = ref<any[]>([])
const pagination = ref({
  current: 1,
  pageSize: 100,
  total: 0,
  pageSizeOptions: ['50', '100', '200', '500'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => 
    `${range[0]}-${range[1]} of ${total.toLocaleString()} transactions`
})

/* ✅ FILTERS */
const searchText = ref('')
const monthFilter = ref<number | null>(null)
const yearFilter = ref<string | null>(null)
const searchTimeout = ref<NodeJS.Timeout | null>(null)

/* ================= COMPUTED ================= */
const balanceText = computed(() =>
  hideBalance.value ? '••••••' : `₦${walletBalance.value.toLocaleString()}`
)

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount)
}

const getRowClassName = (record: any) => {
  return record?.type === 'credit' ? 'credit-row' : 'debit-row'
}

/* ================= API ================= */
const fetchWallet = async () => {
  try {
    walletLoading.value = true
    const res = await $api('/wallet/me')
    walletBalance.value = Number(res.current_balance || res.balance || 0)
    currency.value = res.currency || 'NGN'
  } catch (err) {
    console.error('Wallet error:', err)
  } finally {
    walletLoading.value = false
  }
}

const fetchTransactions = async () => {
  loading.value = true
  
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
  
  try {
    const params: any = {
      page: pagination.value.current,
      per_page: pagination.value.pageSize,
    }
    
    if (searchText.value.trim()) {
      params.search = searchText.value.trim()
      params.q = searchText.value.trim()
    }
    
    if (monthFilter.value) params.month = monthFilter.value
    if (yearFilter.value) params.year = yearFilter.value

    console.log('🔍 API PARAMS:', params)

    const res = await $api('/wallet/transactions', { params })
    
    // ✅ PERFECTLY MATCHES YOUR API STRUCTURE
    const txMeta = res.transactions || {}
    transactions.value = Array.isArray(txMeta.data) ? txMeta.data : []
    
    // ✅ FIXED PAGINATION
    pagination.value.total = Number(txMeta.total || 0)
    pagination.value.current = Number(txMeta.current_page || 1)
    pagination.value.pageSize = Math.max(Number(txMeta.per_page || 100), 50)
    
    console.log('✅ TRANSACTIONS LOADED:', {
      count: transactions.value.length,
      total: pagination.value.total,
      page: pagination.value.current,
      perPage: pagination.value.pageSize
    })
    
  } catch (error) {
    console.error('❌ FETCH ERROR:', error)
    transactions.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

/* ================= ACTIONS ================= */
const resetFilters = () => {
  searchText.value = ''
  monthFilter.value = null
  yearFilter.value = null
  pagination.value.current = 1
  fetchTransactions()
}

const exportPdf = async () => {
  try {
    const blob = await $api('/wallet/history/pdf', { responseType: 'blob' })
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')
  } catch (err) {
    message.error('Failed to export PDF')
  }
}

const refreshAll = async () => {
  await Promise.all([fetchWallet(), fetchTransactions()])
  message.success('Refreshed successfully')
}

const handlePaginationChange = (page: number, pageSize?: number) => {
  pagination.value.current = page
  if (pageSize) pagination.value.pageSize = pageSize
  fetchTransactions()
}

/* ✅ DEBOUNCED SEARCH */
const debouncedSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    pagination.value.current = 1
    fetchTransactions()
  }, 500)
}

watch(searchText, debouncedSearch)
watch([monthFilter, yearFilter], () => {
  pagination.value.current = 1
  fetchTransactions()
})

onMounted(async () => {
  await Promise.all([fetchWallet(), fetchTransactions()])
})
</script>

<template>
  <div class="p-2 sm:p-6 lg:p-2 space-y-2 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 min-h-screen">
    
    <!-- ✅ MOBILE WALLET HEADER -->
    <Card class="!shadow-xl !border border-emerald-200/30">
      <div class="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div class="flex-1 space-y-2 sm:space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <WalletOutlined class="text-xl" />
              <Typography.Text class="text-xs uppercase tracking-wide font-bold">
                Admin Wallet Balance
              </Typography.Text>
            </div>
            <Typography.Title :level="2" class="text-3xl sm:text-4xl lg:text-5xl font-black !m-0 drop-shadow-lg">
              {{ balanceText }}
            </Typography.Title>
            <div class="flex flex-wrap items-center gap-3 text-sm font-semibold opacity-90">
              <span class="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg">{{ currency }}</span>
              <span class="flex items-center gap-1">
                <CheckCircleOutlined class="text-lg" />
                Available Balance
              </span>
            </div>
          </div>
          <Button 
            type="text" 
            @click="hideBalance = !hideBalance"
            class="px-6 py-3 font-semibold !border-none bg-white/20 hover:bg-white/30 rounded-xl border border-white/30 h-14"
          >
            <component :is="hideBalance ? EyeOutlined : EyeInvisibleOutlined" class="mr-2 text-lg" />
            {{ hideBalance ? 'Show' : 'Hide' }}
          </Button>
        </div>
      </div>
    </Card>

    <!-- ✅ TRANSACTIONS SECTION -->
    <Card class="!shadow-xl border border-emerald-200/30 backdrop-blur-sm rounded-3xl">
      <div class="p-1 sm:p-2 lg:p-2">
        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-6">
          <div>
            <div class="!m-0 text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Transaction History
            </div>
            <div class="text-lg opacity-80">
              {{ pagination.total.toLocaleString() }} total transactions
            </div>
          </div>
          
        </div>

        <!-- Filters - Mobile Responsive -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 p-4 bg-emerald-50/50 backdrop-blur-sm rounded-2xl border border-emerald-200/30">
          <Input.Search
            v-model:value="searchText"
            placeholder="🔍 Search ID, description, reference..."
            size="large"
            class="!h-12 rounded-xl shadow-sm border-emerald-300 w-full"
            @search="fetchTransactions"
            enter-button="Search"
          />
          
          <div class="flex gap-3 lg:col-span-2">
            <Dropdown trigger="click" class="flex-1 lg:flex-none">
              <Button size="large" class="!h-12 px-6 rounded-xl shadow-sm flex items-center gap-2 border-emerald-300 w-full lg:w-auto">
                <FilterOutlined /> Filters
              </Button>
              <template #overlay>
                <div class="p-4 w-80 space-y-3 bg-white shadow-2xl rounded-2xl border border-gray-200">
                  <Select 
                    v-model:value="monthFilter" 
                    placeholder="All Months" 
                    allow-clear 
                    size="middle" 
                    class="w-full"
                  >
                    <Select.Option v-for="m in 12" :key="m" :value="m">
                      {{ dayjs().month(m - 1).format('MMMM') }}
                    </Select.Option>
                  </Select>
                  <Select 
                    v-model:value="yearFilter" 
                    placeholder="All Years" 
                    allow-clear 
                    size="middle" 
                    class="w-full"
                  >
                    <Select.Option v-for="y in 6" :key="2025 - y" :value="String(2025 - y)">
                      {{ 2025 - y }}
                    </Select.Option>
                  </Select>
                  <div class="flex gap-2 pt-2">
                    <Button block @click="resetFilters" size="middle">Reset All</Button>
                    <Button type="primary" block @click="fetchTransactions" size="middle">Apply</Button>
                  </div>
                </div>
              </template>
            </Dropdown>
            <Button 
              type="primary" 
              ghost 
              size="small" 
              @click="exportPdf" 
              class="!h-12 px-8 rounded-xl shadow-sm border-emerald-300 "
            >
              <FilePdfOutlined class="mr-1" /> Export
            </Button>
            
          </div>
        </div>

        <!-- ✅ MOBILE TABLE + CUSTOM PAGINATION -->
       <!-- ✅ FULLY SCROLLABLE TABLE + PAGINATION -->
<div class="space-y-1">
  <!-- ✅ PERFECTLY SCROLLABLE TABLE -->
  <div class="w-full overflow-x-auto rounded-2xl border border-emerald-200/50 bg-white/80 backdrop-blur-sm scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-emerald-100">
    <div class="min-w-[1400px]">
      <Table
        :columns="[
          { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' }, fixed: 'left' },
          { title: 'Type', dataIndex: 'type', key: 'type', width: 100, slots: { customRender: 'typeCell' }, fixed: 'left' },
          { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, width: 280 },
          { title: 'Before', key: 'balanceBefore', width: 140, align: 'right', slots: { customRender: 'balanceBeforeCell' } },
          { title: 'Amount', key: 'amount', width: 140, align: 'right', slots: { customRender: 'amountCell' } },
          { title: 'After', key: 'balanceAfter', width: 140, align: 'right', slots: { customRender: 'balanceAfterCell' } },
          { title: 'Date', dataIndex: 'created_at', key: 'created_at', width: 160, slots: { customRender: 'dateCell' } }
        ]"
        :data-source="transactions"
        :loading="loading"
        row-key="id"
        :scroll="{ x: 1400, y: 500 }" 
        :pagination="false"
        :row-class-name="getRowClassName"
        class="admin-table w-full"
      >
        <template #indexCell="{ index }">
          <div class="font-bold text-emerald-600 text-sm">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </div>
        </template>
        
        <template #typeCell="{ record }">
          <Tag 
            :color="record?.type === 'credit' ? 'success' : 'error'" 
            class="!font-bold !px-4 !py-1.5 !text-sm rounded-full shadow-sm"
          >
            {{ record?.type?.toUpperCase() || '-' }}
          </Tag>
        </template>
        
        <template #balanceBeforeCell="{ record }">
          <div class="font-mono text-sm font-medium text-gray-700">
            {{ formatNaira(Number(record.balance_before || 0)) }}
          </div>
        </template>
        
        <template #amountCell="{ record }">
          <span :class="[
            'font-mono font-black text-lg inline-block px-2 py-1 rounded-lg shadow-sm',
            record?.type === 'credit' ? 'text-emerald-600 bg-emerald-100/50' : 'text-red-600 bg-red-100/50'
          ]">
            {{ record?.type === 'credit' ? '+' : '-' }}{{ formatNaira(Number(record.amount || 0)) }}
          </span>
        </template>
        
        <template #balanceAfterCell="{ record }">
          <div class="font-mono text-sm font-semibold text-emerald-600 bg-emerald-50/50 px-2 py-1 rounded-lg">
            {{ formatNaira(Number(record.balance_after || 0)) }}
          </div>
        </template>
        
        <template #dateCell="{ record }">
          <div class="text-sm font-medium text-gray-700">
            {{ dayjs(record.created_at).format('DD MMM YYYY • hh:mm A') }}
          </div>
        </template>
      </Table>
    </div>
  </div>

  <!-- ✅ CUSTOM PAGINATION - Mobile Responsive -->
  <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-emerald-200/50 bg-white/50 rounded-b-2xl p-2">
    <div class="text-sm text-gray-600 font-medium">
      Showing {{ (pagination.current - 1) * pagination.pageSize + 1 }} to 
      {{ Math.min(pagination.current * pagination.pageSize, pagination.total) }} of 
      {{ pagination.total.toLocaleString() }} transactions
    </div>
    
    <Pagination
      v-model:current="pagination.current"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-size-options="pagination.pageSizeOptions"
      :show-size-changer="true"
      :show-quick-jumper="true"
      :show-total="(total, range) => `${range[0]}-${range[1]} of ${total.toLocaleString()}`"
      @change="handlePaginationChange"
      @show-size-change="(current, size) => { pagination.pageSize = size; pagination.current = 1; fetchTransactions() }"
      class="flex-1 sm:flex-none"
    />
  </div>
</div>

      </div>
    </Card>
  </div>
</template>


<style scoped>
.admin-table :deep(.ant-table-thead) {
  @apply !bg-gradient-to-r !from-emerald-500 !to-teal-600 !border-none rounded-t-xl;
}

.admin-table :deep(.ant-table-thead th) {
  @apply !bg-transparent !text-white !font-black !py-4 !px-4 text-sm 
         !border-none !shadow-none backdrop-blur-sm;
}

.admin-table :deep(.ant-table-tbody td) {
  @apply !py-4 !px-4 border-t border-emerald-100/30 hover:!bg-emerald-50/50 transition-all duration-200;
}

.admin-table :deep(.ant-table-row:hover > td) {
  @apply bg-gradient-to-r from-emerald-50/70 to-teal-50/70 shadow-sm;
}

/* 🔥 BULLETPROOF ROW COLORS - Higher Specificity */
.admin-table :deep(.ant-table-tbody .credit-row) {
  background-color: rgb(236 253 245 / 0.9) !important; /* emerald-50/90 */
}

.admin-table :deep(.ant-table-tbody .credit-row:hover) {
  background-color: rgb(209 250 229 / 0.9) !important; /* emerald-100/90 */
}

.admin-table :deep(.ant-table-tbody .debit-row) {
  background-color: rgb(254 242 242 / 0.9) !important; /* red-50/90 */
}

.admin-table :deep(.ant-table-tbody .debit-row:hover) {
  background-color: rgb(254 226 226 / 0.9) !important; /* red-100/90 */
}

/* Legacy fallback */
.credit-row, .credit-row td {
  background-color: rgb(236 253 245 / 0.9) !important;
}

.debit-row, .debit-row td {
  background-color: rgb(254 242 242 / 0.9) !important;
}

.font-mono {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>

