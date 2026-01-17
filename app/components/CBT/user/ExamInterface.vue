<script setup lang="ts">
import { ref } from 'vue'
import ExamTimer from './ExamTimer.vue'
import SubjectsTabs from './SubjectsTabs.vue'
import QuestionViewer from './QuestionViewer.vue'

const props = defineProps<{
  examData: any
}>()

const currentQuestionIndex = ref(0)

const handleQuestionSwitch = (subject: string, index: number) => {
  currentQuestionIndex.value = index
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Timer -->
    <ExamTimer :exam-id="examData.id" />
    
    <!-- Main Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-[70vh]">
      <!-- Questions (3/4 width desktop, full mobile) -->
      <QuestionViewer 
        class="xl:col-span-3 h-[70vh]"
        :exam-id="examData.id"
        v-model:current-question-index="currentQuestionIndex"
      />
      
      <!-- Subjects (1/4 width desktop, full mobile) -->
      <SubjectsTabs 
        class="h-80 xl:h-[70vh]"
        :exam-id="examData.id"
        @switch-question="handleQuestionSwitch"
      />
    </div>
  </div>
</template>
