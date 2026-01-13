<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
})

import { ref, onMounted, computed } from 'vue'
import {
  Table,
  Button,
  Tag,
  message,
  Typography,
  Card,
  Modal,
  Input,
} from 'ant-design-vue'
import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue'

const { $api } = useNuxtApp()
const config = useRuntimeConfig()

/* ================= STATE ================= */
const requests = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')  // ✅ COMPACT SEARCH

/* Approve modal */
const approveModalVisible = ref(false)
const currentApproveId = ref<string | null>(null)
const approveLoading = ref(false)

/* Reject modal */
const rejectModalVisible = ref(false)
const currentRejectId = ref<string | null>(null)
const rejectReason = ref('')
const rejectLoading = ref(false)

/* Pagination */
const pagination = ref({
  current: 1,
  pageSize: 1000,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) =>
    `${range[0]}-${range[1]} of ${total} requests`,
})

/* ================= CLIENT-SIDE FILTERED DATA ✅ */
const filteredRequests = computed(() => {
  if (!searchText.value.trim()) return requests.value
  
  const query = searchText.value.toLowerCase()
  return requests.value.filter(request => 
    request.user?.name?.toLowerCase().includes(query) ||
    request.email?.toLowerCase().includes(query) ||
    request.service?.name?.toLowerCase().includes(query) ||
    request.registration_number?.toLowerCase().includes(query) ||
    request.status?.toLowerCase().includes(query)
  )
})

/* ================= API ================= */
const fetchRequests = async () => {
  loading.value = true
  try {
    const res = await $api('/services/jamb-result/all')
    requests.value = Array.isArray(res) ? res : res.data || []
    pagination.value.total = filteredRequests.value.length
  } catch (err) {
    message.error('Failed to load requests')
  } finally {
    loading.value = false
  }
}

/* ================= APPROVE MODAL ================= */
const openApproveModal = (id: string) => {
  currentApproveId.value = id
  approveModalVisible.value = true
}

const handleApprove = async () => {
  if (!currentApproveId.value) return

  approveLoading.value = true

  try {
    await $api(`/services/jamb-result/${currentApproveId.value}/approve`, { 
      method: 'POST' 
    })
    message.success('Request approved successfully')
    approveModalVisible.value = false
    currentApproveId.value = null
    fetchRequests()
  } catch (err: any) {
    message.error(err.data?.message || 'Approval failed')
  } finally {
    approveLoading.value = false
  }
}

/* ================= REJECT MODAL ================= */
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
    await $api(`/services/jamb-result/${currentRejectId.value}/reject`, {
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

const downloadFile = async (filePath: string, filename = 'document') => {
  if (!filePath) {
    message.warning('No result file available')
    return
  }

  try {
    // ✅ USE $api - Laravel API Route
    const response = await $api(`/download-storage/${filePath}`, {
      method: 'GET',
      responseType: 'blob', // ✅ IMPORTANT for files
    })

    const contentType = response.headers?.['content-type'] || ''
    const blob = new Blob([response], { type: contentType })
    
    // ✅ SMART FILENAME
    let downloadFilename = `${filename}-${Date.now()}`
    if (contentType.includes('pdf')) downloadFilename += '.pdf'
    else if (contentType.includes('image/')) {
      const ext = contentType.split('/')[1]?.split('+')[0] || 'png'
      downloadFilename += `.${ext}`
    } else {
      const ext = filePath.split('.').pop()
      downloadFilename += `.${ext || 'file'}`
    }

    // ✅ DOWNLOAD
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = downloadFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    message.success(`✅ ${downloadFilename} downloaded!`)
    
  } catch (error: any) {
    console.error('❌ Download error:', error)
    message.error(`❌ Download failed: ${error.message || 'Unknown error'}`)
  }
}

const columns = [
  { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' } },
  { title: 'Customer', key: 'user', width: 260, slots: { customRender: 'userCell' } },
  { title: 'Service', key: 'service', width: 280, slots: { customRender: 'serviceCell' } },
  { title: 'Pricing', key: 'pricing', width: 200, align: 'right', slots: { customRender: 'pricingCell' } },
  { title: 'Status', dataIndex: 'status', width: 120, slots: { customRender: 'statusCell' } },
  { title: 'Is Paid?', dataIndex: 'is_paid', width: 100, slots: { customRender: 'isPaidCell' } },
  { title: 'Taken By', key: 'taken', width: 180, slots: { customRender: 'takenCell' } },
  { title: 'Result File', key: 'file', width: 150, slots: { customRender: 'fileCell' } },
  { title: 'Date', dataIndex: 'created_at', width: 170, slots: { customRender: 'dateCell' } },
  { title: 'Actions', key: 'actions', width: 190, align: 'center', slots: { customRender: 'actionsCell' } },
]

onMounted(fetchRequests)
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <Typography.Title level="2" class="!m-0">
          JAMB Result Requests
        </Typography.Title>
        <Typography.Text type="secondary">
          {{ filteredRequests.length }} total requests
        </Typography.Text>
      </div>
    </div>

    <!-- Table with Compact Search + Refresh -->
    <Card>
      <div class="flex justify-between items-center mb-4 p-4 pt-0">
        <!-- ✅ COMPACT SEARCH + REFRESH -->
        <div class="flex items-center gap-2">
          <Input
            v-model:value="searchText"
            placeholder="Search requests..."
            size="middle"
            class="!w-64"
          />
          <Button
            type="primary"
            :loading="loading"
            @click="fetchRequests"
          >
            <ReloadOutlined /> Refresh
          </Button>
        </div>
      </div>

      <Table
        :columns="columns"
        :data-source="filteredRequests"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        :scroll="{ x: 1600 }"
        class="result-table"
      >
        <!-- ✅ GREEN NUMBERING -->
        <template #indexCell="{ index }">
          <div class="font-semibold text-emerald-600">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </div>
        </template>

        <!-- User -->
        <template #userCell="{ record }">
          <div>
            <div class="font-semibold">{{ record.user?.name }}</div>
            <div class="text-xs text-gray-500">{{ record.email }}</div>
            <div class="text-xs text-gray-400">{{ record.phone_number }}</div>
          </div>
        </template>

        <!-- Service -->
        <template #serviceCell="{ record }">
          <div>
            <div class="font-semibold">{{ record.service?.name }}</div>
            <div class="text-sm text-gray-500">
              {{ record.registration_number }}
            </div>
          </div>
        </template>

        <!-- Pricing -->
        <template #pricingCell="{ record }">
          <div class="text-right">
            <div class="text-xl font-bold text-green-600">
              ₦{{ Number(record.customer_price).toLocaleString() }}
            </div>
            <div class="text-xs text-gray-500">
              Admin: ₦{{ Number(record.admin_payout).toLocaleString() }}
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #statusCell="{ record }">
          <Tag
            :color="
              record.status === 'completed' || record.status === 'approved'
                ? 'green'
                : record.status === 'processing' || record.status === 'proceeding' || record.status === 'pending'
                ? 'orange'
                : 'red'
            "
            class="font-bold px-4 py-1"
          >
            {{ record.status.toUpperCase() }}
          </Tag>
        </template>

        <!-- Is Paid -->
        <template #isPaidCell="{ record }">
          <Tag
            :color="record.is_paid ? 'green' : 'red'"
            class="font-bold px-4 py-1"
          >
            {{ record.is_paid ? 'PAID' : 'UNPAID' }}
          </Tag>
        </template>

        <!-- Taken by -->
        <template #takenCell="{ record }">
          <div v-if="record.taken_by">
            <div class="font-semibold text-sm">{{ record.taken_by.name }}</div>
            <div class="text-xs text-gray-500">{{ record.taken_by.email }}</div>
          </div>
          <span v-else class="text-gray-400 text-sm">—</span>
        </template>

        <!-- File Download -->
        <template #fileCell="{ record }">
          <Button
            v-if="record.result_file"
            type="primary"
            size="small"
            @click="downloadFile(record.result_file, `jamb-result-${record.registration_number || record.id}`)"
          >
            <DownloadOutlined /> Download
          </Button>
          <span v-else class="text-gray-400 text-sm">No file</span>
        </template>

        <!-- Date -->
        <template #dateCell="{ record }">
          <span class="font-mono text-sm">
            {{ new Date(record.created_at).toLocaleString() }}
          </span>
        </template>

        <!-- Actions -->
        <template #actionsCell="{ record }">
          <div class="flex justify-center gap-2">
            <template v-if="record.status === 'completed'">
              <Button
                type="primary"
                size="small"
                :loading="approveLoading"
                @click="openApproveModal(record.id)"
              >
                <CheckOutlined /> Approve
              </Button>

              <Button
                danger
                size="small"
                :loading="rejectLoading"
                @click="openRejectModal(record.id)"
              >
                <CloseOutlined /> Reject
              </Button>
            </template>

            <CheckOutlined
              v-else-if="record.status === 'approved'"
              class="text-green-500 text-lg"
              title="Approved"
            />
            <CloseOutlined
              v-else
              class="text-red-500 text-lg"
              title="Rejected"
            />
          </div>
        </template>
      </Table>
    </Card>

    <!-- Approve Modal -->
    <Modal
      v-model:visible="approveModalVisible"
      title="Confirm Approval"
      ok-text="Approve Request"
      cancel-text="Cancel"
      :ok-button-props="{ loading: approveLoading }"
      @ok="handleApprove"
    >
      <p>Are you sure you want to approve this JAMB Result request?</p>
      <p class="text-sm text-gray-500 mt-2">
        This action cannot be undone.
      </p>
    </Modal>

    <!-- Reject Modal -->
    <Modal
      v-model:visible="rejectModalVisible"
      title="Reject Request"
      ok-text="Reject Request"
      cancel-text="Cancel"
      :ok-button-props="{ loading: rejectLoading }"
      @ok="handleReject"
    >
      <div>
        <p>Provide a reason for rejecting this request:</p>
        <Input.TextArea
          v-model:value="rejectReason"
          rows="4"
          placeholder="Enter detailed rejection reason (required)..."
          class="mt-3"
        />
      </div>
    </Modal>
  </div>
</template>

<style scoped>
/* ✅ GREEN EMERALD HEADER */
.result-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4 text-sm;
}

.result-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4;
}

.result-table :deep(.ant-table-row:hover > td) {
  @apply bg-emerald-50;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
