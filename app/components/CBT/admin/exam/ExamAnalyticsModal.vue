<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'
import { Modal, Spin, Statistic, Row, Col, Divider, Table } from 'ant-design-vue'
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
const { $api } = useNuxtApp()

// -------------------- STATE --------------------
const loading = ref(false)
const analytics = ref<any | null>(null)

// -------------------- FETCH ANALYTICS --------------------
const fetchAnalytics = async () => {
  if (!props.exam?.id) return
  loading.value = true
  try {
    const res = await $api(`/cbt/superadmin/exams/${props.exam.id}/analytics`)
    const data = res.data.data

    if (!data) {
      analytics.value = null
      return
    }

    analytics.value = {
      total_score: data.total_score ?? 0,
      subjects: data.subjects ?? []
    }
  } catch (err) {
    console.error(err)
    analytics.value = null
  } finally {
    loading.value = false
  }
}

// -------------------- COMPUTED --------------------
const totalQuestions = computed(() =>
  analytics.value?.subjects?.reduce((acc: number, s: any) => acc + (s.total ?? 0), 0) ?? 0
)
const answeredQuestions = computed(() =>
  analytics.value?.subjects?.reduce((acc: number, s: any) => acc + (s.correct ?? 0), 0) ?? 0
)
const unansweredQuestions = computed(() =>
  analytics.value?.subjects?.reduce((acc: number, s: any) => acc + (s.wrong ?? 0), 0) ?? 0
)

// Chart
const chartData = computed(() => ({
  labels: analytics.value?.subjects?.map((s: any) => s.name) || [],
  datasets: [
    {
      label: 'Score',
      data: analytics.value?.subjects?.map((s: any) => s.score ?? 0) || [],
      backgroundColor: '#10b981'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: true, position: 'top' as const },
    title: { display: true, text: 'Score Per Subject' }
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 } }
  }
}

// -------------------- WATCH --------------------
watchEffect(() => {
  if (props.visible && props.exam?.id) fetchAnalytics()
  else analytics.value = null
})
</script>

<template>
  <Modal
    :open="props.visible"
    width="900px"
    title="📊 Exam Analytics"
    @cancel="emit('update:visible', false)"
    :footer="null"
    class="rounded-lg"
  >
    <Spin :spinning="loading">
      <div v-if="analytics">
        <!-- Candidate Info -->
        <div class="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
          <h3 class="text-xl font-bold">{{ props.exam?.user?.name || 'Unknown Candidate' }}</h3>
          <p class="text-sm text-gray-500">{{ props.exam?.user?.email || '-' }}</p>
          <p class="text-sm text-gray-500">Exam ID: {{ props.exam?.id || '-' }}</p>
        </div>

        <!-- Statistics -->
        <Row :gutter="16" class="mb-6">
          <Col :span="6">
            <Statistic title="Total Questions" :value="totalQuestions" />
          </Col>
          <Col :span="6">
            <Statistic title="Answered" :value="answeredQuestions" />
          </Col>
          <Col :span="6">
            <Statistic title="Unanswered" :value="unansweredQuestions" />
          </Col>
          <Col :span="6">
            <Statistic title="Total Score" :value="analytics.total_score ?? 0" />
          </Col>
        </Row>

        <Divider />

        <!-- Chart -->
        <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
          <Bar :data="chartData" :options="chartOptions" />
        </div>

        <!-- Table per Subject -->
        <Table
          :columns="[
            { title: 'Subject', dataIndex: 'name', key: 'name' },
            { title: 'Total', dataIndex: 'total', key: 'total' },
            { title: 'Correct', dataIndex: 'correct', key: 'correct' },
            { title: 'Wrong', dataIndex: 'wrong', key: 'wrong' },
            { title: 'Score', dataIndex: 'score', key: 'score' }
          ]"
          :dataSource="analytics.subjects"
          :rowKey="record => record.name"
          bordered
          class="bg-white rounded-lg"
        />
      </div>

      <div v-else class="text-center text-gray-500 py-16">
        No analytics available for this exam
      </div>
    </Spin>
  </Modal>
</template>

<style scoped>
.ant-modal-title {
  font-weight: 700;
  color: #065f46;
}
.ant-statistic-title {
  color: #374151;
}
.ant-spin-nested-loading {
  min-height: 200px;
}
</style>
