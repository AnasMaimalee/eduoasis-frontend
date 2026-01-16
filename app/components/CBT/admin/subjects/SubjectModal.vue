<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import { Modal, Input, Switch, message } from 'ant-design-vue'
const { $api } = useNuxtApp() // ✅ MISSING IMPORT

const props = defineProps<{
  visible: boolean
  subject?: any | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'saved'): void
}>()

const form = ref({
  name: '',
  slug: '',
  status: true,
})

const loading = ref(false)

// ✅ FIXED: Reset form when modal closes
watch(() => props.visible, (visible) => {
  if (!visible) {
    form.value = { name: '', slug: '', status: true }
  } else if (props.subject) {
    form.value.name = props.subject.name || ''
    form.value.slug = props.subject.slug || ''
    form.value.status = props.subject.status !== 'inactive'
  }
})

const saveSubject = async () => {
  if (!form.value.name.trim() || !form.value.slug.trim()) {
    message.error('Name and Slug are required')
    return
  }

  loading.value = true
  try {
    if (props.subject?.id) {
      await $api(`/cbt/superadmin/subjects/${props.subject.id}`, {
        method: 'PUT',
        body: form.value
      })
      message.success('Subject updated successfully')
    } else {
      await $api('/cbt/superadmin/subjects', {
        method: 'POST',
        body: form.value
      })
      message.success('Subject created successfully')
    }
    emit('saved')
    emit('update:visible', false) // ✅ This closes modal
  } catch (err: any) {
    message.error(err.data?.message || 'Save failed')
  } finally {
    loading.value = false
  }
}

// ✅ FIXED: Handle Cancel/Close
const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<template>
  <Modal
    :visible="props.visible"
    :title="props.subject ? 'Edit Subject' : 'Add Subject'"
    ok-text="Save"
    cancel-text="Cancel"
    :confirm-loading="loading"
    @ok="saveSubject"
    @cancel="handleCancel" 
    @update:visible="val => emit('update:visible', val)"
  >
    <div class="space-y-3">
      <Input 
        v-model:value="form.name" 
        placeholder="Subject Name" 
        class="w-full"
      />
      <Input 
        v-model:value="form.slug" 
        placeholder="Slug" 
        class="w-full"
      />
      <div class="flex items-center gap-3">
        <span>Status:</span>
        <Switch v-model:checked="form.status" />
      </div>
    </div>
  </Modal>
</template>
