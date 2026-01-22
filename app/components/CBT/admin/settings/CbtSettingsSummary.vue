<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  settings?: {
    subjects_count: number
    questions_per_subject: number
    duration_minutes: number
    exam_fee: number
  }
}>(), {
  settings: () => ({
    subjects_count: 0,
    questions_per_subject: 0,
    duration_minutes: 0,
    exam_fee: 0,
  })
})

/* ✅ SAFE COMPUTED VALUES */
const subjectsCount = computed(() => props.settings.subjects_count ?? 0)
const questionsPerSubject = computed(() => props.settings.questions_per_subject ?? 0)
const durationMinutes = computed(() => props.settings.duration_minutes ?? 0)
const examFee = computed(() => props.settings.exam_fee ?? 0)

/* ✅ COMPUTED TOTAL (NO DB COLUMN) */
const totalQuestions = computed(() =>
  subjectsCount.value * questionsPerSubject.value
)

/* ✅ SAFE FORMATTERS */
const formatNumber = (value: number) =>
  Number(value || 0).toLocaleString()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
    <!-- Subjects -->
    <div class="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
          <span class="text-emerald-600 font-bold text-xl">{{ subjectsCount }}</span>
        </div>
        <div>
          <p class="text-2xl font-black text-gray-900">{{ subjectsCount }}</p>
          <p class="text-sm text-gray-600 uppercase tracking-wide">Subjects</p>
        </div>
      </div>
    </div>

    <!-- Questions per Subject -->
    <div class="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <span class="text-blue-600 font-bold text-xl">{{ questionsPerSubject }}</span>
        </div>
        <div>
          <p class="text-2xl font-black text-gray-900">{{ questionsPerSubject }}</p>
          <p class="text-sm text-gray-600 uppercase tracking-wide">Q's per Subject</p>
        </div>
      </div>
    </div>

    <!-- Total Questions -->
    <div class="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all lg:col-span-2">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <span class="text-purple-600 font-bold text-xl">
            {{ formatNumber(totalQuestions) }}
          </span>
        </div>
        <div>
          <p class="text-2xl font-black text-gray-900">
            {{ formatNumber(totalQuestions) }}
          </p>
          <p class="text-sm text-gray-600 uppercase tracking-wide font-semibold">
            Total Questions
          </p>
        </div>
      </div>
    </div>

    <!-- Duration -->
    <div class="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
          <span class="text-orange-600 font-bold">
            {{ Math.floor(durationMinutes / 60) }}h
          </span>
        </div>
        <div>
          <p class="text-2xl font-black text-gray-900">
            {{ durationMinutes }} min
          </p>
          <p class="text-sm text-gray-600 uppercase tracking-wide">Duration</p>
        </div>
      </div>
    </div>

    <!-- Fee -->
    <div class="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <span class="text-green-600 font-bold text-lg">₦</span>
        </div>
        <div>
          <p class="text-2xl font-black text-gray-900">
            ₦{{ formatNumber(examFee) }}
          </p>
          <p class="text-sm text-gray-600 uppercase tracking-wide">Exam Fee</p>
        </div>
      </div>
    </div>
  </div>
</template>