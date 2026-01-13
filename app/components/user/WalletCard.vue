<script setup lang="ts">
import { defineProps } from 'vue'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue'
import { ref, computed } from 'vue'

const props = defineProps<{
  balance: number | string
  currency?: string
  loading?: boolean
}>()

const hideBalance = ref(true)
const balanceText = computed(() =>
  hideBalance.value ? '••••••' : `₦${Number(props.balance || 0).toLocaleString()}`
)
</script>

<template>
  <div
    class="relative overflow-hidden rounded-3xl p-8 shadow-lg"
    style="background: linear-gradient(135deg, #15423c, #1f3a36)"
  >
    <div class="absolute inset-0 bg-white/5"></div>

    <div class="relative z-10 flex flex-col md:flex-row md:justify-between text-white items-start">
      <div>
        <p class="text-sm uppercase tracking-wide text-gray-300">Wallet Balance</p>
        <h1 class="text-4xl font-extrabold mt-2">
          <span v-if="!props.loading">{{ balanceText }}</span>
          <a-skeleton-input v-else style="width: 120px" active size="large" />
        </h1>
        <p class="text-sm mt-1 text-gray-300">Available funds</p>
      </div>

      <div class="flex gap-3 mt-4 md:mt-0">
        <a-button ghost size="large" class="border-white/40 text-white" @click="hideBalance = !hideBalance">
          <component :is="hideBalance ? EyeOutlined : EyeInvisibleOutlined" />
          {{ hideBalance ? 'Show' : 'Hide' }}
        </a-button>
      </div>
    </div>
  </div>
</template>
