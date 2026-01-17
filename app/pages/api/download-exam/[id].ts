// pages/api/download-exam/[id].ts
export default defineEventHandler(async (event) => {
  const examId = event.context.params?.id
  const runtimeConfig = useRuntimeConfig()
  const token = getCookie(event, 'auth_token') // or your auth method

  const res = await $fetch(`${runtimeConfig.public.apiBase}/cbt/superadmin/exams/${examId}/pdf`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    responseType: 'blob'
  })

  return new Response(res, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="exam-${examId}.pdf"`
    }
  })
})
