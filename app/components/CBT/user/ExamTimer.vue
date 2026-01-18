<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Tabs, Button } from 'ant-design-vue'

const props = defineProps<{
  examId: string
  subjects: string[]
  activeSubject: string
}>()

const emit = defineEmits<{
  (e: 'update:activeSubject', value: string): void
  (e: 'time-up'): void
}>()

const { $api } = useNuxtApp()

/* ---------------- STATE ---------------- */
const remainingSeconds = ref(0)     // total seconds left (integer only)
const locked = ref(false)
const localSubject = ref(props.activeSubject)
let interval: number | null = null

/* ---------------- SYNC SUBJECT ---------------- */
watch(() => props.activeSubject, v => {
  localSubject.value = v
})

watch(localSubject, v => {
  emit('update:activeSubject', v)
})

/* ---------------- CLEAN TIME FORMAT (HH:MM:SS or MM:SS) ---------------- */
const formattedTime = computed(() => {
  const total = Math.max(0, remainingSeconds.value)

  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`
  }

  return `${mm}:${ss}`
})

/* ---------------- FETCH & START COUNTDOWN ---------------- */
onMounted(async () => {
  try {
    const res = await $api(`/cbt/user/exam/${props.examId}/meta`)

    // Force clean integer seconds
    remainingSeconds.value = Math.max(0, Math.floor(Number(res.time_remaining) || 0))

    interval = setInterval(() => {
      if (remainingSeconds.value <= 0) {
        remainingSeconds.value = 0
        locked.value = true
        if (interval) clearInterval(interval)
        emit('time-up')
      } else {
        remainingSeconds.value -= 1
      }
    }, 1000)
  } catch (err) {
    console.error('Failed to load exam meta:', err)
    // Optional: fallback or show error to user
  }
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

/* ---------------- SUBJECT TABS ---------------- */
const tabSubjects = computed(() =>
  props.subjects.map(s => ({ id: s, name: s }))
)
</script>

<template>
  <div class="sticky top-0 z-50 mb-6 rounded-xl bg-emerald-600 shadow-lg p-4">
    <!-- TOP BAR: Time + Submit -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
      <div class="text-xl sm:text-2xl font-bold text-white tracking-tight">
        ⏱ Time Left: {{ formattedTime }}
      </div>

      <Button
        type="primary"
        danger
        size="large"
        :disabled="locked"
        @click="emit('time-up')"
      >
        Submit Exam
      </Button>
    </div>

    <!-- SUBJECT TABS -->
    <Tabs
      v-model:activeKey="localSubject"
      type="card"
      :tabBarStyle="{ background: 'rgba(255,255,255,0.1)', border: 'none' }"
      :tabBarGutter="8"
    >
      <Tabs.TabPane
        v-for="subject in tabSubjects"
        :key="subject.id"
        :tab="subject.name"
      />
    </Tabs>
  </div>
</template>

<style scoped>
/* Optional: nicer look for dark mode or emerald theme */
:deep(.ant-tabs-tab) {
  color: white !important;
  font-weight: 500;
}
:deep(.ant-tabs-tab-active) {
  background: rgba(255, 255, 255, 0.25) !important;
  border-radius: 8px 8px 0 0 !important;
}
</style>