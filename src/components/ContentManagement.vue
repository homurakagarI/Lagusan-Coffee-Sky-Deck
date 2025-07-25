<template>
  <div class="content-management">
    <div class="section-header">
      <h2>Content Management</h2>
      <div class="header-actions">
        <button @click="loadContent" class="refresh-btn">Refresh</button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading content sections...</p>
    </div>
    
    <div v-else class="content-sections">
      <div class="content-card">
        <div class="card-header">
          <h3>
            <div class="section-title-with-image">
              <div class="featured-image-container">
                <img v-if="heroContent?.featuredImageUrl" 
                     :src="heroContent.featuredImageUrl" 
                     alt="Hero Section" 
                     class="featured-image-thumbnail" />
                <span v-else class="default-icon">🏠</span>
              </div>
              Hero Section
            </div>
          </h3>
          <div class="card-meta">
            <span v-if="heroContent?.updatedAt" class="last-updated">
              Last updated: {{ formatDate(heroContent.updatedAt) }}
            </span>
            <span v-else class="status-new">Not configured</span>
          </div>
        </div>
        <div class="card-content">
          <div v-if="heroContent" class="content-preview">
            <div v-if="heroContent.featuredImageUrl" class="featured-image-preview">
              <img :src="heroContent.featuredImageUrl" alt="Hero Featured Image" />
            </div>
            <p><strong>Title:</strong> {{ heroContent.title || 'Not set' }}</p>
            <p><strong>Subtitle:</strong> {{ heroContent.subtitle || 'Not set' }}</p>
            <p><strong>Primary Button:</strong> {{ heroContent.primaryButtonText || 'Not set' }}</p>
            <p><strong>Secondary Button:</strong> {{ heroContent.secondaryButtonText || 'Not set' }}</p>
          </div>
          <div v-else class="content-preview">
            <p class="no-content">No content configured yet. Click "Edit" to set up the hero section.</p>
          </div>
        </div>
        <div class="card-actions">
          <button @click="editContent('hero')" class="edit-btn">
            {{ heroContent ? 'Edit' : 'Setup' }} Hero Section
          </button>
        </div>
      </div>
      
      <div class="content-card">
        <div class="card-header">
          <h3>
            <div class="section-title-with-image">
              <div class="featured-image-container">
                <img v-if="aboutContent?.featuredImageUrl" 
                     :src="aboutContent.featuredImageUrl" 
                     alt="About Section" 
                     class="featured-image-thumbnail" />
                <span v-else class="default-icon">ℹ️</span>
              </div>
              About Section
            </div>
          </h3>
          <div class="card-meta">
            <span v-if="aboutContent?.updatedAt" class="last-updated">
              Last updated: {{ formatDate(aboutContent.updatedAt) }}
            </span>
            <span v-else class="status-new">Not configured</span>
          </div>
        </div>
        <div class="card-content">
          <div v-if="aboutContent" class="content-preview">
            <div v-if="aboutContent.featuredImageUrl" class="featured-image-preview">
              <img :src="aboutContent.featuredImageUrl" alt="About Featured Image" />
            </div>
            <p><strong>Title:</strong> {{ aboutContent.title || 'Not set' }}</p>
            <p><strong>First Paragraph:</strong> {{ truncateText(aboutContent.description1, 100) || 'Not set' }}</p>
            <p><strong>Second Paragraph:</strong> {{ truncateText(aboutContent.description2, 100) || 'Not set' }}</p>
            <p><strong>Features:</strong> {{ aboutContent.features ? aboutContent.features.length : 0 }} configured</p>
          </div>
          <div v-else class="content-preview">
            <p class="no-content">No content configured yet. Click "Edit" to set up the about section.</p>
          </div>
        </div>
        <div class="card-actions">
          <button @click="editContent('about')" class="edit-btn">
            {{ aboutContent ? 'Edit' : 'Setup' }} About Section
          </button>
        </div>
      </div>
    </div>
    
    <!-- Content Editor Modal -->
    <ContentEditor 
      v-if="showEditor"
      :section="selectedSection"
      @close="closeEditor"
      @save="handleContentSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllContent } from '../firebase/services'
import ContentEditor from './ContentEditor.vue'

const loading = ref(true)
const showEditor = ref(false)
const selectedSection = ref('')
const heroContent = ref<any>(null)
const aboutContent = ref<any>(null)

const loadContent = async () => {
  loading.value = true
  try {
    console.log('Loading all site content...')
    const result = await getAllContent()
    if (result.success && result.content) {
      // Organize content by section
      heroContent.value = result.content.find((c: any) => c.section === 'hero') || null
      aboutContent.value = result.content.find((c: any) => c.section === 'about') || null
      
      console.log('Hero content:', heroContent.value)
      console.log('About content:', aboutContent.value)
    } else {
      console.error('Failed to load content:', result.error)
      heroContent.value = null
      aboutContent.value = null
    }
  } catch (error) {
    console.error('Error loading content:', error)
    heroContent.value = null
    aboutContent.value = null
  } finally {
    loading.value = false
  }
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Unknown'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const truncateText = (text: string, length: number) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const editContent = (section: string) => {
  selectedSection.value = section
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
  selectedSection.value = ''
}

const handleContentSave = () => {
  console.log('Content saved, refreshing...')
  closeEditor()
  loadContent()
}

onMounted(() => {
  loadContent()
})
</script>

<style scoped>
.content-management {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.refresh-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.refresh-btn:hover {
  background: #218838;
}

.loading {
  text-align: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #8B4513;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.content-sections {
  display: grid;
  gap: 1.5rem;
}

.content-card {
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.content-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.card-header {
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.section-title-with-image {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.featured-image-container {
  flex-shrink: 0;
}

.featured-image-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}

.default-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.featured-image-preview {
  margin-bottom: 1rem;
  text-align: center;
}

.featured-image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.last-updated {
  font-size: 0.9rem;
  color: #666;
}

.status-new {
  background: #ffc107;
  color: #856404;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.card-content {
  padding: 1.5rem;
}

.content-preview p {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.content-preview strong {
  color: #333;
}

.no-content {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 2rem 0;
}

.card-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.edit-btn {
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
}

.edit-btn:hover {
  background: #654321;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .content-management {
    padding: 1rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .card-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>
