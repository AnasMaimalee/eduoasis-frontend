<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin']
})

import { ref, onMounted, reactive } from 'vue'
import { Table, Button, Tag, message, Typography, Input, Card, Modal, InputNumber } from 'ant-design-vue'
import { ReloadOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons-vue'

const { $api } = useNuxtApp()

const services = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const updateModalVisible = ref(false)
const currentService = ref<any>(null)

    const columns = [
  { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' } },
  { title: 'Service Name', dataIndex: 'name', key: 'name', slots: { customRender: 'name' }, width: 400 },
  { title: 'Customer Price', key: 'customerPrice', width: 180, align: 'right', slots: { customRender: 'customerPrice' } },
  { title: 'Admin Payout', key: 'adminPayout', width: 150, align: 'right', slots: { customRender: 'adminPayout' } },
  { title: 'Action', key: 'actions', width: 150, slots: { customRender: 'actions' } }
]

// Form state
const formData = reactive({
  customer_price: null as number | null,
  admin_payout: null as number | null
})

const pagination = ref({
  current: 1,
  pageSize: 15,
  total: 0,
  pageSizeOptions: ['10', '20', '50'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} of ${total} services`
})

const fetchServices = async () => {
  loading.value = true
  try {
    const params = { search: searchText.value || undefined }
    const res = await $api('/superadmin/services', { params })
    services.value = res.data || []
    pagination.value.total = services.value.length
  } finally {
    loading.value = false
  }
}

const openUpdateModal = (service: any) => {
  currentService.value = service
  formData.customer_price = service.customer_price || service.price || null
  formData.admin_payout = service.admin_payout || null
  updateModalVisible.value = true
}

const handleUpdate = async () => {
  if (!formData.customer_price && !formData.admin_payout) {
    message.error('Please enter at least one price')
    return
  }

  try {
    const payload: any = {}
    if (formData.customer_price) payload.customer_price = formData.customer_price
    if (formData.admin_payout) payload.admin_payout = formData.admin_payout

    await $api(`/services/${currentService.value.id}/update-prices`, {
      method: 'PUT',
      body: payload
    })
    
    message.success('Service updated successfully!')
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
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <Typography.Title level={2} class="!m-0 mb-1">Services</Typography.Title>
        <Typography.Text type="secondary">{{ pagination.total }} total services</Typography.Text>
      </div>
      <Button type="primary" @click="fetchServices" :loading="loading" icon="ReloadOutlined">
        Refresh
      </Button>
    </div>

    <!-- Search -->
    <Card>
      <Input.Search
        v-model:value="searchText"
        placeholder="Search services..."
        @search="fetchServices"
        size="large"
        style="width: 100%; max-width: 400px;"
      />
    </Card>

    <!-- Table -->
    <!-- Table -->
<Card>
  <Table
    :columns="columns"
    :data-source="services"
    :loading="loading"
    :pagination="pagination"
    row-key="id"
    :scroll="{ x: 1200 }"
    class="service-table"
  >
    <template #indexCell="{ index }">
  <div class="font-bold text-blue-600">{{ index + 1 }}</div>
</template>

<template #name="{ record }">
  <div>
    <div class="font-semibold">{{ record.name }}</div>
    <div class="text-sm text-gray-500">{{ record.description }}</div>
  </div>
</template>

<!-- ✅ GREEN DEBIT STYLE FOR BOTH PRICES -->
<template #customerPrice="{ record }">
  <div class="text-right font-black text-2xl text-green-600 mb-1">
    ₦{{ Number(record.customer_price || record.price).toLocaleString() }}
  </div>
  <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block w-fit">
    Customer Price
  </div>
</template>

<template #adminPayout="{ record }">
  <div class="text-right font-black text-2xl text-green-600 mb-1">
    ₦{{ Number(record.admin_payout || 0).toLocaleString() }}
  </div>
  <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block w-fit">
    Admin Payout
  </div>
</template>


    <template #actions="{ record }">
      <Button 
        type="primary" 
        size="small"
        @click="openUpdateModal(record)"
        class="shadow-md hover:shadow-lg font-medium"
      >
        Update Prices
      </Button>
    </template>
  </Table>
</Card>


    <!-- Update Modal -->
    <Modal 
      v-model:visible="updateModalVisible"
      title="Update Service Prices"
      @ok="handleUpdate"
      @cancel="resetForm"
      ok-button-props="{ disabled: !formData.customer_price && !formData.admin_payout }"
    >
      <div v-if="currentService" class="space-y-6">
        <div>
          <div class="font-bold text-lg mb-1">{{ currentService.name }}</div>
          <div class="text-gray-600">{{ currentService.description }}</div>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Customer Price</label>
            <InputNumber 
              v-model:value="formData.customer_price"
              :min="0"
              :precision="0"
              :formatter="value => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="value => value?.replace(/₦\s?(\d+)/, '$1') || ''"
              size="large"
              style="width: 100%"
              placeholder="Enter customer price"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Admin Payout</label>
            <InputNumber 
              v-model:value="formData.admin_payout"
              :min="0"
              :precision="0"
              :formatter="value => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="value => value?.replace(/₦\s?(\d+)/, '$1') || ''"
              size="large"
              style="width: 100%"
              placeholder="Enter admin payout (optional)"
            />
          </div>
        </div>

        <div class="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
          💡 Update either field or both. Unchanged fields will keep current values.
        </div>
      </div>
    </Modal>
  </div>
</template>



<style scoped>
.service-table :deep(.ant-table-thead th) {
  @apply bg-gray-50 font-bold border-b-2 border-gray-200;
}

.service-table :deep(.ant-table-row:hover) {
  @apply bg-gray-50 border-l-4 border-blue-400;
}
</style>
