<script setup lang="ts">
const services = [
  { name: 'JAMB Original Result', description: 'Print your official JAMB result slip.', price: '₦5,000', icon: 'heroicons:academic-cap' },
  { name: 'Admission Letter', description: 'Official admission letter for enrollment.', price: '₦4,000', icon: 'heroicons:document-text' },
  { name: 'Admission Status Check', description: 'Check JAMB CAPS admission status.', price: '₦2,000', icon: 'heroicons:check-circle' },
  { name: 'Result Notification', description: 'Instant result release alerts.', price: '₦1,500', icon: 'heroicons:bell-alert' },
  { name: `O'Level Upload Status`, description: `Verify JAMB O'Level upload.`, price: '₦2,500', icon: 'heroicons:cloud-upload' },
]

const currentIndex = ref(0)
const servicesLength = services.length

// Reviews data
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
  {
    name: 'Aisha Bello',
    role: 'UNILAG Student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: 'Got my JAMB result slip in 10 minutes! No stress, no queue. This is life-changing!',
    date: '3 days ago'
  },
]

const currentReviewIndex = ref(0)

// Controls
const nextReview = () => {
  currentReviewIndex.value = (currentReviewIndex.value + 1) % reviews.length
}

const autoSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % servicesLength
}

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % servicesLength
}
const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + servicesLength) % servicesLength
}

let slideInterval = null
let reviewInterval = null

onMounted(() => {
  slideInterval = setInterval(autoSlide, 4000)
  reviewInterval = setInterval(nextReview, 5000)
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
  if (reviewInterval) clearInterval(reviewInterval)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 overflow-hidden">
    
    <!-- Animated Background -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
      <div class="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-bounce-slow"></div>
      <div class="absolute top-1/2 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-bounce-slow delay-2000"></div>
    </div>

    <!-- HERO -->
    <section class="relative z-10 pt-32 pb-28 px-6 text-center">
      <div class="max-w-6xl mx-auto">
        <div class="inline-block animate-fade-in-up">
          <div class="inline-flex items-center px-6 py-2 bg-white/80 backdrop-blur-xl rounded-full shadow-2xl mb-8 border border-white/50">
            <Icon name="heroicons:sparkles" class="w-5 h-5 mr-2 text-yellow-400" />
            <span class="font-medium text-sm text-gray-700">Trusted by 50K+ Nigerian Students</span>
          </div>
        </div>

        <h1 class="text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-8 animate-gradient-x">
          EDU<span class="text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text">OASIS</span>
        </h1>
        
        <p class="text-2xl md:text-3xl max-w-4xl mx-auto mb-12 leading-relaxed opacity-90 animate-fade-in-up delay-300">
          🚀 Secure & Instant JAMB services. Skip the stress, get your results 
          <span class="text-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text font-semibold">24/7</span>
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up delay-600">
          <NuxtLink to="/register" class="group relative btn-hero-primary px-12 py-6 text-xl font-bold shadow-2xl">
            <span class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-all duration-500"></span>
            <span class="relative bg-white/20 backdrop-blur-xl rounded-2xl px-12 py-6 flex items-center">
              <Icon name="heroicons:rocket-launch" class="w-6 h-6 mr-3 group-hover:animate-bounce" />
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
          <h2 class="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-6">
            Our Super Services
          </h2>
          <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full animate-pulse"></div>
        </div>

        <div class="relative max-w-6xl mx-auto overflow-hidden rounded-3xl shadow-2xl">
          <div class="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            <div 
              v-for="(s, i) in services" 
              :key="i"
              class="w-3 h-3 rounded-full transition-all duration-300 cursor-pointer"
              :class="i === currentIndex ? 'w-8 bg-blue-500 shadow-lg' : 'bg-white/60 hover:bg-blue-400'"
              @click="currentIndex = i"
            />
          </div>

          <div class="flex transition-transform duration-700 ease-in-out" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
            <div v-for="s in services" :key="s.name" class="min-w-full flex justify-center p-4">
              <div class="service-card max-w-md mx-auto group cursor-pointer">
                <div class="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4">
                  <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div class="relative z-10 p-10 text-center">
                    <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <Icon :name="s.icon" class="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{{ s.name }}</h3>
                    <p class="text-gray-600 mb-8 leading-relaxed">{{ s.description }}</p>
                    <div class="text-3xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
                      {{ s.price }}
                    </div>
                    <NuxtLink to="/register" class="btn-primary-gradient w-full py-4 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                      Get Service Now →
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button @click="prevSlide" class="carousel-prev absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white backdrop-blur-xl rounded-full shadow-2xl text-blue-600 hover:text-blue-700 font-bold text-2xl transition-all duration-300 hover:scale-110 z-20">‹</button>
          <button @click="nextSlide" class="carousel-next absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white backdrop-blur-xl rounded-full shadow-2xl text-blue-600 hover:text-blue-700 font-bold text-2xl transition-all duration-300 hover:scale-110 z-20">›</button>
        </div>
      </div>
    </section>

    <!-- REVIEWS SECTION -->
    <section class="relative z-10 py-28 px-6 bg-gradient-to-b from-white/80 to-blue-50/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-20 animate-fade-in-up">
          <h2 class="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-6">
            What Students Are Saying
          </h2>
          <div class="inline-flex items-center gap-1 text-2xl mb-4">
            <Icon name="heroicons:star" class="w-8 h-8 text-yellow-400 fill-current" v-for="n in 5" :key="n" />
            <span class="text-3xl font-bold text-gray-700 ml-2">(4.98/5 from 12,847 reviews)</span>
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
                <p class="text-blue-600 font-semibold">{{ review.role }}</p>
                <div class="flex gap-1 mt-1">
                  <Icon name="heroicons:star" class="w-5 h-5 text-yellow-400 fill-current" v-for="n in review.rating" :key="n" />
                </div>
              </div>
            </div>
            <p class="text-gray-700 text-lg leading-relaxed mb-6 group-hover:text-gray-900 transition-colors">{{ review.comment }}</p>
            <div class="flex items-center justify-between text-sm opacity-75">
              <span>{{ review.date }}</span>
              <div class="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" />
                <span>Helpful</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Featured Review -->
        <div class="max-w-4xl mx-auto text-center group">
          <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-12 rounded-3xl shadow-2xl relative overflow-hidden">
            <div class="absolute inset-0 bg-white/10 animate-pulse"></div>
            <div class="relative z-10">
              <div class="flex justify-center gap-1 text-3xl mb-6">
                <Icon name="heroicons:star" class="w-10 h-10 text-yellow-300 fill-current" v-for="n in 5" :key="n" />
              </div>
              <p class="text-2xl font-semibold italic mb-8 animate-pulse">{{ reviews[currentReviewIndex].comment }}</p>
              <div class="inline-flex items-center gap-4 bg-white/20 backdrop-blur-xl px-8 py-4 rounded-2xl">
                <img :src="reviews[currentReviewIndex].avatar" :alt="reviews[currentReviewIndex].name" class="w-14 h-14 rounded-xl object-cover shadow-2xl" />
                <div>
                  <h4 class="font-bold text-xl">{{ reviews[currentReviewIndex].name }}</h4>
                  <p class="opacity-90">{{ reviews[currentReviewIndex].role }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DEVELOPER SECTION -->
    <section class="relative z-10 py-28 px-6">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div class="relative group">
          <img 
            src="https://www.shutterstock.com/image-photo/busy-focused-professional-african-young-600nw-2555990861.jpg" 
            alt="Anas Maimalee" 
            class="w-full h-96 object-cover rounded-3xl shadow-2xl ring-8 ring-blue-500/20 hover:ring-purple-500/30 transition-all duration-700 group-hover:scale-105"
          />
          <div class="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </div>
        
        <div class="space-y-8">
          <div class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-2xl shadow-2xl">
            <Icon name="heroicons:sparkles" class="w-5 h-5 mr-3" />
            Meet Your Developer
          </div>
          <h2 class="text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
            Anas Maimalee <span class="text-sm"> <br>(Founder and CEO of CodeBridge Technology)</span>
          </h2>
          <p class="text-2xl font-semibold text-gray-700 mb-6">Founder & Lead Developer</p>
          <p class="text-xl text-gray-600 leading-relaxed">
            Built <span class="font-black text-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text">EDUOASIS</span> from scratch to solve real student problems.
          </p>
        </div>
      </div>
    </section>
     <!-- ✅ CONTACT FORM BACK -->
        <div class="max-w-4xl mx-auto mb-20">
          <div class="card bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/50">
            <form class="space-y-6">
              <div>
                <label class="block text-xl font-semibold text-gray-700 mb-3">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your full name" 
                  class="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                />
              </div>
              <div>
                <label class="block text-xl font-semibold text-gray-700 mb-3">Email Address</label>
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  class="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                />
              </div>
              <div>
                <label class="block text-xl font-semibold text-gray-700 mb-3">Message</label>
                <textarea 
                  rows="6"
                  placeholder="Tell us how we can help you..." 
                  class="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-lg hover:shadow-xl resize-vertical"
                />
              </div>
              <button 
                type="submit"
                class="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-xl py-6 px-12 rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 transform"
              >
                <Icon name="heroicons:paper-airplane" class="w-7 h-7 inline mr-3" />
                Send Message
              </button>
            </form>
          </div>
        </div>
  <!-- ✅ UPDATED FULL FOOTER with WhatsApp + Email -->
<footer class="relative z-10 bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16 px-6">
  <div class="max-w-6xl mx-auto text-center space-y-8">
    <div class="space-y-4">
      <h3 class="text-4xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text">EDUOASIS</h3>
      <p class="text-xl opacity-90 max-w-2xl mx-auto">
        Your gateway to stress-free JAMB services. Secure. Fast. Reliable.
      </p>
    </div>
    
    <div class="grid md:grid-cols-3 gap-8 pt-12 border-t border-white/10">
      <div>
        <h4 class="text-lg font-bold mb-4">Quick Links</h4>
        <div class="space-y-2 text-sm opacity-80">
          <NuxtLink to="/register" class="hover:text-blue-400 transition-colors">Register</NuxtLink>
          <NuxtLink to="/login" class="hover:text-blue-400 transition-colors block">Login</NuxtLink>
          <NuxtLink to="/services" class="hover:text-blue-400 transition-colors block">Services</NuxtLink>
        </div>
      </div>
      <div>
        <h4 class="text-lg font-bold mb-4">Get Help Fast</h4>
        <div class="space-y-3 text-sm">
          <!-- ✅ WHATSAPP LINK -->
          <a 
            href="https://wa.me/2348123442014" 
            class="flex items-center justify-center gap-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 hover:text-green-200 p-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg group"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
          >
            <Icon name="heroicons:phone" class="w-5 h-5 group-hover:animate-bounce" />
            <span>+234 812 344 2014</span>
            <Icon name="heroicons:arrow-up-right" class="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
          </a>
          
          <!-- EMAIL LINK -->
          <a 
            href="mailto:support@eduosais.com" 
            class="flex items-center gap-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 p-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
            title="Send Email"
          >
            <Icon name="heroicons:envelope" class="w-5 h-5" />
            <span>support@eduosais.com</span>
          </a>
          
          <div class="text-xs opacity-75 pt-2">24/7 Live Support</div>
        </div>
      </div>
      <div>
        <h4 class="text-lg font-bold mb-4">Nigeria</h4>
        <p class="text-sm opacity-80">Trusted by students nationwide across all universities</p>
      </div>
    </div>

    <!-- Copyright with CodeBridge Email -->
    <div class="pt-8 border-t border-white/10">
      <p class="opacity-75 text-sm">
        &copy; 2026 EDUOASIS. Built with ❤️ by 
        <a 
          href="mailto:anasment@gmail.com" 
          class="text-blue-400 hover:text-blue-300 underline hover:no-underline transition-all duration-300 font-medium ml-1"
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

<style scoped>
/* All animations */
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
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 1.5rem; 
}
.btn-primary-gradient { 
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
}
.btn-secondary { 
  background: rgba(255,255,255,0.2); 
  backdrop-filter: blur(20px); 
  border: 1px solid rgba(255,255,255,0.3); 
  border-radius: 1.5rem; 
}

.service-card, .review-card { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.carousel-prev, .carousel-next { transition: all 0.3s ease; }
</style>
