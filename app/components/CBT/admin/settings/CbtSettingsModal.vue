<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { Modal, Form, InputNumber } from 'ant-design-vue'

type Settings = {
  subjects_count: number
  questions_per_subject: number
  duration_minutes: number
  exam_fee: number
}

const props = defineProps<{
  open: boolean
  initialSettings: Settings | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update', data: Settings): void
  (e: 'cancel'): void
}>()

const form = ref()
const model = ref<Settings>({
  subjects_count: 0,
  questions_per_subject: 0,
  duration_minutes: 0,
  exam_fee: 0
})

// Watch modal open and initialize model
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

// Computed total questions
const totalQuestions = computed(() =>
  model.value.subjects_count * model.value.questions_per_subject
)

// Format money
const formatMoney = (v: number) => Number(v || 0).toLocaleString()

// Emit updated settings
const handleOk = () => emit('update', { ...model.value })
const handleCancel = () => emit('cancel')
</script>

<template>
  <Modal
    v-model:open="props.open"
    title="⚙️ Update CBT Settings"
    :width="520"
    okText="💾 Save Changes"
    cancelText="Cancel"
    :confirm-loading="props.loading"
    @ok="handleOk"
    @cancel="handleCancel"
    destroy-on-close
    class="cbt-settings-modal"
  >
    <Form ref="form" :model="model" layout="vertical" class="!space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <Form.Item label="Subjects">
          <InputNumber v-model:value="model.subjects_count" :min="1" :max="50" class="w-full" />
        </Form.Item>

        <Form.Item label="Questions per Subject">
          <InputNumber v-model:value="model.questions_per_subject" :min="1" :max="100" class="w-full" />
        </Form.Item>

        <Form.Item label="Duration (minutes)" class="col-span-2">
          <InputNumber v-model:value="model.duration_minutes" :min="1" :max="500" class="w-full" />
        </Form.Item>

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
