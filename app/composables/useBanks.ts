import { ref } from 'vue'
import { message } from 'ant-design-vue'

export function useBanks() {
  const banks = ref<any[]>([])
  const loading = ref(false)

  const fetchBanks = async () => {
    loading.value = true
    try {
      const { $api } = useNuxtApp()

      // 🔥 Backend should proxy Paystack (DO NOT call Paystack directly from frontend)
      const res = await $api('/banks')
      banks.value = res || []
    } catch (err: any) {
      message.error('Failed to load banks')
      banks.value = []
    } finally {
      loading.value = false
    }
  }

  const getBankCode = (bankName: string) => {
    const bank = banks.value.find(b => b.name === bankName)
    return bank?.code || ''
  }

  return {
    banks,
    loading,
    fetchBanks,
    getBankCode
  }
}
