<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ examId: string }>()
const emit = defineEmits(['time-up'])
const { $api } = useNuxtApp()

const remaining = ref(0)
let interval: any = null

onMounted(async () => {
  const res = await $api(`/cbt/user/exam/${props.examId}/meta`)
  remaining.value = res.data.time_remaining

  interval = setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      clearInterval(interval)
      emit('time-up')
    }
  }, 1000)
})

onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="bg-green-100 p-6 rounded-xl text-center">
    <span class="text-3xl font-bold text-green-700">
      {{ Math.floor(remaining / 60) }}:{{ (remaining % 60).toString().padStart(2,'0') }}
    </span>
  </div>
</template>
