<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps<{
  examId: string
  questions: any[]
}>()

const { $api } = useNuxtApp()
const index = ref(0)

const question = computed(() => props.questions[index.value])

const answer = async (answerId: string, option: string) => {
  try {
    await $api(`/cbt/user/exam/${props.examId}/answer/${answerId}`, {
      method: 'POST',
      body: { selected_option: option }
    })
    question.value.selected_option = option
  } catch {
    message.error('Save failed')
  }
}
</script>

<template>
  <div v-if="question" class="space-y-6">
    <h2 class="text-2xl font-bold">{{ question.question }}</h2>

    <div
      v-for="opt in ['A','B','C','D']"
      :key="opt"
      class="p-4 border rounded-xl cursor-pointer"
      :class="question.selected_option === opt && 'bg-green-100 border-green-500'"
      @click="answer(question.answer_id, opt)"
    >
      {{ opt }}. {{ question.options[opt] }}
    </div>

    <div class="flex justify-between pt-6">
      <button @click="index--" :disabled="index===0">Prev</button>
      <button @click="index++" :disabled="index===questions.length-1">Next</button>
    </div>
  </div>
</template>
