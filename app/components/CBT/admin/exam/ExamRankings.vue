<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message, Select, Spin } from 'ant-design-vue'

const { $api } = useNuxtApp()

// Rankings state
const rankings = ref<any[]>([])
const subjects = ref<any[]>([])
const selectedSubject = ref<string | null>(null)
const loadingRankings = ref(false)

// Fetch subjects for filter
const fetchSubjects = async () => {
  try {
    const res = await $api('/cbt/subjects')
    subjects.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error(err)
    message.error('Failed to fetch subjects')
    subjects.value = []
  }
}

// Fetch overall or subject rankings
const fetchRankings = async (subjectId: string | null = null) => {
  loadingRankings.value = true
  try {
    const url = subjectId
      ? `/cbt/superadmin/rankings/subject/${subjectId}`
      : '/cbt/superadmin/rankings'
    const res = await $api(url)
    rankings.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error(err)
    message.error('Failed to fetch rankings')
    rankings.value = []
  } finally {
    loadingRankings.value = false
  }
}

const onSubjectChange = (value: string) => {
  selectedSubject.value = value
  fetchRankings(value)
}

onMounted(() => {
  fetchSubjects()
  fetchRankings()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4">
      <h2 class="text-xl font-semibold">🏆 Rankings</h2>

      <Select
        v-model:value="selectedSubject"
        placeholder="Filter by subject"
        allowClear
        style="width: 200px"
        @change="onSubjectChange"
      >
        <Select.Option
          v-for="subject in subjects"
          :key="subject.id"
          :value="subject.id"
        >
          {{ subject.name }}
        </Select.Option>
      </Select>
    </div>

    <Spin :spinning="loadingRankings">
      <a-table
        :dataSource="rankings"
        rowKey="id"
        :pagination="{ pageSize: 10 }"
        class="rounded-xl overflow-hidden"
      >
        <a-table-column title="Position" :dataIndex="'position'" />

        <a-table-column title="Candidate">
          <template #default="{ record }">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ record.user?.name?.charAt(0) }}
              </div>
              <div>
                <p class="font-semibold">{{ record.user?.name }}</p>
                <p class="text-xs text-gray-500">{{ record.user?.email }}</p>
              </div>
            </div>
          </template>
        </a-table-column>

        <a-table-column title="Score" :dataIndex="'total_score'" />

        <a-table-column title="Exam">
          <template #default="{ record }">
            {{ record.exam?.name || '—' }}
          </template>
        </a-table-column>
      </a-table>
    </Spin>
  </div>
</template>
