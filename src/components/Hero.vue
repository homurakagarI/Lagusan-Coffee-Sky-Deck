<template>
  <section id="home" class="hero" :style="heroBackgroundStyle">
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title">{{ heroContent?.title || 'Welcome to Lagusan Coffee Sky Deck' }}</h1>
        <p class="hero-subtitle">{{ heroContent?.subtitle || 'Experience the perfect blend of premium coffee and breathtaking views' }}</p>
        <div class="hero-buttons">
          <a href="#menu" class="btn btn-primary">{{ heroContent?.primaryButtonText || 'View Our Menu' }}</a>
          <a href="#contact" class="btn btn-secondary">{{ heroContent?.secondaryButtonText || 'Visit Us' }}</a>
        </div>
      </div>
    </div>
    <div class="hero-overlay"></div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { getContent } from '../firebase/services'

const heroContent = ref<any>(null)

const heroBackgroundStyle = computed(() => {
  const featuredImage = heroContent.value?.featuredImageUrl
  const defaultBackground = "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/sky-deck-background.jpg')"
  
  if (featuredImage) {
    return {
      background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${featuredImage}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  
  return {
    background: defaultBackground,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

const loadHeroContent = async () => {
  try {
    const result: any = await getContent('hero')
    if (result.success && result.content) {
      heroContent.value = result.content
    } else {
      heroContent.value = null
    }
  } catch (error) {
    console.error('Error loading hero content:', error)
    heroContent.value = null
  }
}

onMounted(() => {
  loadHeroContent()
  
  // Listen for content updates from other components
  window.addEventListener('heroContentUpdated', loadHeroContent)
})

// Add cleanup
onUnmounted(() => {
  window.removeEventListener('heroContentUpdated', loadHeroContent)
})
</script>

<style scoped>
.hero {
  height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
              url('\Lagusan.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 800px;
  padding: 0 1rem;
  z-index: 2;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 3.5rem);
  font-weight: bold;
  color: #fff;
  margin-bottom: 1rem;
  text-shadow: 0.125rem 0.125rem 0.25rem rgba(0, 0, 0, 0.5);
  animation: fadeInUp 1s ease-out;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 4vw, 1.3rem);
  color: #f0f0f0;
  margin-bottom: 2rem;
  text-shadow: 0.0625rem 0.0625rem 0.125rem rgba(0, 0, 0, 0.5);
  animation: fadeInUp 1s ease-out 0.3s both;
  line-height: 1.5;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 1s ease-out 0.6s both;
}

.btn {
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  transition: all 0.3s ease;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary {
  background: #D4AF37;
  color: #333;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.btn-primary:hover {
  background: #F4D03F;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
}

.btn-secondary:hover {
  background: #fff;
  color: #333;
  transform: translateY(-2px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile styles */
@media (max-width: 48rem) {
  .hero {
    background-attachment: scroll;
    padding: 5rem 0 0;
  }
  
  .hero-title {
    font-size: clamp(2rem, 7vw, 2.5rem);
  }
  
  .hero-subtitle {
    font-size: clamp(1rem, 4vw, 1.1rem);
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 15.625rem;
    text-align: center;
  }
}

@media (max-width: 30rem) {
  .hero-title {
    font-size: clamp(1.75rem, 8vw, 2rem);
  }
  
  .hero-subtitle {
    font-size: clamp(0.9rem, 4vw, 1rem);
  }
  
  .btn {
    padding: 0.8rem 1.5rem;
    width: 200px;
  }
}
</style>
