<script setup lang="ts">
import { ref } from 'vue'
import { message, Input, Button } from 'ant-design-vue'
import { useNuxtApp } from '#app'
import { useAuthStore } from '~/stores/auth'

const { $api } = useNuxtApp()
const auth = useAuthStore()

const showRemoveModal = ref(false)
const loading = ref(false)
const password = ref('')
const credentialIdToRemove = ref<string | null>(null)

/* -------------------- helpers -------------------- */
const arrayBufferToBase64 = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))

/* -------------------- expose -------------------- */
function openRemoveModal(credId: string) {
  credentialIdToRemove.value = credId
  password.value = ''
  showRemoveModal.value = true
}

defineExpose({ openRemoveModal })

/* -------------------- biometric remove -------------------- */
const removeWithBiometric = async () => {
  if (!navigator.credentials || !window.PublicKeyCredential)
    return message.error('WebAuthn not supported')

  if (!credentialIdToRemove.value) return

  loading.value = true
  try {
    const { publicKey } = await $api('/webauthn/login/options', { method: 'POST' })

    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge: Uint8Array.from(atob(publicKey.challenge), c => c.charCodeAt(0)),
        rpId: publicKey.rpId,
        userVerification: publicKey.userVerification,
        allowCredentials: publicKey.allowCredentials.map((c: any) => ({
          id: Uint8Array.from(atob(c.id), x => x.charCodeAt(0)),
          type: c.type
        }))
      }
    })) as PublicKeyCredential

    await $api('/webauthn/login', {
      method: 'POST',
      body: {
        id: credential.id,
        rawId: arrayBufferToBase64(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
          authenticatorData: arrayBufferToBase64(
            (credential.response as AuthenticatorAssertionResponse).authenticatorData
          ),
          signature: arrayBufferToBase64(
            (credential.response as AuthenticatorAssertionResponse).signature
          ),
          userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle
            ? arrayBufferToBase64(
                (credential.response as AuthenticatorAssertionResponse).userHandle!
              )
            : null
        }
      }
    })

    await $api('/webauthn/credentials', {
      method: 'DELETE',
      body: { credential_id: credentialIdToRemove.value }
    })

    message.success('Passkey removed successfully')
    showRemoveModal.value = false
  } catch (e: any) {
    message.error(e?.message || 'Biometric authentication failed')
  } finally {
    loading.value = false
  }
}

/* -------------------- password remove -------------------- */
const removeWithPassword = async () => {
  if (!password.value || !credentialIdToRemove.value) return

  loading.value = true
  try {
    await auth.login({
      email: auth.user?.email,
      password: password.value
    })

    await $api('/webauthn/credentials', {
      method: 'DELETE',
      body: { credential_id: credentialIdToRemove.value }
    })

    message.success('Passkey removed successfully')
    showRemoveModal.value = false
  } catch {
    message.error('Password incorrect')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <a-modal v-model:open="showRemoveModal" title="Remove Passkey" :footer="null">
    <Button type="primary" block :loading="loading" @click="removeWithBiometric">
      🔒 Authenticate with Biometric
    </Button>

    <div class="text-center my-3 text-gray-400">— or —</div>

    <Input.Password v-model:value="password" placeholder="Enter password" />
    <Button block class="mt-2" :loading="loading" @click="removeWithPassword">
      🔑 Confirm with Password
    </Button>
  </a-modal>
</template>
