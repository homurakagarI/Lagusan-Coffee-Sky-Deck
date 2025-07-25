<template>
  <div class="news-detail-overlay" @click="closeModal">
    <div class="news-detail-modal" @click.stop>
      <div class="modal-header">
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-content">
        <div v-if="news.imageUrl" class="news-image-container">
          <img :src="news.imageUrl" :alt="news.title" class="news-image">
        </div>
        
        <div class="news-content">
          <div class="news-category">{{ news.category }}</div>
          <h2 class="news-title">{{ news.title }}</h2>
          <div class="news-meta">
            <span class="news-date">{{ formatDate(news.timestamp) }}</span>
          </div>
          <div class="news-body" v-html="formatContent(news.content)"></div>
          
          <div v-if="news.videoUrl" class="video-container">
            <iframe 
              :src="getEmbedUrl(news.videoUrl)"
              frameborder="0"
              allowfullscreen
              class="video-iframe"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  news: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

const formatContent = (content: string) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

const getEmbedUrl = (url: string) => {
  if (!url) return ''
  
  try {
    // YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = ''
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]
      } else if (url.includes('watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0]
      } else if (url.includes('/embed/')) {
        videoId = url.split('/embed/')[1]?.split('?')[0]
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }
    
    // Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()?.split('?')[0]
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`
      }
    }
    
    // If it's already an embed URL, return as is
    if (url.includes('/embed/') || url.includes('player.vimeo.com')) {
      return url
    }
    
    return url
  } catch (error) {
    console.error('Error processing video URL:', error)
    return ''
  }
}
</script>

<style scoped>
.news-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  overflow-y: auto;
  padding: 1rem;
}

.news-detail-modal {
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 800px;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin: auto;
  animation: slideInModal 0.3s ease-out;
}

.modal-header {
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 15px 15px 0 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.modal-content {
  padding: 0;
}

.news-image-container {
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-content {
  padding: 2rem;
}

.news-category {
  background: #8B4513;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: capitalize;
  display: inline-block;
  margin-bottom: 1rem;
}

.news-title {
  color: #333;
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: bold;
  line-height: 1.3;
}

.news-meta {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.news-date {
  color: #666;
  font-size: 1rem;
}

.news-body {
  color: #444;
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.video-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  margin-top: 2rem;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .news-detail-modal {
    width: 95%;
    margin: 1rem 0;
  }
  
  .news-content {
    padding: 1.5rem;
  }
  
  .news-title {
    font-size: 1.5rem;
  }
  
  .news-image-container {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .news-title {
    font-size: 1.3rem;
  }
  
  .news-content {
    padding: 1rem;
  }
  
  .news-body {
    font-size: 1rem;
  }
}

@keyframes slideInModal {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
