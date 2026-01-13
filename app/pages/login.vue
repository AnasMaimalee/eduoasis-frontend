<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Form, notification, Alert } from 'ant-design-vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

/* ---------------- STATE ---------------- */
const modelRef = reactive({
  email: '',
  password: '',
})

const lockedMessage = ref<string | null>(null)

/* ---------------- RULES ---------------- */
const rulesRef = reactive({
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
  ],
})

const { validate, validateInfos } = Form.useForm(modelRef, rulesRef)

/* ---------------- LOGIN HANDLER ---------------- */
const handleLogin = async () => {
  lockedMessage.value = null

  try {
    await validate()

    auth.loading = true
    await auth.login(modelRef)

    notification.success({
      message: 'Login Successful',
      description: `Welcome back, ${auth.user?.name}`,
      placement: 'topRight',
    })

    const role = auth.user?.roles?.[0]?.name

    if (role === 'superadmin') {
      router.push('/dashboard/superadmin')
    } else if (role === 'administrator' || role === 'admin') {
      router.push('/dashboard/administrator')
    } else {
      router.push('/dashboard/user')
    }
  } catch (err: any) {
    if (err?.errorFields) return

    const response = err?.response
    const status = response?.status

    /* 🚫 TOO MANY ATTEMPTS */
    if (status === 429) {
      const retryAfter = response?.headers?.['retry-after']
      const minutes = retryAfter ? Math.ceil(retryAfter / 60) : null

      lockedMessage.value = minutes
        ? `Too many failed login attempts. Your account is temporarily locked for ${minutes} minute(s).`
        : 'Too many failed login attempts. Please wait or reset your password.'

      notification.error({
        message: 'Account Temporarily Locked',
        description: lockedMessage.value,
        placement: 'topRight',
        duration: 6,
      })

      return
    }

    /* ❌ NORMAL ERROR */
    notification.error({
      message: 'Login Failed',
      description:
        response?.data?.message ||
        'Invalid email or password',
      placement: 'topRight',
    })
  } finally {
    auth.loading = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4"
  >
    <a-card
      title="Login to JAMB Portal"
      class="w-full max-w-md shadow-xl rounded-xl"
    >
      <!-- 🚨 LOCK WARNING -->
      <a-alert
        v-if="lockedMessage"
        type="error"
        show-icon
        class="mb-4"
        :message="lockedMessage"
        description="For your security, please wait or reset your password."
      />

      <a-form
        layout="vertical"
        :model="modelRef"
        :rules="rulesRef"
      >
        <a-form-item label="Email" v-bind="validateInfos.email">
          <a-input
            v-model:value="modelRef.email"
            type="email"
            placeholder="Enter your email"
            size="large"
            autocomplete="email"
          />
        </a-form-item>

        <a-form-item label="Password" v-bind="validateInfos.password">
          <a-input-password
            v-model:value="modelRef.password"
            placeholder="Enter your password"
            size="large"
            autocomplete="current-password"
          />
        </a-form-item>

        <a-form-item class="mt-6">
          <a-button
            type="primary"
            size="large"
            block
            :loading="auth.loading"
            @click="handleLogin"
          >
            Login
          </a-button>
        </a-form-item>
      </a-form>

      <!-- LINKS -->
      <div class="text-center mt-6 space-y-2 text-sm">
        <NuxtLink
          to="/forgot-password"
          class="block text-blue-600 hover:underline"
        >
          Forgot Password?
        </NuxtLink>

        <div>
          Don’t have an account?
          <NuxtLink to="/register" class="text-blue-600 hover:underline">
            Register
          </NuxtLink>
        </div>
      </div>
    </a-card>
  </div>
</template>
