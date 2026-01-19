<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Modal, Button } from 'ant-design-vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'submit'): void
}>()

const countdown = ref(30)
let timer: any = null

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      emit('submit')
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <Modal
    :open="visible"
    title="Time Up!"
    :closable="false"
    :maskClosable="false"
    footer={null}
  >
    <p class="text-lg font-semibold mb-4">
      Your exam time has ended.
    </p>

    <p class="mb-6">
      Your exam will be submitted automatically in
      <span class="text-red-600 font-bold">{{ countdown }}</span> seconds.
    </p>

    <Button type="primary" block danger @click="$emit('submit')">
      Submit Now
    </Button>
  </Modal>
</template>
