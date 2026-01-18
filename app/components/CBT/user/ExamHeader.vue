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
const remainingSeconds = ref(0)
const locked = ref(false)
const localSubject = ref(props.activeSubject)
let interval: any = null

/* ---------------- SUBJECT SYNC ---------------- */
watch(() => props.activeSubject, v => (localSubject.value = v))
watch(localSubject, v => emit('update:activeSubject', v))

/* ---------------- TIME FORMAT ---------------- */
const formattedTime = computed(() => {
  const m = Math.floor(remainingSeconds.value / 60)
  const s = remainingSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

/* ---------------- FETCH META ---------------- */
onMounted(async () => {
  try {
    const res = await $api(`/cbt/user/exam/${props.examId}/meta`)
    remainingSeconds.value = Number(res.time_remaining) || 0

    interval = setInterval(() => {
      if (remainingSeconds.value <= 0) {
        remainingSeconds.value = 0
        locked.value = true
        clearInterval(interval)
        emit('time-up')
      } else {
        remainingSeconds.value--
      }
    }, 1000)
  } catch (e) {
    console.error(e)
  }
})

onUnmounted(() => interval && clearInterval(interval))

/* ---------------- TABS ---------------- */
const tabSubjects = computed(() =>
  props.subjects.map(s => ({ id: s, name: s }))
)
</script>

<template>
  <div class="sticky top-0 z-50 mb-4 rounded-xl bg-emerald-500 shadow-md">

    <!-- HEADER -->
    <div class="flex justify-between items-center px-4 py-3 text-white">
      <div class="text-sm sm:text-lg font-bold">
        ⏱ Time Left: {{ formattedTime }}
      </div>

      <Button
        danger
        size="small"
        :disabled="locked"
        @click="$emit('time-up')"
      >
        Submit Exam
      </Button>
    </div>

    <!-- SUBJECT TABS -->
    <div class="bg-white rounded-b-xl px-2 pt-2">
      <Tabs v-model:activeKey="localSubject">
        <Tabs.TabPane
          v-for="s in tabSubjects"
          :key="s.id"
          :tab="s.name"
        />
      </Tabs>
    </div>

  </div>
</template>
