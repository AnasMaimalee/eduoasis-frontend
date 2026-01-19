<script setup lang="ts">
import  SubjectsTable from '@/components/CBT/user/subjects/SubjectsTable.vue'
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user'],
})
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-emerald-600 mb-4">CBT Subjects</h2>
    <SubjectsTable />
  </div>
</template>
