<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'JAMB Services'
})

import { ref, onMounted, reactive } from 'vue'
import { Table, Button, message, Input, Card, Modal, InputNumber, Tag } from 'ant-design-vue'
import { ReloadOutlined, EditOutlined } from '@ant-design/icons-vue'

const { $api } = useNuxtApp()

const allServices = ref<any[]>([])
const services = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const updateModalVisible = ref(false)
const currentService = ref<any>(null)

const columns = [
  { title: '#', key: 'index', width: 50, slots: { customRender: 'indexCell' } },
  { title: 'Service', dataIndex: 'name', key: 'name', width: 280, slots: { customRender: 'name' } },
  { title: 'Customer', key: 'customerPrice', width: 150, slots: { customRender: 'customerPrice' } },
  { title: 'Admin', key: 'adminPayout', width: 150, slots: { customRender: 'adminPayout' } },
  { title: 'Profit', key: 'platformProfit', width: 150, slots: { customRender: 'platformProfit' } },
  { title: '', key: 'actions', width: 70, slots: { customRender: 'actions' } }
]

const formData = reactive({
  customer_price: null as number | null,
  admin_payout: null as number | null
})

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true
})

const fetchServices = async () => {
  loading.value = true
  try {
    const res = await $api('/superadmin/services')
    allServices.value = res.data || []
    applyFilters()
  } catch {
    message.error('Failed to fetch services')
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  let filtered = [...allServices.value]

  if (searchText.value.trim()) {
    const q = searchText.value.toLowerCase()
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    )
  }

  pagination.value.total = filtered.length
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  services.value = filtered.slice(start, start + pagination.value.pageSize)
}

const handleTableChange = (p: any) => {
  pagination.value.current = p.current
  pagination.value.pageSize = p.pageSize
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
    message.error('Enter at least one value')
    return
  }

  const payload: any = {}
  if (formData.customer_price !== null) payload.customer_price = formData.customer_price
  if (formData.admin_payout !== null) payload.admin_payout = formData.admin_payout

  try {
    await $api(`/services/${currentService.value.id}/update-prices`, {
      method: 'PUT',
      body: payload
    })
    message.success('Updated successfully')
    updateModalVisible.value = false
    fetchServices()
  } catch {
    message.error('Update failed')
  }
}

onMounted(fetchServices)
</script>

<template>
  <div class="p-4 md:p-6 space-y-4 bg-emerald-50 min-h-screen lg:w-2/3">

    <!-- HEADER -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <div>
        <div class="text-lg md:text-xl font-bold">Services</div>
        <div class="text-xs text-gray-500">{{ pagination.total }} total services</div>
      </div>

      <div class="flex gap-2">
        <Input
          v-model:value="searchText"
          placeholder="Search services..."
          size="small"
          class="w-48"
          @input="applyFilters"
        />
        <Button size="small" @click="fetchServices" :loading="loading">
          <ReloadOutlined />
        </Button>
      </div>
    </div>

    <!-- TABLE -->
    <Card class="rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <Table
          :columns="columns"
          :data-source="services"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          size="small"
          :scroll="{ x: 900 }"
          class="mobile-table"
        >
          <template #indexCell="{ index }">
            <span class="text-xs font-semibold">
              {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </span>
          </template>

          <template #name="{ record }">
            <div class="text-xs">
              <div class="font-semibold truncate max-w-[220px]">{{ record.name }}</div>
              <div class="text-gray-500 truncate max-w-[220px]">
                {{ record.description }}
              </div>
              <Tag v-if="record.active" color="green" class="mt-1">Active</Tag>
            </div>
          </template>

          <template #customerPrice="{ record }">
            <div class="text-xs font-bold text-emerald-600">
              ₦{{ Number(record.customer_price || record.price || 0).toLocaleString() }}
            </div>
          </template>

          <template #adminPayout="{ record }">
            <div class="text-xs font-bold text-emerald-600">
              ₦{{ Number(record.admin_payout || 0).toLocaleString() }}
            </div>
          </template>

          <template #platformProfit="{ record }">
            <div class="text-xs font-bold text-emerald-600">
              ₦{{ Number(record.platform_profit || 0).toLocaleString() }}
            </div>
          </template>

          <template #actions="{ record }">
            <Button
              type="text"
              size="small"
              class="!p-1 rounded-full hover:bg-emerald-100"
              @click="openUpdateModal(record)"
            >
              <EditOutlined class="text-emerald-600" />
            </Button>
          </template>
        </Table>
      </div>
    </Card>

    <!-- MODAL -->
    <Modal v-model:visible="updateModalVisible" title="Update Prices" :footer="null" width="380">
      <div v-if="currentService" class="space-y-4 text-xs">

        <div class="font-semibold text-sm truncate">
          {{ currentService.name }}
        </div>

        <!-- CUSTOMER PRICE -->
        <div class="space-y-1">
          <label class="block text-gray-600 font-medium">
            Customer Price
          </label>
          <InputNumber
            v-model:value="formData.customer_price"
            class="w-full"
            placeholder="₦0"
            :min="0"
          />
        </div>

        <!-- ADMIN PAYOUT -->
        <div class="space-y-1">
          <label class="block text-gray-600 font-medium">
            Admin Payout
          </label>
          <InputNumber
            v-model:value="formData.admin_payout"
            class="w-full"
            placeholder="₦0"
            :min="0"
          />
        </div>

        <div class="flex gap-2 pt-3">
          <Button block size="small" @click="updateModalVisible = false">
            Cancel
          </Button>
          <Button
            block
            type="primary"
            size="small"
            :disabled="formData.customer_price === null && formData.admin_payout === null"
            @click="handleUpdate"
          >
            Update Prices
          </Button>
        </div>

      </div>
    </Modal>


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
