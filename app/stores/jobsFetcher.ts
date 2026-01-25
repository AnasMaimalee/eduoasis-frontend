// stores/jobsFetcher.ts
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { message } from 'ant-design-vue'

export const useJobsFetcherStore = defineStore('jobsFetcher', () => {
  const jobs = reactive({
    pending: [] as any[],
    processing: [] as any[],
    completed: [] as any[]
  })

  const loading = reactive({
    pending: false,
    processing: false,
    completed: false,
    refresh: false
  })

  const fetchJobs = async ($api: any, serviceSlug: string, type: 'pending' | 'processing' | 'completed') => {
    loading[type] = true
    try {
      const endpoint = 
        type === 'pending' ? `/services/${serviceSlug}/pending` :
        type === 'processing' ? `/services/${serviceSlug}/my-pending-job` :
        `/services/${serviceSlug}/administrator`

      const res = await $api(endpoint)
      jobs[type] = res.data?.data || res.data || []
    } catch (err: any) {
      if (err.message?.includes('ERR_INTERNET_DISCONNECTED')) {
        console.warn('⚠️ API offline - using cached data')
      } else {
        message.error(err.data?.message || `Failed to fetch ${type} jobs`)
      }
      jobs[type] = []
    } finally {
      loading[type] = false
    }
  }

  const fetchAll = async ($api: any, serviceSlug: string) => {
    loading.refresh = true
    await Promise.all([
      fetchJobs($api, serviceSlug, 'pending'),
      fetchJobs($api, serviceSlug, 'processing'),
      fetchJobs($api, serviceSlug, 'completed')
    ])
    loading.refresh = false
  }

  // ✅ FIXED: Generic service-aware addJob
  const addJob = (job: any, serviceSlug: string) => {
    const normalizedJob = {
      id: job.id,
      email: job.email,
      phone_number: job.phone_number || '',
      registration_number: job.registration_number || '',
      profile_code: job.profile_code || '',
      status: 'pending',
      service_slug: serviceSlug,
      user: job.user || null,
      created_at: job.created_at || new Date().toISOString()
    }

    console.log('🔥 ADDING to', serviceSlug, ':', normalizedJob.email)

    // Only add to pending if service matches
    if (normalizedJob.service_slug === serviceSlug && 
        !jobs.pending.some((j: any) => j.id === normalizedJob.id)) {
      jobs.pending.unshift(normalizedJob)
      console.log('✅ FETCHER: Added pending job', normalizedJob.id)
    }
  }

  const updateJob = (job: any) => {
    ;['pending', 'processing', 'completed'].forEach(list => {
      const index = (jobs as any)[list].findIndex((j: any) => j.id === job.id)
      if (index !== -1) {
        ;(jobs as any)[list][index] = job
      }
    })
  }

  return { jobs, loading, fetchJobs, fetchAll, addJob, updateJob }
})
