<script setup lang="ts">
import { Tabs } from 'ant-design-vue'
import ResultQuestions from '~/components/CBT/user/result/ResultQuestions.vue'

defineProps<{
  subjects: any[]
}>()
</script>

<template>
  <Tabs type="card" size="large" class="bg-white rounded-2xl shadow-xl p-4">
    <Tabs.TabPane
      v-for="(subject, i) in subjects"
      :key="i"
      :tab="`${subject.subject} (${subject.correct}/${subject.total ?? subject.questions.length})`"
    >
      <div class="space-y-6 mt-4">
        <ResultQuestions
          v-for="(q, qi) in subject.questions"
          :key="qi"
          :question="q"
          :number="qi + 1"
        />
      </div>
    </Tabs.TabPane>
  </Tabs>
</template>
