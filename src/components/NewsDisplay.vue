<template>
  <section class="news-section">
    <div class="container">
      <h2 class="section-title">Latest News & Updates</h2>
      <p class="section-subtitle">Stay updated with our latest announcements and events</p>
      
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading news...</p>
      </div>
      
      <div v-else-if="newsList.length === 0" class="no-news">
        <p>No news updates available at the moment.</p>
      </div>
      
      <div v-else class="news-grid">
        <!-- Featured News -->
        <div v-if="featuredNews.length > 0" class="featured-section">
          <h3 class="featured-title">Featured News</h3>
          <div class="featured-news">
            <div v-for="news in featuredNews" :key="news.id" class="featured-news-item">
              <div class="news-image-container">
                <img 
                  v-if="news.imageUrl" 
                  :src="news.imageUrl" 
                  :alt="news.title"
                  class="news-image"
                >
                <div v-else class="news-image-placeholder">
                  <div class="placeholder-icon">📰</div>
                </div>
                <div class="news-category">{{ news.category }}</div>
              </div>
              <div class="news-content">
                <h4 class="news-title">{{ news.title }}</h4>
                <p class="news-excerpt">{{ truncateText(news.content, 150) }}</p>
                <div class="news-meta">
                  <span class="news-date">{{ formatDate(news.timestamp) }}</span>
                  <button @click="openNews(news)" class="read-more-btn">Read More</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Regular News Grid -->
        <div v-if="regularNews.length > 0" class="regular-section">
          <h3 class="regular-title">Recent Updates</h3>
          <div class="regular-news-grid">
            <div v-for="news in regularNews" :key="news.id" class="news-card">
              <div class="news-image-container">
                <img 
                  v-if="news.imageUrl" 
                  :src="news.imageUrl" 
                  :alt="news.title"
                  class="news-image"
                >
                <div v-else class="news-image-placeholder">
                  <div class="placeholder-icon">📰</div>
                </div>
                <div class="news-category">{{ news.category }}</div>
              </div>
              <div class="news-content">
                <h4 class="news-title">{{ news.title }}</h4>
                <p class="news-excerpt">{{ truncateText(news.content, 100) }}</p>
                <div class="news-meta">
                  <span class="news-date">{{ formatDate(news.timestamp) }}</span>
                  <button @click="openNews(news)" class="read-more-btn">Read More</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- News Detail Modal -->
    <NewsDetail 
      v-if="selectedNews"
      :news="selectedNews"
      @close="closeNews"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getNewsUpdates } from '../firebase/services'
import NewsDetail from './NewsDetail.vue'

const loading = ref(true)
const newsList = ref<any[]>([])
const selectedNews = ref<any>(null)

const featuredNews = computed(() => {
  return newsList.value.filter(news => news.featured).slice(0, 2)
})

const regularNews = computed(() => {
  return newsList.value.filter(news => !news.featured).slice(0, 6)
})

const loadNews = async () => {
  loading.value = true
  try {
    const result = await getNewsUpdates()
    if (result.success && result.news) {
      newsList.value = result.news
    }
  } catch (error) {
    console.error('Error loading news:', error)
  } finally {
    loading.value = false
  }
}

const openNews = (news: any) => {
  selectedNews.value = news
}

const closeNews = () => {
  selectedNews.value = null
}

const truncateText = (text: string, length: number) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

onMounted(() => {
  loadNews()
})
</script>

<style scoped>
.news-section {
  padding: 100px 0;
  background: rgb(250, 241, 230);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-title {
  font-size: 2.5rem;
  color: #8B4513;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: bold;
}

.section-subtitle {
  text-align: center;
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 3rem;
}

.loading {
  text-align: center;
  padding: 4rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #8B4513;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-news {
  text-align: center;
  padding: 4rem 0;
  color: #666;
}

.featured-section,
.regular-section {
  margin-bottom: 3rem;
}

.featured-title,
.regular-title {
  font-size: 1.8rem;
  color: #8B4513;
  margin-bottom: 2rem;
  font-weight: bold;
}

.featured-news {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.featured-news-item {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.featured-news-item:hover {
  transform: translateY(-5px);
}

.regular-news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.news-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.news-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.news-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.featured-news-item .news-image-container {
  height: 250px;
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-card:hover .news-image,
.featured-news-item:hover .news-image {
  transform: scale(1.05);
}

.news-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #D4AF37, #8B4513);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 4rem;
  color: white;
  opacity: 0.8;
}

.news-category {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(139, 69, 19, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: capitalize;
}

.news-content {
  padding: 1.5rem;
}

.news-title {
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  font-weight: bold;
  line-height: 1.4;
}

.featured-news-item .news-title {
  font-size: 1.5rem;
}

.news-excerpt {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-date {
  color: #999;
  font-size: 0.9rem;
}

.read-more-btn {
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.3s ease;
}

.read-more-btn:hover {
  background: #654321;
}

/* Mobile styles */
@media (max-width: 768px) {
  .news-section {
    padding: 60px 0;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  .featured-news {
    grid-template-columns: 1fr;
  }
  
  .regular-news-grid {
    grid-template-columns: 1fr;
  }
  
  .news-meta {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .read-more-btn {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.8rem;
  }
  
  .news-content {
    padding: 1rem;
  }
  
  .news-title {
    font-size: 1.2rem;
  }
  
  .featured-news-item .news-title {
    font-size: 1.3rem;
  }
}
</style>
