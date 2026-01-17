<script setup lang="ts">import { reactive, onMounted } from 'vue'
import CbtSettingsSummary from '@/components/CBT/admin/settings/CbtSettingsSummary.vue'
import CbtSettingsModal from '@/components/CBT/admin/settings/CbtSettingsModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin']
})

const { $api } = useNuxtApp()
const loading = ref(false)
const showModal = ref(false)

/* ✅ ADD THESE */
const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const settings = reactive({
  subjects_count: 4,
  questions_per_subject: 15,
  duration_minutes: 120,
  exam_fee: 0
})

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await $api('/cbt/superadmin/settings')
    Object.assign(settings, res.data)
  } finally {
    loading.value = false
  }
}

const updateSettings = async (payload: any) => {
  loading.value = true
  try {
    const res = await $api('/cbt/superadmin/settings', {
      method: 'PUT',
      body: payload
    })

    Object.assign(settings, res.data)
    closeModal()
  } finally {
    loading.value = false
  }
}

onMounted(fetchSettings)

</script>


<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-8 w-full">
   <!-- Header -->
    <div class="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 sm:p-8 rounded-2xl shadow-2xl text-white">
      <div class="flex flex-col lg:flex-row lg:items-center gap-6 max-w-7xl">
        
        <!-- Left Content - Title & Description -->
        <div class="flex items-center gap-4 lg:gap-6 flex-1">
          <div class="p-3 sm:p-4 lg:p-5 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm">
            <span class="text-2xl sm:text-3xl lg:text-4xl">⚙️</span>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">CBT Settings</h1>
            <p class="text-lg sm:text-xl opacity-90 mt-1">Configure exam structure, timing & pricing</p>
          </div>
        </div>

        <!-- Right Button - Always End Aligned -->
        <div class="mt-4 lg:mt-0 lg:flex-none">
          <button 
            @click="openModal"
            class="bg-white ml-auto text-emerald-600 hover:bg-emerald-50 font-black shadow-2xl px-8 py-4 text-lg flex items-center gap-2 rounded-xl transition-all duration-200 hover:scale-105 whitespace-nowrap"
          >
            <span>✏️ Edit Settings</span>
          </button>
        </div>

      </div>
    </div>



    <!-- Summary Cards -->
    <CbtSettingsSummary :settings="settings" />

    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-2xl shadow-2xl text-center animate-pulse">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p class="text-lg font-semibold text-gray-700">Loading settings...</p>
      </div>
    </div>

    <!-- MODAL -->
    <CbtSettingsModal
      :open="showModal"
      :initial-settings="settings"
      :loading="loading"
      @update="updateSettings"
      @cancel="closeModal"
    />


  </div>
</template>
