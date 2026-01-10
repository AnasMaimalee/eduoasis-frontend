<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['administrator'],
})

import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  Table, Card, Button, Input, Select, Typography, Dropdown, message, Tag
} from 'ant-design-vue'
import { 
  EyeOutlined, EyeInvisibleOutlined, FilterOutlined, FilePdfOutlined, ReloadOutlined,
  WalletOutlined, CheckCircleOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const { $api } = useNuxtApp()

/* ================= STATE ================= */
const loading = ref(false)
const walletLoading = ref(false)
const hideBalance = ref(true)

const walletBalance = ref(0)
const currency = ref('NGN')

/* ✅ FIXED PAGINATION - DEFAULT 50 */
const transactions = ref<any[]>([])
const pagination = ref({
  current: 1,
  pageSize: 50,  // ✅ DEFAULT 50 RECORDS
  total: 0,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} of ${total.toLocaleString()} transactions`
})

/* ✅ FIXED SEARCH & FILTERS */
const searchText = ref('')
const monthFilter = ref<number | null>(null)
const yearFilter = ref<string | null>(null)
const searchTimeout = ref<NodeJS.Timeout | null>(null)

/* ================= COMPUTED ================= */
const balanceText = computed(() =>
  hideBalance.value ? '••••••' : `₦${walletBalance.value.toLocaleString()}`
)

const getRowClassName = (record: any) => {
  if (!record || !record.type) return ''
  return record.type === 'credit' ? 'credit-row' : 'debit-row'
}

/* ================= API ================= */
const fetchWallet = async () => {
  try {
    walletLoading.value = true
    const res = await $api('/wallet/me')
    walletBalance.value = Number(res.balance || 0)
    currency.value = res.currency || 'NGN'
  } catch (err) {
    console.error('Wallet error:', err)
  } finally {
    walletLoading.value = false
  }
}

/* ✅ FIXED SEARCH + PAGINATION */
const fetchTransactions = async (forceRefresh = false) => {
  loading.value = true
  
  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
  
  try {
    const params: any = {
      page: pagination.value.current,
      per_page: pagination.value.pageSize,  // ✅ SERVER GETS pageSize
      _limit: pagination.value.pageSize     // ✅ BACKUP param
    }
    
    // ✅ FIXED SEARCH - Only send if not empty
    if (searchText.value.trim()) {
      params.search = searchText.value.trim()
      params.q = searchText.value.trim()     // ✅ Multiple search params
    }
    
    if (monthFilter.value) params.month = monthFilter.value
    if (yearFilter.value) params.year = yearFilter.value

    console.log('🔍 API CALL:', params) // Debug
    
    const res = await $api('/wallet/transactions', { params })
    
    // ✅ SUPER ROBUST data handling
    transactions.value = Array.isArray(res.data?.data) ? res.data.data :
                       Array.isArray(res.data) ? res.data :
                       Array.isArray(res.transactions?.data) ? res.transactions.data :
                       Array.isArray(res) ? res : []
    
    // ✅ SUPER ROBUST pagination
    const meta = res.data || res || res.meta || {}
    pagination.value.total = Number(meta.total || meta.total_count || meta.count || 0)
    
    // ✅ ONLY update current/pageSize from SERVER if they exist
    if (meta.current_page) pagination.value.current = Number(meta.current_page)
    if (meta.per_page || meta.page_size) {
      pagination.value.pageSize = Number(meta.per_page || meta.page_size)
    }
    
    console.log('✅ LOADED:', transactions.value.length, 'Total:', pagination.value.total)
    
  } catch (error) {
    console.error('❌ ERROR:', error)
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
  await Promise.all([fetchWallet(), fetchTransactions(true)])
  message.success('Refreshed successfully')
}

/* ✅ FIXED PAGINATION HANDLER */
const handleTableChange = (paginationConfig: any, filters: any, sorter: any) => {
  console.log('📊 TABLE CHANGE:', paginationConfig)
  
  // Update pagination state
  pagination.value.current = paginationConfig.current || 1
  pagination.value.pageSize = paginationConfig.pageSize || 50
  
  // Fetch new data
  fetchTransactions()
}

/* ✅ FIXED SEARCH DEBOUNCE */
const debouncedSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  
  searchTimeout.value = setTimeout(() => {
    pagination.value.current = 1  // Reset to page 1
    fetchTransactions()
  }, 500)
}

/* ================= WATCHERS ================= */
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
  <div class="p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
    
    <!-- Compact Wallet Card -->
    <Card class="!shadow-xl !border border-emerald-200/30">
      <div class="relative overflow-hidden rounded-2xl p-6 lg:p-8" 
           :style="{
             background: 'linear-gradient(135deg, #10b981 0%, #059669 70%, #34d399 100%)',
             'box-shadow': '0 20px 40px -10px rgba(16, 185, 129, 0.4)'
           }">
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-white">
          <div class="flex-1 space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <WalletOutlined class="text-xl" />
              <Typography.Text class="text-xs uppercase tracking-wide font-bold opacity-90">
                Wallet Balance
              </Typography.Text>
            </div>
            <Typography.Title :level="2" class="text-4xl lg:text-5xl font-black !m-0 drop-shadow-xl mb-2">
              {{ balanceText }}
            </Typography.Title>
            <div class="flex items-center gap-3 text-sm font-semibold opacity-90">
              <span class="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg">{{ currency }}</span>
              <span class="flex items-center gap-1 text-xs">
                <CheckCircleOutlined class="text-sm" />
                Available
              </span>
            </div>
          </div>
          <Button 
            type="text" 
            @click="hideBalance = !hideBalance"
            class="px-6 py-2 font-semibold text-base !border-none bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl border border-white/30"
          >
            <component :is="hideBalance ? EyeOutlined : EyeInvisibleOutlined" class="mr-1" />
            {{ hideBalance ? 'Show' : 'Hide' }}
          </Button>
        </div>
      </div>
    </Card>

    <!-- Transactions -->
    <Card class="!shadow-xl border border-emerald-200/30 backdrop-blur-sm">
      <div class="p-6 lg:p-8">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <Typography.Title level="3" class="!m-0 text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              Transaction History
            </Typography.Title>
            <Typography.Text class="text-lg opacity-80">
              {{ pagination.total.toLocaleString() }} total transactions • Page {{ pagination.current }}
            </Typography.Text>
          </div>
          <Button 
            type="primary" 
            @click="refreshAll" 
            :loading="loading || walletLoading"
            class="px-6 h-12 font-semibold shadow-lg flex items-center gap-2"
            icon="ReloadOutlined"
          >
            Refresh
          </Button>
        </div>

        <!-- ✅ FIXED Filters -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 p-4 bg-emerald-50/30 rounded-2xl">
          <!-- ✅ FIXED Search -->
          <Input.Search
            v-model:value="searchText"
            placeholder="🔍 Search description, ID, reference..."
            size="large"
            class="!h-12 rounded-xl shadow-sm"
            @search="fetchTransactions"
            enter-button
          />
          
          <div class="flex gap-2 lg:col-span-2">
            <Dropdown trigger="click">
              <Button size="large" class="!h-12 px-4 rounded-xl shadow-sm flex items-center gap-1">
                <FilterOutlined /> Filters
              </Button>
              <template #overlay>
                <div class="p-4 w-72 space-y-3 bg-white shadow-xl rounded-2xl border">
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
                  <div class="flex gap-2">
                    <Button block @click="resetFilters" size="middle">Reset</Button>
                    <Button type="primary" block @click="fetchTransactions" size="middle">Apply</Button>
                  </div>
                </div>
              </template>
            </Dropdown>
            <Button 
              type="primary" 
              ghost 
              size="large" 
              @click="exportPdf" 
              class="!h-12 px-6 rounded-xl shadow-sm"
              icon="FilePdfOutlined"
            >
              Export
            </Button>
          </div>
        </div>

        <!-- ✅ FIXED Table - Default 50 records -->
      <!-- ✅ GREEN HEADER + COLORED ROWS -->
      <Table
        :columns="[
          { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' }, fixed: 'left' },
          { title: 'Type', dataIndex: 'type', key: 'type', width: 110, slots: { customRender: 'typeCell' }, fixed: 'left' },
          { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
          { title: 'Before', key: 'balanceBefore', width: 140, align: 'right', slots: { customRender: 'balanceBeforeCell' } },
          { title: 'Amount', key: 'amount', width: 140, align: 'right', slots: { customRender: 'amountCell' } },
          { title: 'After', key: 'balanceAfter', width: 140, align: 'right', slots: { customRender: 'balanceAfterCell' } },
          { title: 'Date', dataIndex: 'created_at', key: 'created_at', width: 160, slots: { customRender: 'dateCell' } }
        ]"
        :data-source="transactions"
        :loading="loading"
        row-key="id"
        :scroll="{ x: 1200 }"
        :pagination="pagination"
        @change="handleTableChange"
        :row-class-name="getRowClassName"
        class="admin-table"  
>

          <!-- Templates unchanged -->
          <template #indexCell="{ index }">
            <div class="font-bold text-emerald-600">{{ (pagination.current - 1) * pagination.pageSize + index + 1 }}</div>
          </template>
          
          <template #typeCell="{ record }">
            <Tag :color="record?.type === 'credit' ? 'success' : 'error'" class="!font-bold !px-3 !py-1 !text-xs">
              {{ record?.type?.toUpperCase() || '-' }}
            </Tag>
          </template>
          
          <template #balanceBeforeCell="{ record }">
            <div class="font-mono text-sm font-medium text-gray-700">
              ₦{{ Number(record.balance_before || 0).toLocaleString() }}
            </div>
          </template>
          
          <template #amountCell="{ record }">
            <span :class="record?.type === 'credit' ? 'text-emerald-600 font-black text-lg' : 'text-red-600 font-black text-lg'">
              {{ record?.type === 'credit' ? '+' : '-' }}₦{{ Number(record.amount || 0).toLocaleString() }}
            </span>
          </template>
          
          <template #balanceAfterCell="{ record }">
            <div class="font-mono text-sm font-semibold text-emerald-600">
              ₦{{ Number(record.balance_after || 0).toLocaleString() }}
            </div>
          </template>
          
          <template #dateCell="{ record }">
            <div class="text-xs">
              {{ dayjs(record.created_at).format('DD MMM • hh:mm A') }}
            </div>
          </template>
        </Table>
      </div>
    </Card>
  </div>
</template>
<style scoped>
/* ✅ CLEAN GREEN TABLE HEADER - NO RADIUS, NO SHADOW */
.admin-table :deep(.ant-table-thead th) {
  @apply !bg-gradient-to-r !from-emerald-500 !to-emerald-600 
         !text-white !font-bold !py-4 !px-4 text-sm 
         !border-none !rounded-none !shadow-none;
}

/* ✅ CREDIT ROWS - Light Green */
.credit-row {
  @apply !bg-emerald-50/80 hover:!bg-emerald-100/80;
}

/* ✅ DEBIT ROWS - Light Red */
.debit-row {
  @apply !bg-red-50/80 hover:!bg-red-100/80;
}

/* ✅ TABLE BODY ENHANCEMENT */
.admin-table :deep(.ant-table-tbody td) {
  @apply !py-3.5 !px-4 border-t border-emerald-100/30;
}

/* ✅ HOVER EFFECTS */
.admin-table :deep(.ant-table-row:hover > td) {
  @apply bg-emerald-50/30;
}

/* ✅ STRIPED EFFECT */
.admin-table :deep(.ant-table-row:nth-child(even)) {
  @apply bg-white/30;
}

/* ✅ FONT MONO FOR BALANCES */
.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>


