<script setup lang="ts">
import { Table, Dropdown, Menu, message } from 'ant-design-vue'
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons-vue'
import SubjectScoreTag from './SubjectScoreTag.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const { $api } = useNuxtApp()
const router = useRouter()

defineProps<{
  data: any[]
  loading: boolean
}>()

/** Smart time formatter */
function smartTime(seconds: number) {
  const s = Math.abs(seconds || 0)
  const mins = Math.floor(s / 60)
  const secs = s % 60

  return secs === 0 ? `${mins} Mins` : `${mins}M:${String(secs).padStart(2, '0')}S`
}

/** Track downloading */
const downloadingExamId = ref<string | null>(null)

/** Download PDF */
const downloadPDF = async (examId: string) => {
  downloadingExamId.value = examId

  try {
    const res = await $api(`/cbt/user/results/${examId}/pdf`, {
      responseType: 'blob',
    })

    const blob = new Blob([res], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `Exam-${examId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)
  } catch (e) {
    message.error('Failed to download result PDF')
    console.error(e)
  } finally {
    downloadingExamId.value = null
  }
}

/** Redirect to view */
const viewResult = (examId: string) => {
  router.push(`/user/cbt/results/${examId}`)
}

/** Table columns */
const columns = [
  {
    title: 'Exam ID',
    dataIndex: 'exam_id',
    key: 'exam_id',
  },
  {
    title: 'Score',
    key: 'score',
    customRender: ({ record }: any) => `${record.total_correct}/${record.total_questions}`,
  },
  {
    title: 'Time Spent',
    key: 'time',
    customRender: ({ record }: any) => smartTime(record.time_spent_seconds),
  },
  {
    title: 'Subjects',
    key: 'subjects',
  },
  {
    title: 'Submitted At',
    dataIndex: 'submitted_at',
  },
  {
    title: 'Actions',
    key: 'actions',
  },
]
</script>

<template>
  <div class="overflow-x-auto">
    <Table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      row-key="exam_id"
      bordered
      :scroll="{ x: 1000 }"
    >
      <template #bodyCell="{ column, record }">
        <!-- SUBJECT SCORES -->
        <template v-if="column.key === 'subjects'">
          <div class="flex flex-wrap gap-1">
            <SubjectScoreTag
              v-for="s in record.subjects"
              :key="s.name"
              :subject="s"
            />
          </div>
        </template>

        <!-- ACTIONS DROPDOWN -->
        <template v-if="column.key === 'actions'">
          <Dropdown trigger="click">
            <button
              class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              Actions
            </button>
            <template #overlay>
              <Menu>
                <Menu.Item @click="viewResult(record.exam_id)">
                  <EyeOutlined /> View
                </Menu.Item>
                <Menu.Item @click="downloadPDF(record.exam_id)">
                  <DownloadOutlined />
                  <span>
                    {{
                      downloadingExamId === record.exam_id
                        ? 'Downloading...'
                        : 'Download PDF'
                    }}
                  </span>
                </Menu.Item>
              </Menu>
            </template>
          </Dropdown>
        </template>
      </template>
    </Table>
  </div>
</template>
