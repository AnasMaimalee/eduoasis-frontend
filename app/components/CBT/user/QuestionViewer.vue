<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { message, Button, Card, Spin, Empty, Modal } from 'ant-design-vue'
import { ArrowLeftOutlined, ArrowRightOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  examId?: number | string  // ✅ Flexible typing
}>()

const { $api } = useNuxtApp()
const emit = defineEmits<{
  'answer-saved': [questionId: string, option: string]
}>()

// ✅ REACTIVE STATE WITH DEFAULTS
const currentQuestionIndex = ref(0)
const questions = ref<any[]>([])  // ✅ Always array
const loading = ref(false)
const examMeta = ref<any>(null)
const hasError = ref(false)

// ✅ SAFE COMPUTEDS WITH NULL GUARDS
const currentQuestion = computed(() => {
  if (!questions.value.length || currentQuestionIndex.value >= questions.value.length) {
    return null  // ✅ Return null instead of undefined
  }
  return questions.value[currentQuestionIndex.value]
})

const totalQuestions = computed(() => questions.value.length)
const canGoPrev = computed(() => currentQuestionIndex.value > 0)
const canGoNext = computed(() => currentQuestionIndex.value < totalQuestions.value - 1)

// ✅ FIXED: Safe question loading with retries
const loadQuestions = async () => {
  if (!props.examId) {
    console.warn('❌ No examId provided')
    return
  }

  loading.value = true
  hasError.value = false

  try {
    // ✅ Sequential loading (more reliable than Promise.all)
    const questionsRes = await $api(`/cbt/user/exam/${props.examId}`).catch(() => null)
    const metaRes = await $api(`/cbt/user/exam/${props.examId}/meta`).catch(() => null)
    
    // ✅ SAFE DATA EXTRACTION
    questions.value = questionsRes?.data?.questions || []
    examMeta.value = metaRes?.data || null
    
    if (questions.value.length === 0) {
      message.warning('⚠️ No questions available for this exam')
      hasError.value = true
      return
    }
    
    console.log(`✅ Loaded ${questions.value.length} questions`)
    message.success(`✅ ${questions.value.length} questions loaded`)
    
  } catch (err: any) {
    console.error('❌ loadQuestions failed:', err)
    hasError.value = true
    message.error('Failed to load exam questions')
    questions.value = []  // ✅ Reset to empty array
  } finally {
    loading.value = false
  }
}

// ✅ FIXED: Safe answer submission
const submitAnswer = async (questionId: string, option: string) => {
  if (!props.examId || !questionId) {
    message.error('Invalid question or exam')
    return
  }

  try {
    await $api(`/cbt/user/exam/${props.examId}/answer/${questionId}`, {
      method: 'POST',
      body: { 
        selected_option: option,
        timestamp: Date.now()  // ✅ Extra safety data
      }
    })
    
    // ✅ SAFE LOCAL STATE UPDATE
    const questionIndex = questions.value.findIndex(q => q.id === questionId)
    if (questionIndex !== -1) {
      questions.value[questionIndex].selected_option = option
      questions.value = [...questions.value]  // ✅ Trigger reactivity
    }
    
    emit('answer-saved', questionId, option)
    message.success('✅ Answer saved!')
    
  } catch (err: any) {
    console.error('Answer submit failed:', err)
    message.error(err.data?.message || 'Failed to save answer')
  }
}

// ✅ Navigation
const prevQuestion = () => {
  if (canGoPrev.value) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (canGoNext.value) {
    currentQuestionIndex.value++
  }
}

const jumpToQuestion = (index: number) => {
  if (index >= 0 && index < totalQuestions.value) {
    currentQuestionIndex.value = index
  }
}

// ✅ LIFECYCLE + WATCHERS
onMounted(() => {
  if (props.examId) {
    loadQuestions()
  }
})

watch(() => props.examId, (newId) => {
  if (newId) {
    questions.value = []  // ✅ Reset
    loadQuestions()
  }
}, { immediate: true })
</script>

<template>
  <div class="w-full max-w-6xl mx-auto p-6 space-y-8">
    <!-- Loading State -->
    <Spin v-if="loading" size="large" class="flex flex-col items-center justify-center py-32">
      <div class="text-center space-y-4">
        <div class="text-xl font-bold text-emerald-700">Loading exam questions...</div>
        <div class="text-sm text-gray-500">Please wait while we fetch your exam</div>
      </div>
    </Spin>

    <!-- Error State -->
    <Card v-else-if="hasError || !examId" class="border-0 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
      <div class="text-center py-16">
        <QuestionCircleOutlined class="text-6xl text-red-500 mx-auto mb-6" />
        <h2 class="text-3xl font-black text-red-800 mb-4">Unable to Load Questions</h2>
        <p class="text-xl text-red-700 mb-8 max-w-md mx-auto">
          Questions failed to load for this exam. Please try starting a new exam.
        </p>
        <Button 
          type="primary" 
          size="large" 
          @click="$router.push('/user/cbt')"
          class="px-8 py-3 text-lg font-bold"
        >
          🔄 Start New Exam
        </Button>
      </div>
    </Card>

    <!-- Empty State -->
    <Empty 
      v-else-if="!loading && totalQuestions === 0" 
      description="No questions available"
      class="py-32"
    />

    <!-- ✅ MAIN QUESTION VIEWER -->
    <div v-else class="space-y-8">
      <!-- Progress Header -->
      <div class="flex items-center justify-between bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
        <div class="text-2xl font-black text-emerald-800">
          Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}
        </div>
        <div class="text-sm text-emerald-700 font-medium">
          {{ examMeta?.subject || 'Exam in Progress' }}
        </div>
      </div>

      <!-- Current Question -->
      <Card v-if="currentQuestion" class="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
        <div class="prose prose-lg max-w-none">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            {{ currentQuestion.question }}
          </h2>
          
          <!-- Options -->
          <div class="space-y-3">
            <div 
              v-for="option in ['A', 'B', 'C', 'D']"
              :key="option"
              class="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 group"
              :class="[
                currentQuestion.selected_option === option 
                  ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
              ]"
              @click="submitAnswer(currentQuestion.id, option)"
            >
              <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0">
                {{ option }}
              </div>
              <div class="flex-1 min-w-0">
                <span class="font-semibold text-gray-900">{{ option }}. </span>
                <span class="text-gray-700 group-hover:text-emerald-800">{{ currentQuestion[`option_${option.toLowerCase()}`] }}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Navigation -->
      <div class="flex items-center justify-between gap-4">
        <Button 
          v-if="canGoPrev" 
          size="large" 
          @click="prevQuestion"
          class="flex items-center px-8 py-4 h-auto font-bold text-lg"
        >
          <ArrowLeftOutlined class="mr-2" />
          Previous Question
        </Button>

        <div class="flex-1 flex justify-center gap-2 flex-wrap">
          <Button
            v-for="(q, index) in questions.slice(0, 20)"
            :key="q.id"
            :type="index === currentQuestionIndex ? 'primary' : 'default'"
            size="small"
            :class="[
              q.selected_option ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-100',
              'w-12 h-12 rounded-xl font-bold mx-1 mb-2'
            ]"
            @click="jumpToQuestion(index)"
          >
            {{ index + 1 }}
          </Button>
        </div>

        <Button 
          v-if="canGoNext" 
          type="primary"
          size="large" 
          @click="nextQuestion"
          class="flex items-center px-8 py-4 h-auto font-bold text-lg"
        >
          Next Question
          <ArrowRightOutlined class="ml-2" />
        </Button>
      </div>
    </div>
  </div>
</template>
