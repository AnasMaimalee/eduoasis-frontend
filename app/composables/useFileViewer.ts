export function useFileViewer() {
  const viewingId = ref<string | null>(null)
  const { $api } = useNuxtApp()

  const viewFile = async (id: string, url: string) => {
    if (viewingId.value) return
    viewingId.value = id

    try {
      const response = await $api.raw(url, {
        method: 'GET',
        responseType: 'blob',
      })

      // ❌ Permission check
      if (response.status !== 200) {
        throw new Error('Unable to load document')
      }

      const contentType =
        response.headers.get('content-type') || 'application/pdf'

      const blob = new Blob([response._data], { type: contentType })
      const fileUrl = URL.createObjectURL(blob)

      window.open(fileUrl, '_blank')

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(fileUrl), 15000)
    } catch (err) {
      message.error('Failed to load document')
    } finally {
      viewingId.value = null
    }
  }

  return { viewFile, viewingId }
}
