<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePublicApi } from '~/composables/useApi'
import { message } from 'ant-design-vue'

definePageMeta({
  layout: 'default',

})

const route = useRoute()
const api = usePublicApi()

const token = route.params.token as string
const emailFromQuery = (route.query.email as string) || ''

const form = reactive({
  email: emailFromQuery,
  token: token,
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')
const success = ref('')

/* -------------------- PASSWORD STRENGTH -------------------- */
const passwordRules = computed(() => {
  const p = form.password || ''
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

/* -------------------- BUTTON DISABLED STATE -------------------- */
const isSubmitDisabled = computed(() => {
  // Check if success
  if (success.value) {
    return true
  }
  
  // Check if any field is empty
  if (
    !form.email ||
    !form.password ||
    !form.password_confirmation
  ) {
    return true
  }
  
  // Check password strength (needs 4/5 rules)
  if (strengthScore.value < 4) {
    return true
  }
  
  // Check if passwords match
  if (form.password !== form.password_confirmation) {
    return true
  }
  
  // Check loading state
  if (loading.value) {
    return true
  }
  
  return false
})

// Optional: Fetch and pre-fill email if not provided in query
onMounted(async () => {
  if (!emailFromQuery && token) {
    try {
      const res = await api('/auth/validate-reset-token', {
        method: 'POST',
        body: { token },
      })
      form.email = res.email || ''
    } catch (err) {
      error.value = 'Invalid or expired reset link'
    }
  }
})

async function resetPassword() {
  if (isSubmitDisabled.value) return

  loading.value = true

  try {
    await api('/reset-password', {
      method: 'POST',
      body: form,
    })

    message.success({
      content: 'Password reset successful. Redirecting to login...',
      duration: 2,
    })

    setTimeout(() => {
      navigateTo('/login')
    }, 2000)

  } catch (err: any) {
    message.error(
      err?.data?.message ||
      'Reset failed. The link may be invalid or expired.'
    )
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div
    style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
    "
  >
    <a-card
      title="Reset Password"
      style="width: 100%; max-width: 420px"
    >
      <a-form
        layout="vertical"
        :model="form"
        @finish="resetPassword"
        >

        <a-form-item label="Email">
          <a-input v-model:value="form.email" :disabled="!!emailFromQuery" />
        </a-form-item>

        <a-form-item
          label="New Password"
          name="password"
          :rules="[{ required: true, message: 'Enter new password' }]"
        >
          <a-input-password v-model:value="form.password" />
          
          <!-- STRENGTH BAR (NEW) -->
          <div class="mt-2">
            <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-300"
                :class="strengthScore <= 1 ? 'bg-red-500' : strengthScore <= 3 ? 'bg-yellow-400' : 'bg-green-500'"
                :style="{ width: `${(strengthScore / 5) * 100}%` }"
              ></div>
            </div>
            <p
              class="mt-1 text-sm font-semibold"
              :class="strengthScore <= 1 ? 'text-red-600' : strengthScore <= 3 ? 'text-yellow-600' : 'text-green-600'"
            >
              Strength: {{ strengthScore <= 1 ? 'Weak' : strengthScore <= 3 ? 'Fair' : 'Strong' }}
            </p>
          </div>

          <!-- RULES (NEW) -->
          <ul class="mt-3 text-sm space-y-1">
            <li :class="passwordRules.length ? 'text-green-600' : 'text-gray-500'">Min 8 characters</li>
            <li :class="passwordRules.upper ? 'text-green-600' : 'text-gray-500'">Uppercase letter</li>
            <li :class="passwordRules.lower ? 'text-green-600' : 'text-gray-500'">Lowercase letter</li>
            <li :class="passwordRules.number ? 'text-green-600' : 'text-gray-500'">Number</li>
            <li :class="passwordRules.special ? 'text-green-600' : 'text-gray-500'">Special character</li>
          </ul>
        </a-form-item>

        <a-form-item
          label="Confirm Password"
          name="password_confirmation"
          :rules="[{ required: true, message: 'Confirm password' }]"
        >
          <a-input-password v-model:value="form.password_confirmation" />
        </a-form-item>

        <a-alert
          v-if="error"
          type="error"
          :message="error"
          show-icon
          style="margin-bottom: 12px"
        />

        <a-alert
          v-if="success"
          type="success"
          :message="success"
          show-icon
          style="margin-bottom: 12px"
        />

        <!-- Submit (UPDATED WITH DISABLED LOGIC) -->
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            block
            :loading="loading"
            :disabled="isSubmitDisabled"
            >
            Reset Password
            </a-button>
        </a-form-item>
      </a-form>

      <div style="text-align: center">
        <NuxtLink to="/login">Go to login</NuxtLink>
      </div>
    </a-card>
  </div>
</template>
