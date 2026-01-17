<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message, Select, Spin } from 'ant-design-vue'

const { $api } = useNuxtApp()

// Rankings state
const rankings = ref<any[]>([])
const subjects = ref<any[]>([])
const selectedSubject = ref<string | null>(null)
const loadingRankings = ref(false)

// Cache exam details to avoid multiple API calls
const examCache = ref<Record<string, any>>({})

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

    // Fetch exam details for each ranking row
    await Promise.all(rankings.value.map(async (r) => {
      if (r.exam_id && !examCache.value[r.exam_id]) {
        try {
          const examRes = await $api(`/cbt/superadmin/exams/${r.exam_id}`)
          examCache.value[r.exam_id] = examRes.data?.data || null
        } catch (err) {
          console.error(`Failed to fetch exam ${r.exam_id}`, err)
          examCache.value[r.exam_id] = null
        }
      }
    }))
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
        class="rounded-xl overflow-hidden live-table"
      >
        <a-table-column title="Position" :dataIndex="'rank'" />

        <a-table-column title="Candidate">
          <template #default="{ record }">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ record.user_name?.charAt(0) }}
              </div>
              <div>
                <p class="font-semibold">{{ record.user_name }}</p>
              </div>
            </div>
          </template>
        </a-table-column>

        <a-table-column title="Score" :dataIndex="'score'" />

        <a-table-column title="Exam">
          <template #default="{ record }">
            <div>
              <!-- Display subjects if exam details exist -->
              <template v-if="examCache[record.exam_id]">
                {{ examCache[record.exam_id].subjects.map((s: any) => s.name).join(', ') }}
              </template>
              <template v-else>Loading…</template>
            </div>
          </template>
        </a-table-column>
      </a-table>
    </Spin>
  </div>
</template>

<style scoped>
.live-table :deep(.ant-table-thead > tr > th) {
  background-color: #10b981; /* Emerald green */
  color: #ffffff;             /* White text */
  font-weight: 600;
  text-align: center;
}

.live-table :deep(.ant-table-tbody tr) {
  @apply border-b border-gray-100;
}

.live-table :deep(.ant-table-tbody tr:hover) {
  @apply bg-emerald-50/70 shadow-sm;
}
</style>
