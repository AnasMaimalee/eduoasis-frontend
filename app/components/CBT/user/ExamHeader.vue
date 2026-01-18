<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Tabs, Button } from 'ant-design-vue'

/* ---------------- PROPS & EMITS ---------------- */
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

/* ---------------- TIMER STATE ---------------- */
const remaining = ref<number>(0)
const locked = ref(false)
let interval: any = null

/* ---------------- SUBJECT STATE ---------------- */
const localSubject = ref(props.activeSubject)

/* keep parent + local in sync */
watch(
  () => props.activeSubject,
  v => (localSubject.value = v)
)

watch(localSubject, v => {
  emit('update:activeSubject', v)
})

/* ---------------- FORMAT TIME ---------------- */
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* ---------------- FETCH META ---------------- */
onMounted(async () => {
  try {
    const res = await $api(`/cbt/user/exam/${props.examId}/meta`)

    remaining.value = Number(res.time_remaining)

    if (isNaN(remaining.value)) {
      console.error('Invalid time_remaining', res)
      remaining.value = 0
      return
    }

    interval = setInterval(() => {
      remaining.value--

      if (remaining.value <= 0) {
        remaining.value = 0
        locked.value = true
        clearInterval(interval)
        emit('time-up')
      }
    }, 1000)
  } catch (e) {
    console.error(e)
  }
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

/* ---------------- TABS DATA ---------------- */
const tabSubjects = computed(() =>
  props.subjects.map(s => ({
    id: s,
    name: s,
  }))
)
</script>

<template>
  <div class="sticky top-0 bg-white z-50 shadow-md p-4 mb-4 rounded-lg">
    <!-- TOP BAR -->
    <div class="flex justify-between items-center mb-4">
      <div class="text-xl font-bold text-green-600">
        ⏱ Time Left: {{ formatTime(remaining) }}
      </div>

      <Button danger :disabled="locked" @click="$emit('time-up')">
        Submit Exam
      </Button>
    </div>

    <!-- SUBJECT TABS -->
    <Tabs v-model:activeKey="localSubject">
      <Tabs.TabPane
        v-for="s in tabSubjects"
        :key="s.id"
        :tab="s.name"
      />
    </Tabs>
  </div>
</template>
