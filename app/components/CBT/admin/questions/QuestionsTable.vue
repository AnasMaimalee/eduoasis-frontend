<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { Table, Input, Button, Card, Select, message, Tag, Modal, Alert, Upload, Spin } from 'ant-design-vue'
const { $api } = useNuxtApp()

// Table State
const questions = ref<any[]>([])
const subjects = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const subjectFilter = ref<number | null>(null)

// Upload Modal State
const showUploadModal = ref(false)
const fileList = ref<any[]>([])
const selectedSubjectId = ref<number | null>(null)
const uploading = ref(false)
const loadingSubjects = ref(false)

// Computed validation
const isFormValid = computed(() => {
  return selectedSubjectId.value !== null && fileList.value.length > 0 && !!fileList.value[0]?.originFileObj
})

// Load subjects
const fetchSubjects = async () => {
  loadingSubjects.value = true
  try {
    const res = await $api('/cbt/subjects')
    subjects.value = res.data.data || res.data || []
  } catch {
    message.error('Failed to load subjects')
  } finally {
    loadingSubjects.value = false
  }
}

// Fetch questions
const fetchQuestions = async () => {
  loading.value = true
  try {
    const params: any = { per_page: 50 }
    if (subjectFilter.value) params.subject_id = subjectFilter.value
    if (searchText.value?.trim()) params.search = searchText.value.trim()
    
    const res = await $api('/cbt/superadmin/questions', { params })
    questions.value = res.data.data || res.data || []
  } catch {
    message.error('Failed to load questions')
  } finally {
    loading.value = false
  }
}

const filteredQuestions = computed(() => questions.value)

onMounted(() => {
  fetchSubjects()
  fetchQuestions()
})

const handleFilterChange = () => fetchQuestions()
const clearFilters = () => {
  searchText.value = ''
  subjectFilter.value = null
  fetchQuestions()
}

// Upload handlers
const handleFileChange = (info: any) => {
  fileList.value = info.fileList.slice(-1)
}
const handleUpload = async () => {
  if (!isFormValid.value) {
    message.error('Please select subject and CSV file')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', fileList.value[0].originFileObj as File)
    formData.append('subject_id', selectedSubjectId.value!.toString())

    console.log('🔍 SENDING REQUEST...')
    
    const res = await $api('/cbt/superadmin/questions/upload', { 
      method: 'POST', 
      body: formData 
    })
    
    // ✅ DEBUG EVERYTHING
    console.log('🔍 FULL RESPONSE:', res)
    console.log('🔍 res.data:', res.data)
    console.log('🔍 res.status:', res.status)
    
    const uploadedCount = res.data?.uploaded || res.data?.inserted || 0
    message.success(`✅ ${uploadedCount} questions uploaded!`)
    resetUpload()
    fetchQuestions()
    
  } catch (err: any) {
    // ✅ DEBUG CATCH BLOCK
    console.log('🔍 CATCH BLOCK TRIGGERED!')
    console.log('🔍 Error:', err)
    console.log('🔍 err.response:', err.response)
    console.log('🔍 err.data:', err.data)
    
    message.error('Upload failed - check console')
  } finally {
    uploading.value = false
  }
}



const resetUpload = async () => {
  showUploadModal.value = false
  await nextTick()
  fileList.value = []
  selectedSubjectId.value = null
}
</script>

<template>
  <Card title="❓ Questions Bank (1000+)">
    <!-- Filters + Upload Button -->
    <div class="w-full flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg items-end">
      <!-- Subject Filter -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-gray-600">Subject</label>
        <Select
          v-model:value="subjectFilter"
          placeholder="All Subjects"
          style="width: 200px"
          @change="handleFilterChange"
          clearable
          size="large"
        >
          <Select.Option v-for="s in subjects" :key="s.id" :value="s.id">
            {{ s.name }}
          </Select.Option>
        </Select>
      </div>

      <!-- Search -->
      <Input
        v-model:value="searchText"
        placeholder="🔍 Search questions..."
        class="w-72"
        @pressEnter="handleFilterChange"
        allowClear
        size="large"
      />

      <!-- Actions -->
      <div class="flex gap-3 ml-auto items-center">
        <Button @click="clearFilters" size="large">Clear</Button>
        <Button 
          type="primary" 
          @click="showUploadModal = true"
          size="large"
          class="flex items-center gap-2 !bg-emerald-600 hover:!bg-emerald-700"
          :disabled="uploading"
          :loading="uploading"
        >
          <span v-if="!uploading">📤 Upload CSV</span>
          <span v-else>Uploading...</span>
        </Button>
      </div>
    </div>

    <!-- Questions Table -->
    <Table 
      :data-source="filteredQuestions" 
      row-key="id" 
      :loading="loading" 
      :scroll="{ x: 1400 }" 
      class="custom-table"
      :pagination="{ pageSize: 20, showSizeChanger: true }"
    >
      <Table.Column title="#" width="60" align="center">
        <template #default="{ index }">
          <span class="font-bold text-gray-800">{{ index + 1 }}</span>
        </template>
      </Table.Column>

      <Table.Column title="Subject" width="140">
        <template #default="{ record }">
          <Tag color="blue" class="font-medium">
            {{ record.subject?.name || 'Unknown' }}
          </Tag>
        </template>
      </Table.Column>

      <Table.Column title="Question" dataIndex="question" width="400">
        <template #default="{ record }">
          <div class="line-clamp-2 leading-relaxed">{{ record.question }}</div>
        </template>
      </Table.Column>

      <Table.Column title="Options" width="380">
        <template #default="{ record }">
          <div class="grid grid-cols-2 gap-1 text-sm">
            <div><strong>A:</strong> {{ record.option_a }}</div>
            <div><strong>B:</strong> {{ record.option_b }}</div>
            <div><strong>C:</strong> {{ record.option_c }}</div>
            <div><strong>D:</strong> {{ record.option_d }}</div>
          </div>
        </template>
      </Table.Column>

      <Table.Column title="Correct" width="100" align="center">
        <template #default="{ record }">
          <Tag color="green" class="font-bold px-3 py-1 text-sm">
            {{ record.correct_option }}
          </Tag>
        </template>
      </Table.Column>
    </Table>

    <!-- ✅ HALF-SCREEN UPLOAD MODAL -->
    <Modal
      v-model:visible="showUploadModal"
      title="📤 Upload Questions (CSV)"
      :width="600"
      :confirm-loading="uploading"
      ok-text="🚀 Upload"
      :ok-button-props="{
        class: '!bg-emerald-600 hover:!bg-emerald-700',
        disabled: uploading || !isFormValid
      }"
      cancel-text="Cancel"
      @ok="handleUpload"
      @cancel="resetUpload"
      :closable="true"
      :mask-closable="false"
      :destroy-on-close="true"
      class="upload-modal"
    >
      <!-- Loading Subjects -->
      <div v-if="loadingSubjects" class="flex items-center justify-center py-12">
        <Spin />
        <span class="ml-2 text-gray-600">Loading subjects...</span>
      </div>

      <!-- Form Content -->
      <div v-else class="space-y-5">
        <!-- CSV Format (Compact) -->
        <Alert message="📋 CSV Format" type="info" show-icon class="!mb-4 !p-3">
          <template #description>
            <div class="text-xs p-2 bg-gray-50 rounded">
              <code class="font-mono block text-xs mb-1 p-2 bg-white rounded border">
                subject_id,question,option_a,option_b,option_c,option_d,correct_option
                <br>1,"What is 2+2?",2,4,8,10,B
              </code>
              <div>• subject_id from dropdown • A,B,C,D only</div>
            </div>
          </template>
        </Alert>

        <!-- File Upload -->
        <div>
          <label class="block text-sm font-semibold mb-2 text-gray-700">📁 CSV File</label>
          <Upload
            v-model:file-list="fileList"
            :before-upload="() => false"
            name="file"
            accept=".csv,.txt"
            :multiple="false"
            :show-upload-list="false"
            class="w-full"
            @change="handleFileChange"
          >
            <Button block class="!h-11 border-2 border-dashed border-gray-300 hover:border-emerald-400">
              📁 Choose CSV File
            </Button>
          </Upload>
          <div v-if="fileList[0]" class="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
            <div class="font-medium text-emerald-800">✅ {{ fileList[0].name }}</div>
            <div class="text-xs text-emerald-600">{{ Math.round(fileList[0].size / 1024) }} KB</div>
          </div>
        </div>

        <!-- Subject Selection -->
        <div>
          <label class="block text-sm font-semibold mb-2 text-red-600">
            🎯 Subject <span class="text-xs">(REQUIRED)</span>
          </label>
          <Select
            v-model:value="selectedSubjectId"
            placeholder="Select subject for upload..."
            class="w-full"
            size="large"
            :disabled="!fileList.length || uploading"
          >
            <Select.Option v-for="s in subjects" :key="s.id" :value="s.id">
              {{ s.name }} ({{ s.slug }})
            </Select.Option>
          </Select>
        </div>
      </div>
    </Modal>
  </Card>
</template>

<style scoped>
.upload-modal :deep(.ant-modal) {
  max-width: 95vw;
}

.upload-modal :deep(.ant-modal-body) {
  padding: 20px !important;
  max-height: 70vh;
  overflow-y: auto;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.custom-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4 text-sm;
}

.custom-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4;
}

.custom-table :deep(.ant-table-row:hover > td) {
  @apply bg-emerald-50;
}
</style>
