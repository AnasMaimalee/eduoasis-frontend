<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Input, message } from 'ant-design-vue'

const props = defineProps<{ examId: string; visible: boolean }>()
const emit = defineEmits(['update:visible', 'success'])
const { $api } = useNuxtApp()

const reason = ref('')
const loading = ref(false)

const submit = async () => {
  if (!reason.value) return message.warning('Reason required')

  loading.value = true
  try {
    await $api(`/cbt/superadmin/exams/${props.examId}/invalidate`, {
      method: 'POST',
      body: { reason: reason.value }
    })
    message.success('Exam invalidated')
    emit('success')
    emit('update:visible', false)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Modal
    :open="visible"
    title="Invalidate Exam"
    :confirm-loading="loading"
    @ok="submit"
    @cancel="$emit('update:visible', false)"
  >
    <Input.TextArea v-model:value="reason" rows="4" />
  </Modal>
</template>
