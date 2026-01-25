import { useJobsStore } from '@/stores/jobs'

export default defineNuxtPlugin(nuxtApp => {
  const { $echo } = nuxtApp
  if (!$echo) return

  const jobsStore = useJobsStore()
  jobsStore.init()

  $echo.private('jobs.admin')
    .listen('.jamb-job-submitted', (event: any) => {
      jobsStore.addJob(event.job)
    })
    .listen('.job-updated', (event: any) => {
      jobsStore.updateJob(event.job)
    })
})
