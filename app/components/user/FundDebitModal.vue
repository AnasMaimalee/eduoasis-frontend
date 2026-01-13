<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Button, InputNumber, Input, message } from 'ant-design-vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    default: 'fund'
  }
})

const emit = defineEmits(['success'])

const { $api } = useNuxtApp()

const visible = ref(false)
const amount = ref(0)
const reason = ref('')
const loading = ref(false)

const toggleModal = () => {
  if (visible.value) {
    visible.value = false
  } else {
    amount.value = 0
    reason.value = ''
    visible.value = true
  }
}

const handleSubmit = async () => {
  if (!amount.value || amount.value <= 0) {
    message.error('Amount must be greater than 0')
    return
  }
  
  if (!reason.value.trim()) {
    message.error('Reason is required')
    return
  }

  loading.value = true
  try {
    await $api(`/users/${props.user.id}/${props.type}`, {
      method: 'POST',
      data: { 
        amount: Number(amount.value),
        reason: reason.value.trim()
      }
    })
    
    message.success(`${props.type === 'fund' ? 'Funded' : 'Debited'} successfully`)
    emit('success')
    visible.value = false
  } catch (err: any) {
    message.error(err.data?.message || `Failed to ${props.type} user`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- ✅ SMALL COMPACT BUTTON -->
  <Button 
    block 
    :type="props.type === 'fund' ? 'success' : 'warning'" 
    size="small"
    @click="toggleModal"
  >
    {{ props.type === 'fund' ? '<PlusCircleOutlined /> Fund' : 'Debit' }}
  </Button>

  <!-- ✅ SMALL COMPACT MODAL - width="400" -->
  <Modal
    v-model:visible="visible"
    :title="props.type === 'fund' ? 'Fund Wallet' : 'Debit Wallet'"
    :confirm-loading="loading"
    @ok="handleSubmit"
    :ok-text="props.type === 'fund' ? 'Fund' : 'Debit'"
    cancel-text="Cancel"
    **width="400"**  
    :closable="true"
  >
    <div class="space-y-3 p-1">  <!-- 👈 TIGHT SPACING -->
      <!-- Compact User Info -->
      <div class="text-sm bg-gray-50 p-2 rounded">
        <div class="font-semibold text-gray-800">{{ props.user.name }}</div>
        <div class="text-xs text-gray-500 truncate">{{ props.user.email }}</div>
      </div>
      
      <!-- Compact Balance -->
      <div class="text-right">
        <div class="text-xs text-gray-500">Balance:</div>
        <div class="text-lg font-bold text-green-600">
          ₦{{ Number(props.user.wallet?.balance || 0).toLocaleString() }}
        </div>
      </div>
      
      <!-- Compact Amount -->
      <InputNumber
        v-model:value="amount"
        :min="1"
        :precision="0"
        :step="100"
        placeholder="Amount"
        size="small"
        class="w-full"
      />
      
      <!-- Compact Reason -->
      <Input
        v-model:value="reason"
        placeholder="Reason (required)"
        size="small"
        class="w-full"
      />
    </div>
  </Modal>
</template>
