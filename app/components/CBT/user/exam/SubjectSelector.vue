<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message, Button, Select } from 'ant-design-vue'
import { BookOutlined } from '@ant-design/icons-vue'

const { $api } = useNuxtApp()

/* ---------------- STATE ---------------- */
const subjects = ref<{ id: string; name: string }[]>([])
const selectedSubjects = ref<string[]>([])
const loadingSubjects = ref(false) // for fetching subjects
const loadingExamStart = ref(false) // for start button

/* ---------------- COMPUTED ---------------- */
const progressCount = computed(() => selectedSubjects.value.length)

const subjectOptions = computed(() =>
  subjects.value.map(subject => ({
    value: subject.id,
    label: subject.name,
    disabled:
      progressCount.value >= 4 &&
      !selectedSubjects.value.includes(subject.id),
  }))
)
const examFee = ref('')
const getExamFee = async () => {
  try {
    const res =  await $api('/cbt/user/exam-fee')
    examFee.value = res.exam_fee
    console.log(examFee, "Exam Feee")
  } catch {
    message.error('Failed to Load Subjects')
  }
}
/* ---------------- METHODS ---------------- */
const loadSubjects = async () => {
  loadingSubjects.value = true
  try {
    const res = await $api('/cbt/subjects')
    subjects.value = Array.isArray(res.data) ? res.data : []
  } catch {
    message.error('Failed to load subjects')
    subjects.value = []
  } finally {
    loadingSubjects.value = false
  }
}

const startExam = async () => {
  if (progressCount.value !== 4) {
    message.error('Please select exactly 4 subjects')
    return
  }

  loadingExamStart.value = true

  try {
    const res = await $api('/cbt/user/exam/start', {
      method: 'POST',
      body: { subjects: selectedSubjects.value },
    })

    message.success('Exam started successfully!')

    // 🔹 Redirect to exam page
    navigateTo(`/user/cbt/exam/${res.data.exam_id}`)
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to start exam')
  } finally {
    loadingExamStart.value = false
  }
}

const progressPercent = computed(() => {
  return (progressCount.value / 4) * 100
})

/* ---------------- LIFECYCLE ---------------- */
onMounted(loadSubjects)
onMounted(getExamFee)
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <div
      class="bg-white border-2 border-emerald-200 rounded-2xl shadow-xl overflow-hidden"
    >
      <!-- HEADER -->
      <div
        class="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-white text-center"
      >
        <div
          class="w-16 h-16 mx-auto mb-4 bg-white/30 rounded-xl flex items-center justify-center"
        >
          <BookOutlined class="text-2xl" />
        </div>
        <h1 class="text-3xl font-bold mb-1">JAMB CBT</h1>
        <p class="text-lg">Select 4 Subjects</p>
      </div>

      <!-- CONTENT -->
      <div class="p-8 space-y-8">
        <!-- SUBJECT SELECT -->
        <div>
          <label
            class="block text-xl font-bold text-gray-800 mb-4 text-center"
          >
            {{ progressCount }}/4 Subjects Selected
          </label>

          <Select
            v-model:value="selectedSubjects"
            mode="multiple"
            :loading="loadingSubjects"
            :options="subjectOptions"
            :max-tag-count="4"
            size="large"
            class="w-full"
            :placeholder="
              progressCount === 4
                ? '4 selected – remove to change'
                : 'Choose subjects'
            "
            dropdown-class-name="company-green-dropdown"
          />
        </div>

        <!-- PROGRESS -->
        <div class="flex justify-center">
          <div
            class="relative w-28 h-28 rounded-full flex items-center justify-center"
            :style="{
              background: `conic-gradient(
                #10b981 ${progressPercent}%,
                #d1fae5 ${progressPercent}% 100%
              )`
            }"
          >
            <!-- inner circle -->
            <div
              class="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow"
            >
              <div class="text-3xl font-bold text-emerald-600">
                {{ progressCount }}
              </div>
              <div class="text-xs text-gray-500">/4</div>
            </div>
          </div>
        </div>


        <!-- START BUTTON -->
        <Button
          type="primary"
          block
          size="large"
          :loading="loadingExamStart"
          :disabled="progressCount !== 4 || loadingExamStart"
          @click="startExam"
          class="h-16 text-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl"
        >
          {{ loadingExamStart ? 'Starting...' : `Pay ₦${examFee} & Start Exam` }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.company-green-dropdown
  :deep(.ant-select-item-option-content) {
  color: #15803d !important;
}

.company-green-dropdown
  :deep(.ant-select-item-option-active) {
  background: rgba(34, 197, 94, 0.1) !important;
}

.company-green-dropdown
  :deep(.ant-select-item-option-disabled) {
  color: #9ca3af !important;
  opacity: 0.5;
}
</style>
