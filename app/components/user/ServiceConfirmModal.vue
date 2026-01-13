<script setup lang="ts">
import { computed } from 'vue'
import { Spin } from 'ant-design-vue'

const props = defineProps({
  visible: { type: Boolean, required: true },
  serviceName: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },     // Pay loader
  preparing: { type: Boolean, default: false }    // Preparing loader
})

const emit = defineEmits(['confirm', 'cancel'])

const insufficientFunds = computed(() => props.walletBalance < props.amount)
const balanceAfter = computed(() => (props.walletBalance - props.amount).toFixed(2))
</script>

<template>
  <a-modal
    :open="visible"
    title="Confirm Transaction"
    :confirm-loading="loading"
    :ok-button-props="{ disabled: insufficientFunds || preparing }"
    ok-text="Confirm & Pay"
    @ok="emit('confirm')"
    @cancel="emit('cancel')"
  >
    <!-- PREPARING LOADER -->
    <div v-if="preparing" class="flex justify-center items-center py-12">
      <Spin size="large" tip="Preparing confirmation..." />
    </div>

    <!-- CONTENT -->
    <div v-else class="space-y-4 text-gray-800">
      <div class="flex justify-between">
        <span class="font-semibold">Service</span>
        <span class="font-bold text-emerald-700">{{ serviceName }}</span>
      </div>

      <div class="flex justify-between">
        <span class="font-semibold">Amount</span>
        <span class="font-bold text-red-600">₦{{ amount.toLocaleString() }}</span>
      </div>

      <div class="flex justify-between">
        <span class="font-semibold">Wallet Balance</span>
        <span class="font-bold">₦{{ walletBalance.toLocaleString() }}</span>
      </div>

      <div class="flex justify-between border-t pt-3">
        <span class="font-semibold">Balance After</span>
        <span class="font-bold" :class="Number(balanceAfter) < 0 ? 'text-red-600' : 'text-emerald-700'">
          ₦{{ balanceAfter }}
        </span>
      </div>

      <a-alert v-if="insufficientFunds" type="error" show-icon message="Insufficient wallet balance" />

      <p class="text-red-400 bg-red-50 p-2 text-sm border border-red-300 rounded-xl">
        ⚠️ This action will immediately debit your wallet.
      </p>
    </div>
  </a-modal>
</template>
