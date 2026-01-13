<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import { ReloadOutlined, FilePdfOutlined } from '@ant-design/icons-vue'

const props = defineProps<{ userId: string }>()

const { $api } = useNuxtApp()

const allTransactions = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const month = ref<number | null>(null)
const year = ref<string | null>(null)

const fetchTransactions = async () => {
  loading.value = true
  try {
    const res = await $api(`/users/${props.userId}/transactions`)
    allTransactions.value = res.transactions.data
  } finally {
    loading.value = false
  }
}

const filteredTransactions = computed(() => {
  return allTransactions.value.filter(tx => {
    const s = search.value.toLowerCase()
    const matchesSearch = !s || tx.description?.toLowerCase().includes(s)
    const matchesMonth = !month.value || dayjs(tx.created_at).month() + 1 === month.value
    const matchesYear = !year.value || dayjs(tx.created_at).format('YYYY') === year.value
    return matchesSearch && matchesMonth && matchesYear
  })
})

onMounted(() => fetchTransactions())

const exportPdf = async () => {
  const blob = await $api(`/users/${props.userId}/transactions/pdf`, { responseType: 'blob' })
  window.open(URL.createObjectURL(blob))
}
</script>

<template>
  <a-card>
    <div class="flex justify-between mb-4 items-center">
      <a-input v-model:value="search" placeholder="Search description" allow-clear class="max-w-xs" />
      <div class="flex gap-2">
        <a-button @click="fetchTransactions"><ReloadOutlined /> Refresh</a-button>
        <a-button type="primary" @click="exportPdf"><FilePdfOutlined /> Export PDF</a-button>
      </div>
    </div>

    <a-table :data-source="filteredTransactions" :loading="loading" row-key="id" bordered>
      <a-table-column title="S/N" width="60" align="center">
        <template #default="{ index }">{{ index + 1 }}</template>
      </a-table-column>
      <a-table-column title="Type" width="120">
        <template #default="{ record }">
          <a-tag :color="record.type === 'credit' ? 'green' : 'red'">{{ record.type.toUpperCase() }}</a-tag>
        </template>
      </a-table-column>
      <a-table-column title="Description">{{ record => record.description }}</a-table-column>
      <a-table-column title="Balance Before" align="right">
        {{ record => '₦' + Number(record.balance_before).toLocaleString() }}
      </a-table-column>
      <a-table-column title="Amount" align="right">
        <template #default="{ record }">
          <span :class="record.type==='credit'?'text-green-600 font-bold':'text-red-600 font-bold'">
            {{ record.type==='credit'?'+':'-' }}₦{{ Number(record.amount).toLocaleString() }}
          </span>
        </template>
      </a-table-column>
      <a-table-column title="Balance After" align="right">
        {{ record => '₦' + Number(record.balance_after).toLocaleString() }}
      </a-table-column>
      <a-table-column title="Date" width="180">
        {{ record => dayjs(record.created_at).format('DD MMM YYYY • hh:mm A') }}
      </a-table-column>
    </a-table>
  </a-card>
</template>
