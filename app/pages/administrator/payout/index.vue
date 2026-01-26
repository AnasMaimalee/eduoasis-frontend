<template>
  <div class="p-2 lg:p-4 space-y-2 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50/50 min-h-screen bg-emerald-50">

    <!-- HEADER -->
    <a-card class="!shadow-2xl !border-2 border-emerald-200/50">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="space-y-2">
          <div class="!m-0">💰 Payout Management</div>
          <div class="text-gray-600">Available Balance</div>
          <div class="text-3xl font-black text-emerald-600">
            ₦{{ availableBalance.toLocaleString() }}
          </div>
        </div>

        <a-button type="primary" size="large" @click="showPayoutModal = true">
          Request Payout
        </a-button>
      </div>
    </a-card>

    <!-- PAYOUT TABLE -->
    <a-table
      row-key="id"
      class="custom-table"
      :columns="payoutColumns"
      :data-source="payoutRequests"
      :loading="loading"
      :scroll="{ x: 1400, y: 500 }" 
      :pagination="{ pageSize: 10 }"
    >
      <!-- TABLE TITLE -->
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl">
          <div class="font-bold text-gray-800">
            📄 Payout Transactions
          </div>

          <div class="flex gap-4 text-sm">
            <span class="text-gray-600">
              Total:
              <b class="text-gray-900">{{ payoutRequests.length }}</b>
            </span>

            <span class="text-orange-600">
              Pending:
              <b>{{ payoutRequests.filter(p => p.status === 'pending').length }}</b>
            </span>

            <span class="text-emerald-600">
              Approved:
              <b>{{ payoutRequests.filter(p => p.status === 'approved').length }}</b>
            </span>
          </div>
        </div>
      </template>
    </a-table>



    <!-- PAYOUT MODAL -->
    <a-modal
      v-model:open="showPayoutModal"
      title="Request Payout"
      width="360"
      :footer="null"
      centered
    >
      <div class="space-y-2">
        <div>
          <div class="text-sm text-gray-500 mb-1">Amount</div>
          <a-input
            v-model:value="payoutAmount"
            size="large"
            inputmode="numeric"
            placeholder="₦ 1,000"
            class="!w-full !h-20 text-3xl font-black rounded-xl border-2 border-emerald-300 shadow-lg"
            @input="payoutAmount = payoutAmount.replace(/[^0-9]/g, '')"
          />
        </div>

        <div class="text-sm text-gray-600">
          Available: <b>₦{{ availableBalance.toLocaleString() }}</b>
        </div>

        <a-button
          block
          type="primary"
          class="h-14 font-bold text-lg rounded-xl"
          :loading="requestingPayout"
          :disabled="!payoutAmount || Number(payoutAmount) < 1000 || Number(payoutAmount) > availableBalance"
          @click="requestPayout"
        >
          <template v-if="requestingPayout">
            Processing…
          </template>
          <template v-else>
            Withdraw ₦{{ Number(payoutAmount || 0).toLocaleString() }}
          </template>
        </a-button>
      </div>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { message } from 'ant-design-vue'
import { computed } from 'vue'
import type { TableColumnsType } from 'ant-design-vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['administrator'],
})

const totalRequests = computed(() => payoutRequests.value.length)

const pendingCount = computed(() =>
  payoutRequests.value.filter(p => p.status === 'pending').length
)

const approvedCount = computed(() =>
  payoutRequests.value.filter(p => p.status === 'approved').length
)

const { $api } = useNuxtApp()

const loading = ref(false)
const requestingPayout = ref(false)
const showPayoutModal = ref(false)
const payoutAmount = ref('')
const availableBalance = ref(0)
const payoutRequests = ref<any[]>([])

import { Tag } from 'ant-design-vue'  // make sure Tag is imported

const payoutColumns: TableColumnsType = [
  { title: '#', width: 60, customRender: ({ index }: any) => index + 1 },
  { title: 'Request ID', dataIndex: 'id', customRender: ({ text }: any) => `#${text.slice(-8)}` },
  { title: 'Amount', dataIndex: 'amount', customRender: ({ text }: any) => `₦${Number(text).toLocaleString()}` },
  {
    title: 'Status',
    dataIndex: 'status',
    customRender: ({ text }: any) => {
      const colorMap: Record<string, string> = {
        approved: 'green',
        pending: 'orange',
        rejected: 'red',
      }

      return h(Tag, { color: colorMap[text] || 'blue' }, () => text.toUpperCase())
    },
  },
  { title: 'Balance Snapshot', dataIndex: 'balance_snapshot', customRender: ({ text }: any) => `₦${Number(text).toLocaleString()}` },
  { title: 'Requested', dataIndex: 'created_at', customRender: ({ text }: any) => new Date(text).toLocaleString() },
]


const fetchPayoutRequests = async () => {
  loading.value = true
  try {
    const res = await $api('/admin/payout/my-request')
    payoutRequests.value = res.data.data
  } finally {
    loading.value = false
  }
}

const requestPayout = async () => {
  requestingPayout.value = true
  try {
    // ✅ CORRECT SYNTAX - Use method: 'POST' with $api
    await $api('/admin/payout/request', { 
      method: 'POST',
      body: { amount: Number(payoutAmount.value) }
    })
    
    showPayoutModal.value = false
    payoutAmount.value = ''
    fetchWallet()
    fetchPayoutRequests()
    message.success('Payout requested successfully!')
  } catch (err: any) {
    message.error(err.data?.message || 'Payout request failed')
  } finally {
    requestingPayout.value = false
  }
}


const fetchWallet = async () => {
  try {
    const res = await $api('/wallet/me')
    const wallet = res
    availableBalance.value = Number(wallet.balance)
  } catch (e) {
    console.error('Failed to fetch wallet', e)
  }
}

onMounted(() => {
  fetchWallet()
  fetchPayoutRequests()
})
</script>

<style scoped>
/* REMOVE TABLE RADIUS */
.custom-table :deep(.ant-table-container),
.custom-table :deep(.ant-table),
.custom-table :deep(.ant-table-content) {
  border-radius: 0 !important;
}

/* HEADER */
.custom-table :deep(.ant-table-thead) {
  background: linear-gradient(90deg, #10b981, #10b981);
}

.custom-table :deep(.ant-table-thead > tr > th) {
  background: transparent !important;
  color: #ffffff !important;
  font-weight: 700;
  border: none !important;
}

/* BODY */
.custom-table :deep(.ant-table-tbody > tr > td) {
  padding: 14px 16px;
  border-top: 1px solid #ecfeff;
}

.custom-table :deep(.ant-table-tbody > tr:hover > td) {
  background: linear-gradient(90deg, #ecfeff, #f0fdfa);
}
</style>
