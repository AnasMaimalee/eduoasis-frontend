import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

export function useServiceRequests(apiUrl: string, api: any) {
  const requests = ref<any[]>([])
  const loading = ref(false)
  const searchText = ref('')

  const pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
  })

  const filteredRequests = computed(() => {
    if (!searchText.value.trim()) return requests.value
    const q = searchText.value.toLowerCase()

    return requests.value.filter(r =>
      r.user?.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.service?.name?.toLowerCase().includes(q) ||
      r.registration_number?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
    )
  })

  const fetchRequests = async () => {
    loading.value = true
    try {
      const res = await api(apiUrl)
      requests.value = Array.isArray(res) ? res : res.data || []
      pagination.value.total = filteredRequests.value.length
    } catch {
      message.error('Failed to load requests')
    } finally {
      loading.value = false
    }
  }

  return {
    requests,
    loading,
    searchText,
    pagination,
    filteredRequests,
    fetchRequests,
  }
}
