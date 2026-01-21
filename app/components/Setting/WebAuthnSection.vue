<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useNuxtApp } from '#app'
import RemovePasskeyModal from '~/components/Setting/RemovePasskeyModal.vue'

const { $api } = useNuxtApp()

const loading = ref(false)
const registered = ref(false)
const userCredentials = ref<any[]>([])
const removeModal = ref<InstanceType<typeof RemovePasskeyModal> | null>(null)

/* -------------------- helpers -------------------- */
const base64ToArrayBuffer = (base64: string) =>
  Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer

const arrayBufferToBase64 = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))

const credentialToJSON = (credential: PublicKeyCredential) => ({
  id: credential.id,
  rawId: arrayBufferToBase64(credential.rawId),
  type: credential.type,
  response: {
    clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
    attestationObject: credential.response.attestationObject
      ? arrayBufferToBase64(credential.response.attestationObject)
      : null
  }
})

const formatDate = (d: string) => new Date(d).toLocaleString()

/* -------------------- fetch -------------------- */
const fetchCredentials = async () => {
  loading.value = true
  try {
    const res = await $api('/webauthn/credentials')
    userCredentials.value = res.credentials
    registered.value = res.hasCredential
  } catch {
    message.error('Failed to load credentials')
  } finally {
    loading.value = false
  }
}

/* -------------------- register -------------------- */
const registerDevice = async () => {
  if (!window.PublicKeyCredential)
    return message.error('WebAuthn not supported')

  loading.value = true
  try {
    const { publicKey } = await $api('/webauthn/register/options', { method: 'POST' })

    const cred = (await navigator.credentials.create({
      publicKey: {
        ...publicKey,
        challenge: base64ToArrayBuffer(publicKey.challenge),
        user: {
          ...publicKey.user,
          id: base64ToArrayBuffer(publicKey.user.id)
        }
      }
    })) as PublicKeyCredential

    await $api('/webauthn/register', {
      method: 'POST',
      body: credentialToJSON(cred)
    })

    message.success('Biometric registered')
    fetchCredentials()
  } catch (e: any) {
    message.error(e?.message || 'Registration failed')
  } finally {
    loading.value = false
  }
}

onMounted(fetchCredentials)
</script>

<template>
  <a-card class="rounded-xl shadow-lg mt-4 max-w-4xl">
    <template #title>
      <div class="font-semibold text-lg">🔒 Biometric Login</div>
    </template>

    <div class="space-y-4">
      <div v-if="!registered" class="text-center">
        <p class="text-gray-600 mb-3">
          Enable Fingerprint / Face ID for faster login
        </p>
        <a-button block type="primary" :loading="loading" @click="registerDevice">
          Register Device
        </a-button>
      </div>

      <div v-else>
        <p class="text-gray-600 mb-2">Registered devices</p>

        <div
          v-for="cred in userCredentials"
          :key="cred.id"
          class="flex justify-between items-center bg-gray-50 p-3 rounded-md"
        >
          <div>
            <p class="font-medium">{{ cred.name || 'Biometric Device' }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(cred.created_at) }}</p>
          </div>

          <a-button danger size="small" @click="removeModal?.openRemoveModal(cred.id)">
            Remove
          </a-button>
        </div>

        <a-button
          class="mt-4"
          block
          type="dashed"
          :loading="loading"
          @click="registerDevice"
        >
          Add another device
        </a-button>
      </div>

      <RemovePasskeyModal ref="removeModal" />
    </div>
  </a-card>
</template>
