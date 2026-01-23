<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Select, Table, Card, Spin, message } from 'ant-design-vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'CBT Exam Ranking'
})

const { $api } = useNuxtApp()

const rankings = ref<any[]>([])
const subjects = ref<any[]>([])
const selectedSubject = ref<string | null>(null)
const loading = ref(false)

const fetchSubjects = async () => {
  const res = await $api('/subjects')
  subjects.value = res.data.data
}

const fetchRankings = async () => {
  loading.value = true
  try {
    const url = selectedSubject.value
      ? `/cbt/superadmin/rankings/subject/${selectedSubject.value}`
      : `/cbt/superadmin/rankings`

    const res = await $api(url)
    rankings.value = res.data.data
  } catch {
    message.error('Failed to load rankings')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSubjects()
  fetchRankings()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <Card title="🏆 CBT Rankings">
      <Select
        class="w-64 mb-4"
        placeholder="Filter by subject"
        allow-clear
        @change="fetchRankings"
        v-model:value="selectedSubject"
      >
        <Select.Option
          v-for="s in subjects"
          :key="s.id"
          :value="s.id"
        >
          {{ s.name }}
        </Select.Option>
      </Select>

      <Spin :spinning="loading">
        <Table :data-source="rankings" row-key="id">
          <Table.Column title="#" width="60">
            <template #default="{ index }">{{ index + 1 }}</template>
          </Table.Column>
          <Table.Column title="Student" dataIndex="user.name" />
          <Table.Column title="Score" dataIndex="total_score" />
          <Table.Column title="Exam Date" dataIndex="submitted_at" />
        </Table>
      </Spin>
    </Card>
  </div>
</template>
