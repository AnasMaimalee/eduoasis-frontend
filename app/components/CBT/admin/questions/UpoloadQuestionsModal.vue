<script setup lang="ts">
import { ref, computed } from 'vue'
import { Modal, Button, Alert, Upload, Select, Spin, message } from 'ant-design-vue'
const { $api } = useNuxtApp()

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'questions-uploaded'])

const fileList = ref<any[]>([])
const selectedSubjectId = ref<string | null>(null)
const uploading = ref(false)
const subjects = ref<any[]>([])
const loadingSubjects = ref(false)

const canUpload = computed(() => 
  !!selectedSubjectId.value && 
  fileList.value.length > 0 && 
  !!fileList.value[0]?.originFileObj
)

const fetchSubjects = async () => {
  loadingSubjects.value = true
  try {
    const res = await $api('/cbt/subjects')
    subjects.value = res.data?.data || res.data || []
  } catch {
    message.error('Failed to load subjects')
  } finally {
    loadingSubjects.value = false
  }
}

const handleFileChange = (info: any) => {
  fileList.value = info.fileList.slice(-1)
}

const handleUpload = async () => {
  if (!canUpload.value) {
    message.warning('Please select subject and a CSV file')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', fileList.value[0].originFileObj)
    formData.append('subject_id', selectedSubjectId.value!)

    const res = await $api('/cbt/superadmin/questions/upload', {
      method: 'POST',
      body: formData
    })

    message.success(`Successfully uploaded ${res.data?.inserted || 0} questions!`)
    emit('questions-uploaded')
    resetUpload()
  } catch (err: any) {
    message.error(err.data?.message || 'Upload failed')
  } finally {
    uploading.value = false
  }
}

const resetUpload = () => {
  emit('update:visible', false)
  fileList.value = []
  selectedSubjectId.value = null
}

onMounted(() => {
  fetchSubjects()
})
</script>

<template>
  <Modal
    :visible="visible"
    title="📤 Upload Questions (CSV)"
    width="760"
    :confirm-loading="uploading"
    ok-text="🚀 Upload Now"
    cancel-text="Cancel"
    :ok-button-props="{ 
      disabled: !canUpload || uploading,
      loading: uploading,
      class: '!bg-emerald-600 hover:!bg-emerald-700 !border-none'
    }"
    @ok="handleUpload"
    @cancel="resetUpload"
    :mask-closable="false"
    :destroy-on-close="true"
  >
    <div v-if="loadingSubjects" class="flex justify-center py-20">
      <Spin size="large" />
    </div>

    <div v-else class="space-y-6">
      <Alert 
        message="CSV Format Guide (Required Columns)" 
        type="info" 
        show-icon
      >
        <div class="mt-2 p-4 bg-gray-50 rounded-lg">
          <div class="font-mono text-sm bg-white p-3 rounded border mb-3 overflow-x-auto">
            subject_id,question,option_a,option_b,option_c,option_d,correct_option,image,year
          </div>
          <div class="text-sm text-gray-600">
            • Use correct subject_id from dropdown<br>
            • correct_option must be A, B, C, or D<br>
            • image column optional (filename or URL)
          </div>
        </div>
      </Alert>

      <div>
        <label class="block text-sm font-semibold mb-2">CSV File *</label>
        <Upload
          v-model:file-list="fileList"
          :before-upload="() => false"
          accept=".csv"
          :multiple="false"
          :show-upload-list="false"
          @change="handleFileChange"
        >
          <Button block size="large" class="border-2 border-dashed !h-14">
            <span class="text-lg">📁 Click or Drag CSV File Here</span>
          </Button>
        </Upload>

        <div v-if="fileList[0]" class="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div class="font-medium">{{ fileList[0].name }}</div>
          <div class="text-sm text-emerald-700">
            {{ Math.round(fileList[0].size / 1024) }} KB
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-semibold mb-2 text-red-600">
          Subject * <span class="text-xs">(Must match CSV subject_id)</span>
        </label>
        <Select
          v-model:value="selectedSubjectId"
          placeholder="Select subject for these questions"
          class="w-full"
          size="large"
          :disabled="!fileList.length"
          show-search
          option-filter-prop="label"
        >
          <Select.Option v-for="s in subjects" :key="s.id" :value="s.id" :label="s.name">
            {{ s.name }} ({{ s.slug }})
          </Select.Option>
        </Select>
      </div>
    </div>
  </Modal>
</template>