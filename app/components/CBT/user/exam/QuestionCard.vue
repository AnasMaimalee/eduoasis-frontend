<script setup lang="ts">
import { computed } from 'vue'
import { Radio, message } from 'ant-design-vue'

const props = defineProps<{
  question: any
  examId: string
  number: number
}>()

const { $api } = useNuxtApp()

/* ---------------- OPTIONS ---------------- */
const optionsArray = computed(() => {
  if (!props.question.options) return []
  return Object.entries(props.question.options).map(([key, text]) => ({
    key,
    text
  }))
})

/* ---------------- SAVE ANSWER ---------------- */
const saveAnswer = async (selectedKey: string) => {
  // instant UI update
  props.question.selected_option = selectedKey

  try {
    await $api(
      `/cbt/user/exam/${props.examId}/answer/${props.question.answer_id}`,
      {
        method: 'POST',
        body: {
          selected_option: selectedKey,
        },
      }
    )
  } catch (e) {
    message.error('Failed to save answer')
    console.error(e)
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow p-4 sm:p-6 mb-6 border border-emerald-400">
    <!-- QUESTION HEADER -->
    <div class="flex items-start gap-2 mb-4">
      <span class="text-sm font-bold text-emerald-600">
        Question {{ number }}
      </span>
    </div>

    <!-- QUESTION TEXT -->
    <div class="text-base sm:text-lg font-semibold mb-4">
      {{ question.question }}
    </div>

    <!-- OPTIONS -->
    <Radio.Group
      :value="question.selected_option"
      @change="e => saveAnswer(e.target.value)"
    >
      <Radio
        v-for="opt in optionsArray"
        :key="opt.key"
        :value="opt.key"
        class="block mb-3"
      >
        <strong>{{ opt.key }}.</strong> {{ opt.text }}
      </Radio>
    </Radio.Group>
  </div>
</template>
