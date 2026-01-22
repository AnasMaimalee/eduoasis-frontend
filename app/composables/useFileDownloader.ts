import { ref, nextTick } from 'vue'
import { message } from 'ant-design-vue'

export function useFileDownloader() {
  const downloadingId = ref<string | null>(null)
  const { $api } = useNuxtApp()

  const downloadFile = async (options: {
    id: string
    url: string
    defaultFilename?: string
    successMessage?: string
  }) => {
    // ❌ prevent parallel downloads
    if (downloadingId.value === options.id) return

    // ✅ set loading FIRST
    downloadingId.value = options.id

    // ✅ allow UI to update before request
    await nextTick()

    try {
      const response = await $api.raw(options.url, {
        method: 'GET',
        responseType: 'blob',
      })

      // ❌ Permission check
      if (response.status === 403) {
        message.error(
          response._data?.message || 'You are not allowed to download this file'
        )
        return
      }

      const blob = new Blob([response._data], {
        type:
          response.headers.get('content-type') ||
          'application/octet-stream',
      })

      // ✅ filename detection
      const disposition = response.headers.get('content-disposition')
      let filename =
        options.defaultFilename || `download-${Date.now()}`

      if (disposition?.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '')
      }

      // ✅ trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      message.success(options.successMessage || 'Download completed')
    } catch (error: any) {
      console.error('Download error:', error)

      message.error(
        error?.data?.message ||
        error?.response?._data?.message ||
        'You are not allowed to download this file'
      )
    } finally {
      // ✅ small delay so spinner is visible
      setTimeout(() => {
        downloadingId.value = null
      }, 300)
    }
  }

  return {
    downloadingId,
    downloadFile,
  }
}
