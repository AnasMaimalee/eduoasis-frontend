<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Button, Card, Table, message } from 'ant-design-vue'

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
    roles: ['user']
})

const route = useRoute()
const examId = route.params.examId as string
const { $api } = useNuxtApp()

/* ---------------- STATE ---------------- */
const loading = ref(true)
const result = ref<any>(null)

/* ---------------- FETCH RESULT ---------------- */
onMounted(async () => {
  try {
    const res = await $api(`/cbt/user/results/${examId}`)
    result.value = res.data
  } catch {
    message.error('Failed to fetch exam result')
  } finally {
    loading.value = false
  }
})

/* ---------------- DOWNLOAD PDF ---------------- */
const downloadPDF = async () => {
  try {
    const res = await $api(`/cbt/user/results/${examId}/pdf`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Exam-${examId}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch {
    message.error('Failed to download PDF')
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-10">
    <div v-if="loading" class="text-center text-lg">
      Loading result...
    </div>

    <div v-else-if="result">
      <h1 class="text-3xl font-bold text-green-600 mb-6">
        Exam Result
      </h1>

      <Card class="mb-6">
        <p><strong>Exam ID:</strong> {{ examId }}</p>
        <p><strong>Score:</strong> {{ result.score }} / {{ result.total }}</p>
        <p><strong>Subjects:</strong> {{ result.subjects?.join(', ') }}</p>
      </Card>

      <Card class="mb-6">
        <h2 class="text-xl font-bold mb-4">Question Details</h2>

        <Table
          :dataSource="result.questions || []"
          :columns="[
            { title: 'Q#', dataIndex: 'number' },
            { title: 'Question', dataIndex: 'question' },
            { title: 'Your Answer', dataIndex: 'your_answer' },
            { title: 'Correct Answer', dataIndex: 'correct_answer' },
            { title: 'Result', dataIndex: 'result' }
          ]"
          rowKey="number"
        />
      </Card>

      <Button type="primary" @click="downloadPDF">
        Download PDF
      </Button>
    </div>

    <div v-else class="text-center text-red-500">
      Result not available.
    </div>
  </div>
</template>
