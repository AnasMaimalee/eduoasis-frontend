<template>
  <div class="space-y-2 p-2 bg-emerald-50">
    <!-- Questions Management -->
    <div>
      <div class="">
        <QuestionsTable />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QuestionsTable from '@/components/CBT/admin/questions/QuestionsTable.vue'

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
    roles: ['superadmin'],
    title: 'CBT Exam Questions'
})

</script>
