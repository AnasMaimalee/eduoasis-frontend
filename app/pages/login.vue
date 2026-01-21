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
const loadingDevice = ref(false)

/* ---------------- RULES ---------------- */
const rulesRef = reactive({
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' },
  ],
  password: [{ required: true, message: 'Please enter your password', trigger: 'blur' }],
})

const { validate, validateInfos } = Form.useForm(modelRef, rulesRef)

/* ---------------- REDIRECT ---------------- */
const redirectUser = () => {
  const role = auth.user?.role // <- notice user?.role
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

    /* 🔐 2FA REQUIRED */
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

/* ---------------- LOGIN WITH DEVICE (WEBAUTHN) ---------------- */
const loginWithDevice = async () => {
  if (!navigator.credentials || !window.PublicKeyCredential) {
    notification.error({ message: 'Device login not supported' })
    return
  }

  loadingDevice.value = true
  try {
    const { $api } = useNuxtApp()
    // 1️⃣ Get login options from backend
    const options = await $api('/webauthn/login/options', { method: 'POST' })

    // 2️⃣ Convert to PublicKeyCredentialRequestOptions
    const publicKey: any = {
      challenge: Uint8Array.from(atob(options.publicKey.challenge), c => c.charCodeAt(0)),
      rpId: options.publicKey.rpId,
      allowCredentials: (options.publicKey.allowCredentials || []).map((c: any) => ({
        id: Uint8Array.from(atob(c.id), x => x.charCodeAt(0)),
        type: c.type,
      })),
      userVerification: options.publicKey.userVerification,
    }

    // 3️⃣ Ask user to scan face / fingerprint
    const credential = (await navigator.credentials.get({ publicKey })) as any

    // 4️⃣ Send credential back to server
    const res = await $api('/webauthn/login', {
      method: 'POST',
      body: {
        id: credential.id,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
          authenticatorData: Array.from(new Uint8Array(credential.response.authenticatorData)),
          clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
          signature: Array.from(new Uint8Array(credential.response.signature)),
          userHandle: credential.response.userHandle
            ? Array.from(new Uint8Array(credential.response.userHandle))
            : null,
        },
        type: credential.type,
      },
    })

    // 5️⃣ Save token in store (your auth.ts handles it)
    auth.login({ email: res.user.email, password: '' }) // just populate user in store
    auth.token = res.token
    notification.success({ message: '✅ Logged in with device!' })

    redirectUser()
  } catch (err: any) {
    console.error(err)
    notification.error({ message: err.message || 'Device login failed' })
  } finally {
    loadingDevice.value = false
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
          :loading="loadingDevice"
          @click="loginWithDevice"
        >
          Login with Device (Face / Fingerprint)
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
