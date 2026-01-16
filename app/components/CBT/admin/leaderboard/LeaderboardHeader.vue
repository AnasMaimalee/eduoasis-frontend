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
  <div class="bg-emerald-600 rounded-2xl shadow-2xl text-white w-full ml-0 overflow-hidden">
    <div class="p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 max-w-7xl mx-auto">
      
      <!-- Left Content - Always Flex -->
      <div class="flex flex-1 items-center gap-3 lg:gap-6 order-1 lg:order-none">
        <!-- Trophy Icon -->
        <div class="p-2 sm:p-3 lg:p-4 bg-white/20 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm flex-shrink-0">
          <TrophyOutlined :class="['text-2xl sm:text-3xl lg:text-4xl']" />
        </div>
        
        <!-- Title + Stats -->
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-1 sm:mb-2 truncate">
            🏆 Leaderboard
          </h1>
          <div class="flex flex-wrap items-center gap-3 sm:gap-6 text-sm sm:text-base lg:text-lg font-semibold">
            <div class="flex flex-col">
              <div class="text-2xl sm:text-3xl lg:text-3xl">{{ total.toLocaleString() }}</div>
              <div class="text-xs sm:text-sm opacity-90">Total Warriors</div>
            </div>
            <div class="hidden sm:block lg:block h-12 lg:h-16 w-px bg-white/30" />
            <div class="text-emerald-100 font-bold uppercase tracking-wide text-xs sm:text-sm lg:text-base">
              LIVE RANKINGS
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Button - Responsive Position -->
      <Button 
        type="primary" 
        size="large" 
        @click="$emit('refresh')"
        class="flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 font-black shadow-2xl px-6 py-3 sm:px-8 sm:py-4 h-auto text-base sm:text-lg flex-shrink-0 order-2 lg:order-none w-full lg:w-auto justify-center"
      >
        <ReloadOutlined class="text-lg sm:text-xl" />
        <span class="hidden sm:inline">Refresh Rankings</span>
        <span class="sm:hidden">Refresh</span>
      </Button>
    </div>
  </div>
</template>
