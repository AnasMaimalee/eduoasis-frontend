<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Table, Tag, Avatar, Pagination, Button, Dropdown, Menu } from 'ant-design-vue'
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  EyeOutlined, 
  FileTextOutlined, 
  BarChartOutlined, 
  EditOutlined 
} from '@ant-design/icons-vue'

const props = defineProps<{
  data: any[]
  pagination: {
    current: number
    pageSize: number
    total: number
  }
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'action', action: string, record: any): void
}>()

const getRankColor = (index: number) => {
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#10B981']
  return colors[index] || '#6B7280'
}

const getRankIcon = (index: number) => {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return `${index + 1}`
}

const isMobile = ref(false)

const handleMenuClick = (key: string, record: any) => {
  emit('action', key, record)
}

onMounted(() => {
  const checkMobile = () => isMobile.value = window.innerWidth < 768
  checkMobile()
  window.addEventListener('resize', checkMobile)
  onBeforeUnmount(() => window.removeEventListener('resize', checkMobile))
})
</script>

<template>
  <div class="w-full border border-emerald-200 rounded-2xl shadow-xl overflow-hidden bg-white">
    
    <!-- MOBILE: Cards -->
    <div v-if="isMobile" class="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
      <div 
        v-for="(record, index) in data.slice(0, 10)"
        :key="record.id" 
        class="bg-white border border-emerald-100 rounded-xl p-4 hover:shadow-lg hover:border-emerald-300 transition-all duration-200"
      >
        <div class="flex items-start justify-between mb-3">
          <!-- Rank -->
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg font-bold text-lg flex-shrink-0 mt-1"
            :style="{ backgroundColor: getRankColor(index), color: index < 3 ? 'white' : '#1f2937' }"
          >
            {{ getRankIcon(index) }}
          </div>
          
          <!-- Info + Score -->
          <div class="flex-1 ml-3 min-w-0">
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1">
                <div class="font-black text-lg text-gray-900 truncate mb-1">{{ record.name || 'Anonymous' }}</div>
                <div class="text-xs text-gray-600 truncate">{{ record.email }}</div>
              </div>
              <div class="text-2xl font-black text-emerald-600 ml-4 flex-shrink-0">
                {{ record.total_score || 0 }}
              </div>
            </div>
            <div v-if="record.state" class="flex items-center gap-2">
              <EnvironmentOutlined class="w-4 h-4 text-emerald-500" />
              <span class="text-emerald-700 font-bold text-sm bg-emerald-100 px-2 py-0.5 rounded-full">
                {{ record.state }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Mobile Actions Dropdown -->
        <div class="flex justify-end pt-2 border-t border-gray-100">
          <Dropdown :trigger="['click']" placement="bottomRight">
            <template #overlay>
              <Menu @click="(info) => handleMenuClick(info.key, record)">
                <Menu.Item key="view">
                  <EyeOutlined class="mr-2" />
                  View Profile
                </Menu.Item>
                <Menu.Item key="exams">
                  <FileTextOutlined class="mr-2" />
                  Exam History
                </Menu.Item>
                <Menu.Item key="stats">
                  <BarChartOutlined class="mr-2" />
                  Performance Stats
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="edit">
                  <EditOutlined class="mr-2" />
                  Edit User
                </Menu.Item>
              </Menu>
            </template>
            <Button type="text" size="small" class="text-gray-500 hover:text-emerald-600 p-1 text-lg">
              ⋯
            </Button>
          </Dropdown>
        </div>
      </div>
    </div>

    <!-- DESKTOP: Table -->
    <div v-else class="overflow-x-auto">
      <Table :data-source="data" row-key="id" :pagination="false" :scroll="{ x: 1000 }" class="leaderboard-table">
        <Table.Column title="#" width="70" align="center" fixed="left">
          <template #default="{ index }">
            <div class="flex flex-col items-center gap-1 p-2">
              <div 
                class="w-14 h-14 rounded-lg flex items-center justify-center shadow-lg font-bold text-lg border-2"
                :style="{ backgroundColor: getRankColor(index), color: index < 3 ? 'white' : '#1f2937' }"
              >
                {{ getRankIcon(index) }}
              </div>
            </div>
          </template>
        </Table.Column>

        <Table.Column title="Competitor" width="300" fixed="left">
          <template #default="{ record }">
            <div class="flex items-center gap-3 p-2">
              <Avatar size="38" :style="{ background: '#10b981' }">
                <UserOutlined />
              </Avatar>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-sm text-gray-900 truncate">{{ record.name || 'Anonymous' }}</div>
                <div class="text-xs text-gray-600 truncate">{{ record.email }}</div>
              </div>
            </div>
          </template>
        </Table.Column>

        <Table.Column title="📍" width="100" align="center">
          <template #default="{ record }">
            <div v-if="record.state" class="flex flex-col items-center gap-1">
              <EnvironmentOutlined class="text-emerald-500 text-lg" />
              <span class="text-emerald-700 font-bold text-xs bg-emerald-100 px-2 py-px rounded mt-1 block">
                {{ record.state }}
              </span>
            </div>
            <span v-else class="text-gray-400 text-xs">—</span>
          </template>
        </Table.Column>

        <Table.Column title="Score" width="130" align="center">
          <template #default="{ record }">
            <div class="flex flex-col items-center gap-1">
              <div class="text-xl font-black bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-md">
                {{ record.total_score || 0 }}
              </div>
              <div class="text-xs text-emerald-700 font-bold uppercase tracking-wider">Score</div>
            </div>
          </template>
        </Table.Column>

        <!-- DESKTOP Actions Dropdown -->
        <Table.Column width="70" align="center" fixed="right">
          <template #default="{ record }">
            <Dropdown :trigger="['click']" placement="bottomRight">
              <template #overlay>
                <Menu @click="(info) => handleMenuClick(info.key, record)">
                  <Menu.Item key="view">
                    <EyeOutlined class="mr-2" />
                    View Profile
                  </Menu.Item>
                  <Menu.Item key="exams">
                    <FileTextOutlined class="mr-2" />
                    Exam History
                  </Menu.Item>
                  <Menu.Item key="stats">
                    <BarChartOutlined class="mr-2" />
                    Performance Stats
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="edit">
                    <EditOutlined class="mr-2" />
                    Edit User
                  </Menu.Item>
                </Menu>
              </template>
              <Button type="text" size="small" class="text-gray-500 hover:text-emerald-600 p-1 text-lg mx-auto block">
                ⋯
              </Button>
            </Dropdown>
          </template>
        </Table.Column>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="px-4 py-4 sm:px-8 sm:py-6 bg-gray-50 border-t border-emerald-200">
      <div class="flex flex-col sm:flex-row sm:justify-between items-center gap-3">
        <div class="text-sm text-gray-600">Showing {{ data.length }} of {{ pagination.total }} warriors</div>
        <Pagination
          v-model:current="pagination.current"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :show-size-changer="false"
          :show-quick-jumper="false"
          @change="emit('page-change', $event)"
          class="w-full sm:w-auto"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-table :deep(.ant-table-thead th) {
  background: #059669 !important;
  color: white !important;
  font-weight: 700 !important;
  font-size: 12px !important;
  padding: 12px 8px !important;
  border-right: 1px solid rgba(255,255,255,0.2) !important;
}

.leaderboard-table :deep(.ant-table-thead th:last-child) {
  border-right: none !important;
}

.leaderboard-table :deep(.ant-table-tbody tr) {
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.leaderboard-table :deep(.ant-table-tbody tr:hover) {
  background: rgba(16, 185, 129, 0.08) !important;
}

/* Fix Dropdown prefixCls */
:deep(.ant-dropdown) {
  z-index: 1050;
}
</style>
