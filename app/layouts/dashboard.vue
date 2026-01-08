<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { LeftOutlined, RightOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue'

// All icons from backend
import {
  DashboardOutlined,
  WalletOutlined,
  BankOutlined,
  UserOutlined as UserIcon,
  TeamOutlined,
  SettingOutlined as SettingIcon,
  AppstoreOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  BellOutlined,
  BoxPlotOutlined,
} from '@ant-design/icons-vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const collapsed = ref(false)

// ✅ PERFECT ICON MAPPING
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
  'UserSwitchOutlined': TeamOutlined, // Fallback
  'AppstoreAddOutlined': SettingIcon,  // Fallback
  'DollarOutlined': WalletOutlined,    // Fallback
  'NotificationOutlined': BellOutlined, // Fallback
  'FileDoneOutlined': FileTextOutlined, // Fallback
}

const firstName = computed(() => {
  if (!auth.user?.name) return 'Admin'
  return auth.user.name.split(' ')[0]
})

const currentRoute = computed(() => route.path)

const currentPageTitle = computed(() => {
  return (route.meta?.title as string) || 'Dashboard'
})

const menus = computed(() => {
  return (auth.menus || []).map((menu: any) => ({
    title: menu.name,
    route: menu.route,
    icon: menu.icon || 'BoxPlotOutlined',
  }))
})

const navigate = (path: string) => {
  if (route.path !== path) {
    router.push(path)
  }
}

const logout = () => {
  auth.logout()
  router.push('/login')
}

// NO onMounted here anymore!
// The global middleware handles authentication
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700',
        collapsed ? 'w-20' : 'w-72'
      ]"
    >
      <!-- Logo & Collapse Toggle -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-600 to-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
            E
          </div>
          <span v-if="!collapsed" class="font-bold text-xl text-gray-800 dark:text-white">Edu Oasis</span>
        </div>
        <a-button @click="collapsed = !collapsed" type="text" class="text-primary hover:text-indigo-700">
          <component :is="collapsed ? RightOutlined : LeftOutlined" class="w-5 h-5" />
        </a-button>
      </div>

      <!-- User Info (hidden when collapsed) -->
      <div v-if="!collapsed" class="px-5 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50/50 to-primary/5 dark:from-gray-800 dark:to-gray-900">
        <div class="flex items-center gap-4">
          <a-avatar size="large" class="shadow-md" style="background-color:#1e3a8a">
            {{ firstName.charAt(0).toUpperCase() }}
          </a-avatar>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 dark:text-white truncate">{{ auth.user?.name || 'Loading...' }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ auth.user?.email || '' }}</p>
            <a-tag
              :color="auth.userRole === 'superadmin' ? 'purple' : auth.userRole === 'administrator' ? 'blue' : 'green'"
              class="mt-2 text-xs"
            >
              {{ auth.userRole.charAt(0).toUpperCase() + auth.userRole.slice(1) }}
            </a-tag>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="flex-1 overflow-y-auto py-4">
        <a-menu
          theme="light"
          mode="inline"
          :inline-collapsed="collapsed"
          :selected-keys="[currentRoute]"
          class="border-r-0"
        >
          <a-menu-item
            v-for="menu in menus"
            :key="menu.route"
            @click="navigate(menu.route)"
            class="mx-3 rounded-lg mb-1 transition-all group"
            :class="currentRoute === menu.route ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            <a-tooltip :title="collapsed ? menu.title : ''" placement="right">
              <div class="flex items-center gap-4">
                <component
                  :is="iconComponents[menu.icon] || BoxPlotOutlined"
                  class="w-6 h-6 flex-shrink-0 text-primary group-hover:text-indigo-700"
                  :class="currentRoute === menu.route ? 'text-primary' : 'text-gray-600 dark:text-gray-400'"
                />
                <span v-if="!collapsed" class="text-base truncate">{{ menu.title }}</span>
              </div>
            </a-tooltip>
          </a-menu-item>
        </a-menu>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-8 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-white">{{ currentPageTitle }}</h1>

        <!-- User Dropdown -->
        <a-dropdown placement="bottomRight">
          <div class="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <a-avatar size="default" style="background-color:#1e3a8a">
              {{ firstName.charAt(0).toUpperCase() }}
            </a-avatar>
            <div class="hidden md:block">
              <p class="font-medium text-gray-800 dark:text-white">{{ firstName }}</p>
            </div>
          </div>
          <template #overlay>
            <a-menu class="shadow-lg">
              <a-menu-item @click="navigate('/profile')">
                <UserOutlined class="mr-2" /> Profile
              </a-menu-item>
              <a-menu-item @click="navigate('/settings')">
                <SettingOutlined class="mr-2" /> Settings
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item danger @click="logout">
                <LogoutOutlined class="mr-2" /> Logout
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="text-center text-sm text-gray-500 dark:text-gray-400 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        © {{ new Date().getFullYear() }} JAMB Fortal • All rights reserved
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Selected menu item */
:deep(.ant-menu-item-selected) {
  background-color: rgba(30, 58, 138, 0.1) !important;
  color: #1e3a8a !important;
  border-right: 4px solid #1e3a8a;
  font-weight: 500;
}

:deep(.ant-menu-item-selected .anticon) {
  color: #1e3a8a !important;
}

/* Hover */
:deep(.ant-menu-item:hover:not(.ant-menu-item-selected)) {
  background-color: #f5f9ff !important;
  color: #1e3a8a !important;
}

:deep(.ant-menu-item:hover .anticon) {
  color: #1e3a8a !important;
}

/* Dark mode tweaks */
.dark :deep(.ant-menu-item-selected) {
  background-color: rgba(30, 58, 138, 0.2) !important;
}

.dark :deep(.ant-menu-item:hover:not(.ant-menu-item-selected)) {
  background-color: #334155 !important;
}
</style>