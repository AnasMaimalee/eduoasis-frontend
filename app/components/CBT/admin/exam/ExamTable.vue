<script setup lang="ts">
import { Dropdown, Menu, Tag, Avatar, Table } from 'ant-design-vue'
import {
  EyeOutlined,
  FilePdfOutlined,
  StopOutlined,
  BarChartOutlined,
  MoreOutlined
} from '@ant-design/icons-vue'

defineProps<{
  exams: any[]
}>()

const emit = defineEmits<{
  (e: 'view', exam: any): void
  (e: 'invalidate', exam: any): void
  (e: 'score', exam: any): void
  (e: 'pdf', exam: any): void
}>()
</script>

<template>
  <a-table
    :data-source="exams"
    row-key="id"
    :pagination="{ pageSize: 10 }"
    :scroll="{ x: 900 }"
    class="rounded-xl shadow-sm overflow-hidden live-table"
  >
    <!-- Candidate -->
    <a-table-column key="candidate" title="Candidate">
      <template #default="{ record }">
        <div class="flex items-center gap-3">
          <Avatar class="bg-emerald-600 text-white">
            {{ record.user?.name?.charAt(0) || '?' }}
          </Avatar>

          <div>
            <p class="font-semibold leading-none">
              {{ record.user?.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ record.user?.email }}
            </p>
          </div>
        </div>
      </template>
    </a-table-column>

    <!-- Status -->
    <a-table-column key="status" title="Status">
      <template #default="{ record }">
        <Tag
          :color="record.status === 'submitted' ? 'green' : 'blue'"
          class="capitalize font-medium"
        >
          {{ record.status }}
        </Tag>
      </template>
    </a-table-column>

    <!-- Score -->
    <a-table-column key="score" title="Score">
      <template #default="{ record }">
        <span class="font-bold text-emerald-600">
          {{ record.total_score ?? '—' }}
        </span>
      </template>
    </a-table-column>

    <!-- Date -->
    <a-table-column key="date" title="Taken On">
      <template #default="{ record }">
        {{ new Date(record.created_at).toLocaleString() }}
      </template>
    </a-table-column>

    <!-- Actions -->
    <a-table-column key="actions" align="right">
      <template #default="{ record }">
        <Dropdown :trigger="['hover']" placement="bottomRight">
          <MoreOutlined
            class="text-xl cursor-pointer text-gray-500 hover:text-black transition"
          />

          <template #overlay>
            <Menu class="min-w-[180px]">
              <Menu.Item key="view" @click="emit('view', record)">
                <EyeOutlined />
                <span class="ml-2">View Details</span>
              </Menu.Item>

              <Menu.Item key="score" @click="emit('score', record)">
                <BarChartOutlined />
                <span class="ml-2">Analytics</span>
              </Menu.Item>

              <Menu.Item key="pdf" @click="emit('pdf', record)">
                <FilePdfOutlined />
                <span class="ml-2">Download PDF</span>
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                key="invalidate"
                danger
                @click="emit('invalidate', record)"
              >
                <StopOutlined />
                <span class="ml-2">Invalidate Exam</span>
              </Menu.Item>
            </Menu>
          </template>
        </Dropdown>
      </template>
    </a-table-column>
  </a-table>
</template>

<style scoped>
.live-table :deep(.ant-table-thead > tr > th) {
  background-color: #10b981; /* Emerald green */
  color: #ffffff;             /* White text */
  font-weight: 600;
  text-align: center;
}

.live-table :deep(.ant-table-tbody tr) {
  @apply border-b border-gray-100;
}

.live-table :deep(.ant-table-tbody tr:hover) {
  @apply bg-emerald-50/70 shadow-sm;
}
</style>
