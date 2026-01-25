<script setup lang="ts">
import { UploadOutlined } from '@ant-design/icons-vue'
import { Upload, Button, Modal } from 'ant-design-vue'

const props = defineProps<{
  open: boolean
  job: any | null
  loading: boolean
  beforeUpload: (file: any) => boolean
  serviceLabel?: string
}>()

// ✅ Fix: Use defineModel for two-way fileList binding
const emitFileList = defineModel<any[]>('fileList', { required: true })

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'complete'): void
  (e: 'clear'): void
}>()

function close() {
  emit('update:open', false)
  emit('clear')
}

function submit() {
  emit('complete')
}
</script>

<template>
  <Modal
    :open="open"
    title="Upload {{ job?.name || job?.email || serviceLabel || 'Result File' }}"
    width="600"
    centered
    :footer="null"
    @cancel="close"
  >
    <div v-if="job" class="space-y-4 pt-2">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <UploadOutlined class="text-blue-600 text-2xl" />
        </div>
        <div>
          <div class="font-semibold">{{ job?.name || job?.email }}</div>
          <div class="text-sm text-gray-500">{{ job?.registration_number || '' }}</div>
        </div>
      </div>

      <Upload
        v-model:file-list="emitFileList" 
        :before-upload="beforeUpload"
        accept=".pdf,.png,.jpg,.jpeg"
        list-type="picture"
        :max-count="1"
      >
        <Button block size="large">
          Click or drag file
        </Button>
      </Upload>

      <div class="flex gap-3">
        <Button block @click="close">Cancel</Button>
        <Button
          type="primary"
          block
          :loading="loading"
          :disabled="!emitFileList.length"
          @click="submit"
        >
          ✅ Complete Job
        </Button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.ant-modal-content {
  border-radius: 1rem !important;
}

.ant-upload-list-picture-card-container {
  border-radius: 0.5rem;
}

.ant-upload-list-item {
  border-radius: 0.5rem;
}
</style>
