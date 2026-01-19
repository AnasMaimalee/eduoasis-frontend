<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import ResultHeader from '~/components/CBT/user/result/ResultHeader.vue'
import ResultTable from '~/components/CBT/user/result/ResultTable.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user'],
})

const { $api } = useNuxtApp()

const loading = ref(false)
const results = ref<any[]>([])
const search = ref('')

const filteredResults = computed(() => {
  if (!search.value) return results.value
  return results.value.filter(r =>
    r.exam_id.toLowerCase().includes(search.value.toLowerCase())
  )
})

const fetchResults = async () => {
  loading.value = true
  try {
    const res = await $api('/cbt/user/result-history')
    results.value = res.data ?? []
  } catch (e) {
    message.error('Failed to load results')
  } finally {
    loading.value = false
  }
}

onMounted(fetchResults)
</script>

<template>
  <div class="p-4 space-y-4">
    <ResultHeader
      v-model:search="search"
      :loading="loading"
      @refresh="fetchResults"
    />

    <ResultTable
      :data="filteredResults"
      :loading="loading"
    />
  </div>
</template>
