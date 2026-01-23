<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const { $api } = useNuxtApp()

// ✅ Get token and email from query parameters
const token = (route.query.token as string) || ''
const emailFromQuery = (route.query.email as string) || ''

const form = reactive({
  email: emailFromQuery,
  token, // actual token from query
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')

/* ---------------- PASSWORD RULES ---------------- */
const passwordRules = computed(() => {
  const p = form.password
  return {
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    lower: /[a-z]/.test(p),
    number: /[0-9]/.test(p),
    special: /[^A-Za-z0-9]/.test(p),
  }
})

const strengthScore = computed(
  () => Object.values(passwordRules.value).filter(Boolean).length
)

/* ---------------- BUTTON DISABLED ---------------- */
const isSubmitDisabled = computed(() => {
  if (!form.email || !form.password || !form.password_confirmation) return true
  if (form.password !== form.password_confirmation) return true
  if (strengthScore.value < 4) return true
  if (loading.value) return true
  return false
})

/* ---------------- SUBMIT ---------------- */
async function resetPassword() {
  if (isSubmitDisabled.value) return

  loading.value = true
  error.value = ''

  try {
    await $api('/auth/reset-password', {
      method: 'POST',
      body: form,
    })

    message.success('Password set successfully. Redirecting...')
    setTimeout(() => navigateTo('/login'), 2000)
  } catch (err: any) {
    error.value = err?.data?.message || 'Password reset failed'
    message.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-emerald-50">
    <a-card
      title="🔐 Set Your Password"
      class="shadow-xl"
      style="width: 100%; max-width: 420px"
    >
      <a-form layout="vertical" :model="form" @submit.prevent="resetPassword">
        <a-form-item label="Email">
          <a-input v-model:value="form.email" disabled />
        </a-form-item>

        <a-form-item label="New Password">
          <a-input-password v-model:value="form.password" name="password" />

          <!-- Strength bar -->
          <div class="mt-2">
            <div class="h-2 bg-gray-200 rounded overflow-hidden">
              <div
                class="h-full transition-all"
                :class="
                  strengthScore <= 2
                    ? 'bg-red-500'
                    : strengthScore <= 3
                    ? 'bg-yellow-400'
                    : 'bg-green-500'
                "
                :style="{ width: `${(strengthScore / 5) * 100}%` }"
              ></div>
            </div>

            <!-- Password Rules -->
            <ul class="mt-2 text-xs space-y-1">
              <li :class="passwordRules.length ? 'text-green-600' : 'text-gray-500'">
                • Min 8 characters
              </li>
              <li :class="passwordRules.upper ? 'text-green-600' : 'text-gray-500'">
                • Uppercase letter
              </li>
              <li :class="passwordRules.lower ? 'text-green-600' : 'text-gray-500'">
                • Lowercase letter
              </li>
              <li :class="passwordRules.number ? 'text-green-600' : 'text-gray-500'">
                • Number
              </li>
              <li :class="passwordRules.special ? 'text-green-600' : 'text-gray-500'">
                • Special character
              </li>
            </ul>
          </div>
        </a-form-item>

        <a-form-item label="Confirm Password">
          <a-input-password v-model:value="form.password_confirmation" name="password_confirmation" />
        </a-form-item>

        <a-alert
          v-if="error"
          type="error"
          show-icon
          :message="error"
          class="mb-3"
        />

        <a-button
          type="primary"
          html-type="submit"
          block
          size="large"
          :loading="loading"
          :disabled="isSubmitDisabled"
        >
          🔐 Set Password
        </a-button>
      </a-form>

      <div class="text-center mt-4">
        <NuxtLink to="/login">Back to login</NuxtLink>
      </div>
    </a-card>
  </div>
</template>
