<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import SubjectSelector from '@/components/CBT/user/SubjectSelector.vue'
import ExamInterface from '@/components/CBT/user/ExamInterface.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user']
})

const { $api } = useNuxtApp()
const examStarted = ref(false)
const examData = ref<any>(null)
const loadingExam = ref(false)

const checkOngoingExam = async () => {
  try {
    const res = await $api('/cbt/user/exam/ongoing')
    if (res?.data) {
      examData.value = res.data
      examStarted.value = true
    }
  } catch (err) {
    console.log('No ongoing exam')
  }
}

const handleExamStart = async (examId: string | number) => {
  loadingExam.value = true
  try {
    // ✅ Backend works - just fetch complete data
    const res = await $api(`/cbt/user/exam/${examId}`)
    examData.value = res.data
    examStarted.value = true
    message.success('✅ Exam Started!')
  } catch (error: any) {
    message.error(error.data?.error || 'Exam load failed')
    loadingExam.value = false
  }
}

onMounted(checkOngoingExam)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
    <div class="max-w-7xl mx-auto">
      <SubjectSelector v-if="!examStarted" @exam-started="handleExamStart" />
      
      <div v-else-if="loadingExam" class="h-96 flex items-center justify-center">
        <Spin size="large" />
      </div>
      
      <ExamInterface v-else-if="examData" :exam-data="examData" :exam-id="examData.id" />
    </div>
  </div>
</template>
