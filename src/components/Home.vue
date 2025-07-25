<script setup lang="ts">
import { ref } from 'vue'
import Header from './Header.vue'
import Hero from './Hero.vue'
import About from './About.vue'
import NewsDisplay from './NewsDisplay.vue'
import Menu from './Menu.vue'
import Contact from './Contact.vue'
import Footer from './Footer.vue'
import CustomerAuth from './CustomerAuth.vue'

const showAuthModal = ref(false)

const handleOpenLogin = () => {
  showAuthModal.value = true
}

const handleAuthSuccess = () => {
  showAuthModal.value = false
}
</script>

<template>
  <div class="home">
    <Header />
    <Hero />
    <About />
    <NewsDisplay />
    <Menu @openLogin="handleOpenLogin" />
    <Contact />
    <Footer />
    
    <!-- Authentication Modal -->
    <CustomerAuth 
      v-if="showAuthModal"
      :showRegisterFirst="true"
      :showRegisterMessage="true"
      @close="showAuthModal = false"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<style scoped>
.home {
  width: 100%;
}
</style>
