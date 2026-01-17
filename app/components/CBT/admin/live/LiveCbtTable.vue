<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue'
import { 
  Table, 
  Tag, 
  Button, 
  Progress, 
  Tooltip, 
  Badge, 
  Card 
} from 'ant-design-vue'
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  ReloadOutlined 
} from '@ant-design/icons-vue'

const props = defineProps<{
  sessions: any[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

// ✅ Memoized computed to prevent re-renders
const tableData = computed(() => props.sessions || [])

const getStatusColor = (status: string) => {
  return status === 'ongoing' ? 'green' : 'default'
}

const getProgress = (startedAt: string, endsAt: string) => {
  try {
    const now = Date.now()
    const start = new Date(startedAt).getTime()
    const end = new Date(endsAt).getTime()
    const total = end - start
    const elapsed = Math.max(0, now - start)
    return Math.min((elapsed / total) * 100, 100)
  } catch {
    return 0
  }
}

const formatTimeAgo = (dateString: string) => {
  return dateString ? new Date(dateString).toLocaleString() : 'Never'
}

const refreshData = () => {
  emit('refresh')
}
</script>

<template>
  <Card class="live-session-card p-4">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
        📊 Ongoing Sessions ({{ tableData.length }})
      </h3>
      <Button type="primary" @click="refreshData" size="large" ghost>
        <ReloadOutlined /> Refresh
      </Button>
    </div>

    <Table
      :data-source="tableData"
      row-key="id"
      :scroll="{ x: 1200 }"
      :pagination="{ pageSize: 10, showSizeChanger: true }"
      class="live-table"
      :loading="tableData.length === 0"
    >
      <Table.Column title="#" width="10" align="center" fixed="left">
        <template #default="{ index }">
          <span class="font-bold text-emerald-600">{{ index + 1 }}</span>
        </template>
      </Table.Column>

      <Table.Column title="Student" width="280" fixed="left">
        <template #default="{ record }">
          <div class="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-50">
            <div class="w-12 h-12  bg-emerald-600 rounded-full flex items-center justify-center shadow-md">
              <UserOutlined class="text-white text-xl" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-bold text-sm text-gray-900 truncate" :title="record.user?.name">
                {{ record.user?.name || 'Unknown User' }}
              </div>
              <div class="text-xs text-gray-500 truncate" :title="record.user?.email">
                {{ record.user?.email || '-' }}
              </div>
            </div>
          </div>
        </template>
      </Table.Column>

      <Table.Column title="Progress" width="520">
        <template #default="{ record }">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-700">Exam Timer</span>
              <Badge 
                :count="getProgress(record.started_at, record.ends_at).toFixed(0) + '%'" 
                class="custom-badge"
              />
            </div>
            <Progress 
              :percent="getProgress(record.started_at, record.ends_at)" 
              status="active" 
              :stroke-color="{
                '0%': '#10b981', 
                '50%': '#f59e0b', 
                '100%': '#ef4444'
              }"
              :stroke-width="8"
              show-info
            />
            <div class="flex text-xs font-medium text-gray-600 justify-between">
              <span>{{ new Date(record.started_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
              <span class="font-bold text-emerald-600">
                {{ new Date(record.ends_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
              </span>
            </div>
          </div>
        </template>
      </Table.Column>

      <Table.Column title="Status" width="120" align="center">
        <template #default="{ record }">
          <Tag :color="getStatusColor(record.status)" class="text-base font-bold px-4 py-2">
            {{ record.status?.toUpperCase() || 'UNKNOWN' }}
          </Tag>
        </template>
      </Table.Column>

      <Table.Column title="Session Info" width="220">
        <template #default="{ record }">
          <div class="space-y-1 text-sm">
            <div><span class="font-semibold text-gray-600">ID:</span> {{ record.id.slice(-8) }}</div>
            <div><span class="font-semibold text-gray-600">Started:</span> {{ new Date(record.started_at).toLocaleDateString() }}</div>
          </div>
        </template>
      </Table.Column>

      <Table.Column title="Last Seen" width="180">
        <template #default="{ record }">
          <Tooltip :title="record.last_seen_at ? formatTimeAgo(record.last_seen_at) : 'Never seen'">
            <div class="text-sm font-medium text-gray-700">
              <span v-if="record.last_seen_at" class="text-emerald-600">
                {{ new Date(record.last_seen_at || 0).toLocaleString() }}
              </span>
              <span v-else class="text-orange-500 flex items-center gap-1">
                <ClockCircleOutlined /> Never
              </span>
            </div>
          </Tooltip>
        </template>
      </Table.Column>

      <Table.Column title="Actions" width="140" align="center" fixed="right">
        <template #default="{ record }">
          <div class="flex gap-1 justify-center">
            <Button size="small" type="primary" ghost>View</Button>
            <Button size="small" danger>End</Button>
          </div>
        </template>
      </Table.Column>
    </Table>
  </Card>
</template>

<style scoped>
.custom-badge :deep(.ant-badge-count) {
  @apply bg-emerald-500 border-emerald-500 text-white font-bold;
}


.live-table :deep(.ant-table-tbody tr) {
  @apply border-b border-gray-100;
}

.live-table :deep(.ant-table-tbody tr:hover) {
  @apply bg-emerald-50/70 shadow-sm;
}

.live-session-card :deep(.ant-card-body) {
  @apply p-0;
}

.live-session-card :deep(.ant-card) {
  @apply shadow-xl border-emerald-200;
}

.live-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4 text-sm;
}

.live-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4;
}

.live-table :deep(.ant-table-row:hover > td) {
  @apply bg-emerald-50;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>