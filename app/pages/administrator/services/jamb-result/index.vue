<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Table, Tag, Tabs, Button } from 'ant-design-vue'
import ServiceJobsTable from '@/components/ServiceJobsTable.vue'
import UploadResultModal from '@/components/UploadResultModal.vue'
import { useServiceJobs } from '@/composables/useServiceJobs'
import { useFileViewer } from '@/composables/useFileViewer'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['administrator'],
  title: 'JAMB Result'
})

const { viewFile } = useFileViewer()

// ✅ CORRECT DESTRUCTURING - matches your composable exactly
const {
  pendingJobs,
  processingJobs,
  completedJobs,
  loading,
  takingJobId,        // ✅ This exists
  activeTab,
  selectedJob,
  fileList,
  refreshAll,
  takeJob,
  completeJob,
  beforeUpload
} = useServiceJobs('jamb-result')

// ✅ Rest of your code unchanged
const modalOpen = ref(false)

function openCompleteModal(job: any) {
  selectedJob.value = job
  modalOpen.value = true
}

async function handleComplete() {
  const ok = await completeJob()
  if (ok) {
    modalOpen.value = false
    fileList.value = []
    selectedJob.value = null
    refreshAll()
  }
}

function handleClear() {
  fileList.value = []
  selectedJob.value = null
}

let interval: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  refreshAll()
  interval = setInterval(() => {
    if (!modalOpen.value) refreshAll()
  }, 30000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

watch(modalOpen, (open) => {
  if (!open) {
    handleClear()
  }
})
</script>


<template>
  <div class="p-6 space-y-8 bg-emerald-50">
    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-1 sm:p-0">
      <div class="w-full sm:w-auto">
        <div class="!m-0 text-lg font-semibold flex items-center gap-2 text-emerald-800">
          🧾 JAMB Original Result
          <span class="text-xs bg-emerald-100/90 px-2 py-0.5 rounded-full text-emerald-700 font-medium shadow-sm">
            {{ pendingJobs.length + processingJobs.length + completedJobs.length }}
          </span>
        </div>
        <div class="text-sm text-gray-500 mt-1">
          Pending → Take → Complete → Track
        </div>
      </div>

      <Button
        type="primary"
        ghost
        size="small"
        :loading="loading.refresh"
        @click="refreshAll"
        class="border-emerald-500 text-emerald-700 px-4 py-2 rounded-lg"
      >
        🔄 Refresh
      </Button>
    </div>

    <!-- TABS -->
    <Tabs v-model:activeKey="activeTab">
     <!-- PENDING TAB - NO MORE RED UNDERLINE! -->
      <Tabs.TabPane key="pending" :tab="`🕒 Pending (${pendingJobs.length})`">
       <ServiceJobsTable
          type="pending"
          :jobs="pendingJobs"
          :loading="loading.pending"
          :takingJobId="takingJobId"
          @take="takeJob"
        />
      </Tabs.TabPane>



      <Tabs.TabPane key="processing" :tab="`⏳ Processing (${processingJobs.length})`">
        <ServiceJobsTable
          type="processing"
          :jobs="processingJobs"
          :loading="loading.processing"
          @complete="openCompleteModal"
        />
      </Tabs.TabPane>

      <Tabs.TabPane key="completed" :tab="`✅ Completed (${completedJobs.length})`">
        <Table
          class="green-table"
          :data-source="completedJobs"
          :loading="loading.completed"
          row-key="id"
          :scroll="{ x: 1100 }"
        >
          <Table.Column title="#" width="60">
            <template #default="{ index }">{{ index + 1 }}</template>
          </Table.Column>

          <Table.Column title="Customer" width="220">
            <template #default="{ record }">
              <div class="font-semibold">{{ record.user?.name || record.email }}</div>
              <div class="text-xs text-gray-500">{{ record.user?.email || record.email }}</div>
            </template>
          </Table.Column>

          <Table.Column title="Service" dataIndex="service" />

          <Table.Column title="Status" width="120" align="center">
            <template #default="{ record }">
              <Tag :color="record.status === 'approved' ? 'green' : 'blue'">
                {{ record.status?.toUpperCase() }}
              </Tag>
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
              <a
                href="#"
                @click.prevent="viewFile(record.id, `/services/jamb-result/${record.id}/download`)"
              >
                📄 View
              </a>
            </template>
          </Table.Column>

          <Table.Column title="Processed At" width="180">
            <template #default="{ record }">
              {{ new Date(record.processed_at).toLocaleString() }}
            </template>
          </Table.Column>
        </Table>
      </Tabs.TabPane>
    </Tabs>

    <!-- MODAL -->
    <UploadResultModal
      v-model:open="modalOpen"
      :job="selectedJob"
      v-model:fileList="fileList"
      :loading="loading.complete"
      :beforeUpload="beforeUpload"
      serviceLabel="JAMB Result"
      @complete="handleComplete"
      @clear="handleClear"
    />
  </div>
</template>

<style scoped>
.green-table :deep(.ant-table-thead th) {
  background: linear-gradient(#10b981);
  color: white;
  font-weight: 600;
  border: none;
}

.green-table :deep(.ant-table-tbody td) {
  padding: 12px;
}

.green-table :deep(.ant-table-row:hover td) {
  background-color: #ecfdf5;
}
</style>
