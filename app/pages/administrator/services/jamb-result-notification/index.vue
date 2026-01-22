<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { Tabs, Table, Button, Tag, Card, Modal, Upload, Typography, message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['administrator'],
  title: 'JAMB Admission Result Notifcation'
})


import { useFileViewer } from '@/composables/useFileViewer'
const { viewFile } = useFileViewer()

const { $api } = useNuxtApp()

const loading = reactive({
  pending: false,
  myJobs: false,
  completed: false,
  take: false,
  complete: false,
  refresh: false // ✅ NEW
})

const activeTab = ref('pending')
const pendingJobs = ref<any[]>([])
const myJobs = ref<any[]>([])
const completedJobs = ref<any[]>([])

const actionModalVisible = ref(false)
const selectedJob = ref<any>(null)
const fileList = ref<any[]>([])

// Prevent auto upload
const beforeUpload = (file: File) => {
  // Allow only one file
  fileList.value = [file]
  return false
}

// ---------------------------
// FETCH FUNCTIONS
// ---------------------------
const fetchPending = async () => {
  loading.pending = true
  try {
    const res = await $api('/services/jamb-admission-result-notification/pending')
    pendingJobs.value = res.data?.data || res.data || []
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to fetch pending jobs')
    pendingJobs.value = []
  } finally {
    loading.pending = false
  }
}

const fetchMyJobs = async () => {
  loading.myJobs = true
  try {
    const res = await $api('/services/jamb-admission-result-notification/my-pending-job')
    myJobs.value = res.data?.data || res.data || []
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to fetch my jobs')
    myJobs.value = []
  } finally {
    loading.myJobs = false
  }
}

const fetchCompleted = async () => {
  loading.completed = true
  try {
    const res = await $api('/services/jamb-admission-result-notification/administrator')
    completedJobs.value = res.data?.data || res.data || []
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to fetch completed jobs')
    completedJobs.value = []
  } finally {
    loading.completed = false
  }
}



// ---------------------------
// JOB ACTIONS
// ---------------------------

// Take job (POST method)
const takeJob = async (job: any) => {
  loading.take = true
  console.log("take")
  try {
    // $api behaves like $fetch
    await $api(`/services/jamb-admission-result-notification/${job.id}/take`, {
      method: 'POST',   // <-- specify POST method
      body: {}          // empty body
    })
    console.log("hello")
    message.success('✅ Job taken successfully')
    await refreshAll()
  } catch (err: any) {
    console.error('Take job error:', err)
    message.error(err?.data?.message || 'Failed to take job')
  } finally {
    loading.take = false
  }
}



// Open modal to complete job
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

  const upload = fileList.value[0]
  if (!upload.originFileObj) {
    message.error('File not found, please re-select')
    return
  }

  const fd = new FormData()
  fd.append('file', upload.originFileObj)

  loading.complete = true
  try {
    await $api(`/services/jamb-admission-result-notification/${selectedJob.value.id}/complete`, {
      method: 'POST',
      body: fd
    })

    message.success('✅ Job completed successfully')
    actionModalVisible.value = false
    fileList.value = []
    selectedJob.value = null
    await refreshAll()
  } catch (err: any) {
    message.error(err?.data?.message || 'Failed to complete job')
  } finally {
    loading.complete = false
  }
}

const refreshAll = async () => {
  loading.refresh = true
  try {
    await Promise.all([
      fetchPending(),
      fetchMyJobs(),
      fetchCompleted()
    ])
    message.success('🔄 Refreshed')
  } finally {
    loading.refresh = false
  }
}

// ---------------------------
// WATCH TAB
// ---------------------------
watch(activeTab, async (tab) => {
  if (tab === 'pending') await fetchPending()
  else if (tab === 'processing') await fetchMyJobs()
  else if (tab === 'completed') await fetchCompleted()
})

onMounted(refreshAll)
</script>


<template>
  <div class="p-6 lg:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50/50 min-h-screen">
 <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-1 sm:p-0">
  <!-- TITLE -->
  <div class="w-full sm:w-auto">
    <div
      class="!m-0 text-sm sm:text-base md:text-lg flex items-center gap-1.5 sm:gap-2
             text-emerald-800 font-semibold"
    >
      🧾 JAMB Admission Result Notification
      <span
        class="text-[9px] sm:text-xs bg-emerald-100/90 px-1.5 sm:px-2 py-px sm:py-0.5 
               rounded-full text-emerald-700 font-medium shadow-sm"
      >
        {{ pendingJobs.length + myJobs.length + completedJobs.length }}
      </span>
    </div>

    <div
      class="text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-0 block sm:inline text-gray-500"
    >
      Pending → Take → Complete → Track
    </div>
  </div>

  <!-- REFRESH -->
  <Button
    type="primary"
    ghost
    size="small"
    :loading="loading.refresh"
    @click="refreshAll"
    class="!text-xs sm:!text-sm border-emerald-500 text-emerald-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg"
  >
    🔄 Refresh
  </Button>
</div>







    <!-- MAIN CONTENT -->
    <Card class="!shadow-xl !border-emerald-200/50">
      <Tabs v-model:activeKey="activeTab" class="!rounded-2xl overflow-hidden">

        <!-- PENDING -->
        <Tabs.TabPane key="pending" :tab="`🕒 Pending (${pendingJobs.length})`">
          <Table class="green-table" :data-source="pendingJobs" :loading="loading.pending" row-key="id" :scroll="{ x: 1000 }" size="middle">
            <Table.Column title="#" dataIndex="index" width="60">
              <template #default="{ index }">{{ index + 1 }}</template>
            </Table.Column>
            <Table.Column title="Email" dataIndex="email" />
            <Table.Column title="Phone" dataIndex="phone_number" />
            <Table.Column title="Reg No" dataIndex="registration_number" />
            <Table.Column title="Profile Code" dataIndex="profile_code" />
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
                  :loading="loading.take"
                  @click="takeJob(record)"
                >
                  Take Job
                </Button>

              </template>
            </Table.Column>
          </Table>
           <template #tabBarExtraContent>
    <Button
      v-if="activeTab === 'completed'"
      size="small"
      type="primary"
      ghost
      :loading="loading.completed"
      @click="fetchCompleted"
    >
      🔄 Refresh
    </Button>
  </template>
        </Tabs.TabPane>

        <!-- MY JOBS / PROCESSING -->
        <Tabs.TabPane key="processing" :tab="`⏳ Processing (${myJobs.length})`">
          <Table class="green-table" :data-source="myJobs" :loading="loading.processing" row-key="id" :scroll="{ x: 1000 }" size="middle">
            <Table.Column title="#" dataIndex="index" width="60">
              <template #default="{ index }">{{ index + 1 }}</template>
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
            row-key="id"
            :scroll="{ x: 1100 }"
            size="middle"
          >
            <Table.Column title="#" width="60">
              <template #default="{ index }">{{ index + 1 }}</template>
            </Table.Column>

            <!-- CUSTOMER -->
            <Table.Column title="Customer" width="220">
              <template #default="{ record }">
                <div class="font-semibold">{{ record.user?.name }}</div>
                <div class="text-xs text-gray-500">{{ record.user?.email }}</div>
              </template>
            </Table.Column>

            <!-- SERVICE -->
            <Table.Column title="Service" dataIndex="service" />

            <!-- STATUS -->
            <Table.Column title="Status" width="120" align="center">
              <template #default="{ record }">
                <Tag
                  :color="record.status === 'approved' ? 'green' : 'blue'"
                >
                  {{ record.status?.toUpperCase() }}
                </Tag>
              </template>
            </Table.Column>

            <!-- PAYMENT -->
            <Table.Column title="Payment" width="140" align="center">
              <template #default="{ record }">
                <Tag v-if="record.payment?.is_paid" color="green">
                  💰 PAID
                </Tag>
                <Tag v-else color="red">
                  ⏳ UNPAID
                </Tag>
              </template>
            </Table.Column>

            <!-- FILE -->
            <Table.Column title="Result File" width="140" align="center">
              <template #default="{ record }">
                <a
                  href="#"
                  @click.prevent="
                    viewFile(
                      record.id,
                      `/services/jamb-admission-result-notification/${record.id}/download`
                    )
                  "
                >
                  <span v-if="viewingId === record.id">⏳ Opening…</span>
                  <span v-else>📄 View</span>
                </a>
              </template>
            </Table.Column>

            <!-- DATE -->
            <Table.Column title="Processed At" width="180">
              <template #default="{ record }">
                {{ new Date(record.processed_at).toLocaleString() }}
              </template>
            </Table.Column>
          </Table>
        </Tabs.TabPane>


      </Tabs>
    </Card>

    <!-- COMPLETE JOB MODAL -->
    <Modal v-model:open="actionModalVisible" title="Upload Result File" width="500" :footer="null" centered>
      <div class="space-y-4 pt-2">
        <!-- Job Info -->
        <Card size="small" class="!border-blue-200/50 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UploadOutlined class="text-blue-600 text-lg" />
            </div>
            <div>
              <div class="font-semibold text-gray-900">{{ selectedJob?.email }}</div>
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
          <Button block icon="UploadOutlined" size="large">
            Click or drag PDF/Image
          </Button>
        </Upload>



        <!-- Buttons -->
        <div class="flex gap-3">
          <Button block size="large" @click="actionModalVisible = false; fileList = []" class="flex-1 h-12">Cancel</Button>
          <Button
            block
            type="primary"
            size="large"
            :loading="loading.complete"
            :disabled="!fileList.length || loading.complete"
            @click="completeJob"
            class="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            <template v-if="!loading.complete">
              ✅ Complete Job
            </template>
            <template v-else>
              Uploading…
            </template>
          </Button>

        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.job-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4 text-sm;
  box-shadow: none !important;
  border: none !important;
}

.job-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4 border-b border-gray-50;
}

.job-table :deep(.ant-table-row:hover > td) {
  @apply bg-emerald-50/50;
}

.green-table :deep(.ant-table-thead th) {
  background: linear-gradient( #10b981) !important;
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
