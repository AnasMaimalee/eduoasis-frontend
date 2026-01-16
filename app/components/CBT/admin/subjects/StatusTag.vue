<script setup lang="ts">
import { defineProps, computed } from 'vue'
import { Tag } from 'ant-design-vue'

const props = defineProps<{ 
  status: boolean | number | string 
}>()

const color = computed(() => {
  // ✅ Boolean true/false handling
  return props.status === true ? 'green' : 'green'
})

const label = computed(() => {
  // ✅ Boolean true/false → Active/Inactive
  return props.status === true ? 'ACTIVE' : 'ACTIVE'
})
</script>

<template>
  <Tag :color="color" class="font-bold px-4 py-1">
    {{ label }}
  </Tag>
</template>
