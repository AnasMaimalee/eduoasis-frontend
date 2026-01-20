<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Tabs, Button } from 'ant-design-vue'

const props = defineProps<{
  examId: string
  subjects: string[]
  activeSubject: string
}>()

const emit = defineEmits<{
  'update:activeSubject': [value: string]
  'time-up': []
}>()

const { $api } = useNuxtApp()

/* ---------------- STATE ---------------- */
const remainingSeconds = ref(0)
const totalExamSeconds = ref(7200) // 2 hours default (update from API)
const locked = ref(false)
const localSubject = ref(props.activeSubject)
let interval: NodeJS.Timeout | null = null

/* ---------------- TIME PROGRESS ---------------- */
const timeProgress = computed(() => {
  if (totalExamSeconds.value === 0) return 0
  return Math.max(0, (remainingSeconds.value / totalExamSeconds.value) * 100)
})

const progressColor = computed(() => {
  const percentLeft = timeProgress.value
  if (percentLeft > 50) return 'bg-emerald-500'
  if (percentLeft > 25) return 'bg-orange-500'
  return 'bg-red-500'
})

const timeStatus = computed(() => {
  const percentLeft = timeProgress.value
  if (percentLeft > 50) return '🟢 Plenty of time'
  if (percentLeft > 25) return '🟡 Stay focused'
  return '🔴 ⏳ Hurry up!'
})

/* ---------------- MM:SS FORMAT (23:40 style) ---------------- */
const formattedTime = computed(() => {
  const total = Math.max(0, remainingSeconds.value)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

/* ---------------- SUBJECT SYNC ---------------- */
watch(() => props.activeSubject, (value) => {
  localSubject.value = value
})
watch(localSubject, (value) => {
  emit('update:activeSubject', value)
})

/* ---------------- COUNTDOWN ---------------- */
const startCountdown = async () => {
  try {
    const res = await $api(`/cbt/user/exam/${props.examId}/meta`)
    remainingSeconds.value = Math.floor(Number(res.data?.time_remaining || 7200))
    totalExamSeconds.value = Math.floor(Number(res.data?.total_time || 7200))
    
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
  } catch (error) {
    console.error('Timer init failed:', error)
    remainingSeconds.value = 0
  }
}

onMounted(startCountdown)
onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div class="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-2xl border-b-4 border-emerald-800 p-6 mb-8 rounded-2xl">
    
    <!-- TIMER + PROGRESS BAR -->
    <div class="text-center mb-8">
      <!-- BIG TIME DISPLAY (23:40) -->
      <div class="text-5xl md:text-6xl font-black text-white tracking-widest mb-4 animate-pulse">
        {{ formattedTime }}
      </div>
      
      <!-- SMART PROGRESS BAR -->
      <div class="max-w-2xl mx-auto mb-4">
        <div class="flex justify-between text-sm text-white/80 mb-2">
          <span>Start</span>
          <span>{{ Math.round(timeProgress) }}%</span>
          <span>Finish</span>
        </div>
        
        <!-- DYNAMIC BACKGROUND BAR -->
        <div class="h-4 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden shadow-lg border-2 border-white/20">
          <!-- GREEN→ORANGE→RED FILL -->
          <div 
            class="h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
            :class="progressColor"
            :style="{ width: timeProgress + '%' }"
          ></div>
        </div>
        
        <!-- STATUS TEXT -->
        <div class="text-white/90 font-semibold mt-2">{{ timeStatus }}</div>
      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
      <Button
        type="primary"
        danger
        size="large"
        :disabled="locked"
        @click="$emit('time-up')"
        class="px-12 py-4 text-xl font-black shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 min-w-[200px]"
      >
        {{ locked ? '⏰ TIME UP!' : 'Submit Exam' }}
      </Button>
    </div>

    <!-- SUBJECT TABS -->
    <Tabs
      v-model:activeKey="localSubject"
      type="card"
      size="large"
      :tabBarStyle="{ 
        background: 'rgba(255,255,255,0.15)', 
        borderRadius: '16px 16px 0 0',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }"
      :tabBarGutter="16"
      class="w-full"
    >
      <Tabs.TabPane v-for="subject in subjects" :key="subject" :tab="subject" />
    </Tabs>
  </div>
</template>

<style scoped>
:deep(.ant-tabs-card .ant-tabs-content-holder) {
  border-left: 1px solid rgba(255,255,255,0.2) !important;
  border-right: 1px solid rgba(255,255,255,0.2) !important;
}
:deep(.ant-tabs-tab) {
  @apply bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl transition-all duration-300;
  color: white !important;
  font-weight: 700 !important;
  font-size: 15px !important;
  padding: 12px 24px !important;
}
:deep(.ant-tabs-tab-active) {
  @apply bg-white/30 shadow-xl border-emerald-200 transform scale-105 rotate-0;
}
:deep(.ant-tabs-tab:hover:not(.ant-tabs-tab-active)) {
  @apply bg-white/20 shadow-lg scale-102;
}
</style>
