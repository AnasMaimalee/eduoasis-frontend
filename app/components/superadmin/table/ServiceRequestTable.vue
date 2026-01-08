<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  Table,
  Button,
  Tag,
  Modal,
  Input,
  Typography,
} from 'ant-design-vue'
import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue'

interface Props {
  apiPath: string
  title: string
  filenamePrefix?: string
}

const props = withDefaults(defineProps<Props>(), {
  filenamePrefix: 'download'
})

const emit = defineEmits<{
  (e: 'approved', id: string): void
  (e: 'rejected', id: string, reason: string): void
}>()

/* ================= STATE ================= */
const requests = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')

/* Modals */
const approveModalVisible = ref(false)
const currentApproveId = ref<string | null>(null)
const approveLoading = ref(false)

const rejectModalVisible = ref(false)
const currentRejectId = ref<string | null>(null)
const rejectReason = ref('')
const rejectLoading = ref(false)

const { $api } = useNuxtApp()
const config = useRuntimeConfig()

/* ✅ SEARCH FILTER */
const filteredRequests = computed(() => {
  if (!searchText.value.trim()) return requests.value
  
  const query = searchText.value.toLowerCase()
  return requests.value.filter(record => 
    record.user?.name?.toLowerCase().includes(query) ||
    record.email?.toLowerCase().includes(query) ||
    record.registration_number?.toLowerCase().includes(query) ||
    record.service?.name?.toLowerCase().includes(query) ||
    record.status?.toLowerCase().includes(query)
  )
})

/* Pagination */
const pagination = computed(() => ({
  current: 1,
  pageSize: 15,
  total: filteredRequests.value.length,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) =>
    `${range[0]}-${range[1]} of ${total} requests`,
}))

/* ================= API ================= */
const fetchRequests = async () => {
  loading.value = true
  try {
    const res = await $api(props.apiPath)
    requests.value = Array.isArray(res) ? res : res.data || []
  } catch (err) {
    ;(useMessage as any).error('Failed to load requests')
  } finally {
    loading.value = false
  }
}

/* ================= APPROVE ================= */
const openApproveModal = (id: string) => {
  currentApproveId.value = id
  approveModalVisible.value = true
}

const handleApprove = async () => {
  if (!currentApproveId.value) return

  approveLoading.value = true
  try {
    await $api(`${props.apiPath.replace('/all', '')}/${currentApproveId.value}/approve`, { 
      method: 'POST' 
    })
    ;(useMessage as any).success('Request approved successfully')
    approveModalVisible.value = false
    currentApproveId.value = null
    fetchRequests()
    emit('approved', currentApproveId.value)
  } catch (err: any) {
    ;(useMessage as any).error(err.data?.message || 'Approval failed')
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
    ;(useMessage as any).error('Rejection reason is required')
    return
  }

  rejectLoading.value = true
  try {
    await $api(`${props.apiPath.replace('/all', '')}/${currentRejectId.value}/reject`, {
      method: 'POST',
      body: { reason: rejectReason.value },
    })
    ;(useMessage as any).success('Request rejected successfully')
    rejectModalVisible.value = false
    currentRejectId.value = null
    rejectReason.value = ''
    fetchRequests()
    emit('rejected', currentRejectId.value, rejectReason.value)
  } catch (err: any) {
    ;(useMessage as any).error(err.data?.message || 'Rejection failed')
  } finally {
    rejectLoading.value = false
  }
}

/* ================= DOWNLOAD ================= */
const downloadFile = async (filePath: string, filename = props.filenamePrefix) => {
  if (!filePath) {
    ;(useMessage as any).warning('No result file available')
    return
  }

  try {
    const token = useCookie('auth_token')?.value || 
                  localStorage.getItem('auth_token') ||
                  sessionStorage.getItem('auth_token')

    const url = `${config.public.apiBase}/storage/${filePath}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    })

    if (!response.ok) throw new Error(`Server error: ${response.status}`)

    const contentType = response.headers.get('content-type') || ''
    const contentLength = response.headers.get('content-length')
    
    if (contentLength && parseInt(contentLength) < 1000) {
      throw new Error('File appears to be empty or corrupted')
    }

    const blob = await response.blob()
    let downloadFilename = filename
    
    if (contentType.includes('pdf')) {
      downloadFilename = `${filename}.pdf`
    } else if (contentType.includes('image/')) {
      const imageExt = contentType.split('/')[1] || 'png'
      downloadFilename = `${filename}.${imageExt}`
    } else {
      const pathParts = filePath.split('.')
      if (pathParts.length > 1) {
        downloadFilename = `${filename}.${pathParts[pathParts.length - 1]}`
      }
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.some(type => contentType.includes(type.split('/')[1]))) {
      throw new Error(`Unsupported file type: ${contentType}`)
    }

    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = downloadFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    ;(useMessage as any).success(`${downloadFilename} downloaded successfully`)
  } catch (error: any) {
    console.error('Download error:', error)
    ;(useMessage as any).error(`Download failed: ${error.message}`)
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
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <Typography.Title level="2" class="!m-0">{{ props.title }}</Typography.Title>
        <Typography.Text type="secondary">
          {{ filteredRequests.length }} of {{ requests.length }} total requests
        </Typography.Text>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        <Input
          v-model:value="searchText"
          placeholder="Search name, email, reg#, service, status..."
          allow-clear
          class="w-full lg:w-80"
        />
        <Button type="primary" :loading="loading" @click="fetchRequests">
          <ReloadOutlined /> Refresh
        </Button>
        <Button v-if="searchText" @click="searchText = ''">Clear</Button>
      </div>
    </div>

    <!-- Table -->
    <Card>
      <Table
        :columns="columns"
        :data-source="filteredRequests"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        :scroll="{ x: 1600 }"
      >
        <template #indexCell="{ index }">
          <strong class="text-blue-600">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </strong>
        </template>

        <template #userCell="{ record }">
          <div>
            <div class="font-semibold">{{ record.user?.name }}</div>
            <div class="text-xs text-gray-500">{{ record.email }}</div>
            <div class="text-xs text-gray-400">{{ record.phone_number }}</div>
          </div>
        </template>

        <template #serviceCell="{ record }">
          <div>
            <div class="font-semibold">{{ record.service?.name }}</div>
            <div class="text-sm text-gray-500">{{ record.registration_number }}</div>
          </div>
        </template>

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

        <template #statusCell="{ record }">
          <Tag
            :color="
              record.status === 'completed' || record.status === 'approved' ? 'green' :
              record.status === 'processing' || record.status === 'proceeding' || record.status === 'pending' ? 'orange' : 'red'
            "
            class="font-bold px-4 py-1"
          >
            {{ record.status.toUpperCase() }}
          </Tag>
        </template>

        <template #isPaidCell="{ record }">
          <Tag :color="record.is_paid ? 'green' : 'red'" class="font-bold px-4 py-1">
            {{ record.is_paid ? 'PAID' : 'UNPAID' }}
          </Tag>
        </template>

        <template #takenCell="{ record }">
          <div v-if="record.taken_by">
            <div class="font-semibold text-sm">{{ record.taken_by.name }}</div>
            <div class="text-xs text-gray-500">{{ record.taken_by.email }}</div>
          </div>
          <span v-else class="text-gray-400 text-sm">—</span>
        </template>

        <template #fileCell="{ record }">
          <Button
            v-if="record.result_file"
            type="primary"
            size="small"
            @click="downloadFile(record.result_file, `${props.filenamePrefix}-${record.registration_number || record.id}`)"
          >
            <DownloadOutlined /> Download
          </Button>
          <span v-else class="text-gray-400 text-sm">No file</span>
        </template>

        <template #dateCell="{ record }">
          <span class="font-mono text-sm">
            {{ new Date(record.created_at).toLocaleString() }}
          </span>
        </template>

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
            <CheckOutlined v-else-if="record.status === 'approved'" class="text-green-500 text-lg" title="Approved" />
            <CloseOutlined v-else class="text-red-500 text-lg" title="Rejected" />
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
      <p>Are you sure you want to approve this request?</p>
      <p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
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
