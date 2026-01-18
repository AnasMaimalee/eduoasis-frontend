<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import ExamHeader from '~/components/CBT/user/ExamHeader.vue'
import QuestionCard from '~/components/CBT/user/QuestionCard.vue'

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
const submitting = ref(false) // loader state

/* ---------------- SUBJECTS ---------------- */
const subjects = computed<string[]>(() => {
  if (!Array.isArray(exam.value.questions)) return []
  return [...new Set(exam.value.questions.map(q => q.subject).filter(Boolean))]
})

/* ---------------- QUESTIONS ---------------- */
const currentQuestions = computed(() =>
  exam.value.questions.filter(q => q.subject === activeSubject.value)
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

/* ---------------- SUBMIT ---------------- */
async function submitExam() {
  submitting.value = true
  try {
    await $api(`/cbt/user/exam/${examId}/submit`, {
      method: 'POST',
    })

    message.success('Exam submitted successfully')
    router.push(`/user/cbt/result/${examId}`)
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
      @time-up="submitExam"
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
      No questions for this subject.
    </div>

    <!-- SUBMIT BUTTON -->
    <div class="text-center mt-8">
      <a-button
        type="primary"
        class="!bg-emerald-500 !border-emerald-500"
        :loading="submitting"
        :disabled="submitting"
        @click="submitExam"
      >
        Submit Exam
      </a-button>
    </div>
  </div>
</template>
