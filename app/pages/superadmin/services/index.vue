<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'JAMB Services'
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
  { title: '#', key: 'index', width: 50, slots: { customRender: 'indexCell' } },
  { title: 'Service Name', dataIndex: 'name', key: 'name', slots: { customRender: 'name' }, width: 300 },
  { title: 'Customer Price', key: 'customerPrice', slots: { customRender: 'customerPrice' } },
  { title: 'Admin Payout', key: 'adminPayout', slots: { customRender: 'adminPayout' } },
  { title: 'Platform Profit', key: 'platformProfit', slots: { customRender: 'platformProfit' } },
  { title: '', key: 'actions', width: 80, slots: { customRender: 'actions' }, fixed: 'right' }
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
    const res = await $api('/superadmin/services')
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

const handleUpdate = async () => {
  if (formData.customer_price === null && formData.admin_payout === null) {
    message.error('Please enter at least one price')
    return
  }

  try {
    const payload: any = {}
    if (formData.customer_price !== null) payload.customer_price = formData.customer_price
    if (formData.admin_payout !== null) payload.admin_payout = formData.admin_payout

    await $api(`/services/${currentService.value.id}/update-prices`, {
      method: 'PUT',
      body: payload
    })
    
    message.success('✅ Service updated successfully!')
    updateModalVisible.value = false
    fetchServices()
  } catch (err: any) {
    message.error(err.data?.message || 'Update failed')
  }
}

const resetForm = () => {
  formData.customer_price = null
  formData.admin_payout = null
  currentService.value = null
}

onMounted(fetchServices)
</script>

<template>
  <div class="p-6 space-y-6 bg-emerald-50">
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
        class="status-table"
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
            <Tag v-if="record.active" color="green" size="small" class="mt-1">Active</Tag>
          </div>
        </template>

        <!-- ✅ ALL MONEY GREEN -->
        <template #customerPrice="{ record }">
          <div class="">
            <div class="text-xl font-black text-emerald-600 mb-1">
              ₦{{ Number(record.customer_price || record.price || 0).toLocaleString() }}
            </div>
            <div class="text-xs text-gray-500 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              Customer
            </div>
          </div>
        </template>

        <template #adminPayout="{ record }">
          <div class="">
            <div class="text-xl font-black text-emerald-600 mb-1">
              ₦{{ Number(record.admin_payout || 0).toLocaleString() }}
            </div>
            <div class="text-xs text-gray-500 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              Admin
            </div>
          </div>
        </template>

        <template #platformProfit="{ record }">
          <div class="">
            <div class="text-xl font-black text-emerald-600 mb-1">
              ₦{{ Number(record.platform_profit || 0).toLocaleString() }}
            </div>
            <div class="text-xs text-gray-500 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              Platform
            </div>
          </div>
        </template>

        <template #actions="{ record }">
          <Button 
            type="text" 
            size="small" 
            shape="circle" 
            class="!w-8 !h-8 !p-0 hover:bg-emerald-100 rounded-full"
            @click="openUpdateModal(record)"
          >
            <EditOutlined class="text-emerald-600" />
          </Button>
        </template>
      </Table>
    </Card>

    <!-- ✅ UPDATE MODAL -->
    <Modal 
      v-model:visible="updateModalVisible"
      title="Update Service Prices" 
      :width="420" 
      :footer="null"
      :closable="false"
    >
      <div v-if="currentService" class="p-4 space-y-4">
        <div class="text-center py-3 border-b border-gray-100">
          <div class="font-bold text-lg truncate mb-1">{{ currentService.name }}</div>
          <div class="text-xs text-gray-500 truncate">{{ currentService.description }}</div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium mb-1 text-gray-700">Customer Price</label>
            <div class="text-xs text-gray-400 mb-1">What customers pay</div>
            <InputNumber 
              v-model:value="formData.customer_price"
              :min="0" 
              :precision="0" 
              size="small"
              class="w-full" 
              placeholder="₦0"
            />
          </div>

          <div>
            <label class="block text-xs font-medium mb-1 text-gray-700">Admin Payout</label>
            <div class="text-xs text-gray-400 mb-1">What admins receive</div>
            <InputNumber 
              v-model:value="formData.admin_payout"
              :min="0" 
              :precision="0" 
              size="small"
              class="w-full" 
              placeholder="₦0"
            />
          </div>
        </div>

        <div class="text-xs text-gray-500 bg-emerald-50 p-3 rounded-lg text-center font-medium">
          💡 Update either or both prices. Platform profit auto-calculates.
        </div>

        <div class="flex gap-2 pt-2">
          <Button 
            size="small" 
            block 
            @click="resetForm(); updateModalVisible = false" 
            class="text-xs h-8"
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            size="small" 
            block
            :loading="loading"
            :disabled="formData.customer_price === null && formData.admin_payout === null"
            @click="handleUpdate" 
            class="text-xs h-8"
          >
            💰 Update Prices
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
/* ✅ PLAIN HEADER - NO SHADOW, NO GRADIENT */
/* ✅ GREEN EMERALD HEADER */
.status-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4 text-sm;
}

.status-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4;
}

.status-table :deep(.ant-table-row:hover > td) {
  @apply bg-emerald-50;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
/* ✅ Rounded table header corners */
.status-table :deep(.ant-table-thead > tr > th:first-child) {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.status-table :deep(.ant-table-thead > tr > th:last-child) {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}
.status-table :deep(.ant-table-thead > tr > th) {
  border-right: none !important;
}

</style>
