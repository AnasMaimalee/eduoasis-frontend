<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue'
import { Form, notification } from 'ant-design-vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

/* ---------------- STATE ---------------- */
const modelRef = reactive({
  email: '',
  password: '',
})

const twoFaCode = ref('')
const show2FAModal = ref(false)
const lockedMessage = ref<string | null>(null)
const loadingDevice = ref(false)

/* ---------------- FORM RULES ---------------- */
const rulesRef = reactive({
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    {
      validator: (_, value) => {
        if (!value) return Promise.reject('Please enter your email')
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(value) ? Promise.resolve() : Promise.reject('Invalid email format')
      },
      trigger: 'blur',
    },
  ],
  password: [{ required: true, message: 'Please enter your password', trigger: 'blur' }],
})

const { validate, validateInfos } = Form.useForm(modelRef, rulesRef)

/* ---------------- REDIRECT ---------------- */
const redirectUser = () => {
  const role = auth.userRole
  if (role === 'superadmin') router.push('/dashboard/superadmin')
  else if (role === 'administrator') router.push('/dashboard/administrator')
  else router.push('/dashboard/user')
}

/* ---------------- LOGIN STEP 1 ---------------- */
const handleLogin = async () => {
  lockedMessage.value = null
  try {
    await validate()
    auth.loading = true

    // Check if user has 2FA enabled
    const { $api } = useNuxtApp()
    const res = await $api('/auth/login/check', {
      method: 'POST',
      body: { email: modelRef.email, password: modelRef.password },
    })

    // 🔐 If 2FA is enabled, show modal
    if (res.requires_2fa) {
      show2FAModal.value = true
      notification.info({
        message: 'Two-Factor Authentication Required',
        description: 'Enter the 6-digit code from Google Authenticator.',
      })
      return
    }

    // ✅ Otherwise, no 2FA, log in directly
    await auth.login({
      email: modelRef.email,
      password: modelRef.password,
    })

    notification.success({
      message: 'Login Successful',
      description: `Welcome back, ${auth.user?.name}`,
    })
    redirectUser()
  } catch (err: any) {
    const response = err?.response
    const status = response?.status

    if (status === 429) {
      lockedMessage.value =
        'Too many failed login attempts. Please wait before trying again.'
      notification.error({
        message: 'Account Temporarily Locked',
        description: lockedMessage.value,
      })
      return
    }

    notification.error({
      message: 'Login Failed',
      description: err?.data?.message || 'Invalid email or password',
    })
  } finally {
    auth.loading = false
  }
}




/* ---------------- LOGIN STEP 2 (2FA CONFIRM) ---------------- */
const confirm2FA = async () => {
  if (!twoFaCode.value || twoFaCode.value.length !== 6) {
    notification.warning({
      message: 'Invalid Code',
      description: 'Enter a valid 6-digit code.',
    })
    return
  }

  try {
    auth.loading = true

    await auth.login({
      email: modelRef.email,
      password: modelRef.password,
      two_fa_code: twoFaCode.value,
    })

    show2FAModal.value = false

    notification.success({
      message: 'Login Successful',
      description: `Welcome back, ${auth.user?.name}`,
    })

    redirectUser()
  } catch {
    notification.error({
      message: 'Invalid 2FA Code',
      description: 'Check your authenticator app and try again.',
    })
  } finally {
    auth.loading = false
  }
}




/* ---------------- DEVICE LOGIN ---------------- */
const handleDeviceLogin = async () => {
  auth.loadingWithDevice = true
  try {
    await auth.loginWithDevice()
    notification.success({ message: '✅ Logged in with device!' })
    redirectUser()
  } catch (err: any) {
    notification.error({
      message: 'Device login failed',
      description: err?.message || 'Authentication error',
    })
  } finally {
    auth.loadingWithDevice = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <a-card title="Login to EduOasis Portal" class="w-full max-w-md shadow-xl rounded-xl">
      <a-alert
        v-if="lockedMessage"
        type="error"
        show-icon
        class="mb-4"
        :message="lockedMessage"
      />

      <a-form layout="vertical" :model="modelRef" :rules="rulesRef">
        <a-form-item label="Email" v-bind="validateInfos.email">
          <a-input v-model:value="modelRef.email" size="large" />
        </a-form-item>

        <a-form-item label="Password" v-bind="validateInfos.password">
          <a-input-password v-model:value="modelRef.password" size="large" />
        </a-form-item>

        <a-button
          type="primary"
          block
          :loading="auth.loading"
          @click="handleLogin"
        >
          Login
        </a-button>

        <a-button
          type="dashed"
          block
          class="mt-2"
          :loading="auth.loadingWithDevice"
          @click="handleDeviceLogin"
        >
          🔐 Login with Device (Face / Fingerprint)
        </a-button>
      </a-form>
       <div class="mt-4 flex justify-between text-sm">
        <router-link to="/forgot-password" class="text-blue-500 hover:underline">
          Forgot Password?
        </router-link>

        <router-link to="/register" class="text-blue-500 hover:underline">
          Register
        </router-link>
      </div>
    </a-card>
   


    <!-- 🔐 2FA MODAL -->
    <a-modal v-model:open="show2FAModal" title="Two-Factor Authentication" :footer="null" destroy-on-close>
      <a-card class="text-center">
        <p class="mb-4">
          🔐 Open <strong>Google Authenticator</strong> and enter the 6-digit code
        </p>

        <a-input
          v-model:value="twoFaCode"
          maxlength="6"
          placeholder="6-digit code"
          class="mb-4 text-center text-lg font-mono"
          style="letter-spacing: 0.5rem"
        />

        <a-button type="primary" block :loading="auth.loading" @click="confirm2FA">
          Verify & Login
        </a-button>
      </a-card>
    </a-modal>

  </div>
</template>
