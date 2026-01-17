<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message, Card, Button, Select, Spin } from 'ant-design-vue'
import { PlayCircleOutlined, BookOutlined, CalendarOutlined } from '@ant-design/icons-vue'

const emit = defineEmits<{
  (e: 'exam-started', exam: any): void
}>()

const { $api } = useNuxtApp()

const subjects = ref<{ id: number; name: string }[]>([])
const selectedSubjects = ref<number[]>([])
const selectedYear = ref('all')
const loading = ref(false)
const englishId = ref<number | null>(null)

const years = ['all', '2025', '2024', '2023', '2022']
const subjectOptions = computed(() => 
  subjects.value.map(s => ({ label: s.name, value: s.id }))
)

const fetchSubjects = async () => {
  loading.value = true
  try {
    const { data } = await $api('/cbt/subjects')
    subjects.value = data || []
    englishId.value = subjects.value.find(s => 
      s.name.toLowerCase().includes('english language')
    )?.id || null
  } catch (error) {
    message.error('Failed to load subjects')
  } finally {
    loading.value = false
  }
}

const startExam = async () => {
  if (!englishId.value || selectedSubjects.value.length !== 4) {
    message.error('Select English + 3 subjects')
    return
  }
  if (selectedSubjects.value[0] !== englishId.value) {
    message.error('English must be first subject')
    return
  }

  loading.value = true
  try {
    const { data } = await $api('/cbt/user/exam/start', {
      method: 'POST',
      body: {
        subjects: selectedSubjects.value,
        year: selectedYear.value !== 'all' ? selectedYear.value : undefined
      }
    })
    emit('exam-started', data)
    message.success('Exam started successfully!')
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Failed to start exam')
  } finally {
    loading.value = false
  }
}

onMounted(fetchSubjects)
</script>

<template>
  <div class="max-w-sm mx-auto">
    <Card class="border-0 shadow-2xl bg-gradient-to-br from-emerald-400/10 to-teal-400/10 backdrop-blur-sm border-emerald-200/50">
      <div class="p-6 sm:p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
            <BookOutlined class="text-3xl text-white" />
          </div>
          <h1 class="text-3xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
            JAMB CBT
          </h1>
          <p class="text-emerald-700 font-semibold text-lg">Practice Exam</p>
        </div>

        <!-- Year Filter -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-emerald-800 mb-3 flex items-center">
            <CalendarOutlined class="mr-2" />
            Filter by Year
          </label>
          <Select 
            v-model:value="selectedYear"
            :options="years.map(y => ({ label: y, value: y }))"
            size="large" 
            class="w-full" 
          />
        </div>

        <!-- Subjects -->
        <div class="space-y-5 mb-8">
          <!-- English (Compulsory) -->
          <div>
            <label class="block text-lg font-bold text-emerald-800 mb-3 bg-emerald-100 px-4 py-2 rounded-full border-2 border-emerald-300">
              🇳🇬 1. English (Required)
            </label>
            <Select 
              v-model:value="selectedSubjects[0]"
              :options="subjectOptions"
              size="large" 
              class="w-full border-2 border-emerald-300 focus:border-emerald-500"
              placeholder="Select English Language"
            />
          </div>

          <!-- Other Subjects -->
          <div v-for="i in 3" :key="i">
            <label class="block text-base font-semibold text-gray-800 mb-2">
              {{ i + 1 }}. Subject {{ i + 1 }}
            </label>
            <Select 
              v-model:value="selectedSubjects[i]"
              :options="subjectOptions"
              size="large" 
              class="w-full"
              :disabled="!selectedSubjects[0]"
              placeholder="Choose subject"
            />
          </div>
        </div>

        <!-- Start Button -->
        <Button
          type="primary"
          size="large"
          :loading="loading"
          @click="startExam"
          class="w-full h-16 text-xl font-black shadow-2xl border-none bg-gradient-to-r from-emerald-500 via-green-600 to-teal-500 hover:from-emerald-600 hover:via-green-700 hover:to-teal-600"
          :disabled="!englishId || selectedSubjects.filter(Boolean).length !== 4"
        >
          <PlayCircleOutlined class="mr-2 text-xl" />
          Start Exam (2 Hours)
        </Button>

        <!-- Info Box -->
        <div class="mt-6 p-4 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-200 rounded-2xl backdrop-blur-sm">
          <p class="text-sm text-emerald-800 font-medium flex items-center justify-center">
            ⏰ 120 minutes • Auto-save enabled • English compulsory
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>
