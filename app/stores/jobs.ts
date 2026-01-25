// stores/jobs.ts
import { defineStore } from 'pinia'
import { SERVICES } from '@/constants/services'

export interface Job {
  id: string
  service_slug: string
  status: string
  email: string
  [key: string]: any
}

export const useJobsStore = defineStore('jobs', () => {
  const jobsByService = ref<Record<string, Job[]>>({})

  const init = () => {
    SERVICES.forEach(slug => {
      if (!jobsByService.value[slug]) {
        jobsByService.value[slug] = []
      }
    })
  }

  const setJobs = (slug: string, jobs: Job[]) => {
    jobsByService.value[slug] = jobs
  }

  const addJob = (job: Job) => {
    const slug = job.service_slug
    if (!slug) return

    if (!jobsByService.value[slug]) {
      jobsByService.value[slug] = []
    }

    const serviceJobs = jobsByService.value[slug]
    if (!serviceJobs.some(j => j.id === job.id)) {
      serviceJobs.unshift(job)
      console.log('✅ STORE: Added to', slug, job.email)
    }
  }

  const updateJob = (job: Job) => {
    const slug = job.service_slug
    const serviceJobs = jobsByService.value[slug]
    if (!serviceJobs) return

    const index = serviceJobs.findIndex(j => j.id === job.id)
    if (index !== -1) {
      serviceJobs[index] = job
    }
  }

  return { 
    jobsByService, 
    init, 
    setJobs, 
    addJob, 
    updateJob 
  }
})
