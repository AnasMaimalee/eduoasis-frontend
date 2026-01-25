<script setup lang="ts">
definePageMeta({ 
  layout: 'dashboard', 
  middleware: 'auth', 
  roles: ['superadmin'] ,
  title: 'Users'
})

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Table, Card, Button, Input, Select, Modal, InputNumber, message, 
  Tag, Typography, Dropdown
} from 'ant-design-vue'
import { 
  EyeOutlined, WalletOutlined, CreditCardOutlined, DeleteOutlined,
  ReloadOutlined, PlusOutlined, SearchOutlined, UndoOutlined 
} from '@ant-design/icons-vue'

const router = useRouter()
const { $api } = useNuxtApp()

/* STATE - USERS */
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

/* STATE - TRASH */
const trashedUsers = ref([])
const trashLoading = ref(false)
const trashPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  pageSizeOptions: ['10', '20', '50'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} trashed users`
})

/* MODAL STATE */
const createModalVisible = ref(false)
const fundModalVisible = ref(false)
const debitModalVisible = ref(false)
const deleteModalVisible = ref(false)
const restoreModalVisible = ref(false)
const selectedUser = ref(null)
const selectedTrashedUser = ref(null)
const amount = ref(null)
const reason = ref('')
const modalLoading = ref(false)

const createForm = ref({
  name: '', email: '', phone: '', state: '', role: 'user'
})

/* USERS FUNCTIONS */
const handleSearchChange = (e) => {
  searchText.value = e.target.value
}

const triggerSearch = () => {
  pagination.value.current = 1
  fetchUsers()
}

const handleRoleChange = (value) => {
  roleFilter.value = value
  pagination.value.current = 1
  fetchUsers()
}

const handleTableChange = (paginationConfig) => {
  pagination.value.current = paginationConfig.current
  pagination.value.pageSize = paginationConfig.pageSize
  fetchUsers()
}

/* TRASH FUNCTIONS */
const handleTrashTableChange = (paginationConfig) => {
  trashPagination.value.current = paginationConfig.current
  trashPagination.value.pageSize = paginationConfig.pageSize
  fetchTrashedUsers()
}

const refreshBothTables = () => {
  fetchUsers()
  fetchTrashedUsers()
}

/* API CALLS */
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      search: searchText.value?.trim() || undefined,
      role: roleFilter.value || undefined,
      trashed: false,
      page: pagination.value.current,
      per_page: pagination.value.pageSize
    }
    const res = await $api('/users', { params })
    users.value = res.data?.data || []
    const meta = res.data || res || {}
    pagination.value.total = Number(meta.total || 0)
    pagination.value.current = Number(meta.current_page || 1)
    pagination.value.pageSize = Number(meta.per_page || 50)
  } catch (err) {
    console.error(err)
    message.error('Failed to fetch users')
    users.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

const fetchTrashedUsers = async () => {
  trashLoading.value = true
  try {
    const params = {
      trashed: true,
      page: trashPagination.value.current,
      per_page: trashPagination.value.pageSize
    }
    const res = await $api('/users', { params })
    trashedUsers.value = res.data?.data || []
    const meta = res.data || res || {}
    trashPagination.value.total = Number(meta.total || 0)
    trashPagination.value.current = Number(meta.current_page || 1)
    trashPagination.value.pageSize = Number(meta.per_page || 20)
  } catch (err) {
    console.error(err)
    message.error('Failed to fetch trashed users')
    trashedUsers.value = []
    trashPagination.value.total = 0
  } finally {
    trashLoading.value = false
  }
}

// CREATE USER
const openCreateModal = () => {
  createForm.value = { name: '', email: '', phone: '', state: '', role: 'user' }
  createModalVisible.value = true
}

const handleCreateUser = async () => {
  modalLoading.value = true
  try {
    await $api('/superadmin/users', {
      method: 'POST',
      body: createForm.value
    })
    message.success('User created!')
    createModalVisible.value = false
    refreshBothTables()
  } catch (err) {
    message.error('Failed to create user')
  } finally {
    modalLoading.value = false
  }
}

// FUND/DEBIT USER
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

const handleFundUser = async () => {
  if (!amount.value || amount.value <= 0) return message.error('Valid amount required')
  modalLoading.value = true
  try {
    await $api(`/users/${selectedUser.value.id}/fund`, {
      method: 'POST',
      body: { amount: Number(amount.value), reason: reason.value || 'Admin fund' }
    })
    message.success('Funded!')
    fundModalVisible.value = false
    fetchUsers()
  } catch (err) {
    message.error('Failed to fund')
  } finally {
    modalLoading.value = false
  }
}

const handleDebitUser = async () => {
  if (!amount.value || amount.value <= 0) return message.error('Valid amount required')
  modalLoading.value = true
  try {
    await $api(`/users/${selectedUser.value.id}/debit`, {
      method: 'POST',
      body: { amount: Number(amount.value), reason: reason.value || 'Admin debit' }
    })
    message.success('Debited!')
    debitModalVisible.value = false
    fetchUsers()
  } catch (err) {
    message.error('Failed to debit')
  } finally {
    modalLoading.value = false
  }
}

// DELETE USER (Move to trash)
const openDeleteModal = (user) => {
  selectedUser.value = user
  deleteModalVisible.value = true
}

const deleteUser = async () => {
  modalLoading.value = true
  try {
    await $api(`/users/${selectedUser.value.id}`, { method: 'DELETE' })
    message.success('User moved to trash!')
    deleteModalVisible.value = false
    refreshBothTables()
  } catch (err) {
    message.error('Failed to delete')
  } finally {
    modalLoading.value = false
  }
}

// RESTORE USER
const openRestoreModal = (user) => {
  selectedTrashedUser.value = user
  restoreModalVisible.value = true
}

const handleRestoreUser = async () => {
  modalLoading.value = true
  try {
    await $api(`/users/${selectedTrashedUser.value.id}/restore`, { method: 'POST' })
    message.success('User restored!')
    restoreModalVisible.value = false
    refreshBothTables()
  } catch (err) {
    message.error('Failed to restore user')
  } finally {
    modalLoading.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchTrashedUsers()
})
</script>

<template>
  <div class="p-6 space-y-6 bg-emerald-50">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <Typography.Title level="3" class="!m-0">Users Management</Typography.Title>
      <Button type="primary" size="middle" @click="openCreateModal">
        <PlusOutlined /> Add User
      </Button>
    </div>

    <!-- USERS TABLE -->
    <Card>
      <Table
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
        :scroll="{ x: 1200 }"
        size="middle"
        class="compact-table"
      >
        <template #title>
          <div class="flex flex-wrap items-center gap-3 p-4 pb-2">
            <Input 
              v-model:value="searchText"
              size="small"
              placeholder="Search name/email... (Enter to search)"
              class="flex-1 min-w-[200px] max-w-[300px]"
              @input="handleSearchChange"
              @pressEnter="triggerSearch"
              @blur="triggerSearch"
            />
            <Select
              v-model:value="roleFilter"
              size="small"
              placeholder="All Roles"
              allow-clear
              class="w-[140px]"
              :options="[
                { label: 'All Roles', value: null },
                { label: 'User', value: 'user' },
                { label: 'Admin', value: 'admin' },
                { label: 'Superadmin', value: 'superadmin' }
              ]"
              @change="handleRoleChange"
            />
            <Button size="small" @click="refreshBothTables" :loading="loading">
              <ReloadOutlined /> Refresh
            </Button>
          </div>
        </template>

        <template #emptyText>
          <div class="text-center py-8">
            <div class="text-lg font-semibold text-gray-600 mb-1">No users found</div>
            <div class="text-sm text-gray-500 mb-4">Click "Add User" to create your first user</div>
            <Button type="primary" @click="openCreateModal">
              <PlusOutlined /> Create First User
            </Button>
          </div>
        </template>

        <template #indexCell="{ index }">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>
        
        <template #roleCell="{ record }">
          <Tag :color="record.role === 'superadmin' ? 'orange' : record.role === 'admin' ? 'blue' : 'green'" class="text-xs px-2 py-1">
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
              <div class="action-menu p-2 min-w-[140px]">
                <Button block type="link" size="small" class="text-left py-1" @click="router.push(`/superadmin/users/${record.id}`)">
                  <EyeOutlined class="mr-2" />View
                </Button>
                <Button block type="link" size="small" class="text-left py-1" @click="openFundModal(record)">
                  <WalletOutlined class="mr-2" />Fund
                </Button>
                <Button block type="link" size="small" class="text-left py-1" @click="openDebitModal(record)">
                  <CreditCardOutlined class="mr-2" />Debit
                </Button>
                <Button block type="link" danger size="small" class="text-left py-1" @click="openDeleteModal(record)">
                  <DeleteOutlined class="mr-2" />Delete
                </Button>
              </div>
            </template>
          </Dropdown>
        </template>
      </Table>
    </Card>

  <!-- TRASH TABLE - UPDATED HEADER -->
<Card>
  <!-- ✅ NEW PLAIN HEADER WITH SEARCH -->
  <Table
    :columns="[
      { title: '#', key: 'index', width: 60, slots: { customRender: 'trashIndexCell' } },
      { title: 'Name', dataIndex: 'name', key: 'name', width: 140, ellipsis: true },
      { title: 'Email', dataIndex: 'email', key: 'email', width: 180, ellipsis: true },
      { title: 'Role', dataIndex: 'role', key: 'role', width: 100, slots: { customRender: 'trashRoleCell' } },
      { title: 'Balance', key: 'balance', width: 110, align: 'right', slots: { customRender: 'trashBalanceCell' } },
      { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 120 },
      { title: 'Deleted', dataIndex: 'deleted_at', key: 'deleted_at', width: 120, slots: { customRender: 'deletedCell' } },
      { title: 'Action', key: 'actions', width: 80, slots: { customRender: 'trashActionsCell' }, fixed: 'right' }
    ]"
    :data-source="trashedUsers"
    :loading="trashLoading"
    :pagination="trashPagination"
    @change="handleTrashTableChange"
    row-key="id"
    :scroll="{ x: 1100 }"
    size="middle"
    class="compact-table"
  >
    <!-- ✅ HEADER WITH SEARCH + FILTER (like users table) -->
    <template #title>
      <div class="flex flex-wrap items-center gap-3 p-4 pb-2">
        <Typography.Title level="4" class="!m-0 flex-1 text-gray-700">🗑️ Trashed Users</Typography.Title>
        <Input 
          v-model:value="searchText"
          size="small"
          placeholder="Search trashed users... (Enter)"
          class="flex-1 min-w-[200px] max-w-[250px]"
          @input="handleSearchChange"
          @pressEnter="fetchTrashedUsers"
          @blur="fetchTrashedUsers"
        />
        <Select
          v-model:value="roleFilter"
          size="small"
          placeholder="All Roles"
          allow-clear
          class="w-[140px]"
          :options="[
            { label: 'All Roles', value: null },
            { label: 'User', value: 'user' },
            { label: 'Admin', value: 'admin' },
            { label: 'Superadmin', value: 'superadmin' }
          ]"
          @change="handleRoleChange"
        />
        <Button size="small" @click="fetchTrashedUsers" :loading="trashLoading">
          <ReloadOutlined /> Refresh
        </Button>
      </div>
    </template>

    <!-- Your existing slots (unchanged) -->
    <template #emptyText>
      <div class="text-center py-8">
        <div class="text-lg font-semibold text-gray-600 mb-1">No trashed users</div>
        <div class="text-sm text-gray-500 mb-4">Users will appear here when moved to trash</div>
      </div>
    </template>

    <!-- All your existing slot templates stay the same -->
    <template #trashIndexCell="{ index }">
      {{ (trashPagination.current - 1) * trashPagination.pageSize + index + 1 }} 
    </template>
    <template #trashActionsCell="{ record }">
          <Dropdown trigger="click" placement="bottomRight">
            <Button type="text" size="small" shape="circle" class="!w-8 !h-8 !p-0 action-dots">⋯</Button>
            <template #overlay>
              <div class="action-menu p-2 min-w-[140px]">
               
                <Button block type="link" danger size="small" class="text-left py-1" @click="openRestoreModal(record)">
                  <class="mr-2" />Restore
                </Button>
              </div>
            </template>
          </Dropdown>
        </template>
         <template #trashBalanceCell="{ record }">
          <div class="text-right text-sm font-medium text-emerald-600">
            ₦{{ Number(record.wallet?.balance || 0).toLocaleString() }}
          </div>
        </template>
        <template #deletedCell="{ record }">
          <div class="text-sm">{{ new Date(record.deleted_at).toLocaleDateString() }}</div>
        </template>
  </Table>
</Card>


    <!-- CREATE USER MODAL -->
    <Modal v-model:visible="createModalVisible" title="Create User" :width="380" :footer="null">
      <div class="p-3 space-y-2">
        <Input v-model:value="createForm.name" size="small" placeholder="Name" />
        <Input v-model:value="createForm.email" size="small" placeholder="Email" />
        <Input v-model:value="createForm.phone" size="small" placeholder="Phone" />
        <Select v-model:value="createForm.state" size="small" placeholder="State" class="w-full">
          <Select.Option v-for="state in ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara']" :key="state" :value="state">{{ state }}</Select.Option>
        </Select>
        <Select v-model:value="createForm.role" size="small" placeholder="Role" class="w-full">
          <Select.Option value="user">User</Select.Option>
          <Select.Option value="admin">Admin</Select.Option>
        </Select>
        <div class="flex gap-2 pt-1">
          <Button size="small" @click="createModalVisible = false" class="flex-1 text-xs">Cancel</Button>
          <Button type="primary" size="small" :loading="modalLoading" @click="handleCreateUser" class="flex-1 text-xs">Create</Button>
        </div>
      </div>
    </Modal>

    <!-- FUND WALLET MODAL -->
    <Modal v-model:visible="fundModalVisible" title="Fund Wallet" :width="360" :footer="null">
      <div class="p-3 space-y-2">
        <div class="text-xs truncate">{{ selectedUser?.name }}</div>
        <div class="text-right p-1.5 bg-green-50 rounded text-xs">
          ₦{{ Number(selectedUser?.wallet?.balance || 0).toLocaleString() }}
        </div>
        <InputNumber v-model:value="amount" :min="1" :precision="0" size="small" class="w-full" placeholder="Amount" />
        <Input v-model:value="reason" size="small" class="w-full" placeholder="Reason (optional)" />
        <div class="flex gap-2">
          <Button size="small" @click="fundModalVisible = false" class="flex-1 text-xs">Cancel</Button>
          <Button type="primary" size="small" :loading="modalLoading" @click="handleFundUser" class="flex-1 text-xs">Fund</Button>
        </div>
      </div>
    </Modal>

    <!-- DEBIT WALLET MODAL -->
    <Modal v-model:visible="debitModalVisible" title="Debit Wallet" :width="360" :footer="null">
      <div class="p-3 space-y-2">
        <div class="text-xs truncate">{{ selectedUser?.name }}</div>
        <div class="text-right p-1.5 bg-green-50 rounded text-xs">
          ₦{{ Number(selectedUser?.wallet?.balance || 0).toLocaleString() }}
        </div>
        <InputNumber v-model:value="amount" :min="1" :precision="0" size="small" class="w-full" placeholder="Amount" />
        <Input v-model:value="reason" size="small" class="w-full" placeholder="Reason (optional)" />
        <div class="flex gap-2">
          <Button size="small" @click="debitModalVisible = false" class="flex-1 text-xs">Cancel</Button>
          <Button type="primary" danger size="small" :loading="modalLoading" @click="handleDebitUser" class="flex-1 text-xs">Debit</Button>
        </div>
      </div>
    </Modal>

    <!-- DELETE USER MODAL -->
    <Modal v-model:visible="deleteModalVisible" title="Move to Trash?" :width="340" :footer="null">
      <div class="p-3 space-y-2">
        <p class="text-sm">Move <strong class="text-red-600">{{ selectedUser?.name }}</strong> to trash?</p>
        <div class="p-1.5 bg-red-50 rounded text-xs">
          {{ selectedUser?.email }}<br>
          <span>₦{{ Number(selectedUser?.wallet?.balance || 0).toLocaleString() }}</span>
        </div>
        <div class="flex gap-2">
          <Button size="small" @click="deleteModalVisible = false" class="flex-1 text-xs">Cancel</Button>
          <Button danger size="small" :loading="modalLoading" @click="deleteUser" class="flex-1 text-xs">
            <DeleteOutlined class="mr-1" />Move to Trash
          </Button>
        </div>
      </div>
    </Modal>

    <!-- RESTORE USER MODAL -->
    <Modal v-model:visible="restoreModalVisible" title="Restore User?" :width="380" :footer="null">
      <div class="p-3 space-y-3">
        <p class="text-sm">Restore <strong class="text-emerald-600">{{ selectedTrashedUser?.name }}</strong> to active users?</p>
        <div class="p-2 bg-gray-50 rounded text-xs border">
          <div>{{ selectedTrashedUser?.email }}</div>
          <div class="text-gray-500 mt-1">
            Role: {{ selectedTrashedUser?.role }} | 
            Balance: ₦{{ Number(selectedTrashedUser?.wallet?.balance || 0).toLocaleString() }} | 
            Deleted: {{ new Date(selectedTrashedUser?.deleted_at).toLocaleDateString() }}
          </div>
        </div>
        <div class="flex gap-2">
          <Button size="small" @click="restoreModalVisible = false" class="flex-1 text-xs">Cancel</Button>
          <Button type="primary" size="small" :loading="modalLoading" @click="handleRestoreUser" class="flex-1 text-xs">
            <UndoOutlined class="mr-1" />Restore User
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.compact-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4;
}

.compact-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4;
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
</style>
