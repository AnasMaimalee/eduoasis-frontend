<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['administrator'],
  title: 'Adminisrator Payout'
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
  { title: 'Description', key: 'description', width: 150,slots: { customRender: 'description' } },
  { title: 'Admin Payout', key: 'adminPayout', width: 150, slots: { customRender: 'adminPayout' } },
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
    const res = await $api('/admin/services')
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

const openUpdateModal = (service: any) => {
  currentService.value = { ...service }
  formData.customer_price = service.customer_price || service.price || null
  formData.admin_payout = service.admin_payout || null
  updateModalVisible.value = true
}



onMounted(fetchServices)
</script>

<template>
  <div class="p-6 space-y-6 bg-emerald-50">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <div class="!m-0">Services Management</div>
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
        <div class="flex flex-col sm:flex-row sm:items-center gap-2">
          
          <!-- SEARCH -->
          <Input
            v-model:value="searchText"
            size="small"
            placeholder="Search services"
            class="w-full sm:w-64"
            @input="handleSearchChange"
            @pressEnter="triggerSearch"
            @blur="triggerSearch"
          />

          <!-- REFRESH -->
          <Button
            size="small"
            class="w-full sm:w-auto"
            @click="fetchServices"
            :loading="loading"
          >
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
            <div class="text-xs text-gray-500 truncate max-w-[350px]" :title="record.description">
              {{ record.description }}
            </div>
          </div>
        </template>
        

        <template #adminPayout="{ record }">
          <div class="text-right">
            <div class="text-xl font-black text-emerald-600 mb-1">
              ₦{{ Number(record.admin_payout || 0).toLocaleString() }}
            </div>
            <div class="text-xs text-gray-500 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              Admin
            </div>
          </div>
        </template>
        <template #status="{ record }">

         <div class="text-center">
        <Tag
        :color="record.active ? 'green' : 'red'"
        size="small"
        class="font-semibold uppercase"
        >
        {{ record.active ? 'Active' : 'Inactive' }}
        </Tag>

    </div>
        </template>

      </Table>
    </Card>


  </div>
</template>

<style scoped>
/* ✅ PLAIN HEADER - NO SHADOW, NO GRADIENT */
.service-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4 text-sm;
  box-shadow: none !important;
  border: none;
}

.service-table :deep(.ant-table-thead) {
  box-shadow: none !important;
}

.service-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4 border-b border-gray-50;
}

.service-table :deep(.ant-table-row:hover > td) {
  @apply bg-emerald-50/50;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
