<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Tabs, Table, Button, Tag, Card, Modal, Upload, message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import NetworkStatusIndicator from '@/components/network/NetworkStatusIndicator.vue'

const { $api } = useNuxtApp()

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['administrator'],
  title: 'JAMB Admission Letter'
})

const serviceSlug = 'jamb-admission-letter'

/* =======================
   STATE
======================= */
const jobs = reactive({
  pending: [] as any[],
  processing: [] as any[],
  completed: [] as any[]
})

const loading = reactive({
  pending: false,
  processing: false,
  completed: false,
  take: false,
  complete: false,
  refresh: false
})

const activeTab = ref<'pending' | 'processing' | 'completed'>('pending')
const actionModalVisible = ref(false)
const selectedJob = ref<any>(null)
const fileList = ref<any[]>([])
const takingJobId = ref<string | null>(null)

/* =======================
   COMPUTED
======================= */
const pendingJobs = computed(() => jobs.pending)
const myJobs = computed(() => jobs.processing)
const completedJobs = computed(() => jobs.completed)

/* =======================
   FETCH LOGIC
======================= */
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

    // 🔥 SAFE REACTIVE UPDATE
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
  await Promise.all([
    fetchJobs('pending'),
    fetchJobs('processing'),
    fetchJobs('completed')
  ])
  loading.refresh = false
}

/* =======================
   ACTIONS
======================= */
const takeJob = async (job: any) => {
  takingJobId.value = job.id
  loading.take = true

  try {
    await $api(`/services/${serviceSlug}/${job.id}/take`, { method: 'POST' })
    message.success('✅ Job taken')

    await Promise.all([
      fetchJobs('pending'),
      fetchJobs('processing')
    ])
  } catch (err: any) {
    message.error(err?.data?.message || 'Failed to take job')
  } finally {
    loading.take = false
    takingJobId.value = null
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
    selectedJob.value = null
    fileList.value = []

    await Promise.all([
      fetchJobs('processing'),
      fetchJobs('completed')
    ])
  } catch (err: any) {
    message.error(err?.data?.message || 'Failed to complete job')
  } finally {
    loading.complete = false
  }
}

const beforeUpload = (file: File) => {
  fileList.value = [{ name: file.name, originFileObj: file }]
  return false
}

/* =======================
   AUTO LOAD + AUTO REFRESH
======================= */
let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  // 🔥 LOAD DATA IMMEDIATELY
  await fetchJobs(activeTab.value)

  // 🔁 AUTO REFRESH EVERY 30s
  refreshTimer = setInterval(() => {
    fetchJobs(activeTab.value)
  }, 30_000)
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

/* =======================
   TAB CHANGE
======================= */
watch(activeTab, async (tab) => {
  await fetchJobs(tab)
})
</script>


<template>
  <div class="p-6 lg:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50/50 min-h-screen">
    
    <NetworkStatusIndicator />

    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <div class="text-lg font-bold text-emerald-800 flex items-center gap-2">
          🧾 JAMB Admission Letter
          <span class="text-xs bg-emerald-100 px-2 py-1 rounded-full text-emerald-700">
            {{ pendingJobs.length + myJobs.length + completedJobs.length }}
          </span>
        </div>
         <div class="text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-0 block sm:inline text-gray-500">
          Pending → Take → Complete → Track
        </div>
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

    <!-- TABS -->
    <Card class="!shadow-xl !border-emerald-200/50">
      <Tabs v-model:activeKey="activeTab" class="!rounded-2xl overflow-hidden">
        
        <Tabs.TabPane key="pending" :tab="`🕒 Pending (${pendingJobs.length})`">
          <Table
            class="green-table"
            :data-source="pendingJobs"
            :loading="loading.pending"
            row-key="key"
            :scroll="{ x: 1000 }"
            size="middle"
          >
            <Table.Column title="#" width="60">
              <template #default="{ index }">
                {{ index + 1 }}
              </template>
            </Table.Column>
            <Table.Column title="Email" dataIndex="email" />
            <Table.Column title="Phone" dataIndex="phone_number" />
            <Table.Column title="Reg No" dataIndex="registration_number" />
            <Table.Column title="Profile Code" dataIndex="profile_code" />
            <Table.Column title="Status" width="120" align="center">
              <template #default="{ record }">
                <Tag color="orange">{{ record.status?.toUpperCase() }}</Tag>
              </template>
            </Table.Column>
            <Table.Column title="Created" width="160">
              <template #default="{ record }">
                {{ new Date(record.created_at).toLocaleString() }}
              </template>
            </Table.Column>
            <Table.Column title="Action" width="140" align="center">
              <template #default="{ record }">
                <Button 
                  type="primary" 
                  size="small" 
                  :loading="takingJobId === record.id"
                  @click="takeJob(record)"
                >
                  Take Job
                </Button>
              </template>
            </Table.Column>
          </Table>
        </Tabs.TabPane>

        <Tabs.TabPane key="processing" :tab="`⏳ Processing (${myJobs.length})`">
          <Table
            class="green-table"
            :data-source="myJobs"
            :loading="loading.processing"
            row-key="key"
            :scroll="{ x: 1000 }"
            size="middle"
          >
            <Table.Column title="#" width="60">
              <template #default="{ index }">
                {{ index + 1 }}
              </template>
            </Table.Column>
            <Table.Column title="Email" dataIndex="email" />
            <Table.Column title="Reg No" dataIndex="registration_number" />
            <Table.Column title="Profile Code" dataIndex="profile_code" />
            <Table.Column title="Status" width="120" align="center">
              <template #default>
                <Tag color="blue">PROCESSING</Tag>
              </template>
            </Table.Column>
            <Table.Column title="Action" width="160" align="center">
              <template #default="{ record }">
                <Button type="primary" size="small" @click="openCompleteModal(record)">
                  Upload Result
                </Button>
              </template>
            </Table.Column>
          </Table>
        </Tabs.TabPane>

        <Tabs.TabPane key="completed" :tab="`✅ Completed (${completedJobs.length})`">
          <Table
            class="green-table"
            :data-source="completedJobs"
            :loading="loading.completed"
            row-key="key"
            :scroll="{ x: 1100 }"
            size="middle"
          >
            <Table.Column title="#" width="60">
              <template #default="{ index }">
                {{ index + 1 }}
              </template>
            </Table.Column>
            <Table.Column title="Customer" width="220">
              <template #default="{ record }">
                <div class="font-semibold">{{ record.user?.name || record.email }}</div>
                <div class="text-xs text-gray-500">{{ record.email }}</div>
              </template>
            </Table.Column>
            <Table.Column title="Status" width="120" align="center">
              <template #default="{ record }">
                <Tag :color="record.status === 'approved' ? 'green' : 'blue'">
                  {{ record.status?.toUpperCase() }}
                </Tag>
              </template>
            </Table.Column>
            <Table.Column title="Processed" width="180">
              <template #default="{ record }">
                {{ new Date(record.created_at).toLocaleString() }}
              </template>
            </Table.Column>
          </Table>
        </Tabs.TabPane>
      </Tabs>
    </Card>

    <!-- MODAL -->
    <Modal v-model:open="actionModalVisible" title="Upload Result File" width="500" :footer="null" centered>
      <div class="space-y-4 pt-2">
        <Card size="small" class="!border-blue-200/50 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UploadOutlined class="text-blue-600 text-lg" />
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
          <Button block size="large" @click="actionModalVisible = false; fileList = []" class="flex-1 h-12">Cancel</Button>
          <Button 
            block type="primary" size="large" 
            :loading="loading.complete" 
            :disabled="!fileList.length"
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
  background: #10b981 !important;
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
