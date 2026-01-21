<script setup lang="ts">
import { reactive, ref } from 'vue'
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

/* ---------------- FIXED REDIRECT ---------------- */
// login.vue - ONLY CHANGE THIS FUNCTION
const redirectUser = () => {
  // ✅ FIXED: Use store getter (works with your existing structure)
  const role = auth.userRole  // Uses your existing getter!

  console.log('🚀 Redirecting with role:', role)

  if (role === 'superadmin') {
    router.push('/dashboard/superadmin')
  } else if (role === 'administrator') {
    router.push('/dashboard/administrator')
  } else {
    router.push('/dashboard/user')
  }
}


/* ---------------- LOGIN STEP 1 ---------------- */
const handleLogin = async () => {
  lockedMessage.value = null

  try {
    await validate()
    auth.loading = true

    await auth.login({
      email: modelRef.email,
      password: modelRef.password,
    })

    // ✅ LOGIN SUCCESS → REDIRECT
    notification.success({
      message: 'Login Successful',
      description: `Welcome back, ${auth.user?.name}`,
    })

    redirectUser()
  } catch (err: any) {
    const response = err?.response
    const status = response?.status

    /* 🔐 BACKEND SAYS 2FA REQUIRED */
    if (status === 403 && response?.data?.requires_2fa) {
      show2FAModal.value = true
      notification.info({
        message: 'Two-Factor Authentication Required',
        description: 'Enter the code from Google Authenticator.',
      })
      return
    }

    /* 🚫 RATE LIMIT */
    if (status === 429) {
      lockedMessage.value = 'Too many failed login attempts. Please wait before trying again.'
      notification.error({
        message: 'Account Temporarily Locked',
        description: lockedMessage.value,
      })
      return
    }

    notification.error({
      message: 'Login Failed',
      description: response?.data?.message || 'Invalid email or password',
    })
  } finally {
    auth.loading = false
  }
}

/* ---------------- LOGIN STEP 2 (2FA) ---------------- */
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
</script>

<!-- Template stays exactly the same -->
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
      </a-form>
    </a-card>

    <!-- 🔐 2FA MODAL -->
    <a-modal
      v-model:open="show2FAModal"
      title="Two-Factor Authentication"
      :footer="null"
      destroy-on-close
    >
      <p class="mb-4">
        Open <strong>Google Authenticator</strong> and enter the 6-digit code.
      </p>

      <a-input
        v-model:value="twoFaCode"
        maxlength="6"
        placeholder="6-digit code"
      />

      <a-button
        type="primary"
        block
        class="mt-4"
        :loading="auth.loading"
        @click="confirm2FA"
      >
        Verify & Login
      </a-button>
    </a-modal>
  </div>
</template>
