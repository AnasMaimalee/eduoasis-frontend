<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const reference = route.query.reference

if (reference) {
  setTimeout(() => {
    router.push('/user/wallet') 
  }, 1000)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-xl font-bold text-green-600">
        Payment Successful
      </h1>
      <p class="mt-2 text-gray-500">
        Redirecting...
      </p>
    </div>
  </div>
</template>
