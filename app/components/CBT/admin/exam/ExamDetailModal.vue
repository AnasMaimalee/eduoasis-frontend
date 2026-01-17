<script setup lang="ts">
import { Modal, Tag, Divider, Statistic, Row, Col, Avatar } from 'ant-design-vue'

defineProps<{ visible: boolean; exam: any | null }>()
defineEmits(['update:visible'])
</script>

<template>
  <Modal
    :open="visible"
    width="900px"
    class="rounded-xl"
    @cancel="$emit('update:visible', false)"
    footer={null}
  >
    <template #title>
      <div class="flex items-center gap-4">
        <Avatar size="large" class="bg-emerald-600">
          {{ exam?.user?.name?.charAt(0) }}
        </Avatar>
        <div>
          <h2 class="text-xl font-bold">{{ exam?.user?.name }}</h2>
          <p class="text-sm text-gray-500">{{ exam?.user?.email }}</p>
        </div>
      </div>
    </template>

    <Divider />

    <!-- Stats -->
    <Row gutter="16">
      <Col :span="6">
        <Statistic title="Score" :value="exam?.total_score" />
      </Col>
      <Col :span="6">
        <Statistic title="Questions" :value="exam?.total_questions" />
      </Col>
      <Col :span="6">
        <Statistic title="Answered" :value="exam?.answered_questions" />
      </Col>
      <Col :span="6">
        <Statistic title="Unanswered" :value="exam?.unanswered_questions" />
      </Col>
    </Row>

    <Divider />

    <!-- Timeline -->
    <div class="space-y-2">
      <p><b>Started:</b> {{ new Date(exam?.started_at).toLocaleString() }}</p>
      <p><b>Ended:</b> {{ new Date(exam?.ends_at).toLocaleString() }}</p>
      <p>
        <b>Status:</b>
        <Tag color="green" class="ml-2">{{ exam?.status }}</Tag>
      </p>
    </div>
  </Modal>
</template>
