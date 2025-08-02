<template>
  <section id="home" class="hero-updated" :style="heroBackgroundStyle">
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
    
    <!-- Gallery Navigation -->
    <div class="gallery-nav" v-if="galleryImages.length > 1">
      <button @click="previousImage" class="nav-btn nav-prev" :disabled="isTransitioning">
        <span class="nav-icon">‹</span>
      </button>
      <button @click="nextImage" class="nav-btn nav-next" :disabled="isTransitioning">
        <span class="nav-icon">›</span>
      </button>
    </div>
    
    <div class="hero-overlay"></div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { getContent } from '../firebase/services'

const heroContent = ref<any>(null)
const currentImageIndex = ref(0)
const isTransitioning = ref(false)
const autoSlideInterval = ref<number | null>(null)

// Default gallery images with responsive variants
const defaultGalleryImages = [
  '/sky-deck-background.jpg',
  '/Lagusan.jpg',
  '/maps.jpg'
]

// Get optimized image URL based on screen size
const getOptimizedImageUrl = (baseUrl: string) => {
  // In a real implementation, you would have different sizes
  // For now, we'll use the original but with better loading
  return baseUrl
}

const galleryImages = computed(() => {
  if (heroContent.value?.galleryImages && heroContent.value.galleryImages.length > 0) {
    return heroContent.value.galleryImages.map((img: string) => getOptimizedImageUrl(img))
  }
  return defaultGalleryImages.map(img => getOptimizedImageUrl(img))
})

const heroBackgroundStyle = computed(() => {
  const currentImage = galleryImages.value[currentImageIndex.value]
  
  return {
    background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${currentImage}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: window.innerWidth > 768 ? 'fixed' : 'scroll',
    transition: isTransitioning.value ? 'background 0.5s ease-in-out' : 'none'
  }
})

const nextImage = () => {
  if (isTransitioning.value) return
  
  isTransitioning.value = true
  currentImageIndex.value = (currentImageIndex.value + 1) % galleryImages.value.length
  
  setTimeout(() => {
    isTransitioning.value = false
  }, 500)
  
  resetAutoSlide()
}

const previousImage = () => {
  if (isTransitioning.value) return
  
  isTransitioning.value = true
  currentImageIndex.value = currentImageIndex.value === 0 
    ? galleryImages.value.length - 1 
    : currentImageIndex.value - 1
  
  setTimeout(() => {
    isTransitioning.value = false
  }, 500)
  
  resetAutoSlide()
}

const startAutoSlide = () => {
  if (galleryImages.value.length > 1) {
    // Preload the next image before starting auto-slide
    preloadNextImage()
    
    autoSlideInterval.value = setInterval(() => {
      nextImage()
      // Preload the next image after transition
      setTimeout(() => {
        preloadNextImage()
      }, 500)
    }, 5000) // Change image every 5 seconds
  }
}

// Preload the next image in the gallery
const preloadNextImage = () => {
  const nextIndex = (currentImageIndex.value + 1) % galleryImages.value.length
  const nextImageUrl = galleryImages.value[nextIndex]
  
  // Create a new image element to preload
  const img = new Image()
  img.src = nextImageUrl
}

const stopAutoSlide = () => {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value)
    autoSlideInterval.value = null
  }
}

const resetAutoSlide = () => {
  stopAutoSlide()
  startAutoSlide()
}

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
  
  // Preload all gallery images after a short delay to avoid blocking initial render
  setTimeout(() => {
    preloadGalleryImages()
  }, 1000)
  
  startAutoSlide()
  
  // Listen for content updates from other components
  window.addEventListener('heroContentUpdated', loadHeroContent)
})

// Preload all gallery images for smooth transitions
const preloadGalleryImages = () => {
  galleryImages.value.forEach((imageUrl: string, index: number) => {
    // Skip the first image as it's already loaded
    if (index > 0) {
      const img = new Image()
      img.src = imageUrl
    }
  })
}

// Add cleanup
onUnmounted(() => {
  stopAutoSlide()
  window.removeEventListener('heroContentUpdated', loadHeroContent)
})
</script>

<style scoped>
/* Updated: Gallery indicators completely removed */
.hero-updated {
  height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
              url('\Lagusan.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  /* Enhanced image quality CSS */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: high-quality;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
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

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
}

/* Gallery Navigation Styles */
.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  z-index: 3;
  pointer-events: none;
}

.nav-btn {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 3;
}

.nav-btn:hover:not(:disabled) {
  background: #D4AF37;
  color: white;
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-prev {
  left: 2rem;
}

.nav-next {
  right: 2rem;
}

.nav-icon {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
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
  .hero-updated {
    background-attachment: scroll;
    padding: 5rem 0 0;
  }
  
  .hero-updated .hero-title {
    font-size: clamp(2rem, 7vw, 2.5rem);
  }
  
  .hero-updated .hero-subtitle {
    font-size: clamp(1rem, 4vw, 1.1rem);
  }
  
  .hero-updated .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 15.625rem;
    text-align: center;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
  }
  
  .nav-prev {
    left: 1rem;
  }
  
  .nav-next {
    right: 1rem;
  }
  
  .nav-icon {
    font-size: 1.2rem;
  }
}

@media (max-width: 30rem) {
  .hero-updated .hero-title {
    font-size: clamp(1.75rem, 8vw, 2rem);
  }
  
  .hero-updated .hero-subtitle {
    font-size: clamp(0.9rem, 4vw, 1rem);
  }
  
  .btn {
    padding: 0.8rem 1.5rem;
    width: 200px;
  }
  
  .nav-btn {
    width: 35px;
    height: 35px;
  }
  
  .nav-prev {
    left: 0.5rem;
  }
  
  .nav-next {
    right: 0.5rem;
  }
  
  .nav-icon {
    font-size: 1rem;
  }
}
</style>
