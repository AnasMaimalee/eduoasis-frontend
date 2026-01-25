import { reactive, ref, computed, watch, onMounted, type Ref } from 'vue'
import { useNuxtApp } from '#app'
import { message } from 'ant-design-vue'

// ✅ EXPLICIT TYPE DEFINITION
interface ServiceJob {
  id: string | number
  name?: string
  email: string
  registration_number?: string
}

interface LoadingState {
  pending: boolean
  processing: boolean
  completed: boolean
  take: Record<string | number, boolean>
  complete: boolean
  refresh: boolean
}

export function useServiceJobs(serviceSlug: string) {
  const { $api } = useNuxtApp()

  /* =====================
     STATE
  ===================== */
  const jobs = reactive({
    pending: [] as ServiceJob[],
    processing: [] as ServiceJob[],
    completed: [] as ServiceJob[]
  })

  const loading = reactive<LoadingState>({
    pending: false,
    processing: false,
    completed: false,
    take: {},
    complete: false,
    refresh: false
  })

  const activeTab = ref<'pending' | 'processing' | 'completed'>('pending')
  const selectedJob = ref<ServiceJob | null>(null)
  const fileList = ref<any[]>([])
  const viewingId = ref<string | null>(null)
  const takingJobId = ref<string | null>(null) // ✅ Properly typed

  /* =====================
     COMPUTED
  ===================== */
  const pendingJobs = computed(() => jobs.pending)
  const processingJobs = computed(() => jobs.processing)
  const completedJobs = computed(() => jobs.completed)

  // ✅ EXPOSE UNWRAPPED VALUE FOR TEMPLATE
  const takingJobIdValue = computed(() => takingJobId.value)

  /* =====================
     FETCH (unchanged)
  ===================== */
  async function fetchJobs(type: 'pending' | 'processing' | 'completed') {
    loading[type] = true
    try {
      const endpoint =
        type === 'pending'
          ? `/services/${serviceSlug}/pending`
          : type === 'processing'
          ? `/services/${serviceSlug}/my-pending-job`
          : `/services/${serviceSlug}/administrator`

      const res = await $api(endpoint)
      const data = res.data?.data || res.data || []

      jobs[type].splice(0, jobs[type].length, ...data)
    } catch (e) {
      console.error(e)
      jobs[type].splice(0)
    } finally {
      loading[type] = false
    }
  }

  async function refreshAll() {
    loading.refresh = true
    try {
      await Promise.all([
        fetchJobs('pending'),
        fetchJobs('processing'),
        fetchJobs('completed')
      ])
    } finally {
      loading.refresh = false
    }
  }

  /* =====================
     ACTIONS
  ===================== */
  async function takeJob(job: ServiceJob) {
    takingJobId.value = job.id as string
    loading.take[job.id] = true
    try {
      await $api(`/services/${serviceSlug}/${job.id}/take`, { method: 'POST' })
      message.success('Job taken')
      await Promise.all([fetchJobs('pending'), fetchJobs('processing')])
    } catch (e: any) {
      message.error(e?.data?.message || 'Failed to take job')
    } finally {
      loading.take[job.id] = false
      takingJobId.value = null
    }
  }

  async function completeJob(): Promise<boolean> {
    if (!fileList.value.length || !selectedJob.value) return false

    const fd = new FormData()
    fd.append('file', fileList.value[0].originFileObj)

    loading.complete = true
    try {
      await $api(`/services/${serviceSlug}/${selectedJob.value.id}/complete`, {
        method: 'POST',
        body: fd
      })

      message.success('Job completed')
      fileList.value = []
      selectedJob.value = null
      await Promise.all([fetchJobs('processing'), fetchJobs('completed')])
      return true
    } catch (e: any) {
      message.error(e?.data?.message || 'Failed to complete job')
      return false
    } finally {
      loading.complete = false
    }
  }

  function beforeUpload(file: File) {
    fileList.value = [{ name: file.name, originFileObj: file }]
    return false
  }

  /* =====================
     LIFECYCLE
  ===================== */
  onMounted(() => fetchJobs(activeTab.value))
  watch(activeTab, (tab) => fetchJobs(tab))

  return {
    pendingJobs,
    processingJobs,
    completedJobs,
    loading,
    takingJobId,       
    takingJobIdValue,   
    activeTab,
    selectedJob,
    fileList,
    viewingId,
    refreshAll,
    takeJob,
    completeJob,
    beforeUpload
  }
}
