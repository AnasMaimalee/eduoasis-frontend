<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'Administrator Payouts'
})

import { ref, onMounted, watch } from 'vue'
import { Table, Button, Tag, Popconfirm, message, Input, Card, Dropdown, Modal } from 'ant-design-vue'
import { ReloadOutlined, FilterOutlined, MoreOutlined } from '@ant-design/icons-vue'

const { $api } = useNuxtApp()

const payouts = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const statusFilter = ref<string | null>(null)

const rejectModalVisible = ref(false)
const currentRejectPayoutId = ref<string | null>(null)
const rejectReason = ref('')

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

const openRejectModal = (id: string) => {
  currentRejectPayoutId.value = id
  rejectReason.value = ''
  rejectModalVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) return message.error('Enter reason')
  try {
    await $api(`/admin/payout/${currentRejectPayoutId.value}/reject`, {
      method: 'POST',
      body: { reason: rejectReason.value }
    })
    message.success('Rejected')
    rejectModalVisible.value = false
    fetchPayouts()
  } catch {
    message.error('Rejection failed')
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

onMounted(fetchPayouts)
</script>

<template>
<div class="p-4 sm:p-6 space-y-6 bg-emerald-50">

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
  <Card class="!border-0 !shadow-lg rounded-xl">
    <div class="overflow-x-auto">
      <Table
        :columns="[
          { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' } },
          { title: 'Admin', key: 'admin', width: 220, slots: { customRender: 'adminCell' } },
          { title: 'Amount', key: 'amount', width: 140, align: 'right', slots: { customRender: 'amountCell' } },
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
        :scroll="{ x: 900 }"
        class="compact-table"
      >

        <template #indexCell="{ index }">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>

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

        <template #amountCell="{ record }">
          <div class="text-right">
            <div class="font-semibold text-emerald-600 text-sm">
              ₦{{ Number(record.amount).toLocaleString() }}
            </div>
            <div class="text-xs text-gray-500">
              Bal ₦{{ Number(record.balance_snapshot || 0).toLocaleString() }}
            </div>
          </div>
        </template>

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

        <template #dateCell="{ record }">
          <div class="text-xs">
            {{ new Date(record.created_at).toLocaleDateString() }}
          </div>
        </template>

        <template #actionsCell="{ record }">
          <Dropdown trigger="click">
            <Button type="text" size="small">
              <MoreOutlined />
            </Button>
            <template #overlay>
              <div class="p-2 space-y-1 min-w-[120px]">
                <template v-if="record.status === 'pending'">
                  <Popconfirm title="Approve?" @confirm="approvePayout(record.id)">
                    <Button block size="small" type="primary">Approve</Button>
                  </Popconfirm>
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

  <!-- Reject Modal -->
  <Modal v-model:visible="rejectModalVisible" title="Reject Reason" @ok="handleReject">
    <Input.TextArea v-model:value="rejectReason" rows="3" placeholder="Enter rejection reason..." />
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
