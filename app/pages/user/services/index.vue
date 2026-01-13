<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user']
})

import { ref, onMounted, reactive, nextTick } from 'vue'
import { Table, Button, message, Typography, Input, Card, Modal, InputNumber, Tag } from 'ant-design-vue'
import { ReloadOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons-vue'

const { $api } = useNuxtApp()

const allServices = ref<any[]>([])      
const services = ref<any[]>([])         
const loading = ref(false)
const searchText = ref('')
const updateModalVisible = ref(false)
const currentService = ref<any>(null)

const columns = [
  { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' } },
  { title: 'Service Name', dataIndex: 'name', key: 'name', slots: { customRender: 'name' }, width: 400 },
  { title: 'Description', key: 'description', width: 150, align: 'right', slots: { customRender: 'description' } },
  { title: 'Price', key: 'price', width: 150, align: 'right', slots: { customRender: 'price' } },
  { title: 'Status', key: 'status', width: 150, align: 'center', slots: { customRender: 'status' } },
]


const formData = reactive({
  customer_price: null as number | null,
  admin_payout: null as number | null
})

const pagination = ref({
  current: 1,
  pageSize: 50,
  total: 0,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} of ${total} services`
})

const fetchServices = async () => {
  loading.value = true
  try {
    const res = await $api('/services')
    allServices.value = res.data || []
    applyFilters()
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to fetch services')
    allServices.value = []
    services.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  let filtered = [...allServices.value]
  
  if (searchText.value.trim()) {
    const query = searchText.value.toLowerCase().trim()
    filtered = filtered.filter(service =>
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query)
    )
  }
  
  pagination.value.total = filtered.length
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  services.value = filtered.slice(start, end)
}

const handleSearchChange = (e: any) => {
  searchText.value = e.target.value
}

const triggerSearch = () => {
  pagination.value.current = 1
  applyFilters()
}

const handleTableChange = (paginationConfig: any) => {
  pagination.value.current = paginationConfig.current
  pagination.value.pageSize = paginationConfig.pageSize
  applyFilters()
}

onMounted(fetchServices)
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <Typography.Title level="3" class="!m-0">Services Management</Typography.Title>
        <Typography.Text type="secondary">{{ pagination.total }} total services</Typography.Text>
      </div>
     
    </div>

    <!-- ✅ TABLE WITH BUILT-IN SEARCH + REFRESH -->
    <Card>
      <Table
        :columns="columns"
        :data-source="services"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
        :scroll="{ x: 1200 }"
        size="middle"
        class="service-table"
      >
        <!-- ✅ TABLE TITLE WITH SEARCH + REFRESH -->
        <template #title>
          <div class="flex flex-wrap items-center gap-3 p-4 pb-2">
            <Input 
              v-model:value="searchText"
              size="large"
              placeholder="Search services by name/description... (Enter to search)"
              class="flex-1 min-w-[250px] max-w-[400px]"
              @input="handleSearchChange"
              @pressEnter="triggerSearch"
              @blur="triggerSearch"
            />
            <Button size="large" @click="fetchServices" :loading="loading">
              <ReloadOutlined /> Refresh
            </Button>
          </div>
        </template>

        <template #emptyText>
          <div class="text-center py-8">
            <div class="text-lg font-semibold text-gray-600 mb-1">No services found</div>
            <div v-if="searchText" class="text-sm text-gray-500 mb-4">
              No services match "<strong>{{ searchText }}</strong>"
            </div>
            <div v-else class="text-sm text-gray-500 mb-4">
              Services will appear here when added to the system
            </div>
            <Button type="primary" @click="fetchServices">
              <ReloadOutlined /> Load Services
            </Button>
          </div>
        </template>

        <template #indexCell="{ index }">
          <div class="font-semibold text-emerald-600">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </div>
        </template>

        <template #name="{ record }">
          <div>
            <div class="font-semibold text-gray-900 text-sm">{{ record.name }}</div>
            <div class="text-xs text-gray-500 truncate max-w-[350px]" :title="record.description">
              {{ record.description }}
            </div>
          </div>
        </template>
        <template #description="{ record }">
          <div>
            <div class="text-xl truncate max-w-[350px]" :title="record.description">
              {{ record.description }}
            </div>
          </div>
        </template>
        

        <template #price="{ record }">
          <div class="text-right">
            <div class="text-xl font-black text-emerald-600 mb-1">
              ₦{{ Number(record.price || 0).toLocaleString() }}
            </div>
            
          </div>
        </template>
        <template #status="{ record }">

         <div class="text-center">
        <Tag
        :color="record.active ? 'green' : 'green'"
        size="small"
        class="font-semibold uppercase"
        >
        {{ record.active ? 'Active' : 'Active' }}
        </Tag>

    </div>
        </template>

      </Table>
    </Card>


  </div>
</template>

<style scoped>
/* ✅ PLAIN HEADER - NO SHADOW, NO GRADIENT */
.service-table :deep(.ant-table) {
  @apply border border-emerald-200/30 rounded-xl overflow-hidden;
}

.service-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-bold !py-4 !px-6 text-sm uppercase tracking-wide border-none;
}

.service-table :deep(.ant-table-thead) {
  @apply border-b-0;
}

.service-table :deep(.ant-table-tbody td) {
  @apply !py-4 !px-6 border-b border-gray-100/50;
}

.service-table :deep(.ant-table-tbody tr:hover > td) {
  @apply bg-emerald-50/70;
}

.service-table :deep(.ant-table-tbody tr:last-child td) {
  @apply border-b-0;
}

.half-screen-modal :deep(.ant-modal) {
  max-width: 50vw !important;
  width: 50vw !important;
}

.half-screen-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  border: 1px solid #d1d5db;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
</style>
