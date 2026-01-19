<script setup lang="ts">
import { Tag } from 'ant-design-vue'

const props = defineProps<{
  subject: {
    name: string
    score: string
  }
}>()

const correct = Number(props.subject.score.split('/')[0])
</script>

<template>
  <Tag :color="correct > 0 ? 'green' : 'red'">
    {{ subject.name }} ({{ subject.score }})
  </Tag>
</template>
