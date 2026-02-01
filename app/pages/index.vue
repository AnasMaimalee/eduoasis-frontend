<script setup lang="ts">
import { Icon } from '@iconify/vue'
interface Service {
  id: number
  name: string
  description: string
  price: number
  icon: string
}
const { $api } = useNuxtApp()


// ✅ DYNAMIC SERVICES - No hardcoding!
const services = ref<Service[]>([])
const currentIndex = ref(0)
const servicesLength = computed(() => services.value.length)
const loading = ref(true)
const error = ref('')

// ✅ SERVICE ICON MAPPING
const getServiceIcon = (serviceName: string): string => {
  const icons: Record<string, string> = {
    'JAMB Original Result': 'heroicons:academic-cap',
    'Admission Letter': 'heroicons:document-text',
    'Admission Status Check': 'heroicons:check-circle',
    'Result Notification': 'heroicons:bell-alert',
    'O\'Level Upload Status': 'heroicons:cloud-upload',
    'JAMB Result': 'heroicons:academic-cap',
    'Admission Status': 'heroicons:check-circle',
    'O Level Status': 'heroicons:cloud-upload'
  }
  return icons[serviceName] || 'heroicons:document-text'
}

// ✅ FETCH LIVE SERVICES
const fetchLandingServices = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await $api('/landing-services')
    
    services.value = response.map((service: any) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: `₦${Number(service.price).toLocaleString()}`,
      icon: getServiceIcon(service.name)
    }))
  } catch (err: any) {
    console.error('Failed to fetch services:', err)
    error.value = 'Failed to load services. Please refresh.'
    // ✅ FALLBACK DATA
    services.value = [
      { id: 1, name: 'JAMB Original Result', description: 'Print your official JAMB result slip.', price: '₦5,000', icon: 'heroicons:academic-cap' },
      { id: 2, name: 'Admission Letter', description: 'Official admission letter for enrollment.', price: '₦4,000', icon: 'heroicons:document-text' },
      { id: 3, name: 'Admission Status Check', description: 'Check JAMB CAPS admission status.', price: '₦2,000', icon: 'heroicons:check-circle' },
      { id: 4, name: 'Result Notification', description: 'Instant result release alerts.', price: '₦1,500', icon: 'heroicons:bell-alert' },
      { id: 5, name: `O'Level Upload Status`, description: `Verify JAMB O'Level upload.`, price: '₦2,500', icon: 'heroicons:cloud-upload' },
      { id: 6, name: `PIN Binding`, description: `PIN Binding.`, price: '₦2,500', icon: 'heroicons:cloud-upload' },

    ]
  } finally {
    loading.value = false
  }
}

// Reviews data (keep hardcoded for now)
const reviews = [
  {
    name: 'Aisha Bello',
    role: 'UNILAG Student',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 5,
    comment: 'Got my JAMB result slip in 10 minutes! No stress, no queue. This is life-changing!',
    date: '3 days ago'
  },
  {
    name: 'Chinedu Okeke',
    role: 'UI Student',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
    rating: 5,
    comment: 'Admission status check worked perfectly. Saved me ₦10k from agents! Highly recommend.',
    date: '1 week ago'
  },
  {
    name: 'Fatima Yusuf',
    role: 'ABU Zaria',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    rating: 5,
    comment: "My O'Level upload status was verified instantly. Customer support replied in 2 minutes!",
    date: '2 days ago'
  },
  {
    name: 'Emmanuel Ade',
    role: 'UNN Graduate',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    comment: 'Result notification service is 🔥. Got alerted before JAMB portal even updated!',
    date: '5 days ago'
  },
  {
    name: 'Zainab Ibrahim',
    role: 'FUTMINNA Student',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    rating: 5,
    comment: 'Admission letter downloaded in 5 mins. No middlemen, no wahala. 100% legit!',
    date: 'Yesterday'
  },
]

const currentReviewIndex = ref(0)

// Controls
const nextReview = () => {
  currentReviewIndex.value = (currentReviewIndex.value + 1) % reviews.length
}

const autoSlide = () => {
  if (servicesLength.value > 0) {
    currentIndex.value = (currentIndex.value + 1) % servicesLength.value
  }
}

const nextSlide = () => {
  if (servicesLength.value > 0) {
    currentIndex.value = (currentIndex.value + 1) % servicesLength.value
  }
}
const prevSlide = () => {
  if (servicesLength.value > 0) {
    currentIndex.value = (currentIndex.value - 1 + servicesLength.value) % servicesLength.value
  }
}

let slideInterval = null
let reviewInterval = null

onMounted(() => {
  fetchLandingServices()
  slideInterval = setInterval(autoSlide, 4000)
  reviewInterval = setInterval(nextReview, 5000)
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
  if (reviewInterval) clearInterval(reviewInterval)
})

//form feedback submission 

import { ref } from 'vue'
import { message as antMessage } from 'ant-design-vue'


/* ---------------- FORM STATE ---------------- */
const form = ref({
  full_name: '',
  email: '',
  message: ''
})

const loadingFeedback = ref(false)

/* ---------------- SUBMIT HANDLER ---------------- */
const submitFeedback = async () => {
  if (!form.value.full_name || !form.value.email || !form.value.message) {
    antMessage.warning('Please fill all fields')
    return
  }

  loadingFeedback.value = true

  try {
    await $api('/feedback', {
      method: 'POST',
      body: {
        full_name: form.value.full_name,
        email: form.value.email,
        message: form.value.message
      }
    })

    antMessage.success('Message sent successfully')

    // reset form
    form.value = {
      full_name: '',
      email: '',
      message: ''
    }
  } catch (error) {
    antMessage.error('Failed to send message. Try again.')
  } finally {
    loadingFeedback.value = false
  }
}

</script>

<template>
  <!-- 🌌 PREMIUM MOVING BACKGROUND OBJECTS -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <!-- Floating Orbs -->
    <span class="orb orb-emerald"></span>
    <span class="orb orb-green"></span>
    <span class="orb orb-blue"></span>

    <!-- Soft Lines -->
    <span class="light-line line-1"></span>
    <span class="light-line line-2"></span>
  </div>
  <!-- 🌍 ORBITAL BACKGROUND SYSTEM -->
  <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div class="orbit orbit-lg">
      <span class="planet planet-emerald"></span>
    </div>

    <div class="orbit orbit-md">
      <span class="planet planet-green"></span>
    </div>

    <div class="orbit orbit-sm">
      <span class="planet planet-blue"></span>
    </div>

    <div class="orbit orbit-xs">
      <span class="planet planet-white"></span>
    </div>
  </div>

  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-blue-900/20 overflow-hidden">
    <!-- Animated Background -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-blue-500/10 animate-pulse"></div>
      <div class="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-bounce-slow"></div>
      <div class="absolute top-1/2 right-20 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-bounce-slow delay-2000"></div>
    </div>

    <!-- HERO -->
    <section class="relative z-10 pt-32 pb-28 px-6 text-center">
      <div class="max-w-6xl mx-auto">
        <div class="inline-block animate-fade-in-up">
          <div class="inline-flex items-center px-6 py-2 bg-white/80 backdrop-blur-xl rounded-full shadow-2xl mb-8 border border-white/50">
            <Icon name="heroicons:sparkles" class="w-5 h-5 mr-2 text-emerald-400" />
            <span class="font-medium text-sm text-gray-700">Trusted by 50K+ Nigerian Students</span>
          </div>
        </div>

        <h1 class="text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-gray-900 via-emerald-600 to-green-600 bg-clip-text text-transparent mb-8 animate-gradient-x">
          EDU<span class="text-transparent bg-gradient-to-r from-emerald-400 via-green-400 to-blue-400 bg-clip-text">OASIS</span>
        </h1>
        
        <p class="text-2xl md:text-3xl max-w-4xl mx-auto mb-12 leading-relaxed opacity-90 animate-fade-in-up delay-300">
          🚀 Secure & Instant JAMB services. Skip the stress, get your results 
          <span class="text-transparent bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text font-semibold">24/7</span>
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up delay-600">
          <NuxtLink to="/register" class="group relative btn-hero-primary px-12 py-6 text-xl font-bold shadow-2xl">
            <span class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-all duration-500"></span>
            <span class="relative bg-white/20 backdrop-blur-xl rounded-2xl px-12 py-6 flex items-center">
              <Icon name="heroicons:rocket-launch" class="w-6 h-6 mr-3 group-hover:animate-bounce text-emerald-100" />
              Start Now - Free!
            </span>
          </NuxtLink>
          <NuxtLink to="/login" class="btn-secondary px-12 py-6 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300">
            Login
          </NuxtLink>
        </div>
      </div>
    </section>

   <!-- COMPLETE SERVICES CAROUSEL - ALL ICONS FIXED -->
    <section class="relative z-10 py-28 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-20 animate-fade-in-up">
          <h2 class="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-6">
            Our Super Services
          </h2>
          <div class="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto rounded-full animate-pulse"></div>
        </div>

        <!-- LOADING STATE -->
        <div v-if="loading" class="text-center py-20">
          <div class="inline-flex items-center gap-3 text-emerald-500 mb-4">
            <div class="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
            <span class="text-xl font-semibold">Loading services...</span>
          </div>
        </div>

        <!-- ERROR STATE -->
        <div v-else-if="error" class="text-center py-20 max-w-2xl mx-auto">
          <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ error }}</h3>
          <button @click="fetchLandingServices" class="btn-primary-gradient px-8 py-4 text-lg font-bold">
            Retry
          </button>
        </div>

        <!-- SERVICES CAROUSEL -->
        <div v-else-if="services.length" class="relative max-w-6xl mx-auto overflow-hidden rounded-3xl shadow-2xl">
          <!-- Dots -->
          <div class="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            <div 
              v-for="(s, i) in services" 
              :key="s.id"
              class="w-3 h-3 rounded-full transition-all duration-300 cursor-pointer"
              :class="i === currentIndex ? 'w-8 bg-emerald-500 shadow-lg' : 'bg-white/60 hover:bg-emerald-400'"
              @click="currentIndex = i"
            />
          </div>

          <!-- Slides -->
          <div class="flex transition-transform duration-700 ease-in-out" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
            <div v-for="s in services" :key="s.id" class="min-w-full flex justify-center p-4">
              <div class="service-card max-w-md mx-auto group cursor-pointer">
                <div class="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4">
                  <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div class="relative z-10 p-10 text-center">
                    
                    <!-- PERFECT ICON MATCHING - YOUR EXACT BACKEND NAMES -->
                    <div class="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      
                      <!-- 1. Jamb Original Result -->
                      <svg v-if="s.name === 'Jamb Original Result'" class="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14l-8-5-8 5V6l8 5 8-5v12z"/>
                      </svg>
                      
                      <!-- 2. Jamb Admission Letter -->
                      <svg v-else-if="s.name === 'Jamb Admission Letter'" class="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                      </svg>
                      
                      <!-- 3. Checking Admission Status -->
                      <svg v-else-if="s.name === 'Checking Admission Status'" class="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      
                      <!-- 4. JAMB Results Notifications -->
                      <svg v-else-if="s.name === 'JAMB Results Notifications'" class="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                      </svg>
                      
                      <!-- 5. JAMB Upload Status -->
                      <svg v-else-if="s.name === 'JAMB Upload Status'" class="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.71 6.71l-1.41 1.41L13 7.83V16h-2V7.83l-.29.29-1.41-1.41L9 5l3-3 3 3z"/>
                      </svg>
                      
                      <!-- 6. Jamb PIN Binding request -->
                      <svg v-else-if="s.name === 'Jamb PIN Binding request'" class="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                      
                      <!-- DEFAULT STAR -->
                      <svg v-else class="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    </div>

                    <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">{{ s.name }}</h3>
                    <p class="text-gray-600 mb-8 leading-relaxed">{{ s.description }}</p>
                    <div class="text-3xl font-black bg-gradient-to-r from-emerald-500 via-green-500 to-blue-500 bg-clip-text text-transparent mb-8">
                      {{ s.price }}
                    </div>
                    <NuxtLink to="/register" class="btn-primary-gradient w-full py-4 px-3 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all border rounded-full text-white duration-300">
                      Get Service Now →
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <button 
            v-if="servicesLength > 1" 
            @click="prevSlide" 
            class="carousel-prev absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white backdrop-blur-xl rounded-full shadow-2xl text-emerald-600 hover:text-emerald-700 font-bold text-2xl transition-all duration-300 hover:scale-110 z-20"
          >‹</button>
          <button 
            v-if="servicesLength > 1"
            @click="nextSlide" 
            class="carousel-next absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white backdrop-blur-xl rounded-full shadow-2xl text-emerald-600 hover:text-emerald-700 font-bold text-2xl transition-all duration-300 hover:scale-110 z-20"
          >›</button>
        </div>
      </div>
    </section>




     <!-- 🌟 ABOUT US SECTION -->
    <section class="relative z-10 py-28 px-6">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

        <!-- LEFT CONTENT -->
        <div class="space-y-8 animate-fade-in-up">
          <span class="inline-block px-6 py-2 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold text-sm">
            About EDUOASIS
          </span>

          <h2 class="text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">
            Built to end <br />
            stress, scams & delays
          </h2>

          <p class="text-xl text-gray-700 leading-relaxed max-w-xl">
            EDUOASIS was created to give Nigerian students **direct, fast and secure**
            access to official JAMB services — without agents, queues or overcharging.
          </p>

          <p class="text-lg text-gray-600 max-w-xl">
            Every transaction is protected, every job is verified, and **payments only
            move when work is submitted**. Simple. Transparent. Fair.
          </p>

          <NuxtLink
            to="/register"
            class="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <Icon name="heroicons:shield-check" class="w-6 h-6" />
            Join EDUOASIS Today
          </NuxtLink>
        </div>

        <!-- RIGHT FEATURE CARDS -->
        <div class="grid sm:grid-cols-2 gap-8 animate-fade-in-up delay-300">

          <!-- CARD 1 -->
          <div class="about-card">
            <Icon name="heroicons:bolt" class="w-10 h-10 text-emerald-500 mb-4" />
            <h3 class="text-2xl font-bold mb-2">Instant Delivery</h3>
            <p class="text-gray-600">
              Most services are completed within minutes — not days.
            </p>
          </div>

          <!-- CARD 2 -->
          <div class="about-card">
            <Icon name="heroicons:lock-closed" class="w-10 h-10 text-emerald-500 mb-4" />
            <h3 class="text-2xl font-bold mb-2">100% Secure</h3>
            <p class="text-gray-600">
              Wallet-based system prevents fraud and fake confirmations.
            </p>
          </div>

          <!-- CARD 3 -->
          <div class="about-card">
            <Icon name="heroicons:check-badge" class="w-10 h-10 text-emerald-500 mb-4" />
            <h3 class="text-2xl font-bold mb-2">Verified Jobs</h3>
            <p class="text-gray-600">
              Funds are released only after successful job completion.
            </p>
          </div>

          <!-- CARD 4 -->
          <div class="about-card">
            <Icon name="heroicons:users" class="w-10 h-10 text-emerald-500 mb-4" />
            <h3 class="text-2xl font-bold mb-2">Student-First</h3>
            <p class="text-gray-600">
              Built by Nigerians, for Nigerian students nationwide.
            </p>
          </div>

        </div>
      </div>
    </section>
    
  <!-- how it work -->
    <section class="relative z-10 py-28 px-6">
      <div class="max-w-7xl mx-auto">

        <div class="text-center mb-20 fade-in">
          <h2 class="text-4xl font-extrabold text-gray-900">
            How It Works
          </h2>
          <p class="mt-4 text-gray-600 max-w-2xl mx-auto">
            Built with strict financial rules to protect every user.
          </p>
        </div>

        <div class="grid gap-12 md:grid-cols-3">
          
          <div class="how-card fade-up">
            <div class="how-icon">1</div>
            <h3 class="how-title">Fund Wallet</h3>
            <p class="how-text">
              Wallet funding is secure and verified. No action proceeds without sufficient balance.
            </p>
          </div>

          <div class="how-card fade-up delay-1">
            <div class="how-icon">2</div>
            <h3 class="how-title">Submit Job</h3>
            <p class="how-text">
              Funds are locked safely until the job is fully completed.
            </p>
          </div>

          <div class="how-card fade-up delay-2">
            <div class="how-icon">3</div>
            <h3 class="how-title">Auto Settlement</h3>
            <p class="how-text">
              Payment releases only after completion. No shortcuts. No abuse.
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- WHY TRUST US - ALL ICONS FIXED WITH SVG -->
    <section class="relative z-10 py-28 px-6 overflow-hidden bg-gradient-to-b from-white/80 to-emerald-50/60">
      <!-- Floating Background Elements -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-10 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-0 right-20 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-bounce-slow"></div>
      </div>

      <div class="relative max-w-7xl mx-auto text-center">
        <h2 class="text-5xl lg:text-6xl font-black mb-6
          bg-gradient-to-r from-gray-900 to-emerald-600
          bg-clip-text text-transparent">
          Why Trust Us?
        </h2>

        <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-20">
          Built with transparency, protected by logic, and trusted by thousands of Nigerian students.
        </p>

        <!-- TRUST CARDS -->
        <div class="grid md:grid-cols-3 gap-10">

          <!-- TRUST 1 - Secure -->
          <div class="group bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl
            hover:-translate-y-4 transition-all duration-500 border border-white/60">
            <div class="w-20 h-20 mx-auto mb-8 rounded-2xl
              bg-gradient-to-r from-emerald-500 to-green-500
              flex items-center justify-center shadow-xl">
              <svg class="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V5l-9-4z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              Secure by Design
            </h3>
            <p class="text-gray-600 leading-relaxed">
              Wallets cannot be credited without completed jobs.
              No shortcuts. No exploits. Everything is verified.
            </p>
          </div>

          <!-- TRUST 2 - Lock -->
          <div class="group bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl
            hover:-translate-y-4 transition-all duration-500 border border-white/60">
            <div class="w-20 h-20 mx-auto mb-8 rounded-2xl
              bg-gradient-to-r from-emerald-500 to-green-500
              flex items-center justify-center shadow-xl">
              <svg class="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-1-8V6c0-.55.45-1 1-1s1 .45 1 1v2h-2z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              No Agents. No Fraud.
            </h3>
            <p class="text-gray-600 leading-relaxed">
              You deal directly with the system.
              No middlemen. No overcharging. No manipulation.
            </p>
          </div>

          <!-- TRUST 3 - Badge -->
          <div class="group bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl
            hover:-translate-y-4 transition-all duration-500 border border-white/60">
            <div class="w-20 h-20 mx-auto mb-8 rounded-2xl
              bg-gradient-to-r from-emerald-500 to-green-500
              flex items-center justify-center shadow-xl">
              <svg class="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              Proven & Reliable
            </h3>
            <p class="text-gray-600 leading-relaxed">
              Thousands of successful requests processed.
              Real students. Real results. Real accountability.
            </p>
          </div>

        </div>

        <!-- TRUST METRICS -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-10 mt-24">
          <div>
            <h4 class="text-4xl font-black text-emerald-600">50K+</h4>
            <p class="text-gray-600">Students Served</p>
          </div>
          <div>
            <h4 class="text-4xl font-black text-emerald-600">100%</h4>
            <p class="text-gray-600">Wallet-Controlled</p>
          </div>
          <div>
            <h4 class="text-4xl font-black text-emerald-600">0</h4>
            <p class="text-gray-600">Fraud Cases</p>
          </div>
          <div>
            <h4 class="text-4xl font-black text-emerald-600">24/7</h4>
            <p class="text-gray-600">Support</p>
          </div>
        </div>
      </div>
    </section>


    <!-- DEVELOPER SECTION -->
    <section class="relative z-10 py-28 px-6 bg-gradient-to-b from-white/80 to-emerald-50/50">
      <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        
        <!-- Developer Image -->
        <img
          src="/code-bridge.png"
          class="w-full max-w-sm mx-auto rounded-full shadow-2xl border-4 border-emerald-500"
          alt="Founder"
        />

        <!-- Developer Info -->
        <div>
          <h2 class="text-4xl font-black text-gray-900 mb-4">
            Built by a Full Stack Developer
          </h2>
          <p class="text-lg text-gray-600 mb-6">
            Hi, I’m Anas Maimalee — CEO of Code Bridge Technology a Nigerian software developer who believes
            students deserve systems, not shortcuts.
          </p>
          <p class="text-gray-600 mb-6">
            EduOasis is engineered with strict wallet logic,
            webhook security, and zero tolerance for fraud.
          </p>

          <!-- Social Links -->
          <div class="flex flex-wrap gap-4 mt-6">
            <!-- LinkedIn -->
            <a href="https://linkedin.com/in/anas-abdussalam-91a66a374" target="_blank" rel="noopener" 
              class="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-2xl shadow-lg transition-all duration-300">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>

            <!-- GitHub -->
            <a href="https://github.com/anasmaimalee" target="_blank" rel="noopener" 
              class="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-2xl shadow-lg transition-all duration-300">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.058-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.176 2.873.171 3.176.768.84 1.236 1.911 1.236 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>

            <!-- Gmail -->
            <a href="mailto:anasment6@gmail.com" 
              class="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-2xl shadow-lg transition-all duration-300">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Gmail
          </a>

          <!-- WhatsApp -->
          <a href="https://wa.me/2348123442014" target="_blank" rel="noopener" 
            class="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-2xl shadow-lg transition-all duration-300">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            WhatsApp
          </a>
          </div>

          </div>
        </div>
    </section>


   <!-- REVIEWS SECTION - ENHANCED FLOW & NIGERIAN STUDENTS -->
    <section class="relative z-10 py-28 px-6 bg-gradient-to-b from-white/80 to-emerald-50/50 overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-20 animate-fade-in-up">
          <h2 class="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-6">
            What Students Are Saying
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Trusted by thousands of Nigerian students nationwide. See what they have to say about EduOasis!
          </p>
          <div class="inline-flex items-center gap-1 text-2xl mb-4">
            <span class="text-emerald-500 font-semibold mx-auto">(4.98/5 from 12,847 reviews)</span>
          </div>
        </div>

        <!-- Reviews Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          <div 
            v-for="(review, i) in reviews" 
            :key="i"
            class="review-card group bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-4 transition-all duration-500 border border-white/50 cursor-pointer animate-fade-in-up"
          >
            <div class="flex items-center mb-6">
              <img :src="review.avatar" :alt="review.name" class="w-16 h-16 rounded-2xl object-cover shadow-2xl mr-4 group-hover:scale-110 transition-transform" />
              <div>
                <h4 class="font-bold text-xl text-gray-900">{{ review.name }}</h4>
                <p class="text-emerald-600 font-semibold">{{ review.role }}</p>
                <div class="flex gap-1 mt-1">
                  <Icon name="heroicons:star" class="w-5 h-5 text-emerald-400 fill-current" v-for="n in review.rating" :key="n" />
                </div>
              </div>
            </div>
            <p class="text-gray-700 text-lg leading-relaxed mb-6 group-hover:text-gray-900 transition-colors">{{ review.comment }}</p>
            <div class="flex items-center justify-between text-sm opacity-75">
              <span>{{ review.date }}</span>
              <div class="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" />
                <span>Helpful</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Featured Review Carousel -->
        <div class="max-w-4xl mx-auto text-center relative">
          <div class="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-12 rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up">
            <div class="absolute inset-0 bg-white/10 animate-pulse"></div>
            <div class="relative z-10">
              <div class="flex justify-center gap-1 text-3xl mb-6">
                <Icon name="heroicons:star" class="w-10 h-10 text-emerald-300 fill-current" v-for="n in 5" :key="n" />
              </div>
              <p class="text-2xl font-semibold italic mb-8 animate-pulse">{{ reviews[currentReviewIndex].comment }}</p>
              <div class="inline-flex items-center gap-4 bg-white/20 backdrop-blur-xl px-8 py-4 rounded-2xl mx-auto">
                <img :src="reviews[currentReviewIndex].avatar" :alt="reviews[currentReviewIndex].name" class="w-14 h-14 rounded-xl object-cover shadow-2xl" />
                <div class="text-left">
                  <h4 class="font-bold text-xl">{{ reviews[currentReviewIndex].name }}</h4>
                  <p class="opacity-90">{{ reviews[currentReviewIndex].role }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

     <!-- CONTACT FORM - COMPACT VERSION -->
    <section class="relative z-10 py-20 px-6">
      <div class="max-w-2xl mx-auto">
        <div class="card bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50">
          <div class="text-center mb-8">
            <h2 class="text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-2">
              Let's Talk!
            </h2>
            <p class="text-lg text-gray-600">Have questions? Get instant help</p>
          </div>
          <form @submit.prevent="submitFeedback" class="space-y-4">
            <div>
              <input
                v-model="form.full_name"
                type="text"
                placeholder="Full Name"
                class="w-full px-4 py-3 text-base border border-gray-200 rounded-xl
                      focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                      transition-all duration-300"
              />
            </div>

            <div>
              <input
                v-model="form.email"
                type="email"
                placeholder="your@email.com"
                class="w-full px-4 py-3 text-base border border-gray-200 rounded-xl
                      focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                      transition-all duration-300"
              />
            </div>

            <div>
              <textarea
                v-model="form.message"
                rows="4"
                placeholder="Your message..."
                class="w-full px-4 py-3 text-base border border-gray-200 rounded-xl
                      focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                      transition-all duration-300 resize-vertical"
              />
            </div>

            <button
              type="submit"
              :loader="loadingFeedback"
              :disabled="loadingFeedback"
              class="w-full bg-gradient-to-r from-emerald-500 to-green-500
                    hover:from-emerald-600 hover:to-green-600
                    text-white font-bold text-lg py-3 px-8 rounded-xl shadow-xl
                    hover:shadow-2xl hover:-translate-y-0.5
                    transition-all duration-300 disabled:opacity-60"
            >
              <Icon name="heroicons:paper-airplane" class="w-5 h-5 inline mr-2" />
              {{ loadingFeedback ? 'Sending...' : 'Send Message' }}
            </button>
          </form>

        </div>
      </div>
    </section>

    <!-- ✅ COMPLETE FOOTER WITH WHATSAPP ICON -->
    <footer class="relative z-10 bg-emerald-500 text-white py-16 px-6 overflow-hidden">
      <!-- Moving background circles for effect -->
      <div class="absolute top-0 left-0 w-72 h-72 bg-emerald-400/20 rounded-full animate-bounce-slow"></div>
      <div class="absolute top-1/3 right-10 w-96 h-96 bg-green-400/20 rounded-full animate-pulse delay-500"></div>
      <div class="absolute bottom-10 left-1/2 w-80 h-80 bg-blue-400/20 rounded-full animate-bounce-slow delay-1000"></div>

      <div class="relative max-w-6xl mx-auto text-center space-y-8">
        <div class="space-y-4">
          <h3 class="text-4xl font-black bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            EDUOASIS
          </h3>
          <p class="text-xl opacity-90 max-w-2xl mx-auto">
            Your gateway to stress-free JAMB services. Secure. Fast. Reliable.
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 pt-12 border-t border-white/20">
          <div>
            <h4 class="text-lg font-bold mb-4">Quick Links</h4>
            <div class="space-y-2 text-sm opacity-90">
              <NuxtLink to="/register" class="hover:text-white/80 transition-colors">Register</NuxtLink>
              <NuxtLink to="/login" class="hover:text-white/80 transition-colors block">Login</NuxtLink>
              <NuxtLink to="/services" class="hover:text-white/80 transition-colors block">Services</NuxtLink>
            </div>
          </div>
          
          <div>
            <h4 class="text-lg font-bold mb-4">Get Help Fast</h4>
            <div class="space-y-3 text-sm">
              <a 
                href="https://wa.me/2348123442014" 
                class="flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 text-emerald-900 font-semibold p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl group mx-auto max-w-sm"
                target="_blank"
                rel="noopener noreferrer"
                title="Chat on WhatsApp - 24/7 Support"
              >
                <Icon name="heroicons:phone" class="w-6 h-6 group-hover:animate-bounce" />
                <Icon name="heroicons:chat-bubble-oval-left" class="w-6 h-6" />
                +234 812 344 2014
                <Icon name="heroicons:arrow-up-right" class="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
              </a>
              
              <a 
                href="mailto:support@eduosais.com" 
                class="flex items-center gap-3 bg-white/20 hover:bg-white/30 text-emerald-900 font-semibold p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl mx-auto max-w-sm"
                title="Send Email"
              >
                <Icon name="heroicons:envelope" class="w-6 h-6" />
                support@eduosais.com
              </a>
              
              <div class="text-xs opacity-75 pt-4 text-center">
                🚀 24/7 Live Support
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="text-lg font-bold mb-4">🇳🇬 Nigeria</h4>
            <p class="text-sm opacity-90">Trusted by students nationwide across all universities</p>
            <div class="flex justify-center gap-4 mt-4">
              <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div class="w-2 h-2 bg-white rounded-full animate-pulse delay-200"></div>
              <div class="w-2 h-2 bg-white rounded-full animate-pulse delay-400"></div>
            </div>
          </div>
        </div>

        <div class="pt-8 border-t border-white/20">
          <p class="opacity-90 text-sm">
            &copy; 2026 EDUOASIS. Built with ❤️ by 
            <a 
              href="mailto:anasment@gmail.com" 
              class="text-white/90 hover:text-white underline transition-all duration-300 font-semibold ml-1"
              title="Email CodeBridge Technology"
            >
              CodeBridge Technology
            </a>.
          </p>
        </div>
      </div>
    </footer>


  </div>
</template>

<!-- Keep all your existing styles -->
<style scoped>
/* Your existing styles remain unchanged */
@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
@keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
@keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

.animate-float { animation: float 6s ease-in-out infinite; }
.animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
.animate-gradient-x { animation: gradient-x 3s ease-in-out infinite; }
.animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }

.delay-300 { animation-delay: 0.3s; }
.delay-600 { animation-delay: 0.6s; }

.btn-hero-primary { 
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #0ea5e9 100%);
  border-radius: 1.5rem; 
}
.btn-primary-gradient { 
  background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
}
.btn-secondary { 
  background: rgba(255,255,255,0.2); 
  backdrop-filter: blur(20px); 
  border: 1px solid rgba(255,255,255,0.3); 
  border-radius: 1.5rem; 
}

.service-card, .review-card { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.carousel-prev, .carousel-next { transition: all 0.3s ease; }

/* ===============================
   🌌 BACKGROUND MOTION SYSTEM
================================ */
/* about ut  */

/* ===============================
   🌟 ABOUT SECTION STYLES
================================ */

.about-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow: 0 25px 50px rgba(0,0,0,0.1);
  transition: all 0.4s ease;
  border: 1px solid rgba(255,255,255,0.6);
}

.about-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 35px 70px rgba(16,185,129,0.25);
}

/* Floating Orbs */
.orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(80px);
  opacity: 0.25;
  animation: float-orb 20s ease-in-out infinite;
}

.orb-emerald {
  width: 420px;
  height: 420px;
  background: #10b981;
  top: 10%;
  left: -10%;
}

.orb-green {
  width: 500px;
  height: 500px;
  background: #22c55e;
  top: 40%;
  right: -15%;
  animation-delay: 5s;
}

.orb-blue {
  width: 380px;
  height: 380px;
  background: #0ea5e9;
  bottom: -10%;
  left: 30%;
  animation-delay: 10s;
}

/* Floating animation */
@keyframes float-orb {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-60px) translateX(40px);
  }
}

.step-card {
  position: relative;
  background: white;
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  box-shadow: 0 30px 60px rgba(0,0,0,0.1);
  transition: all .4s ease;
}

.step-card:hover {
  transform: translateY(-10px);
}

.step-number {
  position: absolute;
  top: -20px;
  left: 20px;
  font-size: 4rem;
  font-weight: 900;
  opacity: 0.08;
}

.step-icon {
  width: 56px;
  height: 56px;
  color: #10b981;
  margin-bottom: 1rem;
}

/* developer  */

/* 👨‍💻 DEVELOPER CARD */
.developer-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-radius: 2rem;
  padding: 3rem;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.12);
}

@media (min-width: 768px) {
  .developer-card {
    grid-template-columns: 280px 1fr;
  }
}

.developer-image-wrapper {
  display: flex;
  justify-content: center;
}

.developer-image {
  width: 220px;
  height: 220px;
  border-radius: 9999px;
  object-fit: cover;
  border: 6px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.developer-content {
  text-align: center;
}

@media (min-width: 768px) {
  .developer-content {
    text-align: left;
  }
}

.developer-title {
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 1rem;
}

.developer-name {
  background: linear-gradient(90deg, #10b981, #0ea5e9);
  -webkit-background-clip: text;
  color: transparent;
}

.developer-text {
  font-size: 1.05rem;
  color: #374151;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.developer-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (min-width: 768px) {
  .developer-links {
    justify-content: flex-start;
  }
}

.dev-link {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: #f0fdf4;
  color: #10b981;
  font-size: 1.4rem;
  transition: all 0.3s ease;
}

.dev-link:hover {
  background: #10b981;
  color: white;
  transform: translateY(-4px);
}

/* how  it work */
/* 🔄 HOW IT WORKS */
.how-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-radius: 1.75rem;
  padding: 3rem 2.5rem;
  text-align: center;
  box-shadow: 0 30px 60px rgba(0,0,0,0.1);
  transition: all 0.35s ease;
  position: relative;
}

.how-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 50px 90px rgba(16, 185, 129, 0.25);
}

.how-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #10b981, #0ea5e9);
  display: grid;
  place-items: center;
  color: white;
  font-size: 1.4rem;
  font-weight: 900;
  box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4);
}

.how-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.75rem;
}

.how-text {
  font-size: 1rem;
  color: #4b5563;
  line-height: 1.7;
}

/* Light moving lines */
.light-line {
  position: absolute;
  width: 120%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(16,185,129,0.35),
    transparent
  );
  animation: slide-line 18s linear infinite;
}

.line-1 {
  top: 25%;
}

.line-2 {
  top: 65%;
  animation-delay: 8s;
}

@keyframes slide-line {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}

/* ===============================
   🌍 ORBITAL BACKGROUND SYSTEM
================================ */

.orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform-style: preserve-3d;
  animation: spin linear infinite;
  transform: rotate(0deg) scaleX(1.15);

}

/* Orbit sizes */
.orbit-lg {
  width: 900px;
  height: 900px;
  margin-left: -450px;
  margin-top: -450px;
  animation-duration: 60s;
}

.orbit-md {
  width: 700px;
  height: 700px;
  margin-left: -350px;
  margin-top: -350px;
  animation-duration: 45s;
}

.orbit-sm {
  width: 500px;
  height: 500px;
  margin-left: -250px;
  margin-top: -250px;
  animation-duration: 35s;
}

.orbit-xs {
  width: 350px;
  height: 350px;
  margin-left: -175px;
  margin-top: -175px;
  animation-duration: 25s;
}

/* Orbit animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* PLANETS */
.planet {
  position: absolute;
  top: 50%;
  right: -12px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  filter: blur(0.5px);
}

/* Individual planet styles */
.planet-emerald {
  background: radial-gradient(circle at 30% 30%, #6ee7b7, #10b981);
  box-shadow: 0 0 40px rgba(16,185,129,0.9);
}

.planet-green {
  background: radial-gradient(circle at 30% 30%, #86efac, #22c55e);
  box-shadow: 0 0 35px rgba(34,197,94,0.9);
}

.planet-blue {
  background: radial-gradient(circle at 30% 30%, #7dd3fc, #0ea5e9);
  box-shadow: 0 0 40px rgba(14,165,233,0.9);
}

.planet-white {
  background: radial-gradient(circle at 30% 30%, #ffffff, #d1fae5);
  box-shadow: 0 0 30px rgba(255,255,255,0.8);
}

@media (max-width: 768px) {
  .orbit-lg { width: 600px; height: 600px; }
  .orbit-md { width: 450px; height: 450px; }
}


/* how it work  */
/* 🔄 HOW IT WORKS */
.how-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-radius: 1.75rem;
  padding: 3rem 2.5rem;
  text-align: center;
  box-shadow: 0 30px 60px rgba(0,0,0,0.1);
  transition: all 0.35s ease;
  position: relative;
}

.how-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 50px 90px rgba(16, 185, 129, 0.25);
}

.how-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #10b981, #10b981);
  display: grid;
  place-items: center;
  color: white;
  font-size: 1.4rem;
  font-weight: 900;
  box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4);
}

.how-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.75rem;
}

.how-text {
  font-size: 1rem;
  color: #4b5563;
  line-height: 1.7;
}
/* ✨ Animations */
.fade-in {
  animation: fadeIn 1.2s ease forwards;
}

.fade-up {
  opacity: 0;
  transform: translateY(40px);
  animation: fadeUp 1s ease forwards;
}

.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
