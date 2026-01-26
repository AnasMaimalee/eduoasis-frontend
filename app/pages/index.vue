<script setup lang="ts">
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
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: 'Got my JAMB result slip in 10 minutes! No stress, no queue. This is life-changing!',
    date: '3 days ago'
  },
  {
    name: 'Chinedu Okeke',
    role: 'UI Student',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: 'Admission status check worked perfectly. Saved me ₦10k from agents! Highly recommend.',
    date: '1 week ago'
  },
  {
    name: 'Fatima Yusuf',
    role: 'ABU Zaria',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: "My O'Level upload status was verified instantly. Customer support replied in 2 minutes!",
    date: '2 days ago'
  },
  {
    name: 'Emmanuel Ade',
    role: 'UNN Graduate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: 'Result notification service is 🔥. Got alerted before JAMB portal even updated!',
    date: '5 days ago'
  },
  {
    name: 'Zainab Ibrahim',
    role: 'FUTMINNA Student',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
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

    <!-- SERVICES CAROUSEL -->
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
          <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ error }}</h3>
          <button @click="fetchLandingServices" class="btn-primary-gradient px-8 py-4 text-lg font-bold">
            Retry
          </button>
        </div>

        <!-- SERVICES CAROUSEL -->
        <div v-else-if="services.length" class="relative max-w-6xl mx-auto overflow-hidden rounded-3xl shadow-2xl">
          <div class="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            <div 
              v-for="(s, i) in services" 
              :key="s.id"
              class="w-3 h-3 rounded-full transition-all duration-300 cursor-pointer"
              :class="i === currentIndex ? 'w-8 bg-emerald-500 shadow-lg' : 'bg-white/60 hover:bg-emerald-400'"
              @click="currentIndex = i"
            />
          </div>

          <div class="flex transition-transform duration-700 ease-in-out" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
            <div v-for="s in services" :key="s.id" class="min-w-full flex justify-center p-4">
              <div class="service-card max-w-md mx-auto group cursor-pointer">
                <div class="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4">
                  <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div class="relative z-10 p-10 text-center">
                    <div class="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <Icon :name="s.icon" class="w-12 h-12 text-white drop-shadow-lg" />
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
    <!-- about sectipn -->
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
     <!-- WHY TRUST US -->
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

          <!-- TRUST 1 -->
          <div class="group bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl
            hover:-translate-y-4 transition-all duration-500 border border-white/60">
            <div class="w-20 h-20 mx-auto mb-8 rounded-2xl
              bg-gradient-to-r from-emerald-500 to-green-500
              flex items-center justify-center shadow-xl">
              <Icon name="heroicons:shield-check" class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              Secure by Design
            </h3>
            <p class="text-gray-600 leading-relaxed">
              Wallets cannot be credited without completed jobs.
              No shortcuts. No exploits. Everything is verified.
            </p>
          </div>

          <!-- TRUST 2 -->
          <div class="group bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl
            hover:-translate-y-4 transition-all duration-500 border border-white/60">
            <div class="w-20 h-20 mx-auto mb-8 rounded-2xl
              bg-gradient-to-r from-emerald-500 to-green-500
              flex items-center justify-center shadow-xl">
              <Icon name="heroicons:lock-closed" class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              No Agents. No Fraud.
            </h3>
            <p class="text-gray-600 leading-relaxed">
              You deal directly with the system.
              No middlemen. No overcharging. No manipulation.
            </p>
          </div>

          <!-- TRUST 3 -->
          <div class="group bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl
            hover:-translate-y-4 transition-all duration-500 border border-white/60">
            <div class="w-20 h-20 mx-auto mb-8 rounded-2xl
              bg-gradient-to-r from-emerald-500 to-green-500
              flex items-center justify-center shadow-xl">
              <Icon name="heroicons:check-badge" class="w-10 h-10 text-white" />
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


    <!-- REVIEWS SECTION (unchanged) -->
    <section class="relative z-10 py-28 px-6 bg-gradient-to-b from-white/80 to-emerald-50/50">
      <!-- ... reviews section remains the same ... -->
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-20 animate-fade-in-up">
          <h2 class="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-6">
            What Students Are Saying
          </h2>
          <div class="inline-flex items-center gap-1 text-2xl mb-4">
            <Icon name="heroicons:star" class="w-8 h-8 text-emerald-400 fill-current" v-for="n in 5" :key="n" />
          </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div 
            v-for="(review, i) in reviews" 
            :key="i"
            class="review-card group bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:-translate-y-3 transition-all duration-500 border border-white/50 cursor-pointer"
          >
            <div class="flex items-center mb-6">
              <img :src="review.avatar" :alt="review.name" class="w-16 h-16 rounded-2xl object-cover shadow-2xl mr-4 group-hover:scale-105 transition-transform" />
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
      </div>
    </section>

     <!-- 👨‍💻 DEVELOPER SECTION -->
    <section class="relative z-10 py-24 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="developer-card">
          
          <div class="developer-image-wrapper">
            <!-- 🔁 Replace src with your real image -->
            <!-- <img
              src="/images/developer.jpg"
              alt="Developer"
              class="developer-image"
            /> -->
          </div>

          <div class="developer-content">
            <h3 class="developer-title">
              Built with passion by
              <span class="developer-name">Anas</span>
            </h3>

            <p class="developer-text">
              A dedicated full-stack developer focused on building secure,
              real-world solutions for education and financial platforms.
              EDUOASIS was designed with integrity, transparency, and user trust
              at its core.
            </p>

            <div class="developer-links">
              <a href="#" target="_blank" class="dev-link">
                <Icon name="mdi:github" />
              </a>
              <a href="#" target="_blank" class="dev-link">
                <Icon name="mdi:linkedin" />
              </a>
              <a href="#" target="_blank" class="dev-link">
                <Icon name="mdi:twitter" />
              </a>
              <a href="mailto:your@email.com" class="dev-link">
                <Icon name="mdi:email" />
              </a>
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
    <footer class="relative z-10 bg-gradient-to-r from-gray-900 to-emerald-900 text-white py-16 px-6">
      <div class="max-w-6xl mx-auto text-center space-y-8">
        <div class="space-y-4">
          <h3 class="text-4xl font-black bg-gradient-to-r from-white to-emerald-300 bg-clip-text">EDUOASIS</h3>
          <p class="text-xl opacity-90 max-w-2xl mx-auto">
            Your gateway to stress-free JAMB services. Secure. Fast. Reliable.
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 pt-12 border-t border-white/10">
          <div>
            <h4 class="text-lg font-bold mb-4">Quick Links</h4>
            <div class="space-y-2 text-sm opacity-80">
              <NuxtLink to="/register" class="hover:text-emerald-400 transition-colors">Register</NuxtLink>
              <NuxtLink to="/login" class="hover:text-emerald-400 transition-colors block">Login</NuxtLink>
              <NuxtLink to="/services" class="hover:text-emerald-400 transition-colors block">Services</NuxtLink>
            </div>
          </div>
          
          <div>
            <h4 class="text-lg font-bold mb-4">Get Help Fast</h4>
            <div class="space-y-3 text-sm">
              <!-- ✅ WHATSAPP BUTTON WITH ICON -->
              <a 
                href="https://wa.me/2348123442014" 
                class="flex items-center justify-center gap-3 bg-emerald-500/20 hover:bg-emerald-500/30 border-2 border-emerald-500/40 text-emerald-300 hover:text-emerald-100 p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl group mx-auto max-w-sm"
                target="_blank"
                rel="noopener noreferrer"
                title="Chat on WhatsApp - 24/7 Support"
              >
                <Icon name="heroicons:phone" class="w-6 h-6 group-hover:animate-bounce" />
                <Icon name="heroicons:chat-bubble-oval-left" class="w-6 h-6" />
                <span class="font-semibold">+234 812 344 2014</span>
                <Icon name="heroicons:arrow-up-right" class="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
              </a>
              
              <!-- ✅ EMAIL BUTTON -->
              <a 
                href="mailto:support@eduosais.com" 
                class="flex items-center gap-3 bg-emerald-500/20 hover:bg-emerald-500/30 border-2 border-emerald-500/40 text-emerald-300 hover:text-emerald-100 p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl mx-auto max-w-sm"
                title="Send Email"
              >
                <Icon name="heroicons:envelope" class="w-6 h-6" />
                <span class="font-semibold">support@eduosais.com</span>
              </a>
              
              <div class="text-xs opacity-75 pt-4 text-center">
                🚀 24/7 Live Support
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="text-lg font-bold mb-4">🇳🇬 Nigeria</h4>
            <p class="text-sm opacity-80">Trusted by students nationwide across all universities</p>
            <div class="flex justify-center gap-4 mt-4">
              <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
              <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
            </div>
          </div>
        </div>

        <!-- Copyright with CodeBridge -->
        <div class="pt-8 border-t border-white/10">
          <p class="opacity-75 text-sm">
            &copy; 2026 EDUOASIS. Built with ❤️ by 
            <a 
              href="mailto:anasment@gmail.com" 
              class="text-emerald-400 hover:text-emerald-300 underline hover:no-underline transition-all duration-300 font-semibold ml-1"
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
