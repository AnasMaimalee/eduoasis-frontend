<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'Administrator Payouts'
})
import { CopyOutlined, CheckOutlined } from '@ant-design/icons-vue'
import { ref, onMounted, watch } from 'vue'
import { Table, Button, Tag, Popconfirm, message, Input, Card, Dropdown, Modal } from 'ant-design-vue'
import { ReloadOutlined, FilterOutlined, MoreOutlined } from '@ant-design/icons-vue'

const { $api } = useNuxtApp()

const payouts = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const statusFilter = ref<string | null>(null)

const approveModalVisible = ref(false)
const currentApprovePayout = ref<any>(null)
const approveLoading = ref(false)

const rejectModalVisible = ref(false)
const currentRejectPayoutId = ref<string | null>(null)
const rejectReason = ref('')

const openApproveModal = (record: any) => {
  currentApprovePayout.value = record
  approveModalVisible.value = true
}

const handleApproveConfirm = async () => {
  if (!currentApprovePayout.value) return

  approveLoading.value = true
  try {
    await $api(`/superadmin/payout/${currentApprovePayout.value.id}/approve`, {
      method: 'POST'
    })
    message.success('Payout approved successfully')
    approveModalVisible.value = false
    currentApprovePayout.value = null
    fetchPayouts()
  } catch {
    message.error('Approval failed')
  } finally {
    approveLoading.value = false
  }
}


const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} payouts`
})

const fetchPayouts = async () => {
  loading.value = true
  try {
    const params = {
      search: searchText.value || undefined,
      status: statusFilter.value || undefined,
      page: pagination.value.current,
      per_page: pagination.value.pageSize
    }
    const res = await $api('/admin/payout/request', { params })
    payouts.value = res.data?.data || []
    pagination.value.total = Number(res.data?.total || 0)
  } finally {
    loading.value = false
  }
}

const approvePayout = async (id: string) => {
  try {
    await $api(`/superadmin/payout/${id}/approve`, { method: 'POST' })
    message.success('Approved')
    fetchPayouts()
  } catch {
    message.error('Approval failed')
  }
}
const rejectLoading = ref(false)

const openRejectModal = (id: string) => {
  currentRejectPayoutId.value = id
  rejectReason.value = ''
  rejectModalVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    return message.error('Rejection reason is required')
  }

  rejectLoading.value = true
  try {
    await $api(`/admin/payout/${currentRejectPayoutId.value}/reject`, {
      method: 'POST',
      body: { reason: rejectReason.value }
    })
    message.success('Payout rejected')
    rejectModalVisible.value = false
    currentRejectPayoutId.value = null
    rejectReason.value = ''
    fetchPayouts()
  } catch {
    message.error('Rejection failed')
  } finally {
    rejectLoading.value = false
  }
}


const handleTableChange = (p: any) => {
  pagination.value.current = p.current
  pagination.value.pageSize = p.pageSize
  fetchPayouts()
}

watch([searchText, statusFilter], () => {
  pagination.value.current = 1
  fetchPayouts()
})

const copiedAccountId = ref<string | null>(null)

const copyAccountNumber = async (record: any) => {
  const acc = record.bank_account?.account_number
  if (!acc) return

  await navigator.clipboard.writeText(acc)

  copiedAccountId.value = record.id

  message.success({
    content: 'Account number copied',
    duration: 2,
    style: { marginTop: '20px' } // top-center feel
  })

  setTimeout(() => {
    copiedAccountId.value = null
  }, 2000)
}

onMounted(fetchPayouts)
</script>

<template>
<div class="p-4 sm:p-6 space-y-6 bg-emerald-50 ">

  <!-- Header -->
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <div class="text-xl font-bold text-gray-800">Payout Requests</div>
      <div class="text-sm text-gray-500">{{ pagination.total }} total requests</div>
    </div>
    <Button
      type="primary"
      size="middle"
      :loading="loading"
      @click="fetchPayouts"
    >
      <ReloadOutlined /> Refresh
    </Button>
  </div>

  <!-- Filters -->
  <Card class="!border-0 !shadow-md rounded-xl">
    <div class="flex flex-wrap gap-3 items-center">
      <Input.Search
        v-model:value="searchText"
        placeholder="Search admin name/email"
        allow-clear
        class="w-full sm:w-80"
      />
      <Dropdown trigger="click">
        <Button icon="FilterOutlined">Status</Button>
        <template #overlay>
          <div class="p-3 space-y-2 w-48">
            <Button block @click="statusFilter='pending'">Pending</Button>
            <Button block @click="statusFilter='approved'">Approved</Button>
            <Button block @click="statusFilter='rejected'">Rejected</Button>
            <Button block type="dashed" @click="statusFilter=null">All</Button>
          </div>
        </template>
      </Dropdown>
    </div>
  </Card>

  <!-- Table -->
  <!-- Table -->
<Card class="!border-0 !shadow-lg rounded-xl">
  <div class="overflow-x-auto">
    <Table
      :columns="[
        { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' } },
        { title: 'Admin', key: 'admin', width: 220, slots: { customRender: 'adminCell' } },
        { title: 'Bank Name', key: 'bankName', width: 180, slots: { customRender: 'bankNameCell' } },
        { title: 'Account Name', key: 'accountName', width: 180, slots: { customRender: 'accountNameCell' } },
        { title: 'Account Number', key: 'accountNumber', width: 140, slots: { customRender: 'accountNumberCell' } },
        { title: 'Amount', key: 'amount', width: 140, slots: { customRender: 'amountCell' } },
        { title: 'Status', dataIndex: 'status', width: 100, slots: { customRender: 'statusCell' } },
        { title: 'Date', dataIndex: 'created_at', width: 140, slots: { customRender: 'dateCell' } },
        { title: 'Actions', key: 'actions', width: 90, align: 'center', slots: { customRender: 'actionsCell' } }
      ]"
      :data-source="payouts"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      row-key="id"
      size="small"
      :scroll="{ x: 1200 }"
      class="compact-table"
    >

      <!-- Index -->
      <template #indexCell="{ index }">
        {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
      </template>

      <!-- Admin -->
      <template #adminCell="{ record }">
        <div class="flex gap-2 items-center">
          <div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {{ record.administrator?.name?.charAt(0) || 'A' }}
          </div>
          <div class="truncate">
            <div class="text-sm font-medium">{{ record.administrator?.name }}</div>
            <div class="text-xs text-gray-500">{{ record.administrator?.email }}</div>
          </div>
        </div>
      </template>

      <!-- Bank Name -->
      <template #bankNameCell="{ record }">
        <div class="text-sm text-gray-700">
          {{ record.bank_account?.bank_name || 'N/A' }}
        </div>
      </template>

      <!-- Account Name -->
      <template #accountNameCell="{ record }">
        <div class="text-sm text-gray-700">
          {{ record.bank_account?.account_name || 'N/A' }}
        </div>
      </template>

      <!-- Account Number -->
     <template #accountNumberCell="{ record }">
        <div class="flex items-center gap-2 text-sm text-gray-700 leading-none">
          <span class="leading-none">
            {{ record.bank_account?.account_number || 'N/A' }}
          </span>

          <Button
            v-if="record.bank_account?.account_number"
            type="text"
            size="small"
            class="!p-0 !h-auto flex items-center"
            @click="copyAccountNumber(record)"
          >
            <CheckOutlined
              v-if="copiedAccountId === record.id"
              class="text-emerald-600 text-sm"
            />
            <CopyOutlined
              v-else
              class="text-gray-400 hover:text-emerald-600 text-sm"
            />
          </Button>
        </div>
      </template>




      <!-- Amount -->
      <template #amountCell="{ record }">
        <div class="">
          <div class="font-semibold text-emerald-600 text-sm">
            ₦{{ Number(record.amount).toLocaleString() }}
          </div>
          <div class="text-xs text-gray-500">
            Bal ₦{{ Number(record.balance_snapshot || 0).toLocaleString() }}
          </div>
        </div>
      </template>

      <!-- Status -->
      <template #statusCell="{ record }">
        <Tag
          :color="
            record.status === 'pending'
              ? 'orange'
              : record.status === 'approved'
              ? 'green'
              : record.status === 'paid'
              ? 'green'
              : 'red'
          "
          class="text-xs font-semibold px-2 py-0.5"
        >
          {{ record.status }}
        </Tag>
      </template>

      <!-- Date -->
      <template #dateCell="{ record }">
        <div class="text-xs">
          {{ new Date(record.created_at).toLocaleDateString() }}
        </div>
      </template>

      <!-- Actions -->
      <template #actionsCell="{ record }">
        <Dropdown trigger="click">
          <Button type="text" size="small">
            <MoreOutlined />
          </Button>
          <template #overlay>
            <div class="p-2 space-y-1 min-w-[120px]">
              <template v-if="record.status === 'pending'">
                <Button block size="small" type="primary" @click="openApproveModal(record)">Approve</Button>
                <Button block size="small" danger @click="openRejectModal(record.id)">Reject</Button>
              </template>
              <div v-else class="text-center text-xs font-medium text-gray-500 py-2">
                {{ record.status }}
              </div>
            </div>
          </template>
        </Dropdown>
      </template>

    </Table>
  </div>
</Card>


 <Modal
  v-model:visible="rejectModalVisible"
  :footer="null"
  centered
  width="400"
>
  <div class="space-y-4 text-center">
    <!-- Icon -->
    <div class="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
      <span class="text-2xl">⚠️</span>
    </div>

    <!-- Title -->
    <div class="text-lg font-semibold text-gray-800">
      Reject Payout Request
    </div>

    <!-- Warning -->
    <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
      This action will <b>permanently reject</b> this payout request.
      The administrator will be notified and must submit a new request.
    </div>

    <!-- Reason -->
    <div class="text-left space-y-1">
      <label class="text-xs font-medium text-gray-600">
        Rejection Reason <span class="text-red-500">*</span>
      </label>
      <Input.TextArea
        v-model:value="rejectReason"
        rows="4"
        placeholder="Clearly explain why this payout is being rejected..."
      />
    </div>

    <!-- Actions -->
    <div class="flex gap-2 pt-2">
      <Button
        block
        @click="rejectModalVisible = false"
        :disabled="rejectLoading"
      >
        Cancel
      </Button>
      <Button
        block
        danger
        :loading="rejectLoading"
        @click="handleReject"
      >
        Reject Payout
      </Button>
    </div>
  </div>
</Modal>

<Modal
  v-model:visible="approveModalVisible"
  :footer="null"
  centered
  width="380"
>
  <div class="space-y-4 text-center">
    <!-- Icon -->
    <div class="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
      <span class="text-2xl">💸</span>
    </div>

    <!-- Title -->
    <div class="text-lg font-semibold text-gray-800">
      Approve Payout
    </div>

    <!-- Admin Info -->
    <div class="text-sm text-gray-500">
      You are about to approve a payout for
    </div>

    <div class="font-medium">
      {{ currentApprovePayout?.administrator?.name }}
    </div>

    <!-- Amount -->
    <div class="bg-emerald-50 rounded-lg p-3">
      <div class="text-xs text-gray-500">Amount</div>
      <div class="text-2xl font-bold text-emerald-600">
        ₦{{ Number(currentApprovePayout?.amount || 0).toLocaleString() }}
      </div>
    </div>

    <!-- Warning -->
    <div class="text-xs text-gray-500">
      This will mark the payout as <b>PAID</b>.<br />
      Ensure payment is sent manually.
    </div>

    <!-- Actions -->
    <div class="flex gap-2 pt-2">
      <Button
        block
        @click="approveModalVisible = false"
        :disabled="approveLoading"
      >
        Cancel
      </Button>
      <Button
        block
        type="primary"
        :loading="approveLoading"
        @click="handleApproveConfirm"
      >
        Confirm Approval
      </Button>
    </div>
  </div>
</Modal>

</div>
</template>

<style scoped>
.compact-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-2 !px-3 text-xs;
}

.compact-table :deep(.ant-table-tbody td) {
  @apply !py-2 !px-3 text-xs;
}
</style>
