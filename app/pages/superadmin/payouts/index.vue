<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'Administrator Payouts'
})

import { ref, onMounted, watch } from 'vue'
import { Table, Button, Tag, Popconfirm, message, Typography, Input, Card, Dropdown, Modal } from 'ant-design-vue'
import { CheckOutlined, CloseOutlined, ReloadOutlined, FilterOutlined, MoreOutlined } from '@ant-design/icons-vue'

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
  pageSize: 50,
  total: 0,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} payout requests`
})

const fetchPayouts = async () => {
  loading.value = true
  try {
    const params = {
      search: searchText.value?.trim() || undefined,
      status: statusFilter.value || undefined,
      page: pagination.value.current,
      per_page: pagination.value.pageSize
    }
    const res = await $api('/admin/payout/request', { params })
    payouts.value = res.data?.data || []
    const meta = res.data || res || {}
    pagination.value.total = Number(meta.total || 0)
    pagination.value.current = Number(meta.current_page || 1)
    pagination.value.pageSize = Number(meta.per_page || 50)
  } catch (err) {
    console.error('Payouts error:', err)
    payouts.value = []
  } finally {
    loading.value = false
  }
}

const approvePayout = async (id: string) => {
  try {
    await $api(`/superadmin/payout/${id}/approve`, { method: 'POST' })
    message.success('Approved!')
    fetchPayouts()
  } catch (err) {
    message.error('Failed to approve')
  }
}

const openRejectModal = (id: string) => {
  currentRejectPayoutId.value = id
  rejectReason.value = ''
  rejectModalVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    message.error('Enter reason')
    return
  }
  try {
    await $api(`/admin/payout/${currentRejectPayoutId.value}/reject`, {
      method: 'POST',
      body: { reason: rejectReason.value }
    })
    message.success('Rejected!')
    rejectModalVisible.value = false
    fetchPayouts()
  } catch (err) {
    message.error('Failed to reject')
  }
}

const handleTableChange = (paginationConfig) => {
  pagination.value.current = paginationConfig.current
  pagination.value.pageSize = paginationConfig.pageSize
  fetchPayouts()
}

const resetFilters = () => {
  searchText.value = ''
  statusFilter.value = null
  pagination.value.current = 1
  fetchPayouts()
}

watch([searchText, statusFilter], () => {
  pagination.value.current = 1
  fetchPayouts()
})

onMounted(fetchPayouts)
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Simple Header -->
    <div class="flex justify-between items-center">
      <Typography.Title level="3" class="!m-0">Payout Requests</Typography.Title>
      <Typography.Text type="secondary">{{ pagination.total }} requests</Typography.Text>
      <Button type="primary" @click="fetchPayouts" :loading="loading" size="middle" icon="ReloadOutlined">
        Refresh
      </Button>
    </div>

    <!-- Simple Filters -->
    <Card>
      <div class="flex flex-wrap gap-4 items-end p-4">
        <Input.Search
          v-model:value="searchText"
          placeholder="Search admin name/email"
          size="middle"
          style="flex: 1; min-width: 250px"
        />
        <Dropdown trigger="click">
          <Button size="middle" icon="FilterOutlined">Status</Button>
          <template #overlay>
            <div class="p-3 w-56">
              <Button block @click="statusFilter = 'pending'" :type="statusFilter === 'pending' ? 'primary' : 'default'" class="mb-2">Pending</Button>
              <Button block @click="statusFilter = 'approved'" :type="statusFilter === 'approved' ? 'primary' : 'default'" class="mb-2">Approved</Button>
              <Button block @click="statusFilter = 'rejected'" :type="statusFilter === 'rejected' ? 'primary' : 'default'" class="mb-2">Rejected</Button>
              <Button block @click="statusFilter = null" :type="!statusFilter ? 'primary' : 'default'">All</Button>
              <Button block type="dashed" @click="resetFilters" class="mt-3">Reset</Button>
            </div>
          </template>
        </Dropdown>
      </div>

      <!-- ✅ COMPACT SMALL TABLE size="middle" -->
      <Table
        :columns="[
          { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' } },
          { title: 'Admin', key: 'admin', width: 200, slots: { customRender: 'adminCell' } },
          { title: 'Amount', key: 'amount', width: 120, align: 'right', slots: { customRender: 'amountCell' } },
          { title: 'Status', dataIndex: 'status', key: 'status', width: 100, slots: { customRender: 'statusCell' } },
          { title: 'Date', dataIndex: 'created_at', key: 'created_at', width: 140, slots: { customRender: 'dateCell' } },
          { title: 'Actions', key: 'actions', width: 100, align: 'center', slots: { customRender: 'actionsCell' } }
        ]"
        :data-source="payouts"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
        :scroll="{ x: 1000 }"
        size="middle"
        class="compact-table"
      >
        <template #indexCell="{ index }">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>
        
        <template #adminCell="{ record }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {{ record.administrator?.name?.charAt(0) || 'A' }}
            </div>
            <div class="truncate">
              <div class="font-medium text-sm">{{ record.administrator?.name || 'N/A' }}</div>
              <div class="text-xs text-gray-500">{{ record.administrator?.email }}</div>
            </div>
          </div>
        </template>
        
        <template #amountCell="{ record }">
          <div class="text-right">
            <div class="font-bold text-lg text-emerald-600">₦{{ Number(record.amount).toLocaleString() }}</div>
            <div class="text-xs text-gray-500">Bal: ₦{{ Number(record.balance_snapshot || 0).toLocaleString() }}</div>
          </div>
        </template>
        
        <template #statusCell="{ record }">
          <Tag 
            :color="record.status === 'pending' ? 'orange' : record.status === 'approved' ? 'green' : 'red'"
            class="font-medium px-3 py-1 text-xs"
          >
            {{ record.status }}
          </Tag>
        </template>
        
        <template #dateCell="{ record }">
          <div class="text-sm">
            {{ new Date(record.created_at).toLocaleDateString() }}
            <div class="text-xs text-gray-500">{{ new Date(record.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</div>
          </div>
        </template>
        
        <template #actionsCell="{ record }">
          <Dropdown trigger="click">
            <Button type="text" size="small" class="p-1">
              <MoreOutlined />
            </Button>
            <template #overlay>
              <div class="p-2 min-w-[140px]">
                <div v-if="record.status === 'pending'" class="space-y-1">
                  <Popconfirm title="Approve?" @confirm="approvePayout(record.id)">
                    <Button block type="primary" size="small" class="mb-1">Approve</Button>
                  </Popconfirm>
                  <Button block danger size="small" @click="openRejectModal(record.id)">Reject</Button>
                </div>
                <div v-else-if="record.status === 'approved'" class="text-center py-2 text-green-600 font-medium">Approved</div>
                <div v-else class="text-center py-2 text-red-600 font-medium">Rejected</div>
              </div>
            </template>
          </Dropdown>
        </template>
      </Table>
    </Card>

    <!-- Simple Reject Modal -->
    <Modal v-model:visible="rejectModalVisible" title="Reject Reason" @ok="handleReject" ok-button-props="{ disabled: !rejectReason.trim() }">
      <Input.TextArea v-model:value="rejectReason" :rows="3" placeholder="Enter rejection reason..." />
    </Modal>
  </div>
</template>

<style scoped>
.compact-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4 text-xs;
}

.compact-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4;
}

.compact-table :deep(.ant-table) {
  @apply border border-gray-200;
}
</style>
