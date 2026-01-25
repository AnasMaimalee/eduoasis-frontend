<script setup lang="ts">
import { computed, ref } from 'vue'
import { Spin, Button, Alert } from 'ant-design-vue'
import FundWalletModal from '@/components/wallet/FundWalletModal.vue'

const props = defineProps({
  visible: { type: Boolean, required: true },
  serviceName: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },     // Pay loader
  preparing: { type: Boolean, default: false }    // Preparing loader
})

const emit = defineEmits([
  'confirm',
  'cancel',
  'refreshWallet'
])

/* ===================== COMPUTED ===================== */
const insufficientFunds = computed(() => props.walletBalance < props.amount)

const balanceAfter = computed(() =>
  props.walletBalance - props.amount
)

/* ===================== FUND WALLET MODAL ===================== */
const fundWalletVisible = ref(false)
</script>

<template>
  <a-modal
    :open="visible"
    title="Confirm Transaction"
    :confirm-loading="loading"
    ok-text="Confirm & Pay"
    :ok-button-props="{ disabled: insufficientFunds || preparing }"
    @ok="emit('confirm')"
    @cancel="emit('cancel')"
  >
    <!-- PREPARING STATE -->
    <div
      v-if="preparing"
      class="flex justify-center items-center py-12"
    >
      <Spin size="large" tip="Preparing confirmation..." />
    </div>

    <!-- CONTENT -->
    <div v-else class="space-y-4 text-gray-800">
      <!-- SERVICE -->
      <div class="flex justify-between">
        <span class="font-semibold">Service</span>
        <span class="font-bold text-emerald-700">
          {{ serviceName }}
        </span>
      </div>

      <!-- AMOUNT -->
      <div class="flex justify-between">
        <span class="font-semibold">Amount</span>
        <span class="font-bold text-red-600">
          ₦{{ amount.toLocaleString() }}
        </span>
      </div>

      <!-- WALLET -->
      <div class="flex justify-between">
        <span class="font-semibold">Wallet Balance</span>
        <span class="font-bold">
          ₦{{ walletBalance.toLocaleString() }}
        </span>
      </div>

      <!-- BALANCE AFTER -->
      <div class="flex justify-between border-t pt-3">
        <span class="font-semibold">Balance After</span>
        <span
          class="font-bold"
          :class="balanceAfter < 0 ? 'text-red-600' : 'text-emerald-700'"
        >
          ₦{{ balanceAfter.toLocaleString() }}
        </span>
      </div>

      <!-- INSUFFICIENT FUNDS WARNING -->
      <Alert
        v-if="insufficientFunds"
        type="error"
        show-icon
        message="Insufficient wallet balance"
        description="You need to fund your wallet to proceed with this transaction."
      />

      <!-- FUND WALLET CTA -->
      <div v-if="insufficientFunds">
        <Button
          type="primary"
          block
          class="bg-emerald-600 hover:bg-emerald-700 border-none"
          @click="fundWalletVisible = true"
        >
          Fund Wallet
        </Button>
      </div>

      <!-- WARNING -->
      <p
        class="text-red-500 bg-red-50 p-2 text-sm border border-red-200 rounded-xl"
      >
        ⚠️ This action will immediately debit your wallet.
      </p>
    </div>
  </a-modal>

  <!-- 🔥 FUND WALLET MODAL -->
  <FundWalletModal
    v-model:open="fundWalletVisible"
    @funded="emit('refreshWallet')"
  />
</template>
