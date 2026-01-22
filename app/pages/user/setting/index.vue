<script setup lang="ts">
import { reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import WebAuthnSection from '~/components/Setting/WebAuthnSection.vue'
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['user'],
  title: 'Setting'
})

const { $api } = useNuxtApp()

/* -------------------- LOADING -------------------- */
const loadingState = reactive({
  password: false
})

/* -------------------- FORM -------------------- */
const passwordForm = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

/* -------------------- PASSWORD STRENGTH -------------------- */
const passwordRules = computed(() => {
  const p = passwordForm.new_password || ''
  return {
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    lower: /[a-z]/.test(p),
    number: /[0-9]/.test(p),
    special: /[^A-Za-z0-9]/.test(p)
  }
})

const strengthScore = computed(() =>
  Object.values(passwordRules.value).filter(Boolean).length
)

const strengthLabel = computed(() => {
  if (strengthScore.value <= 1) return 'Weak'
  if (strengthScore.value <= 3) return 'Fair'
  return 'Strong'
})

const strengthColor = computed(() => {
  if (strengthScore.value <= 1) return 'bg-red-500'
  if (strengthScore.value <= 3) return 'bg-yellow-400'
  return 'bg-green-500'
})

/* -------------------- BUTTON DISABLED STATE ✅ NEW -------------------- */
const isSubmitDisabled = computed(() => {
  // Check if any field is empty
  if (
    !passwordForm.current_password ||
    !passwordForm.new_password ||
    !passwordForm.new_password_confirmation
  ) {
    return true
  }
  
  // Check password strength (needs 4/5 rules)
  if (strengthScore.value < 4) {
    return true
  }
  
  // Check if passwords match
  if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
    return true
  }
  
  // Check loading state
  if (loadingState.password) {
    return true
  }
  
  return false
})

const updatePassword = async () => {
  // Early return since button is already disabled
  if (isSubmitDisabled.value) return

  loadingState.password = true

  try {
    await $api('/update-password', {
      method: 'POST',
      body: passwordForm
    })

    message.success('Password updated successfully')

    Object.assign(passwordForm, {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    })
  } catch (err) {
    const error = err as any
    message.error(error?.data?.message || 'Failed to update password')
  } finally {
    loadingState.password = false
  }
}
</script>

<template>
  <div class="max-w-2xl p-6 min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50/50">
    
    <!-- UPDATE PASSWORD CARD -->
    <a-card class="!border-emerald-200 shadow-xl rounded-xl">
      <h3 class="font-black text-xl mb-6">Update Password</h3>

      <a-form layout="vertical">
        <a-form-item label="Current Password">
          <a-input-password v-model:value="passwordForm.current_password" size="large" />
        </a-form-item>

        <a-form-item label="New Password">
          <a-input-password v-model:value="passwordForm.new_password" size="large" />

          <!-- STRENGTH BAR -->
          <div class="mt-2">
            <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-300"
                :class="strengthColor"
                :style="{ width: `${(strengthScore / 5) * 100}%` }"
              ></div>
            </div>
            <p
              class="mt-1 text-sm font-semibold"
              :class="strengthScore <= 1 ? 'text-red-600' : strengthScore <= 3 ? 'text-yellow-600' : 'text-green-600'"
            >
              Strength: {{ strengthLabel }}
            </p>
          </div>

          <!-- RULES -->
          <ul class="mt-3 text-sm space-y-1">
            <li :class="passwordRules.length ? 'text-green-600' : 'text-gray-500'">Min 8 characters</li>
            <li :class="passwordRules.upper ? 'text-green-600' : 'text-gray-500'">Uppercase letter</li>
            <li :class="passwordRules.lower ? 'text-green-600' : 'text-gray-500'">Lowercase letter</li>
            <li :class="passwordRules.number ? 'text-green-600' : 'text-gray-500'">Number</li>
            <li :class="passwordRules.special ? 'text-green-600' : 'text-gray-500'">Special character</li>
          </ul>
        </a-form-item>

        <a-form-item label="Confirm New Password">
          <a-input-password v-model:value="passwordForm.new_password_confirmation" size="large" />
        </a-form-item>

        <a-button
          type="primary"
          block
          size="large"
          :loading="loadingState.password"
          :disabled="isSubmitDisabled"
          @click="updatePassword"
          class="h-14 text-lg bg-emerald-600 hover:bg-emerald-700 border-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Update Password
        </a-button>
      </a-form>
    </a-card>
    <WebAuthnSection />
  </div>
</template>

<style scoped>
:deep(.ant-form-item-label > label) {
  @apply font-semibold text-gray-800;
}
:deep(.ant-input),
:deep(.ant-input-password) {
  @apply text-base;
}
</style>
