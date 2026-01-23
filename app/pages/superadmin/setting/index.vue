<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { CopyOutlined } from '@ant-design/icons-vue'
import WebAuthnSection from '~/components/Setting/WebAuthnSection.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin'],
  title: 'Setting'
})

const { $api } = useNuxtApp()

/* -------------------- 2FA STATE -------------------- */
const twoFaEnabled = ref(false)
const qrCode = ref('')
const secret = ref('')
const recoveryCodes = ref<string[]>([])
const confirmCode = ref('')
const step = ref<'qr' | 'confirm'>('qr')
const twoFaLoading = ref(false)

/* -------------------- PASSWORD STATE -------------------- */
const loadingState = reactive({ password: false })

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

const isSubmitDisabled = computed(() =>
  !passwordForm.current_password ||
  !passwordForm.new_password ||
  !passwordForm.new_password_confirmation ||
  strengthScore.value < 4 ||
  passwordForm.new_password !== passwordForm.new_password_confirmation ||
  loadingState.password
)

/* -------------------- 2FA FUNCTIONS (UNCHANGED) -------------------- */
const setup2FA = async (force = false) => {
  twoFaLoading.value = true
  try {
    const res = await $api('/auth/2fa/setup', {
      method: 'POST',
      body: { force }
    })
    qrCode.value = res.qr_code
    secret.value = res.secret
    recoveryCodes.value = res.recovery_codes || []
    step.value = 'qr'
  } catch (e: any) {
    message.error(e?.data?.message || 'Failed to load 2FA setup')
  } finally {
    twoFaLoading.value = false
  }
}

const confirm2FA = async () => {
  const code = confirmCode.value.replace(/\D/g, '')
  if (code.length !== 6) return message.error('Enter exactly 6 digits')

  twoFaLoading.value = true
  try {
    await $api('/auth/2fa/confirm', {
      method: 'POST',
      body: { code }
    })
    message.success('2FA enabled successfully')
    twoFaEnabled.value = true
    confirmCode.value = ''
  } catch (e: any) {
    message.error(e?.data?.message || 'Verification failed')
  } finally {
    twoFaLoading.value = false
  }
}

/* -------------------- DISABLE 2FA (NEW) -------------------- */
const disable2FA = async () => {
  twoFaLoading.value = true
  try {
    await $api('/auth/2fa/disable', { method: 'POST' })
    message.success('2FA disabled successfully')

    // reset state
    twoFaEnabled.value = false
    qrCode.value = ''
    secret.value = ''
    recoveryCodes.value = []
    step.value = 'qr'

    await setup2FA()
  } catch (e: any) {
    message.error(e?.data?.message || 'Failed to disable 2FA')
  } finally {
    twoFaLoading.value = false
  }
}

/* -------------------- COPY HELPERS (UNCHANGED) -------------------- */
const formattedSecret = computed(() =>
  secret.value ? secret.value.match(/.{1,4}/g)?.join(' ') : ''
)

const copySecret = async () => {
  await navigator.clipboard.writeText(secret.value)
  message.success('Secret key copied!')
}

const copyRecoveryCode = async (code: string) => {
  await navigator.clipboard.writeText(code)
  message.success('Recovery code copied!')
}

const copyAllRecoveryCodes = async () => {
  await navigator.clipboard.writeText(recoveryCodes.value.join('\n'))
  message.success('All recovery codes copied!')
}

/* -------------------- INIT -------------------- */
onMounted(async () => {
  const res = await $api('/auth/2fa/status')
  twoFaEnabled.value = res.enabled

  if (!twoFaEnabled.value) {
    await setup2FA()
  }
})
</script>


<template>
  <div class="max-w-4xl p-3 sm:p-6 min-h-screen space-y-6 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50/50">

    <!-- 2FA ENABLED STATE -->
    <a-card
      v-if="twoFaEnabled"
      class="rounded-2xl shadow-xl text-center"
    >
      <div class="space-y-4">
        <div class="text-4xl">✅</div>
        <p class="font-bold text-lg">Two-Factor Authentication is Enabled</p>
        <p class="text-gray-600 text-sm">
          Your account is protected with Google Authenticator.
        </p>

        <a-button
          danger
          size="large"
          :loading="twoFaLoading"
          @click="disable2FA"
        >
          Disable 2FA
        </a-button>
      </div>
    </a-card>

    <!-- 2FA CARD -->
    <a-card v-else class="rounded-2xl shadow-xl">

      <template #title>
        <div class="flex items-start gap-3">
          <div class="p-2 bg-emerald-100 rounded-xl text-xl">🔐</div>
          <div>
            <p class="font-black text-lg sm:text-xl">Two-Factor Authentication</p>
            <p class="text-xs sm:text-sm text-gray-600">Protect your account with Google Authenticator</p>
          </div>
        </div>
      </template>

      <!-- QR STEP -->
      <div v-if="step === 'qr'" class="space-y-6">

        <!-- QR -->
        <div class="flex justify-center">
          <div class="w-56 h-56 sm:w-72 sm:h-72 bg-white border-2 border-dashed border-emerald-300 rounded-2xl flex items-center justify-center relative">
            <div v-if="twoFaLoading" class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
              <div class="animate-spin h-10 w-10 border-b-2 border-emerald-500 rounded-full"></div>
            </div>
            <img v-if="qrCode" :src="qrCode" class="w-full h-full object-contain rounded-xl" />
          </div>
        </div>

        <!-- MANUAL SECRET KEY (single copy icon) -->
        <div v-if="secret" class="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
          <p class="text-xs font-semibold text-indigo-700">Manual setup key</p>

          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="bg-white border rounded-xl px-4 py-3 font-mono text-sm sm:text-base text-gray-800 break-all text-center flex-1">
              {{ formattedSecret }}
            </div>

            <!-- Copy icon – mobile: centered below, desktop: right side -->
            <div class="flex justify-center sm:justify-end">
              <a-button
                type="text"
                class="flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                @click="copySecret"
              >
                <copy-outlined class="text-xl" />
                <span class="text-sm sm:hidden">Copy key</span>
              </a-button>
            </div>
          </div>

          <p class="text-[11px] text-gray-500 text-center sm:text-left">
            Use this key if QR scanning fails.
          </p>
        </div>

        <!-- RECOVERY CODES -->
        <div v-if="recoveryCodes.length" class="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-yellow-800">Recovery Codes</p>
            <a-button type="link" size="small" @click="copyAllRecoveryCodes">
              Copy all
            </a-button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="code in recoveryCodes"
              :key="code"
              class="bg-white border rounded-xl px-4 py-3 flex items-center justify-between font-mono text-sm"
            >
              <span class="tracking-wider">{{ code }}</span>
              <a-button type="text" @click="copyRecoveryCode(code)">
                <copy-outlined class="text-yellow-700 text-lg hover:text-yellow-900" />
              </a-button>
            </div>
          </div>

          <p class="text-[11px] text-yellow-800 text-center">
            ⚠️ Each code can be used once. Store securely.
          </p>
        </div>

        <!-- ACTIONS -->
        <div class="flex flex-col sm:flex-row gap-3">
          <a-button block type="primary" class="h-12" @click="setup2FA(true)">
            Regenerate QR
          </a-button>
          <a-button block class="h-12" @click="step = 'confirm'">
            I’ve scanned it
          </a-button>
        </div>
      </div>

      <!-- CONFIRM STEP -->
      <div v-else class="space-y-6 text-center">
        <p class="text-gray-700">
          Enter the 6-digit code from Google Authenticator
        </p>

        <a-input
          v-model:value="confirmCode"
          maxlength="6"
          inputmode="numeric"
          class="text-center text-xl font-mono tracking-widest py-3 border-emerald-400 focus:border-emerald-600"
        />

        <div class="flex gap-3">
          <a-button block class="h-12" @click="step = 'qr'">
            Back
          </a-button>
          <a-button
            block
            type="primary"
            class="h-12"
            :loading="twoFaLoading"
            @click="confirm2FA"
          >
            Enable 2FA
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- PASSWORD CARD -->
    <a-card class="rounded-2xl shadow-xl">
      <template #title>
        <p class="font-black text-lg">🔑 Update Password</p>
      </template>

      <a-form layout="vertical" class="space-y-4">
        <a-form-item label="Current password">
          <a-input-password v-model:value="passwordForm.current_password" size="large" />
        </a-form-item>

        <a-form-item label="New password">
          <a-input-password v-model:value="passwordForm.new_password" size="large" />
        </a-form-item>

        <a-form-item label="Confirm new password">
          <a-input-password v-model:value="passwordForm.new_password_confirmation" size="large" />
        </a-form-item>

        <a-button
          block
          type="primary"
          size="large"
          class="h-12"
          :disabled="isSubmitDisabled"
          :loading="loadingState.password"
        >
          Update Password
        </a-button>
      </a-form>
    </a-card>

      <!-- WebAuthn / Fingerprint Section -->
    <WebAuthnSection />
  </div>
</template>

<style scoped>
:deep(.ant-card-body) {
  padding: 16px;
}
@media (min-width: 640px) {
  :deep(.ant-card-body) {
    padding: 24px;
  }
}
</style>