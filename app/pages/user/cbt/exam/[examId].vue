<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import ExamHeader from '~/components/CBT/user/exam/ExamHeader.vue'
import QuestionCard from '~/components/CBT/user/exam/QuestionCard.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user'],
})

const { $api } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const examId = route.params.examId as string

/* ---------------- STATE ---------------- */
const exam = ref<{ questions: any[] }>({ questions: [] })
const activeSubject = ref('') // ✅ NEVER null
const submitting = ref(false) // Loader state
const isModalVisible = ref(false) // Confirm modal

/* ---------------- SUBJECTS ---------------- */
const subjects = computed<string[]>(() => {
  if (!Array.isArray(exam.value.questions)) return []
  return [...new Set(exam.value.questions.map(q => q.subject).filter(Boolean))]
})

/* ---------------- QUESTIONS ---------------- */
const currentQuestions = computed(() =>
  exam.value.questions.filter(q => q.subject === activeSubject.value)
)

/* ---------------- COUNT ANSWERED ---------------- */
const totalQuestions = computed(() => exam.value.questions.length)
const answeredCount = computed(() =>
  exam.value.questions.filter(q => q.selected_option).length
)

/* ---------------- FETCH EXAM ---------------- */
async function fetchExam() {
  try {
    const res = await $api(`/cbt/user/exam/${examId}`)
    exam.value.questions = res.questions ?? []

    if (subjects.value.length) {
      activeSubject.value = subjects.value[0]
    }
  } catch (e) {
    console.error(e)
    message.error('Failed to load exam')
  }
}

/* ---------------- OPEN CONFIRM MODAL ---------------- */
const openConfirmModal = () => {
  isModalVisible.value = true
}

/* ---------------- FINAL SUBMIT ---------------- */
async function confirmSubmit() {
  isModalVisible.value = false
  submitting.value = true

  try {
    await $api(`/cbt/user/exam/${examId}/submit`, {
      method: 'POST',
    })

    message.success('Exam submitted successfully')
    router.push(`/user/cbt/results/${examId}`)
  } catch (e) {
    message.error('Failed to submit exam')
    console.error(e)
  } finally {
    submitting.value = false
  }
}

onMounted(fetchExam)
</script>

<template>
  <div class="p-4">
    <!-- EXAM HEADER -->
    <ExamHeader
      v-if="subjects.length && activeSubject"
      :subjects="subjects"
      :exam-id="examId"
      v-model:activeSubject="activeSubject"
      @time-up="openConfirmModal"
    />

    <!-- QUESTIONS -->
    <div v-if="currentQuestions.length">
      <QuestionCard
        v-for="(q, index) in currentQuestions"
        :key="q.question_id"
        :question="q"
        :exam-id="examId"
        :number="index + 1"
      />
    </div>

    <div v-else class="text-center text-gray-500 mt-8">
      <a-spin class="large"></a-spin>
    </div>

    <!-- SUBMIT BUTTON -->
    <div class="text-center mt-8">
      <a-button
        type="primary"
        class="!bg-emerald-500 !border-emerald-500"
        :loading="submitting"
        :disabled="submitting"
        @click="openConfirmModal"
      >
        Submit Exam
      </a-button>
    </div>

    <!-- CONFIRMATION MODAL -->
    <a-modal
        v-model:visible="isModalVisible"
        title="Confirm Exam Submission"
        ok-text="Submit Exam"
        cancel-text="Continue Exam"
        :confirm-loading="submitting"
        @ok="confirmSubmit"
        >
        <div class="space-y-4">

            <!-- SUMMARY -->
            <div class="bg-gray-50 rounded-lg p-4 text-center">
            <p class="text-sm text-gray-500">Answered Questions</p>
            <p class="text-3xl font-bold text-emerald-600">
                {{ answeredCount }} / {{ totalQuestions }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
                ({{ Math.round((answeredCount / totalQuestions) * 100) }}%)
            </p>
            </div>

            <!-- WARNING (LESS THAN 75%) -->
            <div
            v-if="answeredCount / totalQuestions < 0.75"
            class="flex gap-3 items-start bg-amber-50 border border-amber-300 rounded-lg p-4"
            >
            <span class="text-amber-500 text-xl">⚠️</span>
            <div>
                <p class="font-semibold text-amber-700">
                Low Completion Warning
                </p>
                <p class="text-sm text-amber-700">
                You have answered less than <strong>75%</strong> of the questions.
                Submitting now may significantly reduce your score.
                </p>
            </div>
            </div>

            <!-- CONFIRM TEXT -->
            <p class="text-sm text-gray-600 text-center">
            Are you sure you want to submit your exam now?
            </p>

        </div>
    </a-modal>

  </div>
</template>
