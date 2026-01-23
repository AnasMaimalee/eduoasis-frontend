<script setup lang="ts">
import { ref } from 'vue'
const route = useRoute()
const { $api } = useNuxtApp()
import { message } from 'ant-design-vue'

definePageMeta({
    layout: 'default'
})
const form = ref({
  email: route.query.email,
  token: route.query.token,
  password: '',
  password_confirmation: '',
})

const loading = ref(false)

const submit = async () => {
  loading.value = true
  try {
    await $api('/auth/reset-password', {
      method: 'POST',
      body: form.value
    })
    message.success('Password set successfully')
    navigateTo('/login')
  } catch (err: any) {
    message.error(err.data?.message || 'Failed to set password')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-emerald-50">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h1 class="text-2xl font-black text-emerald-600 mb-4">
        Set Your Password
      </h1>

      <input
        v-model="form.password"
        type="password"
        placeholder="New password"
        class="input"
      />

      <input
        v-model="form.password_confirmation"
        type="password"
        placeholder="Confirm password"
        class="input mt-3"
      />

      <button
        @click="submit"
        :disabled="loading"
        class="btn-emerald mt-6 w-full"
      >
        Set Password
      </button>
    </div>
  </div>
</template>
