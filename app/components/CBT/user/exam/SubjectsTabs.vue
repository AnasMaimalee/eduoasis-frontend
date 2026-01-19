<script setup lang="ts">
const props = defineProps<{
  examData: any // ✅ Accept full exam object
}>()

const { $api } = useNuxtApp()
const questions = ref<any[]>([])
const activeTab = ref(0)
const loading = ref(false)

// ✅ FIXED: Safe question loading with fallback
const loadQuestions = async () => {
  if (!props.examData?.id) {
    console.error('❌ No exam ID')
    return
  }

  loading.value = true
  try {
    // ✅ Try API first, then fallback to prop data
    const res = await $api(`/cbt/user/exam/${props.examData.id}`).catch(() => null)
    questions.value = res?.data?.questions || props.examData?.questions || []
    
    if (questions.value.length === 0) {
      throw new Error('No questions found')
    }
    
    console.log('✅ Loaded', questions.value.length, 'questions')
  } catch (error) {
    console.error('❌ SubjectsTabs loadQuestions failed:', error)
    questions.value = [] // ✅ Always set empty array
  } finally {
    loading.value = false
  }
}

onMounted(loadQuestions)
watch(() => props.examData, loadQuestions, { deep: true })
</script>


<template>
  <Card class="border-0 shadow-xl h-full bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 backdrop-blur-sm">
    <Tabs v-model:activeKey="activeTab" class="h-full">
      <Tabs.TabPane 
        v-for="tab in tabs" 
        :key="tab.key" 
        :tab="tab.label"
        class="h-full"
      >
        <div class="p-4 space-y-3 max-h-96 overflow-y-auto">
          <div 
            v-for="(q, i) in activeQuestions" 
            :key="q.id"
            class="p-4 rounded-2xl cursor-pointer hover:shadow-xl transition-all border-2 flex items-center space-x-4 group min-h-[50px] backdrop-blur-sm bg-white/70"
            :class="{
              'border-emerald-400 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 shadow-emerald-200 ring-2 ring-emerald-200/50': q.selected_option,
              'border-gray-200/50 hover:border-emerald-300 hover:bg-emerald-50/30': !q.selected_option
            }"
            @click="switchQuestion(i)"
          >
            <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
              Q{{ i + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-emerald-800 truncate text-sm">{{ q.question.slice(0, 50) }}...</p>
              <p class="text-xs text-emerald-600">{{ q.subject?.name }}</p>
            </div>
            <div class="flex-shrink-0 ml-2">
              <CheckCircleOutlined 
                v-if="q.selected_option" 
                class="text-2xl text-emerald-500" 
              />
              <QuestionCircleOutlined 
                v-else 
                class="text-2xl text-gray-400" 
              />
            </div>
          </div>
        </div>
      </Tabs.TabPane>
    </Tabs>
  </Card>
</template>
