<script setup lang="ts">
definePageMeta({ 
  layout: 'dashboard', 
  middleware: 'auth', 
  roles: ['superadmin'],
  title: 'Administrators'
})

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Table, Card, Button, Input, Select, Modal, InputNumber, message, 
  Tag, Dropdown
} from 'ant-design-vue'
import { 
  EyeOutlined, WalletOutlined, CreditCardOutlined, DeleteOutlined,
  ReloadOutlined, UserAddOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const { $api } = useNuxtApp()

/* ================= STATE ================= */
const users = ref([])
const loading = ref(false)
const searchText = ref('')
const roleFilter = ref(null)
const pagination = ref({
  current: 1,
  pageSize: 50,
  total: 0,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`
})

/* ================= MODAL STATE ================= */
const createModalVisible = ref(false)
const fundModalVisible = ref(false)
const debitModalVisible = ref(false)
const deleteModalVisible = ref(false)
const selectedUser = ref(null)
const amount = ref(null)
const reason = ref('')
const modalLoading = ref(false)

const createForm = ref({
  name: '',
  email: '',
  phone: '',
  state: '',
  role: 'user'
})

/* Nigerian States */
const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]

/* ================= API ================= */
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      search: searchText.value?.trim() || undefined,
      role: roleFilter.value || undefined,
      page: pagination.value.current,
      per_page: pagination.value.pageSize
    }
    const res = await $api('/administrator', { params })
    users.value = res.data.data || []
    pagination.value.current = res.data.current_page || 1
    pagination.value.total = res.data.total || 0
    pagination.value.pageSize = res.data.per_page || 50
  } catch (err) {
    message.error('Failed to fetch administrators')
    users.value = []
  } finally {
    loading.value = false
  }
}

const handleTableChange = (paginationConfig) => {
  Object.assign(pagination.value, paginationConfig)
  fetchUsers()
}

/* ================= CREATE USER ================= */
const openCreateModal = () => {
  createForm.value = { name: '', email: '', phone: '', state: '', role: 'user' }
  createModalVisible.value = true
}

const handleCreateUser = async () => {
  modalLoading.value = true
  try {
    await $api('/me/create-administrator', {
      method: 'POST',
      body: createForm.value
    })
    message.success('✅ New administrator created successfully!')
    createModalVisible.value = false
    fetchUsers()
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to create administrator')
  } finally {
    modalLoading.value = false
  }
}

/* ================= ACTION FUNCTIONS ================= */
const openFundModal = (user) => { 
  selectedUser.value = user
  amount.value = null
  reason.value = ''
  fundModalVisible.value = true 
}

const openDebitModal = (user) => { 
  selectedUser.value = user
  amount.value = null
  reason.value = ''
  debitModalVisible.value = true 
}

const openDeleteModal = (user) => {
  selectedUser.value = user
  deleteModalVisible.value = true
}

/* ================= FUND/DEBIT/DELETE HANDLERS ================= */
const handleFundUser = async () => {
  if (amount.value === null || amount.value <= 0) {
    message.error('Amount is required and must be greater than 0')
    return
  }
  modalLoading.value = true
  try {
    await $api(`/users/${selectedUser.value.id}/fund`, {
      method: 'POST',
      body: { amount: Number(amount.value), reason: reason.value || 'Admin fund' }
    })
    message.success(`✅ Funded ₦${Number(amount.value).toLocaleString()}`)
    fundModalVisible.value = false
    amount.value = null
    reason.value = ''
    fetchUsers()
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to fund user')
  } finally {
    modalLoading.value = false
  }
}

const handleDebitUser = async () => {
  if (amount.value === null || amount.value <= 0) {
    message.error('Amount is required and must be greater than 0')
    return
  }
  modalLoading.value = true
  try {
    await $api(`/users/${selectedUser.value.id}/debit`, {
      method: 'POST',
      body: { amount: Number(amount.value), reason: reason.value || 'Admin debit' }
    })
    message.success(`✅ Debited ₦${Number(amount.value).toLocaleString()}`)
    debitModalVisible.value = false
    amount.value = null
    reason.value = ''
    fetchUsers()
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to debit user')
  } finally {
    modalLoading.value = false
  }
}

const deleteUser = async () => {
  modalLoading.value = true
  try {
    await $api(`/administrator/${selectedUser.value.id}`, { method: 'DELETE' })
    message.success('✅ Administrator deleted successfully')
    deleteModalVisible.value = false
    selectedUser.value = null
    fetchUsers()
  } catch (err: any) {
    message.error(err.response?.data?.message || 'Failed to delete administrator')
  } finally {
    modalLoading.value = false
  }
}

onMounted(() => fetchUsers())
</script>

<template>
  <div class="lg:p-4 bg-emerald-50">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="text-2xl font-bold text-emerald-700">Administrator Management</div>
      <Button type="primary" size="middle" @click="openCreateModal">
        <UserAddOutlined /> Store Administrator
      </Button>
    </div>

    <!-- Table -->
    <Card class="overflow-x-auto -mx-2 px-2 rounded-t-lg">
      <div class="min-w-[900px]">
        <Table
          class="admin-table w-full"
          :columns="[
            { title: '#', key: 'index', width: 60, slots: { customRender: 'indexCell' } },
            { title: 'Name', dataIndex: 'name', key: 'name', width: 140, ellipsis: true },
            { title: 'Email', dataIndex: 'email', key: 'email', width: 180, ellipsis: true },
            { title: 'Role', dataIndex: 'role', key: 'role', width: 100, slots: { customRender: 'roleCell' } },
            { title: 'Balance', key: 'balance', width: 110, align: 'right', slots: { customRender: 'balanceCell' } },
            { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 120 },
            { title: 'State', dataIndex: 'state', key: 'state', width: 100 },
            { title: 'Created', dataIndex: 'created_at', key: 'created_at', width: 120, slots: { customRender: 'createdCell' } },
            { title: 'Action', key: 'actions', width: 80, slots: { customRender: 'actionsCell' }, fixed: 'right' }
          ]"
          :data-source="users"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          :scroll="{ x: 'max-content' }"
          size="middle"
        >
     
        <template #title>
          <div class="flex flex-wrap items-center gap-3 p-4 pb-2">
            <Input 
              v-model:value="searchText"
              size="small"
              placeholder="Search name/email..."
              class="flex-1 min-w-[200px] max-w-[300px]"
              @pressEnter="fetchUsers"
              @blur="fetchUsers"
            />
            <Select
              v-model:value="roleFilter"
              size="small"
              placeholder="All Roles"
              allow-clear
              class="w-[140px]"
              @change="fetchUsers"
            >
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="superadmin">Super Admin</Select.Option>
            </Select>
            <Button size="small" @click="fetchUsers" :loading="loading">
              <ReloadOutlined /> Refresh
            </Button>
          </div>
        </template>

        <template #emptyText>
          <div class="text-center py-8">
            <div class="text-lg font-semibold text-gray-600 mb-1">No administrators found</div>
            <div class="text-sm text-gray-500 mb-4">Click "Store Administrator" to create your first admin</div>
            <Button type="primary" @click="openCreateModal">
              <UserAddOutlined /> Create First Admin
            </Button>
          </div>
        </template>

        <template #indexCell="{ index }">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>
        
        <template #roleCell="{ record }">
          <Tag :color="record.role === 'superadmin' ? 'orange' : record.role === 'admin' ? 'blue' : 'green'"
               class="text-xs px-2 py-1">
            {{ record.role }}
          </Tag>
        </template>
        
        <template #balanceCell="{ record }">
          <div class="text-right text-sm font-medium text-emerald-600">
            ₦{{ Number(record.wallet?.balance || 0).toLocaleString() }}
          </div>
        </template>
        
        <template #createdCell="{ record }">
          <div class="text-sm">{{ new Date(record.created_at).toLocaleDateString() }}</div>
        </template>
        
        <template #actionsCell="{ record }">
          <Dropdown trigger="click" placement="bottomRight">
            <Button type="text" size="small" shape="circle" class="!w-8 !h-8 !p-0 action-dots">⋯</Button>
            <template #overlay>
              <div class="action-menu p-2 min-w-[160px]">
                <Button block type="link" size="small" class="text-left py-1" 
                        @click="router.push(`/superadmin/administrators/${record.id}`)">
                  <EyeOutlined class="mr-2" />View
                </Button>
                <Button block type="link" size="small" class="text-left py-1" 
                        @click="openFundModal(record)">
                  <WalletOutlined class="mr-2" />Fund
                </Button>
                <Button block type="link" size="small" class="text-left py-1" 
                        @click="openDebitModal(record)">
                  <CreditCardOutlined class="mr-2" />Debit
                </Button>
                <Button block type="link" danger size="small" class="text-left py-1" 
                        @click="openDeleteModal(record)">
                  <DeleteOutlined class="mr-2" />Delete
                </Button>
              </div>
            </template>
          </Dropdown>
        </template>
      </Table>
     </div>
    </Card>

   
<!-- ✅ CREATE MODAL -->
<Modal v-model:visible="createModalVisible" title="Create New Administrator" :width="500" :footer="null">
  <div class="space-y-4 p-4">
    <Input v-model:value="createForm.name" size="large" placeholder="Full Name" />
    <Input v-model:value="createForm.email" size="large" placeholder="Email Address" />
    <Input v-model:value="createForm.phone" size="large" placeholder="Phone Number" />
    <Select v-model:value="createForm.state" size="large" placeholder="Select State" class="w-full">
      <Select.Option v-for="state in nigerianStates" :key="state" :value="state">{{ state }}</Select.Option>
    </Select>
    <Select v-model:value="createForm.role" size="large" placeholder="User Role" class="w-full">
      <Select.Option value="user">User</Select.Option>
      <Select.Option value="admin">Admin</Select.Option>
    </Select>
    <div class="flex gap-3 pt-2">
      <Button size="large" @click="createModalVisible = false" class="flex-1">Cancel</Button>
      <Button type="primary" size="large" :loading="modalLoading" @click="handleCreateUser" class="flex-1">
        <UserAddOutlined /> Create Administrator
      </Button>
    </div>
  </div>
</Modal>

<!-- ✅ FUND MODAL -->
<Modal v-model:visible="fundModalVisible" title="Fund Wallet" :width="450" :footer="null">
  <div class="space-y-3 p-4">
    <div>
      <div class="text-sm font-medium truncate">{{ selectedUser?.name }}</div>
      <div class="text-xs text-gray-500 truncate">{{ selectedUser?.email }}</div>
    </div>
    <div class="text-right text-sm mb-3 p-2 bg-green-50 rounded-lg">
      <span class="text-green-700 font-bold text-lg">₦{{ Number(selectedUser?.wallet?.balance || 0).toLocaleString() }}</span>
      <div class="text-xs text-green-600">Current Balance</div>
    </div>
    <InputNumber v-model:value="amount" :min="1" :precision="0" size="middle" class="w-full" placeholder="Enter amount to fund" />
    <Input v-model:value="reason" size="middle" class="w-full" placeholder="Reason for funding (optional)" />
    <div class="flex gap-2 pt-2">
      <Button size="middle" @click="fundModalVisible = false" class="flex-1">Cancel</Button>
      <Button type="primary" size="middle" :loading="modalLoading" @click="handleFundUser" class="flex-1">
        💰 Fund ₦{{ amount ? Number(amount).toLocaleString() : '0' }}
      </Button>
    </div>
  </div>
</Modal>

<!-- ✅ DEBIT MODAL -->
<Modal v-model:visible="debitModalVisible" title="Debit Wallet" :width="450" :footer="null">
  <div class="space-y-3 p-4">
    <div>
      <div class="text-sm font-medium truncate">{{ selectedUser?.name }}</div>
      <div class="text-xs text-gray-500 truncate">{{ selectedUser?.email }}</div>
    </div>
    <div class="text-right text-sm mb-3 p-2 bg-green-50 rounded-lg">
      <span class="text-green-700 font-bold text-lg">₦{{ Number(selectedUser?.wallet?.balance || 0).toLocaleString() }}</span>
      <div class="text-xs text-green-600">Current Balance</div>
    </div>
    <InputNumber v-model:value="amount" :min="1" :precision="0" :max="selectedUser?.wallet?.balance" size="middle" class="w-full" placeholder="Enter amount to debit" />
    <Input v-model:value="reason" size="middle" class="w-full" placeholder="Reason for debit (optional)" />
    <div class="flex gap-2 pt-2">
      <Button size="middle" @click="debitModalVisible = false" class="flex-1">Cancel</Button>
      <Button type="primary" danger size="middle" :loading="modalLoading" @click="handleDebitUser" class="flex-1">
        💳 Debit ₦{{ amount ? Number(amount).toLocaleString() : '0' }}
      </Button>
    </div>
  </div>
</Modal>

<!-- ✅ DELETE MODAL -->
<Modal v-model:visible="deleteModalVisible" title="Delete Administrator?" :width="450" :footer="null">
  <div class="space-y-4 p-4">
    <p class="text-sm leading-relaxed">
      Are you sure you want to delete <strong class="text-red-600">{{ selectedUser?.name }}</strong>?
    </p>
    <div class="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
      <div class="text-sm font-medium">{{ selectedUser?.email }}</div>
      <div class="text-xs text-gray-600">Wallet: <span class="font-mono">₦{{ Number(selectedUser?.wallet?.balance || 0).toLocaleString() }}</span></div>
      <div class="text-xs text-gray-600">Phone: {{ selectedUser?.phone }}</div>
    </div>
    <div class="text-xs text-gray-500 text-center">
      This action cannot be undone
    </div>
    <div class="flex gap-2 pt-2">
      <Button size="middle" @click="deleteModalVisible = false" class="flex-1">Cancel</Button>
      <Button danger size="middle" :loading="modalLoading" @click="deleteUser" class="flex-1">
        🗑️ Delete Administrator
      </Button>
    </div>
  </div>
</Modal>

  </div>
</template>

<style scoped>
.admin-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4 text-sm;
}

.admin-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4;
}

.admin-table :deep(.ant-table-row:hover > td) {
  @apply bg-emerald-50;
}

.action-dots:hover {
  @apply bg-gray-100 rounded-full;
}

.action-menu {
  @apply bg-white border border-gray-200 rounded-lg shadow-lg;
}

.action-menu :deep(.ant-btn:hover) {
  @apply bg-gray-50 rounded;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* Horizontal scroll on mobile/tablet with rounded top */
@media (max-width: 1024px) {
  .admin-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    border-top-left-radius: 0.5rem;  /* rounded top-left */
    border-top-right-radius: 0.5rem; /* rounded top-right */
  }

  .ant-table-fixed-right {
    right: 0 !important; /* ensure action column sticks correctly */
  }

  /* Optional: clip table body to rounded top */
  .admin-table :deep(.ant-table-container) {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    overflow: hidden;
  }
}

</style>
