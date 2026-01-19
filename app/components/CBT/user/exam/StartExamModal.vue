<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Modal, Button } from 'ant-design-vue'

const props = defineProps<{ subjects: string[] }>()
const emit = defineEmits(['started'])

const { $api } = useNuxtApp()
const loading = ref(false)
const wallet = ref<any>(null)

onMounted(async () => {
  const res = await $api('/wallet')
  wallet.value = res.data
})

const confirmStart = async () => {
  loading.value = true
  const res = await $api('/cbt/user/exam/start', {
    method: 'POST',
    body: { subjects: props.subjects }
  })
  emit('started', res.data.data.exam_id)
}
</script>

<template>
  <Modal title="Confirm Exam Start">
    <p>Wallet balance before: ₦{{ wallet?.balance }}</p>
    <p>Exam fee: ₦1,000</p>
    <p>Balance after: ₦{{ wallet?.balance - 1000 }}</p>

    <Button
      type="primary"
      :loading="loading"
      @click="confirmStart"
    >
      Confirm & Start
    </Button>
  </Modal>
</template>
