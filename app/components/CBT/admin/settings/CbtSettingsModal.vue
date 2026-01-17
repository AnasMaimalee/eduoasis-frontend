<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { Modal, Form, InputNumber } from 'ant-design-vue'

// 💡 Use "type" instead of "interface" if compiler complains
type Settings = {
  subjects_count: number
  questions_per_subject: number
  duration_minutes: number
  exam_fee: number
}

const props = defineProps<{
  open: boolean
  initialSettings: Settings
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update', data: Settings): void
  (e: 'cancel'): void
}>()

const form = ref()
const model = ref<Settings>({
  subjects_count: 4,
  questions_per_subject: 15,
  duration_minutes: 120,
  exam_fee: 0
})

// ✅ Watch the correct prop
watch(
  () => props.open,
  async (open) => {
    if (open && props.initialSettings) {
      model.value = { ...props.initialSettings }
      await nextTick()
      form.value?.resetFields()
    }
  }
)

const totalQuestions = computed(() =>
  model.value.subjects_count * model.value.questions_per_subject
)

const formatMoney = (v: number) =>
  Number(v || 0).toLocaleString()

const handleOk = () => {
  emit('update', { ...model.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <Modal
    v-model:open="props.open"
    title="⚙️ Update CBT Settings"
    :width="520"
    okText="💾 Save Changes"
    cancelText="Cancel"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
    destroy-on-close
    class="cbt-settings-modal"
  >
    <Form ref="form" :model="model" layout="vertical" class="!space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <!-- Subjects -->
        <Form.Item label="Subjects">
          <InputNumber v-model:value="model.subjects_count" :min="1" :max="20" class="w-full" />
        </Form.Item>

        <!-- Questions -->
        <Form.Item label="Questions per Subject">
          <InputNumber v-model:value="model.questions_per_subject" :min="5" :max="50" class="w-full" />
        </Form.Item>

        <!-- Duration -->
        <Form.Item label="Duration (minutes)" class="col-span-2">
          <InputNumber v-model:value="model.duration_minutes" :min="30" :max="300" class="w-full" />
        </Form.Item>

        <!-- Fee -->
        <Form.Item label="Exam Fee (₦)" class="col-span-2">
          <InputNumber v-model:value="model.exam_fee" :min="0" :precision="2" class="w-full" />
        </Form.Item>
      </div>

      <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-4">
        <div class="grid grid-cols-2 gap-2 text-sm text-emerald-800">
          <div>Total Questions</div>
          <div class="font-bold text-right">{{ totalQuestions }}</div>

          <div>Duration</div>
          <div class="font-bold text-right">{{ model.duration_minutes }} mins</div>

          <div>Exam Fee</div>
          <div class="font-bold text-right">₦{{ formatMoney(model.exam_fee) }}</div>

          <div class="col-span-2 text-xs text-emerald-700 mt-2">
            {{ model.subjects_count }} subjects × {{ model.questions_per_subject }} questions
          </div>
        </div>
      </div>
    </Form>
  </Modal>
</template>

<style scoped>
.cbt-settings-modal :deep(.ant-modal-content) {
  border-radius: 18px;
  overflow: hidden;
}

.cbt-settings-modal :deep(.ant-modal-header) {
  background: linear-gradient(135deg, #10b981, #059669);
  border-bottom: none;
  padding: 18px 24px;
}

.cbt-settings-modal :deep(.ant-modal-title) {
  color: white;
  font-size: 18px;
  font-weight: 800;
}

.cbt-settings-modal :deep(.ant-modal-close-x) {
  color: white;
}

.cbt-settings-modal :deep(.ant-modal-body) {
  padding: 20px 24px;
}

.cbt-settings-modal :deep(.ant-modal-footer) {
  padding: 16px 24px;
}
</style>
