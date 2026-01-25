<script setup lang="ts">
import { useFileDownloader } from '@/composables/useFileDownloader'
const { downloadingId, downloadFile } = useFileDownloader()

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'JAMB Admission Letter'
})

import { ref, onMounted, computed, onUnmounted } from 'vue'
import {
  Table,
  Button,
  Tag,
  message,
  Card,
  Modal,
  Input,
} from 'ant-design-vue'
import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'

const { $api } = useNuxtApp()

/* ================= STATE ================= */
const requests = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')

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
})

/* ================= FILTER ================= */
const filteredRequests = computed(() => {
  if (!searchText.value.trim()) return requests.value
  const q = searchText.value.toLowerCase()
  return requests.value.filter(r =>
    r.user?.name?.toLowerCase().includes(q) ||
    r.email?.toLowerCase().includes(q) ||
    r.service?.name?.toLowerCase().includes(q) ||
    r.registration_number?.toLowerCase().includes(q) ||
    r.status?.toLowerCase().includes(q)
  )
})

/* ================= API ================= */
const fetchRequests = async () => {
  loading.value = true
  try {
    const res = await $api('/services/jamb-admission-letter/all')
    requests.value = Array.isArray(res) ? res : res.data || []
    pagination.value.total = requests.value.length
  } catch {
    message.error('Failed to load requests')
  } finally {
    loading.value = false
  }
}

/* ================= ACTIONS ================= */
const openApproveModal = (id: string) => {
  currentApproveId.value = id
  approveModalVisible.value = true
}

const handleApprove = async () => {
  approveLoading.value = true
  try {
    await $api(`/services/jamb-admission-letter/${currentApproveId.value}/approve`, {
      method: 'POST',
    })
    message.success('Request approved')
    approveModalVisible.value = false
    fetchRequests()
  } finally {
    approveLoading.value = false
  }
}

const openRejectModal = (id: string) => {
  currentRejectId.value = id
  rejectReason.value = ''
  rejectModalVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    return message.error('Rejection reason is required')
  }
  rejectLoading.value = true
  try {
    await $api(`/services/jamb-admission-letter/${currentRejectId.value}/reject`, {
      method: 'POST',
      body: { reason: rejectReason.value },
    })
    message.success('Request rejected')
    rejectModalVisible.value = false
    fetchRequests()
  } finally {
    rejectLoading.value = false
  }
}

const columns = [
  { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' } },
  { title: 'Customer', key: 'user', width: 260, slots: { customRender: 'userCell' } },
  { title: 'Service', key: 'service', width: 280, slots: { customRender: 'serviceCell' } },
  { title: 'Pricing', key: 'pricing', width: 200, slots: { customRender: 'pricingCell' } },
  { title: 'Status', dataIndex: 'status', width: 120, slots: { customRender: 'statusCell' } },
  { title: 'Is Paid?', dataIndex: 'is_paid', width: 100, slots: { customRender: 'isPaidCell' } },
  { title: 'Taken By', key: 'taken', width: 180, slots: { customRender: 'takenCell' } },
  { title: 'Result File', key: 'file', width: 150, slots: { customRender: 'fileCell' } },
  { title: 'Date', dataIndex: 'created_at', width: 170, slots: { customRender: 'dateCell' } },
  { title: 'Actions', key: 'actions', width: 190, slots: { customRender: 'actionsCell' } },
]

let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchRequests()
  refreshInterval = setInterval(fetchRequests, 30000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <div class="p-4 md:p-6 space-y-4 bg-emerald-50">
    <!-- Header -->
    <div>
      <h2 class="text-lg md:text-2xl font-semibold">
        JAMB Admission Letter Requests
      </h2>
      <p class="text-xs md:text-sm text-gray-500">
        {{ filteredRequests.length }} total requests
      </p>
    </div>
<Card class="rounded-t-2xl">
  <!-- Search -->
  <div class="flex gap-2 mb-3 px-2">
    <Input
      v-model:value="searchText"
      placeholder="Search..."
      size="small"
      class="max-w-xs"
    />
    <Button size="small" type="primary" @click="fetchRequests">
      <ReloadOutlined />
    </Button>
  </div>

  <!-- ✅ SCROLL WRAPPER (IMPORTANT) -->
  <div class="overflow-x-auto">
    <Table
      :columns="columns"
      :data-source="filteredRequests"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      :scroll="{ x: 1600 }"
      size="small"
      class="jamb-table w-full"
    >
      <!-- INDEX -->
      <template #indexCell="{ index }">
        <div class="font-semibold text-emerald-600">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </div>
      </template>

      <!-- USER -->
      <template #userCell="{ record }">
        <div>
          <div class="font-semibold">{{ record.user?.name }}</div>
          <div class="text-xs text-gray-500">{{ record.email }}</div>
          <div class="text-xs text-gray-400">{{ record.phone_number }}</div>
        </div>
      </template>

      <!-- SERVICE -->
      <template #serviceCell="{ record }">
        <div>
          <div class="font-semibold">{{ record.service?.name }}</div>
          <div class="text-xs text-gray-500">
            {{ record.registration_number }}
          </div>
        </div>
      </template>

      <!-- PRICING -->
      <template #pricingCell="{ record }">
        <div>
          <div class="font-bold text-emerald-600">
            ₦{{ Number(record.customer_price).toLocaleString() }}
          </div>
          <div class="text-xs text-gray-500">
            Admin: ₦{{ Number(record.admin_payout).toLocaleString() }}
          </div>
        </div>
      </template>

      <!-- STATUS -->
      <template #statusCell="{ record }">
        <Tag
          :color="
            record.status === 'completed' || record.status === 'approved'
              ? 'green'
              : ['processing','proceeding','pending'].includes(record.status)
              ? 'orange'
              : 'red'
          "
        >
          {{ record.status.toUpperCase() }}
        </Tag>
      </template>

      <!-- PAID -->
      <template #isPaidCell="{ record }">
        <Tag :color="record.is_paid ? 'green' : 'red'">
          {{ record.is_paid ? 'PAID' : 'UNPAID' }}
        </Tag>
      </template>

      <!-- TAKEN -->
      <template #takenCell="{ record }">
        <div v-if="record.taken_by">
          <div class="font-semibold text-xs">{{ record.taken_by.name }}</div>
          <div class="text-[11px] text-gray-500">{{ record.taken_by.email }}</div>
        </div>
        <span v-else class="text-gray-400 text-xs">—</span>
      </template>

      <!-- FILE -->
      <template #fileCell="{ record }">
        <Button
          v-if="record.result_file"
          type="primary"
          size="small"
          :loading="downloadingId === record.id"
          @click="downloadFile({
            id: record.id,
            url: `/services/jamb-admission-letter/${record.id}/download`,
            defaultFilename: 'jamb-admission-letter',
          })"
        >
          📥 Download
        </Button>
        <Tag v-else>Not ready</Tag>
      </template>

      <!-- DATE -->
      <template #dateCell="{ record }">
        <span class="text-xs font-mono">
          {{ new Date(record.created_at).toLocaleString() }}
        </span>
      </template>

      <!-- ACTIONS -->
      <template #actionsCell="{ record }">
        <div class="flex gap-1 justify-center whitespace-nowrap">
          <template v-if="record.status === 'completed'">
            <Button size="small" type="primary" @click="openApproveModal(record.id)">
              Approve
              <CheckOutlined />
            </Button>
            <Button size="small" danger @click="openRejectModal(record.id)">
              Reject
              <CloseOutlined />
            </Button>
          </template>

          <CheckOutlined
            v-else-if="record.status === 'approved'"
            class="text-green-500 text-lg"
          />
          <CloseOutlined
            v-else
            class="text-red-500 text-lg"
          />
        </div>
      </template>
    </Table>
  </div>
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
      <p>Are you sure you want to approve this JAMB Admission Letter request?</p>
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
/* TABLE HEADER */
.jamb-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white text-xs md:text-sm;
}

/* TABLE BODY */
.jamb-table :deep(.ant-table-tbody td) {
  @apply !py-2 !px-2 md:!py-3 md:!px-4 text-xs md:text-sm;
}

/* MOBILE BUTTONS */
@media (max-width: 640px) {
  .ant-btn,
  .ant-tag {
    font-size: 11px !important;
    padding: 0 6px !important;
  }
}
</style>

       

