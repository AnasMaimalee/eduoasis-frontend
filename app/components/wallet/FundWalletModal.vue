<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Button, Input, Form, message } from 'ant-design-vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits(['update:open', 'funded'])

const { $api } = useNuxtApp()

const fundingAmount = ref<number | null>(null)
const loading = ref(false)

const close = () => {
  emit('update:open', false)
  fundingAmount.value = null
}

const fundWallet = async () => {
  const amount = Number(fundingAmount.value)
  if (!amount || amount < 1000) {
    message.error('Minimum funding amount is ₦1,000')
    return
  }

  try {
    loading.value = true
    const res = await $api('/wallet/initialize', {
      method: 'POST',
      body: { amount }
    })

    const authUrl = res?.data?.authorization_url
    if (!authUrl) throw new Error()

    window.open(authUrl, '_blank')
    emit('funded')
    close()
  } catch {
    message.error('Unable to initialize payment')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Modal :open="open" centered :footer="null" :closable="false">
    <div class="text-center font-bold text-emerald-700 mb-3">💰 Fund Wallet</div>

    <Form layout="vertical">
      <Form.Item label="Amount (₦)">
        <Input v-model:value.number="fundingAmount" type="number" placeholder="1000" />
      </Form.Item>

      <div class="flex gap-2">
        <Button block @click="close">Cancel</Button>
        <Button type="primary" block :loading="loading" @click="fundWallet">
          Fund Wallet
        </Button>
      </div>
    </Form>
  </Modal>
</template>
