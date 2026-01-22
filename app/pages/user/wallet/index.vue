<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user'],
  title: 'Wallet'
})

import { ref, onMounted, computed, watch } from 'vue'
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

// Pagination & Transactions
const transactions = ref<any[]>([])
const pagination = ref({
  current: 1,
  pageSize: 20,
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

// Fund Wallet
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
    if (!authUrl) throw new Error('Authorization URL not returned')

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

// Fetch Wallet
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

// Fetch Transactions
const fetchTransactions = async (forceRefresh = false) => {
  loading.value = true
  if (searchTimeout.value) clearTimeout(searchTimeout.value)

  try {
    const params: any = {
      page: pagination.value.current,
      per_page: pagination.value.pageSize,
    }
    
    if (searchText.value.trim()) params.search = searchText.value.trim()
    if (monthFilter.value) params.month = monthFilter.value
    if (yearFilter.value) params.year = yearFilter.value

    const res = await $api('/wallet/transactions', { params })
    transactions.value = res.transactions?.data || res.data?.data || res.data || []

    const meta = res.transactions || res.data || res || {}
    pagination.value.total = Number(meta.total || 0)
    pagination.value.current = Number(meta.current_page || 1)
    pagination.value.pageSize = Number(meta.per_page || meta.page_size || 20)
    
  } catch (error) {
    console.error('Transactions error:', error)
    transactions.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

// Filters & Actions
const resetFilters = () => {
  searchText.value = ''
  monthFilter.value = null
  yearFilter.value = null
  pagination.value.current = 1
  fetchTransactions()
}

const exportingPdf = ref(false)
const exportPdf = async () => {
  exportingPdf.value = true
  try {
    const blob = await $api('/wallet/history/pdf', { responseType: 'blob' })
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')
  } catch {
    message.error('Failed to export PDF')
  } finally {
    exportingPdf.value = false
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
  <div class="p-2 sm:p-4 lg:p-6 space-y-4 lg:space-y-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 min-h-screen">
    
    <!-- Wallet Header -->
    <Card class="!shadow-none !border border-emerald-200/30">
      <div class="p-3 sm:p-4 lg:p-6 bg-emerald-600 rounded-2xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
          
          <div class="flex-1 space-y-1 sm:space-y-2">
            <div class="inline-flex items-center gap-2 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-xl text-xs sm:text-sm">
              <WalletOutlined class="text-base sm:text-xl" />
              Wallet Balance
            </div>
            <div class="text-lg sm:text-2xl lg:text-3xl font-black drop-shadow-lg">
              {{ balanceText }}
            </div>
            <div class="flex flex-wrap items-center gap-1 text-xs sm:text-sm font-semibold opacity-90">
              <span class="px-1.5 py-0.5 bg-white/15 backdrop-blur-sm rounded-md">{{ currency }}</span>
              <span class="flex items-center gap-1 text-xs sm:text-sm">
                <CheckCircleOutlined class="text-xs sm:text-sm" />
                Available to spend
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button 
              type="primary" 
              @click="fundModalVisible = true"
              class="h-10 sm:h-12 px-3 sm:px-5 font-bold text-sm sm:text-base shadow flex items-center gap-2 bg-white hover:bg-white/90 border-white/50 text-emerald-600 rounded-xl w-full sm:w-auto"
            >
              <PlusCircleOutlined /> Fund Wallet
            </Button>

            <Button 
              type="text" 
              @click="hideBalance = !hideBalance"
              class="px-2 sm:px-4 py-1 font-semibold text-xs sm:text-sm !border-none bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl w-full sm:w-auto flex items-center justify-center"
            >
              <component :is="hideBalance ? EyeOutlined : EyeInvisibleOutlined" class="mr-1" />
              {{ hideBalance ? 'Show' : 'Hide' }}
            </Button>
          </div>

        </div>
      </div>
    </Card>

    <!-- Fund Modal -->
    <Modal
      v-model:open="fundModalVisible"
      width="300"
      :footer="null"
      :closable="false"
      centered
      destroy-on-close
      class="micro-modal"
      :bodyStyle="{ padding: '12px' }"
      :maskStyle="{ backdropFilter: 'blur(8px)' }"
    >
      <div class="text-center text-sm font-bold text-emerald-700 mb-2">💰 Fund Wallet</div>
      
      <Form layout="vertical">
        <Form.Item label="Amount (₦)" class="!mb-2">
          <Input v-model:value.number="fundingAmount" type="number" placeholder="1000" size="middle" class="!h-10 sm:!h-12" />
        </Form.Item>

        <div class="text-right text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mb-2">
          {{ formatNaira(Number(fundingAmount || 0)) }}
        </div>

        <div class="flex gap-2">
          <Button block size="middle" @click="fundModalVisible = false" class="h-10 rounded-lg">Cancel</Button>
          <Button type="primary" block size="middle" :loading="loading" @click="fundWallet" class="h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700">
            Fund ₦{{ fundingAmount | 0 }}
          </Button>
        </div>
      </Form>
    </Modal>

    <!-- Transactions Section -->
    <Card class="!shadow-xl border border-emerald-200/30 backdrop-blur-sm rounded-2xl">
      <div class="p-3 sm:p-4 lg:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div class="text-base sm:text-lg lg:text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Transaction History
            </div>
            <div class="text-xs sm:text-sm opacity-80 mt-1">
              {{ pagination.total.toLocaleString() }} transactions • Page {{ pagination.current }} of {{ Math.ceil(pagination.total / pagination.pageSize) }}
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 mb-4 p-3 bg-emerald-50/50 backdrop-blur-sm rounded-xl border border-emerald-200/30">
          <Input.Search
            v-model:value="searchText"
            placeholder="🔍 Search transactions..."
            size="middle"
            class="!h-10 sm:!h-12 rounded-lg shadow-sm border-emerald-300 w-full"
            @search="fetchTransactions"
            enter-button="Search"
          />
          <div class="flex gap-2 lg:col-span-2 w-full flex-wrap">
            <Dropdown trigger="click">
              <Button size="middle" class="!h-10 sm:!h-12 px-2 sm:px-4 rounded-lg shadow-sm flex items-center gap-1 border-emerald-300 w-full sm:w-auto">
                <FilterOutlined /> Filters
              </Button>
              <template #overlay>
                <div class="p-3 w-64 sm:w-72 space-y-2 bg-white shadow-2xl rounded-xl border border-gray-200">
                  <Select v-model:value="monthFilter" placeholder="All Months" allow-clear size="middle" class="w-full">
                    <Select.Option v-for="m in 12" :key="m" :value="m">{{ dayjs().month(m-1).format('MMMM') }}</Select.Option>
                  </Select>
                  <Select v-model:value="yearFilter" placeholder="All Years" allow-clear size="middle" class="w-full">
                    <Select.Option v-for="y in 6" :key="2025 - y" :value="String(2025 - y)">{{ 2025 - y }}</Select.Option>
                  </Select>
                  <div class="flex gap-2 pt-2 flex-wrap">
                    <Button block @click="resetFilters" size="middle">Reset</Button>
                    <Button type="primary" block @click="fetchTransactions" size="middle">Apply</Button>
                  </div>
                </div>
              </template>
            </Dropdown>

            <Button type="primary" :loading="exportingPdf" ghost size="middle" @click="exportPdf" class="!h-10 sm:!h-12 px-2 sm:px-4 rounded-lg shadow-sm border-emerald-300 w-full sm:w-auto">
              <FilePdfOutlined /> PDF
            </Button>

            <Button type="primary" @click="refreshAll" :loading="loading || walletLoading" class="px-2 sm:px-4 h-10 sm:h-12 font-semibold shadow-lg flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl w-full sm:w-auto">
              <ReloadOutlined /> Refresh
            </Button>
          </div>
        </div>

        <!-- Table -->
        <div class="w-full overflow-x-auto rounded-xl border border-emerald-200/50 bg-white/80 backdrop-blur-sm scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-emerald-100">
          <div class="min-w-[800px]">
            <Table
              :columns="[
                { title: 'Type', dataIndex: 'type', key: 'type', width: 80, slots: { customRender: 'typeCell' }, fixed: 'left' },
                { title: 'Description', dataIndex: 'description', key: 'description', width: 150, slots: { customRender: 'descriptionCell' } },
                { title: 'Balance Before', key: 'balanceBefore', width: 120, align: 'right', slots: { customRender: 'balanceBeforeCell' } },
                { title: 'Amount', key: 'amount', width: 120, align: 'right', slots: { customRender: 'amountCell' } },
                { title: 'Balance After', key: 'balanceAfter', width: 120, align: 'right', slots: { customRender: 'balanceAfterCell' } },
                { title: 'Date', dataIndex: 'created_at', key: 'created_at', width: 120, slots: { customRender: 'dateCell' } }
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
              <template #typeCell="{ record }">
                <Tag :color="record?.type === 'credit' ? 'success' : 'error'" class="!text-xs sm:!text-sm !px-2 !py-1 rounded-full font-bold">
                  {{ record?.type?.toUpperCase() || '-' }}
                </Tag>
              </template>

              <template #descriptionCell="{ record }">
                <div class="text-xs sm:text-sm font-medium line-clamp-2">{{ record.description || '-' }}</div>
              </template>

              <template #amountCell="{ record }">
                <div :class="[
                  'font-mono text-xs sm:text-sm font-black inline-block px-1 py-0.5 rounded shadow-sm whitespace-nowrap',
                  record?.type === 'credit' ? 'text-emerald-600 bg-emerald-100/50' : 'text-red-600 bg-red-100/50'
                ]">
                  {{ record?.type === 'credit' ? '+' : '-' }}{{ formatNaira(Number(record.amount || 0)) }}
                </div>
              </template>

              <template #balanceBeforeCell="{ record }">
                <div class="font-mono text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100/50 px-1 py-0.5 rounded whitespace-nowrap">
                  {{ formatNaira(Number(record.balance_before || 0)) }}
                </div>
              </template>

              <template #balanceAfterCell="{ record }">
                <div class="font-mono text-xs sm:text-sm font-semibold text-emerald-600 bg-emerald-50/50 px-1 py-0.5 rounded whitespace-nowrap">
                  {{ formatNaira(Number(record.balance_after || 0)) }}
                </div>
              </template>

              <template #dateCell="{ record }">
                <div class="text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">
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
.mobile-table :deep(.ant-table-thead) {
  @apply !bg-gradient-to-r !from-emerald-500 !to-teal-600 !border-none rounded-t-xl;
}
.mobile-table :deep(.ant-table-tbody .credit-row) {
  background-color: rgb(236 253 245 / 0.9) !important;
}
.mobile-table :deep(.ant-table-tbody .debit-row) {
  background-color: rgb(254 242 242 / 0.9) !important;
}
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
