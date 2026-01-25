<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SubjectSelector from '~/components/CBT/user/exam/SubjectSelector.vue'
import { message } from 'ant-design-vue'
definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
    roles: ['user'],
    title: 'CBT Subject Selection '
})
const { $api } = useNuxtApp()
const router = useRouter()

const loading = ref(true)
const ongoingExamId = ref<string | null>(null)

const checkOngoingExam = async () => {
  try {
    const res = await $api('/cbt/user/exam/ongoing')
    if (res.data?.exam_id) {
      ongoingExamId.value = res.data.exam_id
      router.replace(`/user/cbt/exam/${ongoingExamId.value}`)
      return
    }
  } catch {}
  loading.value = false
}



onMounted(checkOngoingExam)
</script>

<template>
  <div class="bg-emerald-50">
    <div v-if="loading" class="text-center p-10">
      <a-spin class="large"></a-spin>
    </div>

    <SubjectSelector
      v-else
      @exam-started="id => $router.push(`/user/cbt/exam/${id}`)"
    />
  </div>
</template>
