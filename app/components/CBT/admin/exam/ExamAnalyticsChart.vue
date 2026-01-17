<script setup lang="ts">
import { computed } from 'vue'
import { Modal } from 'ant-design-vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  visible: boolean
  exam: any | null
}>()
const emit = defineEmits(['update:visible'])

// Chart data computed
const chartData = computed(() => {
  if (!props.exam?.answers) return { labels: [], datasets: [] }
  return {
    labels: props.exam.answers.map(a => `Q${a.question_number}`),
    datasets: [
      {
        label: 'Score per Question',
        data: props.exam.answers.map(a => a.score ?? 0),
        backgroundColor: '#10b981'
      }
    ]
  }
})
</script>

<template>
  <Modal
    :open="visible"
    title="Exam Analytics"
    width="800px"
    @cancel="emit('update:visible', false)"
    @ok="emit('update:visible', false)"
  >
    <div v-if="exam">
      <p><strong>Candidate:</strong> {{ exam.user?.name }}</p>
      <p><strong>Status:</strong> {{ exam.status }}</p>
      <p><strong>Score:</strong> {{ exam.total_score }}</p>
      <p><strong>Started At:</strong> {{ new Date(exam.started_at).toLocaleString() }}</p>
      <p><strong>Ended At:</strong> {{ new Date(exam.ends_at).toLocaleString() }}</p>

      <div class="mt-6">
        <Bar :data="chartData" />
      </div>
    </div>

    <div v-else class="text-gray-500 text-center">
      No exam selected
    </div>
  </Modal>
</template>

