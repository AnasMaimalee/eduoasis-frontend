<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { message, Button, Tabs, Spin } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'

import ExamTable from '@/components/CBT/admin/exam/ExamTable.vue'
import LiveCbtTable from '@/components/CBT/admin/live/LiveCbtTable.vue'
import ExamDetailModal from '@/components/CBT/admin/exam/ExamDetailModal.vue'
import InvalidateExamModal from '@/components/CBT/admin/exam/InvalidateExamModal.vue'
import ExamAnalyticsModal from '@/components/CBT/admin/exam/ExamAnalyticsModal.vue'
import ExamRankings from '@/components/CBT/admin/exam/ExamRankings.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'CBT Exams'
})

const { $api } = useNuxtApp()

const activeTab = ref('exams')

// All exams
const exams = ref<any[]>([])
const loadingExams = ref(false)

// Live sessions
const liveSessions = ref<any[]>([])
const loadingLive = ref(false)
let intervalId: NodeJS.Timeout | null = null

// Modal states
const selectedExam = ref<any | null>(null)
const showExamModal = ref(false)
const showInvalidateModal = ref(false)
const showAnalyticsModal = ref(false)
const examToInvalidate = ref<any | null>(null)

// -------------------- FETCH EXAMS --------------------
const fetchExams = async () => {
  loadingExams.value = true
  try {
    const res = await $api('/cbt/superadmin/exams')
    // ✅ SAFETY: Make sure exams is always an array
    exams.value = Array.isArray(res.data?.data) ? res.data.data : []
    if (!exams.value.length) message.info('No exams found.')
  } catch (err) {
    console.error(err)
    message.error('Failed to fetch exams.')
    exams.value = []
  } finally {
    loadingExams.value = false
  }
}

// -------------------- FETCH LIVE SESSIONS --------------------
const fetchLiveSessions = async () => {
  loadingLive.value = true
  try {
    const res = await $api('/cbt/superadmin/live')
    liveSessions.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error(err)
    message.error('Failed to fetch live sessions.')
    liveSessions.value = []
  } finally {
    loadingLive.value = false
  }
}

// Auto-refresh live sessions every 30s
const startAutoRefresh = () => {
  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(fetchLiveSessions, 30000)
}

// -------------------- ACTIONS --------------------
const viewExam = (exam: any) => {
  selectedExam.value = exam
  showExamModal.value = true
}

const invalidateExam = (exam: any) => {
  examToInvalidate.value = exam
  showInvalidateModal.value = true
}

const viewAnalytics = (exam: any) => {
  selectedExam.value = exam
  showAnalyticsModal.value = true
}


const downloadPdf = async (exam: any) => {
  try {
    // $api automatically includes auth headers
    const blob = await $api(`/cbt/superadmin/exams/${exam.id}/pdf`, {
      responseType: 'blob' // important to treat response as binary
    })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exam-${exam.id}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error(err)
    message.error('Failed to download PDF')
  }
}


// -------------------- MOUNTED --------------------
onMounted(() => {
  fetchExams()
  fetchLiveSessions()
  startAutoRefresh()
})

// -------------------- CLEANUP --------------------
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="p-6 space-y-6 bg-emerald-50">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">📝 Exam Management</h1>
      <Button
        icon="<ReloadOutlined />"
        type="primary"
        @click="fetchExams"
      >
        Reload Exams
      </Button>
    </div>

    <Tabs v-model:activeKey="activeTab">
      <!-- All Exams -->
      <Tabs.TabPane key="exams" tab="All Exams">
        <Spin :spinning="loadingExams">
          <ExamTable
            :exams="exams"
            @view="viewExam"
            @invalidate="invalidateExam"
            @score="viewAnalytics"
            @pdf="downloadPdf"
          />
        </Spin>
      </Tabs.TabPane>

      <!-- Live Sessions -->
      <Tabs.TabPane key="live" tab="Live Sessions">
        <Spin :spinning="loadingLive">
          <LiveCbtTable
            :sessions="liveSessions"
            @refresh="fetchLiveSessions"
          />
        </Spin>
      </Tabs.TabPane>

      <!-- Rankings -->
        <Tabs.TabPane key="rankings" tab="Rankings">
            <ExamRankings />
        </Tabs.TabPane>

    </Tabs>

    <!-- MODALS -->
    <ExamDetailModal
      v-model:visible="showExamModal"
      :exam="selectedExam"
    />

    <InvalidateExamModal
      v-model:visible="showInvalidateModal"
      :examId="examToInvalidate?.id"
      @success="fetchExams"
    />

    <ExamAnalyticsModal
      v-model:visible="showAnalyticsModal"
      :exam="selectedExam"
    />
  </div>
</template>
