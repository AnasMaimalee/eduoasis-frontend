<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user'],
})

const route = useRoute()
const examId = route.params.examId as string
const { $api } = useNuxtApp()

const loading = ref(true)
const result = ref<any>(null)
const downloadLoading = ref(false)

/* ---------------- FETCH RESULT ---------------- */
onMounted(async () => {
  try {
    const res = await $api(`/cbt/user/results/${examId}`)
    result.value = res.data
  } catch (e) {
    message.error('Failed to load exam result')
    console.error(e)
  } finally {
    loading.value = false
  }
})

/* ---------------- DOWNLOAD PDF ---------------- */
const downloadPDF = async () => {
  downloadLoading.value = true
  try {
    const res = await $api(`/cbt/user/results/${examId}/pdf`, {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([res]))
    const link = document.createElement('a')
    link.href = url
    link.download = `Exam-${examId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e) {
    message.error('Failed to download PDF')
    console.error(e)
  } finally {
    downloadLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-3 sm:px-6 py-6">

    <!-- LOADING -->
    <div v-if="loading" class="text-center text-gray-500 text-sm">
      Loading result...
    </div>

    <!-- RESULT -->
    <div v-else-if="result">

      <!-- HEADER -->
      <div class="bg-emerald-500 text-white rounded-xl p-4 sm:p-6 mb-6">
        <h1 class="text-lg sm:text-2xl font-bold">
          Exam Result
        </h1>

        <div class="mt-3 space-y-1 text-sm">
          <p>
            <strong>Score:</strong>
            {{ result.exam.correct }} / {{ result.exam.total_questions }}
          </p>

          <p>
            <strong>Percentage:</strong>
            {{ result.exam.percentage }}%
          </p>

          <p>
            <strong>Submitted At:</strong>
            {{ new Date(result.exam.submitted_at).toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- SUBJECT TABLE -->
      <div class="bg-white rounded-xl shadow overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-emerald-100 text-emerald-700">
            <tr>
              <th class="p-2 text-left">Subject</th>
              <th class="p-2 text-center">Total</th>
              <th class="p-2 text-center">Correct</th>
              <th class="p-2 text-center">Wrong</th>
              <th class="p-2 text-center">Score</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(s, i) in result.subjects"
              :key="i"
              class="border-t"
            >
              <td class="p-2 font-medium">
                {{ s.subject }}
              </td>

              <td class="p-2 text-center">
                {{ s.total_questions ?? s.total }}
              </td>

              <td class="p-2 text-center text-emerald-600 font-semibold">
                {{ s.correct_answers ?? s.correct }}
              </td>

              <td class="p-2 text-center text-red-500 font-semibold">
                {{ s.wrong_answers ?? s.wrong }}
              </td>

              <!-- ✅ SCORE FIXED -->
              <td class="p-2 text-center font-bold">
                {{ s.correct_answers ?? s.correct }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- DOWNLOAD -->
      <div class="mt-6 text-center">
        <button
          class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm flex items-center justify-center gap-2 mx-auto disabled:opacity-60"
          :disabled="downloadLoading"
          :loader="downloadLoading"
          @click="downloadPDF"
        >
          <span>
            {{ downloadLoading ? 'Downloading...' : 'Download PDF' }}
          </span>
        </button>
      </div>

    </div>

    <!-- NO RESULT -->
    <div v-else class="text-center text-red-500">
      Result not available.
    </div>
  </div>
</template>
