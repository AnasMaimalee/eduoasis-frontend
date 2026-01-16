<script setup lang="ts">
import { Button } from 'ant-design-vue'
import { ReloadOutlined, TrophyOutlined } from '@ant-design/icons-vue'

defineProps<{
  total: number
}>()

defineEmits<{
  (e: 'refresh'): void
}>()
</script>

<template>
  <div class="bg-emerald-600 px-8 py-8 rounded-2xl shadow-2xl text-white w-full ml-0">
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 max-w-7xl mx-auto">
      <div class="flex items-center gap-6 flex-1">
        <div class="p-4 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm">
          <TrophyOutlined class="text-4xl" />
        </div>
        <div>
          <h1 class="text-4xl font-black mb-2 leading-tight">🏆 Leaderboard</h1>
          <div class="flex items-center gap-6 text-lg font-semibold">
            <div>
              <div class="text-3xl">{{ total.toLocaleString() }}</div>
              <div class="text-sm opacity-90">Total Warriors</div>
            </div>
            <div class="h-16 w-px bg-white/30"></div>
            <div>LIVE RANKINGS</div>
          </div>
        </div>
      </div>

      <Button 
        type="primary" 
        size="large" 
        @click="$emit('refresh')"
        class="flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 font-black shadow-2xl px-8 py-4 h-auto text-lg border-emerald-200"
      >
        <ReloadOutlined class="text-xl" />
        Refresh Rankings
      </Button>
    </div>
  </div>
</template>
