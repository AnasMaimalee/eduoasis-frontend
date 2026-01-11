<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user'],
})

import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  Table, Card, Button, Input, Select, Typography, Dropdown, message, Tag, Modal, Form
} from 'ant-design-vue'
import { 
  EyeOutlined, EyeInvisibleOutlined, FilterOutlined, FilePdfOutlined, ReloadOutlined,
  WalletOutlined, CheckCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, PlusCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const { $api } = useNuxtApp()

const fundModalVisible = ref(false)
const loading = ref(false)

const fundModel = reactive({
  amount: 0,
})


/* ================= STATE ================= */
const walletLoading = ref(false)
const hideBalance = ref(true)
const walletBalance = ref(0)
const currency = ref('NGN')

/* ✅ FUND WALLET MODAL */
const fundForm = ref<any>(null)
const fundingAmount = ref(0)

/* ✅ FIXED PAGINATION - DEFAULT 50 */
const transactions = ref<any[]>([])
const pagination = ref({
  current: 1,
  pageSize: 50,
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

    // ✅ Open Paystack checkout
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
      _limit: pagination.value.pageSize
    }
    
    if (searchText.value.trim()) {
      params.search = searchText.value.trim()
      params.q = searchText.value.trim()
    }
    
    if (monthFilter.value) params.month = monthFilter.value
    if (yearFilter.value) params.year = yearFilter.value

    const res = await $api('/wallet/transactions', { params })
    
    transactions.value = Array.isArray(res.data?.data) ? res.data.data :
                       Array.isArray(res.data) ? res.data :
                       Array.isArray(res.transactions?.data) ? res.transactions.data :
                       Array.isArray(res) ? res : []
    
    const meta = res.data || res || res.meta || {}
    pagination.value.total = Number(meta.total || meta.total_count || meta.count || 0)
    
    if (meta.current_page) pagination.value.current = Number(meta.current_page)
    if (meta.per_page || meta.page_size) {
      pagination.value.pageSize = Number(meta.per_page || meta.page_size)
    }
    
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

const handleTableChange = (paginationConfig: any, filters: any, sorter: any) => {
  pagination.value.current = paginationConfig.current || 1
  pagination.value.pageSize = paginationConfig.pageSize || 50
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
  <div class="p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 min-h-screen">
    
    <!-- ✅ PLAIN GREEN WALLET HEADER -->
    <Card class="!shadow-none !border border-emerald-200/30">
      <div class="p-6 lg:p-8 bg-emerald-600 rounded-2xl">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-white">
          <div class="flex-1 space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <WalletOutlined class="text-xl" />
              <Typography.Text class="text-xs uppercase tracking-wide font-bold opacity-90">
                Wallet Balance
              </Typography.Text>
            </div>
            <Typography.Title :level="2" class="text-4xl lg:text-5xl font-black !m-0 mb-2 drop-shadow-lg">
              {{ balanceText }}
            </Typography.Title>
            <div class="flex items-center gap-3 text-sm font-semibold opacity-90">
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
              class="h-14 px-8 font-bold text-lg shadow-xl flex items-center gap-2 bg-white hover:bg-white/90 border-white/50 text-emerald-600 rounded-2xl w-full lg:w-auto transition-all duration-200 hover:scale-[1.02]"
              size="large"
            >
              <PlusCircleOutlined class="text-xl" />
              Fund Wallet
            </Button>
            <Button 
              type="text" 
              @click="hideBalance = !hideBalance"
              class="px-6 py-2 font-semibold text-base !border-none bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl border border-white/30 h-14 transition-all duration-200"
            >
              <component :is="hideBalance ? EyeOutlined : EyeInvisibleOutlined" class="mr-1" />
              {{ hideBalance ? 'Show' : 'Hide' }}
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- ✅ ULTRA COMPACT MODAL - 320px -->
   <!-- ✅ MICRO FUND MODAL -->
<Modal
  v-model:open="fundModalVisible"
  width="360"
  :footer="null"
  :closable="false"
  centered
  destroy-on-close
  class="micro-modal"
  :bodyStyle="{ padding: '10px' }"
  :maskStyle="{ backdropFilter: 'blur(8px)' }"
>
  <!-- TITLE -->
  <div class="text-center text-sm font-bold text-emerald-700 mb-2">
    💰 Fund Wallet
  </div>

  <Form layout="vertical" :model="fundModel">
    <Form.Item
      label="Amount (₦)"
      name="amount"
      :rules="[
        { required: true, message: 'Enter amount' },
        { type: 'number', min: 1000, message: 'Min ₦1,000' }
      ]"
      class="!mb-1"
    >
      <Input
        v-model:value.number="fundingAmount"
        type="number"
        placeholder="1000"
      />

    </Form.Item>

    <!-- PREVIEW -->
    <div class="text-right text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mb-2">
      {{ formatNaira(Number(fundModel.amount || 0)) }}
    </div>

    <!-- ACTIONS -->
    <div class="flex gap-1">
      <Button
        block
        size="small"
        @click="fundModalVisible = false"
        class="h-8 rounded-md"
      >
        Cancel
      </Button>

      <Button
        type="primary"
        block
        size="small"
        :loading="loading"
        @click="fundWallet"
        class="h-8 rounded-md bg-emerald-600 hover:bg-emerald-700"
      >
        Fund
      </Button>
    </div>
  </Form>
</Modal>


    <!-- Transactions Card -->
    <Card class="!shadow-xl border border-emerald-200/30 backdrop-blur-sm rounded-3xl">
      <div class="p-6 lg:p-8">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <Typography.Title level="3" class="!m-0 text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Transaction History
            </Typography.Title>
            <Typography.Text class="text-lg opacity-80">
              {{ pagination.total.toLocaleString() }} total transactions • Page {{ pagination.current }} of {{ Math.ceil(pagination.total / pagination.pageSize) }}
            </Typography.Text>
          </div>
          <Button 
            type="primary" 
            @click="refreshAll" 
            :loading="loading || walletLoading"
            class="px-6 h-12 font-semibold shadow-lg flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-2xl"
            size="large"
          >
            <ReloadOutlined /> Refresh
          </Button>
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 p-4 bg-emerald-50/50 backdrop-blur-sm rounded-2xl border border-emerald-200/30">
          <Input.Search
            v-model:value="searchText"
            placeholder="🔍 Search ID, description, reference..."
            size="large"
            class="!h-12 rounded-xl shadow-sm border-emerald-300"
            @search="fetchTransactions"
            enter-button="Search"
          />
          
          <div class="flex gap-2 lg:col-span-2">
            <Dropdown trigger="click">
              <Button size="large" class="!h-12 px-4 rounded-xl shadow-sm flex items-center gap-1 border-emerald-300">
                <FilterOutlined /> Filters
              </Button>
              <template #overlay>
                <div class="p-4 w-72 space-y-3 bg-white shadow-2xl rounded-2xl border border-gray-200">
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
                    <Button type="primary" block @click="fetchTransactions" size="middle">Apply Filters</Button>
                  </div>
                </div>
              </template>
            </Dropdown>
            <Button 
              type="primary" 
              ghost 
              size="large" 
              @click="exportPdf" 
              class="!h-12 px-6 rounded-xl shadow-sm border-emerald-300"
            >
              <FilePdfOutlined /> Export PDF
            </Button>
          </div>
        </div>

        <!-- Transaction Table -->
        <Table
          :columns="[
            { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' }, fixed: 'left' },
            { title: 'Type', dataIndex: 'type', key: 'type', width: 110, slots: { customRender: 'typeCell' }, fixed: 'left' },
            { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
            { title: 'Before', key: 'balanceBefore', width: 200, align: 'right', slots: { customRender: 'balanceBeforeCell' } },
            { title: 'Amount', key: 'amount', width: 200, align: 'right', slots: { customRender: 'amountCell' } },
            { title: 'After', key: 'balanceAfter', width: 200, align: 'right', slots: { customRender: 'balanceAfterCell' } },
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
            <div class="text-xs font-medium text-gray-700">
              {{ dayjs(record.created_at).format('DD MMM YYYY • hh:mm A') }}
            </div>
          </template>
        </Table>
      </div>
    </Card>
  </div>
</template>

<style scoped>


.fund-modal :deep(.ant-modal-content) {
  @apply rounded-xl border border-emerald-200/50 shadow-lg;
}

.credit-row {
  @apply !bg-emerald-50/90 hover:!bg-emerald-100/90 transition-all duration-200;
}

.debit-row {
  @apply !bg-red-50/90 hover:!bg-red-100/90 transition-all duration-200;
}

.admin-table :deep(.ant-table-thead) {
  @apply !bg-gradient-to-r !from-emerald-500 !to-teal-600 !border-none rounded-t-2xl;
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

.admin-table :deep(.ant-table-row:nth-child(even)) {
  @apply bg-white/30;
}

.font-mono {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
