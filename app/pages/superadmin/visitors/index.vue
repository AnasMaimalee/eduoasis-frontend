<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'Visitors'
})

import { ref, onMounted } from 'vue'
import { Table, Button, message, Input, Card } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { countries } from '@/utils/countries'

const { $api } = useNuxtApp()

/* =======================
   STATE
======================= */
const visitors = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true
})

/* =======================
   COUNTRY → FLAG MAP
======================= */
const getCountryCode = (country?: string) => {
  if (!country) return null
  return countries[country] || null
}

/* =======================
   TABLE COLUMNS
======================= */
const columns = [
  { title: '#', key: 'index', width: 50, slots: { customRender: 'indexCell' } },
  { title: 'IP Address', key: 'ip', width: 220, slots: { customRender: 'ip' } },
  { title: 'Country', key: 'country', width: 180, slots: { customRender: 'country' } },
  { title: 'City', key: 'city', width: 150, slots: { customRender: 'city' } },
  { title: 'Device', key: 'device', width: 120, slots: { customRender: 'device' } },
  { title: 'Browser', key: 'browser', width: 120, slots: { customRender: 'browser' } },
  { title: 'OS', key: 'os', width: 120, slots: { customRender: 'os' } },
  { title: 'Referrer', key: 'referrer', width: 120, slots: { customRender: 'referrer' } },

  { title: 'Visited At', key: 'created_at', width: 180, slots: { customRender: 'date' } }
]

/* =======================
   FETCH VISITORS
======================= */
const fetchVisitors = async () => {
  loading.value = true
  try {
    const res = await $api('/track-visitor')
    visitors.value = res.data || []
    pagination.value.total = visitors.value.length
  } catch {
    message.error('Failed to fetch visitors')
  } finally {
    loading.value = false
  }
}

onMounted(fetchVisitors)
</script>

<template>
  <div class="p-4 md:p-6 space-y-4 bg-emerald-50 min-h-screen">

    <!-- HEADER -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <div>
        <div class="text-lg md:text-xl font-bold">Visitors Analytics</div>
        <div class="text-xs text-gray-500">
          {{ pagination.total }} total visitors
        </div>
      </div>

      <div class="flex gap-2">
        <Input
          v-model:value="searchText"
          placeholder="Search visitors..."
          size="small"
          class="w-48"
        />
        <Button size="small" @click="fetchVisitors" :loading="loading">
          <ReloadOutlined />
        </Button>
      </div>
    </div>

    <!-- TABLE -->
    <Card class="rounded-xl overflow-hidden">
      <Table
        :columns="columns"
        :data-source="visitors"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        size="small"
        :scroll="{ x: 1100 }"
        class="mobile-table"
      >
        <!-- INDEX -->
        <template #indexCell="{ index }">
          <span class="text-xs font-semibold">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </span>
        </template>

        <!-- IP -->
        <template #ip="{ record }">
          <div class="text-xs font-semibold truncate max-w-[200px]">
            {{ record.ip }}
          </div>
        </template>

        <!-- COUNTRY + FLAG -->
        <template #country="{ record }">
          <div class="flex items-center gap-2 text-xs font-semibold">
            <img
                v-if="getCountryCode(record.country)"
                :src="`https://flagcdn.com/w20/${getCountryCode(record.country)}.png`"
                :alt="record.country"
                class="w-5 h-auto rounded-sm border"
                />

            <span class="text-emerald-600">
              {{ record.country ?? '—' }}
            </span>
          </div>
        </template>

        <!-- CITY -->
        <template #city="{ record }">
          <span class="text-xs">
            {{ record.city ?? '—' }}
          </span>
        </template>

        <!-- DEVICE -->
        <template #device="{ record }">
          <span
            class="px-2 py-0.5 rounded text-xs font-semibold"
            :class="
              record.device === 'Mobile'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-100 text-blue-700'
            "
          >
            {{ record.device }}
          </span>
        </template>

        <!-- BROWSER -->
        <template #browser="{ record }">
          <span class="text-xs font-semibold">
            {{ record.browser }}
          </span>
        </template>

        <!-- OS -->
        <template #os="{ record }">
          <span class="text-xs font-semibold">
            {{ record.os }}
          </span>
        </template>
        <template #referrer="{ record }">
          <span class="text-xs font-semibold">
            {{ record.referrer }}
          </span>
        </template>
        <!-- DATE -->
        <template #date="{ record }">
          <span class="text-xs text-gray-500">
            {{ new Date(record.created_at).toLocaleString() }}
          </span>
        </template>
      </Table>
    </Card>
  </div>
</template>

<style scoped>
.mobile-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !text-xs !font-semibold;
}

.mobile-table :deep(.ant-table-tbody td) {
  @apply !text-xs;
}

.mobile-table :deep(.ant-table-thead > tr > th:first-child) {
  border-top-left-radius: 12px;
}

.mobile-table :deep(.ant-table-thead > tr > th:last-child) {
  border-top-right-radius: 12px;
}
</style>
