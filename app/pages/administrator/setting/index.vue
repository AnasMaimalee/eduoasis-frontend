<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import WebAuthnSection from '~/components/Setting/WebAuthnSection.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  roles: ['administrator']
})

const { $api } = useNuxtApp()

/* -------------------- STATE -------------------- */
const loading = reactive({
  profile: false,
  bank: false,
  password: false
})

const bankModalOpen = ref(false)

/* -------------------- NO HARDCODING - EMPTY STATE -------------------- */
const profile = reactive({
  name: '',
  email: '',
  bank_account: null as any | null
})

/* -------------------- BANK FORM - EMPTY -------------------- */
const bankForm = reactive({
  bank_name: '',
  account_name: '',
  account_number: '',
  bank_code: ''
})

/* -------------------- PASSWORD FORM -------------------- */
const passwordForm = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

/* -------------------- BANK LIST -------------------- */
const bankOptions = [
  { name: "Access Bank", code: "044" },
  { name: "Afriland Bank", code: "302" },
  { name: "ALAT Digital Bank (Wema)", code: "035" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank (FCMB)", code: "214" },
  { name: "FCMB Digital Account", code: "214" },
  { name: "GTBank", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Jaiz Bank", code: "206" },
  { name: "Keystone Bank", code: "082" },
  { name: "Paragon Bank", code: "268" },
  { name: "Petra Microfinance Bank", code: "838" },
  { name: "Polaris Bank", code: "076" },
  { name: "Premium Trust Bank", code: "8033" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "Suntrust Bank", code: "100" },
  { name: "Taiwo Bank", code: "1004" },
  { name: "Union Bank", code: "032" },
  { name: "United Bank for Africa (UBA)", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
  { name: "Titan Trust Bank", code: "100031" },
  { name: "Gboko Power Microfinance Bank", code: "8012" },
]

/* -------------------- COMPUTED -------------------- */
const hasBank = computed(() => !!profile.bank_account)

/* -------------------- FETCH PROFILE FROM API ONLY -------------------- */
const fetchProfile = async () => {
  loading.profile = true
  try {
    const res = await $api('/profile')
    
    // Populate from API response ONLY
    profile.name = res.data.name || ''
    profile.email = res.data.email || ''
    profile.bank_account = res.data.bank_account || null

    // Auto-populate bank form ONLY if bank exists
    if (profile.bank_account) {
      bankForm.bank_name = profile.bank_account.bank_name || ''
      bankForm.account_name = profile.bank_account.account_name || ''
      bankForm.account_number = profile.bank_account.account_number || ''
      bankForm.bank_code = profile.bank_account.bank_code || ''
    }
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to load profile data')
  } finally {
    loading.profile = false
  }
}

/* -------------------- BANK CHANGE -------------------- */
const onBankChange = (name: string) => {
  const bank = bankOptions.find(b => b.name === name)
  if (bank) bankForm.bank_code = bank.code
}

/* -------------------- FIXED: PROPER PUT/POST LOGIC -------------------- */
const submitBank = async () => {
  if (!bankForm.bank_name || !bankForm.account_name || !bankForm.account_number || !bankForm.bank_code) {
    message.error('Please fill all fields')
    return
  }

  loading.bank = true
  try {
    // ✅ FIXED: Proper PUT for update, POST for create
    const method = profile.bank_account ? 'PUT' : 'POST'
    
    const res = await $api('/admin/payout/bank', {
      method,
      body: bankForm
    })

    profile.bank_account = res.data
    bankModalOpen.value = false
    message.success('Bank details saved successfully')
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to save bank')
  } finally {
    loading.bank = false
  }
}

/* -------------------- UPDATE PASSWORD -------------------- */
const updatePassword = async () => {
  if (
    !passwordForm.current_password ||
    !passwordForm.new_password ||
    !passwordForm.new_password_confirmation
  ) {
    message.error('Please fill all password fields')
    return
  }

  if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
    message.error('Passwords do not match')
    return
  }

  loading.password = true
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
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to update password')
  } finally {
    loading.password = false
  }
}

onMounted(fetchProfile)
</script>

<template>
  <!-- SAME BEAUTIFUL TEMPLATE - NO HARDCODING -->
  <div class="max-w-2xl space-y-6 p-6 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50/50 min-h-screen">
    
    <!-- PROFILE - LOADS FROM API -->
    <a-card :loading="loading.profile" class="border-emerald-200 shadow-xl">
      <div class="flex items-center gap-4 mb-4" v-if="!loading.profile">
        <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
          <span class="text-2xl text-white font-bold">👤</span>
        </div>
        <div>
          <h3 class="font-black text-xl text-emerald-800 mb-1">Profile Information</h3>
          <p class="text-emerald-600 font-semibold">{{ profile.name || 'Loading...' }}</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" v-if="!loading.profile">
        <div>
          <span class="font-semibold text-gray-700">Name:</span>
          <p class="font-medium ml-2">{{ profile.name || 'Loading...' }}</p>
        </div>
        <div>
          <span class="font-semibold text-gray-700">Email:</span>
          <p class="font-medium ml-2">{{ profile.email || 'Loading...' }}</p>
        </div>
      </div>
    </a-card>

    <!-- BANK DETAILS - LOADS FROM API -->
    <a-card class="border-green-200 shadow-xl">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="font-black text-xl text-green-800 mb-1">Bank Details</h3>
          <p class="text-green-600 font-semibold">{{ hasBank ? profile.bank_account?.bank_name + ' Account' : 'No Bank Linked' }}</p>
        </div>
        <a-button 
          type="primary" 
          size="large" 
          @click="bankModalOpen = true"
          class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          {{ hasBank ? 'Update Bank' : 'Add Bank' }}
        </a-button>
      </div>

      <template v-if="hasBank && !loading.profile">
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-sm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-gray-600 mb-1">🏦 Bank Name</p>
              <p class="font-bold text-lg text-green-800">{{ profile.bank_account.bank_name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">👤 Account Name</p>
              <p class="font-bold text-lg text-gray-900">{{ profile.bank_account.account_name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">💳 Account Number</p>
              <p class="font-bold text-xl text-gray-900 tracking-wider">{{ profile.bank_account.account_number }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">🔢 Bank Code</p>
              <p class="font-bold text-lg text-emerald-600">{{ profile.bank_account.bank_code }}</p>
            </div>
          </div>
          <div v-if="profile.bank_account.recipient_code" class="mt-4 pt-4 border-t border-green-100">
            <p class="text-xs text-gray-500 mb-1">📱 Recipient Code</p>
            <p class="font-mono bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-800">
              {{ profile.bank_account.recipient_code }}
            </p>
          </div>
        </div>
      </template>

      <div v-else-if="!loading.profile" class="text-center py-12 text-gray-500">
        <div class="text-4xl mb-4">🏦</div>
        <p class="text-lg font-semibold mb-2">No bank details added yet</p>
        <p class="text-sm">Click "Add Bank" to setup payout account</p>
      </div>
    </a-card>

    <!-- REST OF TEMPLATE REMAINS SAME -->
    <!-- UPDATE PASSWORD -->
    <a-card class="!border-blue-200 shadow-xl">
      <h3 class="font-black text-xl mb-6 flex items-center gap-2">
        🔒 Update Password
      </h3>
      <a-form layout="vertical" class="space-y-4">
        <a-form-item label="Current Password">
          <a-input-password 
            v-model:value="passwordForm.current_password" 
            size="large"
            placeholder="Enter current password"
          />
        </a-form-item>
        <a-form-item label="New Password">
          <a-input-password 
            v-model:value="passwordForm.new_password" 
            size="large"
            placeholder="Enter new password"
          />
        </a-form-item>
        <a-form-item label="Confirm New Password">
          <a-input-password 
            v-model:value="passwordForm.new_password_confirmation" 
            size="large"
            placeholder="Confirm new password"
          />
        </a-form-item>
        <a-button
          type="primary"
          block
          size="large"
          :loading="loading.password"
          @click="updatePassword"
          class="h-14 text-lg font-semibold"
        >
          Update Password
        </a-button>
      </a-form>
    </a-card>

    <!-- BANK MODAL - SAME COMPACT VERSION -->
    <a-modal
      v-model:open="bankModalOpen"
      title="Bank Account Details"
      :confirm-loading="loading.bank"
      width="420"
      ok-text="Save Bank Account"
      @ok="submitBank"
      ok-button-props="{ class: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' }"
      class="!max-w-sm"
    >
      <a-form layout="vertical" class="!space-y-3">
        <a-form-item label="Bank Name *" class="!mb-1 !pt-0">
          <a-select
            v-model:value="bankForm.bank_name"
            show-search
            :filter-option="true"
            size="middle"
            placeholder="Select bank"
            @change="onBankChange"
            class="!w-full"
          >
            <a-select-option
              v-for="bank in bankOptions"
              :key="bank.code"
              :value="bank.name"
            >
              {{ bank.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Account Name *" class="!mb-1 !pt-0">
          <a-input 
            v-model:value="bankForm.account_name" 
            size="middle"
            placeholder="Account name"
          />
        </a-form-item>
        <a-form-item label="Account Number *" class="!mb-1 !pt-0">
          <a-input 
            v-model:value="bankForm.account_number" 
            size="middle"
            placeholder="Account number"
          />
        </a-form-item>
        <a-form-item label="Bank Code" class="!mb-0 !pt-0">
          <a-input 
            v-model:value="bankForm.bank_code" 
            size="middle"
            disabled 
            class="bg-gray-50"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <WebAuthnSection />
  </div>
</template>

<style scoped>
:deep(.ant-form-item-label > label) {
  @apply font-semibold text-gray-800;
}
:deep(.ant-input, :deep(.ant-select-selector)) {
  @apply text-base;
}
</style>
