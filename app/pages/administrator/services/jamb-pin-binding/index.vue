<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Tabs, Table, Button, Tag, Card, Modal, Upload, message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { useFileViewer } from '@/composables/useFileViewer'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['administrator'],
  title: 'JAMB PIN Binding'
})

const { $api } = useNuxtApp()
const { viewFile } = useFileViewer()

// ---------------------------
// SERVICE SLUG
// ---------------------------
const serviceSlug = 'jamb-pin-binding'

// ---------------------------
// STATE
// ---------------------------
const jobs = reactive({
  pending: [] as any[],
  processing: [] as any[],
  completed: [] as any[]
})

const loading = reactive({
  pending: false,
  processing: false,
  completed: false,
  take: {} as Record<string, boolean>, // per-job loader
  complete: false,
  refresh: false
})

const activeTab = ref<'pending' | 'processing' | 'completed'>('pending')
const actionModalVisible = ref(false)
const selectedJob = ref<any>(null)
const fileList = ref<any[]>([])
const viewingId = ref<string | null>(null)

// ---------------------------
// COMPUTED
// ---------------------------
const pendingJobs = computed(() => jobs.pending)
const processingJobs = computed(() => jobs.processing)
const completedJobs = computed(() => jobs.completed)

// ---------------------------
// FETCH FUNCTIONS
// ---------------------------
const fetchJobs = async (type: 'pending' | 'processing' | 'completed') => {
  loading[type] = true
  try {
    const endpoint =
      type === 'pending'
        ? `/services/${serviceSlug}/pending`
        : type === 'processing'
        ? `/services/${serviceSlug}/my-pending-job`
        : `/services/${serviceSlug}/administrator`

    const res = await $api(endpoint)
    const data = res.data?.data || res.data || []
    jobs[type].splice(0, jobs[type].length, ...data)
  } catch (err: any) {
    message.error(err?.data?.message || `Failed to fetch ${type} jobs`)
    jobs[type].splice(0)
  } finally {
    loading[type] = false
  }
}

const refreshAll = async () => {
  loading.refresh = true
  try {
    await Promise.all([
      fetchJobs('pending'),
      fetchJobs('processing'),
      fetchJobs('completed')
    ])
    message.success('🔄 Refreshed')
  } finally {
    loading.refresh = false
  }
}

// ---------------------------
// ACTIONS
// ---------------------------
const takeJob = async (job: any) => {
  loading.take[job.id] = true
  try {
    await $api(`/services/${serviceSlug}/${job.id}/take`, { method: 'POST' })
    message.success('✅ Job taken')
    await Promise.all([fetchJobs('pending'), fetchJobs('processing')])
  } catch (err: any) {
    message.error(err?.data?.message || 'Failed to take job')
  } finally {
    loading.take[job.id] = false
  }
}

const openCompleteModal = (job: any) => {
  selectedJob.value = job
  fileList.value = []
  actionModalVisible.value = true
}

const completeJob = async () => {
  if (!fileList.value.length) {
    message.error('Please select a file')
    return
  }

  const fd = new FormData()
  fd.append('file', fileList.value[0].originFileObj)

  loading.complete = true
  try {
    await $api(`/services/${serviceSlug}/${selectedJob.value.id}/complete`, {
      method: 'POST',
      body: fd
    })
    message.success('✅ Job completed')
    actionModalVisible.value = false
    fileList.value = []
    selectedJob.value = null
    await Promise.all([fetchJobs('processing'), fetchJobs('completed')])
  } catch (err: any) {
    message.error(err?.data?.message || 'Failed to complete job')
  } finally {
    loading.complete = false
  }
}

// ---------------------------
// FILE UPLOAD
// ---------------------------
const beforeUpload = (file: File) => {
  fileList.value = [{ name: file.name, originFileObj: file }]
  return false
}

// ---------------------------
// AUTO REFRESH
// ---------------------------
let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await fetchJobs(activeTab.value)
  refreshTimer = setInterval(() => {
    fetchJobs(activeTab.value)
  }, 30_000)
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})

// ---------------------------
// TAB WATCH
// ---------------------------
watch(activeTab, async (tab) => {
  await fetchJobs(tab)
})
</script>

<template>
  <div class="p-6 lg:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50/50 min-h-screen">

    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-1 sm:p-0">
      <div>
        <div class="text-lg font-bold flex items-center gap-2 text-emerald-800">
          🧾 JAMB PIN Binding
          <span class="text-xs bg-emerald-100 px-2 py-1 rounded-full text-emerald-700">
            {{ pendingJobs.length + processingJobs.length + completedJobs.length }}
          </span>
        </div>
        <div class="text-[10px] sm:text-xs mt-1 text-gray-500">Pending → Take → Complete → Track</div>
      </div>
      <Button
        type="primary" ghost size="small"
        :loading="loading.refresh"
        @click="refreshAll"
        class="border-emerald-500 text-emerald-700"
      >
        🔄 Refresh
      </Button>
    </div>

    <!-- MAIN CONTENT -->
    <Card class="!shadow-xl !border-emerald-200/50">
      <Tabs v-model:activeKey="activeTab" class="!rounded-2xl overflow-hidden">

        <!-- PENDING -->
        <Tabs.TabPane :tab="`🕒 Pending (${pendingJobs.length})`" key="pending">
          <Table
            class="green-table"
            :data-source="pendingJobs"
            :loading="loading.pending"
            row-key="id"
            :scroll="{ x: 1000 }"
            size="middle"
          >
            <Table.Column title="#" width="60">
              <template #default="{ index }">{{ index + 1 }}</template>
            </Table.Column>
            <Table.Column title="Profile Code" dataIndex="profile_code"/>
            <Table.Column title="Status" width="120" align="center">
              <template #default="{ record }">
                <Tag color="orange">{{ record.status?.toUpperCase() || 'PENDING' }}</Tag>
              </template>
            </Table.Column>
            <Table.Column title="Created" width="160">
              <template #default="{ record }">{{ new Date(record.created_at).toLocaleString() }}</template>
            </Table.Column>
            <Table.Column title="Action" width="140" align="center">
              <template #default="{ record }">
                <Button
                  type="primary"
                  size="small"
                  :loading="loading.take[record.id]"
                  @click="takeJob(record)"
                >
                  Take Job
                </Button>
              </template>
            </Table.Column>
          </Table>
        </Tabs.TabPane>

        <!-- PROCESSING -->
        <Tabs.TabPane :tab="`⏳ Processing (${processingJobs.length})`" key="processing">
          <Table
            class="green-table"
            :data-source="processingJobs"
            :loading="loading.processing"
            row-key="id"
            :scroll="{ x: 1000 }"
            size="middle"
          >
            <Table.Column title="#" width="60">
              <template #default="{ index }">{{ index + 1 }}</template>
            </Table.Column>
            <Table.Column title="Profile Code" dataIndex="profile_code"/>
            <Table.Column title="Status" width="120" align="center">
              <template #default="{ record }"><Tag color="blue">PROCESSING</Tag></template>
            </Table.Column>
            <Table.Column title="Action" width="160" align="center">
              <template #default="{ record }">
                <Button type="primary" size="small" @click="openCompleteModal(record)">Upload Result</Button>
              </template>
            </Table.Column>
          </Table>
        </Tabs.TabPane>

        <!-- COMPLETED -->
        <Tabs.TabPane :tab="`✅ Completed (${completedJobs.length})`" key="completed">
          <Table
            class="green-table"
            :data-source="completedJobs"
            :loading="loading.completed"
            row-key="id"
            :scroll="{ x: 1100 }"
            size="middle"
          >
            <Table.Column title="#" width="60">
              <template #default="{ index }">{{ index + 1 }}</template>
            </Table.Column>
            <Table.Column title="Customer" width="220">
              <template #default="{ record }">
                <div class="font-semibold">{{ record.user?.name }}</div>
                <div class="text-xs text-gray-500">{{ record.user?.email }}</div>
              </template>
            </Table.Column>
            <Table.Column title="Service" dataIndex="service"/>
            <Table.Column title="Status" width="120" align="center">
              <template #default="{ record }">
                <Tag :color="record.status === 'approved' ? 'green' : 'blue'">{{ record.status?.toUpperCase() }}</Tag>
              </template>
            </Table.Column>
            <Table.Column title="Payment" width="140" align="center">
              <template #default="{ record }">
                <Tag v-if="record.payment?.is_paid" color="green">💰 PAID</Tag>
                <Tag v-else color="red">⏳ UNPAID</Tag>
              </template>
            </Table.Column>
            <Table.Column title="Result File" width="140" align="center">
              <template #default="{ record }">
                <a href="#" @click.prevent="viewFile(record.id, `/services/${serviceSlug}/${record.id}/download`)">
                  <span v-if="viewingId === record.id">⏳ Opening…</span>
                  <span v-else>📄 View</span>
                </a>
              </template>
            </Table.Column>
            <Table.Column title="Processed At" width="180">
              <template #default="{ record }">{{ new Date(record.processed_at).toLocaleString() }}</template>
            </Table.Column>
          </Table>
        </Tabs.TabPane>

      </Tabs>
    </Card>

    <!-- COMPLETE JOB MODAL -->
    <Modal v-model:open="actionModalVisible" title="Upload Result File" width="500" :footer="null" centered>
      <div class="space-y-4 pt-2">
        <Card size="small" class="!border-blue-200/50 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UploadOutlined class="text-blue-600 text-lg"/>
            </div>
            <div>
              <div class="font-semibold">{{ selectedJob?.email }}</div>
              <div class="text-sm text-gray-500">{{ selectedJob?.registration_number }}</div>
            </div>
          </div>
        </Card>

        <Upload
          v-model:file-list="fileList"
          :before-upload="beforeUpload"
          accept=".pdf,.png,.jpg,.jpeg"
          list-type="picture"
          :max-count="1"
        >
          <Button block icon="UploadOutlined" size="large">Click or drag PDF/Image</Button>
        </Upload>

        <div class="flex gap-3">
          <Button block size="large" @click="actionModalVisible=false; fileList=[]" class="flex-1 h-12">Cancel</Button>
          <Button
            block type="primary" size="large"
            :loading="loading.complete"
            :disabled="!fileList.length || loading.complete"
            @click="completeJob"
            class="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            ✅ Complete Job
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.green-table :deep(.ant-table-thead th) {
  background: linear-gradient(#10b981) !important;
  color: white !important;
  font-weight: 600;
  border: none !important;
}

.green-table :deep(.ant-table-tbody td) {
  padding: 12px;
}

.green-table :deep(.ant-table-row:hover td) {
  background-color: #ecfdf5;
}
</style>
