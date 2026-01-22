<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CbtSettingsSummary from '~/components/CBT/admin/settings/CbtSettingsSummary.vue'
import CbtSettingsModal from '~/components/CBT/admin/settings/CbtSettingsModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin']
})

const { $api } = useNuxtApp()

// Loading state
const loading = ref(false)

// Modal visibility
const showModal = ref(false)
const openModal = () => (showModal.value = true)
const closeModal = () => (showModal.value = false)

// CBT Settings (nullable until fetched)
type Settings = {
  subjects_count: number
  questions_per_subject: number
  duration_minutes: number
  exam_fee: number
}
const settings = ref<Settings | null>(null)

// Fetch settings from backend
const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await $api('/cbt/superadmin/settings')
    settings.value = res.data
  } catch (error) {
    console.error('Failed to fetch CBT settings', error)
  } finally {
    loading.value = false
  }
}

// Update settings on backend
const updateSettings = async (payload: Settings) => {
  loading.value = true
  try {
    const res = await $api('/cbt/superadmin/settings', {
      method: 'PUT',
      body: payload
    })
    settings.value = res.data
    closeModal()
  } catch (error) {
    console.error('Failed to update CBT settings', error)
  } finally {
    loading.value = false
  }
}

// Fetch on page load
onMounted(fetchSettings)
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-8 w-full">

    <!-- Header -->
    <div class="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 sm:p-8 rounded-2xl shadow-2xl text-white">
      <div class="flex flex-col lg:flex-row lg:items-center gap-6 max-w-7xl">

        <!-- Left Content -->
        <div class="flex items-center gap-4 lg:gap-6 flex-1">
          <div class="p-3 sm:p-4 lg:p-5 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm">
            <span class="text-2xl sm:text-3xl lg:text-4xl">⚙️</span>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">CBT Settings</h1>
            <p class="text-lg sm:text-xl opacity-90 mt-1">Configure exam structure, timing & pricing</p>
          </div>
        </div>

        <!-- Right Button -->
        <div class="mt-4 lg:mt-0 lg:flex-none">
          <button 
            @click="openModal"
            class="bg-white ml-auto text-emerald-600 hover:bg-emerald-50 font-black shadow-2xl px-8 py-4 text-lg flex items-center gap-2 rounded-xl transition-all duration-200 hover:scale-105 whitespace-nowrap"
            :disabled="!settings"
          >
            <span>✏️ Edit Settings</span>
          </button>
        </div>

      </div>
    </div>

    <!-- Summary Cards -->
    <CbtSettingsSummary v-if="settings" :settings="settings" />

    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-2xl shadow-2xl text-center animate-pulse">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p class="text-lg font-semibold text-gray-700">Loading settings...</p>
      </div>
    </div>

    <!-- Settings Modal -->
    <CbtSettingsModal
      v-if="settings"
      :open="showModal"
      :initial-settings="settings"
      :loading="loading"
      @update="updateSettings"
      @cancel="closeModal"
    />
  </div>
</template>
