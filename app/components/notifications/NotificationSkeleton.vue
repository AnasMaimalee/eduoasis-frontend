<template>
  <div class="space-y-4">
    <div
      v-for="i in 6"
      :key="i"
      class="flex gap-4 p-4 bg-white rounded-xl animate-pulse"
    >
      <!-- ICON PLACEHOLDER -->
      <div
        class="w-12 h-12 rounded-full bg-gray-200"
      />

      <!-- TEXT PLACEHOLDER -->
      <div class="flex-1 space-y-3">
        <div class="h-4 bg-gray-200 rounded w-3/4" />
        <div class="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  </div>
</template>
