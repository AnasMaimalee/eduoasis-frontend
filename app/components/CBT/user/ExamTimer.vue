<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Card, Progress, Button, Modal, message } from 'ant-design-vue'
import { ClockCircleOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  examId: string
}>()

const { $api } = useNuxtApp()

const remainingTime = ref(7200)
const totalTime = ref(7200)
const answeredCount = ref(0)
const totalQuestions = ref(0)
const interval = ref<NodeJS.Timeout>()
const syncInterval = ref<NodeJS.Timeout>()
const isPaused = ref(false)

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// ✅ FIXED: Proper error handling + retry logic
const syncServerTime = async () => {
  if (isPaused.value) return
  
  try {
    const { data } = await $api(`/cbt/user/exam/${props.examId}/meta`)
    remainingTime.value = data.time_remaining ?? remainingTime.value
    totalTime.value = data.total_time ?? totalTime.value
    answeredCount.value = data.answered_questions ?? answeredCount.value
    totalQuestions.value = data.total_questions ?? totalQuestions.value
    console.log('✅ Server sync successful')
  } catch (error: any) {
    // ✅ Graceful fallback - don't spam console
    if (error.statusCode !== 404) {
      console.warn('Server sync failed, using local timer')
    }
  }
}

// ✅ FIXED: Proper payload for auto-submit
const autoSubmitExam = async () => {
  if (!props.examId) return
  
  try {
    await $api(`/cbt/user/exam/${props.examId}/auto-submit`, {
      method: 'POST',
      body: {
        answers: [], // ✅ Required by Laravel validation
        time_remaining: remainingTime.value,
        submitted_at: new Date().toISOString()
      }
    })
    console.log('✅ Auto-submit successful')
  } catch (error: any) {
    console.error('Auto-submit failed:', error.data?.message || error.message)
  }
}

// ✅ FIXED: Manual submit with proper payload
const submitExam = async () => {
  try {
    await $api(`/cbt/user/exam/${props.examId}/submit`, {
      method: 'POST',
      body: { submitted_at: new Date().toISOString() }
    })
    navigateTo(`/user/results/${props.examId}`)
  } catch (error: any) {
    message.error(error.data?.message || 'Submit failed')
  }
}

const startTimer = async () => {
  if (!props.examId) return
  
  // Initial server sync
  await syncServerTime()
  
  // Server sync every 30 seconds
  syncInterval.value = setInterval(syncServerTime, 30000)
  
  // Main countdown timer
  interval.value = setInterval(() => {
    if (!isPaused.value) {
      remainingTime.value = Math.max(0, remainingTime.value - 1)
    }
    
    // Auto-submit 10 seconds before expiry
    if (remainingTime.value <= 10) {
      clearInterval(interval.value!)
      clearInterval(syncInterval.value!)
      autoSubmitExam()
      
      Modal.warning({
        title: '⏰ Time Expired',
        content: 'Exam auto-submitted. Redirecting to results...',
        okText: 'View Results',
        onOk: () => navigateTo(`/user/results/${props.examId}`)
      })
    }
  }, 1000)
}

const pauseTimer = () => { isPaused.value = true }
const resumeTimer = () => { isPaused.value = false }

watch(() => props.examId, startTimer, { immediate: true })
onMounted(() => {
  // Double-check exam exists
  $api(`/cbt/user/exam/${props.examId}`).catch(() => {
    message.error('Invalid exam session')
    navigateTo('/user/cbt')
  })
})

onUnmounted(() => {
  if (interval.value) clearInterval(interval.value)
  if (syncInterval.value) clearInterval(syncInterval.value)
})
</script>

<template>
  <Card class="border-0 shadow-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
    <div class="flex flex-col lg:flex-row items-center justify-between gap-6 p-6">
      <!-- Timer Display -->
      <div class="flex items-center space-x-4 flex-1">
        <div class="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
          <ClockCircleOutlined class="text-2xl text-white" />
        </div>
        <div>
          <div class="text-sm font-bold text-emerald-800 uppercase tracking-wide">
            Time Remaining
          </div>
          <div class="text-3xl font-black bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent">
            {{ formatTime(remainingTime) }}
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <Progress 
        :percent="(remainingTime / totalTime) * 100"
        :stroke-color="{
          '0%': '#EF4444', 
          '25%': '#F59E0B', 
          '50%': '#FBBF24',
          '75%': '#10B981', 
          '100%': '#059669'
        }"
        stroke-width="12"
        show-info={false}
        class="flex-1 max-w-md"
      />

      <!-- Progress Stats + Submit -->
      <div class="text-right space-y-3 min-w-[200px]">
        <div class="text-xl font-bold text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-xl shadow-md">
          {{ answeredCount }}/{{ totalQuestions }}
        </div>
        <Button 
          type="primary" 
          size="large" 
          class="w-full h-14 text-lg font-black shadow-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0"
          @click="submitExam"
        >
          ✅ Finish & Submit
        </Button>
      </div>
    </div>
  </Card>
</template>
