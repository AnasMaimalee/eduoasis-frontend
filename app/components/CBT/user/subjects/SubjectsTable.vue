<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Table, Input, Button, message, Tag } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import StatusTag from './StatusTag.vue'

const { $api } = useNuxtApp()

const subjects = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')

const fetchSubjects = async () => {
  loading.value = true
  try {
    const res = await $api('/cbt/subjects')
    subjects.value = res.data || []
  } catch {
    message.error('Failed to load subjects')
  } finally {
    loading.value = false
  }
}

const filteredSubjects = computed(() => {
  if (!searchText.value.trim()) return subjects.value
  const q = searchText.value.toLowerCase()
  return subjects.value.filter(s =>
    s.name?.toLowerCase().includes(q) ||
    s.slug?.toLowerCase().includes(q)
  )
})

// ✅ TOTAL COUNT (SMART)
const totalCount = computed(() => filteredSubjects.value.length)

// ✅ PERFECT NUMBERING
const getIndex = (index: number) => index + 1

onMounted(fetchSubjects)
</script>

<template>
  <div>

    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">

      <!-- SEARCH -->
      <Input
        v-model:value="searchText"
        placeholder="Search subjects..."
        allow-clear
        class="w-full sm:w-64"
      />

      <!-- ACTIONS -->
      <div class="flex items-center gap-2">
        <!-- TOTAL COUNT -->
        <Tag color="green" class="!text-xs sm:!text-sm">
          Total: {{ totalCount }}
        </Tag>

        <!-- REFRESH -->
        <Button
          type="primary"
          ghost
          size="middle"
          :loading="loading"
          @click="fetchSubjects"
          class="flex items-center gap-1"
        >
          <ReloadOutlined />
          Refresh
        </Button>
      </div>
    </div>

    <!-- TABLE -->
    <Table
      :data-source="filteredSubjects"
      row-key="id"
      :loading="loading"
      :scroll="{ x: 600 }"
      class="modern-table"
      bordered
      size="middle"
      :pagination="{ pageSize: 20, showQuickJumper: true }"
    >
      <!-- INDEX -->
      <Table.Column title="#" width="60" align="center">
        <template #default="{ index }">
          <span class="font-semibold text-gray-700">
            {{ getIndex(index) }}
          </span>
        </template>
      </Table.Column>

      <!-- NAME -->
      <Table.Column title="Name" dataIndex="name" />

      <!-- SLUG -->
      <Table.Column title="Slug" dataIndex="slug" />

      <!-- STATUS -->
      <Table.Column title="Status" width="120" align="center">
        <template #default="{ record }">
          <StatusTag :status="record.status" />
        </template>
      </Table.Column>
    </Table>

  </div>
</template>

<style scoped>
/* ✅ MODERN CLEAN TABLE */
.modern-table :deep(.ant-table) {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #d1d5db;
}

.modern-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4 text-sm uppercase tracking-wide;
  border-bottom: none;
}

.modern-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4;
  border-bottom: 1px solid #e5e7eb;
}

.modern-table :deep(.ant-table-tbody tr:hover > td) {
  @apply bg-emerald-50;
}

/* MOBILE EDGE FIX */
@media (max-width: 640px) {
  .modern-table :deep(.ant-table-container) {
    margin-left: -4px;
    margin-right: -4px;
  }
}
</style>
