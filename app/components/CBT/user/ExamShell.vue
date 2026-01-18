<script setup lang="ts">
import ExamTimer from './ExamTimer.vue'
import QuestionViewer from './QuestionViewer.vue'

const props = defineProps<{
  examId: string
  examData: any
}>()
</script>

<template>
  <div class="space-y-6">
    <ExamTimer :exam-id="examId" />
    <QuestionViewer
      :exam-id="examId"
      :questions="examData.questions"
    />
  </div>
</template>
