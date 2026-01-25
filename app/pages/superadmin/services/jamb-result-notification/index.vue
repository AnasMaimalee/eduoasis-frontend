<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'JAMB Result Notification'
})

import { ref, onMounted, computed, onUnmounted } from 'vue'
import {
  Table,
  Button,
  Tag,
  message,
  Card,
  Modal,
  Input,
} from 'ant-design-vue'
import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'

import { useFileDownloader } from '@/composables/useFileDownloader'
const { downloadingId, downloadFile } = useFileDownloader()

const { $api } = useNuxtApp()

/* ================= STATE ================= */
const requests = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')

/* Approve modal */
const approveModalVisible = ref(false)
const currentApproveRecord = ref<any | null>(null)
const approveLoading = ref(false)

/* Reject modal */
const rejectModalVisible = ref(false)
const currentRejectId = ref<string | null>(null)
const rejectReason = ref('')
const rejectLoading = ref(false)

/* Pagination */
const pagination = ref({
  current: 1,
  pageSize: 50,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) =>
    `${range[0]}-${range[1]} of ${total} requests`,
})

/* ================= FILTER ================= */
const filteredRequests = computed(() => {
  if (!searchText.value.trim()) return requests.value
  const q = searchText.value.toLowerCase()
  return requests.value.filter(r =>
    r.user?.name?.toLowerCase().includes(q) ||
    r.email?.toLowerCase().includes(q) ||
    r.service?.name?.toLowerCase().includes(q) ||
    r.registration_number?.toLowerCase().includes(q) ||
    r.status?.toLowerCase().includes(q)
  )
})

/* ================= API ================= */
const fetchRequests = async () => {
  loading.value = true
  try {
    const res = await $api('/services/jamb-admission-result-notification/all')
    requests.value = Array.isArray(res) ? res : res.data || []
    pagination.value.total = filteredRequests.value.length
  } catch {
    message.error('Failed to load requests')
  } finally {
    loading.value = false
  }
}

/* ================= APPROVE ================= */
const openApproveModal = (record: any) => {
  currentApproveRecord.value = record
  approveModalVisible.value = true
}

const handleApprove = async () => {
  if (!currentApproveRecord.value) return
  approveLoading.value = true
  try {
    await $api(`/services/jamb-admission-result-notification/${currentApproveRecord.value.id}/approve`, { method: 'POST' })
    message.success('Request approved successfully')
    approveModalVisible.value = false
    currentApproveRecord.value = null
    fetchRequests()
  } catch (err: any) {
    message.error(err.data?.message || 'Approval failed')
  } finally {
    approveLoading.value = false
  }
}

/* ================= REJECT ================= */
const openRejectModal = (id: string) => {
  currentRejectId.value = id
  rejectReason.value = ''
  rejectModalVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    message.error('Rejection reason is required')
    return
  }
  rejectLoading.value = true
  try {
    await $api(`/services/jamb-admission-result-notification/${currentRejectId.value}/reject`, {
      method: 'POST',
      body: { reason: rejectReason.value },
    })
    message.success('Request rejected successfully')
    rejectModalVisible.value = false
    currentRejectId.value = null
    rejectReason.value = ''
    fetchRequests()
  } catch (err: any) {
    message.error(err.data?.message || 'Rejection failed')
  } finally {
    rejectLoading.value = false
  }
}

/* ================= TABLE ================= */
const columns = [
  { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' } },
  { title: 'Customer', key: 'user', width: 240, slots: { customRender: 'userCell' } },
  { title: 'Service', key: 'service', width: 260, slots: { customRender: 'serviceCell' } },
  { title: 'Pricing', key: 'pricing', width: 180, align: 'right', slots: { customRender: 'pricingCell' } },
  { title: 'Status', dataIndex: 'status', width: 120, slots: { customRender: 'statusCell' } },
  { title: 'Paid?', dataIndex: 'is_paid', width: 90, slots: { customRender: 'isPaidCell' } },
  { title: 'Taken By', key: 'taken', width: 180, slots: { customRender: 'takenCell' } },
  { title: 'Result File', key: 'file', width: 140, slots: { customRender: 'fileCell' } },
  { title: 'Date', dataIndex: 'created_at', width: 170, slots: { customRender: 'dateCell' } },
  { title: 'Actions', key: 'actions', width: 200, align: 'center', slots: { customRender: 'actionsCell' } },
]

onMounted(fetchRequests)
let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshInterval = setInterval(fetchRequests, 30_000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <div class="p-4 bg-emerald-50">
    <div class="font-bold text-lg mb-5">
          JAMB Admission Result Notification Requests
          <div class="text-xs text-gray-500">{{ filteredRequests.length }} total</div>
        </div>
    <Card class="rounded-t-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
        

        <div class="flex items-center gap-2">
          <Input
            v-model:value="searchText"
            placeholder="Search..."
            size="small"
            class="!w-56"
          />
          <Button size="small" type="primary" :loading="loading" @click="fetchRequests"> Refresh
            <ReloadOutlined />
          </Button>
        </div>
      </div>

      <!-- TABLE -->
      <Table
        :columns="columns"
        :data-source="filteredRequests"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        size="small"
        :scroll="{ x: 1700, y: 500 }"
        class="notification-table"
      >
        <template #indexCell="{ index }">
          <span class="text-emerald-600 font-semibold text-xs">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </span>
        </template>

        <template #userCell="{ record }">
          <div class="text-xs">
            <div class="font-semibold">{{ record.user?.name }}</div>
            <div class="text-gray-500">{{ record.email }}</div>
          </div>
        </template>

        <template #serviceCell="{ record }">
          <div class="text-xs">
            <div class="font-semibold">{{ record.service?.name }}</div>
            <div class="text-gray-500">{{ record.registration_number }}</div>
          </div>
        </template>

        <template #pricingCell="{ record }">
          <div class="text-right text-xs">
            <div class="font-bold text-green-600">₦{{ Number(record.customer_price).toLocaleString() }}</div>
            <div class="text-gray-500">Admin: ₦{{ Number(record.admin_payout).toLocaleString() }}</div>
          </div>
        </template>
        
        <template #statusCell="{ record }">
          <Tag :color="record.status === 'approved' || record.status === 'completed' ? 'green' : record.status === 'pending' ? 'orange' : 'red'">
            {{ record.status.toUpperCase() }}
          </Tag>
        </template>

        <template #isPaidCell="{ record }">
          <Tag :color="record.is_paid ? 'green' : 'red'">
            {{ record.is_paid ? 'PAID' : 'UNPAID' }}
          </Tag>
        </template>
        <template #takenCell="{ record }">
          <div v-if="record.taken_by" class="text-xs">
            <div class="font-semibold">
              {{ record.taken_by.name }}
            </div>
            <div class="text-gray-500">
              {{ record.taken_by.email }}
            </div>
          </div>
          <span v-else class="text-xs text-gray-400">—</span>
        </template>

        <template #fileCell="{ record }">
          <Button
            v-if="record.result_file"
            type="primary"
            size="small"
            class="!text-xs"
            :loading="downloadingId === record.id"
            @click="downloadFile({ 
              id: record.id,
              url: `/services/jamb-admission-result-notification/${record.id}/download`,
              defaultFilename: 'jamb-admission-result-notification'
            })"
          >
            📥 Download
          </Button>
          <span v-else class="text-xs text-gray-400">No file</span>
        </template>

        <template #dateCell="{ record }">
          <span class="text-xs font-mono">{{ new Date(record.created_at).toLocaleString() }}</span>
        </template>

        <template #actionsCell="{ record }">
          <div class="flex justify-center gap-2">
            <template v-if="record.status === 'completed'">
              <Button size="small" type="primary" @click="openApproveModal(record)">
                Approve
                <CheckOutlined />
              </Button>
              <Button size="small" danger @click="openRejectModal(record.id)">
                Reject
                <CloseOutlined />
              </Button>
            </template>
            <CheckOutlined v-else-if="record.status === 'approved'" class="text-green-500" />
            <CloseOutlined v-else class="text-red-500" />
          </div>
        </template>
      </Table>
    </Card>

    <!-- APPROVE MODAL -->
    <Modal
      v-model:visible="approveModalVisible"
      title="Confirm Approval"
      ok-text="Approve"
      :ok-button-props="{ loading: approveLoading }"
      @ok="handleApprove"
    >
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span>Customer price</span>
          <strong>₦{{ Number(currentApproveRecord?.customer_price || 0).toLocaleString() }}</strong>
        </div>
        <div class="flex justify-between">
          <span>Admin payout</span>
          <strong>₦{{ Number(currentApproveRecord?.admin_payout || 0).toLocaleString() }}</strong>
        </div>
        <p class="text-xs text-red-500">This action cannot be undone.</p>
      </div>
    </Modal>

    <!-- REJECT MODAL -->
    <Modal
      v-model:visible="rejectModalVisible"
      title="Reject Request"
      ok-text="Reject"
      :ok-button-props="{ loading: rejectLoading }"
      @ok="handleReject"
    >
      <Input.TextArea
        v-model:value="rejectReason"
        rows="4"
        placeholder="Enter rejection reason (required)"
      />
    </Modal>
  </div>
</template>

<style scoped>
.notification-table :deep(.ant-table-thead th) {
  background: #10b981;
  color: white;
  font-size: 12px;
}

.notification-table :deep(.ant-table-tbody td) {
  font-size: 12px;
}

.font-mono {
  font-family: Monaco, Menlo, monospace;
}
</style>


<style scoped>
/* ✅ GREEN EMERALD HEADER */
.notification-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4 text-sm;
}

.notification-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4;
}

.notification-table :deep(.ant-table-row:hover > td) {
  @apply bg-emerald-50;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
