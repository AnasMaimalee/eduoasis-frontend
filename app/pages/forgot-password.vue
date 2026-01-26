<!-- pages/forgot-password.vue -->
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { usePublicApi } from '~/composables/useApi'
import { message } from 'ant-design-vue'

definePageMeta({
  layout: 'default',
   auth: false 
})

const { $api } = useNuxtApp()


/* -------------------- FORM MODEL -------------------- */
const form = reactive({
  email: '',
})

const loading = ref(false)

async function submit() {
  loading.value = true

  try {
    await $api('/forgot-password', {
      method: 'POST',
      body: { email: form.email },
    })

    // ✅ TOP SCREEN MESSAGE (better UX)
    message.success(
      'If this email exists, a password reset link has been sent.'
    )

    form.email = ''
  } catch (err: any) {
    message.error(err?.data?.message || 'Something went wrong')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
    "
  >
    <a-card title="Forgot Password" style="width: 100%; max-width: 420px">
      <p style="margin-bottom: 16px; color: #555">
        Enter your email and we’ll send you a reset link.
      </p>

      <!-- ✅ MODEL ADDED -->
      <a-form
        layout="vertical"
        :model="form"
        @finish="submit"
      >
        <a-form-item
          label="Email"
          name="email"
          :rules="[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Enter a valid email address' },
          ]"
        >
          <a-input
            v-model:value="form.email"
            placeholder="you@example.com"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            block
            :loading="loading"
            :disabled="loading"
          >
            {{ loading ? 'Sending...' : 'Send Reset Link' }}
          </a-button>
        </a-form-item>
      </a-form>

      <div style="text-align: center">
        <NuxtLink to="/login">Back to login</NuxtLink>
      </div>
    </a-card>
  </div>
</template>
