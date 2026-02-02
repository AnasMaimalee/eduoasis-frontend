<script setup lang="ts">
import { computed } from 'vue'
import {
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'

const props = defineProps<{
  feedback: any
}>()

const emit = defineEmits(['accept', 'reject'])

const icon = computed(() => {
  if (props.feedback.status === 'accepted') return CheckCircleOutlined
  if (props.feedback.status === 'rejected') return CloseCircleOutlined
  return MessageOutlined
})

const statusClass = computed(() => {
  if (props.feedback.status === 'accepted') return 'bg-emerald-100 text-emerald-600'
  if (props.feedback.status === 'rejected') return 'bg-red-100 text-red-600'
  return 'bg-gray-100 text-gray-600'
})
</script>

<template>
  <div class="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
    <!-- ICON -->
    <div
      class="w-12 h-12 rounded-full flex items-center justify-center"
      :class="statusClass"
    >
      <component :is="icon" class="text-xl" />
    </div>

    <!-- CONTENT -->
    <div class="flex-1">
      <p class="font-medium text-gray-800">
        {{ feedback.full_name }}
      </p>

      <p class="text-sm text-gray-600 mt-1">
        {{ feedback.message }}
      </p>

      <p class="text-xs text-gray-400 mt-2">
        {{ feedback.email }}
      </p>

      <!-- REJECTION REASON -->
      <p
        v-if="feedback.status === 'rejected' && feedback.rejection_reason"
        class="text-xs text-red-500 mt-2"
      >
        Rejected: {{ feedback.rejection_reason }}
      </p>

      <!-- ACTIONS -->
      <div
        v-if="feedback.status === 'pending'"
        class="flex gap-3 mt-4"
      >
        <button
          class="px-3 py-1 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          @click="emit('accept', feedback)"
        >
          Accept
        </button>

        <button
          class="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
          @click="emit('reject', feedback)"
        >
          Reject
        </button>
      </div>
    </div>
  </div>
</template>
