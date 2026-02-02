<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message, Modal, Input } from 'ant-design-vue'
import FeedbackList from '~/components/feedback/FeedbackList.vue'
import FeedbackSkeleton from '~/components/feedback/FeedbackSkeleton.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'Feedbacks',
})

const { $api } = useNuxtApp()

const feedbacks = ref<any[]>([])
const loading = ref(false)

/* Fetch feedbacks */
const fetchFeedbacks = async () => {
  loading.value = true
  try {
    const res = await $api('/superadmin/feedback')
    feedbacks.value = res.data
  } catch {
    message.error('Failed to load feedbacks')
  } finally {
    loading.value = false
  }
}

/* Accept */
const acceptFeedback = async (feedback: any) => {
  try {
    await $api(`/superadmin/feedback/${feedback.id}/status`, {
      method: 'PATCH',
      body: { status: 'accepted' },
    })
    feedback.status = 'accepted'
    feedback.rejection_reason = null
    message.success('Feedback accepted')
  } catch {
    message.error('Failed to accept feedback')
  }
}

/* Reject */
const rejectFeedback = (feedback: any) => {
  let reason = ''

  Modal.confirm({
    title: 'Reject Feedback',
    content: () =>
      h(Input.TextArea, {
        placeholder: 'Enter rejection reason',
        onChange: (e: any) => (reason = e.target.value),
      }),
    async onOk() {
      if (!reason) {
        message.error('Rejection reason is required')
        throw new Error()
      }

      await $api(`/superadmin/feedback/${feedback.id}/status`, {
        method: 'PATCH',
        body: {
          status: 'rejected',
          rejection_reason: reason,
        },
      })

      feedback.status = 'rejected'
      feedback.rejection_reason = reason
      message.success('Feedback rejected')
    },
  })
}

onMounted(fetchFeedbacks)
</script>

<template>
  <div class="p-6 bg-emerald-50 min-h-screen">
    <!-- HEADER -->
    <div class="mb-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl">
      <h1 class="text-2xl font-bold">Feedbacks</h1>
      <p class="text-sm opacity-90">
        {{ feedbacks.filter(f => f.status === 'pending').length }} pending
      </p>
    </div>

    <FeedbackSkeleton v-if="loading" />

    <FeedbackList
      v-else-if="feedbacks.length"
      :feedbacks="feedbacks"
      @accept="acceptFeedback"
      @reject="rejectFeedback"
    />

    <div
      v-else
      class="text-center text-gray-400 py-10"
    >
      No feedback yet 🎉
    </div>
  </div>
</template>
