<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { usePublicApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
})

const api = usePublicApi()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  state: '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')

const states = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

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
  if (loading.value) return true
  
  if (
    !form.name?.trim() ||
    !form.email?.trim() ||
    !form.phone?.trim() ||
    !form.state?.trim() ||
    !form.password?.trim() ||
    !form.password_confirmation?.trim()
  ) {
    return true
  }
  
  if (strengthScore.value < 4) {
    return true
  }
  
  if (form.password !== form.password_confirmation) {
    return true
  }
  
  return false
})

import { message } from 'ant-design-vue'

async function register() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api('/auth/register', {
      method: 'POST',
      body: form,
    })

    // ✅ SUCCESS MESSAGE (top of screen)
    message.success('Registration successful 🎉 Please login')

    // ❌ REMOVE THESE (they cause the error)
    // authStore.setToken(data.token)
    // authStore.setUser(data.user)

    navigateTo('/login')
  } catch (err: any) {
    message.error(err?.data?.message || 'Registration failed')
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
      title="Register for JAMB Portal"
      style="width: 100%; max-width: 480px"
    >
      <!-- ✅ FIXED: Added :model="form" and proper name props -->
      <a-form 
        layout="vertical" 
        :model="form"
        @finish="register"
      >
        <!-- Full Name -->
        <a-form-item
          label="Full Name"
          name="name"
          :rules="[{ required: true, message: 'Please enter your full name' }]"
        >
          <a-input v-model:value="form.name" />
        </a-form-item>

        <!-- Email -->
        <a-form-item
          label="Email"
          name="email"
          :rules="[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Enter a valid email address' },
          ]"
        >
          <a-input v-model:value="form.email" />
        </a-form-item>

        <!-- Phone Number -->
        <a-form-item
          label="Phone Number"
          name="phone"
          :rules="[
            { required: true, message: 'Please enter your phone number' },
            { pattern: /^[0-9]{10,15}$/, message: 'Enter a valid phone number' },
          ]"
        >
          <a-input
            v-model:value="form.phone"
            placeholder="e.g. 08012345678"
          />
        </a-form-item>

        <!-- State -->
        <a-form-item
          label="State"
          name="state"
          :rules="[{ required: true, message: 'Please select your state' }]"
        >
          <a-select
            v-model:value="form.state"
            placeholder="Select your state"
            show-search
          >
            <a-select-option
              v-for="state in states"
              :key="state"
              :value="state"
            >
              {{ state }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- Password -->
        <a-form-item
          label="Password"
          name="password"
          :rules="[{ required: true, message: 'Please enter your password' }]"
        >
          <a-input-password v-model:value="form.password" />
          
          <!-- STRENGTH BAR -->
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

          <!-- RULES -->
          <ul class="mt-3 text-sm space-y-1">
            <li :class="passwordRules.length ? 'text-green-600' : 'text-gray-500'">Min 8 characters</li>
            <li :class="passwordRules.upper ? 'text-green-600' : 'text-gray-500'">Uppercase letter</li>
            <li :class="passwordRules.lower ? 'text-green-600' : 'text-gray-500'">Lowercase letter</li>
            <li :class="passwordRules.number ? 'text-green-600' : 'text-gray-500'">Number</li>
            <li :class="passwordRules.special ? 'text-green-600' : 'text-gray-500'">Special character</li>
          </ul>
        </a-form-item>

        <!-- Confirm Password -->
        <a-form-item
          label="Confirm Password"
          name="password_confirmation"
          :rules="[{ required: true, message: 'Please confirm your password' }]"
        >
          <a-input-password v-model:value="form.password_confirmation" />
        </a-form-item>

    

        <!-- Submit -->
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            block
            :loading="loading"
            :disabled="isSubmitDisabled"
            class="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Registering...' : 'Register' }}
          </a-button>
        </a-form-item>
      </a-form>

      <div style="text-align: center; margin-top: 16px">
        Already have an account? <NuxtLink to="/login">Login</NuxtLink>
      </div>
    </a-card>
  </div>
</template>