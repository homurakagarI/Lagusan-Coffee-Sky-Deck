<template>
  <section id="about" class="about">
    <div class="container">
      <div class="about-content">
        <div class="about-text">
          <h2 class="section-title">{{ aboutContent?.title || 'About Lagusan Coffee Sky Deck' }}</h2>
          <p class="about-description">
            {{ aboutContent?.description1 || 'Nestled high above the bustling city, Lagusan Coffee Sky Deck offers an unparalleled coffee experience where exceptional brews meet breathtaking panoramic views. Our carefully curated selection of premium coffee beans from around the world is expertly roasted to perfection.' }}
          </p>
          <p class="about-description">
            {{ aboutContent?.description2 || 'Whether you\'re starting your morning with a perfect espresso or unwinding with friends over our signature blends, our sky deck provides the perfect ambiance for every coffee moment. Come experience coffee culture elevated to new heights.' }}
          </p>
          <div class="features">
            <div 
              v-for="(feature, index) in displayFeatures" 
              :key="index"
              class="feature"
            >
              <div class="feature-icon" v-if="!feature.imageUrl">{{ feature.icon }}</div>
              <div class="feature-image" v-else>
                <OptimizedImage 
                  :src="feature.imageUrl" 
                  :alt="feature.title"
                  :lazy-load="true"
                />
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </div>
        <div class="about-image">
          <div 
            v-if="aboutContent && aboutContent.featuredImageUrl" 
            class="featured-image"
          >
            <OptimizedImage 
              :src="aboutContent.featuredImageUrl" 
              alt="About Lagusan Coffee Sky Deck"
              :lazy-load="false"
            />
          </div>
          <div v-else class="image-placeholder">
            <div class="coffee-cup-icon">☕</div>
            <p>Beautiful Coffee Shop Image</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { getContent } from '../firebase/services'
import OptimizedImage from './OptimizedImage.vue'

const aboutContent = ref<any>(null)

const defaultFeatures = [
  { icon: '☕', title: 'Premium Coffee', description: 'Expertly sourced and roasted beans from around the world' },
  { icon: '🌅', title: 'Sky Deck Views', description: 'Breathtaking panoramic views of the city skyline' },
  { icon: '🏢', title: 'Perfect Ambiance', description: 'Modern design meets comfort in our elevated space' }
]

const displayFeatures = computed(() => {
  return aboutContent.value?.features || defaultFeatures
})

const loadAboutContent = async () => {
  try {
    const result: any = await getContent('about')
    
    if (result.success && result.content) {
      aboutContent.value = result.content
    } else {
      aboutContent.value = null
    }
  } catch (error) {
    console.error('Error loading about content:', error)
    aboutContent.value = null
  }
}

onMounted(() => {
  loadAboutContent()
  
  // Listen for content updates from other components
  window.addEventListener('aboutContentUpdated', loadAboutContent)
})

onUnmounted(() => {
  window.removeEventListener('aboutContentUpdated', loadAboutContent)
})
</script>

<style scoped>
.about {
  padding: 100px 0;
  background: rgb(250, 241, 230);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.section-title {
  font-size: 2.5rem;
  color: #8B4513;
  margin-bottom: 2rem;
  font-weight: bold;
}

.about-description {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #666;
  margin-bottom: 1.5rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature {
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-image {
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto 1rem auto;
}

.feature-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Enhanced image quality */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: high-quality;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.feature h3 {
  font-size: 1.3rem;
  color: #8B4513;
  margin-bottom: 0.5rem;
}

.feature p {
  color: #666;
  font-size: 0.9rem;
}

.about-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.featured-image {
  width: 100%;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Enhanced image quality */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: high-quality;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.image-placeholder {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #D4AF37, #8B4513);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.coffee-cup-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.image-placeholder p {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Mobile styles */
@media (max-width: 768px) {
  .about {
    padding: 60px 0;
  }
  
  .about-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .about-description {
    font-size: 1rem;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .image-placeholder {
    height: 300px;
  }
  
  .coffee-cup-icon {
    font-size: 3rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.8rem;
  }
  
  .feature {
    padding: 1rem;
  }
  
  .image-placeholder {
    height: 250px;
  }
}
</style>
