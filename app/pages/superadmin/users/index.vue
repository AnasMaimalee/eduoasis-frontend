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
  Tag, Dropdown
} from 'ant-design-vue'
import { 
  EyeOutlined, WalletOutlined, CreditCardOutlined, DeleteOutlined,
  ReloadOutlined, PlusOutlined, UndoOutlined 
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
const handleSearchChange = (e) => { searchText.value = e.target.value }
const triggerSearch = () => { pagination.value.current = 1; fetchUsers() }
const handleRoleChange = (value) => { roleFilter.value = value; pagination.value.current = 1; fetchUsers() }
const handleTableChange = (paginationConfig) => { pagination.value.current = paginationConfig.current; pagination.value.pageSize = paginationConfig.pageSize; fetchUsers() }
const handleTrashTableChange = (paginationConfig) => { trashPagination.value.current = paginationConfig.current; trashPagination.value.pageSize = paginationConfig.pageSize; fetchTrashedUsers() }
const refreshBothTables = () => { fetchUsers(); fetchTrashedUsers() }

/* API CALLS */
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = { search: searchText.value?.trim() || undefined, role: roleFilter.value || undefined, trashed: false, page: pagination.value.current, per_page: pagination.value.pageSize }
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
  } finally { loading.value = false }
}

const fetchTrashedUsers = async () => {
  trashLoading.value = true
  try {
    const params = { trashed: true, page: trashPagination.value.current, per_page: trashPagination.value.pageSize }
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
  } finally { trashLoading.value = false }
}

/* CREATE / FUND / DEBIT / DELETE / RESTORE USER LOGIC */
const openCreateModal = () => { createForm.value = { name: '', email: '', phone: '', state: '', role: 'user' }; createModalVisible.value = true }
const handleCreateUser = async () => { modalLoading.value = true; try { await $api('/superadmin/users', { method: 'POST', body: createForm.value }); message.success('User created!'); createModalVisible.value = false; refreshBothTables() } catch (err) { message.error('Failed to create user') } finally { modalLoading.value = false } }

const openFundModal = (user) => { selectedUser.value = user; amount.value = null; reason.value = ''; fundModalVisible.value = true }
const openDebitModal = (user) => { selectedUser.value = user; amount.value = null; reason.value = ''; debitModalVisible.value = true }

const handleFundUser = async () => {
  if (!amount.value || amount.value <= 0) return message.error('Valid amount required')
  modalLoading.value = true
  try { await $api(`/users/${selectedUser.value.id}/fund`, { method: 'POST', body: { amount: Number(amount.value), reason: reason.value || 'Admin fund' } }); message.success('Funded!'); fundModalVisible.value = false; fetchUsers() } 
  catch (err) { message.error('Failed to fund') } finally { modalLoading.value = false }
}

const handleDebitUser = async () => {
  if (!amount.value || amount.value <= 0) return message.error('Valid amount required')
  modalLoading.value = true
  try { await $api(`/users/${selectedUser.value.id}/debit`, { method: 'POST', body: { amount: Number(amount.value), reason: reason.value || 'Admin debit' } }); message.success('Debited!'); debitModalVisible.value = false; fetchUsers() } 
  catch (err) { message.error('Failed to debit') } finally { modalLoading.value = false }
}

const openDeleteModal = (user) => { selectedUser.value = user; deleteModalVisible.value = true }
const deleteUser = async () => { modalLoading.value = true; try { await $api(`/users/${selectedUser.value.id}`, { method: 'DELETE' }); message.success('User moved to trash!'); deleteModalVisible.value = false; refreshBothTables() } catch (err) { message.error('Failed to delete') } finally { modalLoading.value = false } }

const openRestoreModal = (user) => { selectedTrashedUser.value = user; restoreModalVisible.value = true }
const handleRestoreUser = async () => { modalLoading.value = true; try { await $api(`/users/${selectedTrashedUser.value.id}/restore`, { method: 'POST' }); message.success('User restored!'); restoreModalVisible.value = false; refreshBothTables() } catch (err) { message.error('Failed to restore user') } finally { modalLoading.value = false } }

onMounted(() => { fetchUsers(); fetchTrashedUsers() })
</script>

<template>
  <div class="p-4 space-y-6 bg-emerald-50">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-gray-800 text-lg font-bold">Users Management</h3>
      <Button type="primary" size="middle" @click="openCreateModal">
        <PlusOutlined /> Add User
      </Button>
    </div>

    <!-- USERS TABLE -->
    <Card>
      <div class="overflow-x-auto">
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
          { title: 'Action', key: 'actions', width: 100, slots: { customRender: 'actionsCell' } }
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
            <div class="flex flex-wrap items-center gap-2 p-2">
              <Input v-model:value="searchText" size="small" placeholder="Search name/email" class="flex-1 min-w-[150px] max-w-[250px]" @input="handleSearchChange" @pressEnter="triggerSearch" @blur="triggerSearch"/>
              <Select v-model:value="roleFilter" size="small" allow-clear placeholder="All Roles" class="w-[120px]" :options="[{label:'All Roles', value:null},{label:'User', value:'user'},{label:'Admin', value:'admin'},{label:'Superadmin', value:'superadmin'}]" @change="handleRoleChange"/>
              <Button size="small" @click="refreshBothTables" :loading="loading"><ReloadOutlined /> Refresh</Button>
            </div>
          </template>

          <template #emptyText>
            <div class="text-center py-4 text-sm">
              No users found. Click "Add User" to create one.
            </div>
          </template>

          <template #indexCell="{ index }">{{ (pagination.current-1)*pagination.pageSize+index+1 }}</template>
          <template #roleCell="{ record }"><Tag :color="record.role==='superadmin'?'orange':record.role==='admin'?'blue':'green'" class="text-xs px-2 py-1">{{ record.role }}</Tag></template>
          <template #balanceCell="{ record }"><div class="text-right text-sm font-medium text-emerald-600">₦{{ Number(record.wallet?.balance||0).toLocaleString() }}</div></template>
          <template #createdCell="{ record }"><div class="text-sm">{{ new Date(record.created_at).toLocaleDateString() }}</div></template>
          <template #actionsCell="{ record }">
            <Dropdown trigger="click" placement="bottomRight">
              <Button type="text" size="small" shape="circle" class="!w-8 !h-8 !p-0">⋯</Button>
              <template #overlay>
                <div class="action-menu p-2 min-w-[140px]">
                  <Button block type="link" size="small" class="text-left py-1" @click="router.push(`/superadmin/users/${record.id}`)"><EyeOutlined class="mr-1"/>View</Button>
                  <Button block type="link" size="small" class="text-left py-1" @click="openFundModal(record)"><WalletOutlined class="mr-1"/>Fund</Button>
                  <Button block type="link" size="small" class="text-left py-1" @click="openDebitModal(record)"><CreditCardOutlined class="mr-1"/>Debit</Button>
                  <Button block type="link" danger size="small" class="text-left py-1" @click="openDeleteModal(record)"><DeleteOutlined class="mr-1"/>Delete</Button>
                </div>
              </template>
            </Dropdown>
          </template>
        </Table>
      </div>
    </Card>

    <!-- TRASH TABLE -->
    <Card>
      <div class="overflow-x-auto">
        <Table
          :columns="[
            { title:'#', key:'index', width:60, slots:{ customRender:'trashIndexCell' } },
            { title:'Name', dataIndex:'name', key:'name', width:140, ellipsis:true },
            { title:'Email', dataIndex:'email', key:'email', width:180, ellipsis:true },
            { title:'Role', dataIndex:'role', key:'role', width:100, slots:{ customRender:'trashRoleCell' } },
            { title:'Balance', key:'balance', width:110, align:'right', slots:{ customRender:'trashBalanceCell' } },
            { title:'Phone', dataIndex:'phone', key:'phone', width:120 },
            { title:'Deleted', dataIndex:'deleted_at', key:'deleted_at', width:120, slots:{ customRender:'deletedCell' } },
            { title:'Action', key:'actions', width:80, slots:{ customRender:'trashActionsCell' } }
          ]"
          :data-source="trashedUsers"
          :loading="trashLoading"
          :pagination="trashPagination"
          @change="handleTrashTableChange"
          row-key="id"
          :scroll="{ x:1100 }"
          size="middle"
          class="compact-table"
        >
          <template #title>
            <div class="flex flex-wrap items-center gap-2 p-2">
              <h4 class="text-gray-700 font-semibold flex-1 text-sm">🗑️ Trashed Users</h4>
              <Input v-model:value="searchText" size="small" placeholder="Search trashed users" class="flex-1 min-w-[150px] max-w-[220px]" @input="handleSearchChange" @pressEnter="fetchTrashedUsers" @blur="fetchTrashedUsers"/>
              <Select v-model:value="roleFilter" size="small" allow-clear placeholder="All Roles" class="w-[120px]" :options="[{label:'All Roles', value:null},{label:'User', value:'user'},{label:'Admin', value:'admin'},{label:'Superadmin', value:'superadmin'}]" @change="handleRoleChange"/>
              <Button size="small" @click="fetchTrashedUsers" :loading="trashLoading"><ReloadOutlined /> Refresh</Button>
            </div>
          </template>

          <template #emptyText>
            <div class="text-center py-4 text-sm">No trashed users</div>
          </template>

          <template #trashIndexCell="{ index }">{{ (trashPagination.current-1)*trashPagination.pageSize+index+1 }}</template>
          <template #trashBalanceCell="{ record }"><div class="text-right text-sm font-medium text-emerald-600">₦{{ Number(record.wallet?.balance||0).toLocaleString() }}</div></template>
          <template #deletedCell="{ record }"><div class="text-sm">{{ new Date(record.deleted_at).toLocaleDateString() }}</div></template>
          <template #trashActionsCell="{ record }">
            <Dropdown trigger="click" placement="bottomRight">
              <Button type="text" size="small" shape="circle" class="!w-8 !h-8 !p-0">⋯</Button>
              <template #overlay>
                <div class="action-menu p-2 min-w-[140px]">
                  <Button block type="link" danger size="small" class="text-left py-1" @click="openRestoreModal(record)">Restore</Button>
                </div>
              </template>
            </Dropdown>
          </template>
        </Table>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.compact-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-2 !px-3 text-sm;
}

.compact-table :deep(.ant-table-tbody td) {
  @apply !py-2 !px-3 text-sm;
}

@media (min-width: 640px) {
  .compact-table :deep(.ant-table-thead th),
  .compact-table :deep(.ant-table-tbody td) {
    @apply text-base;
  }
}

.action-dots:hover { @apply bg-gray-100 rounded-full; }
.action-menu { @apply bg-white border border-gray-200 rounded-lg shadow-lg; }
.action-menu :deep(.ant-btn:hover) { @apply bg-gray-50 rounded; }
</style>
