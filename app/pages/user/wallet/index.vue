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
  Table, Card, Button, Input, Select, Dropdown, message, Tag, Modal, Form
} from 'ant-design-vue'
import {
  EyeOutlined, EyeInvisibleOutlined, FilterOutlined, ReloadOutlined,
  WalletOutlined, CheckCircleOutlined, PlusCircleOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const { $api } = useNuxtApp()

/* ---------------- STATE ---------------- */
const fundModalVisible = ref(false)
const loading = ref(false)
const walletLoading = ref(false)
const hideBalance = ref(true)

const walletBalance = ref(0)
const currency = ref('NGN')
const fundingAmount = ref<number | null>(null)

const transactions = ref<any[]>([])
const searchText = ref('')
const monthFilter = ref<number | null>(null)
const yearFilter = ref<string | null>(null)
let searchTimeout: any = null

/* ---------------- PAGINATION ---------------- */
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total: number, range: number[]) =>
    `${range[0]}–${range[1]} of ${total.toLocaleString()}`
})

/* ---------------- COMPUTED ---------------- */
const balanceText = computed(() =>
  hideBalance.value ? '••••••' : `₦${walletBalance.value.toLocaleString()}`
)

const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount)

/* ---------------- WALLET ---------------- */
const fetchWallet = async () => {
  walletLoading.value = true
  try {
    const res = await $api('/wallet/me')
    walletBalance.value = Number(res?.current_balance ?? res?.balance ?? 0)
    currency.value = res?.currency || 'NGN'
  } catch (e) {
    console.error(e)
  } finally {
    walletLoading.value = false
  }
}

/* ---------------- TRANSACTIONS ---------------- */
const fetchTransactions = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.value.current,
      per_page: pagination.value.pageSize
    }

    if (searchText.value) params.search = searchText.value
    if (monthFilter.value) params.month = monthFilter.value
    if (yearFilter.value) params.year = yearFilter.value

    const res = await $api('/wallet/transactions', { params })

    const list = res?.transactions?.data || res?.data?.data || []
    const meta = res?.transactions || res?.data || {}

    transactions.value = list
    pagination.value.total = Number(meta.total || 0)
    pagination.value.current = Number(meta.current_page || 1)
    pagination.value.pageSize = Number(meta.per_page || 20)
  } catch (e) {
    console.error(e)
    transactions.value = []
  } finally {
    loading.value = false
  }
}

/* ---------------- FUND WALLET ---------------- */
const fundWallet = async () => {
  const amount = Number(fundingAmount.value)
  if (!amount || amount < 1000) {
    message.error('Minimum funding amount is ₦1,000')
    return
  }

  loading.value = true
  try {
    const res = await $api('/wallet/initialize', {
      method: 'POST',
      body: { amount }
    })

    const url = res?.data?.authorization_url
    if (!url) throw new Error('Payment link not returned')

    window.open(url, '_blank')
    fundModalVisible.value = false
    fundingAmount.value = null
  } catch (e: any) {
    message.error(e?.data?.message || 'Unable to initialize payment')
  } finally {
    loading.value = false
  }
}

/* ---------------- HELPERS ---------------- */
const getRowClassName = (record: any) =>
  record?.type === 'credit' ? 'credit-row' : 'debit-row'

const resetFilters = () => {
  searchText.value = ''
  monthFilter.value = null
  yearFilter.value = null
  pagination.value.current = 1
  fetchTransactions()
}

const handleTableChange = (p: any) => {
  pagination.value.current = p.current
  pagination.value.pageSize = p.pageSize
  fetchTransactions()
}

/* ---------------- WATCHERS ---------------- */
watch(searchText, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.current = 1
    fetchTransactions()
  }, 500)
})

watch([monthFilter, yearFilter], () => {
  pagination.value.current = 1
  fetchTransactions()
})

/* ---------------- INIT ---------------- */
onMounted(async () => {
  await Promise.all([fetchWallet(), fetchTransactions()])
})
</script>

<template>
  <div class="p-2 sm:p-4 lg:p-6 space-y-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 min-h-screen">

    <!-- ================= WALLET HEADER ================= -->
    <Card class="!shadow-none !border border-emerald-200/30">
      <div class="p-4 bg-emerald-600 rounded-2xl text-white">
        <div class="flex flex-col sm:flex-row justify-between gap-4">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-xl text-sm">
              <WalletOutlined />
              Wallet Balance
            </div>
            <div class="text-3xl font-black">{{ balanceText }}</div>
            <div class="flex items-center gap-2 text-sm font-semibold opacity-90">
              <span class="px-2 py-0.5 bg-white/20 rounded-md">{{ currency }}</span>
              <span class="flex items-center gap-1"><CheckCircleOutlined /> Available</span>
            </div>
          </div>
          <div class="flex gap-2 flex-col sm:flex-row">
            <Button
              type="primary"
              class="bg-white text-emerald-600 font-bold rounded-xl"
              @click="fundModalVisible = true"
            >
              <PlusCircleOutlined /> Fund Wallet
            </Button>
            <Button
              type="text"
              class="text-white font-semibold"
              @click="hideBalance = !hideBalance"
            >
              <component :is="hideBalance ? EyeOutlined : EyeInvisibleOutlined" />
              {{ hideBalance ? 'Show' : 'Hide' }}
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- ================= FUND MODAL ================= -->
    <Modal
      v-model:open="fundModalVisible"
      width="320"
      centered
      destroy-on-close
      :footer="null"
    >
      <div class="text-center font-bold text-emerald-600 mb-3">💰 Fund Wallet</div>
      <Form layout="vertical">
        <Form.Item label="Amount (₦)">
          <Input v-model:value.number="fundingAmount" type="number" placeholder="1000" />
        </Form.Item>
        <div class="text-right text-sm font-bold text-emerald-700 mb-3">
          {{ formatNaira(Number(fundingAmount || 0)) }}
        </div>
        <div class="flex gap-2">
          <Button block @click="fundModalVisible = false">Cancel</Button>
          <Button type="primary" block :loading="loading" @click="fundWallet">Fund Wallet</Button>
        </div>
      </Form>
    </Modal>

    <!-- ================= TRANSACTIONS ================= -->
    <Card class="!shadow-xl border border-emerald-200/30 rounded-2xl">
      <div class="p-4 space-y-4">
        <div>
          <h2 class="text-xl font-black text-emerald-700">Transaction History</h2>
          <p class="text-sm opacity-70">{{ pagination.total.toLocaleString() }} transactions</p>
        </div>

        <!-- ================= FILTERS ================= -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 bg-emerald-50 rounded-xl">
          <Input.Search v-model:value="searchText" placeholder="Search transactions" enter-button />
          <Dropdown trigger="click">
            <Button class="flex items-center gap-2"><FilterOutlined /> Filters</Button>
            <template #overlay>
              <div class="p-4 space-y-3 bg-white rounded-xl shadow-xl w-64">
                <Select v-model:value="monthFilter" allow-clear placeholder="Month">
                  <Select.Option v-for="m in 12" :key="m" :value="m">{{ dayjs().month(m - 1).format('MMMM') }}</Select.Option>
                </Select>
                <Select v-model:value="yearFilter" allow-clear placeholder="Year">
                  <Select.Option v-for="y in 6" :key="2025 - y" :value="String(2025 - y)">{{ 2025 - y }}</Select.Option>
                </Select>
                <div class="flex gap-2">
                  <Button block @click="resetFilters">Reset</Button>
                  <Button type="primary" block @click="fetchTransactions">Apply</Button>
                </div>
              </div>
            </template>
          </Dropdown>
          <Button type="primary" ghost @click="fetchTransactions"><ReloadOutlined /> Refresh</Button>
        </div>

        <!-- ================= TABLE ================= -->
        <div class="overflow-x-auto">
          <Table
            class="mobile-table"
            :data-source="transactions"
            :loading="loading"
            row-key="id"
            :pagination="pagination"
            @change="handleTableChange"
            :row-class-name="getRowClassName"
          >
            <Table.Column title="Type" width="100">
              <template #default="{ record }">
                <Tag :color="record.type === 'credit' ? 'success' : 'error'">{{ record.type.toUpperCase() }}</Tag>
              </template>
            </Table.Column>

            <Table.Column title="Description" dataIndex="description" />

            <Table.Column title="Balance Before" align="right">
              <template #default="{ record }">{{ formatNaira(Number(record.balance_before || 0)) }}</template>
            </Table.Column>

            <Table.Column title="Amount" align="right">
              <template #default="{ record }">
                <span :class="record.type === 'credit' ? 'text-emerald-600' : 'text-red-600'">
                  {{ record.type === 'credit' ? '+' : '-' }}{{ formatNaira(Number(record.amount || 0)) }}
                </span>
              </template>
            </Table.Column>

            <Table.Column title="Balance After" align="right">
              <template #default="{ record }">{{ formatNaira(Number(record.balance_after || 0)) }}</template>
            </Table.Column>

            <Table.Column title="Date" width="140">
              <template #default="{ record }">{{ dayjs(record.created_at).format('DD MMM • hh:mm A') }}</template>
            </Table.Column>
          </Table>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
/* Credit and debit row backgrounds */
.mobile-table :deep(.ant-table-tbody .credit-row) {
  background-color: rgba(236, 253, 245, 0.8) !important; /* light green */
}
.mobile-table :deep(.ant-table-tbody .debit-row) {
  background-color: rgba(254, 242, 242, 0.8) !important; /* light red */
}

/* Monospaced fonts for balances and amounts */
.font-mono {
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* Truncate text for long descriptions */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
