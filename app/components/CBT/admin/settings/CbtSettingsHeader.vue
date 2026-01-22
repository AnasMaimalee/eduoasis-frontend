<script setup lang="ts">
import { Button } from 'ant-design-vue'
import { ReloadOutlined, ToolOutlined } from '@ant-design/icons-vue'
</script>

<template>
  <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 rounded-2xl shadow-2xl text-white">
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
      <div class="flex items-center gap-4 lg:gap-6 flex-1">
        <div class="p-3 sm:p-4 lg:p-5 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm">
          <ToolOutlined class="text-2xl sm:text-3xl lg:text-4xl" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">⚙️ CBT Settings</h1>
          <p class="text-lg sm:text-xl opacity-90 mt-1">Configure exam structure, timing & pricing</p>
        </div>
      </div>
    </div>
  </div>
</template>