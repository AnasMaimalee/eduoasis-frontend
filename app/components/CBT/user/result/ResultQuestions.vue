<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  question: any
  number: number
}>()

const options = computed(() =>
  Object.entries(props.question.options || {}).map(([key, text]) => ({
    key,
    text,
  }))
)
</script>
<template>
  <div
    class="rounded-xl border p-5 shadow-sm"
    :class="question.is_correct
      ? 'border-emerald-300 bg-emerald-50'
      : 'border-red-300 bg-red-50'"
  >
    <!-- HEADER -->
    <div class="flex justify-between mb-3">
      <h3 class="font-bold text-lg">Question {{ number }}</h3>
      <span
        class="px-3 py-1 rounded-full text-xs font-bold"
        :class="question.is_correct
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white'"
      >
        {{ question.is_correct ? 'Correct' : 'Wrong' }}
      </span>
    </div>

    <!-- QUESTION -->
    <p class="mb-4 font-medium">{{ question.question }}</p>

    <!-- OPTIONS -->
    <div class="grid sm:grid-cols-2 gap-3">
      <div
        v-for="opt in options"
        :key="opt.key"
        class="p-3 rounded-lg border font-semibold text-sm"
        :class="[
          opt.key === question.correct
            ? 'bg-emerald-200 border-emerald-500'
            : opt.key === question.selected
            ? 'bg-red-200 border-red-500 line-through'
            : 'bg-gray-100 border-gray-300'
        ]"
      >
        <strong>{{ opt.key }}.</strong> {{ opt.text }}
      </div>
    </div>

    <!-- FOOTER -->
    <div class="mt-4 text-sm">
      <p><strong>Your Answer:</strong> {{ question.selected ?? 'Not answered' }}</p>
      <p><strong>Correct Answer:</strong> {{ question.correct }}</p>
    </div>
  </div>
</template>
