<script setup lang="ts">
import { Button } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'

defineEmits<{
  (e: 'refresh'): void
}>()
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg p-12 text-center">
    <div class="text-8xl mb-6 text-gray-200">🏆</div>
    <h3 class="text-2xl font-bold text-gray-700 mb-3">Leaderboard is Empty</h3>
    <p class="text-gray-500 mb-8 max-w-lg mx-auto">
      No users have taken exams yet or no results match the current filters.
    </p>
    <Button type="primary" size="large" @click="$emit('refresh')">
      <ReloadOutlined />
      Refresh Now
    </Button>
  </div>
</template>