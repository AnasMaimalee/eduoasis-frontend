<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
})

import { ref, onMounted } from 'vue'
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
  DownloadOutlined,
} from '@ant-design/icons-vue'

const { $api } = useNuxtApp()
const config = useRuntimeConfig()

/* ================= STATE ================= */
const requests = ref<any[]>([])
const loading = ref(false)

/* Approve modal */
const approveModalVisible = ref(false)
const currentApproveId = ref<string | null>(null)

/* Reject modal */
const rejectModalVisible = ref(false)
const currentRejectId = ref<string | null>(null)
const rejectReason = ref('')

/* Pagination */
const pagination = ref({
  current: 1,
  pageSize: 15,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) =>
    `${range[0]}-${range[1]} of ${total} requests`,
})

/* ================= API ================= */
const fetchRequests = async () => {
  loading.value = true
  try {
    const res = await $api('/services/jamb-admission-letter/all')
    requests.value = Array.isArray(res) ? res : res.data || []
    pagination.value.total = requests.value.length
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

  try {
    await $api(`/services/jamb-admission-letter/${currentApproveId.value}/approve`, { 
      method: 'POST' 
    })
    message.success('Request approved successfully')
    approveModalVisible.value = false
    currentApproveId.value = null
    fetchRequests()
  } catch (err: any) {
    message.error(err.data?.message || 'Approval failed')
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

  try {
    await $api(`/services/jamb-admission-letter/${currentRejectId.value}/reject`, {
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
  }
}

/* ✅ FIXED PDF DOWNLOAD */
const downloadResultPDF = async (filePath: string, filename = 'jamb-admission-letter.pdf') => {
  if (!filePath) {
    message.warning('No result file available')
    return
  }

  try {
    const token = useCookie('auth_token')?.value || 
                  localStorage.getItem('auth_token') ||
                  sessionStorage.getItem('auth_token')

    const url = `${config.public.apiBase}/storage/${filePath}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/pdf',
      },
    })

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('pdf')) {
      throw new Error('File is not a valid PDF format')
    }

    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) < 1000) {
      throw new Error('File appears to be empty or corrupted')
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    message.success('PDF downloaded successfully')
  } catch (error: any) {
    console.error('Download error:', error)
    message.error(`Download failed: ${error.message}`)
  }
}

/* ================= TABLE ================= */
const columns = [
  { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' } },
  { title: 'Customer', key: 'user', width: 260, slots: { customRender: 'userCell' } },
  { title: 'Service', key: 'service', width: 280, slots: { customRender: 'serviceCell' } },
  { title: 'Pricing', key: 'pricing', width: 200, align: 'right', slots: { customRender: 'pricingCell' } },
  { title: 'Status', dataIndex: 'status', width: 120, slots: { customRender: 'statusCell' } },
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
          JAMB Admission Letter Requests
        </Typography.Title>
        <Typography.Text type="secondary">
          {{ pagination.total }} total requests
        </Typography.Text>
      </div>
      <Button
        type="primary"
        :loading="loading"
        @click="fetchRequests"
      >
        Refresh
      </Button>
    </div>

    <!-- Table -->
    <Card>
      <Table
        :columns="columns"
        :data-source="requests"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        :scroll="{ x: 1500 }"
      >
        <!-- Index -->
        <template #indexCell="{ index }">
          <strong class="text-blue-600">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </strong>
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
              record.status === 'pending'
                ? 'orange'
                : record.status === 'approved'
                ? 'green'
                : 'red'
            "
            class="font-bold px-4 py-1"
          >
            {{ record.status.toUpperCase() }}
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

        <!-- File -->
        <template #fileCell="{ record }">
          <Button
            v-if="record.result_file"
            type="primary"
            size="small"
            :icon="DownloadOutlined"
            @click="downloadResultPDF(record.result_file, `jamb-admission-${record.registration_number || record.id}.pdf`)"
          >
            Download PDF
          </Button>
          <span v-else class="text-gray-400 text-sm">No file</span>
        </template>

        <!-- Date -->
        <template #dateCell="{ record }">
          <span class="font-mono text-sm">
            {{ new Date(record.created_at).toLocaleString() }}
          </span>
        </template>

        <!-- Actions - NOW WITH MODALS -->
        <template #actionsCell="{ record }">
          <div class="flex justify-center gap-2">
            <template v-if="record.status === 'pending'">
              <!-- APPROVE BUTTON -->
              <Button
                type="primary"
                size="small"
                @click="openApproveModal(record.id)"
              >
                <CheckOutlined /> Approve
              </Button>

              <!-- REJECT BUTTON -->
              <Button
                danger
                size="small"
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

    <!-- ✅ APPROVE CONFIRMATION MODAL -->
    <Modal
      v-model:visible="approveModalVisible"
      title="Confirm Approval"
      ok-text="Approve Request"
      cancel-text="Cancel"
      @ok="handleApprove"
      ok-button-props="{ icon: 'check' }"
    >
      <p>Are you sure you want to approve this JAMB Admission Letter request?</p>
      <p class="text-sm text-gray-500 mt-2">
        This action cannot be undone.
      </p>
    </Modal>

    <!-- ✅ REJECT MODAL WITH REASON -->
    <Modal
      v-model:visible="rejectModalVisible"
      title="Reject Request"
      ok-text="Reject Request"
      cancel-text="Cancel"
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
