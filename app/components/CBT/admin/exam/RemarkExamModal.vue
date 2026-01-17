<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Input, message } from 'ant-design-vue'

const props = defineProps<{ examId: string; visible: boolean }>()
const emit = defineEmits(['update:visible'])

const remark = ref('')
const loading = ref(false)
const { $api } = useNuxtApp()

const submit = async () => {
  loading.value = true
  try {
    await $api(`/cbt/superadmin/exams/${props.examId}/remark`, {
        method: 'POST',
      body: {
        remark: remark.value
      }
    })
    message.success('Remark saved')
    emit('update:visible', false)
  } catch {
    message.error('Failed to save remark')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Modal
    :visible="visible"
    title="Add Remark"
    :confirm-loading="loading"
    @ok="submit"
    @cancel="$emit('update:visible', false)"
  >
    <Input.TextArea
      v-model:value="remark"
      placeholder="Exam remark"
      rows="4"
    />
  </Modal>
</template>
