<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['superadmin']
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

const isSubmitDisabled = computed(() =>
  !passwordForm.current_password ||
  !passwordForm.new_password ||
  !passwordForm.new_password_confirmation ||
  strengthScore.value < 4 ||
  passwordForm.new_password !== passwordForm.new_password_confirmation ||
  loadingState.password
)

/* -------------------- 2FA -------------------- */
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
  if (code.length !== 6) return message.error('Enter 6 digits')

  twoFaLoading.value = true
  try {
    await $api('/auth/2fa/confirm', {
      method: 'POST',
      body: { code }
    })
    message.success('2FA enabled')
    twoFaEnabled.value = true
    step.value = 'qr'
    confirmCode.value = ''
  } catch (e: any) {
    message.error(e?.data?.message || 'Verification failed')
  } finally {
    twoFaLoading.value = false
  }
}

const copySecret = async () => {
  await navigator.clipboard.writeText(secret.value)
  message.success('2FA secret copied')
}

onMounted(() => setup2FA())
</script>
<template>
  <div
    class="max-w-4xl mx-auto
           p-3 sm:p-6
           min-h-screen
           space-y-4 sm:space-y-8
           bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50/50"
  >

    <!-- 2FA CARD -->
    <a-card class="rounded-xl shadow-lg">

      <template #title>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-emerald-100 rounded-lg">
            🔐
          </div>
          <div>
            <p class="font-bold text-lg sm:text-xl">Two-Factor Authentication</p>
            <p class="text-xs sm:text-sm text-gray-600">
              Secure your account with Google Authenticator
            </p>
          </div>
        </div>
      </template>

      <!-- STEP: QR -->
      <div v-if="step === 'qr'" class="space-y-4">

        <!-- QR -->
        <div class="flex justify-center">
          <div
            class="w-56 h-56
                   sm:w-72 sm:h-72
                   bg-white
                   border-2 border-dashed border-emerald-300
                   rounded-xl
                   flex items-center justify-center
                   relative"
          >
            <div v-if="twoFaLoading" class="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div class="animate-spin h-8 w-8 border-b-2 border-emerald-500 rounded-full"></div>
            </div>

            <img
              v-if="qrCode"
              :src="qrCode"
              class="w-full h-full object-contain"
            />
          </div>
        </div>

        <!-- SECRET -->
        <div
            v-if="secret"
            class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-2"
            >
            <p class="text-xs text-indigo-700 font-medium">
                Manual setup key
            </p>

            <div
                class="bg-white border rounded-md p-3 flex items-start justify-between gap-3"
            >
                <p
                class="font-mono text-xs text-gray-800 break-all leading-relaxed"
                >
                {{ secret }}
                </p>

                <button
                @click="copySecret"
                class="shrink-0 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                >
                Copy
                </button>
            </div>

            <p class="text-[11px] text-gray-500">
                Save this key in case you can’t scan the QR code.
            </p>
            </div>

        <!-- RECOVERY -->
        <div v-if="recoveryCodes.length">
          <p class="text-sm font-semibold mb-2">Recovery Codes</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              v-for="c in recoveryCodes"
              :key="c"
              class="bg-white border rounded-md p-2 text-center font-mono text-xs"
            >
              {{ c }}
            </div>
          </div>
        </div>

        <!-- BUTTONS -->
        <div class="flex flex-col sm:flex-row gap-2">
          <a-button block type="primary" class="h-12" @click="setup2FA(true)">
            Regenerate
          </a-button>
          <a-button block class="h-12" @click="step = 'confirm'">
            I’ve scanned it
          </a-button>
        </div>
      </div>

      <!-- STEP: CONFIRM -->
      <div v-else class="space-y-6 text-center">

        <p class="text-gray-700">
          Enter the 6-digit code from Google Authenticator
        </p>

        <a-input
          v-model:value="confirmCode"
          maxlength="6"
          autofocus
          inputmode="numeric"
          class="text-center text-xl font-mono tracking-widest py-3"
        />

        <div class="flex gap-2">
          <a-button block class="h-12" @click="step = 'qr'">Back</a-button>
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
    <a-card class="rounded-xl shadow-lg">
      <template #title>
        <p class="font-bold text-lg">Update Password</p>
      </template>

      <a-form layout="vertical">
        <a-input-password v-model:value="passwordForm.current_password" placeholder="Current password" />
        <a-input-password v-model:value="passwordForm.new_password" placeholder="New password" />
        <a-input-password v-model:value="passwordForm.new_password_confirmation" placeholder="Confirm password" />

        <a-button
          block
          type="primary"
          class="h-12 mt-3"
          :disabled="isSubmitDisabled"
        >
          Update Password
        </a-button>
      </a-form>
    </a-card>

  </div>
</template>
:deep(.ant-card-body) {
  padding: 12px;
}

@media (min-width: 640px) {
  :deep(.ant-card-body) {
    padding: 24px;
  }
}