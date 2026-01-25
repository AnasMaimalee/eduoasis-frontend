<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'JAMB Original Result'
})

import { useFileDownloader } from '@/composables/useFileDownloader'
const { downloadingId, downloadFile } = useFileDownloader()
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
let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchRequests()

  // ✅ Auto refresh every 30 seconds
  refreshInterval = setInterval(() => {
    fetchRequests()
  }, 30_000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})
</script>

<template>
  <div class="p-4 sm:p-6 space-y-4 bg-emerald-50">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
      <div>
        <div class="text-lg sm:text-xl font-bold text-gray-800">
          JAMB Result Requests
        </div>
        <div class="text-xs sm:text-sm text-gray-500">
          {{ filteredRequests.length }} total requests
        </div>
      </div>
    </div>

    <!-- Table with Search + Refresh -->
    <Card class="!p-0">
      <!-- Controls -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3">
        <Input
          v-model:value="searchText"
          placeholder="Search requests..."
          size="small"
          class="w-full sm:w-64 text-xs"
        />

        <Button
          type="primary"
          size="small"
          :loading="loading"
          @click="fetchRequests"
        >
          <ReloadOutlined /> Refresh
        </Button>
      </div>

      <!-- Table -->
      <Table
        :columns="columns"
        :data-source="filteredRequests"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        :scroll="{ x: 1600 }"
        size="small"
        class="result-table"
      >
        <!-- Index -->
        <template #indexCell="{ index }">
          <div class="font-semibold text-emerald-600 text-xs">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </div>
        </template>

        <!-- User -->
        <template #userCell="{ record }">
          <div class="text-xs space-y-0.5">
            <div class="font-semibold text-gray-800">
              {{ record.user?.name }}
            </div>
            <div class="text-gray-500 truncate">
              {{ record.email }}
            </div>
            <div class="text-gray-400">
              {{ record.phone_number }}
            </div>
          </div>
        </template>

        <!-- Service -->
        <template #serviceCell="{ record }">
          <div class="text-xs space-y-0.5">
            <div class="font-semibold text-gray-800">
              {{ record.service?.name }}
            </div>
            <div class="text-gray-500">
              {{ record.registration_number }}
            </div>
          </div>
        </template>

        <!-- Pricing -->
        <template #pricingCell="{ record }">
          <div class="text-right text-xs">
            <div class="font-bold text-emerald-600">
              ₦{{ Number(record.customer_price).toLocaleString() }}
            </div>
            <div class="text-gray-500">
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
            class="!text-xs !px-2 !py-0.5 font-semibold"
          >
            {{ record.status.toUpperCase() }}
          </Tag>
        </template>

        <!-- Is Paid -->
        <template #isPaidCell="{ record }">
          <Tag
            :color="record.is_paid ? 'green' : 'red'"
            class="!text-xs !px-2 !py-0.5 font-semibold"
          >
            {{ record.is_paid ? 'PAID' : 'UNPAID' }}
          </Tag>
        </template>

        <!-- Taken By -->
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

        <!-- File -->
        <template #fileCell="{ record }">
          <Button
            v-if="record.result_file"
            type="primary"
            size="small"
            class="!text-xs"
            :loading="downloadingId === record.id"
            @click="downloadFile({ 
              id: record.id,
              url: `/services/jamb-result/${record.id}/download`,
              defaultFilename: 'jamb-result',
              successMessage: 'Admission Result downloaded',
            })"
          >
            📥 Download
          </Button>
          <span v-else class="text-xs text-gray-400">No file</span>
        </template>

        <!-- Date -->
        <template #dateCell="{ record }">
          <span class="text-xs font-mono">
            {{ new Date(record.created_at).toLocaleString() }}
          </span>
        </template>

        <!-- Actions -->
        <template #actionsCell="{ record }">
          <div class="flex justify-center gap-1">
            <template v-if="record.status === 'completed'">
              <Button
                type="primary"
                size="small"
                class="!text-xs"
                :loading="approveLoading"
                @click="openApproveModal(record.id)"
              >Approve
                <CheckOutlined />
              </Button>

              <Button
                danger
                size="small"
                class="!text-xs"
                :loading="rejectLoading"
                @click="openRejectModal(record.id)"
              > Reject
                <CloseOutlined />
              </Button>
            </template>

            <CheckOutlined
              v-else-if="record.status === 'approved'"
              class="text-green-500 text-base"
            />
            <CloseOutlined
              v-else
              class="text-red-500 text-base"
            />
          </div>
        </template>
      </Table>
    </Card>

    <!-- Approve Modal -->
    <Modal
      v-model:visible="approveModalVisible"
      title="Confirm Approval"
      ok-text="Approve"
      cancel-text="Cancel"
      :ok-button-props="{ loading: approveLoading }"
      @ok="handleApprove"
    >
      <p class="text-sm">
        Are you sure you want to approve this request?
      </p>
      <p class="text-xs text-gray-500 mt-2">
        This action cannot be undone.
      </p>
    </Modal>

    <!-- Reject Modal -->
    <Modal
      v-model:visible="rejectModalVisible"
      title="Reject Request"
      ok-text="Reject"
      cancel-text="Cancel"
      :ok-button-props="{ loading: rejectLoading }"
      @ok="handleReject"
    >
      <p class="text-sm mb-2">
        Provide a rejection reason:
      </p>
      <Input.TextArea
        v-model:value="rejectReason"
        rows="4"
        placeholder="Enter reason..."
        class="text-xs"
      />
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
