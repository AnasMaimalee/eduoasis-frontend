<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message, Table, Button, Input, Typography, Tag, Modal, Form } from 'ant-design-vue'
import dayjs from 'dayjs'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user']
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
  pageSize: 10,
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

const downloadFile = async (filePath: string, id: string) => {
  if (!filePath || downloadingId.value) return

  downloadingId.value = id

  try {
    const response = await $api(`/download-storage/${filePath}`, {
      method: 'GET',
      responseType: 'blob'
    })

    const contentType = response.headers?.['content-type'] || ''
    const blob = new Blob([response], { type: contentType })

    let filename = `jamb-result-${Date.now()}`
    if (contentType.includes('pdf')) filename += '.pdf'
    else if (contentType.includes('image/')) filename += '.png'
    else filename += `.${filePath.split('.').pop()}`

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    message.success('Download completed')
  } catch (e) {
    message.error('Download failed')
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
    
    const res = await $api('/services/jamb-admission-letter/my', { 
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

/* ===================== SUBMIT ===================== */
const submitRequest = async () => {
  try {
    submitting.value = true

    await $api('/services/jamb-admission-letter', {
      method: 'POST',
      body: form.value
    })

    message.success('Request submitted successfully')
    showModal.value = false

    Object.assign(form.value, {
      email: '',
      phone_number: '',
      registration_number: '',
      profile_code: ''
    })

    pagination.value.current = 1
    fetchRequests()
  } catch (e: any) {
    message.error(
      e?.data?.message ||
      e?.response?.data?.message ||
      'Submission failed'
    )
  } finally {
    submitting.value = false
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
onMounted(fetchRequests)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50/50 to-teal-50/50 p-4 lg:p-8 space-y-8">
    
    <!-- PAGE HEADER -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">
          JAMB Admission Letter Requests
        </h1>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-sm font-semibold text-emerald-700">
            {{ filteredRequests.length.toLocaleString() }} of {{ pagination.total.toLocaleString() }}
          </span>
          <span class="text-sm text-gray-500">
            total requests • Real-time search enabled
          </span>
        </div>
      </div>

      <div class="flex gap-3 w-full lg:w-auto">
        <Input.Search
          v-model:value="searchText"
          placeholder="Search email, phone, reg no, profile code, status..."
          class="w-full lg:w-80"
          allow-clear
          enter-button="Search"
        />

        <Button
          @click="fetchRequests"
          :loading="loading"
          type="default"
        >
          Refresh
        </Button>

        <Button
          type="primary"
          @click="showModal = true"
          class="bg-emerald-600 hover:bg-emerald-700 border-none"
        >
          Create Request
        </Button>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-emerald-100/50 shadow-sm">
      <a-table
        :columns="[
          { title: '#', dataIndex: 'index', key: 'index', width: 100, fixed: 'left' },
          { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
          { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number', ellipsis: true },
          { title: 'Reg No', dataIndex: 'registration_number', key: 'registration_number', ellipsis: true },
          { title: 'Profile Code', dataIndex: 'profile_code', key: 'profile_code', ellipsis: true },
          { title: 'Status', dataIndex: 'status', key: 'status', width: 160 },
          { title: 'Result', dataIndex: 'result', key: 'result', width: 180 },
          { title: 'Date', dataIndex: 'created_at', key: 'created_at', width: 180 }
        ]"
        :data-source="filteredRequests"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        :scroll="{ x: 1200 }"
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
              @click="downloadFile(record.result_file, record.id)"
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

    <!-- Half-screen Modal -->
    <Modal
      v-model:visible="showModal"
      title="New JAMB Request"
      :width="600"
      :confirm-loading="submitting"
      ok-text="Submit"
      cancel-text="Cancel"
      @ok="submitRequest"
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
</template>

<style scoped>
.service-table :deep(.ant-table) {
  @apply border border-emerald-200/30 rounded-xl overflow-hidden;
}

.service-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-bold !py-4 !px-6 text-sm uppercase tracking-wide border-none;
}

.service-table :deep(.ant-table-thead) {
  @apply border-b-0;
}

.service-table :deep(.ant-table-tbody td) {
  @apply !py-4 !px-6 border-b border-gray-100/50;
}

.service-table :deep(.ant-table-tbody tr:hover > td) {
  @apply bg-emerald-50/70;
}

.service-table :deep(.ant-table-tbody tr:last-child td) {
  @apply border-b-0;
}

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
