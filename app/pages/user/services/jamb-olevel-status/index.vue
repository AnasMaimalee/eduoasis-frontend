<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message, Table, Button, Input, Typography, Tag, Modal, Form } from 'ant-design-vue'
import ServiceConfirmModal from '@/components/user/ServiceConfirmModal.vue'
import dayjs from 'dayjs'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user'],
  title : 'JAMB Olevel Status'
})

const { $api } = useNuxtApp()

/* ===================== STATE ===================== */
const loading = ref(false)
const showModal = ref(false)
const requests = ref([])
const searchText = ref('')
const searchTimeout = ref(null)

/* ===================== FORM ===================== */
const formRef = ref()
const form = ref({
  email: '',
  phone_number: '',
  registration_number: '',
  profile_code: ''
})

/* ===================== PAGINATION ===================== */
const pagination = ref({
  current: 1,
  pageSize: 100,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total.toLocaleString()} requests`
})

/* ===================== CLIENT-SIDE SEARCH ===================== */
const filteredRequests = computed(() => {
  if (!searchText.value.trim()) return requests.value
  
  const query = searchText.value.toLowerCase()
  return requests.value.filter(request => 
    request.email?.toLowerCase().includes(query) ||
    request.phone_number?.toLowerCase().includes(query) ||
    request.registration_number?.toLowerCase().includes(query) ||
    request.profile_code?.toLowerCase().includes(query) ||
    request.status?.toLowerCase().includes(query)
  )
})


const downloadingId = ref<string | null>(null)

const downloadFile = async (jobId: string) => {
  if (downloadingId.value) return

  downloadingId.value = jobId
  console.log('🚀 Downloading:', jobId)

  try {
    const response = await $api.raw(
      `/services/jamb-upload-status/${jobId}/download`,
      {
        method: 'GET',
        responseType: 'blob',
      }
    )

    // ✅ Handle authorization error from backend
    if (response.status === 403) {
      message.error(response._data?.message || 'You are not allowed to download this file')
      return
    }

    // ✅ Blob
    const blob = new Blob([response._data], {
      type: response.headers.get('content-type') || 'application/octet-stream',
    })

    // ✅ Detect filename
    const disposition = response.headers.get('content-disposition')
    let filename = `jamb-upload-status-${Date.now()}`

    if (disposition && disposition.includes('filename=')) {
      filename = disposition.split('filename=')[1].replace(/"/g, '')
    }

    // ✅ Download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    message.success('Download completed')
  } catch (error: any) {
    console.error('Download error:', error)

    // ✅ Proper error message from backend
    const msg =
      error?.data?.message ||
      error?.response?._data?.message ||
      'You are not allowed to download this file'

    message.error(msg)
  } finally {
    downloadingId.value = null
  }
}


/* ===================== FETCH ===================== */
const fetchRequests = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.value.current,
      per_page: pagination.value.pageSize
    }
    
    const res = await $api('/services/jamb-upload-status/my', { 
      method: 'GET',
      params 
    })
    
    requests.value = res.data || res
    pagination.value.total = res.total || res.length || 0
    
  } catch (e) {
    message.error('Failed to fetch requests')
    requests.value = []
  } finally {
    loading.value = false
  }
}

const submitting = ref(false)

const showConfirmModal = ref(false)

const preparingConfirmation = ref(false) // Loader while preparing modal
const submittingRequest = ref(false)     // Loader while submitting
const confirming = ref(false)    

/* ===================== CONFIRMATION DATA ===================== */
const serviceName = ref('')
const serviceAmount = ref(0)
const walletBalance = ref(0)
const SERVICE_NAME = 'Checking Admission Status'

/* ===================== PREPARE CONFIRMATION ===================== */
const prepareConfirmation = async () => {
  try {
    preparingConfirmation.value = true

    // Fetch wallet
    const walletRes = await $api('/wallet', { method: 'GET' })
    walletBalance.value = Number(walletRes.balance)

    // Fetch services
    const servicesRes = await $api('/services', { method: 'GET' })
    const services = servicesRes.data
    const service = services.find((s: any) => s.name === SERVICE_NAME)

    if (!service) {
      message.error('Service not configured')
      return
    }

    serviceName.value = service.name
    serviceAmount.value = Number(service.price)

    showConfirmModal.value = true
  } catch (e) {
    console.error('Prepare confirmation error:', e)
    message.error('Unable to prepare confirmation')
  } finally {
    preparingConfirmation.value = false
  }
}

/* ===================== SUBMIT REQUEST ===================== */
const submitRequest = async () => {
  try {
    submittingRequest.value = true

    await $api('/services/jamb-upload-status', {
      method: 'POST',
      body: form.value
    })

    message.success('Request submitted successfully')

    showConfirmModal.value = false
    showModal.value = false

    Object.assign(form.value, {
      email: '',
      phone_number: '',
      registration_number: '',
      profile_code: ''
    })

    fetchRequests()
  } catch (e: any) {
    message.error(e?.data?.message || 'Submission failed')
  } finally {
    submittingRequest.value = false
  }
}
/* ===================== EVENTS ===================== */
const handleTableChange = (pagConfig) => {
  pagination.value.current = pagConfig.current
  pagination.value.pageSize = pagConfig.pageSize
  fetchRequests()
}

const debouncedSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    pagination.value.current = 1
  }, 500)
}

watch(() => searchText.value, debouncedSearch)
let autoRefreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchRequests()

  // 🔄 Auto refresh every 5 seconds
  autoRefreshInterval = setInterval(() => {
    if (!loading.value) {
      fetchRequests()
    }
  }, 30_000)
})

onUnmounted(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
    autoRefreshInterval = null
  }
})

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50/50 to-teal-50/50 p-4 lg:p-8 space-y-8 bg-emerald-50">
    
  <!-- PAGE HEADER -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <!-- Title & Summary -->
      <div class="flex-1 min-w-0">
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
          JAMB Olevel Status Requests
        </h1>
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-1 text-sm">
          <span class="font-semibold text-emerald-700 truncate">
            {{ filteredRequests.length.toLocaleString() }} of {{ pagination.total.toLocaleString() }}
          </span>
          <span class="text-gray-500 truncate">
            total requests • Real-time search enabled
          </span>
        </div>
      </div>

      <!-- Search & Buttons -->
      <div class="flex flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto mt-2 lg:mt-0">
        <Input.Search
          v-model:value="searchText"
          placeholder="Search email, phone, reg no, profile code, status..."
          class="flex-1 min-w-[150px] sm:w-64 lg:w-80"
          allow-clear
          enter-button="Search"
        />
        
        <Button @click="fetchRequests" :loading="loading" type="default" class="flex-shrink-0">
          Refresh
        </Button>
        
        <Button
          type="primary"
          @click="showModal = true"
          class="bg-emerald-600 hover:bg-emerald-700 border-none flex-shrink-0"
        >
          Create Request
        </Button>
      </div>
    </div>

    <div class="w-full overflow-x-auto rounded-2xl border border-emerald-200/50 bg-white/80 backdrop-blur-sm scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-emerald-100">
  <div class="min-w-[1600px]">
    <a-table
      :columns="[
        { title: '#', dataIndex: 'index', key: 'index', width: 80, fixed: 'left' },
        { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true, width: 220 },
        { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number', ellipsis: true, width: 150 },
        { title: 'Reg No', dataIndex: 'registration_number', key: 'registration_number', ellipsis: true, width: 170 },
        { title: 'Profile Code', dataIndex: 'profile_code', key: 'profile_code', ellipsis: true, width: 150 },
        { title: 'Status', dataIndex: 'status', key: 'status', width: 160 },
        { title: 'Result', dataIndex: 'result', key: 'result', width: 160 },
        { title: 'Date', dataIndex: 'created_at', key: 'created_at', width: 170 }
      ]"
      :data-source="filteredRequests"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      :scroll="{ x: 1600, y: 600 }"
      row-key="id"
      class="service-table"
      bordered
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          <div class="font-black text-xl text-emerald-600">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </div>
        </template>
        
        <template v-else-if="column.dataIndex === 'email'">
          <span class="font-semibold text-gray-800">{{ record.email }}</span>
        </template>
        
        <template v-else-if="column.dataIndex === 'phone_number'">
          <span class="font-medium text-gray-700">{{ record.phone_number }}</span>
        </template>
        
        <template v-else-if="column.dataIndex === 'registration_number'">
          <span class="font-bold text-gray-900">{{ record.registration_number }}</span>
        </template>
        
        <template v-else-if="column.dataIndex === 'profile_code'">
          <span class="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-sm">{{ record.profile_code }}</span>
        </template>
        
        <template v-else-if="column.dataIndex === 'status'">
          <Tag 
            :color="record.status === 'approved' ? 'success' : record.status === 'processing' ? 'blue' : record.status === 'completed' ? 'purple' : 'orange'"
            class="!font-bold px-4 py-2 text-sm rounded-full shadow-sm border-2"
          >
            {{ record.status?.toUpperCase() || 'PENDING' }}
          </Tag>
        </template>
        
       <template v-else-if="column.dataIndex === 'result'">
          <Button
            v-if="record.result_file"
            type="primary"
            size="small"
            :loading="downloadingId === record.id"
            @click="downloadFile(record.id)"
            class="bg-emerald-600 hover:bg-emerald-700 border-none"
          >
            📥 Download
          </Button>

          <Tag v-else color="default">Not ready</Tag>
        </template>
        
        <template v-else-if="column.dataIndex === 'created_at'">
          <div class="font-semibold text-gray-800 text-sm">
            {{ dayjs(record.created_at).format('DD MMM • hh:mm A') }}
          </div>
        </template>
      </template>
    </a-table>
  </div>
</div>

    <!-- Half-screen Modal -->
    <Modal
      v-model:visible="showModal"
      title="New JAMB Request"
      :width="600"
      :confirm-loading="preparingConfirmation"
      ok-text="Submit"
      cancel-text="Cancel"
      @ok="prepareConfirmation"
      class="half-screen-modal"
    >
      <Form ref="formRef" :model="form" layout="vertical">
        <Form.Item label="Email" name="email" required>
          <Input v-model:value="form.email" placeholder="your.email@example.com"  class="large"/>
        </Form.Item>

        <Form.Item label="Phone Number" name="phone_number" required>
          <Input v-model:value="form.phone_number" placeholder="08012345678"  class="large"/>
        </Form.Item>

        <Form.Item label="Registration Number" name="registration_number" required>
          <Input v-model:value="form.registration_number" placeholder="JAMBREG123456" class="large" />
        </Form.Item>

        <Form.Item label="Profile Code" name="profile_code" required>
          <Input v-model:value="form.profile_code" placeholder="Enter profile code"  class="large"/>
        </Form.Item>
      </Form>
    </Modal>
  </div>
   <!-- Confirmation Modal -->
    <ServiceConfirmModal
      :visible="showConfirmModal"
      :service-name="serviceName"
      :amount="serviceAmount"
      :wallet-balance="walletBalance"
      :loading="submittingRequest"
      :preparing="preparingConfirmation"
      @confirm="submitRequest"
      @cancel="showConfirmModal = false"
    />
</template>
<style scoped>
/* 🔥 FULL SCROLLABLE TABLE + COLORS */
.service-table {
  @apply w-full;
}

.service-table :deep(.ant-table-container) {
  @apply w-full;
}

.service-table :deep(.ant-table) {
  @apply w-full min-w-[1600px];
}

/* HEADER */
.service-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-bold !py-4 !px-6 text-sm uppercase tracking-wide border-none;
}

.service-table :deep(.ant-table-thead) {
  @apply border-b-0;
}

/* ✅ STATUS COLORS */
.service-table :deep(.ant-table-tbody tr[data-status="approved"]),
.service-table :deep(.ant-table-tbody tr[data-status="completed"]) {
  background-color: rgb(236 253 245 / 0.9) !important; /* LIGHT GREEN */
}

.service-table :deep(.ant-table-tbody tr[data-status="approved"]:hover > td),
.service-table :deep(.ant-table-tbody tr[data-status="completed"]:hover > td) {
  background-color: rgb(209 250 229 / 0.9) !important; /* LIGHTER GREEN */
}

.service-table :deep(.ant-table-tbody tr[data-status="processing"]),
.service-table :deep(.ant-table-tbody tr[data-status="rejected"]) {
  background-color: rgb(254 242 242 / 0.9) !important; /* LIGHT RED */
}

.service-table :deep(.ant-table-tbody tr[data-status="processing"]:hover > td),
.service-table :deep(.ant-table-tbody tr[data-status="rejected"]:hover > td) {
  background-color: rgb(254 226 226 / 0.9) !important; /* LIGHTER RED */
}

/* CELLS */
.service-table :deep(.ant-table-tbody td) {
  @apply !py-4 !px-6 border-b border-gray-100/50;
}

.service-table :deep(.ant-table-tbody tr:hover > td) {
  @apply bg-emerald-50/70;
}

.service-table :deep(.ant-table-tbody tr:last-child td) {
  @apply border-b-0;
}

/* SCROLLBAR */
.service-table :deep(.ant-table-body::-webkit-scrollbar),
.service-table :deep(.ant-table-container::-webkit-scrollbar) {
  height: 8px;
}

.service-table :deep(.ant-table-body::-webkit-scrollbar-track),
.service-table :deep(.ant-table-container::-webkit-scrollbar-track) {
  background: rgb(248 250 252 / 0.5);
  border-radius: 4px;
}

.service-table :deep(.ant-table-body::-webkit-scrollbar-thumb),
.service-table :deep(.ant-table-container::-webkit-scrollbar-thumb) {
  background: rgb(16 185 129 / 0.7);
  border-radius: 4px;
}

.service-table :deep(.ant-table-body::-webkit-scrollbar-thumb:hover),
.service-table :deep(.ant-table-container::-webkit-scrollbar-thumb:hover) {
  background: rgb(5 150 105 / 0.9);
}

/* MODAL */
.half-screen-modal :deep(.ant-modal) {
  max-width: 50vw !important;
  width: 50vw !important;
}

.half-screen-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  border: 1px solid #d1d5db;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
</style>
