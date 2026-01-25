<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CbtSettingsSummary from '~/components/CBT/admin/settings/CbtSettingsSummary.vue'
import CbtSettingsModal from '~/components/CBT/admin/settings/CbtSettingsModal.vue'
import { message } from 'ant-design-vue'
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: "CBT Setting"
})

const { $api } = useNuxtApp()

// Loading state
const loading = ref(false)

// Modal visibility
const showModal = ref(false)
const openModal = () => (showModal.value = true)
const closeModal = () => (showModal.value = false)

// CBT Settings
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
    message.error('Failed to load CBT settings')
  } finally {
    loading.value = false
  }
}

// Update settings from modal
const updateSettings = async (updated: Settings) => {
  loading.value = true
  try {
    await $api('/cbt/superadmin/settings', {
      method: 'PUT',
      body: updated
    })

    closeModal()          // ✅ close modal
    await fetchSettings() // ✅ REFRESH DATA
    message.success('Settings updated successfully')

  } catch (err: any) {
    console.error(err)
    message.error(err.data?.message || 'Failed to update CBT settings')
  } finally {
    loading.value = false
  }
}


// Fetch on mount
onMounted(fetchSettings)
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-8 w-full bg-emerald-50">

    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <!-- Title -->
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl bg-emerald-100 text-emerald-600">
            ⚙️
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800">
              CBT Settings
            </h1>
            <p class="text-sm text-gray-500">
              Control exam structure, timing & pricing
            </p>
          </div>
        </div>

        <!-- Action -->
        <button
          @click="openModal"
          :disabled="!settings"
          class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-white font-semibold shadow hover:bg-emerald-700 transition disabled:opacity-50"
        >
          ✏️ Edit Settings
        </button>

      </div>
    </div>


    <!-- Summary -->
   <CbtSettingsSummary
      v-if="settings"
      :key="JSON.stringify(settings)"
      :settings="settings"
    />


    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-2xl shadow-2xl text-center animate-pulse">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p class="text-lg font-semibold text-gray-700">Loading settings...</p>
      </div>
    </div>

    <!-- Modal -->
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
