<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { 
  LeftOutlined, RightOutlined, UserOutlined, SettingOutlined, LogoutOutlined, 
  DashboardOutlined, WalletOutlined, BankOutlined, UserOutlined as UserIcon,
  TeamOutlined, SettingOutlined as SettingIcon, AppstoreOutlined,
  FileSearchOutlined, FileTextOutlined, IdcardOutlined, CheckCircleOutlined,
  BellOutlined, BoxPlotOutlined
} from '@ant-design/icons-vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const sidebarOpen = ref(false) // mobile overlay state

// Detect mobile width
const isMobile = ref(false)
onMounted(() => {
  isMobile.value = window.innerWidth < 1024
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 1024
  })
})

const iconComponents: Record<string, any> = {
  'DashboardOutlined': DashboardOutlined,
  'WalletOutlined': WalletOutlined,
  'BankOutlined': BankOutlined,
  'UserOutlined': UserIcon,
  'TeamOutlined': TeamOutlined,
  'SettingOutlined': SettingIcon,
  'AppstoreOutlined': AppstoreOutlined,
  'FileSearchOutlined': FileSearchOutlined,
  'FileTextOutlined': FileTextOutlined,
  'IdcardOutlined': IdcardOutlined,
  'CheckCircleOutlined': CheckCircleOutlined,
  'BellOutlined': BellOutlined,
  'BoxPlotOutlined': BoxPlotOutlined,
}

const firstName = computed(() => auth.user?.name?.split(' ')[0] || 'Admin')
const currentRoute = computed(() => route.path)
const currentPageTitle = computed(() => (route.meta?.title as string) || 'Dashboard')
const menus = computed(() =>
  (auth.menus || []).map((menu: any) => ({
    title: menu.name,
    route: menu.route,
    icon: menu.icon || 'BoxPlotOutlined',
  }))
)

const navigate = (path: string) => {
  if (route.path !== path) {
    router.push(path)
    // Close sidebar on mobile after clicking a menu
    if (isMobile.value) sidebarOpen.value = false
  }
}

const logout = () => {
  auth.logout()
  router.push('/login')
}

// Toggle sidebar
const toggleSidebar = () => {
  if (isMobile.value) {
    sidebarOpen.value = !sidebarOpen.value
  } else {
    collapsed.value = !collapsed.value
  }
}
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar Overlay for Mobile -->
    <div
      v-if="isMobile"
      class="fixed inset-0 bg-black/20 z-40"
      @click="sidebarOpen = false"
      :class="sidebarOpen ? 'block' : 'hidden'"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:relative z-50 flex flex-col transition-all duration-300 ease-out border-r border-emerald-200/50 backdrop-blur-xl h-screen',
        collapsed ? 'w-24' : 'w-76',
        isMobile ? sidebarOpen ? 'translate-x-0' : '-translate-x-full' : 'translate-x-0'
      ]"
      :style="{ background: 'rgba(255, 255, 255, 0.95)' }"
    >
      <!-- Logo & Collapse Toggle -->
      <div class="h-20 flex items-center justify-between px-6 border-b border-emerald-100/50 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
            EO
          </div>
          <span v-if="!collapsed" class="font-black text-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            EduOasis
          </span>
        </div>
        <button @click="toggleSidebar" class="p-2 rounded-xl hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50 transition-all">
          <component :is="collapsed ? RightOutlined : LeftOutlined" class="w-6 h-6 text-emerald-600" />
        </button>
      </div>

      <!-- User Info -->
      <div v-if="!collapsed" class="px-6 py-8 border-b border-emerald-100/30 bg-gradient-to-b from-emerald-50/80 to-white/90 dark:from-emerald-900/30 dark:to-gray-800/90">
        <div class="flex items-center gap-4">
          <a-avatar size="large" :style="{ background: 'linear-gradient(135deg, #10b981, #34d399)' }">
            {{ firstName.charAt(0).toUpperCase() }}
          </a-avatar>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-xl text-gray-800 dark:text-white truncate">
              {{ auth.user?.name || 'Loading...' }}
            </p>
            <p class="text-sm text-emerald-700 dark:text-emerald-400 truncate">{{ auth.user?.email || '' }}</p>
            <a-tag
              :color="auth.userRole === 'superadmin' ? 'success' : auth.userRole === 'administrator' ? 'processing' : 'default'"
              class="mt-3 font-semibold px-3 py-1 text-xs shadow-md"
            >
              {{ auth.userRole.charAt(0).toUpperCase() + auth.userRole.slice(1) }}
            </a-tag>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="flex-1 overflow-y-auto py-6 px-2">
        <a-menu
          theme="light"
          mode="inline"
          :inline-collapsed="collapsed"
          :selected-keys="[currentRoute]"
          class="border-none bg-transparent"
        >
          <a-menu-item
            v-for="menu in menus"
            :key="menu.route"
            @click="navigate(menu.route)"
            class="mx-3 mb-2 rounded-2xl px-4 py-3 transition-all duration-300 hover:shadow-lg group border border-emerald-100/50 hover:border-emerald-200/80"
            :class="[
              currentRoute === menu.route 
                ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-700 shadow-emerald-200/50 border-emerald-300 font-semibold' 
                : 'hover:bg-emerald-50/80 hover:text-emerald-700 hover:shadow-emerald-100/50'
            ]"
          >
            <a-tooltip :title="collapsed ? menu.title : ''" placement="right" :mouse-enter-delay="0.3">
              <div class="flex items-center gap-4">
                <component
                  :is="iconComponents[menu.icon] || BoxPlotOutlined"
                  class="w-7 h-7 flex-shrink-0 transition-colors duration-300"
                  :class="currentRoute === menu.route ? 'text-emerald-600 shadow-md' : 'text-emerald-500/70 group-hover:text-emerald-600'"
                />
                <span v-if="!collapsed" class="text-base font-medium truncate tracking-wide">
                  {{ menu.title }}
                </span>
              </div>
            </a-tooltip>
          </a-menu-item>
        </a-menu>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-emerald-100/50 mt-auto">
        <a-button 
          block 
          size="large" 
          @click="logout"
          class="rounded-xl h-14 font-semibold shadow-lg hover:shadow-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-none"
        >
          <LogoutOutlined class="mr-2" />
          <span v-if="!collapsed">Sign Out</span>
        </a-button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen overflow-hidden lg:ml-0" :class="isMobile ? 'ml-0' : ''">
      <!-- Header -->
      <header class="h-20 lg:h-24 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg border-b border-emerald-100/50 flex items-center justify-between px-6 lg:px-8">
        <div class="flex items-center gap-6">
          <button
            v-if="isMobile"
            @click="toggleSidebar"
            class="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50 transition-all"
          >
            <LeftOutlined class="w-6 h-6 text-emerald-600" />
          </button>
          <h1 class="text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 bg-clip-text text-transparent drop-shadow-lg">
            {{ currentPageTitle }}
          </h1>
        </div>

        <!-- User Dropdown -->
        <a-dropdown placement="bottomRight">
          <div class="flex items-center gap-4 cursor-pointer px-4 py-2 rounded-2xl hover:bg-emerald-50/80 dark:hover:bg-emerald-900/50 transition-all duration-300 shadow-sm border border-emerald-200/50 hover:border-emerald-300/70">
            <a-avatar size="large" :style="{ background: 'linear-gradient(135deg, #10b981, #34d399)' }">
              {{ firstName.charAt(0).toUpperCase() }}
            </a-avatar>
            <div class="hidden lg:block min-w-0">
              <p class="text-sm text-emerald-600 font-medium">{{ auth.userRole }}</p>
            </div>
          </div>
          <template #overlay>
            <a-menu class="min-w-[200px] shadow-2xl border border-emerald-100/50 rounded-2xl overflow-hidden">
              <a-menu-item key="profile" class="px-6 py-4 hover:bg-emerald-50/50 border-b border-emerald-100/30">
                <UserOutlined class="mr-3 text-emerald-600" /> Profile
              </a-menu-item>
              <a-menu-item key="settings" class="px-6 py-4 hover:bg-emerald-50/50">
                <SettingOutlined class="mr-3 text-emerald-600" /> Settings
              </a-menu-item>
              <a-menu-divider class="my-0 bg-emerald-100/50" />
              <a-menu-item key="logout" danger class="px-6 py-4" @click="logout">
                <LogoutOutlined class="mr-3" /> Logout
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6 lg:p-10 min-h-[calc(100vh-5rem)]">
        <slot />
      </main>
    </div>
  </div>
</template>


<style scoped>
/* Enhanced Menu Styling */
:deep(.ant-menu-item) {
  border-radius: 20px !important;
  margin: 4px 8px !important;
  border: 1px solid transparent !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.ant-menu-item:hover) {
  border-color: rgba(16, 185, 129, 0.3) !important;
  transform: translateX(4px) !important;
}

:deep(.ant-menu-item-selected) {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(52, 211, 153, 0.2)) !important;
  border-color: rgba(16, 185, 129, 0.4) !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
  transform: translateX(2px) !important;
}

:deep(.ant-menu-item-selected::after) {
  border-right-color: #10b981 !important;
}

:deep(.anticon) {
  transition: all 0.3s ease !important;
}

/* Dark mode adjustments */
.dark :deep(.ant-menu-item:hover) {
  border-color: rgba(52, 211, 153, 0.4) !important;
}

.dark :deep(.ant-menu-item-selected) {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.3), rgba(16, 185, 129, 0.25)) !important;
}
</style>
