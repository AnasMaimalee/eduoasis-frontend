<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Table, Tag, Spin, Alert, Button, Input, Space, Card 
} from 'ant-design-vue'
import { ArrowLeftOutlined, CreditCardOutlined, HistoryOutlined } from '@ant-design/icons-vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'User Info Page'
})

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()

const transactions = ref([])
const loginAudits = ref([])
const currentBalance = ref('')
const transactionsLoading = ref(false)
const auditsLoading = ref(false)
const error = ref('')
const searchTransactions = ref('')
const searchAudits = ref('')

const userId = route.params.id as string

const paginationTransactions = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`
})

const paginationAudits = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} audits`
})

/* ================= ROW STYLING - WALLET STYLE ================= */
const getTransactionRowClass = (record: any) => {
  if (!record || !record.type) return ''
  return record.type === 'credit' ? 'credit-row' : 'debit-row'
}

const filteredTransactions = computed(() => {
  if (!searchTransactions.value.trim()) return transactions.value
  return transactions.value.filter(tx =>
    tx.description?.toLowerCase().includes(searchTransactions.value.toLowerCase()) ||
    tx.type?.toLowerCase().includes(searchTransactions.value.toLowerCase()) ||
    tx.reference?.toLowerCase().includes(searchTransactions.value.toLowerCase())
  )
})

const filteredAudits = computed(() => {
  if (!searchAudits.value.trim()) return loginAudits.value
  return loginAudits.value.filter(audit =>
    audit.user_agent?.toLowerCase().includes(searchAudits.value.toLowerCase()) ||
    audit.ip_address?.toLowerCase().includes(searchAudits.value.toLowerCase()) ||
    audit.user?.name?.toLowerCase().includes(searchAudits.value.toLowerCase())
  )
})

const transactionColumns = [
  { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' } },
  { title: 'Type', dataIndex: 'type', key: 'type', width: 120, slots: { customRender: 'typeCell' } },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 160, slots: { customRender: 'amountCell' } },
  { title: 'Balance Before', dataIndex: 'balance_before', key: 'balance_before', width: 150, slots: { customRender: 'balanceBeforeCell' } },
  { title: 'Balance After', dataIndex: 'balance_after', key: 'balance_after', width: 150, slots: { customRender: 'balanceAfterCell' } },
  { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, width: 300, slots: { customRender: 'descriptionCell' } },
  { title: 'Reference', dataIndex: 'reference', key: 'reference', width: 180, ellipsis: true },
  { title: 'Date', dataIndex: 'created_at', key: 'created_at', width: 180, slots: { customRender: 'dateCell' } }
]

const auditColumns = [
  { title: '#', key: 'index', width: 60, slots: { customRender: 'auditIndexCell' } },
  { title: 'Status', dataIndex: 'success', key: 'success', width: 100, slots: { customRender: 'statusCell' } },
  { title: 'IP Address', dataIndex: 'ip_address', key: 'ip_address', width: 140 },
  { title: 'User Agent', dataIndex: 'user_agent', key: 'user_agent', ellipsis: true, width: 300 },
  { title: 'Location', dataIndex: 'location', key: 'location', width: 150 },
  { title: 'User', dataIndex: 'user', key: 'user', width: 150, slots: { customRender: 'userCell' } },
  { title: 'Date', dataIndex: 'created_at', key: 'created_at', width: 180, slots: { customRender: 'auditDateCell' } }
]

const fetchTransactions = async () => {
  transactionsLoading.value = true
  try {
    const res = await $api(`/users/${userId}/transactions`)
    transactions.value = res?.data?.transactions?.data || res?.data || []
    currentBalance.value = res?.data?.current_balance || '₦0.00'
    paginationTransactions.value.total = res?.data?.transactions?.total || res?.data?.total || transactions.value.length
  } catch (err: any) {
    error.value = err?.message || 'Failed to fetch transactions'
  } finally {
    transactionsLoading.value = false
  }
}

const fetchLoginAudits = async () => {
  auditsLoading.value = true
  try {
    const res = await $api(`/login-audits/user/${userId}`)
    loginAudits.value = res?.data?.data || res?.data || []
    paginationAudits.value.total = res?.data?.total || loginAudits.value.length
  } catch (err: any) {
    error.value = err?.message || 'Failed to fetch login audits'
  } finally {
    auditsLoading.value = false
  }
}

const formatCurrency = (value: number | string) => {
  if (!value) return '₦0.00';
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(value));
}

const handleTransactionChange = (paginationConfig) => {
  Object.assign(paginationTransactions.value, paginationConfig)
}

const handleAuditChange = (paginationConfig) => {
  Object.assign(paginationAudits.value, paginationConfig)
}

onMounted(() => {
  fetchTransactions()
  fetchLoginAudits()
})
</script>

<template>
<div class="p-4 sm:p-6 space-y-6 bg-emerald-50">

  <!-- Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <Button type="text" @click="router.back()" class="p-0 h-auto flex items-center">
        <ArrowLeftOutlined class="text-sm" />
      </Button>
      <div class="flex flex-col">
        <h2 class="text-sm font-bold text-gray-800">User Activity Dashboard</h2>
        <span class="text-gray-600 text-sm">Wallet transactions & login history</span>
      </div>
    </div>
  </div>

  <!-- Current Balance Card -->
  <Alert 
    v-if="currentBalance && !transactionsLoading" 
    type="success" 
    :show-icon="true" 
    class="!shadow-lg rounded-xl mb-4"
  >
    <template #message>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span class="block text-lg font-semibold">Current Wallet Balance</span>
          <span class="block text-green-700 text-sm">Updated {{ new Date().toLocaleDateString() }}</span>
        </div>
        <div class="flex items-center gap-2 text-green-600 text-2xl font-bold">
          <span class="text-3xl font-extrabold">{{ formatCurrency(currentBalance) }}</span>
          <CreditCardOutlined class="text-green-500 text-2xl" />
        </div>
      </div>
    </template>
  </Alert>

  <!-- Error Alert -->
  <Alert v-if="error" type="error" :show-icon="true" class="mb-4 shadow-lg" dismissible>
    {{ error }}
  </Alert>

  <!-- Transactions Section -->
  <Card class="!shadow-lg !border-0 hover:shadow-xl transition-all duration-200 rounded-t-lg overflow-x-auto">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
      <Space size={12}>
        <CreditCardOutlined class="text-2xl text-blue-600" />
        <span class="text-lg font-bold text-gray-800">Wallet Transactions</span>
      </Space>
      <Input.Search
        v-model:value="searchTransactions"
        placeholder="Search transactions, descriptions..."
        allow-clear
        size="middle"
        class="w-full sm:w-80"
      />
    </div>
    <div class="min-w-[900px]">
      <Table
        :columns="transactionColumns"
        :data-source="filteredTransactions"
        :loading="transactionsLoading"
        :pagination="paginationTransactions"
        @change="handleTransactionChange"
        row-key="id"
        class="antdv-table-custom"
        :scroll="{ x: 'max-content' }"
        :row-class-name="getTransactionRowClass" 
      >
        <template #indexCell="{ index }">
          {{ (paginationTransactions.current - 1) * paginationTransactions.pageSize + index + 1 }}
        </template>
        <template #typeCell="{ record }">
          <Tag :color="record.type === 'credit' ? 'green' : 'red'" class="!font-bold !px-3 !py-1 !text-sm shadow-sm">
            {{ record.type?.toUpperCase() || 'N/A' }}
          </Tag>
        </template>
        <template #amountCell="{ record }">
          <div class="flex items-center font-bold text-lg">
            <span :class="record.type === 'credit' ? 'text-green-500' : 'text-red-500'" class="mr-1 text-2xl font-black">
              {{ record.type === 'credit' ? '+' : '−' }}
            </span>
            ₦{{ Number(record.amount || 0).toLocaleString() }}
          </div>
        </template>
        <template #balanceBeforeCell="{ record }">
          <div class="font-mono text-sm bg-gray-50 px-2 py-1 rounded-full">
            ₦{{ Number(record.balance_before || 0).toLocaleString() }}
          </div>
        </template>
        <template #balanceAfterCell="{ record }">
          <div class="font-mono text-sm bg-blue-50 px-2 py-1 rounded-full font-semibold">
            ₦{{ Number(record.balance_after || 0).toLocaleString() }}
          </div>
        </template>
        <template #descriptionCell="{ record }">
          <div class="max-w-[280px]">
            <div class="font-medium text-gray-900 truncate" :title="record.description">
              {{ record.description || 'No description' }}
            </div>
            <div v-if="record.reference" class="text-xs text-gray-500 font-mono mt-1">
              Ref: {{ record.reference }}
            </div>
          </div>
        </template>
        <template #dateCell="{ record }">
          <div class="font-mono text-sm">
            {{ new Date(record.created_at).toLocaleString('en-US', { 
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }) }}
          </div>
        </template>
      </Table>
    </div>
  </Card>

  <!-- Login Audits Section -->
  <Card class="!shadow-lg !border-0 hover:shadow-xl transition-all duration-200 rounded-t-lg overflow-x-auto">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
      <Space size={12}>
        <HistoryOutlined class="text-2xl text-purple-600" />
        <span class="text-lg font-bold text-gray-800">Login Audits</span>
      </Space>
      <Input.Search
        v-model:value="searchAudits"
        placeholder="Search IP, user agent, location..."
        allow-clear
        size="middle"
        class="w-full sm:w-80"
      />
    </div>
    <div class="min-w-[900px]">
      <Table
        :columns="auditColumns"
        :data-source="filteredAudits"
        :loading="auditsLoading"
        :pagination="paginationAudits"
        @change="handleAuditChange"
        row-key="id"
        class="antdv-table-custom"
        :scroll="{ x: 'max-content' }"
      >
        <template #auditIndexCell="{ index }">
          {{ (paginationAudits.current - 1) * paginationAudits.pageSize + index + 1 }}
        </template>
        <template #statusCell="{ record }">
          <Tag :color="record.success ? 'green' : 'red'" class="!font-bold !px-3 !py-1 !text-sm shadow-sm">
            {{ record.success ? 'Success' : 'Failed' }}
          </Tag>
        </template>
        <template #userCell="{ record }">
          <div class="font-medium text-gray-900">{{ record.user?.name || 'N/A' }}</div>
          <div class="text-xs text-gray-500 truncate">{{ record.user?.email || '' }}</div>
        </template>
        <template #auditDateCell="{ record }">
          <div class="font-mono text-sm">
            {{ new Date(record.created_at).toLocaleString('en-US', { 
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }) }}
          </div>
        </template>
      </Table>
    </div>
  </Card>

</div>
</template>

<style scoped>
.antdv-table-custom :deep(.ant-table-thead) th {
  @apply bg-gradient-to-r from-gray-50 to-gray-100 font-semibold border-b-2 border-gray-200 backdrop-blur-sm;
}
.antdv-table-custom :deep(.ant-table-tbody) td {
  @apply border-b border-gray-100 py-3 px-2;
}
.antdv-table-custom :deep(.ant-table-row:hover > td) {
  @apply bg-blue-50/70 backdrop-blur-sm;
}
.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* WALLET-STYLE ROW HIGHLIGHTING */
:deep(.credit-row) {
  @apply bg-green-50/90 border-l-4 border-green-400 shadow-sm;
}
:deep(.credit-row:hover) {
  @apply bg-green-100/90 border-l-4 border-green-500 shadow-md;
}
:deep(.debit-row) {
  @apply bg-red-50/90 border-l-4 border-red-400 shadow-sm;
}
:deep(.debit-row:hover) {
  @apply bg-red-100/90 border-l-4 border-red-500 shadow-md;
}

/* Rounded top edges for cards */
.card {
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}
</style>
