<script setup lang="ts">
import { Input, Button } from 'ant-design-vue'

defineProps<{
  loading: boolean
}>()

const emit = defineEmits(['refresh', 'update:search'])

const search = defineModel<string>('search')
</script>

<template>
  <div
    class="flex flex-col sm:flex-row gap-3 justify-between items-center
           bg-emerald-600 text-white p-4 rounded-xl shadow"
  >
    <div>
      <h2 class="text-lg font-bold">📊 Exam Results History</h2>
      <p class="text-sm text-emerald-100">
        View all CBT exams you have taken
      </p>
    </div>

    <div class="flex gap-2 w-full sm:w-auto">
      <Input
        v-model:value="search"
        placeholder="Search by Exam ID"
        class="w-full sm:w-64"
        allow-clear
      />

      <Button
        type="primary"
        ghost
        :loading="loading"
        @click="$emit('refresh')"
      >
        🔄 Refresh
      </Button>
    </div>
  </div>
</template>
