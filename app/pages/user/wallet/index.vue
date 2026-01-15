<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user'],
})

import { ref, onMounted, computed, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  Table, Card, Button, Input, Select, Typography, Dropdown, message, Tag, Modal, Form
} from 'ant-design-vue'
import { 
  EyeOutlined, EyeInvisibleOutlined, FilterOutlined, FilePdfOutlined, ReloadOutlined,
  WalletOutlined, CheckCircleOutlined, PlusCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const { $api } = useNuxtApp()

const fundModalVisible = ref(false)
const loading = ref(false)

// Wallet state
const walletLoading = ref(false)
const hideBalance = ref(true)
const walletBalance = ref(0)
const currency = ref('NGN')

// Fund modal
const fundingAmount = ref(0)

// FIXED PAGINATION & TRANSACTIONS
const transactions = ref<any[]>([])
const pagination = ref({
  current: 1,
  pageSize: 20, // Match API default
  total: 0,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} of ${total.toLocaleString()} transactions`
})

// Filters
const searchText = ref('')
const monthFilter = ref<number | null>(null)
const yearFilter = ref<string | null>(null)
const searchTimeout = ref<NodeJS.Timeout | null>(null)

// Computed
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
  if (!record || !record.type) return ''
  return record.type === 'credit' ? 'credit-row' : 'debit-row'
}

// FIXED fundWallet function
const fundWallet = async () => {
  try {
    const amount = Number(fundingAmount.value)
    if (isNaN(amount) || amount < 1000) {
      message.error('Minimum funding amount is ₦1,000')
      return
    }

    loading.value = true
    const res = await $api('/wallet/initialize', {
      method: 'POST',
      body: { amount },
    })

    const authUrl = res?.data?.authorization_url
    if (!authUrl) {
      throw new Error('Authorization URL not returned')
    }

    window.open(authUrl, '_blank')
    message.success('Redirecting to Paystack...')
    
    fundModalVisible.value = false
    fundingAmount.value = 0
  } catch (error: any) {
    message.error(error.data?.message || 'Unable to initialize payment')
  } finally {
    loading.value = false
  }
}

// FIXED fetchWallet
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

// ✅ FIXED fetchTransactions - Handles your API response structure
const fetchTransactions = async (forceRefresh = false) => {
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

    const res = await $api('/wallet/transactions', { params })
    
    // ✅ FIXED: Handle your exact API response structure
    transactions.value = res.transactions?.data || res.data?.data || res.data || []
    
    // ✅ FIXED: Extract pagination data correctly
    const meta = res.transactions || res.data || res || {}
    pagination.value.total = Number(meta.total || 0)
    pagination.value.current = Number(meta.current_page || 1)
    pagination.value.pageSize = Number(meta.per_page || meta.page_size || 20)
    
  } catch (error) {
    console.error('❌ Transactions error:', error)
    transactions.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

// Actions
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

const handleTableChange = (paginationConfig: any) => {
  pagination.value.current = paginationConfig.current || 1
  pagination.value.pageSize = paginationConfig.pageSize || 20
  fetchTransactions()
}

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
  <div class="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 min-h-screen">
    
    <!-- Wallet Header -->
    <Card class="!shadow-none !border border-emerald-200/30">
      <div class="p-4 sm:p-6 lg:p-8 bg-emerald-600 rounded-2xl">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 text-white">
          <div class="flex-1 space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <WalletOutlined class="text-xl" />
              <Typography.Text class="text-xs uppercase tracking-wide font-bold opacity-90">
                Wallet Balance
              </Typography.Text>
            </div>
            <Typography.Title :level="2" class="text-3xl sm:text-4xl lg:text-5xl font-black !m-0 mb-2 drop-shadow-lg">
              {{ balanceText }}
            </Typography.Title>
            <div class="flex items-center gap-3 text-sm font-semibold opacity-90 flex-wrap">
              <span class="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg">{{ currency }}</span>
              <span class="flex items-center gap-1 text-xs">
                <CheckCircleOutlined class="text-sm" />
                Available to spend
              </span>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:flex-col">
            <Button 
              type="primary" 
              @click="fundModalVisible = true"
              class="h-12 sm:h-14 px-6 font-bold text-base sm:text-lg shadow-xl flex items-center gap-2 bg-white hover:bg-white/90 border-white/50 text-emerald-600 rounded-2xl w-full lg:w-auto transition-all duration-200 hover:scale-[1.02]"
              size="large"
            >
              <PlusCircleOutlined class="text-lg sm:text-xl" />
              Fund Wallet
            </Button>
            <Button 
              type="text" 
              @click="hideBalance = !hideBalance"
              class="px-4 sm:px-6 py-2 font-semibold text-sm sm:text-base !border-none bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl border border-white/30 h-12 transition-all duration-200"
            >
              <component :is="hideBalance ? EyeOutlined : EyeInvisibleOutlined" class="mr-1" />
              {{ hideBalance ? 'Show' : 'Hide' }}
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Mobile-First Fund Modal -->
    <Modal
      v-model:open="fundModalVisible"
      :width="320"
      :footer="null"
      :closable="false"
      centered
      destroy-on-close
      class="micro-modal"
      :bodyStyle="{ padding: '12px' }"
      :maskStyle="{ backdropFilter: 'blur(8px)' }"
    >
      <div class="text-center text-sm font-bold text-emerald-700 mb-3">
        💰 Fund Wallet
      </div>
      
      <Form layout="vertical">
        <Form.Item
          label="Amount (₦)"
          class="!mb-2"
          :rules="[{ required: true, message: 'Enter amount' }, { type: 'number', min: 1000, message: 'Min ₦1,000' }]"
        >
          <Input
            v-model:value.number="fundingAmount"
            type="number"
            placeholder="1000"
            size="large"
            class="!h-12"
          />
        </Form.Item>

        <div class="text-right text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mb-3">
          {{ formatNaira(Number(fundingAmount || 0)) }}
        </div>

        <div class="flex gap-2">
          <Button
            block
            size="middle"
            @click="fundModalVisible = false"
            class="h-11 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            block
            size="middle"
            :loading="loading"
            @click="fundWallet"
            class="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            Fund ₦{{ fundingAmount | 0 }}
          </Button>
        </div>
      </Form>
    </Modal>

    <!-- ✅ MOBILE-FRIENDLY Transactions Section -->
    <Card class="!shadow-xl border border-emerald-200/30 backdrop-blur-sm rounded-3xl">
      <div class="p-4 sm:p-6 lg:p-8">
        <!-- Header - Mobile Optimized -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Typography.Title level="3" class="!m-0 text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Transaction History
            </Typography.Title>
            <Typography.Text class="text-base sm:text-lg opacity-80 block mt-1">
              {{ pagination.total.toLocaleString() }} transactions • 
              Page {{ pagination.current }} of {{ Math.ceil(pagination.total / pagination.pageSize) }}
            </Typography.Text>
          </div>
         
        </div>

        <!-- Mobile-First Filters -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 p-4 bg-emerald-50/50 backdrop-blur-sm rounded-2xl border border-emerald-200/30">
          <Input.Search
            v-model:value="searchText"
            placeholder="🔍 Search transactions..."
            size="large"
            class="!h-12 rounded-xl shadow-sm border-emerald-300 w-full"
            @search="fetchTransactions"
            enter-button="Search"
          />
          
          <div class="flex gap-2 lg:col-span-2 w-full">
            <Dropdown trigger="click">
              <Button size="large" class="!h-12 px-3 sm:px-4 rounded-xl shadow-sm flex items-center gap-1 border-emerald-300 w-full sm:w-auto">
                <FilterOutlined /> Filters
              </Button>
              <template #overlay>
                <div class="p-4 w-72 sm:w-80 space-y-3 bg-white shadow-2xl rounded-2xl border border-gray-200">
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
                    <Button block @click="resetFilters" size="middle">Reset</Button>
                    <Button type="primary" block @click="fetchTransactions" size="middle">Apply</Button>
                  </div>
                </div>
              </template>
            </Dropdown>
            <Button 
              type="primary" 
              ghost 
              size="smaill" 
              @click="exportPdf" 
              class="!h-12 px-4 sm:px-6 rounded-xl shadow-sm border-emerald-300 w-full sm:w-auto"
            >
              <FilePdfOutlined /> PDF
            </Button>
             <Button 
            type="primary" 
            @click="refreshAll" 
            :loading="loading || walletLoading"
            class="px-4 sm:px-6 h-12 font-semibold shadow-lg flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-2xl w-full sm:w-auto"
            size="large"
          >
            <ReloadOutlined /> Refresh
          </Button>
          </div>
        </div>

        <div class="w-full overflow-x-auto rounded-2xl border border-emerald-200/50 bg-white/80 backdrop-blur-sm scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-emerald-100">
          <div class="min-w-[900px]">
            <Table
              :columns="[
                { title: 'Type', dataIndex: 'type', key: 'type', width: 90, slots: { customRender: 'typeCell' }, fixed: 'left' },
                { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, slots: { customRender: 'descriptionCell' } },
                { title: 'Amount', key: 'amount', width: 140, align: 'right', slots: { customRender: 'amountCell' } },
                { title: 'Balance', key: 'balanceAfter', width: 140, align: 'right', slots: { customRender: 'balanceAfterCell' } },
                { title: 'Date', dataIndex: 'created_at', key: 'created_at', width: 140, slots: { customRender: 'dateCell' } }
              ]"
              :data-source="transactions"
              :loading="loading"
              row-key="id"
              :scroll="{ x: 900 }"
              :pagination="pagination"
              @change="handleTableChange"
              :row-class-name="getRowClassName"
              class="mobile-table w-full"
            >
              <!-- Mobile-optimized cells -->
              <template #typeCell="{ record }">
                <Tag 
                  :color="record?.type === 'credit' ? 'success' : 'error'" 
                  class="!font-bold !px-3 !py-1 !text-xs sm:!text-sm rounded-full shadow-sm"
                >
                  {{ record?.type?.toUpperCase() || '-' }}
                </Tag>
              </template>
              
              <template #descriptionCell="{ record }">
                <div class="text-sm sm:text-base font-medium line-clamp-2">
                  {{ record.description || '-' }}
                </div>
              </template>
              
              <template #amountCell="{ record }">
                <span :class="[
                  'font-mono font-black text-base sm:text-lg inline-block px-2 py-1 rounded-lg shadow-sm whitespace-nowrap',
                  record?.type === 'credit' ? 'text-emerald-600 bg-emerald-100/50' : 'text-red-600 bg-red-100/50'
                ]">
                  {{ record?.type === 'credit' ? '+' : '-' }}{{ formatNaira(Number(record.amount || 0)) }}
                </span>
              </template>
              
              <template #balanceAfterCell="{ record }">
                <div class="font-mono text-sm sm:text-base font-semibold text-emerald-600 bg-emerald-50/50 px-2 py-1 rounded-lg whitespace-nowrap">
                  {{ formatNaira(Number(record.balance_after || 0)) }}
                </div>
              </template>
              
              <template #dateCell="{ record }">
                <div class="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  {{ dayjs(record.created_at).format('DD MMM • hh:mm A') }}
                </div>
              </template>
            </Table>
          </div>
        </div>

      </div>
    </Card>
  </div>
</template>

<style scoped>
/* ✅ BULLETPROOF ROW COLORS + SCROLLBAR */
.mobile-table {
  @apply w-full;
}

.mobile-table :deep(.ant-table-container) {
  @apply w-full overflow-x-auto;
}

/* ✅ LIGHT GREEN CREDIT ROWS */
.mobile-table :deep(.ant-table-tbody .credit-row) {
  background-color: rgb(236 253 245 / 0.9) !important; /* emerald-50/90 */
}

.mobile-table :deep(.ant-table-tbody .credit-row:hover) {
  background-color: rgb(209 250 229 / 0.9) !important; /* emerald-100/90 */
}

/* ✅ LIGHT RED DEBIT ROWS */
.mobile-table :deep(.ant-table-tbody .debit-row) {
  background-color: rgb(254 242 242 / 0.9) !important; /* red-50/90 */
}

.mobile-table :deep(.ant-table-tbody .debit-row:hover) {
  background-color: rgb(254 226 226 / 0.9) !important; /* red-100/90 */
}

/* Custom scrollbar (Chrome/Safari) */
.mobile-table :deep(.ant-table-container::-webkit-scrollbar) {
  height: 8px;
}

.mobile-table :deep(.ant-table-container::-webkit-scrollbar-track) {
  background: rgb(248 250 252 / 0.5);
  border-radius: 4px;
}

.mobile-table :deep(.ant-table-container::-webkit-scrollbar-thumb) {
  background: rgb(16 185 129 / 0.7);
  border-radius: 4px;
}

.mobile-table :deep(.ant-table-container::-webkit-scrollbar-thumb:hover) {
  background: rgb(5 150 105 / 0.9);
}

/* Keep all your existing styles */
.mobile-table :deep(.ant-table-thead) {
  @apply !bg-gradient-to-r !from-emerald-500 !to-teal-600 !border-none rounded-t-2xl;
}
/* ... rest unchanged ... */


.font-mono {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
