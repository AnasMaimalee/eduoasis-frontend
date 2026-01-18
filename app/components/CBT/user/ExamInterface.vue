<script setup lang="ts">
const props = defineProps<{
  examData: any
  examId: string | number
}>()

const emit = defineEmits(['time-up'])
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto">
    <ExamTimer :exam-id="props.examId" @time-up="emit('time-up')" />
    <QuestionViewer :exam-id="props.examId" />
  </div>
</template>
