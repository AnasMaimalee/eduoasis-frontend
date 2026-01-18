<script setup lang="ts">
import { Radio } from 'ant-design-vue'

const props = defineProps<{
  question: any
  examId: string
}>()

const { $api } = useNuxtApp()

const saveAnswer = async (option: string) => {
  await $api(
    `/cbt/user/exam/session/${props.examId}/questions/${props.question.id}/answer`,
    {
      method: 'POST',
      body: { selected_option: option }
    }
  )
}
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6">
    <div class="text-lg font-bold mb-4">
      {{ question.question }}
    </div>

    <Radio.Group
      :value="question.selected_option"
      @change="e => saveAnswer(e.target.value)"
    >
      <Radio
        v-for="opt in question.options"
        :key="opt.key"
        :value="opt.key"
        class="block mb-3"
      >
        {{ opt.text }}
      </Radio>
    </Radio.Group>
  </div>
</template>
