<template>
  <div class="space-y-8 p-6">
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
    roles: ['superadmin']
})

</script>
