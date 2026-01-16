<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Table, Input, Button, Card, message } from 'ant-design-vue'
import SubjectModal from './SubjectModal.vue'
import StatusTag from './StatusTag.vue'
const { $api } = useNuxtApp()

const subjects = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const modalVisible = ref(false)
const selectedSubject = ref<any | null>(null)

const fetchSubjects = async () => {
  loading.value = true
  try {
    const res = await $api('/cbt/subjects')
    subjects.value = res.data || []
  } catch {
    message.error('Failed to load subjects')
  } finally {
    loading.value = false
  }
}

const filteredSubjects = computed(() => {
  if (!searchText.value.trim()) return subjects.value
  const q = searchText.value.toLowerCase()
  return subjects.value.filter(s => 
    s.name?.toLowerCase().includes(q) || 
    s.slug?.toLowerCase().includes(q)
  )
})

onMounted(fetchSubjects)

const openModal = (subject: any | null = null) => {
  selectedSubject.value = subject
  modalVisible.value = true
}

// ✅ PERFECT NUMBERING FUNCTION
const getIndex = (index: number) => {
  return Math.floor(index) + 1
}
</script>

<template>
  <Card>
    <div class="flex justify-between mb-4">
      <Input v-model:value="searchText" placeholder="Search subjects..." class="!w-64" />
      <div class="flex gap-2">
        <Button type="primary" @click="() => openModal(null)">Add Subject</Button>
        <Button :loading="loading" @click="fetchSubjects">
          🔄 Refresh
        </Button>
      </div>
    </div>

    <Table 
      :data-source="filteredSubjects" 
      row-key="id" 
      :loading="loading"
      :scroll="{ x: 800 }"
      class="custom-table"
    >
      <!-- ✅ FIXED NUMBERING - 100% WORKS -->
      <Table.Column title="#" width="60" align="center">
        <template #default="{ index }">
          <span class="font-semibold text-gray-700">{{ getIndex(index) }}</span>
        </template>
      </Table.Column>
      
      <Table.Column title="Name" dataIndex="name" width="200" />
      <Table.Column title="Slug" dataIndex="slug" width="200" />
      
      <Table.Column title="Status" dataIndex="status" width="120">
        <template #default="{ record }">
          <StatusTag :status="record.status" />
        </template>
      </Table.Column>
      
      <Table.Column title="Actions" width="120" align="right">
        <template #default="{ record }">
          <Button 
            size="small" 
            type="primary" 
            @click="() => openModal(record)"
          >
            ✏️ Edit
          </Button>
        </template>
      </Table.Column>
    </Table>

    <SubjectModal 
      v-model:visible="modalVisible" 
      :subject="selectedSubject" 
      @saved="fetchSubjects" 
    />
  </Card>
</template>



<style scoped>
/* ✅ GREEN EMERALD HEADER */
.custom-table :deep(.ant-table-thead th) {
  @apply !bg-emerald-500 !text-white !font-semibold !py-3 !px-4 text-sm;
}

.custom-table :deep(.ant-table-tbody td) {
  @apply !py-3 !px-4;
}

.custom-table :deep(.ant-table-row:hover > td) {
  @apply bg-emerald-50;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
