<script setup lang="ts">
import FeedbackItem from './FeedbackItem.vue'

defineProps<{
  feedbacks: any[]
}>()

defineEmits(['accept', 'reject'])
</script>

<template>
  <div class="space-y-4">
    <FeedbackItem
      v-for="f in feedbacks"
      :key="f.id"
      :feedback="f"
      @accept="$emit('accept', f)"
      @reject="$emit('reject', f)"
    />
  </div>
</template>
