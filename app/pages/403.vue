<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-400/20 p-8 text-center">
      <!-- Icon -->
      <div class="mx-auto w-24 h-24 mb-8 p-6 bg-emerald-500/20 rounded-2xl border-2 border-emerald-500/30">
        <svg class="w-24 h-24 text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
      </div>

      <!-- Status & Title -->
      <h1 class="text-6xl font-black text-white mb-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
        403
      </h1>
      <h2 class="text-2xl md:text-3xl font-bold text-white/90 mb-6">
        Forbidden
      </h2>

      <!-- Message -->
      <p class="text-lg text-emerald-100/90 mb-8 leading-relaxed max-w-sm mx-auto">
        Sorry, you don't have permission to access this page. 
        <br><span class="font-semibold text-white">Please check your role or contact support.</span>
      </p>

      <!-- Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full max-w-md mx-auto">
        <!-- Role-aware Dashboard -->
        <NuxtLink 
          :to="dashboardPath"
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          {{ dashboardLabel }}
        </NuxtLink>
        
        <!-- Login -->
        <NuxtLink 
          to="/login" 
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
          Login
        </NuxtLink>

        <!-- Register -->
        <NuxtLink 
          to="/register" 
          class="px-6 py-3 bg-white/20 text-white font-semibold rounded-2xl hover:bg-white/30 backdrop-blur-sm border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-200 flex items-center justify-center gap-2 col-span-1 sm:col-span-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
          </svg>
          Create Account
        </NuxtLink>

        <!-- Home -->
        <NuxtLink 
          to="/" 
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 col-span-1 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Home
        </NuxtLink>
      </div>

      <!-- Role info (optional) -->
      <div v-if="error?.message" class="mt-8 pt-6 border-t border-emerald-400/10">
        <p class="text-sm text-emerald-200/80 mb-2">Details:</p>
        <code class="text-xs bg-emerald-900/50 px-3 py-1 rounded-lg text-emerald-100 font-mono">
          {{ error.message }}
        </code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  error: {
    statusCode: number
    message?: string
  }
}>(), {
  error: () => ({ statusCode: 403, message: 'Forbidden' })
})

// Role-aware dashboard logic
const { $authStore } = useNuxtApp()
const auth = $authStore || useAuthStore()

const userRole = computed(() => auth?.userRole || auth?.user?.role || 'user')

const dashboardPath = computed(() => {
  switch (userRole.value) {
    case 'superadmin':
      return '/dashboard/superadmin'
    case 'administrator':
      return '/dashboard/administrator'
    case 'user':
    default:
      return '/dashboard/user'
  }
})

const dashboardLabel = computed(() => {
  switch (userRole.value) {
    case 'superadmin':
      return 'Super Admin'
    case 'administrator':
      return 'Admin Panel'
    case 'user':
    default:
      return 'User Dashboard'
  }
})
</script>
